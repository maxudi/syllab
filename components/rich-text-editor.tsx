'use client'

import { useEffect, useRef } from 'react'
import 'quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<any>(null)
  const changeHandlerEnabled = useRef(true) // Controla se onChange deve ser chamado

  useEffect(() => {
    if (typeof window === 'undefined' || !editorRef.current || quillRef.current) return

    // Importar Quill dinamicamente apenas no cliente
    import('quill').then((Quill) => {
      if (!editorRef.current || quillRef.current) return

      const QuillConstructor = Quill.default || Quill

      quillRef.current = new QuillConstructor(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Digite o conteúdo aqui...',
        readOnly: disabled,
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
          ],
          clipboard: {
            matchVisual: false
          }
        }
      })

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🎬 RICH TEXT EDITOR - Inicializado')
      console.log('📊 Valor inicial (length):', value?.length || 0)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Definir valor inicial se existir
      if (value) {
        console.log('🔧 Definindo valor inicial - desabilitando changeHandler')
        changeHandlerEnabled.current = false
        
        try {
          console.log('📄 HTML a ser inserido (length):', value.length)
          console.log('📄 HTML preview:', value.substring(0, 150) + '...')
          
          // Método 1: Tentar usar dangerouslyPasteHTML (mais direto)
          const currentLength = quillRef.current.getLength()
          quillRef.current.deleteText(0, currentLength)
          quillRef.current.clipboard.dangerouslyPasteHTML(0, value)
          
          console.log('✅ dangerouslyPasteHTML executado')
          
          // Verificar o que ficou no editor
          const resultHTML = quillRef.current.root.innerHTML
          console.log('📊 HTML no editor após inserção (length):', resultHTML.length)
          console.log('📄 HTML no editor:', resultHTML.substring(0, 200) + '...')
          
        } catch (error) {
          console.error('❌ Erro ao definir valor inicial:', error)
        }
        
        // Re-habilitar após pequeno delay para garantir que todos os eventos foram processados
        setTimeout(() => {
          changeHandlerEnabled.current = true
          console.log('✅ ChangeHandler reabilitado')
        }, 100)
      }

      // Listener para mudanças
      quillRef.current.on('text-change', (delta: any, oldDelta: any, source: string) => {
        console.log('🔔 text-change disparado - source:', source, 'handler enabled:', changeHandlerEnabled.current)
        
        // Ignorar se handler está desabilitado OU se não foi mudança do usuário
        if (!changeHandlerEnabled.current || source !== 'user') {
          console.log('⏭️ Ignorando mudança (handler desabilitado ou source não é user)')
          return
        }
        
        console.log('✅ Processando mudança do usuário')
        const html = quillRef.current.root.innerHTML
        const cleanHtml = html === '<p><br></p>' ? '' : html
        onChange(cleanHtml)
      })
    })

    // Cleanup
    return () => {
      if (quillRef.current) {
        quillRef.current = null
      }
    }
  }, [])

  // Atualizar valor quando mudar externamente
  useEffect(() => {
    if (quillRef.current && value !== undefined && value !== null) {
      const currentHTML = quillRef.current.root.innerHTML
      const isEmpty = currentHTML === '<p><br></p>' || currentHTML === ''
      const newValue = value || ''
      
      // Log para debug
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📝 RICH TEXT EDITOR - Tentando atualizar')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 Current HTML (length):', currentHTML.length)
      console.log('📊 New Value (length):', newValue.length)
      console.log('📄 Current HTML:', currentHTML.substring(0, 100) + '...')
      console.log('📄 New Value:', newValue.substring(0, 100) + '...')
      console.log('❓ Is Empty:', isEmpty)
      console.log('❓ Valores diferentes:', currentHTML !== newValue)
      
      // Só atualiza se o valor realmente mudou
      if (isEmpty && newValue || currentHTML !== newValue) {
        console.log('✅ ATUALIZANDO EDITOR COM NOVO CONTEÚDO')
        console.log('🔧 Desabilitando changeHandler')
        
        // Bloquear listener de mudanças
        changeHandlerEnabled.current = false
        
        try {
          const currentSelection = quillRef.current.getSelection()
          
          // Limpar editor e inserir novo HTML usando dangerouslyPasteHTML
          const currentLength = quillRef.current.getLength()
          quillRef.current.deleteText(0, currentLength)
          quillRef.current.clipboard.dangerouslyPasteHTML(0, newValue)
          
          // Restaurar seleção se existir
          if (currentSelection) {
            try {
              quillRef.current.setSelection(currentSelection)
            } catch (e) {
              // Ignorar erro se a seleção não for mais válida
            }
          }
          
          console.log('✅ Editor atualizado com sucesso!')
          
          // Verificar resultado
          const resultHTML = quillRef.current.root.innerHTML
          console.log('📊 HTML final no editor (length):', resultHTML.length)
          
        } finally {
          // Sempre reabilitar após pequeno delay
          setTimeout(() => {
            changeHandlerEnabled.current = true
            console.log('✅ ChangeHandler reabilitado após atualização')
          }, 100)
        }
      } else {
        console.log('⏭️ Conteúdo não mudou, pulando atualização')
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    }
  }, [value])

  // Atualizar estado disabled
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!disabled)
    }
  }, [disabled])

  return (
    <div className="rich-text-editor">
      <div ref={editorRef} />
      
      <style jsx global>{`
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          background: #ffffff;
          min-height: 300px;
          max-height: 500px;
          overflow-y: auto;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .rich-text-editor .ql-editor {
          font-size: 15px;
          line-height: 1.6;
          min-height: 300px;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        
        .rich-text-editor .ql-snow .ql-picker {
          font-size: 14px;
        }
        
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: #475569;
        }
        
        .rich-text-editor .ql-snow .ql-fill {
          fill: #475569;
        }
        
        .rich-text-editor .ql-snow .ql-picker-label:hover,
        .rich-text-editor .ql-snow .ql-picker-label.ql-active,
        .rich-text-editor .ql-snow .ql-picker-item:hover,
        .rich-text-editor .ql-snow .ql-picker-item.ql-selected {
          color: #2563eb;
        }
        
        .rich-text-editor .ql-snow.ql-toolbar button:hover,
        .rich-text-editor .ql-snow .ql-toolbar button:hover {
          color: #2563eb;
        }
        
        .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2563eb;
        }
        
        .rich-text-editor .ql-snow.ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-snow.ql-toolbar button.ql-active .ql-fill,
        .rich-text-editor .ql-snow .ql-toolbar button.ql-active .ql-fill {
          fill: #2563eb;
        }
        
        /* Código em destaque */
        .rich-text-editor .ql-editor pre.ql-syntax {
          background-color: #1e293b;
          color: #e2e8f0;
          border-radius: 0.375rem;
          padding: 1rem;
          overflow-x: auto;
        }
        
        .rich-text-editor .ql-editor code {
          background-color: #f1f5f9;
          color: #dc2626;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        
        /* Blockquote */
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #2563eb;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          color: #475569;
        }
        
        /* Links */
        .rich-text-editor .ql-editor a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        /* Listas */
        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          padding-left: 1.5rem;
        }
        
        /* Imagens */
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  )
}

// Componente para visualizar o conteúdo HTML renderizado
export function RichTextViewer({ content }: { content: string }) {
  return (
    <div 
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
