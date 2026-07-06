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
