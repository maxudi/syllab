"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Edit, Save, X, ArrowLeft, ArrowUp, ArrowDown, Eye, Image, FileText, Link as LinkIcon, Film } from 'lucide-react'
import Link from 'next/link'

interface Slide {
  id: string
  conteudo_id: string
  ordem: number
  titulo: string
  conteudo_html: string | null
  tipo_midia: 'texto' | 'imagem' | 'pdf' | 'url' | 'video' | null
  midia_url: string | null
  midia_legenda: string | null
  icone: string | null
  notas_professor: string | null
  duracao_estimada: number | null
  ativo: boolean
}

interface Conteudo {
  id: string
  titulo: string
  tipo: string
  tem_slides: boolean
}

export default function SlidesManagerPage() {
  const params = useParams()
  const router = useRouter()
  const conteudoId = params?.id as string

  const [conteudo, setConteudo] = useState<Conteudo | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo_html: '',
    tipo_midia: 'texto' as 'texto' | 'imagem' | 'pdf' | 'url' | 'video',
    midia_url: '',
    midia_legenda: '',
    icone: '',
    notas_professor: '',
    duracao_estimada: 5
  })

  useEffect(() => {
    if (conteudoId) {
      loadConteudo()
      loadSlides()
    }
  }, [conteudoId])

  async function loadConteudo() {
    const { data, error } = await supabase
      .from('syllab_conteudos')
      .select('id, titulo, tipo, tem_slides')
      .eq('id', conteudoId)
      .single()

    if (error) {
      console.error('Erro ao carregar conteúdo:', error)
      alert('Erro ao carregar conteúdo')
    } else {
      setConteudo(data)
    }
  }

  async function loadSlides() {
    const { data, error } = await supabase
      .from('syllab_slides')
      .select('*')
      .eq('conteudo_id', conteudoId)
      .eq('ativo', true)
      .order('ordem')

    if (error) {
      console.error('Erro ao carregar slides:', error)
    } else {
      setSlides(data || [])
    }
  }

  function handleInputChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setFormData({
      titulo: '',
      conteudo_html: '',
      tipo_midia: 'texto',
      midia_url: '',
      midia_legenda: '',
      icone: '',
      notas_professor: '',
      duracao_estimada: 5
    })
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(slide: Slide) {
    setFormData({
      titulo: slide.titulo,
      conteudo_html: slide.conteudo_html || '',
      tipo_midia: slide.tipo_midia || 'texto',
      midia_url: slide.midia_url || '',
      midia_legenda: slide.midia_legenda || '',
      icone: slide.icone || '',
      notas_professor: slide.notas_professor || '',
      duracao_estimada: slide.duracao_estimada || 5
    })
    setEditingId(slide.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.titulo.trim()) {
      alert('O título é obrigatório')
      return
    }

    try {
      if (editingId) {
        // Atualizar slide existente
        const { error } = await supabase
          .from('syllab_slides')
          .update({
            titulo: formData.titulo,
            conteudo_html: formData.conteudo_html,
            tipo_midia: formData.tipo_midia,
            midia_url: formData.midia_url,
            midia_legenda: formData.midia_legenda,
            icone: formData.icone,
            notas_professor: formData.notas_professor,
            duracao_estimada: formData.duracao_estimada
          })
          .eq('id', editingId)

        if (error) throw error
        alert('Slide atualizado com sucesso!')
      } else {
        // Criar novo slide
        const maxOrdem = slides.length > 0 ? Math.max(...slides.map(s => s.ordem)) : -1
        
        const { error } = await supabase
          .from('syllab_slides')
          .insert([{
            conteudo_id: conteudoId,
            ordem: maxOrdem + 1,
            titulo: formData.titulo,
            conteudo_html: formData.conteudo_html,
            tipo_midia: formData.tipo_midia,
            midia_url: formData.midia_url,
            midia_legenda: formData.midia_legenda,
            icone: formData.icone,
            notas_professor: formData.notas_professor,
            duracao_estimada: formData.duracao_estimada
          }])

        if (error) throw error

        // Atualizar flag tem_slides no conteúdo
        await supabase
          .from('syllab_conteudos')
          .update({ tem_slides: true })
          .eq('id', conteudoId)

        alert('Slide criado com sucesso!')
      }

      resetForm()
      loadSlides()
    } catch (error: any) {
      console.error('Erro ao salvar slide:', error)
      alert(`Erro ao salvar slide: ${error.message}`)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir este slide?')) return

    const { error } = await supabase
      .from('syllab_slides')
      .update({ ativo: false })
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir slide:', error)
      alert('Erro ao excluir slide')
    } else {
      alert('Slide excluído com sucesso!')
      loadSlides()
    }
  }

  async function handleReorder(slideId: string, direction: 'up' | 'down') {
    const currentIndex = slides.findIndex(s => s.id === slideId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= slides.length) return

    const newSlides = [...slides]
    const [movedSlide] = newSlides.splice(currentIndex, 1)
    newSlides.splice(newIndex, 0, movedSlide)

    // Atualizar ordem de todos os slides
    const updates = newSlides.map((slide, index) => 
      supabase
        .from('syllab_slides')
        .update({ ordem: index })
        .eq('id', slide.id)
    )

    try {
      await Promise.all(updates)
      loadSlides()
    } catch (error) {
      console.error('Erro ao reordenar slides:', error)
      alert('Erro ao reordenar slides')
    }
  }

  const getTipoMidiaIcon = (tipo: string | null) => {
    switch (tipo) {
      case 'imagem': return <Image className="h-4 w-4" />
      case 'pdf': return <FileText className="h-4 w-4" />
      case 'url': return <LinkIcon className="h-4 w-4" />
      case 'video': return <Film className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Link href="/professor">
                <Button variant="outline" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Conteúdos
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Slides
              </h1>
              {conteudo && (
                <p className="text-gray-600 mt-2">
                  Aula: <span className="font-semibold">{conteudo.titulo}</span>
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              {slides.length > 0 && (
                <Link href={`/aula/${conteudoId}`} target="_blank">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar Aula
                  </Button>
                </Link>
              )}
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Slide
                  </>
                )}
              </Button>
            </div>
          </div>

          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingId ? 'Editar Slide' : 'Novo Slide'}</CardTitle>
                <CardDescription>
                  Preencha as informações do slide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="titulo">Título do Slide *</Label>
                      <Input
                        id="titulo"
                        value={formData.titulo}
                        onChange={(e) => handleInputChange('titulo', e.target.value)}
                        placeholder="Ex: Introdução à Segurança"
                        required
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="icone">Ícone (Bootstrap Icons)</Label>
                      <Input
                        id="icone"
                        value={formData.icone}
                        onChange={(e) => handleInputChange('icone', e.target.value)}
                        placeholder="Ex: bi-shield-lock-fill"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Veja ícones em: <a href="https://icons.getbootstrap.com" target="_blank" className="text-blue-600">icons.getbootstrap.com</a>
                      </p>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="conteudo_html">Conteúdo (HTML)</Label>
                      <Textarea
                        id="conteudo_html"
                        value={formData.conteudo_html}
                        onChange={(e) => handleInputChange('conteudo_html', e.target.value)}
                        placeholder="<p>Conteúdo do slide em HTML...</p><ul><li>Item 1</li></ul>"
                        rows={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use tags HTML como &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;div class=&quot;highlight-box&quot;&gt; etc.
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="tipo_midia">Tipo de Mídia</Label>
                      <select
                        id="tipo_midia"
                        value={formData.tipo_midia}
                        onChange={(e) => handleInputChange('tipo_midia', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="texto">Apenas Texto</option>
                        <option value="imagem">Imagem</option>
                        <option value="pdf">PDF</option>
                        <option value="url">URL/Link</option>
                        <option value="video">Vídeo</option>
                      </select>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="duracao_estimada">Duração (minutos)</Label>
                      <Input
                        id="duracao_estimada"
                        type="number"
                        value={formData.duracao_estimada}
                        onChange={(e) => handleInputChange('duracao_estimada', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>

                    {formData.tipo_midia !== 'texto' && (
                      <>
                        <div className="col-span-2">
                          <Label htmlFor="midia_url">URL da Mídia</Label>
                          <Input
                            id="midia_url"
                            value={formData.midia_url}
                            onChange={(e) => handleInputChange('midia_url', e.target.value)}
                            placeholder={
                              formData.tipo_midia === 'imagem' ? 'https://exemplo.com/imagem.jpg' :
                              formData.tipo_midia === 'pdf' ? 'https://exemplo.com/documento.pdf' :
                              formData.tipo_midia === 'video' ? 'https://youtube.com/watch?v=...' :
                              'https://exemplo.com'
                            }
                          />
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor="midia_legenda">Legenda/Descrição da Mídia</Label>
                          <Input
                            id="midia_legenda"
                            value={formData.midia_legenda}
                            onChange={(e) => handleInputChange('midia_legenda', e.target.value)}
                            placeholder="Descrição da mídia"
                          />
                        </div>
                      </>
                    )}

                    <div className="col-span-2">
                      <Label htmlFor="notas_professor">Notas do Professor (privadas)</Label>
                      <Textarea
                        id="notas_professor"
                        value={formData.notas_professor}
                        onChange={(e) => handleInputChange('notas_professor', e.target.value)}
                        placeholder="Notas e lembretes pessoais sobre este slide..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      {editingId ? 'Atualizar' : 'Criar'} Slide
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {slides.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold mb-2">Nenhum slide criado</p>
                <p className="mb-4">Comece criando o primeiro slide desta aula</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Slide
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {slides.map((slide, index) => (
                <Card key={slide.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {slide.icone && <i className={`bi ${slide.icone} mr-2`}></i>}
                              {slide.titulo}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                {getTipoMidiaIcon(slide.tipo_midia)}
                                {slide.tipo_midia || 'texto'}
                              </span>
                              {slide.duracao_estimada && (
                                <span>⏱ {slide.duracao_estimada} min</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {slide.conteudo_html && (
                          <div className="text-sm text-gray-600 ml-11 line-clamp-2">
                            {slide.conteudo_html.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(slide.id, 'up')}
                          disabled={index === 0}
                          title="Mover para cima"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(slide.id, 'down')}
                          disabled={index === slides.length - 1}
                          title="Mover para baixo"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(slide)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(slide.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {slides.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">
                Total de {slides.length} slide{slides.length !== 1 ? 's' : ''}
                {slides.some(s => s.duracao_estimada) && (
                  <span className="ml-2">
                    • Duração total estimada: {slides.reduce((acc, s) => acc + (s.duracao_estimada || 0), 0)} minutos
                  </span>
                )}
              </p>
              <Link href={`/aula/${conteudoId}`} target="_blank">
                <Button size="lg">
                  <Eye className="h-5 w-5 mr-2" />
                  Visualizar Apresentação Completa
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
