"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CardSkeleton } from '@/components/skeletons'
import { supabase, type Disciplina, type Conteudo } from '@/lib/supabase'
import { FileText, Calendar, ClipboardCheck, ArrowLeft, Download } from 'lucide-react'

export default function DisciplinaPage() {
  const params = useParams()
  const router = useRouter()
  const disciplinaId = params.id as string

  const [loading, setLoading] = useState(true)
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null)
  const [jornadaAulas, setJornadaAulas] = useState<Conteudo[]>([])
  const [avaliativos, setAvaliativos] = useState<Conteudo[]>([])

  useEffect(() => {
    if (disciplinaId) {
      loadDisciplina()
      loadConteudos()
    }
  }, [disciplinaId])

  async function loadDisciplina() {
    const { data, error } = await supabase
      .from('syllab_disciplinas')
      .select('*, documentos_gerais')
      .eq('id', disciplinaId)
      .single()

    if (error) {
      console.error('Erro ao carregar disciplina:', error)
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
      .eq('ativo', true)
      .order('ordem', { ascending: true })

    if (error) {
      console.error('Erro ao carregar conteúdos:', error)
    } else {
      const conteudos = data || []
      setJornadaAulas(conteudos.filter(c => c.tipo === 'jornada_aula'))
      setAvaliativos(conteudos.filter(c => c.tipo === 'avaliativo'))
    }
    
    setLoading(false)
  }

  if (!disciplina && !loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Disciplina não encontrada</h1>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Voltar para o início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-8 cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </button>

        {/* Header da Disciplina */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 mb-12 text-white shadow-lg">
          <div className="max-w-4xl">
            {disciplina?.codigo && (
              <div className="text-blue-100 font-medium mb-2">{disciplina.codigo}</div>
            )}
            <h1 className="text-4xl font-bold mb-4">
              {disciplina?.nome || 'Carregando...'}
            </h1>
            {disciplina?.descricao && (
              <p className="text-blue-50 text-lg">{disciplina.descricao}</p>
            )}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-6 text-sm text-blue-100">
                {disciplina?.carga_horaria && (
                  <div>Carga Horária: {disciplina.carga_horaria}h</div>
                )}
                {disciplina?.semestre && (
                  <div>{disciplina.semestre}</div>
                )}
                {disciplina?.ano && (
                  <div>{disciplina.ano}</div>
                )}
              </div>
              {disciplina?.documentos_gerais && (
                <a
                  href={disciplina.documentos_gerais}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Documentos Gerais
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Jornada de Aulas */}
        <section className="mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Jornada de Aulas</h2>
              <p className="text-slate-600 text-sm">Aulas em ordem cronológica</p>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : jornadaAulas.length === 0 ? (
            <EmptyState message="Nenhuma aula disponível" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jornadaAulas.map(conteudo => (
                <ConteudoCard key={conteudo.id} conteudo={conteudo} icon={Calendar} iconColor="text-blue-600" bgColor="bg-blue-50" />
              ))}
            </div>
          )}
        </section>

        {/* Avaliativo */}
        <section className="mb-16">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Avaliativo</h2>
              <p className="text-slate-600 text-sm">Exercícios, trabalhos e atividades</p>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : avaliativos.length === 0 ? (
            <EmptyState message="Nenhuma atividade avaliativa disponível" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {avaliativos.map(conteudo => (
                <ConteudoCard key={conteudo.id} conteudo={conteudo} icon={ClipboardCheck} iconColor="text-orange-600" bgColor="bg-orange-50" />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

// Componente para exibir um card de conteúdo
function ConteudoCard({ 
  conteudo, 
  icon: Icon, 
  iconColor, 
  bgColor 
}: { 
  conteudo: Conteudo
  icon: any
  iconColor: string
  bgColor: string
}) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          {conteudo.arquivo_url && (
            <a 
              href={conteudo.arquivo_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Download className="w-5 h-5" />
            </a>
          )}
        </div>
        <CardTitle className="mt-4 group-hover:text-blue-600 transition-colors">
          {conteudo.titulo}
        </CardTitle>
        {conteudo.descricao && (
          <CardDescription className="line-clamp-2">
            {conteudo.descricao}
          </CardDescription>
        )}
      </CardHeader>
      {(conteudo.conteudo_texto || conteudo.data_limite) && (
        <CardContent className="space-y-3">
          {conteudo.conteudo_texto && (
            <p className="text-sm text-slate-600 line-clamp-3">
              {conteudo.conteudo_texto}
            </p>
          )}
          {conteudo.data_limite && (
            <div className="text-xs text-slate-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Prazo: {new Date(conteudo.data_limite).toLocaleDateString('pt-BR')}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// Componente para estado vazio
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
        <FileText className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-slate-500">{message}</p>
    </div>
  )
}
