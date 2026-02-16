# Syllab - Documentação Completa do Projeto

## 📖 Visão Geral

Syllab é uma plataforma moderna de gestão de conteúdo acadêmico que permite aos alunos navegar de forma intuitiva através de Instituição → Professor → Disciplina, e aos professores gerenciar seus conteúdos de forma organizada.

## 🎯 Objetivos Alcançados

### ✅ Tarefa 1: Interface da Home Pública
**Localização:** `app/page.tsx`

**Implementações:**
- Landing page elegante com hero section
- Stepper visual indicando as 3 etapas de navegação
- Comboboxes encadeados que carregam dados dinamicamente:
  1. Seleção de Instituição
  2. Seleção de Professor (filtrado por instituição)
  3. Seleção de Disciplina (filtrado por professor)
- Skeleton loaders para melhor UX durante carregamento
- Design responsivo com muito white space
- Validações de estado (comboboxes desabilitados até seleção anterior)
- Botão de acesso à disciplina com ícone

### ✅ Tarefa 2: Dashboard da Disciplina
**Localização:** `app/disciplina/[id]/page.tsx`

**Implementações:**
- Header colorido com informações da disciplina
- Breadcrumb para navegação de volta
- 3 seções organizadas com cards:
  - **Documentos Gerais** (verde): Plano de aula, bibliografia, cronograma
  - **Jornada de Aulas** (azul): Aulas sequenciais numeradas
  - **Avaliativo** (laranja): Exercícios, trabalhos, provas
- Cards com hover effects suaves
- Ícones contextuais para cada tipo de conteúdo
- Download de arquivos anexos
- Display de data limite para atividades
- Estados vazios bem projetados

### ✅ Tarefa 3: Área do Professor
**Localização:** `app/professor/page.tsx`

**Implementações:**
- Seleção de disciplina para gerenciar
- Formulário completo de criação/edição de conteúdo
- Campos do formulário:
  - Título (obrigatório)
  - Tipo de conteúdo (dropdown com 3 opções)
  - Ordem de exibição
  - Descrição
  - Conteúdo textual
  - URL de arquivo
  - Data limite (para avaliativos)
- CRUD completo:
  - **Create**: Adicionar novo conteúdo
  - **Read**: Listar todos os conteúdos
  - **Update**: Editar conteúdo existente
  - **Delete**: Remover conteúdo (com confirmação)
- Badge colorido indicando tipo de conteúdo
- Botões de ação (editar/excluir) em cada card
- Estado vazio quando não há conteúdos

## 🗄️ Arquitetura do Banco de Dados

### Schema Completo
**Localização:** `database/schema.sql`

### Tabelas Implementadas

