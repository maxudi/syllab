import { supabase } from './supabase'

// Tipos para autenticação
export type SignUpData = {
  email: string
  password: string
  nome: string
}

export type SignInData = {
  email: string
  password: string
}

export type User = {
  id: string
  email: string
  nome?: string
}

// Cadastro de novo usuário
export async function signUp({ email, password, nome }: SignUpData) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: nome,
        },
      },
    })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message || 'Erro ao criar conta' }
  }
}

// Login
export async function signIn({ email, password }: SignInData) {
  try {
    console.log('auth.ts: Iniciando signIn')
    console.log('auth.ts: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('auth.ts: Resposta do Supabase:', { 
      hasData: !!data, 
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      error: error?.message 
    })

    if (error) {
      console.error('auth.ts: Erro do Supabase:', error)
      throw error
    }
    return { data, error: null }
  } catch (error: any) {
    console.error('auth.ts: Exceção capturada:', error)
    return { data: null, error: error.message || 'Erro ao fazer login' }
  }
}

// Logout
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message || 'Erro ao fazer logout' }
  }
}

// Obter usuário atual
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error
    
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email!,
      nome: user.user_metadata?.nome || user.email?.split('@')[0],
    }
  } catch (error) {
    return null
  }
}

// Obter sessão
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    return null
  }
}

// Resetar senha
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message || 'Erro ao enviar email de recuperação' }
  }
}

// Atualizar senha
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar senha' }
  }
}

// Listener para mudanças de autenticação
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email!,
        nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0],
      })
    } else {
      callback(null)
    }
  })
}

// ========================================
// FUNÇÕES DE PROFESSOR
// ========================================

/**
 * Obtém os dados completos do professor logado
 */
export async function getCurrentProfessor() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('syllab_professores')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .single()

  if (error) {
    console.error('Erro ao buscar dados do professor:', error)
    return null
  }

  return data
}

// ========================================
// FUNÇÕES DE ADMINISTRADOR
// ========================================

/**
 * Verifica se o usuário logado é administrador
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('syllab_administradores')
    .select('id')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .single()

  if (error) return false
  return !!data
}

/**
 * Verifica se o usuário logado é super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('syllab_administradores')
    .select('super_admin')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .single()

  if (error) return false
  return data?.super_admin === true
}

/**
 * Obtém dados do administrador logado
 */
export async function getCurrentAdmin() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('syllab_administradores')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .single()

  if (error) {
    console.error('Erro ao buscar dados do admin:', error)
    return null
  }

  return data
}

/**
 * Obtém dados completos do usuário (professor ou admin ou ambos)
 */
export async function getCurrentUserData() {
  const user = await getCurrentUser()
  if (!user) return null

  const [professor, admin] = await Promise.all([
    getCurrentProfessor(),
    getCurrentAdmin()
  ])

  return {
    user,
    professor,
    admin,
    isAdmin: !!admin,
    isProfessor: !!professor
  }
}

/**
 * Hook que verifica se é admin, caso contrário redireciona
 */
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    return null
  }

  const admin = await isAdmin()
  
  if (!admin) {
    if (typeof window !== 'undefined') {
      alert('Acesso negado. Você precisa ser administrador.')
      window.location.href = '/professor'
    }
    return null
  }
  
  return user
}
