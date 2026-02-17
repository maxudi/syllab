# Sistema de Busca e Vínculo de Instituições (Autocomplete Inteligente)

## O que mudou?

Agora o sistema de **Instituições** funciona de forma MUITO mais inteligente:

### ✅ Sistema Anterior
- Criar nova instituição direto
- Risco de duplicatas
- Campos: nome, sigla, logo, descrição

### ✨ Sistema Novo - AUTOCOMPLETE NO CAMPO NOME
1. **Digite o nome** da instituição no formulário
2. **Veja sugestões** em tempo real conforme digita
3. **Clique na instituição** se ela já existir → Vincula automaticamente
4. **Continue digitando** se não existir → Cadastra nova
5. **Campos adicionados**: Cidade e UF

---

## Como Funciona

### 1. Abrir Formulário de Instituição
- Clique em **"Adicionar Instituição"**
- Formulário abre com campo de nome inteligente

### 2. Digite o Nome
- Comece a digitar no campo **"Nome da Instituição"**
- Após 2 caracteres, aparecem sugestões abaixo
- Sugestões mostram:
  - **Nome completo** da instituição
  - **Sigla** (se tiver)
  - **📍 Cidade - UF** (se tiver)
  - Botão **"Vincular"** (verde)

### 3. Instituição Encontrada?

#### Opção A: Vincular-se (Instituição Existe)
1. Veja a instituição na lista de sugestões
2. Clique nela
3. Formulário é preenchido automaticamente
4. Aparece **alerta verde** informando que foi encontrada
5. Clique em **"Sim, Vincular-me a Esta Instituição"**
6. Pronto! Vinculado SEM criar duplicata ✅

#### Opção B: Cadastrar Nova (Instituição NÃO Existe)
1. Não aparece na lista? Continue digitando normalmente
2. Preencha os outros campos:
   - **Cidade*** (obrigatório)
   - **UF*** (obrigatório - 2 letras)
   - Sigla (opcional)
   - Logo URL (opcional)
   - Descrição (opcional)
3. Clique em **"Salvar e Vincular"**
4. Instituição criada + você vinculado ✅

---

## Migração do Banco de Dados

**IMPORTANTE:** Execute o script SQL antes de usar o sistema:

1. Acesse o **Supabase SQL Editor**
2. Execute o script: `database/migrate-add-cidade-uf.sql`
3. Verifique a mensagem: "Migração concluída!"

O script adiciona os campos:
- `cidade` (VARCHAR 100)
- `uf` (CHAR 2)

---

## Componentes Criados

### 1. **InstituicaoAutocomplete** (`components/instituicao-autocomplete.tsx`)
- ✅ Campo de input com autocomplete integrado
- ✅ Mostra sugestões ao digitar (mínimo 2 caracteres)
- ✅ Busca por: nome, sigla ou cidade
- ✅ Exibe dados completos: nome + sigla + cidade-UF
- ✅ Fecha ao clicar fora
- ✅ Callback `onSelectExisting` para vincular

### 2. **Tipo Instituição** (`lib/supabase.ts`)
```typescript
export type Instituicao = {
  // ... campos anteriores ...
  cidade: string | null
  uf: string | null
}
```

### 3. **Página de Instituições** (`app/professor/instituicoes/page.tsx`)
- ✅ Usa InstituicaoAutocomplete no campo nome
- ✅ Detecta quando instituição existente é selecionada
- ✅ Mostra alerta verde com opção de vincular
- ✅ Desabilita campos quando instituição encontrada
- ✅ Permite continuar cadastro se não encontrar

---

## Fluxo de UX

```
1. Clica "Adicionar Instituição"
   ↓
2. Digita no campo "Nome"
   ↓
3a. ENCONTROU na lista?          3b. NÃO encontrou?
    ↓                                ↓
    Clica na instituição            Continue digitando
    ↓                                ↓
    Alerta verde aparece            Preencha outros campos
    ↓                                ↓
    "Vincular-me a Esta"            "Salvar e Vincular"
    ↓                                ↓
    ✅ Vinculado!                   ✅ Criado + Vinculado!
```

