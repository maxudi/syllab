'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface AIContentGeneratorProps {
  onContentGenerated: (content: string) => void
}

export function AIContentGenerator({ onContentGenerated }: AIContentGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_token') || ''
    }
    return ''
  })
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
    setError('')
    setSuccess(false)
  }

  const handleClose = () => {
    if (!isGenerating) {
      setIsOpen(false)
      setPrompt('')
      setError('')
      setSuccess(false)
    }
  }

  const handleGenerate = async () => {
    if (!token.trim()) {
      setError('Por favor, informe seu token de API')
      return
    }

    if (!prompt.trim()) {
      setError('Por favor, descreva o conteúdo que deseja gerar')
      return
    }

    setIsGenerating(true)
    setError('')
    setSuccess(false)

    // Salvar token no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_token', token)
    }

    try {
      const response = await fetch('https://geral-n8n.yzqq8i.easypanel.host/webhook/syllab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          prompt: prompt
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`)
      }

      // Obter texto da resposta primeiro
      const responseText = await response.text()
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🤖 GERAÇÃO DE CONTEÚDO IA')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📥 Resposta recebida (length):', responseText.length)
      console.log('📥 Primeiros 200 chars:', responseText.substring(0, 200))
      
      let htmlContent = ''
      
      // Tentar parsear como JSON
      try {
        const data = JSON.parse(responseText)
        console.log('✓ Resposta é JSON válido')
        
        // Formato customizado: Array com objeto { content: "..." }
        if (Array.isArray(data) && data[0]?.content) {
          htmlContent = data[0].content
          console.log('📋 Formato: Array com campo content [Formato Principal]')
        }
        // Formato OpenAI (array com choices)
        else if (Array.isArray(data) && data[0]?.choices?.[0]?.message?.content) {
          htmlContent = data[0].choices[0].message.content
          console.log('📋 Formato: OpenAI Array')
        }
        // Formato OpenAI (objeto direto com choices)
        else if (data.choices?.[0]?.message?.content) {
          htmlContent = data.choices[0].message.content
          console.log('📋 Formato: OpenAI Objeto')
        }
        // Objeto direto com content
        else if (data.content) {
          htmlContent = data.content
          console.log('📋 Formato: Objeto com campo content')
        }
        // Campos customizados alternativos
        else if (data.html) {
          htmlContent = data.html
          console.log('📋 Formato: Campo html')
        } else if (data.resultado) {
          htmlContent = data.resultado
          console.log('📋 Formato: Campo resultado')
        } else if (typeof data === 'string') {
          htmlContent = data
          console.log('📋 Formato: String direta')
        } else {
          htmlContent = JSON.stringify(data)
          console.log('📋 Formato: Fallback JSON.stringify')
        }
      } catch (jsonError) {
        // Se não for JSON, assume que é HTML direto
        console.log('⚠️ Resposta não é JSON - assumindo HTML direto')
        htmlContent = responseText
      }
      
      // Limpar conteúdo
      if (htmlContent) {
        // Remover quebras de linha e espaços múltiplos que causam problemas no Quill
        // Primeiro remove \n literais escapados
        htmlContent = htmlContent.replace(/\\n/g, '')
        // Remove quebras de linha reais
        htmlContent = htmlContent.replace(/\n/g, '')
        // Remove tabs
        htmlContent = htmlContent.replace(/\t/g, '')
        // Normaliza múltiplos espaços em um só
        htmlContent = htmlContent.replace(/\s+/g, ' ')
        // Remove espaços entre tags
        htmlContent = htmlContent.replace(/>\s+</g, '><')
        // Trim final
        htmlContent = htmlContent.trim()
        
        console.log('✓ HTML processado (length):', htmlContent.length)
        console.log('📄 HTML limpo:', htmlContent.substring(0, 200) + '...')
      }

      if (!htmlContent || htmlContent.length === 0) {
        throw new Error('Nenhum conteúdo HTML foi gerado pela IA')
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🚀 Enviando para editor...')
      
      // Inserir conteúdo gerado
      onContentGenerated(htmlContent)
      
      console.log('✅ Callback onContentGenerated executado!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 1500)

    } catch (error: any) {
      console.error('Erro ao gerar conteúdo:', error)
      setError(error.message || 'Erro ao gerar conteúdo. Verifique sua conexão e token.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={handleOpen}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
        size="lg"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Gerar com IA
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Gerador de Conteúdo com IA</DialogTitle>
                <DialogDescription>
                  Descreva o conteúdo que você deseja e a IA criará para você
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Token */}
            <div className="space-y-2">
              <Label htmlFor="ai-token">
                Token de API
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="ai-token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Seu token de acesso à API"
                disabled={isGenerating}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Seu token será salvo localmente para uso futuro
              </p>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">
                O que você quer gerar?
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Crie um conteúdo explicando os princípios de segurança da informação, incluindo confidencialidade, integridade e disponibilidade. Use exemplos práticos e liste 5 boas práticas."
                disabled={isGenerating}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Seja específico para obter melhores resultados
              </p>
            </div>

            {/* Estado de Carregamento */}
            {isGenerating && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <div>
                  <p className="font-medium text-blue-900">Gerando conteúdo...</p>
                  <p className="text-sm text-blue-700">Isso pode levar alguns segundos</p>
                </div>
              </div>
            )}

            {/* Sucesso */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Conteúdo gerado com sucesso!</p>
                  <p className="text-sm text-green-700">O conteúdo foi inserido no editor</p>
                </div>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Erro ao gerar conteúdo</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !token.trim() || !prompt.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Conteúdo
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
