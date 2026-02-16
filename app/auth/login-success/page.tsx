'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, type User } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, User as UserIcon } from 'lucide-react'

export default function LoginSuccessPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const currentUser = await getCurrentUser()
    console.log('Usuário na página de sucesso:', currentUser)
    setUser(currentUser)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Login Bem-Sucedido!</CardTitle>
          <CardDescription>
            Você foi autenticado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="h-5 w-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Informações do Usuário</h3>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Nome:</dt>
                  <dd className="font-medium">{user.nome}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email:</dt>
                  <dd className="font-medium">{user.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">ID:</dt>
                  <dd className="font-mono text-xs text-gray-500">{user.id.substring(0, 8)}...</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="space-y-2">
            <Link href="/professor" className="block">
              <Button className="w-full" size="lg">
                Ir para Área do Professor
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Voltar para Início
              </Button>
            </Link>
          </div>

          <div className="text-xs text-center text-gray-500">
            Sessão ativa. Você pode fechar esta página.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
