// Hard-rule provider: blocks structurally invalid modeling actions in real time.
// Emits `validation.blocked` on the eventBus so the UI can display a toast.
import RuleProvider from "diagram-js/lib/features/rules/RuleProvider";

type Any = any;

const HIGH_PRIORITY = 1500;

function isType(element: Any, type: string): boolean {
  return Boolean(element?.businessObject?.$instanceOf?.(type));
}

function isAny(element: Any, types: string[]): boolean {
  return types.some((t) => isType(element, t));
}

function getParentProcess(element: Any): Any | null {
  let bo = element?.businessObject;
  while (bo) {
    if (bo.$instanceOf?.("bpmn:Process") || bo.$instanceOf?.("bpmn:SubProcess")) {
      return bo;
    }
    bo = bo.$parent;
  }
  return null;
}

function getParentParticipant(element: Any): Any | null {
  let current = element?.parent;
  while (current) {
    if (isType(current, "bpmn:Participant")) return current;
    current = current.parent;
  }
  return null;
}

export default class CustomRules extends RuleProvider {
  static $inject = ["eventBus"];

  private _eventBus: Any;

  constructor(eventBus: Any) {
    super(eventBus);
    this._eventBus = eventBus;
  }

  block(rule: string, message: string, elementId?: string): false {
    this._eventBus.fire("validation.blocked", { rule, message, elementId });
    return false;
  }

  init() {
    const self = this;

    this.addRule("connection.create", HIGH_PRIORITY, function (context: Any) {
      return self.canConnect(context.source, context.target);
    });

    this.addRule("connection.reconnect", HIGH_PRIORITY, function (context: Any) {
      return self.canConnect(context.source, context.target);
    });

    this.addRule("shape.attach", HIGH_PRIORITY, function (context: Any) {
      const shape = context.shape;
      const target = context.target;
      if (!shape || !target) return;
      if (isType(shape, "bpmn:BoundaryEvent")) {
        if (!isType(target, "bpmn:Activity")) {
          return self.block(
            "boundary.host.invalid",
            "BoundaryEvent só pode ser anexado a uma Activity.",
            shape.id
          );
        }
      }
    });
  }

  canConnect(source: Any, target: Any): boolean | void {
    if (!source || !target) return;

    // Self-loop
    if (source === target || source.id === target.id) {
      return this.block(
        "flow.self_loop",
        "Não é permitido conectar um elemento a si mesmo.",
        source.id
      );
    }

    // Direct Pool-to-Pool connection
    if (isType(source, "bpmn:Participant") && isType(target, "bpmn:Participant")) {
      return this.block(
        "flow.pool_to_pool",
        "Pools não podem ser conectados diretamente — use um Message Flow entre elementos internos.",
        source.id
      );
    }

    const sourceParticipant = getParentParticipant(source);
    const targetParticipant = getParentParticipant(target);
    const crossesPool =
      sourceParticipant && targetParticipant && sourceParticipant !== targetParticipant;

    // Determine intended connection type. bpmn-js infers via BpmnRules; we
    // duplicate the structural checks that BPMN 2.0 demands.

    // Sequence Flow rules (same process)
    const sourceProcess = getParentProcess(source);
    const targetProcess = getParentProcess(target);

    if (sourceProcess && targetProcess && sourceProcess !== targetProcess) {
      // Cross-process: only Message Flow allowed (between Participants)
      if (!crossesPool) {
        return this.block(
          "flow.cross_process",
          "Sequence Flow só pode conectar elementos do mesmo processo.",
          source.id
        );
      }
    }

    if (crossesPool) {
      // Across pools: forbid SequenceFlow on Activities/Events/Gateways
      // (bpmn-js will normally create MessageFlow; nothing to block here)
    }

    // StartEvent must not have incoming sequence flows
    if (isType(target, "bpmn:StartEvent")) {
      return this.block(
        "start.incoming_forbidden",
        "Start Event não pode receber Sequence Flows de entrada.",
        target.id
      );
    }

    // EndEvent must not have outgoing sequence flows
    if (isType(source, "bpmn:EndEvent")) {
      return this.block(
        "end.outgoing_forbidden",
        "End Event não pode originar Sequence Flows de saída.",
        source.id
      );
    }

    // Event-Based Gateway: outgoing only to IntermediateCatchEvent or ReceiveTask
    if (isType(source, "bpmn:EventBasedGateway")) {
      const ok =
        isType(target, "bpmn:IntermediateCatchEvent") || isType(target, "bpmn:ReceiveTask");
      if (!ok) {
        return this.block(
          "event_gateway.invalid_target",
          "Event-Based Gateway só pode conectar a Intermediate Catch Events ou Receive Tasks.",
          source.id
        );
      }
    }

    // Forbid SequenceFlow into/out of DataObject / DataStore / TextAnnotation / Group
    const artifactLikeTypes = [
      "bpmn:DataObjectReference",
      "bpmn:DataStoreReference",
      "bpmn:DataObject",
      "bpmn:TextAnnotation",
      "bpmn:Group",
    ];
    if (isAny(source, artifactLikeTypes) || isAny(target, artifactLikeTypes)) {
      // Allowed: DataAssociation / Association — bpmn-js handles via connection type.
      // We only block obvious sequence-flow attempts between activity & participant.
      if (isType(source, "bpmn:FlowNode") && isAny(target, artifactLikeTypes)) {
        // bpmn-js will create a DataAssociation/Association; allow.
      } else if (isAny(source, artifactLikeTypes) && isType(target, "bpmn:FlowNode")) {
        // same — allow association
      } else if (isAny(source, artifactLikeTypes) && isAny(target, artifactLikeTypes)) {
        return this.block(
          "flow.artifact_to_artifact",
          "Artefatos (Data Objects, Text Annotations, Groups) não podem ser ligados entre si por fluxo.",
          source.id
        );
      }
    }
  }
}
