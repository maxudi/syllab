# 🚀 Início Rápido - Módulo Admin

## ⚡ 3 Passos para Começar

### 1️⃣ Execute a Migração do Banco

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo `database/add-admin-module.sql`
4. **Copie todo o conteúdo**
5. Cole no SQL Editor
6. **IMPORTANTE:** Antes de executar, desça até o final do script e encontre:

```sql
/*
INSERT INTO syllab_administradores (user_id, nome, email, super_admin, ativo)
SELECT 
  id as user_id,
  COALESCE(raw_user_meta_data->>'name', email) as nome,
  email,
  true as super_admin,
  true as ativo
FROM auth.users
WHERE email = 'seu-email@exemplo.com' -- ⚠️ SUBSTITUA AQUI
ON CONFLICT (user_id) DO NOTHING;
*/
```

7. **Descomente este bloco** (remova `/*` e `*/`)
8. **Substitua `'seu-email@exemplo.com'`** pelo email que você usa para fazer login
9. Clique em **RUN** para executar

---

### 2️⃣ Faça Login no Sistema

1. Acesse `http://localhost:3001`
2. Faça login com o email que você configurou como admin
3. Após o login, você verá no header:
   - Seu nome com um ícone de dropdown
   - Link "**Admin**" (em azul)

---

### 3️⃣ Teste as Funcionalidades

#### Como Admin:

1. **Clique em "Admin"** no header ou acesse `/admin/professores`
2. Você verá:
   - 📊 Dashboard com estatísticas
   - 🔍 Barra de busca
   - 📋 Lista de todos os professores
   
3. **Cadastre um novo professor:**
   - Clique em "**Novo Professor**"
   - Preencha os dados (nome, email, senha são obrigatórios)
   - Clique em "**Cadastrar Professor**"
   
4. **Edite um professor:**
   - Na lista, clique no botão de ✏️ **Editar**
   - Você pode:
     - Alterar dados pessoais
     - Adicionar foto (via URL)
     - Configurar token de IA
     - **Alterar senha** do professor
     - **Gerenciar instituições** vinculadas

#### Como Professor:

1. **Clique no seu nome** no header
2. No dropdown, selecione "**Meu Perfil**"
3. Você pode:
   - ✏️ Editar seus dados pessoais
   - 📷 Adicionar sua foto
   - 🔑 Alterar sua senha (requer confirmação)
   - 🏛️ **Adicionar-se a instituições**
   - ❌ Remover vínculos com instituições

---

## 🎯 Casos de Uso

### Caso 1: Cadastrar Novo Professor

```
Admin → /admin/professores → Novo Professor
↓
Preencher: Nome, Email, Senha
↓
[Cadastrar Professor]
↓
✅ Professor criado - pode fazer login imediatamente
```

### Caso 2: Professor Adiciona Instituição

```
Professor → Clica no nome → Meu Perfil
↓
Rola até "Minhas Instituições"
↓
Seleciona instituição disponível
↓
[Adicionar-me à Instituição]
↓
✅ Professor vinculado - disciplinas agora filtradas pela instituição
```

### Caso 3: Admin Configura Token IA

```
Admin → /admin/professores → Clica em ✏️ Editar
↓
Rola até "Token de IA"
↓
Cola o token (ex: sk-proj-abc123...)
↓
[Salvar Alterações]
↓
✅ Token configurado - aparece "Configurado" na lista
```

---

## ❗ Problemas Comuns

### Link "Admin" não aparece

**Solução:**
1. Verifique se executou o script SQL corretamente
2. Verifique se substituiu o email corretamente
3. Faça **logout e login novamente**
4. Execute no Supabase SQL Editor:
   ```sql
   SELECT * FROM syllab_administradores WHERE email = 'seu-email@exemplo.com';
   ```
   - Se não retornar nada, execute o INSERT manualmente

### Erro ao criar professor

**Causa comum:** Email já cadastrado

**Solução:**
- Use um email diferente
- Ou remova o usuário anterior no Supabase Auth Dashboard

### Instituições não aparecem

**Causa:** Não existem instituições cadastradas

**Solução:**
```sql
-- Inserir instituição de teste
INSERT INTO syllab_instituicoes (nome, sigla, cnpj, ativo)
VALUES ('Universidade Federal do Teste', 'UFT', '12.345.678/0001-90', true);
```

---

## 🔥 Dicas Rápidas

### ✅ Boas Práticas

- **Admin:** Configure o token de IA para cada professor que for usar IA
- **Professor:** Adicione pelo menos uma instituição para poder criar disciplinas
- **Admin:** Desative professores inativos em vez de deletar
- **Professor:** Use uma URL de foto com HTTPS para evitar erros de carregamento

### 🎨 Atalhos de Teclado

- No header: **Clique no nome** → Dropdown rápido
- Na busca: Digite para filtrar em tempo real
- Na lista: **Ícones grandes** para facilitar cliques

### 📱 Funciona em Mobile

- Layout responsivo
- Tabelas com scroll horizontal
- Botões grandes para facilitar toque

---

## 📞 Precisa de Ajuda?

### Verificar Logs

```sql
-- Ver todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'syllab_%';

-- Ver todos os admins
SELECT nome, email, super_admin, ativo 
FROM syllab_administradores;

-- Ver professores com foto
SELECT nome, foto_url 
FROM syllab_professores 
WHERE foto_url IS NOT NULL;

-- Ver professores com token IA
SELECT nome, LEFT(token_ia, 10) || '...' as token_preview
FROM syllab_professores 
WHERE token_ia IS NOT NULL;
```

---

## 🎓 Documentação Completa

Para informações detalhadas, consulte:
- **[MODULO-ADMIN.md](MODULO-ADMIN.md)** - Documentação completa do módulo
- **[DOCUMENTACAO_COMPLETA.md](DOCUMENTACAO_COMPLETA.md)** - Documentação geral do sistema

---

**🎉 Pronto! Você configurou o módulo de administração com sucesso!**

*Agora você pode gerenciar professores, instituições e tokens de IA de forma centralizada.*
