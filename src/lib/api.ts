import type { Figuration, FigurationInput, FigurationSummary } from './types'

const BASE = '/api'

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  listByCours: (cours: string) =>
    jsonFetch<FigurationSummary[]>(`${BASE}/figurations?cours=${encodeURIComponent(cours)}`),

  get: (id: string) => jsonFetch<Figuration>(`${BASE}/figurations/${id}`),

  create: (input: FigurationInput) =>
    jsonFetch<Figuration>(`${BASE}/figurations`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: Partial<FigurationInput>) =>
    jsonFetch<Figuration>(`${BASE}/figurations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    fetch(`${BASE}/figurations/${id}`, { method: 'DELETE' }).then(r => {
      if (!r.ok) throw new Error('Suppression échouée')
    }),

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${BASE}/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload échoué')
    return res.json()
  },
}
