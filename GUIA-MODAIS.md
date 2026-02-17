# Sistema de Modais - Guia de Uso

Este guia mostra como usar o novo sistema de modais elegantes no lugar dos antigos `alert()` e `confirm()`.

## Instalação

Os modais já estão configurados no sistema. Você só precisa importar e usar os hooks.

## Componentes Criados

### 1. Dialog (Base)
Componente base para criar modais customizados.
- Localização: `components/ui/dialog.tsx`

### 2. AlertDialog e ConfirmDialog
Componentes prontos para alertas e confirmações.
- Localização: `components/alert-dialog.tsx`

## Como Usar

### Exemplo 1: Alertas Simples

```tsx
'use client'

import { useAlert } from '@/components/alert-dialog'

export default function MinhaPage() {
  const { showAlert, AlertComponent } = useAlert()

  function handleAction() {
    // Sucesso
    showAlert('Sucesso', 'Operação realizada com sucesso!', 'success')
    
    // Erro
    showAlert('Erro', 'Algo deu errado', 'error')
    
    // Aviso
    showAlert('Atenção', 'Verifique os dados', 'warning')
    
    // Info
    showAlert('Informação', 'Dados salvos localmente', 'info')
  }

  return (
    <div>
      <button onClick={handleAction}>Executar Ação</button>
      
      {/* Adicione o componente no final do JSX */}
      <AlertComponent />
    </div>
  )
}
```

### Exemplo 2: Confirmações

```tsx
'use client'

import { useConfirm } from '@/components/alert-dialog'

export default function MinhaPage() {
  const { showConfirm, ConfirmComponent } = useConfirm()

  function handleDelete() {
    showConfirm(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
      async () => {
        // Código executado quando o usuário confirma
        await deleteItem()
      },
      {
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        variant: 'destructive' // Botão vermelho para ações perigosas
      }
    )
  }

  async function deleteItem() {
    // Sua lógica de exclusão
    console.log('Item excluído')
  }

  return (
    <div>
      <button onClick={handleDelete}>Excluir</button>
      
      {/* Adicione o componente no final do JSX */}
      <ConfirmComponent />
    </div>
  )
}
```

### Exemplo 3: Usando Ambos

```tsx
'use client'

import { useAlert, useConfirm } from '@/components/alert-dialog'

export default function MinhaPage() {
  const { showAlert, AlertComponent } = useAlert()
  const { showConfirm, ConfirmComponent } = useConfirm()

  async function handleSave() {
    try {
      // Salvar dados...
      showAlert('Sucesso', 'Dados salvos com sucesso!', 'success')
    } catch (error) {
      showAlert('Erro', 'Falha ao salvar os dados', 'error')
    }
  }

  function handleDelete() {
    showConfirm(
      'Confirmar',
      'Deseja realmente excluir?',
      async () => {
        try {
          // Executar exclusão
          await deleteData()
          showAlert('Sucesso', 'Item excluído!', 'success')
        } catch (error) {
          showAlert('Erro', 'Falha ao excluir', 'error')
        }
      },
      { variant: 'destructive' }
    )
  }

  return (
    <div>
      <button onClick={handleSave}>Salvar</button>
      <button onClick={handleDelete}>Excluir</button>
      
      {/* Adicione AMBOS os componentes */}
      <AlertComponent />
      <ConfirmComponent />
    </div>
  )
}
```

## Tipos de Alert

- **success** - Ícone verde de check, para operações bem-sucedidas
- **error** - Ícone vermelho de erro, para falhas
- **warning** - Ícone amarelo de alerta, para avisos
- **info** - Ícone azul de informação, para mensagens informativas

## Personalização de Confirmação

```tsx
showConfirm(
  'Título',
  'Descrição',
  onConfirm,
  {
    confirmText: 'Sim, continuar',  // Texto do botão de confirmar
    cancelText: 'Não, voltar',      // Texto do botão de cancelar
    variant: 'destructive'           // 'default' ou 'destructive'
  }
)
```

## Páginas Já Atualizadas

✅ `/professor/disciplinas` - Totalmente atualizado
✅ `/professor/instituicoes` - Totalmente atualizado

## Vantagens

1. **Visual Moderno** - Interface elegante e profissional
2. **Centralizado** - Modais aparecem no centro da tela
3. **Animado** - Efeitos suaves de entrada/saída
4. **Backdrop** - Fundo escurecido com blur
5. **Acessibilidade** - Foca automaticamente nos botões
6. **Tipado** - TypeScript completo
7. **Reutilizável** - Use em qualquer página

## Migrando código antigo

### Antes:
```tsx
alert('Operação realizada com sucesso!')
```

### Depois:
```tsx
showAlert('Sucesso', 'Operação realizada com sucesso!', 'success')
```

### Antes:
```tsx
if (confirm('Tem certeza?')) {
  deleteItem()
}
```

### Depois:
```tsx
showConfirm(
  'Confirmação',
  'Tem certeza?',
  () => deleteItem(),
  { variant: 'destructive' }
)
```
