import type { Env } from '../../env'

const FIELDS = ['cours', 'titre', 'deroule', 'info_a_savoir', 'type_ped', 'item_a_demander', 'lieu', 'autre'] as const
type Field = typeof FIELDS[number]

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string
  const row = await env.DB.prepare('SELECT * FROM figurations WHERE id = ?').bind(id).first()
  if (!row) return new Response('Not found', { status: 404 })
  return Response.json(row)
}

export const onRequestPut: PagesFunction<Env> = async ({ env, params, request }) => {
  const id = params.id as string
  const body = (await request.json()) as Partial<Record<Field, string>>
  const updates: string[] = []
  const values: string[] = []
  for (const field of FIELDS) {
    if (field in body && body[field] !== undefined) {
      updates.push(`${field} = ?`)
      values.push(body[field] as string)
    }
  }
  if (updates.length === 0) {
    return new Response('Rien à mettre à jour', { status: 400 })
  }
  updates.push('updated_at = ?')
  values.push(String(Math.floor(Date.now() / 1000)))
  values.push(id)
  await env.DB.prepare(`UPDATE figurations SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()
  const row = await env.DB.prepare('SELECT * FROM figurations WHERE id = ?').bind(id).first()
  if (!row) return new Response('Not found', { status: 404 })
  return Response.json(row)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string
  await env.DB.prepare('DELETE FROM figurations WHERE id = ?').bind(id).run()
  return new Response(null, { status: 204 })
}
