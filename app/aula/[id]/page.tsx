"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ArrowRight, FileDown, Home } from 'lucide-react'
import Head from 'next/head'

interface Slide {
  id: string
  ordem: number
  titulo: string
  conteudo_html: string | null
  tipo_midia: string | null
  midia_url: string | null
  midia_legenda: string | null
  icone: string | null
  duracao_estimada: number | null
}

interface Conteudo {
  id: string
  titulo: string
  descricao: string | null
  conteudo_texto?: string | null
  cor_tema?: string
}

interface Disciplina {
  nome: string
  codigo: string | null
}

interface Professor {
  nome: string
}

interface Instituicao {
  nome: string
  sigla: string | null
  logo_url: string | null
}

// Paleta de temas de cores escuras
const TEMAS_CORES = {
  vermelho: {
    nome: 'Vermelho',
    gradiente: 'linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)',
    primaria: '#b71c1c',
    secundaria: '#d32f2f',
    hover: '#8b0000',
    highlight: '#ffebee',
    highlightBorder: '#c62828'
  },
  azul: {
    nome: 'Azul Marinho',
    gradiente: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
    primaria: '#0d47a1',
    secundaria: '#1565c0',
    hover: '#01579b',
    highlight: '#e3f2fd',
    highlightBorder: '#1976d2'
  },
  verde: {
    nome: 'Verde Escuro',
    gradiente: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
    primaria: '#1b5e20',
    secundaria: '#2e7d32',
    hover: '#0d3f0f',
    highlight: '#e8f5e9',
    highlightBorder: '#388e3c'
  },
  roxo: {
    nome: 'Roxo',
    gradiente: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%)',
    primaria: '#4a148c',
    secundaria: '#6a1b9a',
    hover: '#38006b',
    highlight: '#f3e5f5',
    highlightBorder: '#7b1fa2'
  },
  vinho: {
    nome: 'Vinho',
    gradiente: 'linear-gradient(135deg, #880e4f 0%, #ad1457 100%)',
    primaria: '#880e4f',
    secundaria: '#ad1457',
    hover: '#560027',
    highlight: '#fce4ec',
    highlightBorder: '#c2185b'
  },
  cinza: {
    nome: 'Cinza Escuro',
    gradiente: 'linear-gradient(135deg, #263238 0%, #37474f 100%)',
    primaria: '#263238',
    secundaria: '#37474f',
    hover: '#102027',
    highlight: '#eceff1',
    highlightBorder: '#455a64'
  }
}

