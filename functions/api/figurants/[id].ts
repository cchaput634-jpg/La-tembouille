import type { Env } from '../../env'

interface Body {
  nom?: string
  dispo?: 'pas_dispo' | 'dispo' | 'dispo_si_besoin' | null
}

const VALID_DISPO = new Set(['pas_dispo', 'dispo', 'dispo_si_besoin', null])

function parisToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date())
}

export const onRequestPut: PagesFunction<Env> = async ({ env, params, request }) => {
  const id = params.id as string
  const body = (await request.json()) as Body

  if ('dispo' in body) {
    if (!VALID_DISPO.has(body.dispo ?? null)) {
      return new Response('dispo invalide', { status: 400 })
    }
    const today = parisToday()
    await env.DB.prepare(
      'UPDATE figurants_perm SET dispo = ?, dispo_date = ? WHERE id = ?'
    )
      .bind(body.dispo ?? null, body.dispo == null ? null : today, id)
      .run()
  }

  if (typeof body.nom === 'string' && body.nom.trim()) {
    await env.DB.prepare('UPDATE figurants_perm SET nom = ? WHERE id = ?')
      .bind(body.nom.trim(), id)
      .run()
  }

  const today = parisToday()
  const row = await env.DB
    .prepare(
      `SELECT id, nom,
         CASE WHEN dispo_date = ? THEN dispo ELSE NULL END AS dispo,
         CASE WHEN dispo_date = ? THEN dispo_date ELSE NULL END AS dispo_date,
         created_at
       FROM figurants_perm WHERE id = ?`
    )
    .bind(today, today, id)
    .first()
  if (!row) return new Response('Not found', { status: 404 })
  return Response.json(row)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string
  await env.DB.prepare('DELETE FROM absences_figurants WHERE figurant_id = ?').bind(id).run()
  await env.DB.prepare('DELETE FROM figurants_perm WHERE id = ?').bind(id).run()
  return new Response(null, { status: 204 })
}
