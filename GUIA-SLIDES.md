# Guia do Sistema de Slides - Syllab

## 🎯 Visão Geral

O Syllab agora possui um sistema completo de gerenciamento de slides para aulas! Você pode criar apresentações interativas com múltiplos slides, cada um podendo conter:

- Texto formatado em HTML
- Imagens
- PDFs
- Links/URLs
- Vídeos (YouTube ou arquivo)
- Ícones personalizados

## 📋 Passo a Passo para Criar uma Aula com Slides

### 1. Execute o Script SQL

Primeiro, você precisa criar a tabela de slides no banco de dados:

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo `database/add-slides-table.sql`
4. Copie todo o conteúdo e cole no SQL Editor
5. Clique em **Run** para executar

Isso criará:
- Tabela `syllab_slides`
- Políticas RLS necessárias
- Trigger para atualização automática
- Campo `tem_slides` na tabela `syllab_conteudos`

### 2. Crie um Conteúdo do Tipo "Jornada de Aula"

1. Acesse `/professor`
2. Selecione uma disciplina
3. Clique em **"Adicionar Conteúdo"**
4. Preencha:
   - **Título**: Ex: "Aula 01: Fundamentos de Segurança da Informação"
   - **Tipo**: Selecione **"Jornada de Aula"**
   - **Descrição**: Breve descrição do que será abordado
   - **Ordem**: 1 (ou número sequencial)
5. Clique em **Salvar**

### 3. Gerencie os Slides da Aula

1. Após criar o conteúdo, você verá um botão **"Gerenciar Slides"**
2. Clique nele para abrir o gerenciador de slides
3. Clique em **"Novo Slide"**

### 4. Criando um Slide

Cada slide pode ter:

#### Campos Obrigatórios:
- **Título do Slide**: Ex: "Introdução à Aula"
- **Duração (minutos)**: Tempo estimado do slide

#### Campos Opcionais:
- **Ícone (Bootstrap Icons)**: 
  - Ex: `bi-shield-lock-fill`, `bi-book-fill`, `bi-lightbulb-fill`
  - Veja todos em: https://icons.getbootstrap.com
  
- **Conteúdo (HTML)**:
```html
<p>Bem-vindos à aula de <strong>Segurança da Informação</strong>!</p>
<ul>
  <li>Tópico 1</li>
  <li>Tópico 2</li>
</ul>

<div class="highlight-box">
  <p><strong>Importante:</strong> Esta é uma informação destacada.</p>
</div>
```

- **Tipo de Mídia**: Escolha entre:
  - **Apenas Texto**: Sem mídia adicional
  - **Imagem**: URL de uma imagem
  - **PDF**: URL de um arquivo PDF
  - **URL/Link**: Link externo
  - **Vídeo**: URL do YouTube ou vídeo direto

- **URL da Mídia**: Conforme o tipo escolhido
- **Legenda/Descrição da Mídia**: Texto que aparece abaixo da mídia

- **Notas do Professor**: Anotações privadas (não aparecem na apresentação)

### 5. Organizando os Slides

- Use os botões **↑** (Seta para cima) e **↓** (Seta para baixo) para reordenar
- Os slides são exibidos na ordem configurada
- Edite slides existentes com o botão **✏️**
- Exclua slides com o botão **🗑️**

### 6. Visualizando a Aula

1. No gerenciador de slides, clique em **"Visualizar Aula"**
2. Ou acesse diretamente: `/aula/[id-do-conteudo]`
3. Navegue com:
   - Botões "Anterior" e "Avançar"
   - Setas do teclado (← →)

## 🎨 Estilização com HTML

### Classes CSS Disponíveis

#### Caixa de Destaque
```html
<div class="highlight-box">
  <p><strong>Atenção:</strong> Informação importante aqui.</p>
</div>
```
Resultado: Caixa com fundo vermelho claro e borda esquerda vermelha.

#### Card Informativo
```html
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Título do Card</h5>
    <p class="card-text">Conteúdo do card aqui.</p>
  </div>
</div>
```

#### Formatação de Texto
```html
<p class="fs-5">Texto grande</p>
<p class="text-muted">Texto esmaecido</p>
<p class="text-center">Texto centralizado</p>
<strong>Texto em negrito e vermelho (automático)</strong>
```

### Exemplo de Slide Completo

