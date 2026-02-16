# Sistema de Temas de Cores para Slides

## 📋 Visão Geral

Sistema que permite personalizar as cores das apresentações de slides, oferecendo 6 temas de cores escuras elegantes e profissionais.

## 🎨 Temas Disponíveis

| Tema | Cores | Uso Sugerido |
|------|-------|--------------|
| **Vermelho** (padrão) | `#b71c1c` → `#d32f2f` | Clássico, impactante, avisos importantes |
| **Azul Marinho** | `#0d47a1` → `#1565c0` | Profissional, confiável, fundamentos |
| **Verde Escuro** | `#1b5e20` → `#2e7d32` | Crescimento, natureza, práticas |
| **Roxo** | `#4a148c` → `#6a1b9a` | Criativo, sofisticado, tópicos avançados |
| **Vinho** | `#880e4f` → `#ad1457` | Elegante, formal, avaliações |
| **Cinza Escuro** | `#263238` → `#37474f` | Moderno, tech, conteúdos técnicos |

## 🚀 Como Usar

### 1. Configurar o Banco de Dados

Execute o script SQL:
```bash
# No SQL Editor do Supabase, execute:
database/add-tema-cores.sql
```

### 2. Testar as Cores

Use os exemplos prontos:
```bash
# Veja exemplos práticos de UPDATE em:
database/exemplos-temas-cores.sql
```

Exemplo rápido:
```sql
-- Mudar uma aula específica para azul
UPDATE syllab_conteudos 
SET cor_tema = 'azul' 
WHERE id = 'seu-id-aqui';

-- Ver preview no navegador em:
-- http://localhost:3000/aula/[id]
```

### 3. Adicionar ao Formulário (Opcional)

Para adicionar seletor visual nos formulários de criação/edição:

```tsx
import { ColorThemeSelector } from '@/components/color-theme-selector'

// No seu componente:
const [formData, setFormData] = useState({
  titulo: '',
  cor_tema: 'vermelho', // valor padrão
})

// No JSX:
<ColorThemeSelector 
  value={formData.cor_tema}
  onChange={(cor) => setFormData({ ...formData, cor_tema: cor })}
/>

// Ao salvar:
await supabase.from('syllab_conteudos').insert({
  ...formData,
  cor_tema: formData.cor_tema // ← salva o tema
})
```

## 🎯 Onde as Cores Aparecem

O tema escolhido afeta:

1. **Cabeçalho da Apresentação** - Fundo com gradiente do tema
2. **Títulos dos Slides** - Cor e borda inferior
3. **Botões de Navegação** - Fundo e hover
4. **Caixas de Destaque** - Background e borda lateral

## 📊 Exemplos SQL Úteis

```sql
-- Ver distribuição de cores usadas
SELECT 
  cor_tema, 
  COUNT(*) as quantidade 
FROM syllab_conteudos 
GROUP BY cor_tema;

-- Aplicar cor por disciplina
UPDATE syllab_conteudos 
SET cor_tema = 'azul' 
WHERE disciplina_id = 'id-da-disciplina';

-- Aplicar cor por tipo
UPDATE syllab_conteudos 
SET cor_tema = 'vinho' 
WHERE tipo = 'avaliativo';

-- Resetar tudo para vermelho
UPDATE syllab_conteudos 
SET cor_tema = 'vermelho';
```

## 🖼️ Preview Visual

Cada tema tem:
- **Gradiente principal** - Usado no cabeçalho
- **Cor primária** - Títulos e textos principais
- **Cor secundária** - Botões e elementos secundários
- **Cor hover** - Estado hover dos botões
- **Highlight** - Fundo das caixas de destaque
- **Highlight border** - Borda das caixas de destaque

## 💡 Boas Práticas

1. **Consistência por Disciplina** - Use o mesmo tema para conteúdos relacionados
2. **Hierarquia Visual** - Use cores diferentes para níveis de dificuldade
3. **Psicologia das Cores**:
   - Azul: Confiança e profissionalismo
   - Verde: Crescimento e desenvolvimento
   - Roxo: Criatividade e inovação
   - Vinho: Formalidade e importância
   - Cinza: Modernidade e tecnologia
   - Vermelho: Urgência e atenção

## 🔧 Arquivos Modificados

### Backend
- `database/add-tema-cores.sql` - Adiciona campo cor_tema
- `database/exemplos-temas-cores.sql` - Exemplos de uso

### Frontend
- `app/aula/[id]/page.tsx` - Aplica tema dinamicamente
- `components/color-theme-selector.tsx` - Componente de seleção

## 📝 Notas Técnicas

- O valor padrão é `'vermelho'` se não especificado
- As cores são aplicadas via CSS-in-JS no componente
- O tema é carregado junto com os dados do conteúdo
- Funciona com SSR e CSR
- Performance otimizada (sem re-renderizações desnecessárias)

## 🐛 Troubleshooting

**Cores não aparecem?**
- Execute o script `add-tema-cores.sql`
- Verifique se o campo `cor_tema` existe: `\d syllab_conteudos`
- Confirme que o valor está salvo: `SELECT cor_tema FROM syllab_conteudos LIMIT 5;`

**Erro de tipo no TypeScript?**
- Limpe o cache: `rm -rf .next && npm run dev`
- Verifique a interface `Conteudo` em `app/aula/[id]/page.tsx`

## 🎓 Suporte

Para adicionar novos temas, edite:
1. `app/aula/[id]/page.tsx` - Objeto `TEMAS_CORES`
2. `components/color-theme-selector.tsx` - Mesma estrutura
