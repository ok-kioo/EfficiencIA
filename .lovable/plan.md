Reescrever as mensagens de validação em português claro, sem jargão BPMN, focando em "o que está errado + o que fazer".

## 1. Mensagens em linguagem leiga

Substituir termos técnicos por equivalentes amigáveis em todas as mensagens de `SemanticValidator.ts` e `CustomRules.ts`:

| Termo técnico | Termo amigável |
|---|---|
| Start Event | "evento de início" (do processo) |
| End Event | "evento de fim" |
| Sequence Flow | "seta de fluxo" / "ligação" |
| Boundary Event | "evento anexado" |
| Task / CallActivity | "atividade" |
| Gateway | "decisão" (exclusivo/inclusivo) ou "bifurcação paralela" |
| Pool / Participant | "raia/pool" |
| Message Flow | "mensagem entre raias" |
| Artifact / DataObject | "anotação / objeto de dado" |

**Exemplos de reescrita** (todas terão dois pedaços: problema + sugestão):

- `process.no_start`: "Este processo não tem um ponto de início. Adicione um evento de início (círculo fino) para indicar onde o fluxo começa."
- `process.no_end`: "Este processo não termina em lugar nenhum. Adicione um evento de fim (círculo grosso) para fechar o fluxo."
- `end.no_incoming`: "O evento de fim está solto. Conecte uma seta vindo de alguma atividade ou decisão até ele."
- `start.no_outgoing`: "O evento de início não sai para lugar nenhum. Puxe uma seta dele até a primeira atividade."
- `task.isolated`: "Esta atividade está solta no diagrama. Conecte-a ao restante do processo com setas de entrada e saída."
- `task.no_incoming`: "Esta atividade não recebe nenhuma seta de entrada. Indique de onde o fluxo chega até ela."
- `task.no_outgoing`: "Esta atividade não tem saída. Indique para onde o fluxo segue depois dela."
- `task.unnamed`: "Esta atividade está sem nome. Dê um nome curto que descreva o que é feito (ex.: 'Aprovar pedido')."
- `gateway.no_branches`: "Esta decisão não está dividindo nem juntando caminhos. Use-a com pelo menos 2 saídas (para escolher um caminho) ou 2 entradas (para juntar caminhos)."
- `parallel.no_branches`: "Esta bifurcação paralela precisa abrir ou fechar caminhos. Conecte ao menos 2 entradas ou 2 saídas."
- `event_gateway.few_alternatives`: "Esta decisão por eventos precisa de pelo menos 2 alternativas (eventos que podem acontecer)."
- `event_gateway.converging`: "Decisões por eventos servem só para abrir caminhos, não para juntar. Use outra decisão para convergir."
- `complex.no_branches`: "Esta decisão complexa precisa de múltiplos caminhos de entrada ou saída."
- `intermediate.degree`: "Um evento intermediário deve ter exatamente uma seta chegando e uma saindo."
- `flow.missing_endpoint`: "Esta seta está solta — falta a ponta de origem ou de destino."
- `flow.self_loop`: "Esta seta liga um elemento a ele mesmo. Remova-a ou redirecione para outro elemento."
- `parallel.conditional_flow`: "Setas que saem de uma bifurcação paralela não podem ter condição — todas seguem juntas."
- `graph.unreachable`: "Este elemento está em um trecho do diagrama que nunca é alcançado a partir do início."
- `graph.deadlock`: "A partir deste elemento não há como chegar ao fim do processo (caminho sem saída)."
- `graph.gateway_cycle`: "Há um laço (loop) formado apenas por decisões, sem nenhuma atividade no meio. Inclua ao menos uma atividade no ciclo."
- `boundary.no_host`: "Este evento anexado está flutuando. Encoste-o na borda de uma atividade."
- `id.duplicate`: "Identificador duplicado no diagrama (`{id}`). Isto pode causar erros ao exportar."

E em `CustomRules.ts` (toasts ao bloquear ação):
- `flow.self_loop`: "Não dá para ligar um elemento a ele mesmo."
- `flow.pool_to_pool`: "Raias não se conectam diretamente. Use uma mensagem entre elementos dentro das raias."
- `flow.cross_process`: "Setas de fluxo só ligam elementos do mesmo processo."
- `start.incoming_forbidden`: "Eventos de início não recebem setas — eles começam o fluxo."
- `end.outgoing_forbidden`: "Eventos de fim não têm saída — eles encerram o fluxo."
- `event_gateway.invalid_target`: "Decisões por evento só ligam a eventos intermediários ou tarefas de recebimento."
- `boundary.host.invalid`: "Eventos anexados precisam ser colocados na borda de uma atividade."
- `flow.artifact_to_artifact`: "Anotações e objetos de dado não se ligam entre si por fluxo."

## 2. Painel de Validação mais claro

`src/components/bpmn/ValidationPanel.tsx`:
- Renomear severidades: `Erros` → "Precisa corrigir", `Avisos` → "Sugestões", `Notas` → "Dicas".
- Tooltip nos contadores do header com o nome completo (`title=`).
- Esconder o `v.rule` técnico da linha (ex.: `task.no_incoming`) — manter só o nome do elemento. O `rule` fica em `title=` no botão pra quem precisar inspecionar.
- Estado vazio: trocar "Diagrama sintaticamente válido." por "Tudo certo — o diagrama está consistente."
- Header: "X violações." → "X ponto(s) a revisar." / "Sem problemas detectados."

## Fora de escopo

- Não muda lógica de validação nem regras (somente strings).
- Não muda IDs de `rule` (continuam estáveis pra debug).
- Não toca em `types.ts`, hooks, autosave, design system.