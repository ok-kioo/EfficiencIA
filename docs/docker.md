# Stack Docker — EfficiencIA

Stack completa local: frontend (Vite), backend (Express), Postgres, n8n,
Qdrant (vetores) e Ollama (LLM local).

## Pré-requisitos

- Docker Desktop 4.x ou Docker Engine + Compose v2
- ~6 GB livres em disco (volumes de Ollama crescem com cada modelo)

## Subir tudo

```bash
cp .env.docker.example .env   # ajuste GOOGLE_CLIENT_ID, JWT_SECRET, etc.
docker compose up -d
docker compose logs -f backend
```

Serviços disponíveis depois de alguns segundos:

| Serviço   | URL                       |
| --------- | ------------------------- |
| Frontend  | http://localhost:8080     |
| Backend   | http://localhost:3001     |
| n8n       | http://localhost:5678     |
| Qdrant    | http://localhost:6333     |
| Ollama    | http://localhost:11434    |
| Postgres  | localhost:5432            |

## Comandos úteis

```bash
# Logs de um serviço
docker compose logs -f frontend

# Rodar migrations manualmente (são executadas automaticamente no boot do backend)
docker compose exec backend npm run migrate

# Baixar um modelo no Ollama (ex.: llama3.1:8b)
docker compose exec ollama ollama pull llama3.1:8b

# Derrubar tudo (mantendo volumes)
docker compose down

# Resetar do zero (apaga banco, fluxos n8n, modelos Ollama)
docker compose down -v
```

## Integração com IA

O backend chama `N8N_WEBHOOK_URL` (default `http://n8n:5678/webhook/assist-bpmn`)
quando o usuário aperta **Analisar com IA**. Importe seu workflow no n8n
(`http://localhost:5678`) e conecte-o ao endpoint indicado — o n8n pode
chamar o Ollama via `http://ollama:11434` e o Qdrant via `http://qdrant:6333`.
