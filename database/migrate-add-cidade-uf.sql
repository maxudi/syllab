-- ================================================
-- MIGRAÇÃO: Adicionar campos cidade e UF às instituições
-- Execute este script no SQL Editor do Supabase
-- ================================================

-- Adicionar campos cidade e uf (se não existirem)
DO $$ 
BEGIN
  -- Adicionar campo cidade
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'syllab_instituicoes' AND column_name = 'cidade'
  ) THEN
    ALTER TABLE syllab_instituicoes ADD COLUMN cidade VARCHAR(100);
    RAISE NOTICE 'Campo cidade adicionado com sucesso';
  ELSE
    RAISE NOTICE 'Campo cidade já existe';
  END IF;

  -- Adicionar campo uf
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'syllab_instituicoes' AND column_name = 'uf'
  ) THEN
    ALTER TABLE syllab_instituicoes ADD COLUMN uf CHAR(2);
    RAISE NOTICE 'Campo uf adicionado com sucesso';
  ELSE
    RAISE NOTICE 'Campo uf já existe';
  END IF;
END $$;

-- Comentários para documentação
COMMENT ON COLUMN syllab_instituicoes.cidade IS 'Cidade da instituição';
COMMENT ON COLUMN syllab_instituicoes.uf IS 'Unidade Federativa (UF) da instituição';

-- Verificar estrutura final
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'syllab_instituicoes' 
ORDER BY ordinal_position;

-- Mensagem de sucesso
SELECT 'Migração concluída!' as status;
