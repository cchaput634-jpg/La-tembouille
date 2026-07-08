import type { Env } from '../env'

interface Body {
  nom?: string
}

function parisToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date())
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const today = parisToday()
  const { results } = await env.DB.prepare(
    `SELECT id, nom,
       CASE WHEN dispo_date = ? THEN dispo ELSE NULL END AS dispo,
       CASE WHEN dispo_date = ? THEN dispo_date ELSE NULL END AS dispo_date,
       created_at
     FROM figurants_perm
     ORDER BY nom COLLATE NOCASE`
  )
    .bind(today, today)
    .all()
  return Response.json(results)
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = (await request.json()) as Body
  const nom = (body.nom ?? '').trim()
  if (!nom) return new Response('nom requis', { status: 400 })
  const id = crypto.randomUUID()
  await env.DB.prepare(
    'INSERT INTO figurants_perm (id, nom) VALUES (?, ?)'
  )
    .bind(id, nom)
    .run()
  const row = await env.DB
    .prepare('SELECT id, nom, NULL AS dispo, NULL AS dispo_date, created_at FROM figurants_perm WHERE id = ?')
    .bind(id)
    .first()
  return Response.json(row)
}
