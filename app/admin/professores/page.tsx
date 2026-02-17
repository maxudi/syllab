'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Power, Search, Users, ArrowLeft, CheckCircle, Clock } from 'lucide-react'

type Professor = {
  id: string
  nome: string
  email: string
  telefone?: string
  foto_url?: string
  token_ia?: string
  ativo: boolean
  status: 'approved' | 'pending' | string // Mantido como 'status' para bater com o banco
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
  
  // Estados para o Modal de Aprovação
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

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

  // Função para Alterar Aprovação (approved/pending)
  async function handleToggleApproval() {
    if (!selectedProfessor) return
    
    setIsUpdatingStatus(true)
    const newStatus = selectedProfessor.status === 'approved' ? 'pending' : 'approved'

    try {
      const { error } = await supabase
        .from('syllab_professores')
        .update({ status: newStatus }) // Atualiza a coluna 'status'
        .eq('id', selectedProfessor.id)

      if (error) throw error

      alert(`Status atualizado para ${newStatus === 'approved' ? 'Aprovado' : 'Pendente'}`)
      setSelectedProfessor(null)
      loadProfessores()
    } catch (error) {
      console.error('Erro ao atualizar aprovação:', error)
      alert('Erro ao atualizar status de aprovação')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Função para Ativar/Desativar Conta (ativo: boolean)
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

      alert('Status da conta atualizado!')
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
        <Button
          variant="ghost"
          onClick={() => router.push('/professor')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8" />
              Gerenciar Professores
            </h1>
            <p className="text-gray-600 mt-2">Administração de acesso, vínculos e aprovações</p>
          </div>
          <Button onClick={() => router.push('/admin/professores/novo')} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Professor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold text-blue-600">{professores.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600 opacity-20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {professores.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600 opacity-20" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-3xl font-bold text-green-600">
                  {professores.filter(p => p.ativo).length}
                </p>
              </div>
              <Power className="w-10 h-10 text-green-600 opacity-20" />
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 relative">
            <Search className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listagem de Professores ({filteredProfessores.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="text-left p-3">Info</th>
                    <th className="text-left p-3">Instituições</th>
                    <th className="text-left p-3">Disciplinas</th>
                    <th className="text-left p-3">Token IA</th>
                    <th className="text-left p-3">Aprovação</th>
                    <th className="text-left p-3">Conta</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredProfessores.map((prof) => (
                    <tr key={prof.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 overflow-hidden">
                            {prof.foto_url ? <img src={prof.foto_url} alt={prof.nome} className="object-cover w-full h-full" /> : prof.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{prof.nome}</p>
                            <p className="text-xs text-gray-500">{prof.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                          {prof.total_instituicoes} inst.
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
                          {prof.total_disciplinas} disc.
                        </span>
                      </td>
                      <td className="p-3">
                        {prof.token_ia ? 
                          <span className="text-purple-600 flex items-center gap-1 text-xs"><CheckCircle className="w-3 h-3"/> OK</span> : 
                          <span className="text-gray-400 text-xs italic">Pendente</span>
                        }
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => setSelectedProfessor(prof)}
                          className="hover:scale-105 transition-transform"
                        >
                          {/* Corrigido para verificar 'status' vindo do banco */}
                          {prof.status === 'approved' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Aprovado</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pendente</span>
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${prof.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {prof.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => router.push(`/admin/professores/${prof.id}`)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={prof.ativo ? 'outline' : 'default'}
                            className={prof.ativo ? 'text-red-600 border-red-200 hover:bg-red-50' : ''}
                            onClick={() => toggleProfessorAtivo(prof.id, prof.ativo)}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selectedProfessor} onOpenChange={() => setSelectedProfessor(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Alterar Aprovação</DialogTitle>
              <DialogDescription>
                Você está prestes a alterar o status de aprovação de <strong>{selectedProfessor?.nome}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-6 gap-3">
              <p className="text-sm text-gray-500">Status Atual:</p>
              {selectedProfessor?.status === 'approved' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold text-sm uppercase">
                  <CheckCircle className="w-4 h-4" /> Aprovado
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm uppercase">
                  <Clock className="w-4 h-4" /> Pendente
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setSelectedProfessor(null)}>Cancelar</Button>
              <Button 
                variant={selectedProfessor?.status === 'approved' ? "destructive" : "default"}
                onClick={handleToggleApproval}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? "Salvando..." : `Mudar para ${selectedProfessor?.status === 'approved' ? 'Pendente' : 'Aprovado'}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}