-- Migração: Módulo de Administração
-- Adiciona campos foto_url e token_ia aos professores
-- Cria tabela de administradores
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. ADICIONAR CAMPOS À TABELA DE PROFESSORES
-- ========================================

-- Adicionar campos que podem estar faltando
ALTER TABLE syllab_professores 
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);

ALTER TABLE syllab_professores 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);

ALTER TABLE syllab_professores 
ADD COLUMN IF NOT EXISTS foto_url TEXT;

ALTER TABLE syllab_professores 
ADD COLUMN IF NOT EXISTS token_ia TEXT;

-- Comentários para documentação
COMMENT ON COLUMN syllab_professores.telefone IS 'Telefone do professor';
COMMENT ON COLUMN syllab_professores.cpf IS 'CPF do professor';
COMMENT ON COLUMN syllab_professores.foto_url IS 'URL da foto do professor (Supabase Storage ou externa)';
COMMENT ON COLUMN syllab_professores.token_ia IS 'Token de API para serviços de IA (OpenAI, Claude, etc)';

-- Adicionar campo CNPJ à tabela de instituições se não existir
ALTER TABLE syllab_instituicoes 
ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18);

-- Adicionar campo logo à tabela de instituições
ALTER TABLE syllab_instituicoes 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN syllab_instituicoes.cnpj IS 'CNPJ da instituição';
COMMENT ON COLUMN syllab_instituicoes.logo_url IS 'URL do logo da instituição';

-- Adicionar campo documentos_gerais à tabela de disciplinas
ALTER TABLE syllab_disciplinas 
ADD COLUMN IF NOT EXISTS documentos_gerais TEXT;

COMMENT ON COLUMN syllab_disciplinas.documentos_gerais IS 'URL ou link para documentos gerais da disciplina';

-- ========================================
-- 2. CRIAR TABELA DE ADMINISTRADORES
-- ========================================

CREATE TABLE IF NOT EXISTS syllab_administradores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  foto_url TEXT,
  super_admin BOOLEAN DEFAULT false, -- Super admin tem poderes irrestritos
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_user_id ON syllab_administradores(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_email ON syllab_administradores(email);
CREATE INDEX IF NOT EXISTS idx_admin_ativo ON syllab_administradores(ativo);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_syllab_administradores_updated_at ON syllab_administradores;
CREATE TRIGGER update_syllab_administradores_updated_at 
BEFORE UPDATE ON syllab_administradores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 3. HABILITAR RLS
-- ========================================

ALTER TABLE syllab_administradores ENABLE ROW LEVEL SECURITY;

-- SELECT - Todos autenticados podem ver admins
DROP POLICY IF EXISTS "Permitir SELECT administradores" ON syllab_administradores;
CREATE POLICY "Permitir SELECT administradores"
ON syllab_administradores
FOR SELECT
USING (true);

-- INSERT - Desenvolvimento (depois restringir a super_admin)
DROP POLICY IF EXISTS "Permitir INSERT administradores - DESENVOLVIMENTO" ON syllab_administradores;
CREATE POLICY "Permitir INSERT administradores - DESENVOLVIMENTO"
ON syllab_administradores
FOR INSERT
WITH CHECK (true);

-- UPDATE - Desenvolvimento
DROP POLICY IF EXISTS "Permitir UPDATE administradores - DESENVOLVIMENTO" ON syllab_administradores;
CREATE POLICY "Permitir UPDATE administradores - DESENVOLVIMENTO"
ON syllab_administradores
FOR UPDATE
USING (true)
WITH CHECK (true);

-- DELETE - Desenvolvimento
DROP POLICY IF EXISTS "Permitir DELETE administradores - DESENVOLVIMENTO" ON syllab_administradores;
CREATE POLICY "Permitir DELETE administradores - DESENVOLVIMENTO"
ON syllab_administradores
FOR DELETE
USING (true);

-- ========================================
-- 4. FUNÇÃO HELPER: Verificar se usuário é admin
-- ========================================

CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM syllab_administradores 
    WHERE user_id = p_user_id 
      AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. FUNÇÃO HELPER: Verificar se usuário é super admin
-- ========================================

CREATE OR REPLACE FUNCTION is_super_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM syllab_administradores 
    WHERE user_id = p_user_id 
      AND ativo = true
      AND super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. VIEW: Professores com detalhes completos (para admin)
-- ========================================

CREATE OR REPLACE VIEW v_admin_professores AS
SELECT 
  p.id,
  p.user_id,
  p.nome,
  p.email,
  p.telefone,
  p.cpf,
  p.foto_url,
  p.token_ia,
  p.ativo,
  p.created_at,
  p.updated_at,
  -- Contar instituições vinculadas
  COUNT(DISTINCT pi.instituicao_id) as total_instituicoes,
  -- Listar nomes das instituições
  STRING_AGG(DISTINCT i.nome, ', ' ORDER BY i.nome) as instituicoes,
  -- Contar disciplinas
  COUNT(DISTINCT d.id) as total_disciplinas
FROM syllab_professores p
LEFT JOIN syllab_professor_instituicoes pi ON p.id = pi.professor_id AND pi.ativo = true
LEFT JOIN syllab_instituicoes i ON pi.instituicao_id = i.id AND i.ativo = true
LEFT JOIN syllab_disciplinas d ON p.id = d.professor_id AND d.ativo = true
GROUP BY p.id, p.user_id, p.nome, p.email, p.telefone, p.cpf, p.foto_url, p.token_ia, p.ativo, p.created_at, p.updated_at;

-- ========================================
-- 7. VIEW: Instituições disponíveis para um professor
-- ========================================

CREATE OR REPLACE VIEW v_professor_instituicoes_disponiveis AS
SELECT 
  p.id as professor_id,
  i.id as instituicao_id,
  i.nome,
  i.sigla,
  i.cnpj,
  CASE 
    WHEN pi.id IS NOT NULL THEN true 
    ELSE false 
  END as vinculado
FROM syllab_professores p
CROSS JOIN syllab_instituicoes i
LEFT JOIN syllab_professor_instituicoes pi 
  ON p.id = pi.professor_id 
  AND i.id = pi.instituicao_id 
  AND pi.ativo = true
WHERE p.ativo = true AND i.ativo = true;

-- ========================================
-- 8. CRIAR PRIMEIRO SUPER ADMIN
-- ========================================

-- IMPORTANTE: Substitua o email abaixo pelo seu email usado no cadastro
-- Após executar, você poderá fazer login e será reconhecido como admin

-- Exemplo de como criar o primeiro admin:
-- Descomente e ajuste o email:
/*
INSERT INTO syllab_administradores (user_id, nome, email, super_admin, ativo)
SELECT 
  id as user_id,
  COALESCE(raw_user_meta_data->>'name', email) as nome,
  email,
  true as super_admin,
  true as ativo
FROM auth.users
WHERE email = 'seu-email@exemplo.com' -- ⚠️ SUBSTITUA AQUI
ON CONFLICT (user_id) DO NOTHING;
*/

-- ========================================
-- VERIFICAÇÕES
-- ========================================

-- Verificar campos adicionados
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'syllab_professores' 
  AND column_name IN ('foto_url', 'token_ia');

-- Verificar estrutura de administradores
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'syllab_administradores'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  tablename, 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename = 'syllab_administradores'
ORDER BY policyname;

-- Testar views
SELECT * FROM v_admin_professores LIMIT 5;
SELECT * FROM v_professor_instituicoes_disponiveis LIMIT 5;

-- Verificar administradores
SELECT id, nome, email, super_admin, ativo FROM syllab_administradores;
