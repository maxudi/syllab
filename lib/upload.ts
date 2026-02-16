import { supabase } from '@/lib/supabase'

export type UploadOptions = {
  bucket?: string
  folder?: string // ex: 'professores/123'
  fileName?: string // opcional; se não vier, será gerado a partir do timestamp
  upsert?: boolean
}

export async function uploadToStorage(file: File, options: UploadOptions = {}) {
  const bucket = options.bucket ?? 'syllab'

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const fileName = options.fileName ?? `${timestamp}-${safeName}`
  const folder = options.folder?.replace(/^\/+|\/+$/g, '') // trim '/'
  const path = folder ? `${folder}/${fileName}` : fileName

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: options.upsert ?? true, cacheControl: '3600', contentType: file.type || undefined })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { publicUrl: data.publicUrl, path, bucket }
}
