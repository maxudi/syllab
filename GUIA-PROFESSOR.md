# Sistema de Gerenciamento de Disciplinas e Conteúdos - Syllab

## 📋 Visão Geral

Sistema completo para professores gerenciarem:
- ✅ Instituições de Ensino
- ✅ Disciplinas
- ✅ Conteúdos das Disciplinas

## 🎯 Fluxo de Uso

### 1. Primeiro Acesso

Ao fazer login pela primeira vez, o sistema automaticamente:
- Cria seu perfil de professor vinculado à sua conta
- Vincula seu `user_id` do Supabase Auth ao registro na tabela `syllab_professores`

### 2. Cadastrar Instituição

**Rota:** `/professor/instituicoes`

Antes de criar disciplinas, cadastre a instituição onde você leciona:

1. Acesse "Instituições" no header ou menu
2. Clique em "Adicionar Instituição"
3. Preencha:
   - **Nome:** Nome completo da instituição (obrigatório)
   - **Sigla:** Abreviação (opcional)
   - **URL do Logo:** Link para o logo (opcional)
   - **Descrição:** Breve descrição (opcional)
4. Clique em "Salvar"

**Exemplo:**
```
Nome: Universidade Federal de Minas Gerais  
Sigla: UFMG
Descrição: Universidade pública federal localizada em Belo Horizonte
```

### 3. Cadastrar Disciplinas

**Rota:** `/professor/disciplinas`

Após ter pelo menos uma instituição cadastrada:

1. Acesse "Minhas Disciplinas"
2. Clique em "Adicionar Disciplina"
3. Preencha:
   - **Nome da Disciplina:** Nome completo (obrigatório)
   - **Código:** Código da disciplina (opcional, ex: CC101)
   - **Instituição:** Selecione da lista (obrigatório)
   - **Carga Horária:** Horas totais (opcional)
   - **Semestre:** Ex: 2024/1 (opcional)
   - **Ano:** Ano letivo (opcional)
   - **Cor do Tema:** Escolha uma cor para identificação visual
   - **Descrição:** Ementa ou descrição (opcional)
4. Clique em "Salvar"

**Exemplo:**
```
Nome: Introdução à Programação
Código: CC101
Instituição: UFMG
Carga Horária: 60
Semestre: 2024/2
Ano: 2024
Cor: #1e40af (azul)
Descrição: Fundamentos de lógica de programação e algoritmos
```

### 4. Gerenciar Conteúdos

**Rota:** `/professor`

Agora você pode adicionar conteúdos às suas disciplinas:

1. Na página principal, selecione uma disciplina
2. Clique em "Adicionar Conteúdo"
3. Preencha:
   - **Título:** Nome do conteúdo (obrigatório)
   - **Tipo:** Escolha entre:
     - **Documento Geral:** Materiais de apoio, PDFs, links
     - **Jornada de Aula:** Plano de aula, roteiro
     - **Avaliativo:** Provas, trabalhos, exercícios
   - **Descrição:** Detalhes do conteúdo
   - **Conteúdo de Texto:** Texto do material
   - **URL do Arquivo:** Link para arquivo externo
   - **Ordem:** Ordem de exibição
   - **Data Limite:** Para conteúdos avaliativos
4. Clique em "Salvar"

## 🔐 Segurança e Permissões

### Sistema de Vínculo Automático

Quando você faz login:
1. O sistema pega seu `user_id` do Supabase Auth
2. Verifica se existe um professor com esse `user_id`
3. Se não existir, cria automaticamente o registro
4. Todas as operações são vinculadas ao seu professor

### Filtros Automáticos

- **Disciplinas:** Você só vê suas próprias disciplinas
- **Conteúdos:** Filtra automaticamente pela disciplina selecionada
- **Instituições:** Pode ver todas, mas pode gerenciar qualquer uma (em desenvolvimento)

### Políticas RLS Atuais

⚠️ **IMPORTANTE:** As políticas atuais são permissivas para desenvolvimento.

Execute o script `database/fix-rls-permissions.sql` para obter:
- Permissão total para CRUD em todas as tabelas
- Ideal para desenvolvimento e testes
- **NÃO use em produção!**

## 📊 Estrutura de Dados

```
usuário (Supabase Auth)
    └── professor (syllab_professores)
            └── disciplinas (syllab_disciplinas)
                    └── conteúdos (syllab_conteudos)

instituições (syllab_instituicoes)
    └── disciplinas (relacionamento)
```

## 🚀 Começando

### 1. Execute o Script de Permissões

```sql
-- No SQL Editor do Supabase
-- Cole o conteúdo de: database/fix-rls-permissions.sql
-- Execute (Ctrl+Enter)
```

### 2. Faça Login

```
http://localhost:3001/auth/login
```

### 3. Cadastre uma Instituição

```
http://localhost:3001/professor/instituicoes
```

### 4. Cadastre Disciplinas

```
http://localhost:3001/professor/disciplinas
```

### 5. Adicione Conteúdos

```
http://localhost:3001/professor
```

## 📱 Navegação

### Menu Principal (Header)

