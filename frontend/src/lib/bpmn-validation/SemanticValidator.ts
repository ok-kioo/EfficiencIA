import type { Violation } from "./types";

type Any = any;

function isType(el: Any, type: string): boolean {
  return Boolean(el?.businessObject?.$instanceOf?.(type));
}

function getName(el: Any): string | undefined {
  return el?.businessObject?.name || el?.id;
}

function processOf(el: Any): Any | null {
  let bo = el?.businessObject;
  while (bo) {
    if (bo.$instanceOf?.("bpmn:Process") || bo.$instanceOf?.("bpmn:SubProcess")) return bo;
    bo = bo.$parent;
  }
  return null;
}

let violationCounter = 0;
function nextId(): string {
  violationCounter += 1;
  return `v_${Date.now().toString(36)}_${violationCounter}`;
}

function push(
  out: Violation[],
  elementId: string,
  elementName: string | undefined,
  severity: Violation["severity"],
  rule: string,
  message: string
) {
  out.push({ id: nextId(), elementId, elementName, severity, rule, message });
}

export function validate(modeler: Any): Violation[] {
  if (!modeler) return [];

  const elementRegistry = modeler.get("elementRegistry");
  const all: Any[] = elementRegistry
    .getAll()
    // Ignora labels (rótulos de setas, eventos e tasks aparecem como shapes separados
    // apontando para o elemento real via labelTarget) para não gerar violações duplicadas.
    .filter((el: Any) => !el?.labelTarget);
  const violations: Violation[] = [];

  const flowNodes = all.filter(
    (e) =>
      isType(e, "bpmn:FlowNode") &&
      !isType(e, "bpmn:BoundaryEvent") // boundary handled separately
  );
  const sequenceFlows = all.filter((e) => isType(e, "bpmn:SequenceFlow"));
  const boundaryEvents = all.filter((e) => isType(e, "bpmn:BoundaryEvent"));

  // Group elements by their owning Process / SubProcess
  const byProcess = new Map<string, Any[]>();
  for (const node of flowNodes) {
    const proc = processOf(node);
    if (!proc) continue;
    const list = byProcess.get(proc.id) || [];
    list.push(node);
    byProcess.set(proc.id, list);
  }

  // ID uniqueness sanity check
  const idCount = new Map<string, number>();
  for (const el of all) {
    if (!el?.id) continue;
    idCount.set(el.id, (idCount.get(el.id) || 0) + 1);
  }
  for (const [id, count] of idCount.entries()) {
    if (count > 1) {
      push(
        violations,
        id,
        id,
        "error",
        "id.duplicate",
        `Há dois elementos com o mesmo identificador (\`${id}\`). Isto pode causar erros ao exportar.`
      );
    }
  }

  // Boundary events must have a host activity
  for (const be of boundaryEvents) {
    const host = be.host || be.businessObject?.attachedToRef;
    if (!host) {
      push(
        violations,
        be.id,
        getName(be),
        "error",
        "boundary.no_host",
        "Este evento anexado está flutuando. Encoste-o na borda de uma atividade para que ele fique 'colado' nela."
      );
    }
  }

  // Per-process checks
  for (const [procId, nodes] of byProcess.entries()) {
    const startEvents = nodes.filter((n) => isType(n, "bpmn:StartEvent"));
    const endEvents = nodes.filter((n) => isType(n, "bpmn:EndEvent"));

    if (startEvents.length === 0) {
      push(
        violations,
        procId,
        procId,
        "warning",
        "process.no_start",
        "Este processo não tem um ponto de início. Adicione um evento de início (círculo de borda fina) para indicar onde o fluxo começa."
      );
    }
    if (endEvents.length === 0) {
      push(
        violations,
        procId,
        procId,
        "warning",
        "process.no_end",
        "Este processo não termina em lugar nenhum. Adicione um evento de fim (círculo de borda grossa) para fechar o fluxo."
      );
    }

    // Build adjacency restricted to this process
    const idSet = new Set(nodes.map((n) => n.id));
    const out = new Map<string, string[]>();
    const inc = new Map<string, string[]>();
    for (const n of nodes) {
      out.set(n.id, []);
      inc.set(n.id, []);
    }
    for (const sf of sequenceFlows) {
      const s = sf.source?.id;
      const t = sf.target?.id;
      if (s && t && idSet.has(s) && idSet.has(t)) {
        out.get(s)!.push(t);
        inc.get(t)!.push(s);
      }
    }

    // Per-node structural rules
    for (const node of nodes) {
      const inDeg = inc.get(node.id)!.length;
      const outDeg = out.get(node.id)!.length;
      const name = getName(node);

      if (isType(node, "bpmn:EndEvent")) {
        if (inDeg === 0) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "end.no_incoming",
            "O evento de fim está solto. Conecte uma seta vindo de alguma atividade ou decisão até ele."
          );
        }
      } else if (isType(node, "bpmn:StartEvent")) {
        if (outDeg === 0) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "start.no_outgoing",
            "O evento de início não sai para lugar nenhum. Puxe uma seta dele até a primeira atividade do fluxo."
          );
        }
      } else if (
        isType(node, "bpmn:IntermediateCatchEvent") ||
        isType(node, "bpmn:IntermediateThrowEvent")
      ) {
        if (inDeg !== 1 || outDeg !== 1) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "intermediate.degree",
            "Um evento intermediário deve ter exatamente uma seta chegando e uma seta saindo."
          );
        }
      } else if (isType(node, "bpmn:Task") || isType(node, "bpmn:CallActivity")) {
        if (inDeg === 0 && outDeg === 0) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "task.isolated",
            "Esta atividade está solta no diagrama. Conecte-a ao restante do processo com setas de entrada e saída."
          );
        } else if (inDeg === 0) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "task.no_incoming",
            "Esta atividade não recebe nenhuma seta de entrada. Indique de onde o fluxo chega até ela."
          );
        } else if (outDeg === 0) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "task.no_outgoing",
            "Esta atividade não tem saída. Indique para onde o fluxo segue depois dela."
          );
        }
        if (!node.businessObject?.name) {
          push(
            violations,
            node.id,
            name,
            "info",
            "task.unnamed",
            "Esta atividade está sem nome. Dê um nome curto que descreva o que é feito (ex.: 'Aprovar pedido')."
          );
        }
      } else if (isType(node, "bpmn:ExclusiveGateway") || isType(node, "bpmn:InclusiveGateway")) {
        if (outDeg >= 2 && inDeg >= 2) {
          // mixed — allowed but warn
        } else if (outDeg < 2 && inDeg < 2) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "gateway.no_branches",
            "Esta decisão não está dividindo nem juntando caminhos. Use-a com pelo menos 2 saídas (para escolher um caminho) ou 2 entradas (para juntar caminhos)."
          );
        }
      } else if (isType(node, "bpmn:ParallelGateway")) {
        if (outDeg < 2 && inDeg < 2) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "parallel.no_branches",
            "Esta bifurcação paralela precisa abrir ou fechar caminhos simultâneos. Conecte pelo menos 2 entradas ou 2 saídas."
          );
        }
      } else if (isType(node, "bpmn:EventBasedGateway")) {
        if (outDeg < 2) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "event_gateway.few_alternatives",
            "Esta decisão por eventos precisa de pelo menos 2 alternativas (eventos que podem acontecer)."
          );
        }
        if (inDeg > 1) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "event_gateway.converging",
            "Decisões por eventos servem só para abrir caminhos, não para juntá-los. Use outro tipo de decisão para convergir."
          );
        }
      } else if (isType(node, "bpmn:ComplexGateway")) {
        if (outDeg < 2 && inDeg < 2) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "complex.no_branches",
            "Esta decisão complexa precisa de múltiplos caminhos de entrada ou saída."
          );
        }
      }
    }

    // Parallel Gateway flows must not carry conditions
    for (const sf of sequenceFlows) {
      const src = sf.source;
      const tgt = sf.target;
      if (!src || !tgt) {
        push(
          violations,
          sf.id,
          sf.id,
          "error",
          "flow.missing_endpoint",
          "Esta seta está solta — falta a ponta de origem ou de destino."
        );
        continue;
      }
      if (src.id === tgt.id) {
        push(
          violations,
          sf.id,
          sf.id,
          "error",
          "flow.self_loop",
          "Esta seta liga um elemento a ele mesmo. Remova-a ou redirecione para outro elemento."
        );
      }
      if (isType(src, "bpmn:ParallelGateway") && sf.businessObject?.conditionExpression) {
        push(
          violations,
          sf.id,
          sf.id,
          "warning",
          "parallel.conditional_flow",
          "Setas que saem de uma bifurcação paralela não podem ter condição — todos os caminhos seguem juntos."
        );
      }
    }

    // Reachability from any StartEvent → orphans
    const reachableFromStart = new Set<string>();
    const queue: string[] = startEvents.map((s) => s.id);
    queue.forEach((id) => reachableFromStart.add(id));
    while (queue.length) {
      const cur = queue.shift()!;
      for (const next of out.get(cur) || []) {
        if (!reachableFromStart.has(next)) {
          reachableFromStart.add(next);
          queue.push(next);
        }
      }
    }
    // Reach EndEvent (backward BFS)
    const canReachEnd = new Set<string>();
    const bq: string[] = endEvents.map((e) => e.id);
    bq.forEach((id) => canReachEnd.add(id));
    while (bq.length) {
      const cur = bq.shift()!;
      for (const prev of inc.get(cur) || []) {
        if (!canReachEnd.has(prev)) {
          canReachEnd.add(prev);
          bq.push(prev);
        }
      }
    }
    for (const node of nodes) {
      if (isType(node, "bpmn:StartEvent") || isType(node, "bpmn:EndEvent")) continue;
      const name = getName(node);
      if (startEvents.length > 0 && !reachableFromStart.has(node.id)) {
        push(
          violations,
          node.id,
          name,
          "warning",
          "graph.unreachable",
          "Este elemento está em um trecho do diagrama que nunca é alcançado a partir do início do processo."
        );
      }
      if (endEvents.length > 0 && !canReachEnd.has(node.id)) {
        push(
          violations,
          node.id,
          name,
          "warning",
          "graph.deadlock",
          "A partir deste elemento não há como chegar ao fim do processo (caminho sem saída)."
        );
      }
    }

    // Cycle composed only of gateways
    const gatewayIds = new Set(
      nodes.filter((n) => isType(n, "bpmn:Gateway")).map((n) => n.id)
    );
    const visited = new Set<string>();
    const stack = new Set<string>();
    function dfs(id: string): boolean {
      if (stack.has(id)) return true;
      if (visited.has(id)) return false;
      visited.add(id);
      stack.add(id);
      for (const nxt of out.get(id) || []) {
        if (gatewayIds.has(nxt) && dfs(nxt)) return true;
      }
      stack.delete(id);
      return false;
    }
    for (const gid of gatewayIds) {
      stack.clear();
      if (dfs(gid)) {
        push(
          violations,
          gid,
          gid,
          "warning",
          "graph.gateway_cycle",
          "Há um laço (loop) formado apenas por decisões, sem nenhuma atividade no meio. Inclua ao menos uma atividade dentro do ciclo."
        );
        break;
      }
    }
  }

  return violations;
}
