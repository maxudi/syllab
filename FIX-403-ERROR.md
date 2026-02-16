# Como Corrigir o Erro 403 ao Criar Conteúdo

## Problema

Ao tentar criar conteúdo na área do professor, aparece o erro:
```
Failed to load resource: the server responded with a status of 403 ()
Erro ao criar conteúdo
```

## Causa

O erro 403 (Forbidden) indica que as **políticas RLS (Row Level Security)** do Supabase estão bloqueando a operação de INSERT na tabela `syllab_conteudos`.

## Solução

### Passo 1: Verificar o Problema

Acesse a página de verificação para confirmar quais permissões estão faltando:
```
http://localhost:3001/check-rls
```

Clique em "Verificar Agora" e veja quais testes falharam.

### Passo 2: Executar o Script de Correção

1. **Abra o arquivo** `database/fix-rls-permissions.sql` no VS Code

2. **Copie todo o conteúdo** do arquivo (Ctrl+A, Ctrl+C)

3. **Acesse o Supabase:**
   - Vá para https://supabase.com/dashboard
   - Faça login se necessário
   - Selecione seu projeto

4. **Abra o SQL Editor:**
   - No menu lateral esquerdo, clique em **SQL Editor** (ícone de banco de dados)
   - Clique em **+ New query** para criar uma nova consulta

5. **Cole e Execute:**
   - Cole o conteúdo copiado no editor
   - Clique no botão **Run** (ou pressione Ctrl+Enter)
   - Aguarde a mensagem de sucesso

### Passo 3: Verificar se Funcionou

1. Volte para `http://localhost:3001/check-rls`
2. Clique em "Verificar Agora" novamente
3. Todos os testes devem aparecer como ✓ OK

### Passo 4: Testar Criar Conteúdo

1. Acesse `http://localhost:3001/professor`
2. Selecione uma disciplina
3. Clique em "Adicionar Conteúdo"
4. Preencha o formulário
5. Clique em "Salvar"

Agora deve funcionar! 🎉

## O Que o Script Faz?

O script `fix-rls-permissions.sql`:

1. **Remove políticas antigas** que podem estar mal configuradas
2. **Cria novas políticas PERMISSIVAS** para desenvolvimento:
   - Permite INSERT em conteúdos
   - Permite UPDATE em conteúdos
   - Permite DELETE em conteúdos
   - Permite INSERT em professores

3. **Exibe as políticas ativas** para você verificar

## Políticas Criadas

```sql
-- INSERT em conteúdos
CREATE POLICY "Permitir inserir conteúdos - DESENVOLVIMENTO"
ON syllab_conteudos FOR INSERT WITH CHECK (true);

-- UPDATE em conteúdos
CREATE POLICY "Permitir atualizar conteúdos - DESENVOLVIMENTO"
ON syllab_conteudos FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE em conteúdos
CREATE POLICY "Permitir deletar conteúdos - DESENVOLVIMENTO"
ON syllab_conteudos FOR DELETE USING (true);
```

## Ainda Não Funciona?

Se após executar o script o erro persistir:

### 1. Verificar Console do Navegador

Abra o console (F12) e tente criar um conteúdo. Você verá logs detalhados como:

```
=== CRIAR/ATUALIZAR CONTEÚDO ===
Dados do formulário: {...}
Disciplina selecionada: ...
Criando novo conteúdo...
Resposta do INSERT: {...}
```

### 2. Verificar Erros Específicos

O console agora mostra:
- **Código do erro:** Para identificar o tipo específico
- **Mensagem:** Descrição do problema
- **Detalhes:** Informações adicionais
- **Hint:** Sugestões do Supabase

### 3. Problemas Comuns

#### "new row violates row-level security policy"
- O script não foi executado ou falhou
- Execute o script novamente no SQL Editor
- Verifique se não há erros na execução

#### "null value in column violates not-null constraint"
- Algum campo obrigatório está vazio
- Preencha todos os campos marcados com *

#### "Foreign key violation"
- A disciplina selecionada não existe
- Verifique se há disciplinas cadastradas

### 4. Verificar Manualmente no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **Table Editor**
3. Selecione a tabela `syllab_conteudos`
4. Tente inserir um registro manualmente
5. Se não conseguir, há um problema nas políticas

### 5. Recriar as Políticas

No SQL Editor do Supabase, execute:

```sql
-- Desabilitar RLS temporariamente (APENAS PARA TESTE!)
ALTER TABLE syllab_conteudos DISABLE ROW LEVEL SECURITY;

-- Tente criar um conteúdo agora

-- IMPORTANTE: Reabilite depois!
ALTER TABLE syllab_conteudos ENABLE ROW LEVEL SECURITY;

-- E execute o fix-rls-permissions.sql novamente
```

## Segurança em Produção

⚠️ **IMPORTANTE:** As políticas atuais são PERMISSIVAS e destinadas apenas ao desenvolvimento.

Antes de ir para produção, você DEVE:

1. Substituir as políticas permissivas por políticas baseadas em autenticação
2. Ver os exemplos comentados no `schema.sql`
3. Testar todas as permissões

Exemplo de política segura:

```sql
CREATE POLICY "Professores podem criar conteúdos"
ON syllab_conteudos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM syllab_disciplinas d
    JOIN syllab_professores p ON d.professor_id = p.id
    WHERE d.id = disciplina_id AND p.user_id = auth.uid()
  )
);
```

## Links Úteis

- [Documentação RLS do Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Postgres RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

## Suporte

Se nada disso resolver:

1. Compartilhe os logs do console (F12)
2. Compartilhe o resultado da página `/check-rls`
3. Compartilhe a resposta do script SQL no Supabase
4. Verifique se a tabela `syllab_conteudos` existe
