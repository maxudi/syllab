# 🚀 Deploy no Easypanel - Guia Completo

## 📋 Pré-requisitos

✅ Conta no Easypanel
✅ Projeto no GitHub (já feito!)
✅ Supabase configurado

---

## 🔧 Passo 1: Conectar GitHub ao Easypanel

1. Acesse seu Easypanel
2. Clique em **"+ New Project"**
3. Selecione **"GitHub"** como source
4. Escolha o repositório: `maxudi/syllab`
5. Branch: `main`

---

## 🐳 Passo 2: Configuração Docker (Automático)

O Easypanel vai detectar o `Dockerfile` automaticamente!

**Arquivos criados**:
- ✅ `Dockerfile` - Build em 3 etapas otimizado
- ✅ `.dockerignore` - Ignora arquivos desnecessários
- ✅ `next.config.js` - Atualizado com `output: 'standalone'`

---

## 🔐 Passo 3: Variáveis de Ambiente

No Easypanel, adicione estas variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui

# Node
NODE_ENV=production

# Next.js
NEXT_TELEMETRY_DISABLED=1
```

### 📍 Onde pegar as chaves do Supabase:
1. Dashboard Supabase → Settings → API
2. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ⚙️ Passo 4: Configurações do Projeto

### Build Settings:
```
Build Command: (deixe vazio, Dockerfile cuida)
Install Command: (deixe vazio)
Start Command: (deixe vazio)
```

### Port:
```
Port: 3000
```

### Domain:
```
Easypanel vai gerar: syllab.seudominio.easypanel.host
```

---

## 🚀 Passo 5: Deploy!

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos primeira vez)
3. Easypanel vai:
   - Clonar o repositório
   - Rodar `npm ci`
   - Fazer build do Next.js
   - Criar container Docker
   - Iniciar aplicação

---

## ✅ Verificar Deploy

### Logs:
```
Easypanel → Seu Projeto → Logs
```

### Healthcheck:
```
https://syllab.seudominio.easypanel.host
```

Se aparecer a homepage → **SUCESSO!** 🎉

---

## 🔄 Auto-Deploy (CI/CD)

Configure webhook para deploy automático a cada push:

1. Easypanel → Project Settings → Git
2. Ative **"Auto Deploy"**
3. Pronto! Agora cada `git push` faz deploy automático

---

## 🐛 Troubleshooting

### Erro: Module not found
```bash
# Limpe o cache e rebuild
Easypanel → Actions → Rebuild
```

### Erro: Database connection
```bash
# Verifique variáveis de ambiente
NEXT_PUBLIC_SUPABASE_URL deve começar com https://
NEXT_PUBLIC_SUPABASE_ANON_KEY deve ser a anon key, não service_role
```

### Erro: Port 3000 busy
```bash
# Verifique Port settings
Easypanel → Settings → Port: 3000
```

### Build muito lento
```bash
# Normal na primeira vez (instala dependências)
# Builds seguintes são mais rápidos (usa cache)
```

---

## 📊 Monitoramento

### Métricas disponíveis:
- CPU Usage
- Memory Usage
- Network Traffic
- Response Time

**Acesse**: Easypanel → Seu Projeto → Metrics

---

## 🔒 Segurança

### SSL/HTTPS:
✅ Automático no Easypanel (Let's Encrypt)

### Headers de Segurança:
Já configurados no Next.js

### Firewall:
Easypanel cuida automaticamente

---

## 💾 Backup

### Código:
✅ No GitHub (já feito!)

### Banco de Dados:
✅ Supabase faz backup automático

### Uploads:
✅ Supabase Storage tem redundância

---

## 🌐 Domínio Customizado (Opcional)

1. Easypanel → Settings → Domains
2. Adicione: `syllab.seudominio.com`
3. Configure DNS:
```
Type: CNAME
Name: syllab
Value: syllab.seudominio.easypanel.host
```

---

## 📈 Escalabilidade

### Recursos:
```
CPU: 0.5 cores (upgrade se necessário)
RAM: 512MB (upgrade se necessário)
Storage: 20GB
```

### Auto-scaling:
Disponível nos planos superiores do Easypanel

---

## 🎯 Checklist Pré-Deploy

- [x] Dockerfile criado
- [x] .dockerignore criado
- [x] next.config.js atualizado
- [x] Código no GitHub
- [ ] Variáveis de ambiente configuradas no Easypanel
- [ ] Storage policies configuradas no Supabase
- [ ] Banco de dados com RLS policies executadas

---

## 📝 Scripts SQL para Executar no Supabase

**ANTES do primeiro deploy, execute**:

1. `database/schema.sql` - Criar tabelas
2. `database/fix-admin-rls.sql` - Políticas admin
3. `database/add-tema-cores.sql` - Campo cor_tema
4. `database/add-campo-ativo-conteudos.sql` - Campo ativo
5. Configure Storage policies (FIX_STORAGE_INTERFACE.md)

---

## 🔗 Links Úteis

- **Repositório**: https://github.com/maxudi/syllab
- **Easypanel Docs**: https://easypanel.io/docs
- **Next.js Docker**: https://nextjs.org/docs/deployment
- **Supabase**: https://supabase.com/dashboard

---

## 🆘 Suporte

**Erro no deploy?**
1. Verifique logs no Easypanel
2. Teste localmente com Docker:
   ```bash
   docker build -t syllab .
   docker run -p 3000:3000 syllab
   ```
3. Verifique variáveis de ambiente

---

## ✨ Pronto!

Seu sistema Syllab está pronto para produção! 🚀

**Próximos passos após deploy**:
1. Criar primeiro usuário admin
2. Configurar instituições
3. Cadastrar professores
4. Testar upload de arquivos
5. Criar conteúdos
6. Compartilhar link com alunos

**URL final**: `https://syllab.seudominio.easypanel.host` 🎉
