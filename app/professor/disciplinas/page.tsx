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
import { Select } from '@/components/ui/select'
import { supabase, type Disciplina, type Instituicao, type Professor } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Plus, Trash2, Edit, Save, X, BookOpen, Building2, Link as LinkIcon, FileText, Lock, Globe, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useAlert, useConfirm } from '@/components/alert-dialog'

export default function DisciplinasPage() {
  const { showAlert, AlertComponent } = useAlert()
  const { showConfirm, ConfirmComponent } = useConfirm()
  const router = useRouter()
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([])
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [codigoCopied, setCodigoCopied] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    descricao: '',
    carga_horaria: '',
    semestre: '',
    ano: new Date().getFullYear().toString(),
    instituicao_id: '',
    cor_tema: '#1e40af',
    publica: true,
    codigo_acesso: ''
  })

  useEffect(() => {
    init()
  }, [])

  async function init() {
    await loadProfessor()
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
        loadDisciplinas(newProf.id)
        loadInstituicoes(newProf.id)
      } else {
        console.error('Erro ao buscar professor:', profError)
      }
    } else {
      setProfessor(professorData)
      loadDisciplinas(professorData.id)
      loadInstituicoes(professorData.id)
    }
  }

  async function loadDisciplinas(professorId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('syllab_disciplinas')
      .select(`
        *,
        instituicao:instituicao_id (
          id,
          nome,
          sigla
        )
      `)
      .eq('professor_id', professorId)
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao carregar disciplinas:', error)
    } else {
      setDisciplinas(data || [])
    }
    setLoading(false)
  }

  async function loadInstituicoes(professorId: string) {
    // Buscar IDs das instituições vinculadas ao professor
    const { data: vinculos, error: errorVinculos } = await supabase
      .from('syllab_professor_instituicoes')
      .select('instituicao_id')
      .eq('professor_id', professorId)
      .eq('ativo', true)

    if (errorVinculos) {
      console.error('Erro ao carregar vínculos:', errorVinculos)
      setInstituicoes([])
      return
    }

    if (!vinculos || vinculos.length === 0) {
      setInstituicoes([])
      return
    }

    // Buscar as instituições pelos IDs
    const instituicaoIds = vinculos.map(v => v.instituicao_id)
    const { data, error } = await supabase
      .from('syllab_instituicoes')
      .select('*')
      .in('id', instituicaoIds)
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao carregar instituições:', error)
      setInstituicoes([])
    } else {
      setInstituicoes(data || [])
    }
  }

  function gerarCodigoAcesso(): string {
    // Gera um código único de 8 caracteres (letras maiúsculas e números)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let codigo = ''
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return codigo
  }

  function resetForm() {
    setFormData({
      nome: '',
      codigo: '',
      descricao: '',
      carga_horaria: '',
      semestre: '',
      ano: new Date().getFullYear().toString(),
      instituicao_id: '',
      cor_tema: '#1e40af',
      publica: true,
      codigo_acesso: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(disciplina: Disciplina) {
    setFormData({
      nome: disciplina.nome,
      codigo: disciplina.codigo || '',
      descricao: disciplina.descricao || '',
      carga_horaria: disciplina.carga_horaria?.toString() || '',
      semestre: disciplina.semestre || '',
      ano: disciplina.ano?.toString() || '',
      instituicao_id: disciplina.instituicao_id,
      cor_tema: disciplina.cor_tema,
      publica: disciplina.publica !== undefined ? disciplina.publica : true,
      codigo_acesso: disciplina.codigo_acesso || ''
    })
    setEditingId(disciplina.id)
    setShowForm(true)
  }

  async function vincularProfessorInstituicao(professorId: string, instituicaoId: string) {
    // Verificar se já existe vínculo
    const { data: vinculoExistente } = await supabase
      .from('syllab_professor_instituicoes')
      .select('id')
      .eq('professor_id', professorId)
      .eq('instituicao_id', instituicaoId)
      .eq('ativo', true)
      .single()

    if (vinculoExistente) {
      console.log('Vínculo já existe')
      return true
    }

    // Criar vínculo
    const { error } = await supabase
      .from('syllab_professor_instituicoes')
      .insert([{
        professor_id: professorId,
        instituicao_id: instituicaoId,
        ativo: true
      }])

    if (error) {
      console.error('Erro ao vincular professor à instituição:', error)
      return false
    }

    console.log('Professor vinculado à instituição com sucesso')
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!professor) {
      showAlert('Erro', 'Professor não identificado', 'error')
      return
    }

    if (!formData.instituicao_id) {
      showAlert('Atenção', 'Selecione uma instituição', 'warning')
      return
    }

    setLoading(true)

    // Vincular professor à instituição (se ainda não estiver vinculado)
    const vinculado = await vincularProfessorInstituicao(professor.id, formData.instituicao_id)
    if (!vinculado && !editingId) {
      showAlert('Erro', 'Erro ao vincular professor à instituição', 'error')
      setLoading(false)
      return
    }

    // Se a disciplina não é pública e não tem código, gerar um
    let codigoAcesso = formData.codigo_acesso
    if (!formData.publica && !codigoAcesso) {
      codigoAcesso = gerarCodigoAcesso()
    } else if (formData.publica) {
      codigoAcesso = '' // Limpar código se a disciplina for pública
    }

    const disciplinaData = {
      ...formData,
      carga_horaria: formData.carga_horaria ? parseInt(formData.carga_horaria) : null,
      ano: formData.ano ? parseInt(formData.ano) : null,
      codigo_acesso: codigoAcesso || null,
      professor_id: professor.id
    }

    console.log('Salvando disciplina:', disciplinaData)

    if (editingId) {
      // Atualizar
      const { error } = await supabase
        .from('syllab_disciplinas')
        .update(disciplinaData)
        .eq('id', editingId)

      if (error) {
        console.error('Erro ao atualizar disciplina:', error)
        showAlert('Erro', `Erro ao atualizar disciplina: ${error.message}`, 'error')
      } else {
        showAlert('Sucesso', 'Disciplina atualizada com sucesso!', 'success')
        resetForm()
        loadDisciplinas(professor.id)
      }
    } else {
      // Criar
      const { error } = await supabase
        .from('syllab_disciplinas')
        .insert([disciplinaData])

      if (error) {
        console.error('Erro ao criar disciplina:', error)
        showAlert('Erro', `Erro ao criar disciplina: ${error.message}`, 'error')
      } else {
        showAlert('Sucesso', 'Disciplina criada com sucesso! Você foi automaticamente vinculado a esta instituição.', 'success')
        resetForm()
        loadDisciplinas(professor.id)
      }
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    showConfirm(
      'Excluir Disciplina',
      'Tem certeza que deseja excluir esta disciplina? Esta ação não pode ser desfeita.',
      async () => {
        await executeDelete(id)
      },
      { variant: 'destructive', confirmText: 'Excluir' }
    )
  }

  async function executeDelete(id: string) {

    const { error } = await supabase
      .from('syllab_disciplinas')
      .update({ ativo: false })
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir disciplina:', error)
      showAlert('Erro', 'Erro ao excluir disciplina', 'error')
    } else {
      showAlert('Sucesso', 'Disciplina excluída com sucesso!', 'success')
      if (professor) loadDisciplinas(professor.id)
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
                <BookOpen className="mr-3 h-10 w-10 text-blue-600" />
                Minhas Disciplinas
              </h1>
              <p className="text-slate-600">Gerencie suas disciplinas</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/professor/meus-vinculos">
                <Button variant="outline">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Meus Vínculos
                </Button>
              </Link>
              <Link href="/professor/instituicoes">
                <Button variant="outline">
                  <Building2 className="w-4 h-4 mr-2" />
                  Instituições
                </Button>
              </Link>
              <Link href="/professor">
                <Button variant="outline">
                  Gerenciar Conteúdos
                </Button>
              </Link>
            </div>
          </div>

          {/* Botão Adicionar */}
          {instituicoes.length === 0 ? (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <Building2 className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    Você precisa estar vinculado a uma instituição
                  </p>
                  <p className="text-sm text-amber-700 mb-3">
                    Para criar disciplinas, primeiro cadastre ou vincule-se a uma instituição de ensino.
                  </p>
                  <Link href="/professor/instituicoes">
                    <Button size="sm" variant="outline">
                      <Building2 className="w-4 h-4 mr-2" />
                      Gerenciar Instituições
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <Button onClick={() => setShowForm(!showForm)} disabled={loading}>
                {showForm ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Disciplina
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Formulário */}
          {showForm && (
            <Card className="mb-8 border-2 border-blue-200">
              <CardHeader>
                <CardTitle>
                  {editingId ? 'Editar Disciplina' : 'Nova Disciplina'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="nome">Nome da Disciplina *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Introdução à Programação"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="codigo">Código</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        placeholder="Ex: CC101"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="instituicao_id">Instituição *</Label>
                      <Select
                        id="instituicao_id"
                        value={formData.instituicao_id}
                        onChange={(e) => setFormData({ ...formData, instituicao_id: e.target.value })}
                        required
                        disabled={loading || instituicoes.length === 0}
                      >
                        <option value="">
                          {instituicoes.length === 0 ? 'Nenhuma instituição vinculada' : 'Selecione...'}
                        </option>
                        {instituicoes.map(inst => (
                          <option key={inst.id} value={inst.id}>
                            {inst.sigla ? `${inst.sigla} - ` : ''}{inst.nome}
                          </option>
                        ))}
                      </Select>
                      {instituicoes.length === 0 && (
                        <p className="text-sm text-amber-600 mt-1">
                          Você precisa se vincular a uma instituição primeiro.
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="carga_horaria">Carga Horária (horas)</Label>
                      <Input
                        id="carga_horaria"
                        type="number"
                        value={formData.carga_horaria}
                        onChange={(e) => setFormData({ ...formData, carga_horaria: e.target.value })}
                        placeholder="60"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="semestre">Semestre</Label>
                      <Input
                        id="semestre"
                        value={formData.semestre}
                        onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                        placeholder="Ex: 2024/1"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ano">Ano</Label>
                      <Input
                        id="ano"
                        type="number"
                        value={formData.ano}
                        onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                        placeholder="2024"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cor_tema">Cor do Tema</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="cor_tema"
                          type="color"
                          value={formData.cor_tema}
                          onChange={(e) => setFormData({ ...formData, cor_tema: e.target.value })}
                          className="w-20"
                          disabled={loading}
                        />
                        <Input
                          value={formData.cor_tema}
                          onChange={(e) => setFormData({ ...formData, cor_tema: e.target.value })}
                          placeholder="#1e40af"
                          className="flex-1"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="publica">Visibilidade da Disciplina</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="publica"
                            checked={formData.publica === true}
                            onChange={() => setFormData({ ...formData, publica: true, codigo_acesso: '' })}
                            disabled={loading}
                            className="w-4 h-4"
                          />
                          <Globe className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Pública - Todos podem acessar</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="publica"
                            checked={formData.publica === false}
                            onChange={() => {
                              const novoCodigo = formData.codigo_acesso || gerarCodigoAcesso()
                              setFormData({ ...formData, publica: false, codigo_acesso: novoCodigo })
                            }}
                            disabled={loading}
                            className="w-4 h-4"
                          />
                          <Lock className="w-4 h-4 text-amber-600" />
                          <span className="text-sm">Privada - Requer código de acesso</span>
                        </label>
                      </div>
                    </div>

                    {!formData.publica && (
                      <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <Label htmlFor="codigo_acesso" className="flex items-center text-amber-900">
                          <Lock className="w-4 h-4 mr-2" />
                          Código de Acesso
                        </Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Input
                            id="codigo_acesso"
                            value={formData.codigo_acesso}
                            readOnly
                            className="font-mono text-lg font-bold bg-white"
                            disabled={loading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(formData.codigo_acesso)
                              setCodigoCopied(formData.codigo_acesso)
                              setTimeout(() => setCodigoCopied(null), 2000)
                            }}
                            disabled={loading}
                          >
                            {codigoCopied === formData.codigo_acesso ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({ ...formData, codigo_acesso: gerarCodigoAcesso() })}
                            disabled={loading}
                          >
                            Gerar Novo
                          </Button>
                        </div>
                        <p className="text-xs text-amber-700 mt-2">
                          Compartilhe este código com seus alunos para que possam acessar a disciplina.
                        </p>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Breve descrição da disciplina"
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

          {/* Lista de Disciplinas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && disciplinas.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-600">Carregando disciplinas...</p>
              </div>
            ) : disciplinas.length === 0 && instituicoes.length > 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-600 mb-4">Nenhuma disciplina cadastrada</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeira Disciplina
                </Button>
              </div>
            ) : (
              disciplinas.map((disciplina) => (
                <Card 
                  key={disciplina.id} 
                  className="hover:shadow-lg transition-shadow"
                  style={{ borderTop: `4px solid ${disciplina.cor_tema}` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-2">
                        {disciplina.codigo && (
                          <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {disciplina.codigo}
                          </span>
                        )}
                        {!disciplina.publica ? (
                          <span className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded flex items-center">
                            <Lock className="w-3 h-3 mr-1" />
                            Privada
                          </span>
                        ) : (
                          <span className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            Pública
                          </span>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{disciplina.nome}</CardTitle>
                    <CardDescription>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center text-sm">
                          <Building2 className="w-4 h-4 mr-1" />
                          {(disciplina as any).instituicao?.sigla || (disciplina as any).instituicao?.nome}
                        </div>
                        {disciplina.semestre && (
                          <div className="text-sm">
                            {disciplina.semestre}
                            {disciplina.ano && ` - ${disciplina.ano}`}
                          </div>
                        )}
                        {disciplina.carga_horaria && (
                          <div className="text-sm">
                            {disciplina.carga_horaria}h
                          </div>
                        )}
                        {!disciplina.publica && disciplina.codigo_acesso && (
                          <div className="text-sm font-mono bg-amber-100 text-amber-900 px-2 py-1 rounded mt-2 flex items-center justify-between">
                            <span>Código: {disciplina.codigo_acesso}</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                navigator.clipboard.writeText(disciplina.codigo_acesso || '')
                                setCodigoCopied(disciplina.codigo_acesso || null)
                                setTimeout(() => setCodigoCopied(null), 2000)
                              }}
                              className="ml-2 p-1 hover:bg-amber-200 rounded"
                            >
                              {codigoCopied === disciplina.codigo_acesso ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {disciplina.descricao && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {disciplina.descricao}
                      </p>
                    )}
                    <div className="space-y-2">
                      <Link href={`/professor/disciplinas/${disciplina.id}/conteudos`}>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Gerenciar Conteúdos
                        </Button>
                      </Link>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(disciplina)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(disciplina.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
