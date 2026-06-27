import { create } from "./projectService.js";

/**
 * XML BPMN mínimo já desenhado: Início → Receber pedido → Aprovado? → Fim.
 * Serve como exemplo para o usuário entender a ferramenta no primeiro login.
 */
const WELCOME_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_Welcome" targetNamespace="http://efficiencia.io/bpmn">
  <bpmn:process id="Process_Welcome" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Pedido recebido">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_Conferir" name="Conferir pedido">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_1" name="Aprovado?">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_Sim</bpmn:outgoing>
      <bpmn:outgoing>Flow_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_Enviar" name="Enviar para o cliente">
      <bpmn:incoming>Flow_Sim</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_Ok" name="Pedido concluído">
      <bpmn:incoming>Flow_3</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="EndEvent_Cancel" name="Pedido cancelado">
      <bpmn:incoming>Flow_Nao</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_Conferir" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_Conferir" targetRef="Gateway_1" />
    <bpmn:sequenceFlow id="Flow_Sim" name="Sim" sourceRef="Gateway_1" targetRef="Task_Enviar" />
    <bpmn:sequenceFlow id="Flow_Nao" name="Não" sourceRef="Gateway_1" targetRef="EndEvent_Cancel" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_Enviar" targetRef="EndEvent_Ok" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="Diagram_1">
    <bpmndi:BPMNPlane id="Plane_1" bpmnElement="Process_Welcome">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="160" y="160" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="140" y="203" width="78" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Conferir_di" bpmnElement="Task_Conferir">
        <dc:Bounds x="250" y="138" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_1_di" bpmnElement="Gateway_1" isMarkerVisible="true">
        <dc:Bounds x="405" y="153" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="405" y="123" width="50" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Enviar_di" bpmnElement="Task_Enviar">
        <dc:Bounds x="510" y="138" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_Ok_di" bpmnElement="EndEvent_Ok">
        <dc:Bounds x="662" y="160" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="640" y="203" width="80" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_Cancel_di" bpmnElement="EndEvent_Cancel">
        <dc:Bounds x="412" y="270" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="388" y="313" width="84" height="14" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="196" y="178" /><di:waypoint x="250" y="178" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="350" y="178" /><di:waypoint x="405" y="178" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Sim_di" bpmnElement="Flow_Sim">
        <di:waypoint x="455" y="178" /><di:waypoint x="510" y="178" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Nao_di" bpmnElement="Flow_Nao">
        <di:waypoint x="430" y="203" /><di:waypoint x="430" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="610" y="178" /><di:waypoint x="662" y="178" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export async function createWelcomeProject(userId: string) {
  try {
    await create(userId, {
      name: "Exemplo: Pedido de cliente",
      description:
        "Processo de exemplo criado automaticamente. Edite à vontade ou crie um do zero.",
      bpmnXml: WELCOME_BPMN_XML,
      activities: [],
    });
  } catch (err) {
    // Não bloquear o signup se o exemplo falhar.
    console.error("[welcome-project] falhou ao criar exemplo:", err);
  }
}
