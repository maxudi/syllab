-- ========================================
-- FIX: Políticas RLS para módulo Admin
-- ========================================
-- Execute este script no SQL Editor do Supabase
-- Este script corrige permissões que impedem o admin de criar/editar professores

-- ========================================
-- 1. REMOVER POLÍTICAS ANTIGAS/CONFLITANTES
-- ========================================

-- Professores
DROP POLICY IF EXISTS "Permitir criar professores em desenvolvimento" ON syllab_professores;
DROP POLICY IF EXISTS "Permitir inserir professores - DESENVOLVIMENTO" ON syllab_professores;
DROP POLICY IF EXISTS "Permitir atualizar professores - DESENVOLVIMENTO" ON syllab_professores;
DROP POLICY IF EXISTS "Permitir atualizar professores em desenvolvimento" ON syllab_professores;
DROP POLICY IF EXISTS "Permitir deletar professores - DESENVOLVIMENTO" ON syllab_professores;
DROP POLICY IF EXISTS "Admins podem gerenciar professores" ON syllab_professores;

-- Professor-Instituições
DROP POLICY IF EXISTS "Permitir inserir professor_instituicoes - DESENVOLVIMENTO" ON syllab_professor_instituicoes;
DROP POLICY IF EXISTS "Permitir atualizar professor_instituicoes - DESENVOLVIMENTO" ON syllab_professor_instituicoes;
DROP POLICY IF EXISTS "Permitir deletar professor_instituicoes - DESENVOLVIMENTO" ON syllab_professor_instituicoes;
DROP POLICY IF EXISTS "Admins podem gerenciar vinculos" ON syllab_professor_instituicoes;

-- Instituições
DROP POLICY IF EXISTS "Permitir inserir instituicoes - DESENVOLVIMENTO" ON syllab_instituicoes;
DROP POLICY IF EXISTS "Permitir atualizar instituicoes - DESENVOLVIMENTO" ON syllab_instituicoes;
DROP POLICY IF EXISTS "Permitir deletar instituicoes - DESENVOLVIMENTO" ON syllab_instituicoes;

-- ========================================
-- 2. POLÍTICAS PARA PROFESSORES
-- ========================================
-- Permitem INSERT, UPDATE e DELETE na tabela syllab_professores

-- INSERT - Para criar novos professores
CREATE POLICY "Permitir inserir professores - DESENVOLVIMENTO"
ON syllab_professores
FOR INSERT
WITH CHECK (true);

-- UPDATE - Para editar dados de professores e ativar/desativar
CREATE POLICY "Permitir atualizar professores - DESENVOLVIMENTO"
ON syllab_professores
FOR UPDATE
USING (true)
WITH CHECK (true);

-- DELETE - Para eventual exclusão (opcional)
CREATE POLICY "Permitir deletar professores - DESENVOLVIMENTO"
ON syllab_professores
FOR DELETE
USING (true);

-- ========================================
-- 3. POLÍTICAS PARA VÍNCULOS PROFESSOR-INSTITUIÇÕES
-- ========================================
-- Permitem gerenciar os vínculos entre professores e instituições

-- SELECT já existe (público), então não precisa recriar
DROP POLICY IF EXISTS "Permitir visualizar vinculos" ON syllab_professor_instituicoes;
CREATE POLICY "Permitir visualizar vinculos"
ON syllab_professor_instituicoes
FOR SELECT
USING (true);

-- INSERT - Para adicionar vínculos
CREATE POLICY "Permitir inserir professor_instituicoes - DESENVOLVIMENTO"
ON syllab_professor_instituicoes
FOR INSERT
WITH CHECK (true);

-- UPDATE - Para ativar/desativar vínculos
CREATE POLICY "Permitir atualizar professor_instituicoes - DESENVOLVIMENTO"
ON syllab_professor_instituicoes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- DELETE - Para remover vínculos (opcional)
CREATE POLICY "Permitir deletar professor_instituicoes - DESENVOLVIMENTO"
ON syllab_professor_instituicoes
FOR DELETE
USING (true);

-- ========================================
-- 4. POLÍTICAS PARA INSTITUIÇÕES
-- ========================================
-- Permitem admins gerenciarem instituições

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
-- 5. VERIFICAÇÃO
-- ========================================
-- Verificar todas as políticas criadas

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive AS "Permissivo", 
  cmd AS "Comando"
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN (
    'syllab_professores', 
    'syllab_professor_instituicoes',
    'syllab_instituicoes',
    'syllab_administradores'
  )
ORDER BY tablename, cmd, policyname;

-- ========================================
-- 6. MENSAGEM DE SUCESSO
-- ========================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Políticas RLS corrigidas com sucesso!';
  RAISE NOTICE '✅ Admins agora podem:';
  RAISE NOTICE '   - Criar novos professores';
  RAISE NOTICE '   - Editar dados de professores';
  RAISE NOTICE '   - Ativar/desativar professores';
  RAISE NOTICE '   - Gerenciar vínculos com instituições';
  RAISE NOTICE '   - Gerenciar instituições';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Estas são políticas de DESENVOLVIMENTO';
  RAISE NOTICE '   Em produção, substitua por políticas que verificam is_admin()';
END $$;
