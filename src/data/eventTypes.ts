import type { EventType } from '@/lib/types'

export const EVENT_TYPES: Array<{ value: EventType; label: string; color: string }> = [
  { value: 'mapping_only', label: 'Mapping Only', color: '#3D5A80' },
  { value: 'figuration_only', label: 'Figuration Only', color: '#C87B2A' },
  { value: 'tp_figuration', label: 'TP + Figuration', color: '#6B4C93' },
]

export function typeLabel(t: EventType): string {
  return EVENT_TYPES.find(e => e.value === t)?.label ?? t
}

export function typeColor(t: EventType): string {
  return EVENT_TYPES.find(e => e.value === t)?.color ?? '#666'
}

import { coursNom } from './cours'

export function eventTitle(e: {
  cours: string
  professeur: string
  figuration_titre: string | null
}): string {
  const parts: string[] = [coursNom(e.cours)]
  if (e.professeur) parts.push(e.professeur)
  const head = parts.join(' · ')
  return e.figuration_titre ? `${head} — ${e.figuration_titre}` : head
}
