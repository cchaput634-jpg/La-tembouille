import type { Env } from '../env'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return new Response('Fichier manquant', { status: 400 })
  if (!ALLOWED.includes(file.type)) return new Response('Type non autorisé', { status: 415 })
  if (file.size > MAX_BYTES) return new Response('Fichier trop volumineux', { status: 413 })

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const key = `${crypto.randomUUID()}.${ext}`
  await env.IMAGES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })
  return Response.json({ url: `/api/images/${key}` })
}
