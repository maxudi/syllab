'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, ArrowRight, Clock, Lock, Globe } from 'lucide-react'

type Disciplina = {
  id: string
  nome: string
  codigo: string
  carga_horaria: number
  descricao?: string
  publica: boolean
  codigo_acesso: string | null
}

type Professor = {
  nome: string
}

type Instituicao = {
  nome: string
  sigla: string
}

export default function SelecionarDisciplinaPage() {
  const router = useRouter()
  const params = useParams()
  const instituicaoId = params.id as string
  const professorId = params.professorId as string

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [professor, setProfessor] = useState<Professor | null>(null)
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

      // Carregar professor
      const { data: profData, error: profError } = await supabase
        .from('syllab_professores')
        .select('nome')
        .eq('id', professorId)
        .single()

      if (profError) throw profError
      setProfessor(profData)

      // Carregar disciplinas do professor
      const { data: discData, error: discError } = await supabase
        .from('syllab_disciplinas')
        .select('id, nome, codigo, carga_horaria, descricao, publica, codigo_acesso')
        .eq('professor_id', professorId)
        .eq('instituicao_id', instituicaoId)
        .eq('ativo', true)
        .order('nome')

      if (discError) throw discError
      setDisciplinas(discData || [])
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
          <p className="text-gray-600">Carregando disciplinas...</p>
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
            onClick={() => router.push(`/aluno/instituicao/${instituicaoId}/professores`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Professores
          </Button>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <p className="text-sm text-gray-600 mb-2">{instituicao?.nome}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Prof. {professor?.nome}
            </h1>
            <p className="text-gray-600">
              Selecione uma disciplina para acessar o conteúdo
            </p>
          </div>
        </div>

        {/* Grid de Disciplinas */}
        {disciplinas.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma disciplina disponível</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {disciplinas.map((disc) => (
              <Card
                key={disc.id}
                className="hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-blue-500"
                onClick={() => router.push(`/aluno/disciplina/${disc.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">
                              {disc.nome}
                            </h3>
                            {disc.publica ? (
                              <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded flex items-center">
                                <Globe className="w-3 h-3 mr-1" />
                                Pública
                              </span>
                            ) : (
                              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded flex items-center">
                                <Lock className="w-3 h-3 mr-1" />
                                Privada
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Código: {disc.codigo}
                          </p>
                        </div>
                      </div>
                      
                      {disc.descricao && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {disc.descricao}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{disc.carga_horaria}h</span>
                        </div>
                        
                        <div className="flex items-center text-blue-600 font-medium">
                          <span>Acessar</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </div>
                    </div>
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
