# 🚀 Guia Rápido: Criar Aula de Exemplo

## Passos para Criar sua Primeira Aula com Slides

### 1️⃣ Execute os Scripts na Ordem

No **SQL Editor do Supabase**, execute na ordem:

#### Script 1: Criar Tabela de Slides
```bash
database/add-slides-table.sql
```
Este cria a estrutura no banco de dados.

#### Script 2: Criar Aula de Exemplo Automática
```bash
database/criar-aula-exemplo-automatico.sql
```
Este cria uma aula completa com 10 slides automaticamente!

### 2️⃣ Visualize o Resultado

1. O script mostrará uma mensagem com o ID da aula criada
2. Acesse: `http://localhost:3001/aula/[ID-MOSTRADO]`
3. Ou vá em `/professor` e clique em "Gerenciar Slides"

### 3️⃣ Se Houver Erro

**Erro: "Nenhuma disciplina encontrada"**

Você precisa criar uma disciplina primeiro:

1. Acesse: `/professor/instituicoes`
2. Crie uma instituição
3. Acesse: `/professor/disciplinas`  
4. Crie uma disciplina
5. Execute o script novamente

## 📋 Alternativa: Criar Manualmente

Se preferir criar manualmente pelo sistema:

### Passo 1: Criar Conteúdo
1. Acesse `/professor`
2. Selecione uma disciplina
3. Clique em "Adicionar Conteúdo"
4. Preencha:
   - **Título**: Aula 01: [Seu Título]
   - **Tipo**: Jornada de Aula
   - **Descrição**: Breve descrição
5. Salvar

### Passo 2: Gerenciar Slides
1. Clique em "Gerenciar Slides" no conteúdo criado
2. Clique em "Novo Slide"
3. Preencha:
   - **Título**: Introdução
   - **Ícone**: `bi-shield-lock-fill`
   - **Conteúdo HTML**:
   ```html
   <p class="fs-5">Bem-vindos à aula!</p>
   <ul>
     <li>Tópico 1</li>
     <li>Tópico 2</li>
   </ul>
   ```
   - **Tipo de Mídia**: Texto
   - **Duração**: 5 minutos
4. Salvar
5. Repita para mais slides

### Passo 3: Visualizar
- Clique em "Visualizar Aula"
- Navegue com ← → do teclado

## 🎯 Ícones Disponíveis

Veja todos em: https://icons.getbootstrap.com

Exemplos úteis:
- `bi-shield-lock-fill` - Segurança
- `bi-book-fill` - Livro
- `bi-lightbulb-fill` - Ideia
- `bi-calendar-event` - Calendário
- `bi-check-circle-fill` - Check
- `bi-exclamation-triangle-fill` - Alerta
- `bi-graph-up` - Gráfico
- `bi-people-fill` - Pessoas
- `bi-gear-fill` - Configuração

## 💡 Dicas de HTML

### Caixa de Destaque
```html
<div class="highlight-box">
  <p><strong>Importante:</strong> Texto destacado.</p>
</div>
```

### Lista com Destaques
```html
<ul>
  <li>Item normal</li>
  <li><strong>Item importante</strong></li>
</ul>
```

### Parágrafo Grande
```html
<p class="fs-5">Texto em tamanho maior</p>
```

### Texto Centralizado
```html
<p class="text-center">Texto centralizado</p>
```

## 🔍 Troubleshooting

### "Nenhuma disciplina encontrada"
→ Crie uma instituição e disciplina primeiro

### "Invalid UUID"
→ Use o script automático ao invés do template

### "Permission denied"
→ Execute o script `fix-rls-permissions.sql`

### Imagem não carrega
→ Verifique se a URL é pública e válida

### Slide não aparece
→ Recarregue a página, verifique se `ativo = true`

## 📚 Documentação Completa

Para mais detalhes, veja:
- [GUIA-SLIDES.md](GUIA-SLIDES.md) - Guia completo do sistema
- [README.md](README.md) - Visão geral do projeto

---

**Pronto para começar?** Execute o script automático agora! 🚀
