FROM node:20-alpine

WORKDIR /app

# Instala dependências primeiro (cache de layer)
COPY package.json package-lock.json* ./
RUN npm install

# Copia o restante do código
COPY . .

EXPOSE 3001

# Roda migrations e depois sobe o servidor em modo dev (watch)
CMD sh -c "npm run migrate && npm run dev"
