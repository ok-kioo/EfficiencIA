
# Portar EfficiencIA para o ambiente Lovable

O projeto enviado é um app **Vite + React 19 + react-router-dom + Tailwind v4 + bpmn-js + axios** (autenticação demo, dashboard, modelador BPMN, análise e cenários). O Lovable roda em **TanStack Start** (SSR/Workers), então o código é copiado integralmente, mas a camada de roteamento e o bootstrap precisam ser adaptados.

## O que será copiado sem alterações

- `src/@types/*` → `src/@types/`
- `src/assets/hero.png` → `src/assets/`
- `src/components/**` (auth, bpmn, layout, process)
- `src/contexts/AuthContext.tsx`
- `src/services/**` (api, authService, processService, analysisService)
- `src/utils/**` (bpmnUtils, downloadFile)
- `src/pages/**` (DashboardPage, ModelerPage, AnalysisPage, ScenariosPage, LoginPage, SignupPage) — código preservado

## Adaptações necessárias

1. **Dependências**: instalar `bpmn-js`, `axios`, `lucide-react` (atualizar versão para a usada hoje, a do upload está desatualizada).
2. **Roteamento (react-router-dom → TanStack Router)**:
   - Substituir `src/routes/AppRoutes.tsx` e `src/App.tsx` por rotas baseadas em arquivo em `src/routes/`:
     ```
     src/routes/__root.tsx           (já existe — envolver com AuthProvider)
     src/routes/login.tsx
     src/routes/signup.tsx
     src/routes/_authenticated.tsx          (layout: AppLayout + <Outlet/>)
     src/routes/_authenticated.index.tsx    (DashboardPage)
     src/routes/_authenticated.modeler.tsx
     src/routes/_authenticated.analysis.tsx
     src/routes/_authenticated.scenarios.tsx
     ```
   - Trocar imports `react-router-dom` → `@tanstack/react-router` em `Sidebar.tsx`, `Header.tsx`, `LoginForm.tsx`, `SignupForm.tsx`, `ProtectedRoute.tsx`:
     - `Link` continua `Link` (mas usa `to` tipado)
     - `useLocation` → `useRouterState({ select: s => s.location })`
     - `useNavigate` → `useNavigate()` do TanStack
     - `<Navigate to=...>` → `redirect()` ou `<Navigate>` do TanStack
3. **SSR-safety do bpmn-js**: `bpmn-js` usa `window` no carregamento. O `BpmnModeler` será carregado dinamicamente (`const Mod = (await import("bpmn-js/lib/Modeler")).default`) dentro de `useEffect`, e o componente envolto em guarda `typeof window !== "undefined"` para não quebrar no SSR.
4. **Estilos**: o `src/index.css` original (`@import "tailwindcss"`) é descartado — o Lovable já possui `src/styles.css` com Tailwind v4 e tokens semânticos. O `App.css` será descartado (não há nada essencial). Cores hardcoded (`bg-slate-50`, `text-slate-900`, etc.) ficam como estão para preservar o visual atual; podemos migrar para tokens depois se quiser.
5. **API URL**: `api.ts` lê `import.meta.env.VITE_API_URL`. Mantido como está; sem `VITE_API_URL` definida, cai no fallback `http://localhost:8000` (chamadas vão falhar até você configurar uma URL ou trocar para Lovable Cloud — fica para um próximo passo).
6. **Auth demo**: o `AuthContext` já carrega um `DEMO_USER` por padrão, então `_authenticated` permite navegar sem backend real. `ProtectedRoute` original é praticamente um passthrough, então é absorvido no layout `_authenticated`.
7. **Metadados de rota**: cada rota nova recebe `head()` com `title` e `description` específicos (Dashboard, Modelagem BPMN, Análise, Cenários, Login, Cadastro).
8. **Limpeza**: não copiar `index.html`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `package-lock.json`, `.git`, `main.tsx`, `App.tsx`, `App.css`, `index.css`, `routes/AppRoutes.tsx` — tudo isso já é gerenciado pelo template TanStack do Lovable.

## Resultado

Mesmas telas, mesmo visual, mesmos serviços e contextos, navegando via TanStack Router sob `/login`, `/signup`, `/` (dashboard), `/modeler`, `/analysis`, `/scenarios`. Pronto para evoluir (ex.: trocar `authService`/`api` por Lovable Cloud quando quiser backend real).
