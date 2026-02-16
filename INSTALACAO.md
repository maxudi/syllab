# Guia de Instalação e Uso - Syllab

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta Supabase (já configurada)
- Git instalado

## 🚀 Instalação

### 1. Clonar o repositório (se já estiver no Git)
```bash
git clone https://github.com/maxudi/syllab.git
cd syllab
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
O arquivo `.env.local` já está configurado com as credenciais do Supabase. Se precisar recriar:

```bash
cp .env.local.example .env.local
```

### 4. Configurar o banco de dados
Execute o script SQL em seu Supabase:

1. Acesse: https://condominio-supa-academic.yzqq8i.easypanel.host
2. Vá em "SQL Editor"
3. Cole e execute o conteúdo de `database/schema.sql`

### 5. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
syllab/
├── app/                        # Next.js App Router
│   ├── page.tsx               # 🏠 Home Page (seleção de instituição/professor/disciplina)
│   ├── layout.tsx             # Layout principal
│   ├── globals.css            # Estilos globais
│   ├── disciplina/            
│   │   └── [id]/
│   │       └── page.tsx       # 📚 Dashboard da Disciplina
│   └── professor/
│       └── page.tsx           # 👨‍🏫 Área do Professor
│
├── components/                 # Componentes React
│   ├── ui/                    # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── combobox.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   └── textarea.tsx
│   ├── header.tsx             # Header global
│   └── skeletons.tsx          # Loading states
│
├── lib/                       # Utilitários
│   ├── supabase.ts           # Cliente Supabase + Types
│   └── utils.ts              # Funções auxiliares
│
├── database/                  # Scripts SQL
│   └── schema.sql            # Schema completo do banco
│
└── [arquivos de config]       # next.config.js, tailwind.config.ts, etc.
```

## 🎯 Funcionalidades Implementadas

### ✅ Tarefa 1: Interface da Home Pública
- Landing page com fluxo de seleção em etapas
- Steppers visuais indicando progresso
- Comboboxes encadeados (Instituição → Professor → Disciplina)
- Design minimalista com muito white space
- Skeleton loaders durante carregamento

**Arquivo:** `app/page.tsx`

### ✅ Tarefa 2: Dashboard da Disciplina
- Visualização organizada em 3 grupos de cards:
  - **Documentos Gerais** (verde): Plano de aula, documentação
  - **Jornada de Aulas** (azul): Aulas em ordem cronológica
  - **Avaliativo** (laranja): Exercícios, trabalhos, atividades
- Cards com hover effects sutis
- Download de arquivos anexos
- Breadcrumb para navegação

**Arquivo:** `app/disciplina/[id]/page.tsx`

### ✅ Tarefa 3: Área do Professor
- Interface para gerenciar conteúdos das disciplinas
- Formulário para criar/editar conteúdos
- Seleção do tipo de conteúdo (3 grupos)
- CRUD completo (Create, Read, Update, Delete)
- Organização por ordem
- Data limite para atividades

**Arquivo:** `app/professor/page.tsx`

## 🗄️ Banco de Dados

### Tabelas Criadas (todas com prefixo `syllab_`)

1. **syllab_instituicoes** - Instituições de ensino
2. **syllab_professores** - Professores vinculados às instituições
3. **syllab_disciplinas** - Disciplinas ministradas pelos professores
4. **syllab_conteudos** - Conteúdos das disciplinas (3 tipos)

### Tipos de Conteúdo
- `documento_geral` - Documentos gerais da disciplina
- `jornada_aula` - Aulas sequenciais
- `avaliativo` - Atividades avaliativas

### Segurança
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso configuradas:
  - Leitura pública para conteúdo ativo
  - Escrita apenas para professores autenticados
  - Professores só modificam seu próprio conteúdo

## 🎨 Design System

### Paleta de Cores
- **Base:** Slate/Zinc (tons neutros)
- **Primary:** Blue 600-700 (azul profundo)
- **Accent:** Green 600 (documentos), Orange 600 (avaliativos)

### Componentes UI (shadcn/ui)
- Button (variantes: default, outline, ghost, secondary)
- Card (com hover effects)
- Input & Textarea
- Select & Combobox
- Skeleton (loading states)
- Label

### Diretrizes
- ✅ Minimalista e elegante
- ✅ Muito white space
- ✅ Transições suaves (hover, focus)
- ✅ Responsivo (mobile-first)
- ✅ Acessibilidade (ARIA labels)

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint
```

## 🚢 Deploy no Easypanel

### Configuração

1. No Easypanel, crie um novo projeto
2. Conecte ao repositório: https://github.com/maxudi/syllab.git
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Build command: `npm run build`
5. Start command: `npm start`
6. Port: `3000`

### Variáveis de Ambiente (Easypanel)
```
NEXT_PUBLIC_SUPABASE_URL=https://condominio-supa-academic.yzqq8i.easypanel.host
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
```

## 📝 Próximos Passos (Opcionais)

- [ ] Implementar autenticação de professores
- [ ] Upload de arquivos (storage Supabase)
- [ ] Busca e filtros avançados
- [ ] Sistema de notificações
- [ ] Modo escuro
- [ ] Comentários em conteúdos
- [ ] Analytics do professor

## 🐛 Troubleshooting

### Erro ao conectar com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o Supabase está acessível
- Verifique as políticas RLS no Supabase

### Página em branco
- Verifique o console do navegador para erros
- Confirme que o banco de dados tem dados de exemplo
- Execute `npm run dev` novamente

### Erros de build
- Limpe o cache: `rm -rf .next`
- Reinstale dependências: `rm -rf node_modules && npm install`
- Verifique a versão do Node.js (deve ser 18+)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs no console
2. Consulte a documentação do Next.js: https://nextjs.org/docs
3. Consulte a documentação do Supabase: https://supabase.com/docs

---

**Desenvolvido com ❤️ para facilitar a gestão acadêmica**
