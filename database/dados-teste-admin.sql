-- Dados de Exemplo para o Módulo Admin
-- Execute este script APÓS criar a estrutura básica do Syllab e o módulo admin

-- ========================================
-- 1. CRIAR INSTITUIÇÕES DE TESTE
-- ========================================

-- Limpar instituições de teste antigas (opcional)
-- DELETE FROM syllab_instituicoes WHERE sigla IN ('IFSP', 'UNIFESP', 'USP');

INSERT INTO syllab_instituicoes (nome, sigla, cnpj, ativo)
VALUES 
  ('Instituto Federal de São Paulo', 'IFSP', '10.882.594/0001-65', true),
  ('Universidade Federal de São Paulo', 'UNIFESP', '51.308.807/0001-10', true),
  ('Universidade de São Paulo', 'USP', '63.025.530/0001-04', true)
ON CONFLICT (cnpj) DO NOTHING;

-- ========================================
-- 2. CRIAR USUÁRIOS DE TESTE NO AUTH
-- ========================================

-- IMPORTANTE: Você precisa executar estes inserts manualmente
-- substituindo os IDs retornados nos próximos passos

-- Criar 3 professores de teste:
-- Email: professor1@teste.com | Senha: teste123
-- Email: professor2@teste.com | Senha: teste123  
-- Email: professor3@teste.com | Senha: teste123

-- EXECUTE NO CONSOLE DO NAVEGADOR (após fazer signup manual):
/*
Para criar via código, use o signup normal do sistema ou:

1. Acesse http://localhost:3001
2. Vá em Cadastrar
3. Crie os 3 usuários acima

OU use a API do Supabase (mais avançado)
*/

-- ========================================
-- 3. CRIAR PROFESSORES (após criar os users no auth)
-- ========================================

-- Exemplo: Substitua os UUIDs pelos IDs reais dos usuários criados

/*
INSERT INTO syllab_professores (user_id, nome, email, telefone, cpf, foto_url, token_ia, ativo)
VALUES 
  (
    'UUID-DO-USER-1', 
    'Dr. João Silva',
    'professor1@teste.com',
    '(11) 98765-4321',
    '123.456.789-01',
    'https://i.pravatar.cc/150?img=12',
    'sk-test-token-joao-123',
    true
  ),
  (
    'UUID-DO-USER-2',
    'Profa. Maria Santos',
    'professor2@teste.com',
    '(11) 98765-4322',
    '987.654.321-09',
    'https://i.pravatar.cc/150?img=47',
    NULL,
    true
  ),
  (
    'UUID-DO-USER-3',
    'Prof. Carlos Oliveira',
    'professor3@teste.com',
    '(11) 98765-4323',
    '456.789.123-45',
    'https://i.pravatar.cc/150?img=33',
    'sk-test-token-carlos-456',
    true
  );
*/

-- ========================================
-- 4. SCRIPT AUTOMÁTICO DE CRIAÇÃO
-- ========================================

-- Este script cria professores automaticamente linkando com users existentes
-- Substitua os emails pelos que você criou

DO $$
DECLARE
  v_user_id_1 UUID;
  v_user_id_2 UUID;
  v_user_id_3 UUID;
  v_professor_id_1 UUID;
  v_professor_id_2 UUID;
  v_professor_id_3 UUID;
  v_ifsp_id UUID;
  v_unifesp_id UUID;
  v_usp_id UUID;
