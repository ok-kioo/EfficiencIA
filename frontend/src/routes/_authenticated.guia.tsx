import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Diamond,
  Circle,
  CircleDot,
  Square,
  Users,
  Zap,
  Mail,
  Timer,
  AlertTriangle,
  GitMerge,
  GitBranch,
  Layers,
  Workflow,
  ArrowRight,
  Plus,
  ClipboardList,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/guia")({
  component: GuidePage,
});

interface Item {
  name: string;
  technical: string;
  description: string;
  when: string;
  example: string;
  icon: typeof Circle;
}

const tasks: Item[] = [
  {
    name: "Tarefa de usuário",
    technical: "User Task",
    description: "Uma pessoa executa a atividade no sistema (preenche um formulário, aprova algo).",
    when: "Sempre que houver interação humana com a ferramenta.",
    example: "“Analisar pedido de compra”.",
    icon: Users,
  },
  {
    name: "Tarefa automática",
    technical: "Service Task",
    description: "Executada por um sistema, API ou robô — sem interação humana.",
    when: "Para integrações, cálculos automáticos e chamadas a serviços.",
    example: "“Consultar score de crédito via API”.",
    icon: Zap,
  },
  {
    name: "Tarefa manual",
    technical: "Manual Task",
    description: "Atividade física fora do sistema.",
    when: "Trabalho braçal ou que não passa por software.",
    example: "“Embalar produto no depósito”.",
    icon: ClipboardList,
  },
  {
    name: "Envio / Recebimento",
    technical: "Send / Receive Task",
    description: "Indica troca de mensagem com outro participante do processo.",
    when: "Para comunicação explícita entre áreas/sistemas.",
    example: "“Enviar nota fiscal ao cliente”.",
    icon: Mail,
  },
];

const gateways: Item[] = [
  {
    name: "Decisão exclusiva (XOR)",
    technical: "Exclusive Gateway",
    description: "Apenas um dos caminhos é seguido, com base em uma condição.",
    when: "Quando o fluxo é “ou um, ou outro” — nunca os dois.",
    example: "“Pedido aprovado?” → Sim ou Não.",
    icon: Diamond,
  },
  {
    name: "Paralelo (AND)",
    technical: "Parallel Gateway",
    description: "Divide o fluxo em vários caminhos que acontecem ao mesmo tempo. Depois junta de novo.",
    when: "Quando duas ou mais atividades podem ocorrer simultaneamente e o processo só segue quando todas terminam.",
    example: "Ao receber um pedido: emitir nota fiscal E separar estoque em paralelo. Só envia o pedido quando ambos terminam.",
    icon: GitBranch,
  },
  {
    name: "Inclusivo (OR)",
    technical: "Inclusive Gateway",
    description: "Um ou mais caminhos podem ser seguidos, conforme as condições verdadeiras.",
    when: "Várias condições podem se aplicar ao mesmo tempo.",
    example: "Cliente VIP recebe brinde E desconto; cliente comum só desconto.",
    icon: GitMerge,
  },
  {
    name: "Baseado em evento",
    technical: "Event-based Gateway",
    description: "O caminho seguido depende de qual evento acontece primeiro.",
    when: "Cenários do tipo “o que vier antes”: resposta do cliente ou prazo estourar.",
    example: "Aguardar resposta do cliente OU expirar prazo de 48h — segue pelo primeiro.",
    icon: Workflow,
  },
];

const events: Item[] = [
  {
    name: "Evento de mensagem",
    technical: "Message Event",
    description: "Recebe ou envia uma mensagem (e-mail, webhook, notificação).",
    when: "Comunicação assíncrona entre participantes.",
    example: "“Receber confirmação do pagamento”.",
    icon: Mail,
  },
  {
    name: "Evento de tempo",
    technical: "Timer Event",
    description: "Aguarda um intervalo ou dispara em uma data/hora específica.",
    when: "Prazos, SLAs, esperas.",
    example: "“Aguardar 3 dias úteis para resposta”.",
    icon: Timer,
  },
  {
    name: "Evento de erro",
    technical: "Error Event",
    description: "Sinaliza ou captura um erro de negócio.",
    when: "Quando algo dá errado e o fluxo precisa desviar.",
    example: "“Pagamento recusado” dispara fluxo alternativo.",
    icon: AlertTriangle,
  },
  {
    name: "Evento de sinal",
    technical: "Signal Event",
    description: "Broadcast: um disparo, vários ouvintes reagem.",
    when: "Avisos que afetam vários processos ao mesmo tempo.",
    example: "“Liberar venda” dispara fluxos em vários setores.",
    icon: CircleDot,
  },
];

