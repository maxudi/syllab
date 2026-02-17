# Sistema de Aprovação de Professores

## Visão Geral

O sistema agora possui um campo `status` na tabela `syllab_professores` para controlar a aprovação de cadastros.

## Status Disponíveis

- **`approved`**: Professor aprovado e pode acessar o sistema
- **`pending`**: Aguardando aprovação do administrador
- **`rejected`**: Cadastro rejeitado (não implementado na interface ainda)

---

## Migração do Banco de Dados

### Passo 1: Adicionar campo STATUS na tabela
Execute no Supabase SQL Editor:
```sql
-- Arquivo: database/add-status-professores.sql
```

Este script:
- ✅ Adiciona coluna `status` (se não existir)
- ✅ Define valor padrão: `pending`
- ✅ Atualiza professores antigos para `approved`

### Passo 2: Atualizar VIEW de administração
Execute no Supabase SQL Editor:
```sql
-- Arquivo: database/update-view-admin-professores-status.sql
```

Este script:
- ✅ Recria `v_admin_professores` incluindo campo `status`
- ✅ Mantém todas as outras colunas e agregações
- ✅ Testa a nova estrutura

---

## Interface de Administração

### Página: `/admin/professores`

A página mostra:

1. **Cards Resumo:**
   - Total de professores
   - Pendentes (status = 'pending')
   - Ativos (ativo = true)

2. **Listagem de Professores:**
   - Coluna "Aprovação": Badge colorido
     - 🟢 Verde = Aprovado
     - 🟡 Amarelo = Pendente
   - Clicável para trocar status

3. **Modal de Aprovação:**
   - Abre ao clicar no badge de status
   - Mostra status atual
   - Botão para alternar entre `approved` ↔ `pending`

### Ações Disponíveis

#### Aprovar/Rejeitar Professor
```typescript
// Ao clicar no badge de status
setSelectedProfessor(professor)

// No modal, ao confirmar:
handleToggleApproval()
  → Muda de 'pending' para 'approved'
  → OU de 'approved' para 'pending'
```

#### Ativar/Desativar Conta
```typescript
// Botão de Power
toggleProfessorAtivo(professorId, currentStatus)
  → Altera campo 'ativo' (true/false)
  → NÃO afeta o status de aprovação
```

---

## Diferença: STATUS vs ATIVO

| Campo | Valores | Propósito |
|-------|---------|-----------|
| **`status`** | approved, pending, rejected | Aprovação do cadastro |
| **`ativo`** | true, false | Conta ativa/suspensa |

### Combinações Possíveis

| Status | Ativo | Resultado |
|--------|-------|-----------|
| approved | true | ✅ Pode acessar normalmente |
| approved | false | ⚠️ Aprovado mas conta suspensa |
| pending | true | ⏳ Aguardando aprovação |
| pending | false | ❌ Pendente e inativo |

---

## Fluxo de Aprovação

```
1. Professor se cadastra
   ↓
   status = 'pending'
   ativo = true (padrão)
   ↓
2. Admin acessa /admin/professores
   ↓
   Vê lista com badges amarelos (Pendente)
   ↓
3. Admin clica no badge amarelo
   ↓
   Modal abre
   ↓
4. Admin clica "Mudar para Aprovado"
   ↓
   status = 'approved'
   Badge fica verde
   ↓
5. Professor pode acessar sistema
```

---

## Filtros e Busca

### Buscar Professores
```typescript
// Campo de busca filtra por:
- Nome
- Email
```

### Estatísticas
```typescript
// Cards mostram:
professores.length                        // Total
professores.filter(p => p.status === 'pending').length  // Pendentes
professores.filter(p => p.ativo).length   // Ativos
```

---

## Código Relevante

### Tipo TypeScript
```typescript
type Professor = {
  id: string
  nome: string
  email: string
  status: 'approved' | 'pending' | string
  ativo: boolean
  // ... outros campos
}
```

### Query Supabase
```typescript
const { data, error } = await supabase
  .from('v_admin_professores')
  .select('*')
  .order('nome')
```

### Atualizar Status
```typescript
await supabase
  .from('syllab_professores')
  .update({ status: newStatus })
  .eq('id', professorId)
```

---

## Próximas Melhorias Sugeridas

1. **Filtros por Status**: Botões para filtrar apenas pendentes/aprovados
2. **Notificações**: Email ao professor quando for aprovado
3. **Status "rejected"**: Interface para rejeitar e impedir acesso
4. **Logs de Auditoria**: Registrar quem aprovou/rejeitou e quando
5. **Aprovação em Massa**: Checkbox para aprovar vários de uma vez

---

## Troubleshooting

### Problema: Campo status não aparece
✅ Solução: Execute `add-status-professores.sql`

### Problema: View não retorna status
✅ Solução: Execute `update-view-admin-professores-status.sql`

### Problema: Professores antigos sem status
✅ Solução: O script define automaticamente como 'approved'

### Problema: Badge não muda de cor
✅ Solução: Verifique se `prof.status === 'approved'` (não 'approve')

---

## Permissões RLS

Certifique-se de que:
- Admins podem ler/escrever em `syllab_professores`
- View `v_admin_professores` é acessível por admins
- Professores NÃO podem alterar próprio status

---

## Exemplo de Uso

```typescript
// Listar apenas pendentes
const pendentes = professores.filter(p => p.status === 'pending')

// Aprovar professor
await supabase
  .from('syllab_professores')
  .update({ status: 'approved' })
  .eq('id', professorId)

// Desativar conta (mantém aprovação)
await supabase
  .from('syllab_professores')
  .update({ ativo: false })
  .eq('id', professorId)
```

---

**Última atualização**: 17/02/2026  
**Versão**: 1.0
