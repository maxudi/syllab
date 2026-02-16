-- ========================================
-- Adicionar campo de tema de cores aos conteúdos
-- ========================================

-- Adicionar campo cor_tema à tabela de conteúdos
ALTER TABLE syllab_conteudos 
ADD COLUMN IF NOT EXISTS cor_tema VARCHAR(20) DEFAULT 'vermelho';

-- Comentário explicativo
COMMENT ON COLUMN syllab_conteudos.cor_tema IS 'Tema de cor para apresentação dos slides (vermelho, azul, verde, roxo, vinho, cinza)';

-- Verificar o campo adicionado
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'syllab_conteudos' 
  AND column_name = 'cor_tema';

-- Mensagem de sucesso
DO $$ 
BEGIN
  RAISE NOTICE '✅ Campo cor_tema adicionado com sucesso!';
  RAISE NOTICE '   Temas disponíveis: vermelho (padrão), azul, verde, roxo, vinho, cinza';
END $$;
