"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { supabase, type Disciplina, type Conteudo, type Professor } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Plus, Trash2, Edit, Save, X, BookOpen, Building2, Presentation, Clock, RefreshCw, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useAlert, useConfirm } from '@/components/alert-dialog'
import UrlOuUpload from '@/components/url-ou-upload'

export default function ProfessorPage() {
  const { showAlert, AlertComponent } = useAlert()
  const { showConfirm, ConfirmComponent } = useConfirm()
  const router = useRouter()
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("")
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [temInstituicoes, setTemInstituicoes] = useState<boolean>(false)
  const [verificandoInstituicoes, setVerificandoInstituicoes] = useState<boolean>(true)
  const [hasProfessorRecord, setHasProfessorRecord] = useState<boolean>(true) // assume que tem até checar
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'documento_geral' as 'documento_geral' | 'jornada_aula' | 'avaliativo',
    conteudo_texto: '',
    arquivo_url: '',
    ordem: 0,
    data_limite: ''
  })

  useEffect(() => {
    initProfessor()
  }, [])

  useEffect(() => {
    if (selectedDisciplina) {
      loadConteudos()
    }
  }, [selectedDisciplina])

  function isApproved(p: any | null) {
    // Compatibilidade retro: se não existir coluna status, considere aprovado
    const status = (p as any)?.status
    return !status || status === 'approved'
  }

  async function initProfessor() {
    setLoading(true)
    const user = await getCurrentUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    console.log('Usuário logado:', user)

    // Buscar professor pelo user_id (não cria automaticamente)
    const { data: professorData, error: profError } = await supabase
      .from('syllab_professores')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profError) {
      console.error('Erro ao buscar professor:', profError)
      // Em caso de erro inesperado, considere que não há registro para exibir UX de solicitação
      setProfessor(null)
      setHasProfessorRecord(false)
      setVerificandoInstituicoes(false)
      setLoading(false)
      return
    }

    if (!professorData) {
      // Não há registro -> mostrar card de Solicitar Acesso
      setProfessor(null)
      setHasProfessorRecord(false)
      setVerificandoInstituicoes(false)
      setLoading(false)
      return
    }

    console.log('Professor encontrado:', professorData)
    setProfessor(professorData as any)
    setHasProfessorRecord(true)

    if (isApproved(professorData)) {
      await verificarInstituicoes((professorData as any).id)
      await loadDisciplinas((professorData as any).id)
    } else {
      // Pendente/Rejeitado: não carrega recursos da área do professor
      setVerificandoInstituicoes(false)
    }
    setLoading(false)
  }

  async function solicitarAcesso() {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Evitar duplicação de solicitação
    const { data: exists, error: existsErr } = await supabase
      .from('syllab_professores')
      .select('id, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existsErr && exists) {
      setProfessor(exists as any)
      setHasProfessorRecord(true)
      showAlert('Solicitação já existe', 'Você já possui uma solicitação ou um perfil de professor.', 'info')
      return
    }

    const { data: newProf, error: createError } = await supabase
      .from('syllab_professores')
      .insert([{
        nome: (user as any).nome || user.email,
        email: user.email,
        user_id: user.id,
        ativo: true,
        status: 'pending'
      }])
      .select()
      .single()

    if (createError) {
      console.error('Erro ao solicitar acesso:', createError)
      showAlert('Erro', 'Não foi possível enviar sua solicitação. Verifique as permissões no banco de dados.', 'error')
      return
    }

    setProfessor(newProf as any)
    setHasProfessorRecord(true)
    setVerificandoInstituicoes(false)
    showAlert('Solicitação Enviada', 'Sua solicitação para acesso de professor foi registrada e aguarda aprovação de um administrador.', 'success')
  }

  async function verificarInstituicoes(professorId: string) {
    setVerificandoInstituicoes(true)
    console.log('Verificando instituições vinculadas ao professor:', professorId)
    
    const { data, error } = await supabase
      .from('syllab_professor_instituicoes')
      .select('id')
      .eq('professor_id', professorId)
      .eq('ativo', true)
      .limit(1)

    if (error) {
      console.error('Erro ao verificar instituições:', error)
      setTemInstituicoes(false)
    } else {
      setTemInstituicoes((data && data.length > 0) || false)
      console.log('Professor tem instituições vinculadas:', (data && data.length > 0))
    }
    setVerificandoInstituicoes(false)
  }

  async function loadDisciplinas(professorId: string) {
    console.log('Carregando disciplinas do professor:', professorId)
    const { data, error } = await supabase
      .from('syllab_disciplinas')
      .select('*')
      .eq('professor_id', professorId)
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao carregar disciplinas:', error)
    } else {
      setDisciplinas(data || [])
    }
  }

  async function loadConteudos() {
    const { data, error } = await supabase
      .from('syllab_conteudos')
      .select('*')
      .eq('disciplina_id', selectedDisciplina)
      .order('tipo')
      .order('ordem')

    if (error) {
      console.error('Erro ao carregar conteúdos:', error)
    } else {
      setConteudos(data || [])
    }
  }

  function handleInputChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'documento_geral',
      conteudo_texto: '',
      arquivo_url: '',
      ordem: 0,
      data_limite: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(conteudo: Conteudo) {
    setFormData({
      titulo: conteudo.titulo,
      descricao: conteudo.descricao || '',
      tipo: conteudo.tipo,
      conteudo_texto: conteudo.conteudo_texto || '',
      arquivo_url: conteudo.arquivo_url || '',
      ordem: conteudo.ordem,
      data_limite: conteudo.data_limite ? conteudo.data_limite.split('T')[0] : ''
    })
    setEditingId(conteudo.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selectedDisciplina) {
      showAlert('Disciplina Não Selecionada', 'Por favor, selecione uma disciplina antes de criar ou editar conteúdo.', 'warning')
      return
    }

    console.log('=== CRIAR/ATUALIZAR CONTEÚDO ===')
    console.log('Dados do formulário:', formData)
    console.log('Disciplina selecionada:', selectedDisciplina)

    const conteudoData = {
      ...formData,
      disciplina_id: selectedDisciplina,
      data_limite: formData.data_limite ? new Date(formData.data_limite).toISOString() : null
    }

    console.log('Dados a serem enviados:', conteudoData)

    if (editingId) {
      // Atualizar
      console.log('Atualizando conteúdo ID:', editingId)
      const { data, error } = await supabase
        .from('syllab_conteudos')
        .update(conteudoData)
        .eq('id', editingId)
        .select()

      if (error) {
        console.error('Erro ao atualizar conteúdo:', error)
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2))
        showAlert('Erro ao Atualizar', `Não foi possível atualizar o conteúdo: ${error.message}`, 'error')
      } else {
        console.log('Conteúdo atualizado:', data)
        showAlert('Sucesso!', 'Conteúdo atualizado com sucesso!', 'success')
        resetForm()
        loadConteudos()
      }
    } else {
      // Criar
      console.log('Criando novo conteúdo...')
      const { data, error } = await supabase
        .from('syllab_conteudos')
        .insert([conteudoData])
        .select()

      console.log('Resposta do INSERT:', { data, error })

      if (error) {
        console.error('Erro ao criar conteúdo:', error)
        console.error('Código do erro:', error.code)
        console.error('Mensagem:', error.message)
        console.error('Detalhes:', error.details)
        console.error('Hint:', error.hint)
        showAlert('Erro ao Criar Conteúdo', `Não foi possível criar o conteúdo: ${error.message}. Verifique o console para mais detalhes.`, 'error')
      } else {
        console.log('Conteúdo criado com sucesso:', data)
        showAlert('Sucesso!', 'Conteúdo criado com sucesso!', 'success')
        resetForm()
        loadConteudos()
      }
    }
  }

  async function handleDelete(id: string) {
    showConfirm(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita.',
      async () => {
        const { error } = await supabase
          .from('syllab_conteudos')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Erro ao excluir conteúdo:', error)
          showAlert('Erro ao Excluir', 'Não foi possível excluir o conteúdo.', 'error')
        } else {
          showAlert('Sucesso!', 'Conteúdo excluído com sucesso!', 'success')
          loadConteudos()
        }
      },
      { variant: 'destructive', confirmText: 'Excluir' }
    )
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'documento_geral': return 'Documento Geral'
      case 'jornada_aula': return 'Jornada de Aula'
      case 'avaliativo': return 'Avaliativo'
      default: return tipo
    }
  }

  // UI de bloqueio/acesso:
  function renderAccessGuard() {
    if (loading) return null

    // Sem registro -> Solicitar Acesso
    if (!hasProfessorRecord) {
      return (
        <Card className="mb-8 border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <ShieldAlert className="w-5 h-5" />
              Acesso de Professor Necessário
            </CardTitle>
            <CardDescription>
              Para acessar a área do professor, é necessário solicitar aprovação de um administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={solicitarAcesso} className="gap-2">
                Solicitar Acesso
              </Button>
              <Button variant="outline" onClick={initProfessor} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Atualizar Status
              </Button>
            </div>
            <p className="text-xs text-amber-800 mt-3">
              Após o envio, sua solicitação ficará com status "Pendente" até a aprovação.
            </p>
          </CardContent>
        </Card>
      )
    }

    // Com registro mas não aprovado
    if (professor && !isApproved(professor as any)) {
      const status = (professor as any)?.status
      return (
        <Card className="mb-8 border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Clock className="w-5 h-5" />
              {status === 'rejected' ? 'Solicitação Rejeitada' : 'Solicitação Pendente'}
            </CardTitle>
            <CardDescription>
              {status === 'rejected'
                ? 'Sua solicitação foi rejeitada. Entre em contato com o administrador para mais informações.'
                : 'Sua solicitação está em análise por um administrador.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="outline" onClick={initProfessor} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Atualizar Status
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Área do Professor</h1>
            <p className="text-slate-600">Gerencie o conteúdo das suas disciplinas</p>
          </div>
          <div className="flex space-x-2">
            {professor && isApproved(professor as any) ? (
              <>
                <Link href="/professor/instituicoes">
                  <Button variant="outline">
                    <Building2 className="w-4 h-4 mr-2" />
                    Instituições
                  </Button>
                </Link>
                <Link href="/professor/disciplinas">
                  <Button variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Minhas Disciplinas
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="outline" disabled title="Disponível após aprovação">
                  <Building2 className="w-4 h-4 mr-2" />
                  Instituições
                </Button>
                <Button variant="outline" disabled title="Disponível após aprovação">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Minhas Disciplinas
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Guard de acesso: Solicitar/Pendente/Rejeitado */}
        {renderAccessGuard()}

        {/* Se ainda carregando ou acesso não aprovado, parar aqui */}
        {loading || !professor || !isApproved(professor as any) ? null : (
          <>
            {/* Aviso se não houver instituições vinculadas */}
            {!verificandoInstituicoes && !temInstituicoes && (
              <Card className="mb-6 border-amber-300 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Building2 className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-900">Você precisa estar vinculado a uma instituição</h3>
                      <p className="text-sm text-amber-800 mt-1">
                        Antes de gerenciar disciplinas e conteúdos, você precisa cadastrar ou se vincular a uma instituição de ensino.
                      </p>
                      <Link href="/professor/instituicoes">
                        <Button size="sm" className="mt-3">
                          <Building2 className="w-4 h-4 mr-2" />
                          Gerenciar Instituições
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aviso se não houver disciplinas */}
            {temInstituicoes && disciplinas.length === 0 && (
              <Card className="mb-6 border-yellow-300 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900">Nenhuma disciplina cadastrada</h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    Você precisa cadastrar suas disciplinas antes de gerenciar conteúdos.
                  </p>
                  <Link href="/professor/disciplinas">
                    <Button size="sm" className="mt-3">
                      Cadastrar Disciplinas
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

            {/* Seleção de Disciplina - Só mostra se tiver instituições vinculadas */}
            {temInstituicoes && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Selecionar Disciplina</CardTitle>
                  <CardDescription>Escolha a disciplina para gerenciar o conteúdo</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={selectedDisciplina}
                    onChange={(e) => setSelectedDisciplina(e.target.value)}
                  >
                    <option value="">Selecione uma disciplina...</option>
                    {disciplinas.map(disc => (
                      <option key={disc.id} value={disc.id}>
                        {disc.codigo ? `${disc.codigo} - ` : ''}{disc.nome}
                      </option>
                    ))}
                  </Select>
                </CardContent>
              </Card>
            )}

            {selectedDisciplina && temInstituicoes && (
            <div>
            {/* Botão Adicionar */}
            <div className="mb-6">
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Conteúdo
                  </>
                )}
              </Button>
            </div>

            {/* Formulário */}
            {showForm && (
              <Card className="mb-8 border-2 border-blue-200">
                <CardHeader>
                  <CardTitle>
                    {editingId ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="titulo">Título *</Label>
                        <Input
                          id="titulo"
                          value={formData.titulo}
                          onChange={(e) => handleInputChange('titulo', e.target.value)}
                          placeholder="Ex: Aula 1 - Introdução"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="tipo">Tipo de Conteúdo *</Label>
                        <Select
                          id="tipo"
                          value={formData.tipo}
                          onChange={(e) => handleInputChange('tipo', e.target.value)}
                          required
                        >
                          <option value="documento_geral">Documento Geral</option>
                          <option value="jornada_aula">Jornada de Aula</option>
                          <option value="avaliativo">Avaliativo</option>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="ordem">Ordem</Label>
                        <Input
                          id="ordem"
                          type="number"
                          value={formData.ordem}
                          onChange={(e) => handleInputChange('ordem', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={formData.descricao}
                          onChange={(e) => handleInputChange('descricao', e.target.value)}
                          placeholder="Breve descrição do conteúdo"
                          rows={2}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="conteudo_texto">Conteúdo</Label>
                        <Textarea
                          id="conteudo_texto"
                          value={formData.conteudo_texto}
                          onChange={(e) => handleInputChange('conteudo_texto', e.target.value)}
                          placeholder="Conteúdo detalhado da aula ou atividade"
                          rows={4}
                        />
                      </div>

                      <div>
                        <UrlOuUpload
                          label="URL do Arquivo"
                          value={formData.arquivo_url}
                          onChange={(v) => handleInputChange('arquivo_url', v)}
                          placeholder="Cole uma URL ou envie um arquivo"
                          bucket="syllab"
                          folder={selectedDisciplina ? `disciplinas/${selectedDisciplina}/conteudos` : 'disciplinas/conteudos'}
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                          helperText="Arraste um arquivo ou cole uma URL. Formatos aceitos: PDF, Word, Excel, PowerPoint, Imagens"
                          preview
                        />
                      </div>

                      <div>
                        <Label htmlFor="data_limite">Data Limite</Label>
                        <Input
                          id="data_limite"
                          type="date"
                          value={formData.data_limite}
                          onChange={(e) => handleInputChange('data_limite', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        {editingId ? 'Atualizar' : 'Salvar'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Lista de Conteúdos */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Conteúdos Cadastrados</h2>
              
              {conteudos.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-slate-500">
                    Nenhum conteúdo cadastrado ainda. Clique em "Adicionar Conteúdo" para começar.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {conteudos.map(conteudo => (
                    <Card key={conteudo.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getTipoLabel(conteudo.tipo)}
                              </span>
                              <span className="text-sm text-slate-500">
                                Ordem: {conteudo.ordem}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                              {conteudo.titulo}
                            </h3>
                            {conteudo.descricao && (
                              <p className="text-sm text-slate-600 mb-2">
                                {conteudo.descricao}
                              </p>
                            )}
                            {conteudo.data_limite && (
                              <p className="text-xs text-slate-500">
                                Prazo: {new Date(conteudo.data_limite).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                            
                            {/* Botão para gerenciar slides se for jornada_aula */}
                            {conteudo.tipo === 'jornada_aula' && (
                              <div className="mt-3">
                                <Link href={`/professor/conteudo/${conteudo.id}/slides`}>
                                  <Button size="sm" variant="outline" className="gap-2">
                                    <Presentation className="w-4 h-4" />
                                    Gerenciar Slides
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(conteudo)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(conteudo.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            </div>
        )}
          </>
        )}      </main>
    </div>
    <AlertComponent />
    <ConfirmComponent />
    </ProtectedRoute>
  )
}
