import type { Env } from '../env'

interface Body {
  cours?: string
  titre?: string
  deroule?: string
  info_a_savoir?: string
  type_ped?: string
  item_a_demander?: string
  lieu?: string
  autre?: string
}

function uuid(): string {
  return crypto.randomUUID()
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url)
  const cours = url.searchParams.get('cours')
  const query = cours
    ? env.DB.prepare(
        'SELECT id, cours, titre, updated_at FROM figurations WHERE cours = ? ORDER BY titre COLLATE NOCASE'
      ).bind(cours)
    : env.DB.prepare(
        'SELECT id, cours, titre, updated_at FROM figurations ORDER BY updated_at DESC'
      )
  const { results } = await query.all()
  return Response.json(results)
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = (await request.json()) as Body
  if (!body.cours || !body.titre) {
    return new Response('cours et titre requis', { status: 400 })
  }
  const id = uuid()
  const now = Math.floor(Date.now() / 1000)
  await env.DB.prepare(
    `INSERT INTO figurations (id, cours, titre, deroule, info_a_savoir, type_ped, item_a_demander, lieu, autre, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      body.cours,
      body.titre,
      body.deroule ?? '',
      body.info_a_savoir ?? '',
      body.type_ped ?? '',
      body.item_a_demander ?? '',
      body.lieu ?? '',
      body.autre ?? '',
      now,
      now
    )
    .run()
  const row = await env.DB.prepare('SELECT * FROM figurations WHERE id = ?').bind(id).first()
  return Response.json(row)
}
