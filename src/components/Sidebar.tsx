import { COURS } from '@/data/cours'

interface Props {
  active: string
  counts: Record<string, number>
  onSelect: (slug: string) => void
}

export function Sidebar({ active, counts, onSelect }: Props) {
  return (
    <aside>
      <div className="text-[10px] tracking-[2px] uppercase opacity-60 mb-2.5">Les cours</div>
      <nav className="flex flex-col gap-0.5">
        {COURS.map(c => {
          const isActive = c.slug === active
          return (
            <button
              key={c.slug}
              onClick={() => onSelect(c.slug)}
              className={`text-left px-2.5 py-2 text-[13px] rounded-r-[3px] border-l-2 transition-colors ${
                isActive
                  ? 'bg-[var(--color-ink)] text-[var(--color-parchment)] border-l-[var(--color-ink)]'
                  : 'border-l-transparent hover:bg-[var(--color-parchment-soft)]'
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
