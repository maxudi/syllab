-- ========================================
-- EXEMPLOS: Como usar os temas de cores
-- ========================================

-- 1. Primeiro execute o script add-tema-cores.sql para adicionar o campo

-- 2. Temas disponíveis:
--    - 'vermelho' (padrão) - Tom vermelho/bordô tradicional
--    - 'azul' - Azul marinho profissional
--    - 'verde' - Verde escuro natural
--    - 'roxo' - Roxo elegante
--    - 'vinho' - Tom vinho sofisticado
--    - 'cinza' - Cinza escuro moderno

-- ========================================
-- EXEMPLOS DE USO
-- ========================================

-- Atualizar um conteúdo específico para azul marinho
UPDATE syllab_conteudos 
SET cor_tema = 'azul' 
WHERE id = 'SEU-ID-AQUI';

-- Atualizar todos os conteúdos de uma disciplina para roxo
UPDATE syllab_conteudos 
SET cor_tema = 'roxo' 
WHERE disciplina_id = 'SEU-ID-DA-DISCIPLINA';

-- Atualizar apenas as aulas da jornada para verde
UPDATE syllab_conteudos 
SET cor_tema = 'verde' 
WHERE tipo = 'jornada_aula';

-- Atualizar apenas os avaliativos para vinho
UPDATE syllab_conteudos 
SET cor_tema = 'vinho' 
WHERE tipo = 'avaliativo';

-- ========================================
-- TESTAR TODAS AS CORES
-- ========================================

-- Selecionar alguns conteúdos para ver seus IDs
SELECT 
  id, 
  titulo, 
  tipo,
  cor_tema,
  disciplina_id
FROM syllab_conteudos 
ORDER BY created_at DESC 
LIMIT 10;

-- Exemplos práticos (ajuste os IDs):

-- Aula 1 - Azul Marinho (profissional, sério)
-- UPDATE syllab_conteudos SET cor_tema = 'azul' WHERE titulo ILIKE '%aula 1%';

-- Aula 2 - Verde Escuro (crescimento, natureza)
-- UPDATE syllab_conteudos SET cor_tema = 'verde' WHERE titulo ILIKE '%aula 2%';

-- Aula 3 - Roxo (criatividade, luxo)
-- UPDATE syllab_conteudos SET cor_tema = 'roxo' WHERE titulo ILIKE '%aula 3%';

-- Avaliações - Vinho (importante, formal)
-- UPDATE syllab_conteudos SET cor_tema = 'vinho' WHERE tipo = 'avaliativo';

-- Conteúdos técnicos - Cinza (moderno, tech)
-- UPDATE syllab_conteudos SET cor_tema = 'cinza' WHERE titulo ILIKE '%técnic%';

-- ========================================
-- RESETAR PARA VERMELHO (padrão)
-- ========================================

-- Resetar todos os conteúdos para vermelho
-- UPDATE syllab_conteudos SET cor_tema = 'vermelho';

-- ========================================
-- VERIFICAR DISTRIBUIÇÃO DE CORES
-- ========================================

-- Ver quantos conteúdos usam cada cor
SELECT 
  COALESCE(cor_tema, 'vermelho') as tema,
  COUNT(*) as quantidade,
  STRING_AGG(tipo, ', ') as tipos
FROM syllab_conteudos 
WHERE ativo = true
GROUP BY cor_tema
ORDER BY quantidade DESC;

-- Ver distribuição por disciplina
SELECT 
  d.nome as disciplina,
  c.cor_tema,
  COUNT(*) as qtd_conteudos
FROM syllab_conteudos c
JOIN syllab_disciplinas d ON c.disciplina_id = d.id
WHERE c.ativo = true
GROUP BY d.nome, c.cor_tema
ORDER BY d.nome, c.cor_tema;

-- ========================================
-- BOAS PRÁTICAS
-- ========================================

/*
SUGESTÕES DE USO:

1. AZUL - Conteúdos introdutórios, fundamentos, teoria
2. VERDE - Práticas, exercícios, labs, desenvolvimento
3. ROXO - Conceitos avançados, tópicos especiais
4. VINHO - Avaliações, provas, trabalhos importantes
5. CINZA - Conteúdos técnicos, programação, sistemas
6. VERMELHO - Avisos importantes, deadlines, alertas

CONSISTÊNCIA:
- Use a mesma cor para conteúdos relacionados
- Agrupe por tema ou nível de dificuldade
- Considere a psicologia das cores para o público-alvo
*/
