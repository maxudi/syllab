'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import UrlOuUpload from '@/components/url-ou-upload'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'

export default function NovoProfessorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    cpf: '',
    foto_url: '',
    token_ia: '',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const user = await requireAdmin()
    if (user) {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.nome || !formData.email || !formData.senha) {
      alert('Preencha os campos obrigatórios: Nome, Email e Senha')
      return
    }

    if (formData.senha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setSaving(true)

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            nome: formData.nome
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // 2. Criar registro na tabela de professores
      const { error: professorError } = await supabase
        .from('syllab_professores')
        .insert({
          user_id: authData.user.id,
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone || null,
          cpf: formData.cpf || null,
          foto_url: formData.foto_url || null,
          token_ia: formData.token_ia || null,
          ativo: true
        })

      if (professorError) throw professorError

      alert('Professor cadastrado com sucesso!')
      router.push('/admin/professores')
    } catch (error: any) {
      console.error('Erro ao cadastrar professor:', error)
      alert(`Erro ao cadastrar professor: ${error.message}`)
    } finally {
      setSaving(false)
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
      <div className="max-w-3xl mx-auto">
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
          
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-8 h-8" />
            Cadastrar Novo Professor
          </h1>
          <p className="text-gray-600 mt-2">
            Preencha os dados do novo professor
          </p>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Professor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="João da Silva"
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
                    placeholder="professor@exemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senha">Senha *</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              {/* Foto */}
              <div>
                <UrlOuUpload
                  label="URL da Foto"
                  value={formData.foto_url}
                  onChange={(v) => setFormData({ ...formData, foto_url: v })}
                  placeholder="Cole uma URL ou envie um arquivo"
                  folder="professores/novo"
                  accept="image/*"
                  preview
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL pública da foto do professor
                </p>
              </div>

              {/* Token IA */}
              <div>
                <Label htmlFor="token_ia">Token de IA</Label>
                <Textarea
                  id="token_ia"
                  value={formData.token_ia}
                  onChange={(e) => setFormData({ ...formData, token_ia: e.target.value })}
                  placeholder="sk-..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Token de API para serviços de IA (OpenAI, Claude, etc)
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/professores')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Cadastrar Professor
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
