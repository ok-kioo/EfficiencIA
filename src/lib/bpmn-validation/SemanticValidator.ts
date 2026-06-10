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
  const all: Any[] = elementRegistry.getAll();
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
      push(violations, id, id, "error", "id.duplicate", `ID duplicado: ${id}.`);
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
        "Boundary Event sem atividade hospedeira."
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
        "Processo sem Start Event."
      );
    }
    if (endEvents.length === 0) {
      push(
        violations,
        procId,
        procId,
        "warning",
        "process.no_end",
        "Processo sem End Event."
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
            "End Event precisa ter ao menos um Sequence Flow de entrada."
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
            "Start Event precisa ter ao menos um Sequence Flow de saída."
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
            "Evento intermediário deve ter exatamente 1 entrada e 1 saída."
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
            "Task isolada do fluxo."
          );
        } else if (inDeg === 0) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "task.no_incoming",
            "Task sem Sequence Flow de entrada."
          );
        } else if (outDeg === 0) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "task.no_outgoing",
            "Task sem Sequence Flow de saída."
          );
        }
        if (!node.businessObject?.name) {
          push(violations, node.id, name, "info", "task.unnamed", "Task sem nome.");
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
            "Gateway exclusivo/inclusivo precisa de ≥2 saídas (divergência) ou ≥2 entradas (convergência)."
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
            "Parallel Gateway precisa de múltiplas entradas ou saídas."
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
            "Event-Based Gateway precisa de ≥2 alternativas."
          );
        }
        if (inDeg > 1) {
          push(
            violations,
            node.id,
            name,
            "warning",
            "event_gateway.converging",
            "Event-Based Gateway não deve ser usado para convergência."
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
            "Complex Gateway precisa de múltiplas entradas ou saídas."
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
          "Sequence Flow sem origem ou destino."
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
          "Sequence Flow conecta um elemento a si mesmo."
        );
      }
      if (isType(src, "bpmn:ParallelGateway") && sf.businessObject?.conditionExpression) {
        push(
          violations,
          sf.id,
          sf.id,
          "warning",
          "parallel.conditional_flow",
          "Sequence Flow vindo de Parallel Gateway não pode ter condição."
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
          "Elemento não é alcançável a partir de nenhum Start Event."
        );
      }
      if (endEvents.length > 0 && !canReachEnd.has(node.id)) {
        push(
          violations,
          node.id,
          name,
          "warning",
          "graph.deadlock",
          "Elemento sem caminho até nenhum End Event."
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
          "Ciclo composto apenas por gateways detectado."
        );
        break;
      }
    }
  }

  return violations;
}
