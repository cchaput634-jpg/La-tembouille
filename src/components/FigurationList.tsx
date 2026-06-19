import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Trash2, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { coursNom } from '@/data/cours'
import type { FigurationSummary } from '@/lib/types'

interface Props {
  cours: string
  onOpen: (id: string) => void
  onCreate: () => void
  refreshKey: number
  onChanged: () => void
}

export function FigurationList({ cours, onOpen, onCreate, refreshKey, onChanged }: Props) {
  const [items, setItems] = useState<FigurationSummary[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .listByCours(cours)
      .then(setItems)
      .catch(e => alert(`Erreur de chargement : ${e.message}`))
      .finally(() => setLoading(false))
  }, [cours, refreshKey])

  const filtered = useMemo(
    () => items.filter(i => i.titre.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const remove = async (id: string, titre: string) => {
    if (!confirm(`Supprimer la figuration « ${titre} » ?`)) return
    try {
      await api.remove(id)
      setItems(prev => prev.filter(i => i.id !== id))
      onChanged()
    } catch (e) {
      alert(`Suppression échouée : ${(e as Error).message}`)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h2 className="text-[28px] sm:text-[34px] italic m-0 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {coursNom(cours)}
        </h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-1.5 bg-[var(--color-ink)] text-[var(--color-parchment)] px-4 py-2.5 rounded text-[14px] hover:opacity-90"
        >
          <Plus size={16} /> Nouvelle figuration
        </button>
      </div>

      <div className="relative mb-5">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
        />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher une figuration..."
          className="w-full bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded px-3 py-2.5 pl-10 text-[15px] outline-none focus:border-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-serif)' }}
        />
      </div>

      {loading ? (
        <div className="text-[14px] opacity-60 italic">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-[14px] opacity-60 italic py-8 text-center">
          {items.length === 0
            ? 'Aucune figuration dans ce cours. Créez-en une.'
            : 'Aucun résultat pour cette recherche.'}
        </div>
      ) : (
        <ul className="flex flex-col gap-2 list-none p-0 m-0">
          {filtered.map(f => (
            <li
              key={f.id}
              onClick={() => onOpen(f.id)}
              className="bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded-md px-4 py-3.5 flex justify-between items-center cursor-pointer hover:border-[var(--color-ink)] transition-colors"
            >
              <div className="text-[18px] italic" style={{ fontFamily: 'var(--font-display)' }}>
                {f.titre}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    remove(f.id, f.titre)
                  }}
                  className="opacity-50 hover:opacity-100 hover:text-[var(--color-alert)]"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight size={18} className="opacity-40" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