BEGIN
  -- Buscar IDs dos usuários pelo email
  SELECT id INTO v_user_id_1 FROM auth.users WHERE email = 'professor1@teste.com';
  SELECT id INTO v_user_id_2 FROM auth.users WHERE email = 'professor2@teste.com';
  SELECT id INTO v_user_id_3 FROM auth.users WHERE email = 'professor3@teste.com';
  
  -- Verificar se encontrou os usuários
  IF v_user_id_1 IS NULL OR v_user_id_2 IS NULL OR v_user_id_3 IS NULL THEN
    RAISE NOTICE 'ATENÇÃO: Alguns usuários não foram encontrados!';
    RAISE NOTICE 'Crie os usuários professor1@teste.com, professor2@teste.com, professor3@teste.com primeiro';
    RETURN;
  END IF;
  
  -- Criar professores
  INSERT INTO syllab_professores (user_id, nome, email, telefone, cpf, foto_url, token_ia, ativo)
  VALUES 
    (v_user_id_1, 'Dr. João Silva', 'professor1@teste.com', '(11) 98765-4321', '123.456.789-01', 'https://i.pravatar.cc/150?img=12', 'sk-test-token-joao-123', true),
    (v_user_id_2, 'Profa. Maria Santos', 'professor2@teste.com', '(11) 98765-4322', '987.654.321-09', 'https://i.pravatar.cc/150?img=47', NULL, true),
    (v_user_id_3, 'Prof. Carlos Oliveira', 'professor3@teste.com', '(11) 98765-4323', '456.789.123-45', 'https://i.pravatar.cc/150?img=33', 'sk-test-token-carlos-456', true)
  ON CONFLICT (user_id) DO UPDATE SET
    nome = EXCLUDED.nome,
    telefone = EXCLUDED.telefone,
    cpf = EXCLUDED.cpf,
    foto_url = EXCLUDED.foto_url,
    token_ia = EXCLUDED.token_ia
  RETURNING id INTO v_professor_id_1;
  
  -- Buscar IDs dos professores criados
  SELECT id INTO v_professor_id_1 FROM syllab_professores WHERE user_id = v_user_id_1;
  SELECT id INTO v_professor_id_2 FROM syllab_professores WHERE user_id = v_user_id_2;
  SELECT id INTO v_professor_id_3 FROM syllab_professores WHERE user_id = v_user_id_3;
  
  -- Buscar IDs das instituições
  SELECT id INTO v_ifsp_id FROM syllab_instituicoes WHERE sigla = 'IFSP';
  SELECT id INTO v_unifesp_id FROM syllab_instituicoes WHERE sigla = 'UNIFESP';
  SELECT id INTO v_usp_id FROM syllab_instituicoes WHERE sigla = 'USP';
  
  -- Criar vínculos
  -- João Silva -> IFSP e USP
  INSERT INTO syllab_professor_instituicoes (professor_id, instituicao_id, cargo, ativo)
  VALUES 
    (v_professor_id_1, v_ifsp_id, 'Professor Titular', true),
    (v_professor_id_1, v_usp_id, 'Professor Visitante', true)
  ON CONFLICT (professor_id, instituicao_id) DO NOTHING;
  
  -- Maria Santos -> UNIFESP
  INSERT INTO syllab_professor_instituicoes (professor_id, instituicao_id, cargo, ativo)
  VALUES 
    (v_professor_id_2, v_unifesp_id, 'Professora Adjunta', true)
  ON CONFLICT (professor_id, instituicao_id) DO NOTHING;
  
  -- Carlos Oliveira -> IFSP, UNIFESP e USP
  INSERT INTO syllab_professor_instituicoes (professor_id, instituicao_id, cargo, ativo)
  VALUES 
    (v_professor_id_3, v_ifsp_id, 'Professor Associado', true),
    (v_professor_id_3, v_unifesp_id, 'Professor Colaborador', true),
    (v_professor_id_3, v_usp_id, 'Professor Doutor', true)
  ON CONFLICT (professor_id, instituicao_id) DO NOTHING;
  
  RAISE NOTICE '✅ Professores e vínculos criados com sucesso!';
  RAISE NOTICE 'João Silva: 2 instituições (IFSP, USP)';
  RAISE NOTICE 'Maria Santos: 1 instituição (UNIFESP)';
  RAISE NOTICE 'Carlos Oliveira: 3 instituições (IFSP, UNIFESP, USP)';
END $$;

-- ========================================
-- VERIFICAÇÕES
-- ========================================

-- Listar professores criados
SELECT 
  p.nome,
  p.email,
  p.telefone,
  CASE WHEN p.token_ia IS NOT NULL THEN 'Sim' ELSE 'Não' END as tem_token_ia,
  p.ativo
FROM syllab_professores p
WHERE p.email LIKE '%@teste.com'
ORDER BY p.nome;

-- Listar vínculos criados
SELECT 
  p.nome as professor,
  i.nome as instituicao,
  pi.cargo,
  pi.ativo
FROM syllab_professor_instituicoes pi
JOIN syllab_professores p ON pi.professor_id = p.id
JOIN syllab_instituicoes i ON pi.instituicao_id = i.id
WHERE p.email LIKE '%@teste.com'
ORDER BY p.nome, i.nome;

-- Usar a view de admin
SELECT 
  nome,
  email,
  total_instituicoes,
  instituicoes,
  total_disciplinas
FROM v_admin_professores
WHERE email LIKE '%@teste.com'
ORDER BY nome;

-- ========================================
-- INSTRUÇÕES DE USO
-- ========================================

/*

🎯 COMO USAR ESTE SCRIPT:

1. Primeiro, crie 3 usuários manualmente:
   - Acesse http://localhost:3001
   - Clique em "Cadastrar"
   - Crie os usuários:
     * professor1@teste.com | senha: teste123
     * professor2@teste.com | senha: teste123
     * professor3@teste.com | senha: teste123

2. Execute este script no SQL Editor do Supabase

3. Os professores serão criados automaticamente com:
   - Dados pessoais completos
   - Fotos de avatar aleatórias
   - Tokens de IA (alguns professores)
   - Vínculos com múltiplas instituições

4. Acesse como admin e visualize em /admin/professores

5. Para testar o perfil do professor:
   - Faça login como professor1@teste.com
   - Clique no nome no header
   - Selecione "Meu Perfil"

📝 LIMPEZA (caso queira refazer):

DELETE FROM syllab_professor_instituicoes WHERE professor_id IN (
  SELECT id FROM syllab_professores WHERE email LIKE '%@teste.com'
);

DELETE FROM syllab_professores WHERE email LIKE '%@teste.com';

-- Depois delete os users manualmente no Supabase Auth Dashboard

*/
