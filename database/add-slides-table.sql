-- Adicionar tabela de Slides para Conteúdos
-- Execute este script no SQL Editor do Supabase

-- Tabela de Slides
-- tipo_midia: 'texto', 'imagem', 'pdf', 'url', 'video'
CREATE TABLE IF NOT EXISTS syllab_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conteudo_id UUID REFERENCES syllab_conteudos(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 0,
  titulo VARCHAR(255) NOT NULL,
  conteudo_html TEXT,
  tipo_midia VARCHAR(50) CHECK (tipo_midia IN ('texto', 'imagem', 'pdf', 'url', 'video')),
  midia_url TEXT,
  midia_legenda TEXT,
  icone VARCHAR(100), -- Ex: 'bi-shield-lock-fill' para ícones Bootstrap Icons
  notas_professor TEXT, -- Notas privadas do professor sobre o slide
  duracao_estimada INTEGER, -- Duração estimada em minutos
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_slides_conteudo ON syllab_slides(conteudo_id);
CREATE INDEX IF NOT EXISTS idx_slides_ordem ON syllab_slides(ordem);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_syllab_slides_updated_at ON syllab_slides;
CREATE TRIGGER update_syllab_slides_updated_at BEFORE UPDATE ON syllab_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Adicionar campo ao conteúdo para indicar se tem slides
ALTER TABLE syllab_conteudos ADD COLUMN IF NOT EXISTS tem_slides BOOLEAN DEFAULT false;

-- ========================================
-- POLÍTICAS RLS PARA SLIDES
-- ========================================

-- Habilitar RLS
ALTER TABLE syllab_slides ENABLE ROW LEVEL SECURITY;

-- SELECT (leitura) - Permitir todos usuários autenticados
DROP POLICY IF EXISTS "Permitir SELECT slides" ON syllab_slides;
CREATE POLICY "Permitir SELECT slides"
ON syllab_slides
FOR SELECT
USING (true);

-- INSERT (criação) - Desenvolvimento
DROP POLICY IF EXISTS "Permitir INSERT slides - DESENVOLVIMENTO" ON syllab_slides;
CREATE POLICY "Permitir INSERT slides - DESENVOLVIMENTO"
ON syllab_slides
FOR INSERT
WITH CHECK (true);

-- UPDATE (atualização) - Desenvolvimento
DROP POLICY IF EXISTS "Permitir UPDATE slides - DESENVOLVIMENTO" ON syllab_slides;
CREATE POLICY "Permitir UPDATE slides - DESENVOLVIMENTO"
ON syllab_slides
FOR UPDATE
USING (true)
WITH CHECK (true);

-- DELETE (exclusão) - Desenvolvimento
DROP POLICY IF EXISTS "Permitir DELETE slides - DESENVOLVIMENTO" ON syllab_slides;
CREATE POLICY "Permitir DELETE slides - DESENVOLVIMENTO"
ON syllab_slides
FOR DELETE
USING (true);

-- ========================================
-- VERIFICAÇÃO
-- ========================================

-- Verificar se a tabela foi criada
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'syllab_slides'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'syllab_slides'
ORDER BY policyname;
