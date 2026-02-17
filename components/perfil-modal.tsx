'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentProfessor, updatePassword } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import UrlOuUpload from '@/components/url-ou-upload'
import { X, Save, Key, Building2, Plus, User as UserIcon } from 'lucide-react'
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
}

type Instituicao = {
  id: string
  nome: string
  sigla: string
}

type PerfilModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function PerfilModal({ isOpen, onClose }: PerfilModalProps) {
  const { showAlert, AlertComponent } = useAlert()
  const { showConfirm, ConfirmComponent } = useConfirm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [vinculos, setVinculos] = useState<Vinculo[]>([])
  const [instituicoesDisponiveis, setInstituicoesDisponiveis] = useState<Instituicao[]>([])
  const [activeTab, setActiveTab] = useState<'dados' | 'senha' | 'instituicoes'>('dados')
  
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
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  async function loadData() {
    try {
      const prof = await getCurrentProfessor()
      if (!prof) return

      setProfessor(prof)
      setFormData({
        nome: prof.nome,
        email: prof.email,
        telefone: prof.telefone || '',
        cpf: prof.cpf || '',
        foto_url: prof.foto_url || '',
        token_ia: prof.token_ia || '',
      })

      // Carregar vínculos
      const { data: vinculosData, error: vinculosError } = await supabase
        .from('syllab_professor_instituicoes')
        .select(`
          id,
          instituicao_id,
          cargo,
          syllab_instituicoes (nome)
        `)
        .eq('professor_id', prof.id)
        .eq('ativo', true)

      if (vinculosError) throw vinculosError

      const vinculosFormatted = vinculosData?.map((v: any) => ({
        id: v.id,
        instituicao_id: v.instituicao_id,
        nome_instituicao: v.syllab_instituicoes.nome,
        cargo: v.cargo
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
      loadData()
      // Recarregar página para atualizar header
      window.location.reload()
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
      loadData()
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
          loadData()
        } catch (error: any) {
          console.error('Erro ao remover vínculo:', error)
          showAlert('Erro ao Remover Vínculo', `Não foi possível remover o vínculo: ${error.message}`, 'error')
        }
      },
      { variant: 'destructive', confirmText: 'Desvincular' }
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {professor?.foto_url ? (
              <img
                src={professor.foto_url}
                alt={professor.nome}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                {professor?.nome?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                Meu Perfil
              </h2>
              <p className="text-sm text-gray-600">{professor?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('dados')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'dados'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dados Pessoais
          </button>
          <button
            onClick={() => setActiveTab('senha')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'senha'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Alterar Senha
          </button>
          <button
            onClick={() => setActiveTab('instituicoes')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'instituicoes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Minhas Instituições
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Tab: Dados Pessoais */}
              {activeTab === 'dados' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Salvando...' : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Tab: Alterar Senha */}
              {activeTab === 'senha' && (
                <div className="space-y-4 max-w-md mx-auto">
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
                    className="w-full"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </Button>
                </div>
              )}

              {/* Tab: Instituições */}
              {activeTab === 'instituicoes' && (
                <div className="space-y-6">
                  {/* Lista de vínculos */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Minhas Instituições
                    </h3>
                    <div className="space-y-2">
                      {vinculos.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                          Você não está vinculado a nenhuma instituição
                        </p>
                      ) : (
                        vinculos.map((vinculo) => (
                          <div
                            key={vinculo.id}
                            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100"
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
                  </div>

                  {/* Adicionar nova instituição */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3">Adicionar-me a uma Instituição</h4>
                    <div className="space-y-3">
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
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <AlertComponent />
      <ConfirmComponent />
    </div>
  )
}
