-- Adicionar campos para controle de acesso às disciplinas
-- Data: 2026-02-16

-- 1. Adicionar coluna 'publica' (boolean) - indica se a disciplina é pública ou privada
ALTER TABLE syllab_disciplinas 
ADD COLUMN IF NOT EXISTS publica BOOLEAN DEFAULT true;

-- 2. Adicionar coluna 'codigo_acesso' (string) - código único para acesso a disciplinas privadas
ALTER TABLE syllab_disciplinas 
ADD COLUMN IF NOT EXISTS codigo_acesso VARCHAR(20) DEFAULT NULL;

-- 3. Criar índice para busca rápida por código de acesso
CREATE INDEX IF NOT EXISTS idx_disciplinas_codigo_acesso 
ON syllab_disciplinas(codigo_acesso) 
WHERE codigo_acesso IS NOT NULL;

-- 4. Comentários nas colunas
COMMENT ON COLUMN syllab_disciplinas.publica IS 
'Indica se a disciplina é pública (true) ou privada (false). Disciplinas privadas requerem código de acesso.';

COMMENT ON COLUMN syllab_disciplinas.codigo_acesso IS 
'Código único de acesso para disciplinas privadas. Gerado automaticamente quando publica = false.';

-- 5. Atualizar disciplinas existentes para serem públicas por padrão
UPDATE syllab_disciplinas 
SET publica = true 
WHERE publica IS NULL;

-- Nota: Não é necessário criar políticas RLS adicionais pois:
-- - Professores já podem ver/editar suas próprias disciplinas
-- - Alunos verão apenas disciplinas públicas ou aquelas para as quais têm o código
-- - A validação do código será feita na aplicação
