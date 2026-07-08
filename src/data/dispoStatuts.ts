import type { DispoStatut } from '@/lib/types'

export const DISPO_OPTIONS: Array<{
  value: DispoStatut
  label: string
  color: string
}> = [
  { value: 'pas_dispo', label: 'Pas dispo', color: '#B33A3A' },
  { value: 'dispo', label: 'Dispo', color: '#4A7C43' },
  { value: 'dispo_si_besoin', label: 'Dispo si besoin', color: '#C87B2A' },
]
