'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, getCurrentProfessor, updatePassword } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import UrlOuUpload from '@/components/url-ou-upload'
import { User, Save, Key, Building2, Plus, X } from 'lucide-react'
import { useAlert, useConfirm } from '@/components/alert-dialog'

type Professor = {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
  foto_url?: string
  token_ia?: string
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

export default function MeuPerfilPage() {
  const { showAlert, AlertComponent } = useAlert()
  const { showConfirm, ConfirmComponent } = useConfirm()
  const router = useRouter()
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

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [novoVinculo, setNovoVinculo] = useState({
    instituicao_id: '',
    cargo: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/')
      return
    }
    
    const prof = await getCurrentProfessor()
    if (!prof) {
      showAlert('Perfil Não Encontrado', 'Perfil de professor não encontrado. Por favor, faça login novamente.', 'error')
      router.push('/')
      return
    }

    loadData(prof.id)
  }

  async function loadData(professorId: string) {
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
      showAlert('Erro ao Carregar Dados', 'Não foi possível carregar os dados do perfil.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.nome || !formData.email) {
      showAlert('Campos Obrigatórios', 'Por favor, preencha os campos obrigatórios (nome e e-mail).', 'warning')
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
        .eq('id', professor!.id)

      if (error) throw error

      showAlert('Sucesso!', 'Dados atualizados com sucesso!', 'success')
      loadData(professor!.id)
    } catch (error: any) {
      console.error('Erro ao atualizar:', error)
      showAlert('Erro ao Atualizar', `Não foi possível atualizar os dados: ${error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleAlterarSenha() {
    if (!novaSenha || novaSenha.length < 6) {
      showAlert('Senha Inválida', 'A senha deve ter no mínimo 6 caracteres.', 'warning')
      return
    }

    if (novaSenha !== confirmarSenha) {
      showAlert('Senhas Não Conferem', 'A nova senha e a confirmação não são iguais.', 'warning')
      return
    }

    try {
      await updatePassword(novaSenha)
      showAlert('Sucesso!', 'Senha alterada com sucesso!', 'success')
      setNovaSenha('')
      setConfirmarSenha('')
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error)
      showAlert('Erro ao Alterar Senha', `Não foi possível alterar a senha: ${error.message}`, 'error')
    }
  }

  async function handleAdicionarVinculo() {
    if (!novoVinculo.instituicao_id) {
      showAlert('Instituição Não Selecionada', 'Por favor, selecione uma instituição.', 'warning')
      return
    }

    try {
      const { error } = await supabase
        .from('syllab_professor_instituicoes')
        .insert({
          professor_id: professor!.id,
          instituicao_id: novoVinculo.instituicao_id,
          cargo: novoVinculo.cargo || null,
          ativo: true
        })

      if (error) throw error

      showAlert('Sucesso!', 'Você foi adicionado à instituição com sucesso!', 'success')
      setNovoVinculo({ instituicao_id: '', cargo: '' })
      loadData(professor!.id)
    } catch (error: any) {
      console.error('Erro ao adicionar vínculo:', error)
      showAlert('Erro ao Adicionar Vínculo', `Não foi possível adicionar o vínculo: ${error.message}`, 'error')
    }
  }

  async function handleRemoverVinculo(vinculoId: string) {
    showConfirm(
      'Confirmar Desvinculação',
      'Deseja se desvincular desta instituição?',
      async () => {
        try {
          const { error } = await supabase
            .from('syllab_professor_instituicoes')
            .update({ ativo: false })
            .eq('id', vinculoId)

          if (error) throw error

          showAlert('Sucesso!', 'Vínculo removido com sucesso!', 'success')
          loadData(professor!.id)
        } catch (error: any) {
          console.error('Erro ao remover vínculo:', error)
          showAlert('Erro ao Remover Vínculo', `Não foi possível remover o vínculo: ${error.message}`, 'error')
        }
      },
      { variant: 'destructive', confirmText: 'Desvincular' }
    )
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
        <p className="text-gray-600">Perfil não encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            {professor.foto_url ? (
              <img
                src={professor.foto_url}
                alt={professor.nome}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg">
                {professor.nome.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-8 h-8" />
                Meu Perfil
              </h1>
              <p className="text-gray-600 mt-1">{professor.email}</p>
              <p className="text-sm text-gray-500 mt-2">
                Gerencie seus dados pessoais, instituições e preferências
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
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
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <UrlOuUpload
                    label="URL da Foto"
                    value={formData.foto_url}
                    onChange={(v) => setFormData({ ...formData, foto_url: v })}
                    placeholder="Cole uma URL ou envie um arquivo"
                    bucket="syllab"
                    folder={professor?.id ? `professores/${professor.id}` : 'professores'}
                    accept="image/*"
                    preview
                  />
                </div>

                <div>
                  <Label htmlFor="token_ia">Token de IA (Opcional)</Label>
                  <Textarea
                    id="token_ia"
                    value={formData.token_ia}
                    onChange={(e) => setFormData({ ...formData, token_ia: e.target.value })}
                    rows={3}
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Token para serviços de IA (OpenAI, Claude, etc)
                  </p>
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

          {/* Alterar Senha e Minhas Instituições */}
          <div className="space-y-6">
            {/* Alterar Senha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Alterar Minha Senha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Digite novamente"
                    minLength={6}
                  />
                </div>
                <Button 
                  onClick={handleAlterarSenha}
                  disabled={!novaSenha || novaSenha.length < 6 || novaSenha !== confirmarSenha}
                  variant="outline"
                  className="w-full"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>

            {/* Minhas Instituições */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Minhas Instituições
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de vínculos */}
                <div className="space-y-2">
                  {vinculos.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Você não está vinculado a nenhuma instituição
                    </p>
                  ) : (
                    vinculos.map((vinculo) => (
                      <div
                        key={vinculo.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100"
                      >
                        <div>
                          <p className="font-medium text-blue-900">{vinculo.nome_instituicao}</p>
                          {vinculo.cargo && (
                            <p className="text-sm text-blue-700">{vinculo.cargo}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoverVinculo(vinculo.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Adicionar nova instituição */}
                <div className="border-t pt-4 space-y-3">
                  <Label>Adicionar-me a uma Instituição</Label>
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
                    placeholder="Seu cargo (opcional)"
                    value={novoVinculo.cargo}
                    onChange={(e) => setNovoVinculo({ ...novoVinculo, cargo: e.target.value })}
                  />

                  <Button
                    onClick={handleAdicionarVinculo}
                    disabled={!novoVinculo.instituicao_id}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar-me à Instituição
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AlertComponent />
      <ConfirmComponent />
    </div>
  )
}
