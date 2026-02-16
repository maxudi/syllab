"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function DiagnosticoConexaoPage() {
  const [testando, setTestando] = useState(false)
  const [resultados, setResultados] = useState<any[]>([])

  async function testarConexao() {
    setTestando(true)
    setResultados([])
    const testes: any[] = []

    // 1. Verificar variáveis de ambiente
    testes.push({
      nome: 'Variáveis de Ambiente',
      status: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'ok' : 'erro',
      detalhes: process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? `URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}` 
        : 'URL não configurada'
    })

    // 2. Testar ping HTTP básico
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const inicio = Date.now()
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 segundos
      })
      const duracao = Date.now() - inicio
      
      testes.push({
        nome: 'Conexão HTTP com Supabase',
        status: response.ok || response.status === 401 ? 'ok' : 'aviso',
        detalhes: `Status: ${response.status} - Tempo: ${duracao}ms`
      })
    } catch (error: any) {
      testes.push({
        nome: 'Conexão HTTP com Supabase',
        status: 'erro',
        detalhes: `Erro: ${error.message} - ${error.name}`
      })
    }

    // 3. Testar endpoint de autenticação
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const inicio = Date.now()
      const response = await fetch(`${url}/auth/v1/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      })
      const duracao = Date.now() - inicio
      
      testes.push({
        nome: 'Endpoint de Autenticação',
        status: response.ok ? 'ok' : 'aviso',
        detalhes: `Status: ${response.status} - Tempo: ${duracao}ms`
      })
    } catch (error: any) {
      testes.push({
        nome: 'Endpoint de Autenticação',
        status: 'erro',
        detalhes: `Erro: ${error.message}`
      })
    }

    // 4. Verificar DNS
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost')
      testes.push({
        nome: 'URL Configurada',
        status: 'ok',
        detalhes: `Host: ${url.host} - Protocolo: ${url.protocol}`
      })
    } catch (error: any) {
      testes.push({
        nome: 'URL Configurada',
        status: 'erro',
        detalhes: 'URL inválida ou mal formatada'
      })
    }

    // 5. Testar localStorage
    try {
      localStorage.setItem('teste_conexao', 'ok')
      const valor = localStorage.getItem('teste_conexao')
      localStorage.removeItem('teste_conexao')
      
      testes.push({
        nome: 'LocalStorage (Sessões)',
        status: valor === 'ok' ? 'ok' : 'erro',
        detalhes: 'LocalStorage funcionando corretamente'
      })
    } catch (error: any) {
      testes.push({
        nome: 'LocalStorage (Sessões)',
        status: 'erro',
        detalhes: 'LocalStorage não disponível'
      })
    }

    // 6. Verificar CORS
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'OPTIONS',
        signal: AbortSignal.timeout(5000)
      })
      
      testes.push({
        nome: 'CORS Configuration',
        status: 'ok',
        detalhes: 'Servidor aceita requisições cross-origin'
      })
    } catch (error: any) {
      testes.push({
        nome: 'CORS Configuration',
        status: 'aviso',
        detalhes: 'Não foi possível verificar CORS'
      })
    }

    setResultados(testes)
    setTestando(false)
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="text-green-600 h-6 w-6" />
      case 'aviso': return <AlertCircle className="text-yellow-600 h-6 w-6" />
      case 'erro': return <XCircle className="text-red-600 h-6 w-6" />
      default: return null
    }
  }

  const getColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-50 border-green-200'
      case 'aviso': return 'bg-yellow-50 border-yellow-200'
      case 'erro': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">🔍 Diagnóstico de Conexão Supabase</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Esta página testa a conectividade com seu servidor Supabase e identifica problemas comuns.
            </p>
            <Button 
              onClick={testarConexao} 
              disabled={testando}
              className="w-full"
              size="lg"
            >
              {testando ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Testando conexão...
                </>
              ) : (
                'Iniciar Testes de Conexão'
              )}
            </Button>
          </CardContent>
        </Card>

        {resultados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados dos Testes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resultados.map((teste, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getColor(teste.status)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getIcon(teste.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{teste.nome}</h3>
                        <p className="text-sm text-gray-600 mt-1">{teste.detalhes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-lg mb-3">🔧 Soluções Recomendadas:</h3>
                <div className="space-y-3 text-sm">
                  {resultados.some(t => t.status === 'erro') && (
                    <>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-2">⚠️ Problemas Críticos Detectados</h4>
                        <ul className="list-disc list-inside space-y-1 text-red-800">
                          <li>Verifique se o servidor Supabase está rodando no Easypanel</li>
                          <li>Confirme a URL exata do Supabase (pode estar truncada)</li>
                          <li>Teste acessar a URL diretamente no navegador</li>
                          <li>Verifique logs do container Supabase no Easypanel</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">📋 Checklist de Verificação:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-blue-800">
                          <li>Acesse o Easypanel e veja se o container Supabase está UP</li>
                          <li>Verifique os logs do Supabase: <code className="bg-blue-100 px-2 py-1 rounded">docker logs supabase</code></li>
                          <li>Teste a URL no navegador: <code className="bg-blue-100 px-2 py-1 rounded break-all">{process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/</code></li>
                          <li>Verifique se há firewall bloqueando</li>
                          <li>Confirme que o domínio está resolvendo corretamente</li>
                        </ol>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-2">🔑 Configuração Atual:</h4>
                        <div className="space-y-1 text-yellow-800 font-mono text-xs break-all">
                          <div><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NÃO CONFIGURADA'}</div>
                          <div><strong>ANON KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Configurada' : '✗ NÃO CONFIGURADA'}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {resultados.every(t => t.status === 'ok') && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">✅ Tudo Funcionando!</h4>
                      <p className="text-green-800">
                        A conexão com o Supabase está funcionando corretamente. 
                        Se ainda há problemas de login, verifique se o usuário existe no banco.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚨 Erro ERR_TIMED_OUT - Causa Provável</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p className="font-semibold">O erro "ERR_TIMED_OUT" significa que o servidor não respondeu a tempo. Causas comuns:</p>
              
              <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                <p><strong>1. Servidor Supabase está offline/parado</strong></p>
                <p className="text-gray-700 ml-4">→ Acesse o Easypanel e reinicie o container Supabase</p>
                
                <p><strong>2. URL incorreta ou incompleta</strong></p>
                <p className="text-gray-700 ml-4">→ A URL parece estar truncada: "condominio-supa-academ..." (academia?)</p>
                
                <p><strong>3. Problema de rede/DNS</strong></p>
                <p className="text-gray-700 ml-4">→ Teste fazer ping no servidor ou acessar a URL no navegador</p>
                
                <p><strong>4. Firewall bloqueando</strong></p>
                <p className="text-gray-700 ml-4">→ Verifique regras de firewall no servidor</p>
              </div>

              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="font-semibold text-blue-900">✏️ Teste Rápido no Terminal:</p>
                <pre className="bg-blue-900 text-blue-100 p-3 rounded mt-2 overflow-x-auto">
{`# Teste se o servidor responde
curl https://condominio-supa-academic.yzqq8i.easypanel.host/rest/v1/

# Se não responder, o problema é no servidor, não no código!`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
