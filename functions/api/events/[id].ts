import type { Env } from '../../env'

const FIELDS = [
  'date',
  'heure',
  'cours',
  'professeur',
  'gerant_figuration',
  'nombre_figurants',
  'figuration_id',
  'type',
  'motif_retard',
] as const
type Field = typeof FIELDS[number]

const SELECT_WITH_JOIN = `
  SELECT e.*, f.titre AS figuration_titre, f.lieu AS figuration_lieu
  FROM events e
  LEFT JOIN figurations f ON f.id = e.figuration_id
`

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string
  const row = await env.DB
    .prepare(`${SELECT_WITH_JOIN} WHERE e.id = ?`)
    .bind(id)
    .first()
  if (!row) return new Response('Not found', { status: 404 })
  return Response.json(row)
}

export const onRequestPut: PagesFunction<Env> = async ({ env, params, request }) => {
  const id = params.id as string
  const body = (await request.json()) as Partial<Record<Field, string | number | null>>
  const updates: string[] = []
  const values: (string | number | null)[] = []
  for (const field of FIELDS) {
    if (field in body) {
      updates.push(`${field} = ?`)
      values.push(body[field] ?? null)
    }
  }
  if (updates.length === 0) return new Response('Rien à mettre à jour', { status: 400 })
  values.push(id)
  await env.DB.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run()
  const row = await env.DB
    .prepare(`${SELECT_WITH_JOIN} WHERE e.id = ?`)
    .bind(id)
    .first()
  if (!row) return new Response('Not found', { status: 404 })
  return Response.json(row)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string
  await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run()
  return new Response(null, { status: 204 })
}
