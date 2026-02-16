'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, ArrowRight } from 'lucide-react'

type Professor = {
  id: string
  nome: string
  email: string
  foto_url?: string
}

type Instituicao = {
  nome: string
  sigla: string
}

export default function SelecionarProfessorPage() {
  const router = useRouter()
  const params = useParams()
  const instituicaoId = params.id as string

  const [professores, setProfessores] = useState<Professor[]>([])
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Carregar instituição
      const { data: instData, error: instError } = await supabase
        .from('syllab_instituicoes')
        .select('nome, sigla')
        .eq('id', instituicaoId)
        .single()

      if (instError) throw instError
      setInstituicao(instData)

      // Carregar professores vinculados à instituição
      const { data: profData, error: profError } = await supabase
        .from('syllab_professor_instituicoes')
        .select(`
          professor_id,
          syllab_professores (
            id,
            nome,
            email,
            foto_url
          )
        `)
        .eq('instituicao_id', instituicaoId)
        .eq('ativo', true)

      if (profError) throw profError

      const professoresFormatted = profData
        ?.map((item: any) => item.syllab_professores)
        .filter((prof: any) => prof !== null) || []

      setProfessores(professoresFormatted)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando professores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/aluno')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Instituições
          </Button>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {instituicao?.nome}
            </h1>
            <p className="text-gray-600">
              Selecione um professor para ver as disciplinas disponíveis
            </p>
          </div>
        </div>

        {/* Grid de Professores */}
        {professores.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum professor disponível nesta instituição</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professores.map((prof) => (
              <Card
                key={prof.id}
                className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-blue-500"
                onClick={() => router.push(`/aluno/instituicao/${instituicaoId}/professor/${prof.id}/disciplinas`)}
              >
                <CardContent className="p-6 text-center">
                  {prof.foto_url ? (
                    <img
                      src={prof.foto_url}
                      alt={prof.nome}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-3xl">
                      {prof.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {prof.nome}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {prof.email}
                  </p>
                  
                  <div className="flex items-center justify-center text-blue-600 font-medium">
                    <span>Ver Disciplinas</span>
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