```html
<p class="mt-4 fs-5">Bem-vindos ao fascinante mundo da Segurança da Informação!</p>

<p>Vivemos em uma era onde a informação é um dos ativos mais valiosos. 
Proteger essa informação não é mais uma opção, mas uma necessidade.</p>

<div class="highlight-box">
  <p class="fs-5"><strong>Confidencialidade</strong> é a propriedade de que a 
  informação não esteja disponível ou seja revelada a indivíduos não autorizados.</p>
  <p class="text-end">- ABNT NBR ISO/IEC 27001:2013</p>
</div>

<ul>
  <li>Garantir que apenas pessoas autorizadas acessem a informação</li>
  <li>Impedir vazamentos e acessos não autorizados</li>
  <li>Segmentação de informações</li>
</ul>
```

## 📊 Tipos de Mídia

### Imagem
- Cole a URL da imagem no campo "URL da Mídia"
- Adicione uma legenda (opcional)
- A imagem será exibida centralizada e responsiva

### PDF
- Cole a URL do PDF
- Um botão "Abrir PDF" será exibido
- O PDF abre em nova aba

### URL/Link
- Cole qualquer URL
- Um botão "Acessar Link" será exibido
- Abre em nova aba

### Vídeo
**YouTube:**
- Cole a URL completa: `https://youtube.com/watch?v=ID_DO_VIDEO`
- Será incorporado automaticamente

**Vídeo Direto:**
- Cole a URL do arquivo de vídeo (.mp4, .webm, etc.)
- Player de vídeo será exibido

## 🎓 Exemplo de Estrutura de Aula

1. **Slide 1**: Introdução
   - Título da aula
   - Professor e instituição
   - Objetivos

2. **Slide 2**: Objetivos da Aula
   - Lista de objetivos de aprendizagem

3. **Slides 3-10**: Conteúdo Principal
   - Conceitos, exemplos, estudos de caso
   - Intercale texto, imagens e vídeos

4. **Slide 11**: Quiz/Exercícios
   - Pode usar HTML para criar questões simples

5. **Slide 12**: Conclusão e Resumo
   - Recapitulação dos pontos principais

6. **Slide 13**: Referências e Próximos Passos

## 💡 Dicas e Melhores Práticas

### Design de Slides

1. **Título Descritivo**: Use títulos que resumam o conteúdo do slide
2. **Ícones**: Ajudam na identificação visual rápida
3. **Conteúdo Conciso**: Evite muito texto em um único slide
4. **Destaque**: Use `highlight-box` para informações-chave
5. **Duração**: Estime 2-5 minutos por slide de conteúdo denso

### Organização

1. **Ordem Lógica**: Organize slides em sequência pedagógica
2. **Quebra de Ritmo**: Alterne entre slides de teoria e prática
3. **Mídias**: Use imagens/vídeos para reforçar conceitos
4. **Notas do Professor**: Anote dicas de apresentação

### Conteúdo HTML

1. **Teste Sempre**: Visualize após criar cada slide
2. **HTML Seguro**: Evite JavaScript inline
3. **Responsividade**: O layout se adapta automaticamente
4. **Navegação**: Teclado (← →) facilita a apresentação

## 🔧 Troubleshooting

### Slide não aparece
- Verifique se `ativo = true` no banco
- Confirme a ordem do slide
- Recarregue a página

### Imagem não carrega
- Verifique se a URL é válida e pública
- Teste a URL em nova aba do navegador
- Algumas imagens podem ter CORS bloqueado

### Vídeo do YouTube não exibe
- Use a URL completa: `https://youtube.com/watch?v=ID`
- Não use URL encurtada (youtu.be)
- Verifique se o vídeo é público

### Políticas RLS
- Execute o script `add-slides-table.sql` completamente
- Verifique no Supabase: Authentication → Policies
- Deve haver políticas para INSERT, UPDATE, DELETE, SELECT

## 📁 Arquivos Principais

- `database/add-slides-table.sql` - Script de criação da tabela
- `app/professor/conteudo/[id]/slides/page.tsx` - Gerenciador de slides
- `app/aula/[id]/page.tsx` - Visualização da apresentação
- `app/professor/page.tsx` - Lista de conteúdos (com botão de gerenciar slides)

## 🚀 Futuras Melhorias

- Quiz interativo com pontuação
- Exportação para PDF
- Slides com animações
- Compartilhamento público de aulas
- Comentários e anotações de estudantes
- Analytics de visualização

---

**Criado por:** Sistema Syllab  
**Versão:** 1.0  
**Data:** Fevereiro 2026