#### 1. syllab_instituicoes
```sql
- id (UUID, PK)
- nome (VARCHAR)
- sigla (VARCHAR)
- logo_url (TEXT)
- descricao (TEXT)
- ativo (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 2. syllab_professores
```sql
- id (UUID, PK)
- nome (VARCHAR)
- email (VARCHAR, UNIQUE)
- foto_url (TEXT)
- bio (TEXT)
- instituicao_id (FK → instituicoes)
- user_id (FK → auth.users)
- ativo (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 3. syllab_disciplinas
```sql
- id (UUID, PK)
- nome (VARCHAR)
- codigo (VARCHAR)
- descricao (TEXT)
- carga_horaria (INTEGER)
- semestre (VARCHAR)
- ano (INTEGER)
- professor_id (FK → professores)
- instituicao_id (FK → instituicoes)
- capa_url (TEXT)
- cor_tema (VARCHAR)
- ativo (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 4. syllab_conteudos
```sql
- id (UUID, PK)
- titulo (VARCHAR)
- descricao (TEXT)
- tipo (ENUM: documento_geral, jornada_aula, avaliativo)
- disciplina_id (FK → disciplinas)
- ordem (INTEGER)
- conteudo_texto (TEXT)
- arquivo_url (TEXT)
- arquivo_nome (VARCHAR)
- data_disponibilizacao (TIMESTAMP)
- data_limite (TIMESTAMP)
- ativo (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### Recursos Avançados

#### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Políticas de leitura pública para conteúdo ativo
- Políticas de escrita restritas a professores autenticados
- Professores só modificam seu próprio conteúdo

#### Triggers
- Atualização automática de `updated_at` em todas as tabelas

#### Índices
- Otimizações de performance em foreign keys e campos frequentemente consultados

## 🎨 Sistema de Design

### Paleta de Cores

#### Cores Base
- Background: #FFFFFF, #F8FAFC (slate-50)
- Texto: #0F172A (slate-900), #475569 (slate-600)
- Bordas: #E2E8F0 (slate-200)

#### Cores Primary
- Blue 600: #2563EB (ações principais)
- Blue 700: #1D4ED8 (hover states)
- Blue 100/50: Backgrounds suaves

#### Cores Secundárias
- Green 600: #16A34A (documentos gerais)
- Orange 600: #EA580C (avaliativos)
- Slate 100/200: Elementos secundários

### Componentes UI

#### Buttons
- **Variantes:** default, outline, ghost, secondary
- **Tamanhos:** sm, default, lg, icon
- **Estados:** hover, focus, disabled
- **Transições:** 200ms suaves

#### Cards
```tsx
<Card>           // Container principal
  <CardHeader>   // Título e descrição
    <CardTitle>
    <CardDescription>
  </CardHeader>
  <CardContent>  // Conteúdo principal
  </CardContent>
  <CardFooter>   // Ações (opcional)
  </CardFooter>
</Card>
```

#### Forms
- Input: campos de texto
- Textarea: textos longos
- Select: dropdown nativo
- Combobox: dropdown com busca
- Label: rótulos acessíveis

#### Feedback
- Skeleton: loading states
- EmptyState: estados vazios
- Hover effects: sombras suaves

### Princípios de Design

1. **Minimalismo**: Apenas elementos essenciais
2. **White Space**: Espaçamento generoso (p-6, p-8, mb-12)
3. **Hierarquia**: Tamanhos de fonte consistentes (text-4xl → text-sm)
4. **Consistência**: Padrões repetidos em toda aplicação
5. **Responsividade**: Mobile-first (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
6. **Acessibilidade**: ARIA labels, contraste adequado
7. **Performance**: lazy loading, otimizações de imagem

## 📁 Estrutura de Arquivos Detalhada

```
syllab/
│
├── app/                              # Next.js 15 App Router
│   ├── layout.tsx                   # Layout raiz (fonts, metadata)
│   ├── globals.css                  # Estilos globais + Tailwind
│   ├── page.tsx                     # ✨ Home Page (Tarefa 1)
│   ├── loading.tsx                  # Loading global
│   ├── not-found.tsx                # Página 404
│   │
│   ├── disciplina/
│   │   └── [id]/
│   │       └── page.tsx             # ✨ Dashboard Disciplina (Tarefa 2)
│   │
│   └── professor/
│       └── page.tsx                 # ✨ Área do Professor (Tarefa 3)
│
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx              # Botões com variantes
│   │   ├── card.tsx                # Cards (5 subcomponentes)
│   │   ├── combobox.tsx            # Dropdown com busca
│   │   ├── input.tsx               # Input de texto
│   │   ├── label.tsx               # Labels de formulário
│   │   ├── select.tsx              # Select nativo
│   │   ├── skeleton.tsx            # Loading placeholders
│   │   └── textarea.tsx            # Textarea
│   │
│   ├── header.tsx                   # Header global com navegação
│   └── skeletons.tsx                # Skeletons customizados
│
├── lib/
│   ├── supabase.ts                  # Cliente Supabase + Types
│   └── utils.ts                     # Função cn() para classNames
│
├── database/
│   ├── schema.sql                   # ✨ Schema completo do DB
│   └── seed.sql                     # Dados de exemplo
│
├── .env.local                       # Variáveis de ambiente
├── .env.local.example               # Template de env vars
├── .gitignore                       # Arquivos ignorados
├── next.config.js                   # Configuração Next.js
├── tailwind.config.ts               # Configuração Tailwind
├── tsconfig.json                    # Configuração TypeScript
├── postcss.config.mjs               # Configuração PostCSS
├── package.json                     # Dependências
├── README.md                        # Descrição básica
└── INSTALACAO.md                    # Guia completo de instalação
```

## 🔧 Tecnologias e Dependências

### Core
- **Next.js 15**: Framework React com App Router
- **React 18**: Biblioteca UI
- **TypeScript**: Type safety

### Estilização
- **Tailwind CSS 3.4**: Utility-first CSS
- **tailwindcss-animate**: Animações
- **class-variance-authority**: Variantes de componentes
- **clsx + tailwind-merge**: Merge de classes

### Backend
- **Supabase JS 2.39**: Cliente Supabase
- **PostgreSQL**: Banco de dados (via Supabase)

### Ícones
- **Lucide React**: Biblioteca de ícones moderna

### Dev Tools
- **ESLint**: Linting
- **Autoprefixer**: Prefixos CSS
- **PostCSS**: Transformação CSS

## 🚀 Fluxos de Navegação

### Fluxo do Aluno
```
1. Acessa Home (/)
   ↓
2. Seleciona Instituição
   ↓
3. Seleciona Professor (filtrado por instituição)
   ↓
4. Seleciona Disciplina (filtrado por professor)
   ↓
5. Clica em "Acessar Disciplina"
   ↓
6. Visualiza Dashboard (/disciplina/[id])
   - Documentos Gerais
   - Jornada de Aulas (em ordem)
   - Avaliativos (exercícios, provas)
   ↓
7. Pode fazer download de arquivos
8. Pode voltar à Home pelo breadcrumb
```

### Fluxo do Professor
```
1. Acessa "Área do Professor" (/professor)
   ↓
2. Seleciona uma Disciplina para gerenciar
   ↓
3. Visualiza lista de conteúdos cadastrados
   ↓
4. Opções disponíveis:
   
   A) Adicionar Novo Conteúdo
      → Clica "Adicionar Conteúdo"
      → Preenche formulário
      → Seleciona tipo (documento_geral / jornada_aula / avaliativo)
      → Define ordem de exibição
      → Salva
   
   B) Editar Conteúdo Existente
      → Clica ícone de editar
      → Formulário pré-preenchido
      → Modifica campos
      → Atualiza
   
   C) Excluir Conteúdo
      → Clica ícone de deletar
      → Confirma ação
      → Conteúdo removido
```

## 📊 Tipos de Conteúdo

### 1. Documento Geral (`documento_geral`)
**Cor:** Verde (#16A34A)
**Ícone:** FileText
**Uso:** 
- Plano de ensino
- Bibliografia
- Cronograma
- Documentação do curso
- Materiais de apoio gerais

### 2. Jornada de Aula (`jornada_aula`)
**Cor:** Azul (#2563EB)
**Ícone:** Calendar
**Uso:**
- Aula 1, Aula 2, Aula 3...
- Conteúdo sequencial
- Slides de aula
- Gravações de aula
- Material didático por aula

### 3. Avaliativo (`avaliativo`)
**Cor:** Laranja (#EA580C)
**Ícone:** ClipboardCheck
**Uso:**
- Exercícios
- Trabalhos
- Provas
- Atividades avaliativas
- Projetos
**Extra:** Pode ter data limite

## 🔐 Segurança

### Row Level Security (RLS)

#### Leitura Pública
Todos os usuários (mesmo não autenticados) podem:
- Ver instituições ativas
- Ver professores ativos
- Ver disciplinas ativas
- Ver conteúdos ativos

#### Escrita Restrita
Apenas professores autenticados podem:
- Atualizar seu próprio perfil
- Criar disciplinas para si
- Atualizar suas disciplinas
- Criar conteúdos em suas disciplinas
- Atualizar conteúdos de suas disciplinas
- Deletar conteúdos de suas disciplinas

### Variáveis de Ambiente
```bash
NEXT_PUBLIC_SUPABASE_URL=       # URL pública do Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Chave anônima (segura para client)
```

⚠️ **IMPORTANTE:** Nunca exponha a service_role_key no client-side!

## 🎓 Casos de Uso Reais

### Cenário 1: Aluno Novo
Maria é uma aluna nova da UFE. Ela acessa o Syllab pela primeira vez:
1. Vê a home elegante explicando o sistema
2. Seleciona "Universidade Federal de Exemplo"
3. Lista de professores aparece → seleciona "Dr. Carlos Silva"
4. Lista de disciplinas aparece → seleciona "Programação Orientada a Objetos"
5. Acessa dashboard da disciplina
6. Baixa o plano de ensino em "Documentos Gerais"
7. Visualiza as 8 aulas em "Jornada de Aulas"
8. Vê os exercícios e prazos em "Avaliativo"

### Cenário 2: Professor Adicionando Conteúdo
Dr. Carlos precisa adicionar uma nova aula:
1. Acessa "Área do Professor"
2. Seleciona "Programação Orientada a Objetos"
3. Clica "Adicionar Conteúdo"
4. Preenche:
   - Título: "Aula 9 - Design Pattern Observer"
   - Tipo: Jornada de Aula
   - Ordem: 9
   - Descrição: "Padrão Observer para eventos"
   - Conteúdo: [texto detalhado da aula]
   - URL Arquivo: [link para slides]
5. Salva
6. Conteúdo aparece na lista e ficará visível para alunos

### Cenário 3: Professor Criando Atividade
Profa. Ana quer criar um exercício com prazo:
1. Acessa área do professor
2. Seleciona "Engenharia de Software"
3. Clica "Adicionar Conteúdo"
4. Preenche:
   - Título: "Exercício 2 - Diagrama de Classes"
   - Tipo: Avaliativo
   - Ordem: 2
   - Descrição: "Criar diagrama UML"
   - Conteúdo: [enunciado detalhado]
   - Data Limite: 2026-03-01
5. Salva
6. Alunos veem o exercício com prazo destacado

## 🚢 Deploy

### Preparação
1. Código no GitHub: https://github.com/maxudi/syllab.git
2. Banco de dados Supabase configurado e populado
3. Variáveis de ambiente definidas

### Easypanel - Passo a Passo
1. Criar novo projeto no Easypanel
2. Conectar ao repositório GitHub
3. Configurar:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Port:** 3000
4. Adicionar variáveis de ambiente
5. Deploy!

### Pós-Deploy
- Testar todas as rotas
- Verificar conexão com Supabase
- Confirmar imagens e assets carregando
- Testar responsividade

## 🧪 Testando o Sistema

### Teste 1: Navegação Completa
```
1. Acesse a home
2. Selecione "UFE"
3. Selecione "Dr. Carlos Silva"
4. Selecione "Programação Orientada a Objetos"
5. Clique "Acessar Disciplina"
6. Verifique se aparecem 3 seções
7. Confirme que há conteúdos em cada seção
```

### Teste 2: Área do Professor
```
1. Acesse /professor
2. Selecione uma disciplina
3. Clique "Adicionar Conteúdo"
4. Preencha o formulário
5. Salve
6. Verifique se apareceu na lista
7. Edite o conteúdo
8. Exclua o conteúdo
```

### Teste 3: Responsividade
```
1. Teste em mobile (< 768px)
2. Teste em tablet (768px - 1024px)
3. Teste em desktop (> 1024px)
4. Verifique grid adaptativo
5. Confirme navegação funcional
```

## 📈 Métricas de Qualidade

### Performance
- ✅ Lazy loading de componentes
- ✅ Otimização de queries Supabase
- ✅ Skeleton loaders (UX)
- ✅ Next.js 15 App Router (RSC)

### Acessibilidade
- ✅ Navegação por teclado
- ✅ ARIA labels
- ✅ Contraste adequado (WCAG AA)
- ✅ Foco visível

### Code Quality
- ✅ TypeScript strict mode
- ✅ Componentes reutilizáveis
- ✅ Separação de concerns
- ✅ Nomenclatura consistente

## 🎯 Resultado Final

### Entregues
- ✅ Script SQL completo com seed data
- ✅ Estrutura Next.js 15 configurada
- ✅ Home Page elegante com steppers
- ✅ Dashboard da disciplina organizado
- ✅ Área do professor funcional
- ✅ Design minimalista profissional
- ✅ Componentes shadcn/ui
- ✅ Integração Supabase
- ✅ RLS e segurança
- ✅ Documentação completa

### Diferenciais
- Skeleton loaders
- Estados vazios bem projetados
- Página 404 customizada
- Loading states globais
- Hover effects sutis
- Breadcrumbs de navegação
- Badge de tipos de conteúdo
- Confirmação antes de deletar
- Formulário com validações
- Design responsivo

---

**Desenvolvido com ❤️ usando Next.js 15, TypeScript, Tailwind CSS e Supabase**
