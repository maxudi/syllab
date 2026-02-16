# Guia de Autenticação - Syllab

## Visão Geral

O sistema de autenticação do Syllab foi implementado usando Supabase Auth e Next.js App Router.

## Arquivos Criados

### 1. Funções de Autenticação (`lib/auth.ts`)
Contém todas as funções necessárias para gerenciar autenticação:
- `signUp()` - Cadastro de novos usuários
- `signIn()` - Login de usuários
- `signOut()` - Logout
- `getCurrentUser()` - Obter usuário atual
- `getSession()` - Obter sessão atual
- `resetPassword()` - Recuperação de senha
- `updatePassword()` - Atualizar senha
- `onAuthStateChange()` - Listener para mudanças de autenticação

### 2. Contexto de Autenticação (`lib/auth-context.tsx`)
Fornece o estado de autenticação globalmente usando React Context:
- Hook `useAuth()` para acessar o usuário atual em qualquer componente
- Gerenciamento automático do estado de autenticação

### 3. Páginas de Autenticação

#### Login (`app/auth/login/page.tsx`)
- Formulário de login com email e senha
- Link para cadastro e recuperação de senha
- Redirecionamento após login bem-sucedido

#### Cadastro (`app/auth/signup/page.tsx`)
- Formulário de cadastro com nome, email e senha
- Validação de senhas correspondentes
- Verificação de email por Supabase

#### Esqueci Minha Senha (`app/auth/forgot-password/page.tsx`)
- Formulário para recuperação de senha
- Envio de email com link de reset

### 4. Componentes UI

#### Formulário (`components/ui/form.tsx`)
- Componentes reutilizáveis para formulários
- `Form`, `FormField`, `FormMessage`

### 5. Middleware (`middleware.ts`)
- Proteção de rotas `/professor/*` (requer autenticação)
- Redirecionamento automático de usuários não autenticados
- Redirecionamento de usuários autenticados das páginas de login/cadastro

### 6. Header Atualizado (`components/header.tsx`)
- Exibe botões de Login/Cadastrar para visitantes
- Exibe nome do usuário e botão de Logout para usuários autenticados
- Atualização em tempo real do estado de autenticação

## Como Usar

### 1. Configurar Variáveis de Ambiente

Certifique-se de ter as seguintes variáveis no seu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 2. Configurar Supabase

No painel do Supabase:

1. **Authentication > Settings**:
   - Configure "Site URL" para `http://localhost:3000` (dev) ou sua URL de produção
   - Configure "Redirect URLs" para incluir suas URLs de callback

2. **Authentication > Email Templates**:
   - Personalize os templates de email se necessário

### 3. Usar Autenticação em Componentes

```tsx
'use client'

import { useAuth } from '@/lib/auth-context'

export function MyComponent() {
  const { user, loading } = useAuth()

  if (loading) return <div>Carregando...</div>

  if (!user) {
    return <div>Você precisa fazer login</div>
  }

  return <div>Bem-vindo, {user.nome}!</div>
}
```

### 4. Proteger Rotas Server-Side

O middleware já protege automaticamente as rotas em `/professor/*`. Para adicionar mais rotas protegidas, edite o array `protectedRoutes` em `middleware.ts`:

```ts
const protectedRoutes = ['/professor', '/admin', '/dashboard']
```

### 5. Usar Funções de Autenticação Diretamente

```tsx
import { signIn, signOut, getCurrentUser } from '@/lib/auth'

// Login
const { data, error } = await signIn({ email, password })

// Logout
await signOut()

// Obter usuário atual
const user = await getCurrentUser()
```

## Fluxo de Autenticação

### Cadastro
1. Usuário preenche formulário em `/auth/signup`
2. Sistema cria conta no Supabase Auth
3. Supabase envia email de confirmação
4. Usuário confirma email (se configurado)
5. Usuário pode fazer login

### Login
1. Usuário preenche formulário em `/auth/login`
2. Sistema autentica com Supabase
3. Token é armazenado automaticamente
4. Usuário é redirecionado para `/professor`

### Recuperação de Senha
1. Usuário acessa `/auth/forgot-password`
2. Informa email
3. Recebe email com link de reset
4. Clica no link e define nova senha

## Segurança

- Senhas são gerenciadas pelo Supabase (hash automático)
- Row Level Security (RLS) ativo no banco de dados
- Middleware protege rotas sensíveis
- Tokens JWT gerenciados automaticamente
- HTTPS obrigatório em produção

## Próximos Passos

1. **Produção**: Substituir políticas RLS permissivas por políticas baseadas em `auth.uid()`
2. **Profile**: Criar página de perfil do usuário
3. **OAuth**: Adicionar login social (Google, GitHub, etc.)
4. **2FA**: Implementar autenticação de dois fatores
5. **Roles**: Adicionar sistema de permissões/roles

## Problemas Comuns

### "Invalid login credentials"
- Verifique se email e senha estão corretos
- Confirme que o email foi verificado (se configurado)

### Redirecionamento não funciona
- Verifique as URLs configuradas no Supabase
- Confirme que o middleware está ativo

### Usuário não persiste após recarregar página
- Verifique se os cookies estão habilitados
- Confirme a configuração do Supabase client

## Suporte

Para mais informações sobre Supabase Auth, consulte:
- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
