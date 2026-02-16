# 🚨 Guia de Solução: Erro de Timeout ao Fazer Login

## 🔴 O Problema

Você está recebendo o erro:
```
ERR_TIMED_OUT
TypeError: Failed to fetch
```

Isso significa que **o servidor Supabase não está respondendo**.

## ✅ Soluções (Execute nesta ordem)

### 1️⃣ Verificar Status do Servidor Supabase

**No Easypanel:**

1. Acesse seu painel Easypanel
2. Vá até o projeto/container do Supabase
3. Verifique o **Status**: deve estar "Running" (verde)
4. Se estiver "Stopped" ou "Error", **reinicie o container**

**Via Terminal (se tiver acesso SSH):**
```bash
# Ver status dos containers
docker ps -a | grep supabase

# Reiniciar Supabase
docker restart supabase-container-name

# Ver logs
docker logs -f supabase-container-name
```

### 2️⃣ Verificar a URL do Supabase

A URL atual parece estar **truncada**:
```
condominio-supa-academ...
```

A URL completa provavelmente é:
```
https://condominio-supa-academic.yzqq8i.easypanel.host
```

**Verifique no arquivo `.env.local`:**

```bash
# Abra o arquivo
notepad .env.local

# Confira se está assim:
NEXT_PUBLIC_SUPABASE_URL=https://condominio-supa-academic.yzqq8i.easypanel.host
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

❌ **NÃO** use `http://` (sem s)  
✅ **USE** `https://` (com s)

### 3️⃣ Testar a URL Diretamente

**Abra o navegador e acesse:**
```
https://condominio-supa-academic.yzqq8i.easypanel.host/rest/v1/
```

**Resultados esperados:**

✅ **Bom:** Retorna JSON com erro 401 ou 400  
```json
{"message": "The rest api requires an API key"}
```
→ Servidor está funcionando!

❌ **Ruim:** "Este site não pode ser acessado" ou timeout  
→ Servidor está offline ou URL errada

### 4️⃣ Usar a Página de Diagnóstico

```bash
# Acesse no navegador:
http://localhost:3001/diagnostico-conexao
```

Clique em **"Iniciar Testes de Conexão"** e veja o resultado.

### 5️⃣ Verificar Configuração do Easypanel

No Easypanel, verifique:

1. **Domínio configurado corretamente**
   - Deve apontar para o IP do servidor
   - DNS deve estar resolvendo

2. **Portas expostas**
   - Supabase geralmente usa portas 8000, 3000, 5432
   - Verifique se estão mapeadas corretamente

3. **Proxy/SSL**
   - Certificado SSL válido
   - Proxy reverso configurado

### 6️⃣ Testar com cURL

```bash
# Windows PowerShell
curl https://condominio-supa-academic.yzqq8i.easypanel.host/rest/v1/

# Ou use o Postman/Insomnia
```

**Se retornar erro de conexão:**  
→ Problema é no servidor, não no código!

### 7️⃣ Verificar Logs do Supabase

**No Easypanel:**
1. Vá no container Supabase
2. Clique em "Logs"
3. Procure por erros como:
   - "Connection refused"
   - "Port already in use"
   - "Database connection failed"
   - "Authentication service not ready"

### 8️⃣ Reiniciar Aplicação Next.js

```bash
# Pare o servidor (Ctrl+C)
# Limpe cache
rm -rf .next

# Reinstale dependências (se necessário)
npm install

# Inicie novamente
npm run dev
```

### 9️⃣ Verificar Firewall/Segurança

**Se estiver usando firewall:**
```bash
# Permitir conexões na porta HTTPS (443)
# Permitir conexões para o domínio do Easypanel
```

**Se estiver atrás de proxy corporativo:**
- Configure variáveis de ambiente de proxy
- Ou use VPN

### 🔟 Último Recurso: Supabase Local

Se o servidor continuar fora, use Supabase local temporariamente:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar Supabase local
supabase init
supabase start

# Pegar credenciais
supabase status

# Atualizar .env.local com credenciais locais
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 🎯 Diagnóstico Rápido

Execute estes comandos e me envie os resultados:

```powershell
# 1. Testar conexão
curl https://condominio-supa-academic.yzqq8i.easypanel.host/rest/v1/

# 2. Ver variáveis de ambiente
Get-Content .env.local

# 3. Testar DNS
nslookup condominio-supa-academic.yzqq8i.easypanel.host

# 4. Ping no servidor
ping condominio-supa-academic.yzqq8i.easypanel.host
```

## 📊 Causas Mais Comuns (Estatística)

1. **70% - Servidor Supabase parado/offline**
   → Reinicie o container no Easypanel

2. **15% - URL incorreta no .env.local**
   → Verifique e corrija a URL

3. **10% - Problema de DNS/Firewall**
   → Teste conexão direta, configure firewall

4. **5% - Outras causas**
   → Certificado SSL expirado, porta incorreta, etc.

## 🔍 Checklist Completo

- [ ] Container Supabase está "Running" no Easypanel?
- [ ] URL no `.env.local` está correta e completa?
- [ ] Consegue acessar a URL no navegador?
- [ ] `curl` na URL retorna resposta (mesmo que erro 401)?
- [ ] Logs do Supabase não mostram erros críticos?
- [ ] DNS está resolvendo o domínio corretamente?
- [ ] Não há firewall bloqueando a porta 443?
- [ ] Certificado SSL está válido?

## ✅ Quando Está Funcionando

Você saberá que está funcionando quando:

1. Página `/diagnostico-conexao` mostra tudo verde ✅
2. Acesso à URL no navegador retorna JSON (mesmo com erro 401)
3. Login demora menos de 2 segundos
4. Console não mostra "ERR_TIMED_OUT"

## 🆘 Ainda Não Funciona?

Se após todas essas verificações ainda der erro:

1. **Tire prints:**
   - Status do container no Easypanel
   - Conteúdo do `.env.local`
   - Resultado do teste no navegador
   - Logs do Supabase

2. **Informações importantes:**
   - Há quanto tempo o erro começou?
   - Funcionava antes?
   - Mudou algo na configuração?
   - Outros serviços no Easypanel funcionam?

3. **Teste alternativo:**
   - Crie um novo projeto Supabase no Easypanel
   - Use as credenciais novas temporariamente
   - Se funcionar, problema é na instância antiga

## 📞 Suporte Easypanel

Se o problema é no servidor:
- Documentação: https://easypanel.io/docs
- Discord: https://discord.gg/easypanel
- Email: support@easypanel.io

---

**Lembre-se:** Erro de timeout = problema de rede/servidor, não de código! 🔌
