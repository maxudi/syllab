# 🎨 Guia Rápido: Como Escolher o Tema de Cores

## 📍 Onde Escolher o Tema

### Passo 1: Acesse suas disciplinas
```
http://localhost:3000/professor/disciplinas
```

### Passo 2: Clique em "Gerenciar Conteúdos"
Cada card de disciplina agora tem um botão azul **"Gerenciar Conteúdos"**.

### Passo 3: Crie ou Edite um Conteúdo
- Clique em **"Novo Conteúdo"** para criar
- Ou clique no ícone de **lápis (Edit)** para editar um existente

### Passo 4: Escolha o Tema
No formulário, você verá a seção **"Tema de Cores da Apresentação"** com 6 opções:

| Tema | Visual | Melhor Para |
|------|--------|-------------|
| 🔴 **Vermelho** | Preview Vermelho/Bordô | Padrão, impacto, avisos |
| 🔵 **Azul Marinho** | Preview Azul Escuro | Profissional, sério |
| 🟢 **Verde Escuro** | Preview Verde Floresta | Crescimento, prática |
| 🟣 **Roxo** | Preview Roxo Profundo | Criativo, avançado |
| 🍷 **Vinho** | Preview Rosa Escuro | Elegante, avaliações |
| ⚫ **Cinza Escuro** | Preview Cinza Tech | Moderno, técnico |

### Passo 5: Salve
Clique em **"Criar Conteúdo"** ou **"Atualizar Conteúdo"**.

### Passo 6: Veja o Resultado
- A cor aparece imediatamente na listagem (borda e fundo do card)
- Ao abrir a apresentação (slides), todo o tema visual estará aplicado

## 🎯 Recursos da Página de Conteúdos

### Visualização
- **Cards coloridos**: Cada conteúdo mostra preview da cor escolhida
- **Organização por tipo**: Jornada de Aulas / Avaliativos / Documentos separados
- **Ordem visual**: Números de ordem aparecem destacados

### Ações Disponíveis
- ✅ Criar novo conteúdo
- ✅ Editar (inclusive mudar o tema)
- ✅ Excluir (desativa, não apaga)
- ✅ Acessar slides (botão "Slides")
- ✅ Ver/baixar arquivos anexos

### Campos do Formulário
1. **Título** * (obrigatório) - Ex: "AULA 01 - Introdução"
2. **Tipo** * - Jornada de Aula / Avaliativo / Documento Geral
3. **Descrição** - Texto livre sobre o conteúdo
4. **Ordem** - Número sequencial (automático se vazio)
5. **Data Limite** - Para avaliativos com prazo
6. **URL do Arquivo** - Link externo para download
7. **Tema de Cores** - Escolha visual entre 6 opções

## 🔄 Fluxo Completo

```
Professor → Disciplinas → [Escolhe disciplina] → Gerenciar Conteúdos
    ↓
Novo Conteúdo → Preenche formulário → Escolhe COR 🎨 → Salva
    ↓
Gerenciar Slides → Adiciona slides → Volta para Conteúdos
    ↓
Aluno vê apresentação com o tema de cores escolhido! ✨
```

## 🎨 Onde a Cor Aparece

### Na Listagem de Conteúdos (Professor)
- Borda esquerda do card (6px)
- Fundo do card (tom claro)
- Número da ordem (badge colorido)
- Título (cor escura do tema)

### Na Apresentação (Aluno)
- **Cabeçalho**: Gradiente do tema
- **Títulos dos slides**: Cor e borda inferior
- **Botões**: Fundo e hover
- **Destaques**: Caixas com fundo e borda lateral

## 💡 Dicas de Uso

### Consistência
- Use a **mesma cor** para conteúdos relacionados
- Agrupe temas por cor para criar identidade visual

### Por Disciplina
```sql
-- Todas as aulas de Matemática em azul
Matemática → Sempre escolher AZUL

-- Todas as aulas de Artes em roxo
Artes → Sempre escolher ROXO
```

### Por Dificuldade
- **Verde**: Iniciante
- **Azul**: Intermediário  
- **Roxo**: Avançado
- **Vinho**: Avaliações

### Por Urgência
- **Vermelho**: Prazo próximo, importante
- **Cinza**: Material complementar
- **Azul**: Regular

## 🐛 Resolução de Problemas

### Não vejo o seletor de cores?
1. Execute o script SQL: `database/add-tema-cores.sql`
2. Limpe o cache: `Ctrl+Shift+R` no navegador

### As cores não aparecem na apresentação?
1. Verifique se o campo foi salvo: SQL Editor → `SELECT cor_tema FROM syllab_conteudos`
2. Recarregue a página da apresentação

### Quero adicionar mais cores?
Edite os arquivos:
- `app/aula/[id]/page.tsx` → Objeto TEMAS_CORES
- `components/color-theme-selector.tsx` → Mesma estrutura

## 📊 Status Atual

✅ Sistema implementado e funcionando
✅ 6 temas de cores disponíveis
✅ Interface visual para seleção
✅ Preview em tempo real
✅ Aplicação automática nos slides
✅ Totalmente integrado ao fluxo existente

## 🚀 Próximos Passos

1. Acesse `/professor/disciplinas`
2. Clique em "Gerenciar Conteúdos"
3. Crie um conteúdo com tema AZUL
4. Adicione alguns slides
5. Veja a apresentação com o novo tema! 🎉
