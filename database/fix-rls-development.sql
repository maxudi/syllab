-- Script para corrigir políticas RLS em ambiente de desenvolvimento
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas antigas que exigem autenticação
DROP POLICY IF EXISTS "Professores podem atualizar seus dados" ON syllab_professores;
DROP POLICY IF EXISTS "Professores podem criar disciplinas" ON syllab_disciplinas;
DROP POLICY IF EXISTS "Professores podem atualizar suas disciplinas" ON syllab_disciplinas;
DROP POLICY IF EXISTS "Professores podem criar conteúdos" ON syllab_conteudos;
DROP POLICY IF EXISTS "Professores podem atualizar conteúdos" ON syllab_conteudos;
DROP POLICY IF EXISTS "Professores podem deletar conteúdos" ON syllab_conteudos;

-- 2. Criar novas políticas permissivas para desenvolvimento
CREATE POLICY "Permitir atualizar professores em desenvolvimento" ON syllab_professores
  FOR UPDATE USING (true);

CREATE POLICY "Permitir criar disciplinas em desenvolvimento" ON syllab_disciplinas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualizar disciplinas em desenvolvimento" ON syllab_disciplinas
  FOR UPDATE USING (true);

CREATE POLICY "Permitir criar conteúdos em desenvolvimento" ON syllab_conteudos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualizar conteúdos em desenvolvimento" ON syllab_conteudos
  FOR UPDATE USING (true);

CREATE POLICY "Permitir deletar conteúdos em desenvolvimento" ON syllab_conteudos
  FOR DELETE USING (true);

-- Verificar se as políticas foram criadas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE tablename LIKE 'syllab_%'
ORDER BY tablename, policyname;
