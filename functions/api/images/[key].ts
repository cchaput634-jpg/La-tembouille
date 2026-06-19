import type { Env } from '../../env'

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const key = params.key as string
  const obj = await env.IMAGES.get(key)
  if (!obj) return new Response('Not found', { status: 404 })
  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('cache-control', 'public, max-age=31536000, immutable')
  return new Response(obj.body, { headers })
}
