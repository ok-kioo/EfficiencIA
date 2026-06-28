import { useEffect, useMemo, useRef, useState } from "react";
import BpmnModelerLib from "bpmn-js/lib/Modeler";
import { toast } from "sonner";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  CheckCircle2,
  Crown,
  HelpCircle,
  ListChecks,
  MousePointerClick,
  Sliders,
  Sparkles,
} from "lucide-react";

import { BpmnModeler, defaultBpmnXml } from "../components/bpmn/BpmnModeler";
import { BpmnToolbar } from "../components/bpmn/BpmnToolBar";
import { ProcessDataPanel } from "../components/process/ProcessDataPanel";
import { ValidationPanel } from "../components/bpmn/ValidationPanel";
import { AnalyzeBeforeActionDialog } from "../components/modeler/AnalyzeBeforeActionDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import type { ProcessActivity } from "../@types/processs";
import {
  extractActivitiesFromBpmn,
  mergeExtractedActivities,
} from "../utils/bpmnUtils";
import { exportBpmn, type ExportFormat } from "../utils/bpmnExport";
import { activitiesToMetadata } from "../utils/activityToMetadata";
import { clearDraft, loadDraft } from "../lib/modeler/autosave";
import { useModelerAutosave } from "../hooks/useModelerAutosave";
import { useBpmnValidation } from "../hooks/useBpmnValidation";
import { projectService } from "../services/projectService";
import { analysisService } from "../services/analysisService";
import { extractApiError } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

type AnyObj = Record<string, unknown> & {
  id: string;
  type?: string;
  businessObject?: { name?: string; $type?: string };
};

const FRIENDLY_TYPE: Record<string, string> = {
  "bpmn:StartEvent": "Ponto de início",
  "bpmn:EndEvent": "Ponto de fim",
  "bpmn:IntermediateThrowEvent": "Evento durante o processo",
  "bpmn:IntermediateCatchEvent": "Evento durante o processo",
  "bpmn:Task": "Etapa do processo",
  "bpmn:UserTask": "Etapa manual",
  "bpmn:ServiceTask": "Etapa do sistema",
  "bpmn:ScriptTask": "Etapa automática",
  "bpmn:SendTask": "Envio de mensagem",
  "bpmn:ReceiveTask": "Recebimento de mensagem",
  "bpmn:ManualTask": "Etapa manual",
  "bpmn:BusinessRuleTask": "Regra de negócio",
  "bpmn:CallActivity": "Subprocesso",
  "bpmn:SubProcess": "Subprocesso",
  "bpmn:ExclusiveGateway": "Ponto de decisão (uma saída)",
  "bpmn:InclusiveGateway": "Ponto de decisão (várias saídas)",
  "bpmn:ParallelGateway": "Caminhos em paralelo",
  "bpmn:EventBasedGateway": "Decisão por evento",
  "bpmn:SequenceFlow": "Conexão entre etapas",
  "bpmn:Participant": "Participante do processo",
  "bpmn:Lane": "Área responsável",
  "bpmn:DataObjectReference": "Documento / dado",
  "bpmn:TextAnnotation": "Anotação",
};

function friendlyTypeOf(type?: string) {
  if (!type) return "Elemento";
  return FRIENDLY_TYPE[type] ?? type.replace(/^bpmn:/, "");
}

