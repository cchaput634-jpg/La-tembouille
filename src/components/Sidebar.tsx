import { COURS } from '@/data/cours'

interface Props {
  active: string
  counts: Record<string, number>
  onSelect: (slug: string) => void
}

export function Sidebar({ active, counts, onSelect }: Props) {
  return (
    <aside>
      <div className="hidden md:block text-[10px] tracking-[2px] uppercase opacity-60 mb-2.5">
        Les cours
      </div>
      <nav className="flex md:flex-col gap-1 md:gap-0.5 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-1.5 md:pb-0 border-b md:border-b-0 border-[var(--color-parchment-line)] md:border-0">
        {COURS.map(c => {
          const isActive = c.slug === active
          return (
            <button
              key={c.slug}
              onClick={() => onSelect(c.slug)}
              className={`flex-shrink-0 md:flex-shrink whitespace-nowrap text-left px-2.5 py-2 text-[13px] rounded md:rounded-r-[3px] md:rounded-l-none border md:border-0 md:border-l-2 transition-colors ${
                isActive
                  ? 'bg-[var(--color-ink)] text-[var(--color-parchment)] border-[var(--color-ink)] md:border-l-[var(--color-ink)]'
                  : 'border-[var(--color-parchment-line)] md:border-l-transparent hover:bg-[var(--color-parchment-soft)]'
              }`}
            >
              {c.nom}
              <span className={`text-[11px] ml-1 ${isActive ? 'opacity-70' : 'opacity-50'}`}>
                · {counts[c.slug] ?? 0}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
