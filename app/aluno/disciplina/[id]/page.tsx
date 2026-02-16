'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Clock, Calendar, FileText, PlayCircle, CheckCircle, FileDown } from 'lucide-react'

type Disciplina = {
  id: string
  nome: string
  codigo: string
  carga_horaria: number
  descricao?: string
  documentos_gerais?: string
}

type Conteudo = {
  id: string
  titulo: string
  descricao?: string
  tipo: string
  ordem: number
  data_limite?: string
  arquivo_url?: string
  tem_slides: boolean
}

type Instituicao = {
  nome: string
  sigla: string
  logo_url?: string
}

type Professor = {
  nome: string
}

export default function DisciplinaAlunoPage() {
  const router = useRouter()
  const params = useParams()
  const disciplinaId = params.id as string

  const [disciplina, setDisciplina] = useState<Disciplina | null>(null)
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Conteudo[]>([])
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null)
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Carregar disciplina com professor e instituição
      const { data: discData, error: discError } = await supabase
        .from('syllab_disciplinas')
        .select(`
          id,
          nome,
          codigo,
          carga_horaria,
          descricao,
          documentos_gerais,
          syllab_professores (nome),
          syllab_instituicoes (nome, sigla, logo_url)
        `)
        .eq('id', disciplinaId)
        .single()

      if (discError) throw discError

      setDisciplina(discData)
      
      // Corrigir tipo - pega o primeiro elemento do array
      if (discData.syllab_professores && Array.isArray(discData.syllab_professores)) {
        setProfessor(discData.syllab_professores[0] || null)
      }
      if (discData.syllab_instituicoes && Array.isArray(discData.syllab_instituicoes)) {
        setInstituicao(discData.syllab_instituicoes[0] || null)
      }

      // Carregar conteúdos (separar aulas de avaliações)
      const { data: contData, error: contError } = await supabase
        .from('syllab_conteudos')
        .select('id, titulo, descricao, tipo, ordem, data_limite, arquivo_url')
        .eq('disciplina_id', disciplinaId)
        .eq('ativo', true)
        .order('ordem')

      if (contError) throw contError

      // Debug: ver quais tipos existem
      console.log('Conteúdos encontrados:', contData)
      console.log('Tipos únicos:', [...new Set(contData?.map(c => c.tipo) || [])])

      // Para cada conteúdo, verificar se tem slides
      const conteudosComSlides = await Promise.all(
        (contData || []).map(async (conteudo) => {
          const { count } = await supabase
            .from('syllab_slides')
            .select('*', { count: 'exact', head: true })
            .eq('conteudo_id', conteudo.id)
            .eq('ativo', true)
          
          return {
            ...conteudo,
            tem_slides: (count || 0) > 0
          }
        })
      )

      // Separar aulas e avaliações
      // Aceitar tanto 'aula' quanto 'jornada_aula' como aulas
      const aulas = conteudosComSlides?.filter(c => c.tipo === 'aula' || c.tipo === 'jornada_aula') || []
      const avals = conteudosComSlides?.filter(c => c.tipo === 'avaliativo' || c.tipo === 'atividade' || c.tipo === 'avaliacao') || []

      console.log('Aulas:', aulas)
      console.log('Avaliações:', avals)

      setConteudos(aulas)
      setAvaliacoes(avals)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  function getTipoIcon(tipo: string) {
    switch (tipo) {
      case 'aula': return PlayCircle
      case 'atividade': return FileText
      case 'avaliacao': return CheckCircle
      default: return FileText
    }
  }

  function getTipoColor(tipo: string) {
    switch (tipo) {
      case 'aula': return 'bg-blue-100 text-blue-600'
      case 'atividade': return 'bg-green-100 text-green-600'
      case 'avaliacao': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando disciplina...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Card className="bg-white shadow-xl">
            <CardContent className="p-8">
              {/* Logo da Instituição */}
              {instituicao?.logo_url && (
                <img
                  src={instituicao.logo_url}
                  alt={instituicao.nome}
                  className="h-16 object-contain mb-4"
                />
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">
                    {instituicao?.nome} • Prof. {professor?.nome}
                  </p>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {disciplina?.nome}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    Código: {disciplina?.codigo}
                  </p>
                  
                  {disciplina?.descricao && (
                    <p className="text-gray-700 mb-4">
                      {disciplina.descricao}
                    </p>
                  )}

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-medium">{disciplina?.carga_horaria}h</span>
                    </div>

                    {disciplina?.documentos_gerais && (
                      <a
                        href={disciplina.documentos_gerais}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Documentos Gerais
                      </a>
                    )}
                  </div>
                </div>

                <div className="w-24 h-24 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-12 h-12 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jornada de Aulas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PlayCircle className="w-7 h-7 text-blue-600" />
            Jornada de Aulas
          </h2>

          {conteudos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma aula disponível ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conteudos.map((conteudo) => {
                const Icon = getTipoIcon(conteudo.tipo)
                return (
                  <Card
                    key={conteudo.id}
                    className={`hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer border-2 border-transparent ${
                      conteudo.tem_slides ? 'hover:border-blue-500' : 'hover:border-gray-400'
                    }`}
                    onClick={() => {
                      if (conteudo.tem_slides) {
                        router.push(`/aula/${conteudo.id}`)
                      } else {
                        alert('Esta aula ainda não possui slides disponíveis')
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-lg ${getTipoColor(conteudo.tipo)} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                              {conteudo.titulo}
                            </h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                              #{conteudo.ordem}
                            </span>
                          </div>
                        </div>
                      </div>

                      {conteudo.descricao && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {conteudo.descricao}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
                        {conteudo.tem_slides ? (
                          <span className="text-sm text-blue-600 font-medium flex items-center">
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Apresentação Disponível
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Em breve
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Avaliações */}
        {avaliacoes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-7 h-7 text-green-600" />
              Avaliações
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {avaliacoes.map((avaliacao) => {
                const Icon = getTipoIcon(avaliacao.tipo)
                return (
                  <Card key={avaliacao.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-lg ${getTipoColor(avaliacao.tipo)} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-7 h-7" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {avaliacao.titulo}
                          </h3>

                          {avaliacao.descricao && (
                            <p className="text-sm text-gray-600 mb-3">
                              {avaliacao.descricao}
                            </p>
                          )}

                          {avaliacao.data_limite && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              Prazo: {new Date(avaliacao.data_limite).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
