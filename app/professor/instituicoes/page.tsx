'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { InstituicaoAutocomplete } from '@/components/instituicao-autocomplete'
import { supabase, type Instituicao, type Professor } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Plus, Trash2, Edit, Save, X, Building2, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { useAlert, useConfirm } from '@/components/alert-dialog'

export default function InstituicoesPage() {
  const { showAlert, AlertComponent } = useAlert()
  const { showConfirm, ConfirmComponent } = useConfirm()
  const router = useRouter()
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([])
  const [todasInstituicoes, setTodasInstituicoes] = useState<Instituicao[]>([])
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [instituicaoSelecionada, setInstituicaoSelecionada] = useState<Instituicao | null>(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    descricao: '',
    logo_url: '',
    cidade: '',
    uf: ''
  })

  useEffect(() => {
    init()
  }, [])

  async function init() {
    await loadProfessor()
    await loadTodasInstituicoes()
  }

  async function loadTodasInstituicoes() {
    // Buscar TODAS as instituições ativas para o combobox
    const { data, error } = await supabase
      .from('syllab_instituicoes')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao carregar todas instituições:', error)
    } else {
      setTodasInstituicoes(data || [])
    }
  }

  async function loadProfessor() {
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
        // Professor não existe, criar
        console.log('Criando registro de professor para:', user.email)
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
          showAlert('Erro', 'Erro ao criar perfil de professor. Verifique as permissões.', 'error')
          return
        }
        setProfessor(newProf)
        loadInstituicoes(newProf.id)
      } else {
        console.error('Erro ao buscar professor:', profError)
      }
    } else {
      setProfessor(professorData)
      loadInstituicoes(professorData.id)
    }
  }

  async function loadInstituicoes(professorId: string) {
    setLoading(true)
    
    // Buscar IDs das instituições vinculadas ao professor
    const { data: vinculos, error: errorVinculos } = await supabase
      .from('syllab_professor_instituicoes')
      .select('instituicao_id')
      .eq('professor_id', professorId)
      .eq('ativo', true)

    if (errorVinculos) {
      console.error('Erro ao carregar vínculos:', errorVinculos)
      showAlert('Erro', 'Erro ao carregar instituições', 'error')
      setInstituicoes([])
      setLoading(false)
      return
    }

    if (!vinculos || vinculos.length === 0) {
      setInstituicoes([])
      setLoading(false)
      return
    }

    // Buscar as instituições pelos IDs
    const instituicaoIds = vinculos.map(v => v.instituicao_id)
    const { data: instituicoesData, error: errorInst } = await supabase
      .from('syllab_instituicoes')
      .select('*')
      .in('id', instituicaoIds)
      .eq('ativo', true)
      .order('nome')

    if (errorInst) {
      console.error('Erro ao carregar instituições:', errorInst)
      showAlert('Erro', 'Erro ao carregar instituições', 'error')
      setInstituicoes([])
    } else {
      setInstituicoes(instituicoesData || [])
    }
    
    setLoading(false)
  }

  function resetForm() {
    setFormData({
      nome: '',
      sigla: '',
      descricao: '',
      logo_url: '',
      cidade: '',
      uf: ''
    })
    setEditingId(null)
    setShowForm(false)
    setInstituicaoSelecionada(null)
  }

  function handleEdit(instituicao: Instituicao) {
    setFormData({
      nome: instituicao.nome,
      sigla: instituicao.sigla || '',
      descricao: instituicao.descricao || '',
      logo_url: instituicao.logo_url || '',
      cidade: instituicao.cidade || '',
      uf: instituicao.uf || ''
    })
    setEditingId(instituicao.id)
    setShowForm(true)
    setInstituicaoSelecionada(null)
  }

  function handleSelectExistingInstituicao(instituicao: Instituicao) {
    // Preencher o formulário com os dados da instituição existente
    setFormData({
      nome: instituicao.nome,
      sigla: instituicao.sigla || '',
      descricao: instituicao.descricao || '',
      logo_url: instituicao.logo_url || '',
      cidade: instituicao.cidade || '',
      uf: instituicao.uf || ''
    })
    setInstituicaoSelecionada(instituicao)
  }

  async function handleVincularExistente() {
    if (!instituicaoSelecionada || !professor) return

    setLoading(true)

    // Verificar se já não está vinculado
    const { data: vinculoExistente } = await supabase
      .from('syllab_professor_instituicoes')
      .select('id')
      .eq('professor_id', professor.id)
      .eq('instituicao_id', instituicaoSelecionada.id)
      .eq('ativo', true)
      .single()

    if (vinculoExistente) {
      showAlert('Aviso', 'Você já está vinculado a esta instituição!', 'warning')
      setLoading(false)
      resetForm()
      return
    }

    // Vincular professor à instituição
    const { error } = await supabase
      .from('syllab_professor_instituicoes')
      .insert([{
        professor_id: professor.id,
        instituicao_id: instituicaoSelecionada.id,
        ativo: true
      }])

    if (error) {
      console.error('Erro ao vincular:', error)
      showAlert('Erro', 'Erro ao vincular à instituição', 'error')
    } else {
      showAlert('Sucesso', 'Vinculado à instituição com sucesso!', 'success')
      resetForm()
      loadInstituicoes(professor.id)
    }

    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    console.log('Salvando instituição:', formData)

    if (editingId) {
      // Atualizar
      const { error } = await supabase
        .from('syllab_instituicoes')
        .update(formData)
        .eq('id', editingId)

      if (error) {
        console.error('Erro ao atualizar instituição:', error)
        showAlert('Erro', 'Erro ao atualizar instituição', 'error')
      } else {
        showAlert('Sucesso', 'Instituição atualizada com sucesso!', 'success')
        resetForm()
        if (professor) loadInstituicoes(professor.id)
      }
    } else {
      // Criar nova instituição
      const { data: novaInstituicao, error: errorCreate } = await supabase
        .from('syllab_instituicoes')
        .insert([formData])
        .select()
        .single()

      if (errorCreate) {
        console.error('Erro ao criar instituição:', errorCreate)
        showAlert('Erro', `Erro ao criar instituição: ${errorCreate.message}`, 'error')
      } else if (novaInstituicao && professor) {
        // Vincular o professor à instituição criada
        const { error: errorVinculo } = await supabase
          .from('syllab_professor_instituicoes')
          .insert([{
            professor_id: professor.id,
            instituicao_id: novaInstituicao.id,
            ativo: true
          }])
        
        if (errorVinculo) {
          console.error('Erro ao vincular professor à instituição:', errorVinculo)
          showAlert('Aviso', 'Instituição criada, mas houve erro ao vincular você a ela.', 'warning')
        } else {
          showAlert('Sucesso', 'Instituição criada e vinculada com sucesso!', 'success')
        }
        
        resetForm()
        loadInstituicoes(professor.id)
      }
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    showConfirm(
      'Excluir Instituição',
      'Tem certeza que deseja excluir esta instituição? Esta ação não pode ser desfeita.',
      async () => {
        await executeDelete(id)
      },
      { variant: 'destructive', confirmText: 'Excluir' }
    )
  }

  async function executeDelete(id: string) {

    const { error } = await supabase
      .from('syllab_instituicoes')
      .update({ ativo: false })
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir instituição:', error)
      showAlert('Erro', 'Erro ao excluir instituição', 'error')
    } else {
      showAlert('Sucesso', 'Instituição excluída com sucesso!', 'success')
      if (professor) loadInstituicoes(professor.id)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center">
                <Building2 className="mr-3 h-10 w-10 text-blue-600" />
                Instituições
              </h1>
              <p className="text-slate-600">Gerencie as instituições de ensino</p>
            </div>
            <Link href="/professor/disciplinas">
              <Button variant="outline">
                Ver Disciplinas
              </Button>
            </Link>
          </div>

          {/* Botão Adicionar */}
          {!showForm && (
            <div className="mb-6">
              <Button onClick={() => setShowForm(true)} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Instituição
              </Button>
            </div>
          )}

          {/* Formulário de Nova Instituição */}
          {showForm && !editingId && (
            <Card className="mb-8 border-2 border-blue-200">
              <CardHeader>
                <CardTitle>Nova Instituição</CardTitle>
                <CardDescription>
                  Digite o nome da instituição. Se já existir, você poderá se vincular a ela.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Alerta de Instituição Encontrada */}
                {instituicaoSelecionada && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 mb-1">
                          Instituição Encontrada!
                        </h3>
                        <p className="text-sm text-green-800 mb-3">
                          Esta instituição já está cadastrada no sistema. Deseja se vincular a ela?
                        </p>
                        <div className="flex items-center gap-3">
                          <Button 
                            onClick={handleVincularExistente}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                            type="button"
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            {loading ? 'Vinculando...' : 'Sim, Vincular-me a Esta Instituição'}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setInstituicaoSelecionada(null)}
                            disabled={loading}
                            type="button"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <InstituicaoAutocomplete
                        value={formData.nome}
                        onChange={(value) => {
                          setFormData({ ...formData, nome: value })
                          // Limpar instituição selecionada quando começar a digitar algo diferente
                          if (instituicaoSelecionada && value !== instituicaoSelecionada.nome) {
                            setInstituicaoSelecionada(null)
                          }
                        }}
                        onSelectExisting={handleSelectExistingInstituicao}
                        todasInstituicoes={todasInstituicoes}
                        disabled={loading || !!instituicaoSelecionada}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sigla">Sigla</Label>
                      <Input
                        id="sigla"
                        value={formData.sigla}
                        onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                        placeholder="Ex: UNIFESP"
                        disabled={loading || !!instituicaoSelecionada}
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <Label htmlFor="logo_url">URL do Logo</Label>
                      <Input
                        id="logo_url"
                        type="url"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://exemplo.com/logo.png"
                        disabled={loading || !!instituicaoSelecionada}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cidade">Cidade *</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        placeholder="Ex: São Paulo"
                        required
                        disabled={loading || !!instituicaoSelecionada}
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <Label htmlFor="uf">UF *</Label>
                      <Input
                        id="uf"
                        value={formData.uf}
                        onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                        placeholder="Ex: SP"
                        required
                        disabled={loading || !!instituicaoSelecionada}
                        maxLength={2}
                        minLength={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Breve descrição da instituição"
                        rows={3}
                        disabled={loading || !!instituicaoSelecionada}
                      />
                    </div>
                  </div>

                  {!instituicaoSelecionada && (
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar e Vincular'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {/* Formulário de Edição */}
          {(showForm && editingId) && (
            <Card className="mb-8 border-2 border-blue-200">
              <CardHeader>
                <CardTitle>Editar Instituição</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="nome">Nome da Instituição *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Universidade Federal de São Paulo"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sigla">Sigla</Label>
                      <Input
                        id="sigla"
                        value={formData.sigla}
                        onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                        placeholder="Ex: UNIFESP"
                        disabled={loading}
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <Label htmlFor="logo_url">URL do Logo</Label>
                      <Input
                        id="logo_url"
                        type="url"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://exemplo.com/logo.png"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        placeholder="Ex: São Paulo"
                        disabled={loading}
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <Label htmlFor="uf">UF</Label>
                      <Input
                        id="uf"
                        value={formData.uf}
                        onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                        placeholder="Ex: SP"
                        disabled={loading}
                        maxLength={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Breve descrição da instituição"
                        rows={3}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Instituições */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && instituicoes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-600">Carregando instituições...</p>
              </div>
            ) : instituicoes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Você não está vinculado a nenhuma instituição
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Para começar a usar o sistema, você precisa cadastrar uma instituição de ensino ou solicitar vínculo a uma instituição existente.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Instituição
                </Button>
              </div>
            ) : (
              instituicoes.map((instituicao) => (
                <Card key={instituicao.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="flex-1 pr-2">{instituicao.nome}</span>
                      {instituicao.sigla && (
                        <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {instituicao.sigla}
                        </span>
                      )}
                    </CardTitle>
                    {instituicao.descricao && (
                      <CardDescription className="line-clamp-2">
                        {instituicao.descricao}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(instituicao)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(instituicao.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
      
      {/* Modais */}
      <AlertComponent />
      <ConfirmComponent />
    </ProtectedRoute>
  )
}
