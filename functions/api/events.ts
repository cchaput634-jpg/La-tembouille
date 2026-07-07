import type { Env } from '../env'

interface Body {
  date?: string
  heure?: '21:00' | '21:45'
  cours?: string
  professeur?: string
  gerant_figuration?: string
  nombre_figurants?: number | null
  figuration_id?: string | null
  type?: 'mapping_only' | 'figuration_only' | 'tp_figuration'
  motif_retard?: string | null
}

const SELECT_WITH_JOIN = `
  SELECT e.*, f.titre AS figuration_titre, f.lieu AS figuration_lieu
  FROM events e
  LEFT JOIN figurations f ON f.id = e.figuration_id
`

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  let query
  if (from && to) {
    query = env.DB.prepare(
      `${SELECT_WITH_JOIN} WHERE e.date >= ? AND e.date <= ? ORDER BY e.date, e.heure`
    ).bind(from, to)
  } else {
    query = env.DB.prepare(`${SELECT_WITH_JOIN} ORDER BY e.date DESC, e.heure`)
  }
  const { results } = await query.all()
  return Response.json(results)
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = (await request.json()) as Body
  if (!body.date || !body.heure || !body.cours || !body.type) {
    return new Response('date, heure, cours et type requis', { status: 400 })
  }
  const id = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO events (id, date, heure, cours, professeur, gerant_figuration, nombre_figurants, figuration_id, type, motif_retard)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.date,
      body.heure,
      body.cours,
      body.professeur ?? '',
      body.gerant_figuration ?? '',
      body.nombre_figurants ?? null,
      body.figuration_id ?? null,
      body.type,
      body.motif_retard ?? null
    )
    .run()
  const row = await env.DB
    .prepare(`${SELECT_WITH_JOIN} WHERE e.id = ?`)
    .bind(id)
    .first()
  return Response.json(row)
}
