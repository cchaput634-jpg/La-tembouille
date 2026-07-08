import type { Env } from '../../env'

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = params.id as string
  await env.DB.prepare('DELETE FROM absences_figurants WHERE id = ?').bind(id).run()
  return new Response(null, { status: 204 })
}
