# Etapa 1: Dependências
FROM node:18-alpine AS deps
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./
RUN npm ci

# Etapa 2: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar dependências da etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Criar diretório public se não existir
RUN mkdir -p public

# Argumentos de build para variáveis de ambiente
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Variáveis de ambiente necessárias para build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build da aplicação
RUN npm run build

# Etapa 3: Produção
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Definir permissões
USER nextjs

# Expor porta
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar
CMD ["node", "server.js"]