export default function AulaPage() {
  const params = useParams()
  const router = useRouter()
  const conteudoId = params?.id as string

  const [conteudo, setConteudo] = useState<Conteudo | null>(null)
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null)
  const [professor, setProfessor] = useState<Professor | null>(null)
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null)
  const [disciplinaId, setDisciplinaId] = useState<string | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Obter tema de cores (padrão: vermelho)
  const temaCor = TEMAS_CORES[conteudo?.cor_tema as keyof typeof TEMAS_CORES] || TEMAS_CORES.vermelho

  useEffect(() => {
    if (conteudoId) {
      loadAula()
    }
  }, [conteudoId])

  async function loadAula() {
    try {
      // Carregar conteúdo com dados relacionados
      const { data: conteudoData, error: conteudoError } = await supabase
        .from('syllab_conteudos')
        .select(`
          id,
          titulo,
          descricao,
          conteudo_texto,
          cor_tema,
          disciplina_id,
          syllab_disciplinas (
            nome,
            codigo,
            professor_id,
            instituicao_id,
            syllab_professores (
              nome
            ),
            syllab_instituicoes (
              nome,
              sigla,
              logo_url
            )
          )
        `)
        .eq('id', conteudoId)
        .single()

      if (conteudoError) throw conteudoError

      setConteudo({
        id: conteudoData.id,
        titulo: conteudoData.titulo,
        descricao: conteudoData.descricao,
        conteudo_texto: conteudoData.conteudo_texto,
        cor_tema: conteudoData.cor_tema || 'vermelho'
      })

      // Guardar disciplina_id para navegação
      setDisciplinaId(conteudoData.disciplina_id)

      if (conteudoData.syllab_disciplinas) {
        const disc = conteudoData.syllab_disciplinas as any
        setDisciplina({
          nome: disc.nome,
          codigo: disc.codigo
        })

        if (disc.syllab_professores) {
          setProfessor({ nome: disc.syllab_professores.nome })
        }

        if (disc.syllab_instituicoes) {
          setInstituicao({
            nome: disc.syllab_instituicoes.nome,
            sigla: disc.syllab_instituicoes.sigla,
            logo_url: disc.syllab_instituicoes.logo_url
          })
        }
      }

      // Carregar slides
      const { data: slidesData, error: slidesError } = await supabase
        .from('syllab_slides')
        .select('*')
        .eq('conteudo_id', conteudoId)
        .eq('ativo', true)
        .order('ordem')

      if (slidesError) throw slidesError

      setSlides(slidesData || [])
    } catch (error) {
      console.error('Erro ao carregar aula:', error)
      alert('Erro ao carregar aula')
    } finally {
      setLoading(false)
    }
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') nextSlide()
    if (e.key === 'ArrowLeft') prevSlide()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, slides.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando aula...</p>
        </div>
      </div>
    )
  }

  if (!conteudo || slides.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Aula não encontrada</h1>
          <p className="text-gray-600">Esta aula não possui slides ou não existe.</p>
        </div>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]

  return (
    <>
      <Head>
        <title>{conteudo.titulo} - Syllab</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </Head>

      <style jsx global>{`
        body {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .container-aula {
          width: 90%;
          max-width: 1400px;
          margin: 2rem auto;
          background-color: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 15px 40px rgba(0,0,0,0.12);
        }
        
        .slide {
          animation: fadeIn 0.6s ease-in-out;
          min-height: 520px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .slide h2 {
          color: ${temaCor.primaria};
          font-weight: 700;
          border-bottom: 4px solid ${temaCor.secundaria};
          padding-bottom: 15px;
          display: inline-block;
          margin-bottom: 1.5rem;
        }
        
        .slide-image {
          max-height: 320px;
          width: auto;
          max-width: 100%;
          margin: 1.5rem auto;
          display: block;
          border-radius: 12px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          object-fit: contain;
        }
        
        .navigation-bar {
          border-top: 1px solid #ddd;
          padding-top: 1.5rem;
          margin-top: 2rem;
        }
        
        .btn-custom {
          background-color: ${temaCor.secundaria};
          border: 2px solid ${temaCor.secundaria};
          color: white;
          font-weight: 600;
          padding: 12px 30px;
          border-radius: 50px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-custom:hover:not(:disabled) {
          background-color: ${temaCor.hover};
          border-color: ${temaCor.hover};
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .btn-custom:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-outline {
          background-color: white;
          border: 2px solid #ccc;
          color: #666;
          font-weight: 600;
          padding: 12px 30px;
          border-radius: 50px;
          transition: all 0.3s ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-outline:hover:not(:disabled) {
          border-color: #999;
          background-color: #f5f5f5;
        }
        
        .btn-outline:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .highlight-box {
          background-color: ${temaCor.highlight};
          border-left: 5px solid ${temaCor.highlightBorder};
          padding: 20px;
          border-radius: 10px;
          margin-top: 1.5rem;
        }
        
        .slide-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .slide-content ul {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .slide-content li {
          margin-bottom: 0.5rem;
        }
        
        .slide-content strong {
          color: #d32f2f;
          font-weight: 600;
        }

        .slide-content .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
        }

        .slide-content .card-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .slide-content .card-text {
          color: #666;
        }

        .instituicao-logo {
          max-height: 120px;
          max-width: 300px;
          object-fit: contain;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .logo-info-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .disciplina-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .disciplina-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .disciplina-info p {
          font-size: 0.875rem;
          color: #666;
          margin: 0;
        }

        .aula-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: ${temaCor.gradiente};
          border-radius: 12px;
          color: white;
        }

        .aula-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: white;
        }

        .aula-header p {
          font-size: 1rem;
          margin: 0;
          color: rgba(255,255,255,0.9);
        }

        .btn-voltar {
          background-color: #f5f5f5;
          border: 2px solid #ddd;
          color: #666;
          font-weight: 600;
          padding: 10px 24px;
          border-radius: 50px;
          transition: all 0.3s ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-voltar:hover {
          background-color: #e0e0e0;
          border-color: #bbb;
          transform: translateX(-3px);
        }
      `}</style>

      <div className="container-aula">
        <div className="top-bar">
          <div className="logo-info-container">
            {instituicao?.logo_url && (
              <img 
                src={instituicao.logo_url} 
                alt={instituicao.nome}
                className="instituicao-logo"
              />
            )}
            {disciplina && (
              <div className="disciplina-info">
                <h3>
                  {disciplina.codigo && `${disciplina.codigo} - `}
                  {disciplina.nome}
                </h3>
                {professor && (
                  <p>
                    Professor: {professor.nome}
                    {instituicao && ` • ${instituicao.sigla || instituicao.nome}`}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => disciplinaId ? router.push(`/aluno/disciplina/${disciplinaId}`) : router.back()}
            className="btn-voltar"
          >
            <Home className="h-5 w-5" />
            Voltar para Jornada de Aulas
          </button>
        </div>

        <div className="aula-header">
        <h1 style={{ textAlign: 'left' }}>
            {conteudo.titulo} - {conteudo.conteudo_texto && conteudo.conteudo_texto}
        </h1>
        </div>

        <div className="slide" key={currentSlide}>
          <h2>
            {currentSlideData.icone && (
              <i className={`bi ${currentSlideData.icone} mr-2`}></i>
            )}
            {currentSlideData.titulo}
          </h2>
          <hr className="mb-4" />
          
          <div 
            className="slide-content"
            dangerouslySetInnerHTML={{ __html: currentSlideData.conteudo_html || '' }}
          />
          
          {currentSlideData.tipo_midia === 'imagem' && currentSlideData.midia_url && (
            <div>
              <img 
                src={currentSlideData.midia_url} 
                alt={currentSlideData.midia_legenda || 'Imagem do slide'}
                className="slide-image"
              />
              {currentSlideData.midia_legenda && (
                <p className="text-center text-gray-500 text-sm mt-2">
                  <em>{currentSlideData.midia_legenda}</em>
                </p>
              )}
            </div>
          )}
          
          {currentSlideData.tipo_midia === 'pdf' && currentSlideData.midia_url && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
              <i className="bi bi-file-pdf text-red-600 text-5xl mb-3 block"></i>
              <a 
                href={currentSlideData.midia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-custom"
              >
                <FileDown className="h-5 w-5" />
                Abrir PDF
              </a>
              {currentSlideData.midia_legenda && (
                <p className="text-gray-600 mt-2">{currentSlideData.midia_legenda}</p>
              )}
            </div>
          )}
          
          {currentSlideData.tipo_midia === 'url' && currentSlideData.midia_url && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
              <i className="bi bi-link-45deg text-blue-600 text-5xl mb-3 block"></i>
              <a 
                href={currentSlideData.midia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-custom"
              >
                <i className="bi bi-box-arrow-up-right"></i>
                Acessar Link
              </a>
              {currentSlideData.midia_legenda && (
                <p className="text-gray-600 mt-2">{currentSlideData.midia_legenda}</p>
              )}
            </div>
          )}
          
          {currentSlideData.tipo_midia === 'video' && currentSlideData.midia_url && (
            <div className="mt-4">
              {currentSlideData.midia_url.includes('youtube.com') || currentSlideData.midia_url.includes('youtu.be') ? (
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={currentSlideData.midia_url.replace('watch?v=', 'embed/')}
                    className="w-full h-96 rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <video 
                  src={currentSlideData.midia_url}
                  controls
                  className="w-full rounded-lg"
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              )}
              {currentSlideData.midia_legenda && (
                <p className="text-center text-gray-500 text-sm mt-2">
                  <em>{currentSlideData.midia_legenda}</em>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="navigation-bar flex justify-between items-center">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="btn-outline"
          >
            <ArrowLeft className="h-5 w-5" />
            Anterior
          </button>
          
          <span className="text-gray-600 font-semibold">
            Slide {currentSlide + 1} de {slides.length}
          </span>
          
          <button 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="btn-custom"
          >
            Avançar
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Use as setas do teclado (← →) para navegar entre os slides
        </div>
      </div>
    </>
  )
}
