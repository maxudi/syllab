# 🔧 CORREÇÃO RÁPIDA: Erro de Upload de Arquivos

## ❌ Erro que você está vendo:
```
localhost:3000 diz
new row violates row-level security policy
```

## ✅ SOLUÇÃO - Execute Agora:

### Passo 1: Abra o Supabase Dashboard
```
https://supabase.com/dashboard
```

### Passo 2: Vá em SQL Editor
- Menu lateral → SQL Editor
- Clique em "New query"

### Passo 3: Cole e Execute este Script
```sql
-- Permitir acesso público ao bucket
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES 
  ('Public Access', 'syllab', 'SELECT', 'true'),
  ('Allow Upload', 'syllab', 'INSERT', 'true'),
  ('Allow Update', 'syllab', 'UPDATE', 'true'),
  ('Allow Delete', 'syllab', 'DELETE', 'true')
ON CONFLICT DO NOTHING;
```

### Passo 4: Clique em RUN (ou pressione Ctrl+Enter)

### Passo 5: Volte ao navegador e tente novamente! 🎉

---

## 🔍 Script Completo (Opcional)

Se o script rápido não funcionar, execute o script completo:
```
database/fix-storage-policies.sql
```

## 📋 O que este script faz:

1. ✅ Permite visualizar arquivos (SELECT)
2. ✅ Permite fazer upload (INSERT)  
3. ✅ Permite atualizar arquivos (UPDATE)
4. ✅ Permite deletar arquivos (DELETE)

## 🎯 Estrutura do Bucket

```
syllab/
  ├── professores/
  │   ├── foto-[id].jpg
  │   └── ...
  ├── instituicoes/
  │   ├── logo-[id].png
  │   └── ...
  ├── disciplinas/
  │   └── ...
  └── slides/
      └── ...
```

## 💡 Exemplo de Código (já deve estar implementado):

```typescript
// Upload de foto de professor
async function uploadFoto(file: File) {
  const fileName = `professores/foto-${Date.now()}.${file.name.split('.').pop()}`
  
  const { data, error } = await supabase.storage
    .from('syllab')
    .upload(fileName, file)
  
  if (error) {
    console.error('Erro no upload:', error)
    return null
  }
  
  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from('syllab')
    .getPublicUrl(fileName)
  
  return urlData.publicUrl
}

// Salvar URL no banco
await supabase
  .from('syllab_professores')
  .update({ foto_url: publicUrl })
  .eq('id', professorId)
```

## ⚠️ IMPORTANTE

### Desenvolvimento (Agora):
- Políticas permissivas (`true`)
- Qualquer um pode fazer upload

### Produção (Depois):
Altere as políticas para verificar autenticação:
```sql
-- Substituir "true" por:
auth.uid() IS NOT NULL

-- Ou verificar se é o próprio professor:
auth.uid() = (SELECT user_id FROM syllab_professores WHERE id = ...)
```

## 🚀 Após Executar o Script:

1. Recarregue a página do admin
2. Tente fazer upload novamente
3. Deve funcionar! ✨

## 🐛 Se ainda der erro:

### Verifique se o bucket existe:
```sql
SELECT * FROM storage.buckets WHERE id = 'syllab';
```

### Se não existir, crie:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('syllab', 'syllab', true);
```

### Depois execute novamente as políticas!
