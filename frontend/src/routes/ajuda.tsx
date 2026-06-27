import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Circle,
  CircleDot,
  Diamond,
  HelpCircle,
  LayoutDashboard,
  MoveRight,
  Square,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda — Como montar seus fluxos | EfficiencIA" },
      {
        name: "description",
        content:
          "Guia simples para mapear processos: o que é cada elemento, quando usar, exemplos do dia a dia e boas práticas.",
      },
    ],
  }),
  component: HelpPage,
});

interface ElementCard {
  icon: typeof Circle;
  name: string;
  technical: string;
  description: string;
  when: string;
  example: string;
  shape: "circle-thin" | "circle-thick" | "rect" | "diamond" | "arrow" | "pool";
}

const elements: ElementCard[] = [
  {
    icon: Circle,
    name: "Ponto de início",
    technical: "Start Event",
    shape: "circle-thin",
    description: "Mostra onde o processo começa. Todo fluxo precisa ter um.",
    when: "Use no começo do desenho, antes da primeira etapa.",
    example: "“Cliente faz um pedido” ou “Funcionário envia solicitação”.",
  },
  {
    icon: Square,
    name: "Etapa do processo",
    technical: "Task / Activity",
    shape: "rect",
    description: "Uma ação concreta executada por alguém ou por um sistema.",
    when: "Para cada coisa que precisa ser feita no processo.",
    example: "“Aprovar pedido”, “Emitir nota fiscal”, “Enviar e-mail”.",
  },
  {
    icon: Diamond,
    name: "Ponto de decisão",
    technical: "Gateway",
    shape: "diamond",
    description:
      "Marca um momento em que o fluxo se divide ou se junta dependendo de uma condição.",
    when: "Quando há um “se acontecer X, vai para um lado; se não, vai para outro”.",
    example: "“Pedido acima de R$ 1.000?” → Sim segue para aprovação, Não vai direto.",
  },
  {
    icon: CircleDot,
    name: "Evento durante o processo",
    technical: "Intermediate Event",
    shape: "circle-thick",
    description: "Algo que acontece no meio do fluxo: uma espera, um aviso, um prazo.",
    when: "Para sinalizar pausas, recebimento de mensagens ou contagem de tempo.",
    example: "“Aguardar resposta do cliente por 3 dias úteis”.",
  },
  {
    icon: Circle,
    name: "Ponto de fim",
    technical: "End Event",
    shape: "circle-thick",
    description: "Indica o término do processo. Pode haver mais de um.",
    when: "Sempre que o fluxo chega a uma conclusão.",
    example: "“Pedido concluído” ou “Solicitação cancelada”.",
  },
  {
    icon: MoveRight,
    name: "Conexão entre etapas",
    technical: "Sequence Flow",
    shape: "arrow",
    description:
      "É a seta que liga as etapas e mostra a ordem em que as coisas acontecem.",
    when: "Para conectar uma etapa à próxima.",
    example: "Da etapa “Receber pedido” → para “Conferir estoque”.",
  },
  {
    icon: Users,
    name: "Participante do processo",
    technical: "Pool / Lane",
    shape: "pool",
    description:
      "Uma faixa que representa quem é responsável por aquela parte do fluxo — pessoa, área ou sistema.",
    when: "Quando você quer mostrar “quem faz o quê” no processo.",
    example: "Faixas separadas para “Comercial”, “Financeiro” e “Cliente”.",
  },
];

