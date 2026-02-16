/**
 * Componente de Seleção de Tema de Cores para Slides/Apresentações
 * 
 * USO:
 * import { ColorThemeSelector } from '@/components/color-theme-selector'
 * 
 * <ColorThemeSelector 
 *   value={corTema} 
 *   onChange={(cor) => setCorTema(cor)} 
 * />
 */

import React from 'react'
import { Label } from '@/components/ui/label'

export const TEMAS_CORES = {
  vermelho: {
    nome: 'Vermelho',
    cor: '#d32f2f',
    gradiente: 'linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)',
    descricao: 'Clássico e impactante'
  },
  azul: {
    nome: 'Azul Marinho',
    cor: '#1565c0',
    gradiente: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
    descricao: 'Profissional e confiável'
  },
  verde: {
    nome: 'Verde Escuro',
    cor: '#2e7d32',
    gradiente: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
    descricao: 'Crescimento e natureza'
  },
  roxo: {
    nome: 'Roxo',
    cor: '#6a1b9a',
    gradiente: 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%)',
    descricao: 'Criativo e sofisticado'
  },
  vinho: {
    nome: 'Vinho',
    cor: '#ad1457',
    gradiente: 'linear-gradient(135deg, #880e4f 0%, #ad1457 100%)',
    descricao: 'Elegante e formal'
  },
  cinza: {
    nome: 'Cinza Escuro',
    cor: '#37474f',
    gradiente: 'linear-gradient(135deg, #263238 0%, #37474f 100%)',
    descricao: 'Moderno e tech'
  }
}

interface ColorThemeSelectorProps {
  value?: string
  onChange: (tema: string) => void
  label?: string
  showDescription?: boolean
}

export function ColorThemeSelector({ 
  value = 'vermelho', 
  onChange, 
  label = 'Tema de Cores da Apresentação',
  showDescription = true 
}: ColorThemeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="cor_tema">{label}</Label>
      {showDescription && (
        <p className="text-sm text-gray-500">
          Escolha a paleta de cores que será aplicada nos slides desta apresentação
        </p>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(TEMAS_CORES).map(([key, tema]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              value === key 
                ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {/* Preview do gradiente */}
            <div 
              className="w-full h-12 rounded-md mb-2"
              style={{ background: tema.gradiente }}
            />
            
            {/* Nome e descrição */}
            <div className="text-left">
              <p className="font-semibold text-sm text-gray-900">{tema.nome}</p>
              <p className="text-xs text-gray-500">{tema.descricao}</p>
            </div>
            
            {/* Indicador de seleção */}
            {value === key && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * EXEMPLO DE USO EM UM FORMULÁRIO:
 * 
 * import { ColorThemeSelector } from '@/components/color-theme-selector'
 * 
 * export default function FormConteudo() {
 *   const [formData, setFormData] = useState({
 *     titulo: '',
 *     descricao: '',
 *     cor_tema: 'vermelho', // valor padrão
 *   })
 * 
 *   async function handleSubmit(e: React.FormEvent) {
 *     e.preventDefault()
 *     
 *     const { error } = await supabase
 *       .from('syllab_conteudos')
 *       .insert({
 *         titulo: formData.titulo,
 *         descricao: formData.descricao,
 *         cor_tema: formData.cor_tema, // ← salva o tema escolhido
 *         disciplina_id: disciplinaId,
 *         tipo: 'jornada_aula',
 *         ativo: true
 *       })
 *     
 *     if (error) {
 *       alert('Erro ao criar conteúdo')
 *     } else {
 *       alert('Conteúdo criado com sucesso!')
 *     }
 *   }
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <Input 
 *         label="Título"
 *         value={formData.titulo}
 *         onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
 *       />
 *       
 *       <Textarea 
 *         label="Descrição"
 *         value={formData.descricao}
 *         onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
 *       />
 *       
 *       <ColorThemeSelector 
 *         value={formData.cor_tema}
 *         onChange={(cor) => setFormData({ ...formData, cor_tema: cor })}
 *       />
 *       
 *       <Button type="submit">Salvar Conteúdo</Button>
 *     </form>
 *   )
 * }
 */
