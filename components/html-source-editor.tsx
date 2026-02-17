'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Code, Eye } from 'lucide-react'

interface HtmlSourceEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function HtmlSourceEditor({ value, onChange, disabled }: HtmlSourceEditorProps) {
  const [mode, setMode] = useState<'visual' | 'source'>('visual')

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant={mode === 'visual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('visual')}
          disabled={disabled}
        >
          <Eye className="w-4 h-4 mr-1" />
          Visual
        </Button>
        <Button
          type="button"
          variant={mode === 'source' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('source')}
          disabled={disabled}
        >
          <Code className="w-4 h-4 mr-1" />
          Código HTML
        </Button>
      </div>

      {mode === 'visual' ? (
        <div 
          className="border rounded-lg p-4 min-h-[300px] bg-white prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400">Nenhum conteúdo ainda...</p>' }}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cole ou digite o código HTML aqui..."
          rows={15}
          disabled={disabled}
          className="font-mono text-sm"
        />
      )}
    </div>
  )
}
