import { useApi } from '#imports'
import { getSignedGetUrl } from '@/composables/useSignedUrl'

export function useUploader() {
  const api = useApi()
  const config = useRuntimeConfig()
  const s3PublicBase = config.public.s3PublicBase as string

  async function uploadFile(file: File, title?: string) {
    // Step 1: Get signed URL from API
    const signedUrlResponse = await api<{
      url: string
      method: string
      key: string
    }>('/uploads/signed-url', {
      method: 'POST',
      body: {
        filename: file.name,
        contentType: file.type,
      },
    })

    // Step 2: Upload file to S3/MinIO using signed URL
    const uploadResponse = await fetch(signedUrlResponse.url, {
      method: signedUrlResponse.method,
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error(`アップロードに失敗しました（${uploadResponse.status} ${uploadResponse.statusText}）`)
    }

    // Step 3: Finalize - save to database
    const asset = await api('/assets', {
      method: 'POST',
      body: {
        key: signedUrlResponse.key,
        title: title,
        contentType: file.type,
        size: file.size,
      },
    })

    // Step 4: Construct public URL
    const publicUrl = `${s3PublicBase}/${signedUrlResponse.key}`

    // Step 5: Get signed URL for accessing the uploaded file
    const signedUrl = await getSignedGetUrl(signedUrlResponse.key, 600)

    return {
      key: signedUrlResponse.key,
      publicUrl,
      asset,
      signedUrl,
    }
  }

  return {
    uploadFile,
  }
}
