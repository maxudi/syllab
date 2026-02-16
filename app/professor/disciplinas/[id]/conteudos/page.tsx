'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ColorThemeSelector } from '@/components/color-theme-selector'
import UrlOuUpload from '@/components/url-ou-upload'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Plus, Trash2, Edit, Save, X, FileText, Presentation, ArrowLeft, Calendar, File } from 'lucide-react'
import Link from 'next/link'

type Conteudo = {
  id: string
  titulo: string
  descricao: string | null
  tipo: string
  ordem: number
  cor_tema: string | null
  data_limite: string | null
  arquivo_url: string | null
  ativo: boolean
  created_at: string
}

type Disciplina = {
  id: string
  nome: string
  codigo: string | null
  instituicao_id: string
}

export default function ConteudosDisciplinaPage() {
  const params = useParams()
  const router = useRouter()
  const disciplinaId = params.id as string

  const [disciplina, setDisciplina] = useState<Disciplina | null>(null)
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'jornada_aula',
    ordem: '',
    cor_tema: 'vermelho',
    data_limite: '',
    arquivo_url: '',
    ativo: true
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

    await loadDisciplina()
    await loadConteudos()
  }

  async function loadDisciplina() {
    const { data, error } = await supabase
      .from('syllab_disciplinas')
      .select('id, nome, codigo, instituicao_id')
      .eq('id', disciplinaId)
      .single()

    if (error) {
      console.error('Erro ao carregar disciplina:', error)
      alert('Disciplina não encontrada')
      router.push('/professor/disciplinas')
    } else {
      setDisciplina(data)
    }
  }

  async function loadConteudos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('syllab_conteudos')
      .select('*')
      .eq('disciplina_id', disciplinaId)
      .order('ordem', { ascending: true })

    if (error) {
      console.error('Erro ao carregar conteúdos:', error)
      alert('Erro ao carregar conteúdos')
    } else {
      setConteudos(data || [])
    }
    setLoading(false)
  }

  function resetForm() {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'jornada_aula',
      ordem: '',
      cor_tema: 'vermelho',
      data_limite: '',
      arquivo_url: '',
      ativo: true
    })
    setShowForm(false)
    setEditingId(null)
  }

  function handleEdit(conteudo: Conteudo) {
    setFormData({
      titulo: conteudo.titulo,
      descricao: conteudo.descricao || '',
      tipo: conteudo.tipo,
      ordem: conteudo.ordem.toString(),
      cor_tema: conteudo.cor_tema || 'vermelho',
      data_limite: conteudo.data_limite || '',
      arquivo_url: conteudo.arquivo_url || '',
      ativo: conteudo.ativo
    })
    setEditingId(conteudo.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.titulo.trim()) {
      alert('Informe o título do conteúdo')
      return
    }

    setLoading(true)

    const conteudoData = {
      titulo: formData.titulo,
      descricao: formData.descricao || null,
      tipo: formData.tipo,
      ordem: formData.ordem ? parseInt(formData.ordem) : (conteudos.length + 1),
      cor_tema: formData.cor_tema,
      data_limite: formData.data_limite || null,
      arquivo_url: formData.arquivo_url || null,
      disciplina_id: disciplinaId,
      ativo: formData.ativo
    }

    if (editingId) {
      // Atualizar
      const { error } = await supabase
        .from('syllab_conteudos')
        .update(conteudoData)
        .eq('id', editingId)

      if (error) {
        console.error('Erro ao atualizar conteúdo:', error)
        alert(`Erro ao atualizar: ${error.message}`)
      } else {
        alert('Conteúdo atualizado com sucesso!')
        resetForm()
        loadConteudos()
      }
    } else {
      // Criar
      const { error } = await supabase
        .from('syllab_conteudos')
        .insert([conteudoData])

      if (error) {
        console.error('Erro ao criar conteúdo:', error)
        alert(`Erro ao criar: ${error.message}`)
      } else {
        alert('Conteúdo criado com sucesso!')
        resetForm()
        loadConteudos()
      }
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja DELETAR permanentemente este conteúdo? Esta ação não pode ser desfeita.')) {
      return
    }

    const { error } = await supabase
      .from('syllab_conteudos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir conteúdo:', error)
      alert('Erro ao excluir conteúdo')
    } else {
      alert('Conteúdo excluído com sucesso!')
      loadConteudos()
    }
  }

  const getTemaColors = (tema: string | null) => {
    const temas: Record<string, { bg: string; border: string; text: string }> = {
      vermelho: { bg: '#ffebee', border: '#d32f2f', text: '#b71c1c' },
      azul: { bg: '#e3f2fd', border: '#1565c0', text: '#0d47a1' },
      verde: { bg: '#e8f5e9', border: '#2e7d32', text: '#1b5e20' },
      roxo: { bg: '#f3e5f5', border: '#6a1b9a', text: '#4a148c' },
      vinho: { bg: '#fce4ec', border: '#ad1457', text: '#880e4f' },
      cinza: { bg: '#eceff1', border: '#37474f', text: '#263238' }
    }
    return temas[tema || 'vermelho'] || temas.vermelho
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/professor/disciplinas"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Disciplinas
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center">
                  <FileText className="mr-3 h-10 w-10 text-blue-600" />
                  Conteúdos
                </h1>
                {disciplina && (
                  <p className="text-slate-600">
                    {disciplina.codigo && `${disciplina.codigo} - `}
                    {disciplina.nome}
                  </p>
                )}
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                disabled={loading}
              >
                {showForm ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Conteúdo
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Formulário */}
          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>
                  {editingId ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                </CardTitle>
                <CardDescription>
                  Preencha os dados do conteúdo. Os slides serão adicionados depois.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        placeholder="Ex: AULA 01 - Introdução"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="tipo">Tipo *</Label>
                      <select
                        id="tipo"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="jornada_aula">Jornada de Aula</option>
                        <option value="avaliativo">Avaliativo</option>
                        <option value="documento_geral">Documento Geral</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descreva brevemente o conteúdo..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="ordem">Ordem</Label>
                      <Input
                        id="ordem"
                        type="number"
                        value={formData.ordem}
                        onChange={(e) => setFormData({ ...formData, ordem: e.target.value })}
                        placeholder="Ex: 1, 2, 3..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Deixe vazio para adicionar no final
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="data_limite">Data Limite</Label>
                      <Input
                        id="data_limite"
                        type="date"
                        value={formData.data_limite}
                        onChange={(e) => setFormData({ ...formData, data_limite: e.target.value })}
                      />
                    </div>

                    <div>
                      <UrlOuUpload
                        label="URL do Arquivo"
                        value={formData.arquivo_url}
                        onChange={(v) => setFormData({ ...formData, arquivo_url: v })}
                        placeholder="Cole uma URL ou envie um arquivo"
                        folder={disciplina ? `disciplinas/${disciplina.id}/conteudos` : 'disciplinas/conteudos'}
                        accept="image/*,.pdf,application/pdf"
                        preview
                      />
                    </div>
                  </div>

                  {/* Checkbox Ativo */}
                  <div className="flex items-center space-x-2 border p-4 rounded-lg bg-slate-50">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="ativo" className="cursor-pointer">
                      <span className="font-medium">Conteúdo Ativo</span>
                      <p className="text-xs text-gray-600 mt-1">
                        Apenas conteúdos ativos serão visíveis para os alunos
                      </p>
                    </Label>
                  </div>

                  {/* Seletor de Tema de Cores */}
                  <div className="border-t pt-6">
                    <ColorThemeSelector
                      value={formData.cor_tema}
                      onChange={(cor) => setFormData({ ...formData, cor_tema: cor })}
                      label="Tema de Cores da Apresentação"
                      showDescription={true}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingId ? 'Atualizar' : 'Criar'} Conteúdo
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Conteúdos */}
          <div className="space-y-4">
            {loading && conteudos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Carregando conteúdos...</p>
              </div>
            ) : conteudos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-600 mb-4">Nenhum conteúdo cadastrado</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Conteúdo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Jornada de Aulas */}
                {conteudos.filter(c => c.tipo === 'jornada_aula').length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Jornada de Aulas</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {conteudos
                        .filter(c => c.tipo === 'jornada_aula')
                        .map((conteudo) => {
                          const cores = getTemaColors(conteudo.cor_tema)
                          return (
                            <Card 
                              key={conteudo.id}
                              className="hover:shadow-lg transition-shadow"
                              style={{ 
                                borderLeft: `6px solid ${cores.border}`,
                                backgroundColor: cores.bg
                              }}
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span 
                                        className="text-sm font-semibold px-3 py-1 rounded-full"
                                        style={{ 
                                          backgroundColor: cores.border,
                                          color: 'white'
                                        }}
                                      >
                                        #{conteudo.ordem}
                                      </span>
                                      {!conteudo.ativo && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                          INATIVO
                                        </span>
                                      )}
                                      <h3 
                                        className="text-xl font-bold"
                                        style={{ color: cores.text }}
                                      >
                                        {conteudo.titulo}
                                      </h3>
                                    </div>
                                    {conteudo.descricao && (
                                      <p className="text-sm text-slate-700 mb-3">
                                        {conteudo.descricao}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                      {conteudo.data_limite && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          {new Date(conteudo.data_limite).toLocaleDateString('pt-BR')}
                                        </span>
                                      )}
                                      {conteudo.arquivo_url && (
                                        <a 
                                          href={conteudo.arquivo_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 hover:underline text-blue-600"
                                        >
                                          <File className="w-4 h-4" />
                                          Arquivo
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <Link href={`/professor/conteudo/${conteudo.id}/slides`}>
                                      <Button size="sm" variant="outline">
                                        <Presentation className="w-4 h-4 mr-1" />
                                        Slides
                                      </Button>
                                    </Link>
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
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Avaliativos */}
                {conteudos.filter(c => c.tipo === 'avaliativo').length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Avaliativos</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {conteudos
                        .filter(c => c.tipo === 'avaliativo')
                        .map((conteudo) => {
                          const cores = getTemaColors(conteudo.cor_tema)
                          return (
                            <Card 
                              key={conteudo.id}
                              className="hover:shadow-lg transition-shadow"
                              style={{ 
                                borderLeft: `6px solid ${cores.border}`,
                                backgroundColor: cores.bg
                              }}
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      {!conteudo.ativo && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                          INATIVO
                                        </span>
                                      )}
                                      <h3 
                                        className="text-xl font-bold"
                                        style={{ color: cores.text }}
                                      >
                                        {conteudo.titulo}
                                      </h3>
                                    </div>
                                    {conteudo.descricao && (
                                      <p className="text-sm text-slate-700 mb-3">
                                        {conteudo.descricao}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                      {conteudo.data_limite && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          {new Date(conteudo.data_limite).toLocaleDateString('pt-BR')}
                                        </span>
                                      )}
                                      {conteudo.arquivo_url && (
                                        <a 
                                          href={conteudo.arquivo_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 hover:underline text-blue-600"
                                        >
                                          <File className="w-4 h-4" />
                                          Arquivo
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <Link href={`/professor/conteudo/${conteudo.id}/slides`}>
                                      <Button size="sm" variant="outline">
                                        <Presentation className="w-4 h-4 mr-1" />
                                        Slides
                                      </Button>
                                    </Link>
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
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Documentos Gerais */}
                {conteudos.filter(c => c.tipo === 'documento_geral').length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Documentos Gerais</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {conteudos
                        .filter(c => c.tipo === 'documento_geral')
                        .map((conteudo) => {
                          const cores = getTemaColors(conteudo.cor_tema)
                          return (
                            <Card 
                              key={conteudo.id}
                              className="hover:shadow-lg transition-shadow"
                              style={{ 
                                borderLeft: `6px solid ${cores.border}`,
                                backgroundColor: cores.bg
                              }}
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 
                                      className="text-xl font-bold mb-2"
                                      style={{ color: cores.text }}
                                    >
                                      {conteudo.titulo}
                                    </h3>
                                    {conteudo.descricao && (
                                      <p className="text-sm text-slate-700 mb-3">
                                        {conteudo.descricao}
                                      </p>
                                    )}
                                    {conteudo.arquivo_url && (
                                      <a 
                                        href={conteudo.arquivo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:underline text-blue-600 text-sm"
                                      >
                                        <File className="w-4 h-4" />
                                        Baixar Arquivo
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex gap-2 ml-4">
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
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
