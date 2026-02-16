-- ========================================
-- Políticas de Storage para Upload de Arquivos
-- ========================================
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- 1. BUCKET SYLLAB - Políticas de Acesso
-- ========================================

-- Permitir SELECT (visualizar/baixar) - Público
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Public Access',
  'syllab',
  'SELECT',
  'true'
) ON CONFLICT DO NOTHING;

-- Permitir INSERT (upload) - Desenvolvimento (qualquer um pode fazer upload)
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow Upload - DESENVOLVIMENTO',
  'syllab',
  'INSERT',
  'true'
) ON CONFLICT DO NOTHING;

-- Permitir UPDATE (atualizar arquivo) - Desenvolvimento
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow Update - DESENVOLVIMENTO',
  'syllab',
  'UPDATE',
  'true'
) ON CONFLICT DO NOTHING;

-- Permitir DELETE (remover arquivo) - Desenvolvimento
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Allow Delete - DESENVOLVIMENTO',
  'syllab',
  'DELETE',
  'true'
) ON CONFLICT DO NOTHING;

-- ========================================
-- 2. ALTERNATIVA: Criar Bucket via SQL (se não existir)
-- ========================================

-- Verificar se bucket existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'syllab') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'syllab',
      'syllab',
      true,
      52428800, -- 50MB
      ARRAY[
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'video/mp4',
        'video/webm'
      ]
    );
    
    RAISE NOTICE '✅ Bucket syllab criado com sucesso!';
  ELSE
    RAISE NOTICE '✅ Bucket syllab já existe!';
  END IF;
END $$;

-- ========================================
-- 3. VERIFICAÇÕES
-- ========================================

-- Ver configuração do bucket
SELECT 
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as "size_limit_mb",
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'syllab';

-- Ver políticas ativas do bucket
SELECT 
  name,
  bucket_id,
  operation,
  definition
FROM storage.policies 
WHERE bucket_id = 'syllab'
ORDER BY operation;

-- ========================================
-- 4. MENSAGEM FINAL
-- ========================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Políticas de Storage configuradas!';
  RAISE NOTICE '';
  RAISE NOTICE '📁 Bucket: syllab';
  RAISE NOTICE '🔓 Acesso: Público';
  RAISE NOTICE '📤 Upload: Permitido (desenvolvimento)';
  RAISE NOTICE '🔄 Update: Permitido (desenvolvimento)';
  RAISE NOTICE '🗑️  Delete: Permitido (desenvolvimento)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Em produção, restrinja as políticas!';
  RAISE NOTICE '   Substitua "true" por verificação de autenticação:';
  RAISE NOTICE '   auth.uid() IS NOT NULL';
END $$;

-- ========================================
-- 5. EXEMPLO: Como usar no código
-- ========================================

/*
// Upload de arquivo
const { data, error } = await supabase.storage
  .from('syllab')
  .upload('professores/foto-123.jpg', file)

// Obter URL pública
const { data } = supabase.storage
  .from('syllab')
  .getPublicUrl('professores/foto-123.jpg')

console.log('URL:', data.publicUrl)
*/
