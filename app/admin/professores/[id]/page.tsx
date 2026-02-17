'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import UrlOuUpload from '@/components/url-ou-upload'
import { ArrowLeft, Save, Building2, Trash2, Plus } from 'lucide-react'

type Professor = {
  id: string
  user_id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
  foto_url?: string
  token_ia?: string
  ativo: boolean
}

type Vinculo = {
  id: string
  instituicao_id: string
  nome_instituicao: string
  cargo?: string
  data_inicio: string
}

type Instituicao = {
  id: string
  nome: string
  sigla: string
}

export default function EditarProfessorPage() {
  const router = useRouter()
  const params = useParams()
  const professorId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [instituicoesDisponiveis, setInstituicoesDisponiveis] = useState<Instituicao[]>([])
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    foto_url: '',
    token_ia: '',
  })

  const [novoVinculo, setNovoVinculo] = useState({
    instituicao_id: '',
    cargo: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const user = await requireAdmin()
    if (user) {
      loadData()
    }
  }

  async function loadData() {
    try {
      // Carregar dados do professor
      const { data: profData, error: profError } = await supabase
        .from('syllab_professores')
        .select('*')
        .eq('id', professorId)
        .single()

      if (profError) throw profError

      setProfessor(profData)
      setFormData({
        nome: profData.nome,
        email: profData.email,
        telefone: profData.telefone || '',
        cpf: profData.cpf || '',
        foto_url: profData.foto_url || '',
        token_ia: profData.token_ia || '',
      })

      // Carregar vínculos
      const { data: vinculosData, error: vinculosError } = await supabase
        .from('syllab_professor_instituicoes')
        .select(`
          id,
          instituicao_id,
          cargo,
          data_inicio,
          syllab_instituicoes (nome)
        `)
        .eq('professor_id', professorId)
        .eq('ativo', true)

      if (vinculosError) throw vinculosError

      const vinculosFormatted = vinculosData?.map((v: any) => ({
        id: v.id,
        instituicao_id: v.instituicao_id,
        nome_instituicao: v.syllab_instituicoes.nome,
        cargo: v.cargo,
        data_inicio: v.data_inicio
      })) || []

      setVinculos(vinculosFormatted)

      // Carregar instituições disponíveis
      const { data: instData, error: instError } = await supabase
        .from('syllab_instituicoes')
        .select('id, nome, sigla')
        .eq('ativo', true)
        .order('nome')

      if (instError) throw instError
      setInstituicoesDisponiveis(instData || [])

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados do professor')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.nome || !formData.email) {
      alert('Preencha os campos obrigatórios')
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from('syllab_professores')
        .update({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone || null,
          cpf: formData.cpf || null,
          foto_url: formData.foto_url || null,
          token_ia: formData.token_ia || null,
        })
        .eq('id', professorId)

      if (error) throw error

      alert('Dados atualizados com sucesso!')
      loadData()
    } catch (error: any) {
      console.error('Erro ao atualizar:', error)
      alert(`Erro ao atualizar: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleAdicionarVinculo() {
    if (!novoVinculo.instituicao_id) {
      alert('Selecione uma instituição')
      return
    }

    try {
      const { error } = await supabase
        .from('syllab_professor_instituicoes')
        .insert({
          professor_id: professorId,
          instituicao_id: novoVinculo.instituicao_id,
          cargo: novoVinculo.cargo || null,
          ativo: true
        })

      if (error) throw error

      alert('Vínculo adicionado com sucesso!')
      setNovoVinculo({ instituicao_id: '', cargo: '' })
      loadData()
    } catch (error: any) {
      console.error('Erro ao adicionar vínculo:', error)
      alert(`Erro ao adicionar vínculo: ${error.message}`)
    }
  }

  async function handleRemoverVinculo(vinculoId: string) {
    if (!confirm('Deseja remover este vínculo?')) return

    try {
      const { error } = await supabase
        .from('syllab_professor_instituicoes')
        .update({ ativo: false })
        .eq('id', vinculoId)

      if (error) throw error

      alert('Vínculo removido com sucesso!')
      loadData()
    } catch (error: any) {
      console.error('Erro ao remover vínculo:', error)
      alert(`Erro ao remover vínculo: ${error.message}`)
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

  if (!professor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Professor não encontrado</p>
          <Button onClick={() => router.push('/admin/professores')} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/professores')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-start gap-4">
            {professor.foto_url ? (
              <img
                src={professor.foto_url}
                alt={professor.nome}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-2xl">
                {professor.nome.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{professor.nome}</h1>
              <p className="text-gray-600 mt-1">{professor.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${professor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {professor.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados do Professor */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Professor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>

                <div>
                  <UrlOuUpload
                    label="URL da Foto"
                    value={formData.foto_url}
                    onChange={(v) => setFormData({ ...formData, foto_url: v })}
                    placeholder="Cole uma URL ou envie um arquivo"                    bucket="syllab"                    folder={professor?.id ? `professores/${professor.id}` : 'professores'}
                    accept="image/*"
                    preview
                  />
                </div>

                <div>
                  <Label htmlFor="token_ia">Token de IA</Label>
                  <Textarea
                    id="token_ia"
                    value={formData.token_ia}
                    onChange={(e) => setFormData({ ...formData, token_ia: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? 'Salvando...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Vínculos com Instituições */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Instituições
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de vínculos */}
                <div className="space-y-2">
                  {vinculos.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma instituição vinculada
                    </p>
                  ) : (
                    vinculos.map((vinculo) => (
                      <div
                        key={vinculo.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{vinculo.nome_instituicao}</p>
                          {vinculo.cargo && (
                            <p className="text-sm text-gray-600">{vinculo.cargo}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoverVinculo(vinculo.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Adicionar novo vínculo */}
                <div className="border-t pt-4 space-y-3">
                  <Label>Adicionar Instituição</Label>
                  <select
                    value={novoVinculo.instituicao_id}
                    onChange={(e) => setNovoVinculo({ ...novoVinculo, instituicao_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Selecione uma instituição...</option>
                    {instituicoesDisponiveis
                      .filter(inst => !vinculos.some(v => v.instituicao_id === inst.id))
                      .map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.nome} ({inst.sigla})
                        </option>
                      ))}
                  </select>

                  <Input
                    placeholder="Cargo (opcional)"
                    value={novoVinculo.cargo}
                    onChange={(e) => setNovoVinculo({ ...novoVinculo, cargo: e.target.value })}
                  />

                  <Button
                    onClick={handleAdicionarVinculo}
                    disabled={!novoVinculo.instituicao_id}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Instituição
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