- **Início:** Página inicial
- **Área do Professor:** Gerenciar conteúdos
- **Usuário Logado:** Mostra nome e botão de logout

### Área do Professor

- **Instituições:** Gerenciar instituições de ensino
- **Minhas Disciplinas:** Gerenciar suas disciplinas
- **Gerenciar Conteúdos:** Adicionar/editar materiais

## 🔄 Fluxo Completo de Uso

```
1. Login
   ↓
2. Sistema cria perfil de professor automaticamente
   ↓
3. Cadastrar Instituição (se necessário)
   ↓
4. Cadastrar Disciplinas
   ↓
5. Selecionar Disciplina
   ↓
6. Adicionar Conteúdos
   ↓
7. Editar/Excluir conforme necessário
```

## 🎨 Recursos Visuais

### Cards de Disciplinas

- **Borda colorida:** Usando a cor do tema escolhida
- **Código da disciplina:** Exibido em destaque
- **Informações:** Instituição, semestre, carga horária
- **Ações:** Editar e Excluir

### Cards de Conteúdos

- **Badge de tipo:** Identifica o tipo de conteúdo
- **Ordenação:** Por ordem definida
- **Datas:** Mostra data limite se houver
- **Ações:** Editar e Excluir

## ⚠️ Avisos Importantes

### Nenhuma Instituição

Se tentar criar disciplina sem instituição:
```
┌─────────────────────────────────────┐
│ ⚠️ Nenhuma instituição cadastrada   │
│ Antes de criar disciplinas, você    │
│ precisa cadastrar pelo menos uma    │
│ instituição.                        │
│ [Cadastrar Instituição]             │
└─────────────────────────────────────┘
```

### Nenhuma Disciplina

Se tentar gerenciar conteúdos sem disciplinas:
```
┌─────────────────────────────────────┐
│ ⚠️ Nenhuma disciplina cadastrada    │
│ Você precisa cadastrar suas         │
│ disciplinas antes de gerenciar      │
│ conteúdos.                          │
│ [Cadastrar Disciplinas]             │
└─────────────────────────────────────┘
```

## 🔧 Troubleshooting

### Erro 403 ao Criar

**Problema:** "Failed to load resource: 403"

**Solução:**
1. Execute `database/fix-rls-permissions.sql` no Supabase
2. Verifique em `/check-rls`
3. Veja `FIX-403-ERROR.md` para mais detalhes

### Professor não Criado

**Problema:** "Erro ao criar perfil de professor"

**Solução:**
1. Execute `fix-rls-permissions.sql`
2. Verifique se a política de INSERT em professores está ativa
3. Faça logout e login novamente

### Disciplinas não Aparecem

**Problema:** Lista vazia mesmo tendo cadastrado

**Solução:**
1. Verifique o console (F12)
2. Confirme que o `professor_id` está correto
3. Recarregue a página

## 📝 Próximos Passos (Produção)

Antes de colocar em produção:

1. **Substituir políticas RLS permissivas** por políticas baseadas em `auth.uid()`
2. **Implementar permissões específicas:**
   - Professores só editam suas próprias disciplinas
   - Professores só editam conteúdos de suas disciplinas
3. **Adicionar validações** no lado do servidor
4. **Implementar sistema de roles** (admin, professor, aluno)

## 🎓 Casos de Uso

### Professor de Múltiplas Instituições

Professor que leciona em várias instituições:
```
1. Cadastrar Instituição A
2. Cadastrar Instituição B
3. Criar disciplinas vinculadas à Instituição A
4. Criar disciplinas vinculadas à Instituição B
5. Gerenciar conteúdos de todas as disciplinas
```

### Professor com Múltiplas Turmas

Mesma disciplina em turmas diferentes:
```
Programação I - 2024/1 - Turma A
Programação I - 2024/1 - Turma B
Programação I - 2024/2 - Turma A
```

Cadastre como disciplinas separadas com semestres diferentes.

### Organização de Conteúdos

**Documentos Gerais:**
- Ementa da disciplina
- Bibliografia
- Normas da instituição

**Jornadas de Aula:**
- Aula 1: Introdução
- Aula 2: Variáveis e Tipos
- Aula 3: Estruturas de Controle

**Avaliativos:**
- Prova 1 (com data limite)
- Trabalho Final (com data limite)
- Lista de Exercícios

## 💡 Dicas

1. **Use códigos únicos** para disciplinas (ex: CC101, MAT201)
2. **Escolha cores diferentes** para cada disciplina
3. **Numere os conteúdos** usando o campo "ordem"
4. **Use descrições claras** para facilitar identificação
5. **Defina datas limite** para conteúdos avaliativos

## 🆘 Suporte

- **Documentação de Autenticação:** [AUTENTICACAO.md](AUTENTICACAO.md)
- **Fix Erro 403:** [FIX-403-ERROR.md](FIX-403-ERROR.md)
- **Troubleshooting Geral:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Verificação RLS:** `http://localhost:3001/check-rls`
- **Teste de Conexão:** `http://localhost:3001/test-connection`
