# Syllab 🎓

> Plataforma moderna de gestão de conteúdo acadêmico

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-gray?style=flat-square&logo=supabase)

## 📖 Sobre

Syllab é uma plataforma elegante que permite aos **alunos** navegar facilmente por **Instituição → Professor → Disciplina** e aos **professores** gerenciar seus conteúdos de forma organizada em três categorias:

- 📄 **Documentos Gerais** - Planos de aula, bibliografia, cronogramas
- 📅 **Jornada de Aulas** - Aulas sequenciais e materiais didáticos
- ✅ **Avaliativo** - Exercícios, trabalhos e provas

## ✨ Funcionalidades

### Para Alunos
- ✅ Navegação intuitiva com steppers visuais
- ✅ Visualização organizada de conteúdos
- ✅ Download de materiais
- ✅ Visualização de prazos de atividades
- ✅ Interface minimalista e responsiva
- 🎯 **NOVO**: Visualização de aulas com slides interativos

### Para Professores
- ✅ Gerenciamento completo de conteúdos (CRUD)
- ✅ Organização por tipo e ordem
- ✅ Definição de prazos para atividades
- ✅ Interface simples e eficiente
- ✅ Gerenciamento de instituições e disciplinas
- ✅ Sistema de autenticação completo
- ✅ **Professor pode lecionar em múltiplas instituições**
- ✅ **Vínculo automático ao criar disciplina**
- ✅ **Página para gerenciar vínculos com instituições**
- ✅ **Perfil pessoal com edição de dados e foto**
- ✅ **Alteração de senha pelo professor**
- ✅ **Auto-inscrição em instituições**
- 🎯 **NOVO**: Sistema completo de criação de slides
  - Múltiplos slides por aula
  - Suporte a texto, imagens, PDFs, URLs e vídeos
  - Ícones personalizados (Bootstrap Icons)
  - Reordenação de slides com drag-and-drop
  - Visualização em formato de apresentação
  - Navegação por teclado (setas ← →)
  - Duração estimada por slide

### Para Administradores
- 👨‍💼 **NOVO**: Módulo completo de administração
- ✅ Gerenciamento centralizado de professores
- ✅ Cadastro de novos professores com senha
- ✅ Edição completa de dados dos professores
- ✅ Ativar/desativar professores
- ✅ Alterar senha de professores
- ✅ Gerenciar vínculos professor-instituição
- ✅ Configurar tokens de IA para professores
- ✅ Upload de foto dos professores (via URL)
- ✅ Dashboard com estatísticas
- ✅ Busca e filtros inteligentes

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- Conta Supabase (já configurada)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/maxudi/syllab.git
cd syllab

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local

# Execute o schema SQL no Supabase
# Acesse seu Supabase → SQL Editor → Cole e execute database/schema.sql

# (Opcional) Popule com dados de exemplo
# Execute database/seed.sql no Supabase

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
syllab/
├── app/
│   ├── page.tsx                    # 🏠 Home (seleção)
│   ├── disciplina/[id]/page.tsx   # 📚 Dashboard da disciplina
│   ├── professor/
│   │   ├── page.tsx               # 👨‍🏫 Área do professor
│   │   ├── instituicoes/page.tsx  # 🏛️ Gerenciar instituições
│   │   ├── disciplinas/page.tsx   # 📖 Gerenciar disciplinas
│   │   └── conteudo/[id]/slides/page.tsx  # 🎬 Gerenciar slides
│   ├── aula/[id]/page.tsx         # 🎯 Visualizar aula com slides
│   └── auth/
│       ├── login/page.tsx         # 🔐 Login
│       └── signup/page.tsx        # ✍️ Cadastro
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── header.tsx                 # Header global
│   ├── protected-route.tsx        # Proteção de rotas
│   └── skeletons.tsx              # Loading states
├── lib/
│   ├── supabase.ts               # Cliente Supabase + Types
│   ├── auth.ts                   # Funções de autenticação
│   ├── auth-context.tsx          # Context de autenticação
│   └── utils.ts                  # Utilitários
└── database/
    ├── schema.sql                # Schema do banco
    ├── seed.sql                  # Dados de exemplo
    ├── add-slides-table.sql      # 🎯 Criar tabela de slides
    ├── fix-rls-permissions.sql   # Políticas RLS
    └── dados-exemplo-slides.sql  # Exemplo de slides
