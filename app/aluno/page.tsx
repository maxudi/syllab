'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, GraduationCap, ArrowRight, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type Instituicao = {
  id: string
  nome: string
  sigla: string
  logo_url?: string
  cidade?: string
  uf?: string
}

export default function SelecionarInstituicaoPage() {
  const router = useRouter()
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadInstituicoes()
  }, [])

  async function loadInstituicoes() {
    try {
      const { data, error } = await supabase
        .from('syllab_instituicoes')
        .select('id, nome, sigla, logo_url, cidade, uf')
        .eq('ativo', true)
        .order('nome')

      if (error) throw error
      setInstituicoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar instituições:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar instituições baseado no termo de busca
  const instituicoesFiltradas = instituicoes.filter((inst) => {
    const termo = searchTerm.toLowerCase()
    return (
      inst.nome.toLowerCase().includes(termo) ||
      inst.sigla.toLowerCase().includes(termo) ||
      (inst.cidade && inst.cidade.toLowerCase().includes(termo)) ||
      (inst.uf && inst.uf.toLowerCase().includes(termo))
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando instituições...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Bem-vindo ao Syllab
          </h1>
          <p className="text-xl text-gray-600">
            Selecione uma instituição para começar
          </p>
        </div>

        {/* Campo de Busca */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Busque sua instituição (nome, sigla, cidade, UF)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              {instituicoesFiltradas.length} {instituicoesFiltradas.length === 1 ? 'instituição encontrada' : 'instituições encontradas'}
            </p>
          )}
        </div>

        {/* Grid de Instituições */}
        {instituicoesFiltradas.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Nenhuma instituição encontrada com esse termo de busca' 
                  : 'Nenhuma instituição disponível no momento'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instituicoesFiltradas.map((inst) => (
              <Card
                key={inst.id}
                className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-blue-500"
                onClick={() => router.push(`/aluno/instituicao/${inst.id}/professores`)}
              >
                <CardContent className="p-8 text-center">
                  {inst.logo_url ? (
                    <img
                      src={inst.logo_url}
                      alt={inst.nome}
                      className="w-24 h-24 object-contain mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {inst.nome}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-1">
                    {inst.sigla}
                  </p>
                  
                  {(inst.cidade || inst.uf) && (
                    <p className="text-xs text-gray-500 mb-4">
                      {inst.cidade && inst.uf ? `${inst.cidade} - ${inst.uf}` : inst.cidade || inst.uf}
                    </p>
                  )}
                  
                  {!(inst.cidade || inst.uf) && (
                    <div className="mb-4"></div>
                  )}
                  
                  <div className="flex items-center justify-center text-blue-600 font-medium">
                    <span>Ver Professores</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
