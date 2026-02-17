import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERRO: Variáveis de ambiente do Supabase não configuradas!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Definida' : 'NÃO DEFINIDA')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Definida' : 'NÃO DEFINIDA')
  console.error('Verifique o arquivo .env.local na raiz do projeto')
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sb-auth-token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }
  }
)

console.log('✓ Supabase client inicializado')
console.log('URL:', supabaseUrl?.substring(0, 30) + '...')

// Verificar sessão ao inicializar (apenas no cliente)
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data, error }) => {
    console.log('Sessão inicial:', {
      hasSession: !!data.session,
      hasUser: !!data.session?.user,
      error: error?.message
    })
  })
}

// Types para o banco de dados
export type Instituicao = {
  id: string
  nome: string
  sigla: string | null
  logo_url: string | null
  descricao: string | null
  cidade: string | null
  uf: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export type Professor = {
  id: string
  nome: string
  email: string
  foto_url: string | null
  bio: string | null
  instituicao_id: string
  user_id: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export type Disciplina = {
  id: string
  nome: string
  codigo: string | null
  descricao: string | null
  carga_horaria: number | null
  semestre: string | null
  ano: number | null
  professor_id: string
  instituicao_id: string
  capa_url: string | null
  cor_tema: string
  documentos_gerais: string | null
  publica: boolean
  codigo_acesso: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export type Conteudo = {
  id: string
  titulo: string
  descricao: string | null
  tipo: 'documento_geral' | 'jornada_aula' | 'avaliativo'
  disciplina_id: string
  ordem: number
  conteudo_texto: string | null
  arquivo_url: string | null
  arquivo_nome: string | null
  data_disponibilizacao: string
  data_limite: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}
