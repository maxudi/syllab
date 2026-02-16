-- Adicionar campos de cidade e UF às instituições
-- Execute este script no SQL Editor do Supabase

-- Adicionar campos cidade e uf
ALTER TABLE syllab_instituicoes 
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);

ALTER TABLE syllab_instituicoes 
ADD COLUMN IF NOT EXISTS uf CHAR(2);

-- Comentários para documentação
COMMENT ON COLUMN syllab_instituicoes.cidade IS 'Cidade da instituição';
COMMENT ON COLUMN syllab_instituicoes.uf IS 'Unidade Federativa (UF) da instituição';

-- Verificar se os campos foram adicionados
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'syllab_instituicoes' 
  AND column_name IN ('cidade', 'uf')
ORDER BY column_name;

-- Exemplo de como atualizar os dados:
/*
UPDATE syllab_instituicoes 
SET cidade = 'São Paulo', uf = 'SP' 
WHERE id = 'ID_DA_INSTITUICAO';

UPDATE syllab_instituicoes 
SET cidade = 'Rio de Janeiro', uf = 'RJ' 
WHERE id = 'ID_DA_INSTITUICAO';
*/