```

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Supabase](https://supabase.com/) (Self-hosted)
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Ícones**: [Lucide React](https://lucide.dev/)

## 🎨 Design System

### Paleta de Cores
- **Base**: Slate/Zinc (tons neutros)
- **Primary**: Blue 600-700 (#2563EB)
- **Accent**: Green 600 (documentos), Orange 600 (avaliativos)

### Princípios
- ✅ Minimalista e elegante
- ✅ Muito white space
- ✅ Transições suaves
- ✅ Mobile-first responsivo

## 🗄️ Banco de Dados

Todas as tabelas usam o prefixo `syllab_`:

- `syllab_instituicoes` - Instituições de ensino
- `syllab_professores` - Professores
- `syllab_disciplinas` - Disciplinas
- `syllab_conteudos` - Conteúdos (3 tipos)
- `syllab_slides` - 🎯 **NOVO**: Slides das aulas

**Segurança**: Row Level Security (RLS) habilitado com políticas de acesso.

## 🎬 Sistema de Slides

O Syllab agora possui um sistema completo de criação e apresentação de slides para aulas!

### Criando uma Aula com Slides

1. **Configure o Banco de Dados**
   ```bash
   # Execute no SQL Editor do Supabase:
   # database/add-slides-table.sql
   ```

2. **Crie um Conteúdo**
   - Acesse `/professor`
   - Selecione uma disciplina
   - Crie um conteúdo do tipo **"Jornada de Aula"**

3. **Gerencie os Slides**
   - Clique em **"Gerenciar Slides"**
   - Adicione slides com título, conteúdo HTML, mídias e ícones
   - Reordene conforme necessário

4. **Visualize**
   - Clique em **"Visualizar Aula"**
   - Navegue com botões ou setas do teclado (← →)

### Recursos dos Slides

- ✅ **Texto formatado** com HTML
- ✅ **Imagens** com legenda
- ✅ **PDFs** incorporados
- ✅ **URLs/Links** externos
- ✅ **Vídeos** (YouTube ou direto)
- ✅ **Ícones** Bootstrap Icons
- ✅ **Reordenação** com botões ↑↓
- ✅ **Duração estimada** por slide
- ✅ **Notas do professor** privadas

### Exemplo de Conteúdo HTML

```html
<p class="fs-5">Bem-vindos à aula!</p>

<div class="highlight-box">
  <p><strong>Importante:</strong> Conceito fundamental aqui.</p>
</div>

<ul>
  <li>Tópico 1</li>
  <li>Tópico 2</li>
</ul>
```

📖 **Documentação completa**: [GUIA-SLIDES.md](GUIA-SLIDES.md)

**Exemplo de dados**: `database/dados-exemplo-slides.sql`

## 🚢 Deploy

### Easypanel

1. Crie novo projeto e conecte ao GitHub
2. Configure:
   - **Repositório**: `https://github.com/maxudi/syllab.git`
   - **Build**: `npm run build`
   - **Start**: `npm start`
   - **Port**: `3000`
3. Adicione as variáveis de ambiente
4. Deploy!

### Variáveis de Ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL=https://condominio-supa-academic.yzqq8i.easypanel.host
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-anon-key]
```

## 📚 Documentação

- **[INSTALACAO.md](INSTALACAO.md)** - Guia de instalação detalhado
- **[DOCUMENTACAO_COMPLETA.md](DOCUMENTACAO_COMPLETA.md)** - Documentação técnica completa
- **[MODULO-ADMIN.md](MODULO-ADMIN.md)** - 👨‍💼 Documentação completa do módulo de administração
- **[INICIO-RAPIDO-ADMIN.md](INICIO-RAPIDO-ADMIN.md)** - ⚡ Guia rápido para configurar o admin
- **[SOLUCAO-ERRO-TIMEOUT.md](SOLUCAO-ERRO-TIMEOUT.md)** - 🚨 Solução para erros de conexão

## 🔧 Troubleshooting

### Erro "Failed to fetch" ou "ERR_TIMED_OUT"?

1. Acesse: `http://localhost:3001/diagnostico-conexao`
2. Execute os testes automáticos
3. Siga o guia: [SOLUCAO-ERRO-TIMEOUT.md](SOLUCAO-ERRO-TIMEOUT.md)

### Monitor de Conexão

```powershell
# Execute para monitorar o Supabase em tempo real
.\monitor-supabase.ps1
```

## 🧪 Comandos

```bash
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm start        # Iniciar produção
npm run lint     # Linting
```

## 📸 Screenshots

### Home Page
Navegação elegante em 3 etapas: Instituição → Professor → Disciplina

### Dashboard da Disciplina
Conteúdos organizados em 3 categorias com cards interativos

### Área do Professor
Interface simples para gerenciar conteúdos das disciplinas

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido para facilitar a gestão de conteúdo acadêmico.

---

**⭐ Se este projeto foi útil, deixe uma estrela!**