export function ModelerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFree = (user?.plan ?? "free") === "free";
  const { projectId: initialProjectId } = useSearch({
    from: "/_authenticated/modeler",
  }) as { projectId?: string };

  // Estado base — começa SEMPRE vazio quando há um projectId, para não vazar
  // conteúdo de outro projeto via cache. Sem projeto, tentamos restaurar o
  // rascunho "novo".
  const initial = useMemo(() => {
    if (typeof window === "undefined" || initialProjectId) {
      return {
        bpmnXml: defaultBpmnXml,
        processName: initialProjectId ? "" : "Novo processo",
        activities: [] as ProcessActivity[],
        restored: false,
      };
    }
    const draft = loadDraft(null);
    if (draft) {
      return {
        bpmnXml: draft.bpmnXml,
        processName: draft.processName || "Novo processo",
        activities: draft.activities || [],
        restored: true,
      };
    }
    return {
      bpmnXml: defaultBpmnXml,
      processName: "Novo processo",
      activities: [],
      restored: false,
    };
  }, [initialProjectId]);

  const [processName, setProcessName] = useState(initial.processName);
  const [bpmnXml, setBpmnXml] = useState(initial.bpmnXml);
  const [activities, setActivities] = useState<ProcessActivity[]>(initial.activities);
  const [modeler, setModeler] = useState<BpmnModelerLib | null>(null);
  const [projectId] = useState<string | undefined>(initialProjectId);
  const [hasAnalyses, setHasAnalyses] = useState<boolean | null>(null);
  const [loadingProject, setLoadingProject] = useState<boolean>(Boolean(initialProjectId));
  const [selected, setSelected] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] =
    useState<ExportFormat | null>(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const modelerRef = useRef<BpmnModelerLib | null>(null);
  const restoredToastRef = useRef(false);

  const { status, lastSavedAt, discard } = useModelerAutosave({
    projectId: projectId ?? null,
    bpmnXml,
    processName,
    activities,
  });

  const { violations, focusElement, worstSeverity } = useBpmnValidation({ modeler });

  // Track selection from the BPMN modeler.
  useEffect(() => {
    if (!modeler) return;
    const eventBus = modeler.get("eventBus") as {
      on: (e: string, cb: (p: { newSelection: AnyObj[] }) => void) => void;
      off: (e: string, cb: (p: { newSelection: AnyObj[] }) => void) => void;
    };
    const onChange = (payload: { newSelection: AnyObj[] }) => {
      const el = payload.newSelection?.[0];
      if (!el) {
        setSelected(null);
        return;
      }
      const bo = el.businessObject;
      setSelected({
        id: el.id,
        name: bo?.name || el.id,
        type: bo?.$type || (el.type ?? ""),
      });
    };
    eventBus.on("selection.changed", onChange);
    return () => eventBus.off("selection.changed", onChange);
  }, [modeler]);

  useEffect(() => {
    if (initial.restored && !restoredToastRef.current) {
      restoredToastRef.current = true;
      toast.success("Rascunho restaurado do navegador.");
    }
  }, [initial.restored]);

  useEffect(() => {
    const extractedActivities = extractActivitiesFromBpmn(bpmnXml);
    setActivities((current) => mergeExtractedActivities(current, extractedActivities));
  }, [bpmnXml]);

  // Carrega o projeto. Para projetos existentes, SEMPRE busca do backend e
  // tenta restaurar rascunho específico desse projeto (mais novo que o salvo
  // no backend). Sem projectId: comportamento "novo processo".
  useEffect(() => {
    if (!initialProjectId) {
      setLoadingProject(false);
      return;
    }
    let cancelled = false;
    setLoadingProject(true);
    projectService
      .get(initialProjectId)
      .then((p) => {
        if (cancelled) return;
        const serverActivities = Array.isArray(p.activities)
          ? (p.activities as ProcessActivity[])
          : [];
        const serverXml = p.bpmn_xml ?? defaultBpmnXml;

        // Rascunho mais recente que o updated_at do projeto vence.
        const draft = loadDraft(initialProjectId);
        const projectUpdatedAt = new Date(p.updated_at).getTime();
        if (draft && draft.savedAt > projectUpdatedAt) {
          setProcessName(draft.processName || p.name);
          setBpmnXml(draft.bpmnXml);
          setActivities(draft.activities ?? serverActivities);
          if (!restoredToastRef.current) {
            restoredToastRef.current = true;
            toast.success("Rascunho deste projeto restaurado.");
          }
        } else {
          setProcessName(p.name);
          setBpmnXml(serverXml);
          setActivities(serverActivities);
          // Limpa rascunho velho desse projeto.
          if (draft) clearDraft(initialProjectId);
        }
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Não foi possível carregar o projeto.");
      })
      .finally(() => {
        if (!cancelled) setLoadingProject(false);
      });

    // Já que estamos abrindo este projeto, busca histórico de análises para
    // saber se mostramos o banner "ainda não foi analisado".
    analysisService
      .listForProject(initialProjectId)
      .then((list) => {
        if (cancelled) return;
        setHasAnalyses(list.some((a) => a.status === "done"));
      })
      .catch(() => {
        if (!cancelled) setHasAnalyses(null);
      });

    return () => {
      cancelled = true;
    };
  }, [initialProjectId]);

  function handleModelerReady(m: BpmnModelerLib) {
    modelerRef.current = m;
    setModeler(m);
  }

  async function handleImport(file: File) {
    const content = await file.text();
    setBpmnXml(content);
  }

  async function doExport(format: ExportFormat) {
    const m = modelerRef.current;
    if (!m) return;
    try {
      await exportBpmn(m, format, processName || "processo");
      const label =
        format === "xml" ? "XML" : format === "png" ? "imagem" : "PDF";
      toast.success(`Download do ${label} iniciado.`);
    } catch (err) {
      console.error("[export]", err);
      toast.error(
        err instanceof Error ? err.message : "Não foi possível exportar.",
      );
    }
  }

  function handleExport(format: ExportFormat) {
    // Se ainda não analisou e o usuário é Premium, sugere análise antes.
    if (!isFree && hasAnalyses === false) {
      setPendingExportFormat(format);
      setExportDialogOpen(true);
      return;
    }
    void doExport(format);
  }

  function handleBpmnChange(xml: string) {
    setBpmnXml(xml);
  }

  function doDiscard() {
    discard();
    setBpmnXml(defaultBpmnXml);
    setProcessName(projectId ? processName : "Novo processo");
    setActivities([]);
    toast.success("Rascunho descartado. Você voltou ao diagrama padrão.");
  }

  function handleDiscardDraft() {
    if (!isFree && hasAnalyses === false) {
      setDiscardDialogOpen(true);
      return;
    }
    doDiscard();
  }

  async function handleAnalyze() {
    // Usuário FREE não pode analisar — leva para a página Premium.
    if (isFree) {
      navigate({ to: "/premium" });
      return;
    }

    setAnalyzing(true);
    try {
      let pid = projectId;
      const activitiesPayload = activitiesToMetadata(activities);
      if (pid) {
        await projectService.update(pid, {
          name: processName,
          bpmnXml,
          activities: activitiesPayload,
        });
      } else {
        const created = await projectService.create({
          name: processName || "Novo processo",
          bpmnXml,
          activities: activitiesPayload,
        });
        pid = created.id;
      }

      toast.info("Enviando para análise da IA…");
      const analysis = await analysisService.createForProject(pid);

      if (analysis.status === "failed") {
        toast.error(analysis.error || "A análise falhou.");
      } else {
        toast.success("Análise concluída!");
      }
      // Limpa o rascunho desse projeto — já está persistido no backend.
      clearDraft(pid);
      navigate({ to: "/analyses/$id", params: { id: analysis.id } });
    } catch (err) {
      toast.error(extractApiError(err, "Não foi possível analisar o processo."));
    } finally {
      setAnalyzing(false);
    }
  }

  const autosaveLabel =
    status === "saving"
      ? "Salvando…"
      : status === "error"
        ? "Falha ao salvar automaticamente"
        : lastSavedAt
          ? `Salvo às ${new Date(lastSavedAt).toLocaleTimeString()}`
          : "Salva automaticamente";

  const showAnalyzeBanner = !analyzing && projectId && hasAnalyses === false;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Modelagem do processo
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Desenhe o fluxo e complemente cada etapa com dados operacionais.
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground tabular">
            <span
              className={`inline-flex items-center gap-1.5 ${
                status === "error" ? "text-destructive" : ""
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  status === "saving"
                    ? "bg-accent animate-pulse"
                    : status === "error"
                      ? "bg-destructive"
                      : "bg-primary"
                }`}
              />
              {autosaveLabel}
            </span>
            {loadingProject && <span>Carregando projeto…</span>}
          </div>
        </div>

        <div className="w-full lg:w-80">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Nome do processo
          </label>
          <input
            value={processName}
            onChange={(event) => setProcessName(event.target.value)}
            className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {showAnalyzeBanner && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-accent/30 bg-gradient-to-r from-primary/5 to-accent/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
              <Sparkles size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Seu processo ainda não foi analisado pela IA.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Receba um diagnóstico com gargalos, problemas e sugestões priorizadas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            {isFree ? <Crown size={13} /> : <Sparkles size={13} />}
            {isFree ? "Conhecer Premium" : "Analisar agora"}
          </button>
        </div>
      )}

      <BpmnToolbar
        onImport={handleImport}
        onExport={handleExport}
        onAnalyze={handleAnalyze}
        onDiscard={handleDiscardDraft}
        canDiscard={Boolean(lastSavedAt)}
        analyzing={analyzing}
        highlightAnalyze={hasAnalyses === false}
      />

      <AnalyzeBeforeActionDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        actionLabel="exportar o processo"
        continueLabel="Exportar mesmo assim"
        onContinueWithout={() => {
          setExportDialogOpen(false);
          const fmt = pendingExportFormat ?? "xml";
          setPendingExportFormat(null);
          void doExport(fmt);
        }}
        onAnalyzeFirst={() => {
          setExportDialogOpen(false);
          setPendingExportFormat(null);
          handleAnalyze();
        }}
      />

      <AnalyzeBeforeActionDialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        actionLabel="descartar este rascunho"
        continueLabel="Descartar mesmo assim"
        onContinueWithout={() => {
          setDiscardDialogOpen(false);
          doDiscard();
        }}
        onAnalyzeFirst={() => {
          setDiscardDialogOpen(false);
          handleAnalyze();
        }}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_400px]">
        <BpmnModeler
          xml={bpmnXml}
          onChange={handleBpmnChange}
          onModelerReady={handleModelerReady}
          validationSeverity={worstSeverity}
        />

        <aside className="max-h-[calc(100vh-200px)] overflow-y-auto rounded-xl border border-border bg-card">
          <Accordion
            type="multiple"
            defaultValue={["elemento", "dados"]}
            className="w-full"
          >
            <AccordionItem value="elemento" className="border-b border-border">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold tracking-tight">
                <span className="flex items-center gap-2">
                  <MousePointerClick size={15} strokeWidth={1.75} className="text-primary" />
                  Elemento selecionado
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {selected ? (
                  <div className="rounded-md border border-border bg-background p-3">
                    <p className="text-[13px] font-semibold text-foreground">
                      {selected.name || "(sem nome)"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {friendlyTypeOf(selected.type)}
                    </p>
                    <p
                      className="mt-2 truncate text-[10px] text-muted-foreground tabular opacity-60"
                      title={selected.id}
                    >
                      ID: {selected.id}
                    </p>
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-border bg-background/50 px-3 py-4 text-center text-xs text-muted-foreground">
                    Clique em uma etapa do fluxo para ver detalhes.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dados" className="border-b border-border">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold tracking-tight">
                <span className="flex items-center gap-2">
                  <Sliders size={15} strokeWidth={1.75} className="text-primary" />
                  Dados operacionais
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ProcessDataPanel
                  activities={activities}
                  selectedElementId={selected?.id ?? null}
                  onActivitiesChange={setActivities}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="validacao" className="border-b border-border">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold tracking-tight">
                <span className="flex items-center gap-2">
                  <ListChecks size={15} strokeWidth={1.75} className="text-primary" />
                  Pontos a revisar
                  {violations.length > 0 ? (
                    <span
                      className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                        worstSeverity === "error"
                          ? "bg-destructive text-destructive-foreground"
                          : worstSeverity === "warning"
                            ? "bg-warning text-warning-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {violations.length}
                    </span>
                  ) : (
                    <CheckCircle2 size={14} className="text-primary" />
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ValidationPanel
                  violations={violations}
                  onFocus={focusElement}
                  premiumLockedCount={isFree ? 1 : 0}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ajuda" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold tracking-tight">
                <span className="flex items-center gap-2">
                  <HelpCircle size={15} strokeWidth={1.75} className="text-primary" />
                  Ajuda contextual
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Como começar:</strong>{" "}
                    arraste o círculo "ponto de início" e conecte com setas até as etapas.
                  </p>
                  <p>
                    <strong className="text-foreground">Dica:</strong>{" "}
                    selecione qualquer etapa para informar tempo médio, responsável e
                    volume — esses dados deixam a análise da IA bem mais precisa.
                  </p>
                  <a
                    href="/guia"
                    className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/15"
                  >
                    Ver guia completo →
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>
      </div>
    </div>
  );
}
