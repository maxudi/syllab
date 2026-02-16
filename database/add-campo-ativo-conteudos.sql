-- =====================================================
-- ADICIONAR CAMPO "ATIVO" EM CONTEÚDOS
-- =====================================================
-- Este script adiciona o campo booleano "ativo" na tabela
-- syllab_conteudos para que o professor possa controlar
-- quais conteúdos são visíveis para os alunos.
-- =====================================================

-- Adicionar campo ativo (default TRUE para não quebrar conteúdos existentes)
ALTER TABLE syllab_conteudos
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE NOT NULL;

COMMENT ON COLUMN syllab_conteudos.ativo IS 'Define se o conteúdo está visível para os alunos';

-- Atualizar todos os conteúdos existentes para ativo = true
UPDATE syllab_conteudos
SET ativo = TRUE
WHERE ativo IS NULL;

-- Verificação
SELECT 
  COUNT(*) AS total_conteudos,
  SUM(CASE WHEN ativo THEN 1 ELSE 0 END) AS ativos,
  SUM(CASE WHEN NOT ativo THEN 1 ELSE 0 END) AS inativos
FROM syllab_conteudos;

-- Exemplo de uso:
-- 1. Desativar um conteúdo específico
-- UPDATE syllab_conteudos SET ativo = FALSE WHERE id = 'uuid-aqui';

-- 2. Ativar todos os conteúdos de uma disciplina
-- UPDATE syllab_conteudos SET ativo = TRUE WHERE disciplina_id = 'uuid-disciplina';

-- 3. Ver conteúdos inativos
-- SELECT * FROM syllab_conteudos WHERE ativo = FALSE;
