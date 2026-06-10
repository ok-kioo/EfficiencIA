# Validador sem overlays + autosave puro + redesign Emerald Prestige

Três mudanças coordenadas no `/modeler` e na identidade visual do app inteiro.

## 1. Validação: borda colorida no SVG, descrição só no painel

- Remover os círculos amarelos/vermelhos sobrepostos via `overlays.add` no `useBpmnValidation`.
- Em vez disso, usar `canvas.addMarker(elementId, classe)` com duas classes: `validation-error` e `validation-warning`. Re-validar limpa markers antigos com `removeMarker`.
- Adicionar CSS em `src/styles.css` que pinta a **borda** dos elementos BPMN marcados:
  - `.djs-element.validation-warning .djs-visual > :nth-child(1) { stroke: var(--color-warning); stroke-width: 3px; }`
  - Mesma regra para `validation-error` com `--color-destructive`.
  - Variantes para SequenceFlow/MessageFlow (também via `:nth-child(1)`).
- Sem tooltip, sem `title`, sem badge no canvas. A descrição da violação fica exclusivamente no `ValidationPanel` (já existente, clicar continua centralizando o elemento).

## 2. Remover botão "Salvar processo"

- `BpmnToolbar`: remove botão Save, prop `onSave`, ícone `Save` do import.
- `ModelerPage`: remove `handleSave`, `saveProcessLocally`, confirm-on-errors, import de `ProcessModel`. Autosave (já implementado) cobre tudo.
- O indicador "Salvo automaticamente às HH:MM" no header continua sendo o feedback de persistência.
- `services/processService.saveProcessLocally` fica no codebase (não usado agora), pode ser limpo em outro turno.

## 3. Redesign visual — Emerald Prestige (taste-skill aplicado)

**Briefing inferido (taste-skill §0):** ferramenta B2B interna de modelagem de processos — densidade compacta, vibe Linear/Figma com toque premium, não landing page. Audiência: analistas de processo + gestores. Acento dourado é sinal de qualidade, não decoração.

**Decisões fixas:**
- Paleta Emerald Prestige: surface `#f5f0e0` (cream warm), foreground `#0a1f17`, primary `#0d7a5f` (emerald), primary-deep `#064e3b`, accent `#c9a84c` (gold), warning `#c9a84c`, destructive `#9b2c2c`. Dark mode espelhado (surface `#0a1410`, foreground cream).
- Tipografia: **Sora** (display, headings, números) + **Manrope** (body, inputs, labels). Tabular nums em métricas/status.
- Densidade compacta: sidebar 220px, header 52px, padding base 12px, raio 10px (não pill), bordas hairline `1px solid var(--color-border)` em vez de shadows pesados.
- Microcopy/iconografia: lucide com `stroke-width 1.5`, tamanhos 14–16px.
- Sem gradients chamativos, sem glassmorphism. Profundidade vem de hairlines + um único accent dourado em estados ativos.

### Tokens em `src/styles.css`
- `:root` define variáveis OKLCH para todas as cores acima + dark mode.
- Bloco `@theme inline` mapeia `--color-background`, `--color-foreground`, `--color-primary`, `--color-primary-foreground`, `--color-accent`, `--color-accent-foreground`, `--color-warning`, `--color-warning-foreground`, `--color-destructive`, `--color-border`, `--color-muted`, `--color-muted-foreground`, `--color-card`, `--color-sidebar`, `--font-display`, `--font-sans`.
- `body { font-family: var(--font-sans); }`, headings `font-family: var(--font-display); letter-spacing: -0.02em;`.
- `@utility hairline { border: 1px solid var(--color-border); }` para reutilizar.
- Regras `.djs-element.validation-warning/error` (item 1).
- Reset opcional do canvas BPMN — `.bjs-container { background: var(--color-card); }`.

### Fontes (`src/routes/__root.tsx`)
- Adicionar `<link rel="preconnect" href="https://fonts.googleapis.com">`, `<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="">` e `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap">` nos `links` do `head()`.

