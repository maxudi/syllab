-- ================================================
-- MIGRAÇÃO: Adicionar campo STATUS em syllab_professores
-- Execute este script no SQL Editor do Supabase
-- ================================================

-- Adicionar coluna status se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'syllab_professores' AND column_name = 'status'
  ) THEN
    -- Adiciona a coluna com valor padrão 'pending'
    ALTER TABLE syllab_professores 
    ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    
    RAISE NOTICE 'Campo status adicionado com sucesso';
  ELSE
    RAISE NOTICE 'Campo status já existe';
  END IF;
END $$;

-- Comentário para documentação
COMMENT ON COLUMN syllab_professores.status IS 'Status de aprovação: approved, pending, rejected';

-- Atualizar professores existentes sem status para 'approved' (já que são antigos)
UPDATE syllab_professores 
SET status = 'approved' 
WHERE status IS NULL;

-- Verificar a estrutura
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'syllab_professores' 
  AND column_name = 'status';

-- Ver estatísticas
SELECT 
  status,
  COUNT(*) as total
FROM syllab_professores
GROUP BY status
ORDER BY status;

-- Mensagem de sucesso
SELECT '✅ Campo status adicionado/verificado na tabela syllab_professores!' as resultado;
