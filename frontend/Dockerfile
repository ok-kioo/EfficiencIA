FROM oven/bun:1.1-alpine

WORKDIR /app

# Cache de dependências
COPY package.json bun.lock* ./
RUN bun install

# Resto do código
COPY . .

EXPOSE 8080

# Vite dev em modo host pra ser acessível fora do container
CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]
