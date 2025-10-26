export function useUploader() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string
  const s3PublicBase = config.public.s3PublicBase as string

  async function uploadFile(file: File) {
    // Step 1: Get signed URL from API
    const signedUrlResponse = await $fetch<{
      url: string
      method: string
      key: string
    }>(`${apiBase}/uploads/signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
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
      throw new Error(`Upload failed: ${uploadResponse.statusText}`)
    }

    // Step 3: Construct public URL
    const publicUrl = `${s3PublicBase}/${signedUrlResponse.key}`

    return {
      key: signedUrlResponse.key,
      putUrl: signedUrlResponse.url,
      publicUrl,
    }
  }

  return {
    uploadFile,
  }
}
