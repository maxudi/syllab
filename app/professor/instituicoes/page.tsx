'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { supabase, type Instituicao } from '@/lib/supabase'
import { Plus, Trash2, Edit, Save, X, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function InstituicoesPage() {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    descricao: '',
    logo_url: ''
  })

  useEffect(() => {
    loadInstituicoes()
  }, [])

  async function loadInstituicoes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('syllab_instituicoes')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) {
      console.error('Erro ao carregar instituições:', error)
      alert('Erro ao carregar instituições')
    } else {
      setInstituicoes(data || [])
    }
    setLoading(false)
  }

  function resetForm() {
    setFormData({
      nome: '',
      sigla: '',
      descricao: '',
      logo_url: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(instituicao: Instituicao) {
    setFormData({
      nome: instituicao.nome,
      sigla: instituicao.sigla || '',
      descricao: instituicao.descricao || '',
      logo_url: instituicao.logo_url || ''
    })
    setEditingId(instituicao.id)
    setShowForm(true)
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
        alert('Erro ao atualizar instituição')
      } else {
        alert('Instituição atualizada com sucesso!')
        resetForm()
        loadInstituicoes()
      }
    } else {
      // Criar
      const { error } = await supabase
        .from('syllab_instituicoes')
        .insert([formData])

      if (error) {
        console.error('Erro ao criar instituição:', error)
        alert(`Erro ao criar instituição: ${error.message}`)
      } else {
        alert('Instituição criada com sucesso!')
        resetForm()
        loadInstituicoes()
      }
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta instituição?')) {
      return
    }

    const { error } = await supabase
      .from('syllab_instituicoes')
      .update({ ativo: false })
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir instituição:', error)
      alert('Erro ao excluir instituição')
    } else {
      alert('Instituição excluída com sucesso!')
      loadInstituicoes()
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
                  Adicionar Instituição
                </>
              )}
            </Button>
          </div>

          {/* Formulário */}
          {showForm && (
            <Card className="mb-8 border-2 border-blue-200">
              <CardHeader>
                <CardTitle>
                  {editingId ? 'Editar Instituição' : 'Nova Instituição'}
                </CardTitle>
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
                        placeholder="Ex: Universidade Federal"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sigla">Sigla</Label>
                      <Input
                        id="sigla"
                        value={formData.sigla}
                        onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                        placeholder="Ex: UF"
                        disabled={loading}
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
                <p className="text-slate-600 mb-4">Nenhuma instituição cadastrada</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeira Instituição
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
    </ProtectedRoute>
  )
}