function ElementIcon({ shape }: { shape: ElementCard["shape"] }) {
  switch (shape) {
    case "circle-thin":
      return (
        <svg viewBox="0 0 36 36" className="h-9 w-9">
          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "circle-thick":
      return (
        <svg viewBox="0 0 36 36" className="h-9 w-9">
          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      );
    case "rect":
      return (
        <svg viewBox="0 0 48 36" className="h-9 w-12">
          <rect x="3" y="6" width="42" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 40 40" className="h-9 w-9">
          <polygon points="20,4 36,20 20,36 4,20" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "arrow":
      return (
        <svg viewBox="0 0 48 24" className="h-9 w-12">
          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          <line x1="4" y1="12" x2="40" y2="12" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#ah)" />
        </svg>
      );
    case "pool":
      return (
        <svg viewBox="0 0 48 36" className="h-9 w-12">
          <rect x="2" y="4" width="44" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="14" y1="4" x2="14" y2="32" stroke="currentColor" strokeWidth="1" />
          <line x1="2" y1="18" x2="46" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
  }
}

const faqs = [
  {
    q: "Preciso entender de BPMN para usar?",
    a: "Não. A plataforma foi feita para qualquer pessoa: você arrasta as etapas, conecta com setas e descreve em palavras simples. A IA cuida da análise técnica.",
  },
  {
    q: "Meu desenho fica salvo?",
    a: "Sim. Enquanto você desenha, o rascunho é salvo automaticamente no seu navegador e, ao logar, na sua conta. Você pode voltar quando quiser.",
  },
  {
    q: "O que acontece quando aperto “Analisar”?",
    a: "O fluxo atual é enviado para nossa IA, que devolve um resumo, gargalos, problemas, sugestões e uma pontuação geral. Tudo em linguagem clara.",
  },
  {
    q: "Posso compartilhar com colegas?",
    a: "Em breve. Por enquanto, exporte o fluxo pelo botão “Exportar” e envie o arquivo.",
  },
];

const practices = [
  "Comece pelo essencial: um ponto de início, as principais etapas e um ponto de fim.",
  "Use frases curtas nas etapas. Verbo no infinitivo ajuda: “Aprovar”, “Enviar”, “Conferir”.",
  "Evite mais de 15 etapas no mesmo fluxo. Se ficar grande, quebre em processos menores.",
  "Em pontos de decisão, escreva a pergunta na seta: “Aprovado?”, “Em estoque?”.",
  "Preencha os dados operacionais (tempo, custo, responsável) — eles tornam a análise muito mais rica.",
];

function HelpPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  function handleBack(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!isAuthenticated) return; // deixa o Link normal levar para "/"
    event.preventDefault();
    // Se houver histórico, volta. Senão, vai para o dashboard.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/dashboard" });
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Voltar
          </Link>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-deep"
            >
              <LayoutDashboard size={14} strokeWidth={2} />
              Ir para o Dashboard
            </Link>
          ) : (
            <Link
              to="/signup"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-deep"
            >
              Criar conta
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
            <HelpCircle size={12} strokeWidth={2} />
            Ajuda
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Como montar seus fluxos
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Guia rápido para quem nunca desenhou um processo. Em poucos minutos você
            aprende o que cada elemento significa e como usá-lo no seu dia a dia.
          </p>
        </div>

        <section className="mb-14">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            O que é “mapear um processo”?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            É desenhar, passo a passo, como o trabalho acontece. Quem faz, o que faz e
            em que ordem. Isso te ajuda a enxergar onde estão os atrasos, as repetições
            e as oportunidades de melhoria. Pense como uma receita de bolo — só que
            para o seu processo de vendas, atendimento ou aprovação.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Os elementos do desenho
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Você não precisa decorar nada. A barra lateral da ferramenta mostra cada
            um deles quando você passar o mouse.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {elements.map((el) => (
              <article
                key={el.name}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="text-primary">
                    <ElementIcon shape={el.shape} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-semibold tracking-tight">
                      {el.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                      Termo técnico: {el.technical}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  {el.description}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  <strong className="font-semibold text-foreground">Quando usar:</strong>{" "}
                  {el.when}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong className="font-semibold text-foreground">Exemplo:</strong>{" "}
                  {el.example}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Boas práticas
          </h2>
          <ul className="mt-4 space-y-2">
            {practices.map((p) => (
              <li
                key={p}
                className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground"
              >
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-14">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Perguntas frequentes
          </h2>
          <div className="mt-4 space-y-3">
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
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {!isAuthenticated && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <p className="font-display text-lg font-semibold text-foreground">
              Pronto para experimentar?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie sua conta e desenhe seu primeiro fluxo em minutos.
            </p>
            <Link
              to="/signup"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-deep"
            >
              Começar agora
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
