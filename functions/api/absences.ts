import type { Env } from '../env'

interface Body {
  figurant_id?: string
  date_debut?: string
  date_fin?: string
}

const SELECT_WITH_JOIN = `
  SELECT a.id, a.figurant_id, a.date_debut, a.date_fin, a.created_at, f.nom AS figurant_nom
  FROM absences_figurants a
  LEFT JOIN figurants_perm f ON f.id = a.figurant_id
`

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB
    .prepare(`${SELECT_WITH_JOIN} ORDER BY a.date_debut DESC`)
    .all()
  return Response.json(results)
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = (await request.json()) as Body
  if (!body.figurant_id || !body.date_debut || !body.date_fin) {
    return new Response('figurant_id, date_debut et date_fin requis', { status: 400 })
  }
  if (body.date_fin < body.date_debut) {
    return new Response('date_fin doit être >= date_debut', { status: 400 })
  }
  const id = crypto.randomUUID()
  await env.DB.prepare(
    'INSERT INTO absences_figurants (id, figurant_id, date_debut, date_fin) VALUES (?, ?, ?, ?)'
  )
    .bind(id, body.figurant_id, body.date_debut, body.date_fin)
    .run()
  const row = await env.DB
    .prepare(`${SELECT_WITH_JOIN} WHERE a.id = ?`)
    .bind(id)
    .first()
  return Response.json(row)
}
