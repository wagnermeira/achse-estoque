FROM node:22-alpine

WORKDIR /app

# Instala dependências do sistema (OpenSSL é necessário pro Prisma)
RUN apk add --no-cache openssl

# Copia e instala dependências
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Copia o código e compila
COPY . .
RUN npx prisma generate
RUN npm run build

# Cria pasta de uploads
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

EXPOSE 3333

# Comando de inicialização: Roda migração do banco e inicia o server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]