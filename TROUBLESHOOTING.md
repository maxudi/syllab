# Guia de Solução de Problemas - Login

## Problema: "Entrando..." fica travado

Se ao tentar fazer login o botão fica em "Entrando..." e nada acontece, siga estes passos:

### 1. Verificar Console do Navegador

Abra o Console do Navegador (F12) e verifique se há erros. Os logs de debug agora mostram:
- Se as variáveis de ambiente estão configuradas
- A resposta do Supabase
- Qualquer erro que ocorrer

### 2. Reiniciar o Servidor Next.js

**IMPORTANTE**: Sempre que alterar o arquivo `.env.local`, você DEVE reiniciar o servidor Next.js.

No terminal onde o servidor está rodando:
1. Pressione `Ctrl + C` para parar
2. Execute novamente:
   ```bash
   npm run dev
   ```

### 3. Verificar Variáveis de Ambiente

Confirme que o arquivo `.env.local` existe na raiz do projeto e contém:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 4. Testar Conexão

Acesse a página de teste de conexão:
```
http://localhost:3000/test-connection
```

Esta página mostra:
- ✓ Se as variáveis de ambiente estão configuradas
- ✓ Se a conexão com o Supabase está funcionando
- ✓ Se consegue fazer queries no banco
- ✓ Status do sistema de autenticação

### 5. Criar Usuário de Teste

Se a conexão estiver OK mas o login falhar, pode ser que o usuário não exista. Acesse:
```
http://localhost:3000/auth/signup
```

E crie uma nova conta de teste.

### 6. Verificar Configuração do Supabase

No painel do Supabase (https://supabase.com):

1. **Authentication > Settings**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: Adicione `http://localhost:3000/**`

2. **Authentication > Providers**:
   - Email provider deve estar habilitado
   - "Confirm email" pode ser desabilitado para testes

3. **SQL Editor**:
   - Execute o schema.sql se ainda não executou
   - Verifique se as tabelas existem

### 7. Verificar Políticas RLS

Se você modificou as políticas RLS no banco, pode estar bloqueando o login. No SQL Editor do Supabase, execute:

```sql
-- Verificar se RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'syllab_%';

-- Ver políticas ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public';
```

### 8. Erros Comuns

#### "Invalid login credentials"
- Email ou senha incorretos
- Usuário não existe - crie uma conta primeiro
- Email não foi confirmado (se confirmação estiver ativa)

#### "Failed to fetch"
- Servidor Next.js não está rodando
- URL do Supabase incorreta no .env.local
- Problema de rede/firewall

#### Variáveis de ambiente não carregam
- Arquivo .env.local não está na raiz do projeto
- Servidor Next.js não foi reiniciado após alterar .env.local
- Nome das variáveis está errado (deve começar com NEXT_PUBLIC_)

### 9. Limpar Cache

Se nada funcionar, tente limpar o cache:

```bash
# Parar o servidor (Ctrl+C)
# Deletar pasta .next
rm -rf .next

# Ou no Windows PowerShell:
Remove-Item -Recurse -Force .next

# Reiniciar
npm run dev
```

### 10. Verificar Logs

Com as melhorias implementadas, agora você verá logs detalhados:

**No Console do Navegador (F12):**
```
Tentando fazer login com: usuario@email.com
Supabase URL configurada: Sim
auth.ts: Iniciando signIn
auth.ts: Resposta do Supabase: { hasData: true, hasUser: true, ... }
Login bem-sucedido, redirecionando...
```

**Se houver erro, você verá:**
```
auth.ts: Erro do Supabase: Invalid login credentials
```

## Checklist Rápido

- [ ] Arquivo .env.local existe e está correto
- [ ] Servidor Next.js foi reiniciado após alterar .env.local
- [ ] Console do navegador está aberto (F12) para ver erros
- [ ] Página /test-connection mostra tudo OK
- [ ] Usuário foi criado via /auth/signup
- [ ] Supabase está configurado corretamente

## Ainda não funciona?

Se após seguir todos os passos ainda não funcionar:

1. Compartilhe os logs do console do navegador
2. Compartilhe o resultado da página /test-connection
3. Verifique se consegue acessar a URL do Supabase diretamente no navegador
4. Tente criar um novo projeto no Supabase e usar as novas credenciais
