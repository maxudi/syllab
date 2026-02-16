"use client"

import React from 'react'
import { uploadToStorage } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  bucket?: string
  folder?: string
  fileName?: string
  accept?: string // e.g. 'image/*,application/pdf'
  disabled?: boolean
  className?: string
  helperText?: string
  preview?: boolean
}

export function UrlOuUpload({
  label,
  value,
  onChange,
  placeholder,
  bucket,
  folder,
  fileName,
  accept = 'image/*',
  disabled,
  className,
  helperText,
  preview = true,
}: Props) {
  const [dragOver, setDragOver] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const onFileSelected = async (file?: File | null) => {
    if (!file) return
    try {
      setLoading(true)
      const { publicUrl } = await uploadToStorage(file, { bucket, folder, fileName, upsert: true })
      onChange(publicUrl)
    } catch (e: any) {
      console.error('Falha no upload', e?.message || e)
      alert(e?.message || 'Falha ao enviar o arquivo')
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    onFileSelected(file)
  }

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    onFileSelected(file)
    // limpa para permitir re-selecionar o mesmo arquivo
    e.target.value = ''
  }

  const isImage = typeof value === 'string' && /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(value)

  return (
    <div className={cn('space-y-2', className)}>
      {label ? <Label className="text-sm font-medium">{label}</Label> : null}

      <div className="space-y-2">
        <Input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Cole a URL aqui ou arraste/seleciona um arquivo'}
          disabled={disabled || loading}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragOver(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDragOver(false)
          }}
          onDrop={handleDrop}
          className={cn(
            'relative flex items-center justify-center gap-3 rounded-md border border-dashed p-4 transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleBrowse}
            disabled={disabled || loading}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || loading}
          >
            {loading ? 'Enviando...' : 'Selecionar arquivo'}
          </Button>
          <span className="text-xs text-muted-foreground">ou arraste e solte aqui</span>
        </div>

        {helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}

        {preview && value && isImage ? (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Pré-visualização"
              className="h-24 w-24 rounded-md object-cover border"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default UrlOuUpload
