-- Fix para políticas RLS - Permitir operações em desenvolvimento
-- Execute este script no SQL Editor do Supabase

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir criar conteúdos em desenvolvimento" ON syllab_conteudos;
DROP POLICY IF EXISTS "Permitir atualizar conteúdos em desenvolvimento" ON syllab_conteudos;
DROP POLICY IF EXISTS "Permitir deletar conteúdos em desenvolvimento" ON syllab_conteudos;
DROP POLICY IF EXISTS "Permitir criar professores em desenvolvimento" ON syllab_professores;
DROP POLICY IF EXISTS "Permitir inserir conteúdos - DESENVOLVIMENTO" ON syllab_conteudos;
DROP POLICY IF EXISTS "Permitir atualizar conteúdos - DESENVOLVIMENTO" ON syllab_conteudos;
DROP POLICY IF EXISTS "Permitir deletar conteúdos - DESENVOLVIMENTO" ON syllab_conteudos;
DROP POLICY IF EXISTS "Permitir inserir professores - DESENVOLVIMENTO" ON syllab_professores;
DROP POLICY IF EXISTS "Permitir inserir instituicoes - DESENVOLVIMENTO" ON syllab_instituicoes;
DROP POLICY IF EXISTS "Permitir atualizar instituicoes - DESENVOLVIMENTO" ON syllab_instituicoes;
DROP POLICY IF EXISTS "Permitir deletar instituicoes - DESENVOLVIMENTO" ON syllab_instituicoes;
DROP POLICY IF EXISTS "Permitir inserir disciplinas - DESENVOLVIMENTO" ON syllab_disciplinas;
DROP POLICY IF EXISTS "Permitir deletar disciplinas - DESENVOLVIMENTO" ON syllab_disciplinas;

-- ========================================
-- POLÍTICAS PARA INSTITUIÇÕES
-- ========================================

CREATE POLICY "Permitir inserir instituicoes - DESENVOLVIMENTO"
ON syllab_instituicoes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualizar instituicoes - DESENVOLVIMENTO"
ON syllab_instituicoes
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir deletar instituicoes - DESENVOLVIMENTO"
ON syllab_instituicoes
FOR DELETE
USING (true);

-- ========================================
-- POLÍTICAS PARA PROFESSORES
-- ========================================

CREATE POLICY "Permitir inserir professores - DESENVOLVIMENTO"
ON syllab_professores
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualizar professores - DESENVOLVIMENTO"
ON syllab_professores
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA DISCIPLINAS
-- ========================================

CREATE POLICY "Permitir inserir disciplinas - DESENVOLVIMENTO"
ON syllab_disciplinas
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualizar disciplinas - DESENVOLVIMENTO"
ON syllab_disciplinas
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir deletar disciplinas - DESENVOLVIMENTO"
ON syllab_disciplinas
FOR DELETE
USING (true);

-- ========================================
-- POLÍTICAS PARA CONTEÚDOS
-- ========================================

CREATE POLICY "Permitir inserir conteúdos - DESENVOLVIMENTO"
ON syllab_conteudos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualizar conteúdos - DESENVOLVIMENTO"
ON syllab_conteudos
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir deletar conteúdos - DESENVOLVIMENTO"
ON syllab_conteudos
FOR DELETE
USING (true);

-- ========================================
-- VERIFICAÇÃO
-- ========================================

-- Verificar políticas ativas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('syllab_conteudos', 'syllab_professores', 'syllab_disciplinas', 'syllab_instituicoes')
ORDER BY tablename, policyname;
