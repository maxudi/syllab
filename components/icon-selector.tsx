'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Search, X } from 'lucide-react'

interface IconSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// Lista de ícones mais comuns do Bootstrap Icons
const BOOTSTRAP_ICONS = [
  // Educação e Academia
  { name: 'bi-book', label: 'Livro' },
  { name: 'bi-book-fill', label: 'Livro (preenchido)' },
  { name: 'bi-journal-text', label: 'Caderno com texto' },
  { name: 'bi-pencil', label: 'Lápis' },
  { name: 'bi-pencil-fill', label: 'Lápis (preenchido)' },
  { name: 'bi-pen', label: 'Caneta' },
  { name: 'bi-pen-fill', label: 'Caneta (preenchida)' },
  { name: 'bi-mortarboard', label: 'Capelo' },
  { name: 'bi-mortarboard-fill', label: 'Capelo (preenchido)' },
  { name: 'bi-award', label: 'Prêmio' },
  { name: 'bi-award-fill', label: 'Prêmio (preenchido)' },
  { name: 'bi-bookmark', label: 'Marcador' },
  { name: 'bi-bookmark-fill', label: 'Marcador (preenchido)' },
  
  // Computação e Tecnologia
  { name: 'bi-laptop', label: 'Laptop' },
  { name: 'bi-laptop-fill', label: 'Laptop (preenchido)' },
  { name: 'bi-code-slash', label: 'Código' },
  { name: 'bi-code-square', label: 'Código em quadrado' },
  { name: 'bi-terminal', label: 'Terminal' },
  { name: 'bi-terminal-fill', label: 'Terminal (preenchido)' },
  { name: 'bi-cpu', label: 'CPU' },
  { name: 'bi-cpu-fill', label: 'CPU (preenchido)' },
  { name: 'bi-database', label: 'Banco de dados' },
  { name: 'bi-database-fill', label: 'Banco de dados (preenchido)' },
  { name: 'bi-server', label: 'Servidor' },
  { name: 'bi-globe', label: 'Globo' },
  { name: 'bi-globe2', label: 'Globo 2' },
  { name: 'bi-wifi', label: 'WiFi' },
  { name: 'bi-router', label: 'Roteador' },
  { name: 'bi-router-fill', label: 'Roteador (preenchido)' },
  
  // Segurança
  { name: 'bi-shield', label: 'Escudo' },
  { name: 'bi-shield-fill', label: 'Escudo (preenchido)' },
  { name: 'bi-shield-lock', label: 'Escudo com cadeado' },
  { name: 'bi-shield-lock-fill', label: 'Escudo com cadeado (preenchido)' },
  { name: 'bi-shield-check', label: 'Escudo com check' },
  { name: 'bi-lock', label: 'Cadeado' },
  { name: 'bi-lock-fill', label: 'Cadeado (preenchido)' },
  { name: 'bi-key', label: 'Chave' },
  { name: 'bi-key-fill', label: 'Chave (preenchida)' },
  
  // Comunicação
  { name: 'bi-chat', label: 'Chat' },
  { name: 'bi-chat-fill', label: 'Chat (preenchido)' },
  { name: 'bi-chat-dots', label: 'Chat com pontos' },
  { name: 'bi-chat-dots-fill', label: 'Chat com pontos (preenchido)' },
  { name: 'bi-envelope', label: 'Envelope' },
  { name: 'bi-envelope-fill', label: 'Envelope (preenchido)' },
  { name: 'bi-telephone', label: 'Telefone' },
  { name: 'bi-telephone-fill', label: 'Telefone (preenchido)' },
  
  // Mídia
  { name: 'bi-play-circle', label: 'Play' },
  { name: 'bi-play-circle-fill', label: 'Play (preenchido)' },
  { name: 'bi-camera-video', label: 'Vídeo' },
  { name: 'bi-camera-video-fill', label: 'Vídeo (preenchido)' },
  { name: 'bi-image', label: 'Imagem' },
  { name: 'bi-image-fill', label: 'Imagem (preenchida)' },
  { name: 'bi-file-earmark-pdf', label: 'PDF' },
  { name: 'bi-file-earmark-pdf-fill', label: 'PDF (preenchido)' },
  { name: 'bi-file-earmark-text', label: 'Arquivo de texto' },
  { name: 'bi-file-earmark-text-fill', label: 'Arquivo de texto (preenchido)' },
  
  // Ações
  { name: 'bi-check-circle', label: 'Check' },
  { name: 'bi-check-circle-fill', label: 'Check (preenchido)' },
  { name: 'bi-x-circle', label: 'X' },
  { name: 'bi-x-circle-fill', label: 'X (preenchido)' },
  { name: 'bi-info-circle', label: 'Info' },
  { name: 'bi-info-circle-fill', label: 'Info (preenchido)' },
  { name: 'bi-exclamation-triangle', label: 'Aviso' },
  { name: 'bi-exclamation-triangle-fill', label: 'Aviso (preenchido)' },
  { name: 'bi-question-circle', label: 'Questão' },
  { name: 'bi-question-circle-fill', label: 'Questão (preenchido)' },
  { name: 'bi-plus-circle', label: 'Mais' },
  { name: 'bi-plus-circle-fill', label: 'Mais (preenchido)' },
  { name: 'bi-dash-circle', label: 'Menos' },
  { name: 'bi-dash-circle-fill', label: 'Menos (preenchido)' },
  
  // Organização
  { name: 'bi-folder', label: 'Pasta' },
  { name: 'bi-folder-fill', label: 'Pasta (preenchida)' },
  { name: 'bi-folder-open', label: 'Pasta aberta' },
  { name: 'bi-folder-open-fill', label: 'Pasta aberta (preenchida)' },
  { name: 'bi-list-ul', label: 'Lista' },
  { name: 'bi-list-ol', label: 'Lista numerada' },
  { name: 'bi-grid', label: 'Grade' },
  { name: 'bi-grid-fill', label: 'Grade (preenchida)' },
  { name: 'bi-calendar', label: 'Calendário' },
  { name: 'bi-calendar-fill', label: 'Calendário (preenchido)' },
  { name: 'bi-clock', label: 'Relógio' },
  { name: 'bi-clock-fill', label: 'Relógio (preenchido)' },
  
  // Navegação
  { name: 'bi-arrow-right', label: 'Seta direita' },
  { name: 'bi-arrow-left', label: 'Seta esquerda' },
  { name: 'bi-arrow-up', label: 'Seta cima' },
  { name: 'bi-arrow-down', label: 'Seta baixo' },
  { name: 'bi-house', label: 'Casa' },
  { name: 'bi-house-fill', label: 'Casa (preenchida)' },
  { name: 'bi-gear', label: 'Engrenagem' },
  { name: 'bi-gear-fill', label: 'Engrenagem (preenchida)' },
  
  // Pessoas
  { name: 'bi-person', label: 'Pessoa' },
  { name: 'bi-person-fill', label: 'Pessoa (preenchida)' },
  { name: 'bi-people', label: 'Pessoas' },
  { name: 'bi-people-fill', label: 'Pessoas (preenchidas)' },
  { name: 'bi-person-badge', label: 'Pessoa com badge' },
  { name: 'bi-person-badge-fill', label: 'Pessoa com badge (preenchida)' },
  
  // Ciência
  { name: 'bi-lightning', label: 'Raio' },
  { name: 'bi-lightning-fill', label: 'Raio (preenchido)' },
  { name: 'bi-graph-up', label: 'Gráfico subindo' },
  { name: 'bi-graph-down', label: 'Gráfico descendo' },
  { name: 'bi-calculator', label: 'Calculadora' },
  { name: 'bi-calculator-fill', label: 'Calculadora (preenchida)' },
  { name: 'bi-speedometer', label: 'Velocímetro' },
  { name: 'bi-speedometer2', label: 'Velocímetro 2' },
  
  // Outros
  { name: 'bi-star', label: 'Estrela' },
  { name: 'bi-star-fill', label: 'Estrela (preenchida)' },
  { name: 'bi-heart', label: 'Coração' },
  { name: 'bi-heart-fill', label: 'Coração (preenchido)' },
  { name: 'bi-flag', label: 'Bandeira' },
  { name: 'bi-flag-fill', label: 'Bandeira (preenchida)' },
  { name: 'bi-trophy', label: 'Troféu' },
  { name: 'bi-trophy-fill', label: 'Troféu (preenchido)' },
  { name: 'bi-lightbulb', label: 'Lâmpada' },
  { name: 'bi-lightbulb-fill', label: 'Lâmpada (preenchida)' },
  { name: 'bi-bullseye', label: 'Alvo' },
  { name: 'bi-compass', label: 'Bússola' },
  { name: 'bi-compass-fill', label: 'Bússola (preenchida)' },
]

export function IconSelector({ value, onChange, placeholder }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredIcons = BOOTSTRAP_ICONS.filter(icon => 
    icon.name.toLowerCase().includes(search.toLowerCase()) ||
    icon.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelectIcon = (iconName: string) => {
    onChange(iconName)
    setIsOpen(false)
    setSearch('')
  }

  const handleClearIcon = () => {
    onChange('')
    setSearch('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Ex: bi-shield-lock-fill"}
            onClick={() => setIsOpen(true)}
            className="pr-16"
          />
          {value && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <i className={`${value} text-xl`}></i>
              <button
                type="button"
                onClick={handleClearIcon}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ícone..."
              className="w-full"
              autoFocus
            />
          </div>
          
          <div className="overflow-y-auto max-h-80 p-2">
            {filteredIcons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum ícone encontrado
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleSelectIcon(icon.name)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border transition-all
                      hover:border-blue-500 hover:bg-blue-50
                      ${value === icon.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    `}
                  >
                    <i className={`${icon.name} text-2xl flex-shrink-0`}></i>
                    <div className="text-left min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate">
                        {icon.label}
                      </div>
                      <div className="text-xs text-gray-500 truncate font-mono">
                        {icon.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
