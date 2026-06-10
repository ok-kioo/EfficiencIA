# Validador sintático BPMN 2.0 + autosave no modelador

Adicionar ao `/modeler`:
1. **Validação sintática híbrida** (hard rules bloqueiam + soft rules marcam).
2. **Autosave** no `localStorage` a cada alteração, com restauração ao reabrir a página.

Redesign visual (taste-skill) fica para o próximo turno.

## UX

**Validação**
- Toast (`sonner`) quando uma hard rule bloqueia a ação, explicando a regra.
- Overlay vermelho (erro) ou amarelo (aviso) sobre cada elemento inválido no SVG, com tooltip.
- Painel "Validação" abaixo do `ProcessDataPanel` lista violações agrupadas; clique = seleciona/centraliza o elemento.
- Botão **Salvar** confirma se houver erros (permite salvar marcando como inválido).

**Autosave**
- Salva automaticamente em `localStorage` a cada `commandStack.changed` (debounced 800ms) e quando `processName`/`activities` mudam.
- Indicador discreto no header da página: "Salvo automaticamente às HH:MM" (ou "Salvando…").
- Ao montar `ModelerPage`, restaura o último rascunho do `localStorage` se existir, em vez do `defaultBpmnXml`. Toast informativo "Rascunho restaurado".
- Botão "Descartar rascunho" no painel ao lado do indicador → volta para `defaultBpmnXml`.
- O Salvar manual existente continua funcionando (usa `saveProcessLocally` em outra chave) — autosave usa chave separada `efficiencia:modeler:draft`.

## Regras de validação — separação hard vs soft

**Hard (bloqueia via `RuleProvider`):**
- StartEvent não aceita SequenceFlow de entrada; EndEvent não aceita de saída.
- SequenceFlow self-loop (origem = destino).
- SequenceFlow cruzando Pools / processos distintos.
- SequenceFlow conectando Pools diretamente (deve ser MessageFlow).
- MessageFlow só entre Pools distintos.
- BoundaryEvent só anexado a Activity.
- Event-Based Gateway: destinos só IntermediateCatchEvent / ReceiveTask.
- Conexões entre tipos incompatíveis (ex.: DataObject por SequenceFlow).
- IDs duplicados em paste.

**Soft (marca + lista, não bloqueia):**
- Processo sem StartEvent / sem EndEvent.
- Task / IntermediateEvent isolado.
- IntermediateEvent ≠ 1 entrada + 1 saída; EndEvent sem entrada.
- Gateway divergente exclusivo/inclusivo com <2 saídas; convergente com <2 entradas.
- ParallelGateway com condição em SequenceFlow.
- Event-Based Gateway sem ≥2 alternativas ou com default flow (warning).
- ComplexGateway sem múltiplas in/out.
- Elementos não alcançáveis a partir de StartEvent (orphans).
- Elementos sem caminho até EndEvent (deadlocks).
- Ciclos compostos só por gateways.
- SubProcess expandido vazio.
- TextAnnotation sem Association; DataObject sem DataAssociation.
- Tasks com nome vazio (informativo).

## Arquitetura técnica

### Novos arquivos
- `src/lib/bpmn-validation/CustomRules.ts` — estende `BpmnRules` (`canConnect`, `canCreate`, `canAttach`). Emite `validation.blocked` no `eventBus` antes de `return false`.
- `src/lib/bpmn-validation/SemanticValidator.ts` — `validate(modeler): Violation[]`. Usa `elementRegistry`; faz BFS forward dos StartEvents e backward dos EndEvents para reachability/deadlock; detecta ciclos só-gateways.
- `src/lib/bpmn-validation/types.ts` — `Violation { id, elementId, severity, rule, message }`.
- `src/lib/bpmn-validation/index.ts` — módulo didi (`{ __init__: ['customRules'], customRules: ['type', CustomRules] }`) para `additionalModules`.
- `src/components/bpmn/ValidationPanel.tsx` — lista agrupada erro/aviso; clique → `canvas.scrollToElement` + `selection.select`.
- `src/hooks/useBpmnValidation.ts` — escuta `commandStack.changed` (debounce 150ms) + `import.done` + `validation.blocked`; mantém `violations[]`; aplica/limpa `overlays`.
- `src/lib/modeler/autosave.ts` — `loadDraft()`, `saveDraft(draft)`, `clearDraft()` em `localStorage` com chave `efficiencia:modeler:draft`. Shape: `{ bpmnXml, processName, activities, savedAt }`. Guard `typeof window !== 'undefined'`.
- `src/hooks/useModelerAutosave.ts` — recebe `{bpmnXml, processName, activities}`, debounce 800ms, grava draft, expõe `{ lastSavedAt, status: 'idle'|'saving'|'saved', discard() }`.

### Arquivos modificados
- `src/components/bpmn/BpmnModeler.tsx` — passa `additionalModules: [customRulesModule]`.
- `src/pages/ModelerPage.tsx` —
  - No mount, chama `loadDraft()`; se existir, hidrata estado inicial e dispara toast "Rascunho restaurado". Senão, usa `defaultBpmnXml`.
  - Usa `useModelerAutosave` para persistir mudanças.
  - Usa `useBpmnValidation` e renderiza `ValidationPanel`.
  - Mostra indicador "Salvo às HH:MM" + botão "Descartar rascunho" no cabeçalho.
  - `handleSave` (manual) confirma se houver erros.

### Detalhes
- `RuleProvider.return false` cancela; antes, `eventBus.fire('validation.blocked', { rule, message })` → hook dispara `toast.error`.
- Overlays: chave `${elementId}:${ruleId}`; limpos a cada re-validação.
- Autosave usa `JSON.stringify` com try/catch (quota/erro de serialização); falhas viram `toast.warning` discreto e log no console.
- Restauração só acontece se o draft tiver `bpmnXml` válido; caso contrário, ignora silenciosamente.

## Fora de escopo
- Redesign visual (taste-skill) — próximo turno.
- Sincronizar autosave/validação com backend.
- Validações semânticas de negócio (expressões, executabilidade).

## Resultado
No `/modeler`: ações estruturalmente impossíveis são bloqueadas com toast; demais inconsistências aparecem como overlay e lista clicável; cada edição é salva automaticamente no `localStorage` e restaurada ao reabrir, sem depender do botão Salvar.
