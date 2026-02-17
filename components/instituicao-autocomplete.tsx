'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Building2, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Instituicao } from '@/lib/supabase'

interface InstituicaoAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectExisting?: (instituicao: Instituicao) => void
  todasInstituicoes: Instituicao[]
  disabled?: boolean
}

export function InstituicaoAutocomplete({
  value,
  onChange,
  onSelectExisting,
  todasInstituicoes,
  disabled
}: InstituicaoAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredInstituicoes, setFilteredInstituicoes] = useState<Instituicao[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Filtrar instituições conforme digita
    if (value.length >= 2) {
      const query = value.toLowerCase()
      const filtered = todasInstituicoes.filter(inst =>
        inst.nome.toLowerCase().includes(query) ||
        inst.sigla?.toLowerCase().includes(query) ||
        inst.cidade?.toLowerCase().includes(query)
      )
      setFilteredInstituicoes(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredInstituicoes([])
      setShowSuggestions(false)
    }
  }, [value, todasInstituicoes])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectInstituicao = (instituicao: Instituicao) => {
    onChange(instituicao.nome)
    setShowSuggestions(false)
    onSelectExisting?.(instituicao)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Label htmlFor="nome">Nome da Instituição *</Label>
      <Input
        id="nome"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => {
          if (filteredInstituicoes.length > 0) {
            setShowSuggestions(true)
          }
        }}
        placeholder="Digite o nome da instituição..."
        required
        disabled={disabled}
        autoComplete="off"
      />
      
      {showSuggestions && filteredInstituicoes.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-[300px] overflow-auto">
          <div className="p-2 bg-blue-50 border-b border-blue-200">
            <p className="text-xs text-blue-800 font-medium flex items-center">
              <Building2 className="w-3 h-3 mr-1" />
              {filteredInstituicoes.length} instituição(ões) encontrada(s)
            </p>
          </div>
          {filteredInstituicoes.map((inst) => (
            <button
              key={inst.id}
              type="button"
              onClick={() => handleSelectInstituicao(inst)}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0",
                "transition-colors focus:outline-none focus:bg-blue-50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {inst.nome}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                    {inst.sigla && (
                      <span className="px-2 py-0.5 bg-slate-100 rounded font-mono">
                        {inst.sigla}
                      </span>
                    )}
                    {inst.cidade && inst.uf && (
                      <span>📍 {inst.cidade} - {inst.uf}</span>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    Vincular
                  </div>
                </div>
              </div>
            </button>
          ))}
          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              💡 Clique em uma instituição para se vincular a ela, ou continue digitando para cadastrar uma nova.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
