export interface Figuration {
  id: string
  cours: string
  titre: string
  deroule: string
  info_a_savoir: string
  type_ped: string
  item_a_demander: string
  lieu: string
  autre: string
  created_at: number
  updated_at: number
}

export type FigurationSummary = Pick<Figuration, 'id' | 'cours' | 'titre' | 'updated_at'>

export interface FigurationInput {
  cours: string
  titre: string
  deroule?: string
  info_a_savoir?: string
  type_ped?: string
  item_a_demander?: string
  lieu?: string
  autre?: string
}

export type EventHeure = '21:00' | '21:45'
export type EventType = 'mapping_only' | 'figuration_only' | 'tp_figuration'
export type StatutTP = 'fait' | 'en_cours' | 'info_demandee' | 'refuse'

export interface CalendarEvent {
  id: string
  date: string
  heure: EventHeure
  cours: string
  professeur: string
  gerant_figuration: string
  nombre_figurants: number | null
  figuration_id: string | null
  figuration_titre: string | null
  figuration_lieu: string | null
  type: EventType
  motif_retard: string | null
  statut_tp: StatutTP | null
  created_at: number
}

export interface EventInput {
  date: string
  heure: EventHeure
  cours: string
  professeur?: string
  gerant_figuration?: string
  nombre_figurants?: number | null
  figuration_id?: string | null
  type: EventType
  motif_retard?: string | null
  statut_tp?: StatutTP | null
}
