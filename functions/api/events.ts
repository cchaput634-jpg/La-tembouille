import type { Env } from '../env'

interface Body {
  date?: string
  heure?: '21:00' | '21:45'
  cours?: string
  figuration_id?: string | null
  type?: 'mapping_only' | 'figuration_only' | 'tp_figuration'
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  let query
  if (from && to) {
    query = env.DB.prepare(
      'SELECT * FROM events WHERE date >= ? AND date <= ? ORDER BY date, heure'
    ).bind(from, to)
  } else {
    query = env.DB.prepare('SELECT * FROM events ORDER BY date DESC, heure')
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
    `INSERT INTO events (id, date, heure, cours, figuration_id, type)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(id, body.date, body.heure, body.cours, body.figuration_id ?? null, body.type)
    .run()
  const row = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first()
  return Response.json(row)
}
