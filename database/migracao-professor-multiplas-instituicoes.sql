-- Migração: Professor pode lecionar em múltiplas instituições
-- Este script cria um relacionamento N:N entre professores e instituições
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. CRIAR TABELA DE RELACIONAMENTO N:N
-- ========================================

CREATE TABLE IF NOT EXISTS syllab_professor_instituicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_id UUID NOT NULL REFERENCES syllab_professores(id) ON DELETE CASCADE,
  instituicao_id UUID NOT NULL REFERENCES syllab_instituicoes(id) ON DELETE CASCADE,
  cargo VARCHAR(100), -- Ex: "Professor Titular", "Professor Adjunto", etc.
  data_inicio DATE DEFAULT NOW(),
  data_fim DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(professor_id, instituicao_id) -- Evita duplicação
);

-- Índices para melhor performance
CREATE INDEX idx_prof_inst_professor ON syllab_professor_instituicoes(professor_id);
CREATE INDEX idx_prof_inst_instituicao ON syllab_professor_instituicoes(instituicao_id);
CREATE INDEX idx_prof_inst_ativo ON syllab_professor_instituicoes(ativo);

-- Trigger para updated_at
CREATE TRIGGER update_syllab_professor_instituicoes_updated_at 
BEFORE UPDATE ON syllab_professor_instituicoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 2. MIGRAR DADOS EXISTENTES
-- ========================================

-- Migrar professores que já têm instituicao_id definido
INSERT INTO syllab_professor_instituicoes (professor_id, instituicao_id, ativo)
SELECT id, instituicao_id, ativo
FROM syllab_professores
WHERE instituicao_id IS NOT NULL
ON CONFLICT (professor_id, instituicao_id) DO NOTHING;

-- ========================================
-- 3. TORNAR instituicao_id NULLABLE
-- ========================================

-- Não vamos remover o campo para não quebrar dados antigos,
-- mas ele não será mais usado nas novas implementações
ALTER TABLE syllab_professores 
ALTER COLUMN instituicao_id DROP NOT NULL;

-- ========================================
-- 4. CRIAR VIEW PARA FACILITAR CONSULTAS
-- ========================================

-- View que lista professores com suas instituições
CREATE OR REPLACE VIEW v_professores_instituicoes AS
SELECT 
  p.id as professor_id,
  p.nome as professor_nome,
  p.email as professor_email,
  p.user_id,
  p.ativo as professor_ativo,
  pi.id as vinculo_id,
  pi.instituicao_id,
  i.nome as instituicao_nome,
  i.sigla as instituicao_sigla,
  pi.cargo,
  pi.data_inicio,
  pi.data_fim,
  pi.ativo as vinculo_ativo
FROM syllab_professores p
LEFT JOIN syllab_professor_instituicoes pi ON p.id = pi.professor_id AND pi.ativo = true
LEFT JOIN syllab_instituicoes i ON pi.instituicao_id = i.id AND i.ativo = true
WHERE p.ativo = true;

-- ========================================
-- 5. POLÍTICAS RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE syllab_professor_instituicoes ENABLE ROW LEVEL SECURITY;

-- SELECT (leitura) - Todos autenticados
CREATE POLICY "Permitir SELECT professor_instituicoes"
ON syllab_professor_instituicoes
FOR SELECT
USING (true);

-- INSERT (criação) - Desenvolvimento
CREATE POLICY "Permitir INSERT professor_instituicoes - DESENVOLVIMENTO"
ON syllab_professor_instituicoes
FOR INSERT
WITH CHECK (true);

-- UPDATE (atualização) - Desenvolvimento
CREATE POLICY "Permitir UPDATE professor_instituicoes - DESENVOLVIMENTO"
ON syllab_professor_instituicoes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- DELETE (exclusão) - Desenvolvimento
CREATE POLICY "Permitir DELETE professor_instituicoes - DESENVOLVIMENTO"
ON syllab_professor_instituicoes
FOR DELETE
USING (true);

-- ========================================
-- 6. FUNÇÃO HELPER: Vincular Professor a Instituição
-- ========================================

CREATE OR REPLACE FUNCTION vincular_professor_instituicao(
  p_professor_id UUID,
  p_instituicao_id UUID,
  p_cargo VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_vinculo_id UUID;
BEGIN
  -- Inserir ou retornar vínculo existente
  INSERT INTO syllab_professor_instituicoes (professor_id, instituicao_id, cargo, ativo)
  VALUES (p_professor_id, p_instituicao_id, p_cargo, true)
  ON CONFLICT (professor_id, instituicao_id) 
  DO UPDATE SET ativo = true, cargo = COALESCE(p_cargo, syllab_professor_instituicoes.cargo)
  RETURNING id INTO v_vinculo_id;
  
  RETURN v_vinculo_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. FUNÇÃO HELPER: Desvincular Professor de Instituição
-- ========================================

CREATE OR REPLACE FUNCTION desvincular_professor_instituicao(
  p_professor_id UUID,
  p_instituicao_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE syllab_professor_instituicoes
  SET ativo = false, data_fim = NOW()
  WHERE professor_id = p_professor_id 
    AND instituicao_id = p_instituicao_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VERIFICAÇÃO
-- ========================================

-- Verificar estrutura
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'syllab_professor_instituicoes'
ORDER BY ordinal_position;

-- Verificar vínculos migrados
SELECT 
  p.nome as professor,
  i.nome as instituicao,
  pi.cargo,
  pi.ativo
FROM syllab_professor_instituicoes pi
JOIN syllab_professores p ON pi.professor_id = p.id
JOIN syllab_instituicoes i ON pi.instituicao_id = i.id;

-- Verificar políticas RLS
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename = 'syllab_professor_instituicoes'
ORDER BY policyname;

-- Testar view
SELECT * FROM v_professores_instituicoes LIMIT 5;
