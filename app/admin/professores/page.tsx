'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Power, Search, Users, ArrowLeft } from 'lucide-react'

type Professor = {
  id: string
  nome: string
  email: string
  telefone?: string
  foto_url?: string
  token_ia?: string
  ativo: boolean
  total_instituicoes: number
  instituicoes?: string
  total_disciplinas: number
  created_at: string
}

export default function AdminProfessoresPage() {
  const router = useRouter()
  const [professores, setProfessores] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProfessores, setFilteredProfessores] = useState<Professor[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const user = await requireAdmin()
    if (user) {
      loadProfessores()
    }
  }

  async function loadProfessores() {
    try {
      const { data, error } = await supabase
        .from('v_admin_professores')
        .select('*')
        .order('nome')

      if (error) throw error
      
      setProfessores(data || [])
      setFilteredProfessores(data || [])
    } catch (error) {
      console.error('Erro ao carregar professores:', error)
      alert('Erro ao carregar professores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProfessores(professores)
    } else {
      const filtered = professores.filter(prof =>
        prof.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProfessores(filtered)
    }
  }, [searchTerm, professores])

  async function toggleProfessorAtivo(professorId: string, currentStatus: boolean) {
    const confirmMsg = currentStatus 
      ? 'Deseja desativar este professor?' 
      : 'Deseja ativar este professor?'
    
    if (!confirm(confirmMsg)) return

    try {
      const { error } = await supabase
        .from('syllab_professores')
        .update({ ativo: !currentStatus })
        .eq('id', professorId)

      if (error) throw error

      alert('Status atualizado com sucesso!')
      loadProfessores()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status do professor')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => router.push('/professor')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-8 h-8" />
                Gerenciar Professores
              </h1>
              <p className="text-gray-600 mt-2">
                Administração de professores, vínculos e tokens de IA
              </p>
            </div>
            <Button
              onClick={() => router.push('/admin/professores/novo')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Professor
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total de Professores</p>
                  <p className="text-3xl font-bold text-blue-600">{professores.length}</p>
                </div>
                <Users className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Professores Ativos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {professores.filter(p => p.ativo).length}
                  </p>
                </div>
                <Power className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Com Token IA</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {professores.filter(p => p.token_ia).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-600 opacity-20 rounded flex items-center justify-center text-white font-bold text-xl">
                  AI
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Busca */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Professores */}
        <Card>
          <CardHeader>
            <CardTitle>
              Professores ({filteredProfessores.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Foto</th>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Instituições</th>
                    <th className="text-left p-3">Disciplinas</th>
                    <th className="text-left p-3">Token IA</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfessores.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-gray-500">
                        Nenhum professor encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredProfessores.map((prof) => (
                      <tr key={prof.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          {prof.foto_url ? (
                            <img
                              src={prof.foto_url}
                              alt={prof.nome}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                              {prof.nome.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-medium">{prof.nome}</td>
                        <td className="p-3 text-sm text-gray-600">{prof.email}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {prof.total_instituicoes} {prof.total_instituicoes === 1 ? 'instituição' : 'instituições'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            {prof.total_disciplinas} {prof.total_disciplinas === 1 ? 'disciplina' : 'disciplinas'}
                          </span>
                        </td>
                        <td className="p-3">
                          {prof.token_ia ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                              Configurado
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Não configurado</span>
                          )}
                        </td>
                        <td className="p-3">
                          {prof.ativo ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/admin/professores/${prof.id}`)}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={prof.ativo ? 'outline' : 'default'}
                              onClick={() => toggleProfessorAtivo(prof.id, prof.ativo)}
                              title={prof.ativo ? 'Desativar' : 'Ativar'}
                              className={prof.ativo ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
