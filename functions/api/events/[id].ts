import type { Env } from '../../env'

const FIELDS = ['date', 'heure', 'cours', 'figuration_id', 'type'] as const
type Field = typeof FIELDS[number]

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string
  const row = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first()
  if (!row) return new Response('Not found', { status: 404 })
  return Response.json(row)
}

export const onRequestPut: PagesFunction<Env> = async ({ env, params, request }) => {
  const id = params.id as string
  const body = (await request.json()) as Partial<Record<Field, string | null>>
  const updates: string[] = []
  const values: (string | null)[] = []
  for (const field of FIELDS) {
    if (field in body) {
      updates.push(`${field} = ?`)
      values.push(body[field] ?? null)
    }
  }
  if (updates.length === 0) return new Response('Rien à mettre à jour', { status: 400 })
  values.push(id)
  await env.DB.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()
  const row = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first()
  if (!row) return new Response('Not found', { status: 404 })
  return Response.json(row)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string
  await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run()
  return new Response(null, { status: 204 })
}