---

## Validações

- **Nome**: obrigatório, mínimo 2 caracteres para buscar
- **Cidade**: obrigatório ao criar nova
- **UF**: obrigatório ao criar nova, exatamente 2 letras (auto-maiúscula)
- **Sigla**: opcional, até 50 caracteres (auto-maiúscula)
- **Duplicatas**: impede vincular 2x à mesma instituição
- **Campos bloqueados**: ao detectar instituição existente, campos ficam readonly

---

## Exemplos de Uso

### Cenário 1: Instituição já existe
```
1. Clica "Adicionar Instituição"
2. Digita "Universidade Fed"
3. Vê sugestão: "Universidade Federal de Minas Gerais"
                 "UFMG | 📍 Belo Horizonte - MG"
4. Clica na sugestão
5. ✅ Alerta verde: "Instituição Encontrada!"
6. Clica "Sim, Vincular-me a Esta Instituição"
7. ✅ Vinculado à UFMG (NÃO criou duplicata!)
```

### Cenário 2: Instituição nova
```
1. Clica "Adicionar Instituição"
2. Digita "Faculdade ABC"
3. Nenhuma sugestão aparece (não existe)
4. Preenche:
   - Cidade: Campinas
   - UF: SP
   - Sigla: FABC
5. Clica "Salvar e Vincular"
6. ✅ Instituição criada + vinculado automaticamente
```

### Cenário 3: Começou a criar, mas encontrou
```
1. Digita "Universidade de Brasília"
2. Vê sugestão "UnB - Brasília-DF"
3. "Opa! Já existe!"
4. Clica na sugestão
5. Formulário preenche sozinho
6. Clica "Vincular"
7. ✅ Não criou duplicata, só vinculou!
```

---

## Benefícios

✅ **Zero duplicatas**: Mostra instituições existentes ANTES de criar
✅ **Super rápido**: Autocomplete em tempo real (2+ caracteres)
✅ **Inteligente**: Busca por nome, sigla OU cidade
✅ **Visual claro**: Card verde quando encontra existente
✅ **Flexível**: Pode vincular OU criar nova no mesmo fluxo
✅ **Seguro**: Valida duplicata antes de vincular

---

## Detalhes Técnicos

### Busca em Tempo Real
```typescript
// Filtro aplica a partir de 2 caracteres
if (value.length >= 2) {
  const query = value.toLowerCase()
  const filtered = todasInstituicoes.filter(inst =>
    inst.nome.toLowerCase().includes(query) ||
    inst.sigla?.toLowerCase().includes(query) ||
    inst.cidade?.toLowerCase().includes(query)
  )
}
```

### Preenchimento Automático
```typescript
function handleSelectExistingInstituicao(instituicao: Instituicao) {
  // Preenche TODOS os campos automaticamente
  setFormData({
    nome: instituicao.nome,
    sigla: instituicao.sigla || '',
    cidade: instituicao.cidade || '',
    uf: instituicao.uf || '',
    descricao: instituicao.descricao || '',
    logo_url: instituicao.logo_url || ''
  })
  setInstituicaoSelecionada(instituicao) // Ativa alerta verde
}
```

### Validação de Duplicata
```typescript
// Antes de vincular, verifica se já não está vinculado
const { data: vinculoExistente } = await supabase
  .from('syllab_professor_instituicoes')
  .select('id')
  .eq('professor_id', professor.id)
  .eq('instituicao_id', instituicaoSelecionada.id)
  .eq('ativo', true)
  .single()

if (vinculoExistente) {
  showAlert('Aviso', 'Você já está vinculado a esta instituição!', 'warning')
}
```

---

## Suporte

Se tiver problemas:
1. Verifique se executou o script SQL de migração
2. Recarregue a página (F5)
3. Verifique console do navegador (F12)
4. Confirme que há instituições cadastradas para testar busca
