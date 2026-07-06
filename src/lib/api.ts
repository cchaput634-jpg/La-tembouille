import type {
  Figuration,
  FigurationInput,
  FigurationSummary,
  CalendarEvent,
  EventInput,
} from './types'

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

  events: {
    listRange: (from: string, to: string) =>
      jsonFetch<CalendarEvent[]>(
        `${BASE}/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      ),

    create: (input: EventInput) =>
      jsonFetch<CalendarEvent>(`${BASE}/events`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    remove: (id: string) =>
      fetch(`${BASE}/events/${id}`, { method: 'DELETE' }).then(r => {
        if (!r.ok) throw new Error('Suppression échouée')
      }),
  },
}