const structures: Item[] = [
  {
    name: "Subprocesso",
    technical: "Subprocess",
    description: "Um conjunto de atividades agrupadas em uma caixa expansível, com seu próprio começo e fim.",
    when: "Para esconder detalhes e manter o fluxo principal limpo.",
    example: "“Aprovação financeira” como um subprocesso dentro do fluxo de compras.",
    icon: Layers,
  },
  {
    name: "Atividade reutilizável",
    technical: "Call Activity",
    description: "Chama um processo definido separadamente, que pode ser reutilizado por outros fluxos.",
    when: "Quando o mesmo procedimento aparece em vários processos.",
    example: "Chamar o processo “KYC do cliente” em onboarding e em renovação.",
    icon: Workflow,
  },
  {
    name: "Pool",
    technical: "Pool",
    description: "Representa um participante (empresa, sistema, cliente). Pools se comunicam por mensagens.",
    when: "Quando dois atores independentes participam do processo.",
    example: "Pool “Loja” trocando mensagens com pool “Cliente”.",
    icon: Users,
  },
  {
    name: "Lane",
    technical: "Lane",
    description: "Subdivisão dentro de um pool — separa quem faz o quê dentro do mesmo participante.",
    when: "Para mostrar áreas/cargos dentro da mesma empresa.",
    example: "Lanes “Comercial”, “Financeiro” e “Logística” dentro do pool da empresa.",
    icon: Square,
  },
];

const operationalFields = [
  {
    field: "Tempo médio de execução",
    why: "É a principal entrada para a IA detectar gargalos. Se o tempo for muito maior que a média dos vizinhos, ela aponta como ponto crítico.",
    tip: "Use minutos. Se a etapa leva horas, registre em minutos (ex.: 240).",
  },
  {
    field: "Tempo de espera",
    why: "Diferencia trabalho efetivo de fila. Etapas com muita espera viram alvo natural de automação.",
    tip: "Inclua aprovações, filas, retornos do cliente.",
  },
  {
    field: "Custo por execução",
    why: "Ajuda a calcular o impacto financeiro de cada gargalo e priorizar melhorias.",
    tip: "Some custo de mão de obra + insumos + ferramentas.",
  },
  {
    field: "Responsável",
    why: "Permite agrupar análise por área e identificar sobrecarga em times específicos.",
    tip: "Use o cargo ou setor, não o nome da pessoa.",
  },
  {
    field: "SLA esperado",
    why: "A IA compara tempo real x SLA e destaca etapas que estouram o prazo.",
    tip: "Defina em horas úteis quando o processo for B2B.",
  },
  {
    field: "Sistema utilizado",
    why: "Indica oportunidades de integração e reduz retrabalho manual.",
    tip: "ERP, CRM, planilha, e-mail — seja específico.",
  },
];

const faqs = [
  {
    q: "Meu trabalho é salvo automaticamente?",
    a: "Sim. Enquanto você modela, salvamos um rascunho. Ao clicar em ‘Salvar’, ele vira um projeto na sua conta.",
  },
  {
    q: "O que a IA recebe quando clico em Analisar?",
    a: "O XML do seu fluxo + os dados operacionais que você preencheu em cada atividade. Quanto mais completo, melhor a análise.",
  },
  {
    q: "Posso refazer a análise?",
    a: "Sim. Cada execução fica no histórico do projeto, na aba Análises, para você comparar versões.",
  },
  {
    q: "Como interpretar o score?",
    a: "É uma nota de 0 a 100 baseada em clareza do modelo, dados operacionais e ausência de gargalos. Acima de 80 indica processo saudável.",
  },
];

function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
          <BookOpen size={11} strokeWidth={2} />
          Guia da plataforma
        </span>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Tudo o que você precisa para modelar bem
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Referência completa dos elementos BPMN, dos dados operacionais e de como
          tirar o melhor proveito da análise por IA.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/modeler"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-deep"
          >
            <Plus size={12} strokeWidth={2} />
            Criar novo processo
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            Voltar ao dashboard
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>
      </header>

      <Section title="Dados operacionais — o combustível da IA">
        <p className="mb-4 text-sm text-muted-foreground">
          Cada atividade pode receber dados operacionais no painel lateral direito do
          modelador. Eles transformam um desenho bonito em uma análise útil.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {operationalFields.map((f) => (
            <div key={f.field} className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-display text-sm font-semibold text-foreground">
                {f.field}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                <strong className="font-semibold text-foreground">Por que importa: </strong>
                {f.why}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                <strong className="font-semibold text-foreground">Dica: </strong>
                {f.tip}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <CatalogSection title="Tarefas (Activities)" items={tasks} />
      <CatalogSection
        title="Gateways — decisões e paralelismo"
        intro="Gateways controlam por onde o fluxo segue. Use o tipo certo para que a IA entenda paralelismo, alternativas e fluxos baseados em eventos."
        items={gateways}
      />
      <CatalogSection title="Eventos — gatilhos no meio do fluxo" items={events} />
      <CatalogSection
        title="Estrutura — subprocessos, pools e lanes"
        items={structures}
      />

      <Section title="Perguntas frequentes">
        <div className="space-y-2">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-lg border border-border bg-card px-4 py-3"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-foreground">
                {f.q}
                <span className="text-muted-foreground transition group-open:rotate-90">
                  ›
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function CatalogSection({
  title,
  items,
  intro,
}: {
  title: string;
  items: Item[];
  intro?: string;
}) {
  return (
    <Section title={title}>
      {intro && <p className="mb-4 text-sm text-muted-foreground">{intro}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <article key={it.name} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    {it.name}
                  </h3>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {it.technical}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-foreground">{it.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                <strong className="font-semibold text-foreground">Quando usar: </strong>
                {it.when}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                <strong className="font-semibold text-foreground">Exemplo: </strong>
                {it.example}
              </p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
