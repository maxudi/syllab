-- ================================================
-- ATUALIZAÇÃO: Adicionar campo STATUS na view v_admin_professores
-- Execute este script no SQL Editor do Supabase
-- ================================================

-- Recriar a view incluindo o campo status
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
  p.status,  -- ✅ CAMPO ADICIONADO
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
GROUP BY p.id, p.user_id, p.nome, p.email, p.telefone, p.cpf, p.foto_url, p.token_ia, p.ativo, p.status, p.created_at, p.updated_at;

-- Verificar se a view foi atualizada corretamente
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'v_admin_professores'
ORDER BY ordinal_position;

-- Testar a query
SELECT 
  id,
  nome,
  email,
  status,
  ativo,
  total_instituicoes,
  total_disciplinas
FROM v_admin_professores
ORDER BY nome
LIMIT 5;

-- Mensagem de sucesso
SELECT '✅ View v_admin_professores atualizada com campo STATUS!' as resultado;
