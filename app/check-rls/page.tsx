'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type PolicyCheck = {
  tablename: string
  policyname: string
  cmd: string
  roles: string[]
  permissive: string
}

export default function CheckRLSPage() {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)

  const checkPolicies = async () => {
    setChecking(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }

    try {
      // Verificar se consegue ler conteúdos
      const { data: readData, error: readError } = await supabase
        .from('syllab_conteudos')
        .select('id')
        .limit(1)

      results.tests.push({
        name: 'Leitura de conteúdos (SELECT)',
        success: !readError,
        error: readError?.message,
        details: readError
      })

      // Tentar criar um conteúdo de teste
      const { data: insertData, error: insertError } = await supabase
        .from('syllab_conteudos')
        .insert([{
          titulo: 'TESTE - DELETE ME',
          tipo: 'documento_geral',
          disciplina_id: '00000000-0000-0000-0000-000000000000', // UUID inválido de propósito
          ordem: 999
        }])
        .select()

      results.tests.push({
        name: 'Inserção de conteúdo (INSERT)',
        success: !insertError,
        error: insertError?.message,
        code: insertError?.code,
        details: insertError
      })

      // Se criou, tentar deletar
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('syllab_conteudos')
          .delete()
          .eq('id', insertData[0].id)

        results.tests.push({
          name: 'Deleção de conteúdo (DELETE)',
          success: !deleteError,
          error: deleteError?.message,
          details: deleteError
        })
      }

      // Verificar políticas via query SQL (se tiver permissão)
      try {
        const { data: policiesData, error: policiesError } = await supabase
          .rpc('get_policies')

        if (!policiesError && policiesData) {
          results.policies = policiesData
        } else {
          results.policies_error = policiesError?.message || 'Não foi possível verificar políticas'
        }
      } catch (err) {
        results.policies_error = 'RPC não disponível'
      }

    } catch (error: any) {
      results.exception = error.message
    }

    setResult(results)
    setChecking(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Verificação de Políticas RLS</CardTitle>
            <CardDescription>
              Diagnóstico das permissões do banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Testar Permissões</h3>
                <p className="text-sm text-gray-600">
                  Verifica se você pode criar, ler e deletar conteúdos
                </p>
              </div>
              <Button onClick={checkPolicies} disabled={checking}>
                {checking ? 'Verificando...' : 'Verificar Agora'}
              </Button>
            </div>

            {result && (
              <div className="space-y-4 mt-6">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Resultados dos Testes</h4>
                  
                  {result.tests.map((test: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 mb-3 p-3 bg-white rounded">
                      {test.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{test.name}</span>
                          <span className={`text-sm ${test.success ? 'text-green-600' : 'text-red-600'}`}>
                            {test.success ? 'OK' : 'FALHOU'}
                          </span>
                        </div>
                        {test.error && (
                          <div className="mt-1">
                            <p className="text-sm text-red-600">{test.error}</p>
                            {test.code && (
                              <p className="text-xs text-gray-500 mt-1">Código: {test.code}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {result.exception && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Exceção</h4>
                        <p className="text-sm text-red-700 mt-1">{result.exception}</p>
                      </div>
                    </div>
                  </div>
                )}

                {result.tests.some((t: any) => !t.success) && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-2">Ação Necessária</h4>
                        <p className="text-sm text-yellow-800 mb-3">
                          Algumas permissões estão faltando. Execute o script SQL para corrigir:
                        </p>
                        <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                          <li>Acesse o painel do Supabase</li>
                          <li>Vá em <strong>SQL Editor</strong></li>
                          <li>Abra o arquivo <code className="bg-yellow-100 px-1 rounded">database/fix-rls-permissions.sql</code></li>
                          <li>Cole o conteúdo no editor e execute</li>
                          <li>Volte aqui e teste novamente</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {result.tests.every((t: any) => t.success) && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Tudo OK!</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Todas as permissões estão configuradas corretamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Timestamp: {result.timestamp}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como Corrigir o Erro 403</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>O erro 403 (Forbidden) acontece quando as políticas RLS bloqueiam operações no banco.</p>
            
            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <strong className="text-blue-900">Solução Rápida:</strong>
              <ol className="mt-2 space-y-1 list-decimal list-inside text-blue-800">
                <li>Abra o <a href="https://supabase.com/dashboard" target="_blank" className="underline">Painel do Supabase</a></li>
                <li>Selecione seu projeto</li>
                <li>Vá em <strong>SQL Editor</strong> (ícone de banco de dados)</li>
                <li>Crie uma nova query</li>
                <li>Cole o conteúdo do arquivo <code>database/fix-rls-permissions.sql</code></li>
                <li>Clique em <strong>Run</strong></li>
                <li>Volte aqui e clique em "Verificar Agora"</li>
              </ol>
            </div>

            <p className="text-gray-600">
              O script remove políticas antigas e cria novas políticas permissivas para desenvolvimento.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
