"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, UserCircle, BookOpen } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Syllab
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma de gestão acadêmica e apresentação de conteúdos educacionais
          </p>
        </div>

        {/* Cards de Acesso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
          {/* Card Aluno */}
          <Card 
            className="hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
          >
            <CardHeader className="text-center pb-3">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Área do Aluno</CardTitle>
              <CardDescription className="text-sm">
                Acesse as aulas e materiais didáticos das disciplinas
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-700">
                  • Navegue por instituições e professores<br />
                  • Acesse apresentações de aulas<br />
                  • Visualize materiais e atividades
                </p>
              </div>
              <button 
                onClick={() => router.push('/aluno')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
              >
                Entrar como Aluno
              </button>
            </CardContent>
          </Card>

          {/* Card Professor */}
          <Card 
            className="hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-500"
          >
            <CardHeader className="text-center pb-3">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                <UserCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">Área do Professor</CardTitle>
              <CardDescription className="text-sm">
                Gerencie disciplinas, conteúdos e apresentações
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-indigo-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-700">
                  • Crie e organize disciplinas<br />
                  • Monte apresentações de slides<br />
                  • Gerencie atividades avaliativas
                </p>
              </div>
              <button 
                onClick={() => router.push('/auth/login')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
              >
                Login de Professor
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>Sistema de gestão acadêmica • Syllab {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}
