'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { GraduationCap, LogOut, User, ChevronDown, Settings, Users } from 'lucide-react'
import { getCurrentUser, getCurrentUserData, signOut, onAuthStateChange, type User as UserType } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { PerfilModal } from '@/components/perfil-modal'

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [perfilModalOpen, setPerfilModalOpen] = useState(false)

  useEffect(() => {
    // Carregar usuário atual e verificar se é admin
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        const userData = await getCurrentUserData()
        if (userData?.isAdmin) {
          setIsAdmin(true)
        }
      }
      
      setLoading(false)
    }
    
    loadUser()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = onAuthStateChange(async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        const userData = await getCurrentUserData()
        if (userData?.isAdmin) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setIsAdmin(false)
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false)
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">Syllab</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link 
              href="/aluno" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Área do Aluno
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link 
                      href="/professor" 
                      className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Área do Professor
                    </Link>
                    
                    {isAdmin && (
                      <Link 
                        href="/admin/professores" 
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    
                    <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDropdownOpen(!dropdownOpen)
                          }}
                          className="flex items-center space-x-2 hover:bg-slate-50 px-3 py-2 rounded-md transition-colors"
                        >
                          <User className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">
                            {user.nome}
                          </span>
                          <ChevronDown className="h-4 w-4 text-slate-600" />
                        </button>

                        {dropdownOpen && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                            <div className="px-4 py-3 border-b border-slate-100">
                              <p className="text-sm font-medium text-slate-900">{user.nome}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                            
                            <button
                              onClick={() => {
                                setDropdownOpen(false)
                                setPerfilModalOpen(true)
                              }}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                            >
                              <Settings className="h-4 w-4" />
                              <span>Meu Perfil</span>
                            </button>

                            {isAdmin && (
                              <Link
                                href="/admin/professores"
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                onClick={() => setDropdownOpen(false)}
                              >
                                <Users className="h-4 w-4" />
                                <span>Gerenciar Professores</span>
                              </Link>
                            )}

                            <button
                              onClick={handleSignOut}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Sair</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm">
                        Cadastrar
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
      
      {/* Modal de Perfil */}
      <PerfilModal 
        isOpen={perfilModalOpen} 
        onClose={() => setPerfilModalOpen(false)} 
      />
    </header>
  )
}
