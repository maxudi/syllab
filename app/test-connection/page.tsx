'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TestConnectionPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setLoading(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      env_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      env_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      env_key_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    }

    try {
      // Testar conexão básica
      console.log('Testando conexão com Supabase...')
      console.log('URL:', results.env_url)
      console.log('Key existe:', results.env_key_exists)

      // Testar query simples
      const { data: institutions, error: instError } = await supabase
        .from('syllab_instituicoes')
        .select('id, nome')
        .limit(5)

      results.institutions_test = {
        success: !instError,
        error: instError?.message,
        count: institutions?.length || 0,
        data: institutions,
      }

      // Testar auth
      const { data: authData, error: authError } = await supabase.auth.getSession()
      
      results.auth_test = {
        success: !authError,
        error: authError?.message,
        hasSession: !!authData?.session,
        user: authData?.session?.user?.email || null,
      }

      console.log('Resultados do teste:', results)
    } catch (error: any) {
      results.exception = error.message
      console.error('Erro ao testar conexão:', error)
    }

    setStatus(results)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teste de Conexão - Supabase</CardTitle>
            <CardDescription>
              Diagnóstico da conexão e configuração do Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Status da Conexão</h3>
              <Button onClick={testConnection} disabled={loading} size="sm">
                {loading ? 'Testando...' : 'Testar Novamente'}
              </Button>
            </div>

            {status && (
              <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Configuração</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">URL Supabase:</dt>
                      <dd className="font-mono text-xs">{status.env_url || 'NÃO DEFINIDA'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Chave Anon existe:</dt>
                      <dd className={status.env_key_exists ? 'text-green-600' : 'text-red-600'}>
                        {status.env_key_exists ? '✓ Sim' : '✗ Não'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Tamanho da Chave:</dt>
                      <dd>{status.env_key_length} caracteres</dd>
                    </div>
                  </dl>
                </div>

                {status.institutions_test && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Teste de Query (Instituições)</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Status:</dt>
                        <dd className={status.institutions_test.success ? 'text-green-600' : 'text-red-600'}>
                          {status.institutions_test.success ? '✓ Sucesso' : '✗ Falha'}
                        </dd>
                      </div>
                      {status.institutions_test.error && (
                        <div>
                          <dt className="text-gray-600">Erro:</dt>
                          <dd className="text-red-600 text-xs font-mono mt-1">
                            {status.institutions_test.error}
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Registros encontrados:</dt>
                        <dd>{status.institutions_test.count}</dd>
                      </div>
                      {status.institutions_test.data && status.institutions_test.data.length > 0 && (
                        <div>
                          <dt className="text-gray-600 mb-1">Dados:</dt>
                          <dd className="text-xs bg-white p-2 rounded font-mono overflow-auto max-h-32">
                            {JSON.stringify(status.institutions_test.data, null, 2)}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {status.auth_test && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Teste de Autenticação</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Status:</dt>
                        <dd className={status.auth_test.success ? 'text-green-600' : 'text-red-600'}>
                          {status.auth_test.success ? '✓ Sucesso' : '✗ Falha'}
                        </dd>
                      </div>
                      {status.auth_test.error && (
                        <div>
                          <dt className="text-gray-600">Erro:</dt>
                          <dd className="text-red-600 text-xs">{status.auth_test.error}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Sessão ativa:</dt>
                        <dd>{status.auth_test.hasSession ? 'Sim' : 'Não'}</dd>
                      </div>
                      {status.auth_test.user && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Usuário:</dt>
                          <dd className="font-mono text-xs">{status.auth_test.user}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {status.exception && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Exceção</h4>
                    <p className="text-sm text-red-700">{status.exception}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Timestamp</h4>
                  <p className="text-sm text-blue-700 font-mono">{status.timestamp}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex space-x-2">
          <Link href="/auth/login" className="flex-1">
            <Button className="w-full">Ir para Login</Button>
          </Link>
          <Link href="/auth/signup" className="flex-1">
            <Button variant="outline" className="w-full">Ir para Cadastro</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
