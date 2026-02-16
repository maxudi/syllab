'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormMessage } from '@/components/ui/form'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Tentando fazer login com:', email)
    console.log('Supabase URL configurada:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Sim' : 'Não')

    try {
      const { data, error: signInError } = await signIn({ email, password })

      console.log('Resposta do login:', { data, error: signInError })

      if (signInError) {
        console.error('Erro ao fazer login:', signInError)
        setError(signInError)
        setLoading(false)
        return
      }

      if (data?.user) {
        console.log('Login bem-sucedido!')
        console.log('Dados do usuário:', data.user)
        console.log('Sessão:', data.session)
        
        // Aguardar um momento para garantir que a sessão foi salva
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('Redirecionando para área do professor...')
        window.location.href = '/professor'
      } else {
        console.error('Login retornou sem dados de usuário')
        console.log('Dados recebidos:', data)
        setError('Erro ao fazer login. Tente novamente.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Exceção ao fazer login:', err)
      setError('Erro inesperado ao fazer login. Verifique o console.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o Syllab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit}>
            <FormField>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </FormField>

            <FormField>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </FormField>

            {error && (
              <FormMessage error>{error}</FormMessage>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-600">
            Não tem uma conta?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
              Cadastre-se
            </Link>
          </div>
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-center text-blue-600 hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
