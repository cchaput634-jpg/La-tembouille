export const COURS = [
  { slug: 'sortilege', nom: 'Sortilège' },
  { slug: 'creatures-magiques', nom: 'Créatures Magiques' },
  { slug: 'dcfo', nom: 'DCFO' },
  { slug: 'survie-culinaire', nom: 'Survie Culinaire' },
  { slug: 'potion', nom: 'Potion' },
  { slug: 'rune', nom: 'Rune' },
  { slug: 'histoire-magie', nom: 'Histoire de la magie' },
  { slug: 'golbute', nom: 'Golbute' },
  { slug: 'metamorphose', nom: 'Métamorphose' },
  { slug: 'divination', nom: 'Divination' },
  { slug: 'botanique', nom: 'Botanique' },
  { slug: 'vol', nom: 'Vol' },
  { slug: 'discipline', nom: 'Discipline' },
] as const

export type CoursSlug = typeof COURS[number]['slug']

export function coursNom(slug: string): string {
  return COURS.find(c => c.slug === slug)?.nom ?? slug
}
