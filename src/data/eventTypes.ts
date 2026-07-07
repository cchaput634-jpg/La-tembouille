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
  gerant_figuration: string
  figuration_titre: string | null
}): string {
  const parts: string[] = [coursNom(e.cours)]
  if (e.figuration_titre) parts.push(e.figuration_titre)
  if (e.professeur) parts.push(e.professeur)
  if (e.gerant_figuration) parts.push(e.gerant_figuration)
  return parts.join(' · ')
}

export const LATE_THRESHOLD_MS = 48 * 3600 * 1000
export const LATE_COLOR = '#B33A3A'

export function eventDatetimeMs(dateStr: string, heure: string): number {
  return new Date(`${dateStr}T${heure}:00`).getTime()
}

export function willBeLate(dateStr: string, heure: string, nowMs = Date.now()): boolean {
  if (!dateStr) return false
  return eventDatetimeMs(dateStr, heure) - nowMs < LATE_THRESHOLD_MS
}

export function isEventLate(e: { motif_retard: string | null }): boolean {
  return e.motif_retard != null && e.motif_retard.trim() !== ''
}

import type { StatutTP } from '@/lib/types'

export const STATUT_TP_OPTIONS: Array<{
  value: StatutTP
  label: string
  color: string
}> = [
  { value: 'fait', label: 'Fait', color: '#4A7C43' },
  { value: 'en_cours', label: 'En cours', color: '#C87B2A' },
  { value: 'info_demandee', label: 'Info demandée', color: '#5C7C99' },
  { value: 'refuse', label: 'Refusé', color: '#B33A3A' },
]

export function statutColor(s: StatutTP): string {
  return STATUT_TP_OPTIONS.find(o => o.value === s)?.color ?? '#888'
}
