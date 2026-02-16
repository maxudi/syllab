# 🔗 Sistema de Múltiplos Vínculos - Professor e Instituições

## 📋 Resumo

Implementado sistema que permite um professor lecionar em múltiplas instituições, resolvendo o problema onde professores não apareciam na listagem ao criar disciplinas.

## 🎯 O Problema

- Um professor só podia estar vinculado a UMA instituição
- Ao criar disciplina, o professor não aparecia na lista
- Não havia flexibilidade para professores que lecionam em várias instituições

## ✅ A Solução

### 1. **Nova Tabela de Relacionamento N:N**

Criada tabela `syllab_professor_instituicoes` que permite:
- Um professor estar em várias instituições
- Uma instituição ter vários professores
- Campos extras: cargo, data_inicio, data_fim, ativo

### 2. **Vínculo Automático**

Ao criar uma disciplina:
1. Professor seleciona a instituição
2. Sistema verifica se já existe vínculo
3. Se não existe, cria automaticamente
4. Professor recebe confirmação

### 3. **Página de Gerenciamento**

Nova página `/professor/meus-vinculos`:
- Lista todas instituições vinculadas
- Permite adicionar novos vínculos manualmente
- Permite desvincular de instituições
- Mostra cargo e data de início

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:

1. **`database/migracao-professor-multiplas-instituicoes.sql`**
   - Cria tabela `syllab_professor_instituicoes`
   - Migra dados existentes
   - Cria view `v_professores_instituicoes`
   - Políticas RLS
   - Funções helper

2. **`app/professor/meus-vinculos/page.tsx`**
   - Interface para gerenciar vínculos
   - Adicionar/remover vínculos
   - Lista instituições vinculadas

### Arquivos Modificados:

3. **`app/professor/disciplinas/page.tsx`**
   - Função `vincularProfessorInstituicao()` adicionada
   - Ao criar disciplina, vincula automaticamente
   - Botão "Meus Vínculos" no header

## 🚀 Como Usar

### Passo 1: Execute a Migração

No SQL Editor do Supabase:
```bash
database/migracao-professor-multiplas-instituicoes.sql
```

Isso irá:
- ✅ Criar nova tabela
- ✅ Migrar dados existentes
- ✅ Configurar políticas RLS
- ✅ Criar funções auxiliares

### Passo 2: Criar Disciplina

1. Acesse `/professor/disciplinas`
2. Clique em "Adicionar Disciplina"
3. Selecione a instituição
4. Preencha os dados
5. Salve

**Resultado:** Você será automaticamente vinculado à instituição!

### Passo 3: Gerenciar Vínculos (Opcional)

1. Acesse `/professor/meus-vinculos`
2. Veja todas suas instituições
3. Adicione novos vínculos manualmente
4. Remova vínculos não utilizados

## 🔄 Estrutura do Banco

### Antes (1:1)
```
syllab_professores
├── id
├── nome
├── email
├── instituicao_id ← Só uma instituição!
└── user_id
```

### Depois (N:N)
```
syllab_professores         syllab_professor_instituicoes         syllab_instituicoes
├── id                     ├── id                                 ├── id
├── nome            ┌─────→├── professor_id                       ├── nome
├── email           │      ├── instituicao_id ←─────┐            ├── sigla
├── (instituicao_id)│      ├── cargo                │            └── ...
└── user_id         │      ├── data_inicio          │
                    │      ├── data_fim             │
                    └──────├── ativo                └────────────────────
                           └── ...
```

## 📊 View Helper

A view `v_professores_instituicoes` facilita consultas:

```sql
SELECT * FROM v_professores_instituicoes
WHERE professor_id = 'id-do-professor';
```

Retorna todas instituições do professor com dados completos.

## 🔐 Segurança

Todas as políticas RLS foram criadas:
- `SELECT` - Todos autenticados
- `INSERT`, `UPDATE`, `DELETE` - Permissivo (desenvolvimento)

**Produção:** Ajuste as políticas para:
```sql
-- Exemplo: Professor só gerencia seus próprios vínculos
CREATE POLICY "Professor gerencia próprios vínculos"
ON syllab_professor_instituicoes
FOR ALL
USING (professor_id IN (
  SELECT id FROM syllab_professores 
  WHERE user_id = auth.uid()
));
```

## 🛠️ Funções SQL Disponíveis

### Vincular Professor
```sql
SELECT vincular_professor_instituicao(
  'professor-id',
  'instituicao-id',
  'Professor Titular' -- cargo opcional
);
```

### Desvincular Professor
```sql
SELECT desvincular_professor_instituicao(
  'professor-id',
  'instituicao-id'
);
```

## 📱 Interfaces

### Página Meus Vínculos
![Meus Vínculos](docs/meus-vinculos.png)

Funcionalidades:
- ✅ Lista todas instituições vinculadas
- ✅ Adicionar novo vínculo
- ✅ Remover vínculo
- ✅ Ver cargo e data de início
- ✅ Filtrar instituições já vinculadas

### Página Disciplinas (Atualizada)
![Disciplinas](docs/disciplinas.png)

Novo comportamento:
- ✅ Botão "Meus Vínculos" visível
- ✅ Vínculo automático ao criar disciplina
- ✅ Mensagem de confirmação

## 🔍 Verificações

### Ver Vínculos de um Professor
```sql
SELECT 
  p.nome as professor,
  i.nome as instituicao,
  pi.cargo,
  pi.data_inicio
FROM syllab_professor_instituicoes pi
JOIN syllab_professores p ON pi.professor_id = p.id
JOIN syllab_instituicoes i ON pi.instituicao_id = i.id
WHERE pi.ativo = true
  AND p.email = 'email@professor.com';
```

### Ver Professores de uma Instituição
```sql
SELECT 
  p.nome,
  p.email,
  pi.cargo
FROM syllab_professor_instituicoes pi
JOIN syllab_professores p ON pi.professor_id = p.id
WHERE pi.instituicao_id = 'id-da-instituicao'
  AND pi.ativo = true;
```

## 🎯 Benefícios

1. **Flexibilidade Total**
   - Professor leciona em quantas instituições quiser
   - Fácil adicionar/remover vínculos

2. **Automação**
   - Vínculo criado automaticamente ao criar disciplina
   - Menos cliques, mais produtividade

3. **Rastreabilidade**
   - Data de início e fim de vínculo
   - Histórico de instituições (ativo/inativo)
   - Campo cargo para organização

4. **Escalabilidade**
   - Suporta qualquer número de vínculos
   - Performance com índices otimizados

## 🐛 Troubleshooting

### "Professor não aparece na lista"
**Solução:** Execute a migração e certifique-se de ter instituições cadastradas

### "Erro ao vincular"
**Solução:** Verifique políticas RLS executando:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'syllab_professor_instituicoes';
```

### "Vínculo já existe"
**Normal!** O sistema detecta e não duplica. Use a página "Meus Vínculos" para gerenciar.

## 📚 Próximos Passos

Sugestões de melhorias futuras:

1. **Aprovação de Vínculos**
   - Coordenador aprova vínculo de professor

2. **Período Letivo**
   - Vincular professor a semestre específico

3. **Permissões por Vínculo**
   - Definir o que professor pode fazer em cada instituição

4. **Relatórios**
   - Dashboard com estatísticas de vínculos
   - Carga horária por instituição

---

**Status:** ✅ Implementado e Testado  
**Versão:** 2.0  
**Data:** Fevereiro 2026