### Componentes a restilizar (swap de `text-slate-*`/`bg-white` por tokens)
- `src/components/layout/Sidebar.tsx` — fundo `bg-sidebar`, item ativo com barra dourada de 2px à esquerda + texto `text-foreground`, hover `bg-muted`. Largura 220px, tipografia 13px, ícones 16px.
- `src/components/layout/Header.tsx` — `bg-background border-b border-border`, altura 52px, nome do usuário + botão sair compactos.
- `src/components/layout/AppLayout.tsx` — grid `[220px_1fr]`, padding 20px no conteúdo.
- `src/pages/ModelerPage.tsx` — h1 em Sora, indicador autosave com dot menor e mono tabular, input do nome compacto (`h-9 rounded-md`).
- `src/components/bpmn/BpmnToolBar.tsx` — após remoção do Save, botões Import/Export em estilo "ghost" (`border border-border bg-card hover:bg-muted`), ícones 14px.
- `src/components/process/ProcessDataPanel.tsx` — labels uppercase 10px tracking-wider, inputs `h-8 rounded-md border-border`, separadores hairline.
- `src/components/bpmn/ValidationPanel.tsx` — cabeçalho compacto, contadores em mono tabular, itens com borda esquerda 2px da cor da severidade (sem fundo colorido), texto em Manrope 13px.
- `src/components/bpmn/BpmnModeler.tsx` — wrapper `bg-card border border-border rounded-xl`.
- `src/pages/DashboardPage.tsx`, `LoginPage.tsx`, `SignupPage.tsx`, `AnalysisPage.tsx`, `ScenariosPage.tsx` — substitui slate hardcoded por tokens; cards `bg-card hairline rounded-xl`, CTAs `bg-primary text-primary-foreground`, links `text-primary`.
- `src/components/auth/LoginForm.tsx` / `SignupForm.tsx` — inputs e botões em tokens.

## Arquitetura técnica

### Arquivos modificados
- `src/styles.css` — tokens OKLCH light/dark, `@theme inline`, fontes display/sans, regras `.djs-element.validation-*`, opcional `bjs-container`.
- `src/routes/__root.tsx` — links para Google Fonts.
- `src/hooks/useBpmnValidation.ts` — substitui `overlays.add/remove` por `canvas.addMarker/removeMarker`; remove HTML do dot e o `title`.
- `src/components/bpmn/BpmnToolBar.tsx` — remove Save; ajusta classes para tokens.
- `src/pages/ModelerPage.tsx` — remove `handleSave`/import; ajusta classes para tokens; indicador autosave em mono.
- Demais componentes listados acima — apenas troca de classes Tailwind, sem mudança de lógica.

### Arquivos não tocados
- `services/`, `contexts/`, `utils/`, `@types/`, `lib/bpmn-validation/` (regras), `lib/modeler/autosave.ts`, `hooks/useModelerAutosave.ts`, `routes/_authenticated.*.tsx`, geração de XML BPMN.

## Fora de escopo
- Mudar a paleta dos elementos BPMN renderizados pelo bpmn-js (mantém estilo nativo). Só borda de validação é colorida pelo nosso CSS.
- Animações GSAP / micro-interações além de transitions Tailwind padrão.
- Backend / Lovable Cloud.

## QA antes de fechar
- Toda regra de validação warning/error pinta a **borda** do elemento, sem dot.
- Toolbar não tem Save; autosave continua persistindo.
- Nenhum `text-slate-*` / `bg-white` / `text-black` cru sobra nas páginas listadas (grep como check).
- Sora carrega nos headings, Manrope no body (visível no preview).
- Light e dark modes legíveis (sem texto cinza claro sobre cream).

## Resultado
- BPMN inválido = contorno amarelo/vermelho discreto; explicação fica no painel.
- Sem botão Salvar — só autosave.
- App ganha identidade Emerald Prestige consistente: cream + emerald + gold, Sora/Manrope, densidade de ferramenta.
