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
