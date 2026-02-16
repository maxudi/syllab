"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Plus, Trash2, Building2, Link as LinkIcon, Building, ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'

interface Professor {
  id: string
  nome: string
  email: string
  user_id: string
}

interface Instituicao {
  id: string
  nome: string
  sigla: string | null
  logo_url: string | null
  descricao: string | null
}

interface Vinculo {
  id: string
  instituicao_id: string
  cargo: string | null
  data_inicio: string
  ativo: boolean
  instituicao: Instituicao
}

export default function MeusVinculosPage() {
  const router = useRouter()
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [instituicoesDisponiveis, setInstituicoesDisponiveis] = useState<Instituicao[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    instituicao_id: '',
    cargo: ''
  })

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Buscar ou criar professor
    const { data: professorData, error: profError } = await supabase
      .from('syllab_professores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profError) {
      if (profError.code === 'PGRST116') {
        console.log('Criando registro de professor...')
        const { data: newProf, error: createError } = await supabase
          .from('syllab_professores')
          .insert([{
            nome: user.nome || user.email,
            email: user.email,
            user_id: user.id
          }])
          .select()
          .single()

        if (createError) {
          console.error('Erro ao criar professor:', createError)
          alert('Erro ao criar perfil de professor')
          return
        }
        setProfessor(newProf)
        loadVinculos(newProf.id)
      }
    } else {
      setProfessor(professorData)
      loadVinculos(professorData.id)
    }

    loadInstituicoesDisponiveis()
  }

  async function loadVinculos(professorId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('syllab_professor_instituicoes')
      .select(`
        *,
        instituicao:instituicao_id (
          id,
          nome,
          sigla,
          logo_url,
          descricao
        )
      `)
      .eq('professor_id', professorId)
      .eq('ativo', true)
      .order('data_inicio', { ascending: false })

    if (error) {
      console.error('Erro ao carregar vínculos:', error)
    } else {
      setVinculos(data || [])
    }
    setLoading(false)
  }

  async function loadInstituicoesDisponiveis() {
    const { data, error } = await supabase
      .from('syllab_instituicoes')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao carregar instituições:', error)
    } else {
      setInstituicoesDisponiveis(data || [])
    }
  }

  function resetForm() {
    setFormData({ instituicao_id: '', cargo: '' })
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!professor) {
      alert('Erro: Professor não identificado')
      return
    }

    if (!formData.instituicao_id) {
      alert('Selecione uma instituição')
      return
    }

    setLoading(true)

    // Verificar se já existe vínculo
    const { data: vinculoExistente } = await supabase
      .from('syllab_professor_instituicoes')
      .select('id, ativo')
      .eq('professor_id', professor.id)
      .eq('instituicao_id', formData.instituicao_id)
      .single()

    if (vinculoExistente) {
      if (vinculoExistente.ativo) {
        alert('Você já está vinculado a esta instituição')
        setLoading(false)
        return
      } else {
        // Reativar vínculo
        const { error } = await supabase
          .from('syllab_professor_instituicoes')
          .update({ ativo: true, cargo: formData.cargo || null })
          .eq('id', vinculoExistente.id)

        if (error) {
          console.error('Erro ao reativar vínculo:', error)
          alert(`Erro: ${error.message}`)
        } else {
          alert('Vínculo reativado com sucesso!')
          resetForm()
          loadVinculos(professor.id)
        }
        setLoading(false)
        return
      }
    }

    // Criar novo vínculo
    const { error } = await supabase
      .from('syllab_professor_instituicoes')
      .insert([{
        professor_id: professor.id,
        instituicao_id: formData.instituicao_id,
        cargo: formData.cargo || null,
        ativo: true
      }])

    if (error) {
      console.error('Erro ao criar vínculo:', error)
      alert(`Erro ao criar vínculo: ${error.message}`)
    } else {
      alert('Vínculo criado com sucesso!')
      resetForm()
      loadVinculos(professor.id)
    }
    setLoading(false)
  }

  async function handleDelete(vinculoId: string) {
    if (!confirm('Deseja desvincular desta instituição? Suas disciplinas nesta instituição permanecerão.')) {
      return
    }

    const { error } = await supabase
      .from('syllab_professor_instituicoes')
      .update({ ativo: false, data_fim: new Date().toISOString() })
      .eq('id', vinculoId)

    if (error) {
      console.error('Erro ao desvincular:', error)
      alert('Erro ao desvincular')
    } else {
      alert('Desvinculado com sucesso!')
      if (professor) loadVinculos(professor.id)
    }
  }

  // Filtrar instituições que ainda não estão vinculadas
  const instituicoesNaoVinculadas = instituicoesDisponiveis.filter(
    inst => !vinculos.find(v => v.instituicao_id === inst.id)
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link href="/professor/disciplinas">
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Disciplinas
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center">
              <LinkIcon className="mr-3 h-10 w-10 text-blue-600" />
              Minhas Instituições
            </h1>
            <p className="text-slate-600">
              Gerencie os vínculos com instituições onde você leciona
            </p>
          </div>

          {/* Info */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Building className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Sobre os Vínculos com Instituições</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Você pode estar vinculado a várias instituições. Ao criar uma disciplina em uma instituição, 
                    você será automaticamente vinculado a ela. Você também pode gerenciar seus vínculos manualmente aqui.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão Adicionar */}
          <div className="mb-6">
            <Button 
              onClick={() => setShowForm(!showForm)} 
              disabled={loading || instituicoesNaoVinculadas.length === 0}
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Vínculo
                </>
              )}
            </Button>
            {instituicoesNaoVinculadas.length === 0 && vinculos.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Você já está vinculado a todas as instituições disponíveis
              </p>
            )}
          </div>

          {/* Formulário */}
          {showForm && (
            <Card className="mb-8 border-2 border-blue-200">
              <CardHeader>
                <CardTitle>Adicionar Vínculo com Instituição</CardTitle>
                <CardDescription>
                  Vincule-se a uma instituição onde você leciona
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="instituicao_id">Instituição *</Label>
                    <select
                      id="instituicao_id"
                      value={formData.instituicao_id}
                      onChange={(e) => setFormData({ ...formData, instituicao_id: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Selecione uma instituição...</option>
                      {instituicoesNaoVinculadas.map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.sigla ? `${inst.sigla} - ` : ''}{inst.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="cargo">Cargo (opcional)</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      placeholder="Ex: Professor Titular, Professor Adjunto"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" disabled={loading}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Vínculo
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Vínculos */}
          {vinculos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-semibold mb-2">Nenhum vínculo encontrado</p>
                <p className="mb-4">
                  Você será automaticamente vinculado a uma instituição ao criar uma disciplina nela,
                  ou pode adicionar um vínculo manualmente acima.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vinculos.map(vinculo => (
                <Card key={vinculo.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Building2 className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {vinculo.instituicao.nome}
                            </h3>
                            {vinculo.instituicao.sigla && (
                              <p className="text-sm text-slate-500">{vinculo.instituicao.sigla}</p>
                            )}
                          </div>
                        </div>
                        {vinculo.cargo && (
                          <p className="text-sm text-slate-600 mb-2">
                            <strong>Cargo:</strong> {vinculo.cargo}
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          Vinculado desde: {new Date(vinculo.data_inicio).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(vinculo.id)}
                        title="Desvincular"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {vinculos.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Total de {vinculos.length} instituiç{vinculos.length === 1 ? 'ão' : 'ões'}
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
