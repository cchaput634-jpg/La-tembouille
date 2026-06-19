import { useEffect, useState, lazy, Suspense } from 'react'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { coursNom } from '@/data/cours'
import type { Figuration } from '@/lib/types'

const FicheEditor = lazy(() =>
  import('./FicheEditor').then(m => ({ default: m.FicheEditor }))
)

interface Props {
  id: string
  onBack: () => void
  onDeleted: () => void
}

const SECTIONS: Array<{ key: keyof Figuration; label: string }> = [
  { key: 'deroule', label: 'Déroulé de la figuration' },
  { key: 'info_a_savoir', label: 'Info à savoir' },
  { key: 'type_ped', label: 'Type de Ped' },
  { key: 'item_a_demander', label: 'Item à demander' },
  { key: 'lieu', label: 'Lieu' },
  { key: 'autre', label: 'Autre' },
]

export function FicheView({ id, onBack, onDeleted }: Props) {
  const [fiche, setFiche] = useState<Figuration | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get(id)
      .then(setFiche)
      .catch(e => alert(`Erreur : ${e.message}`))
      .finally(() => setLoading(false))
  }, [id])

  const remove = async () => {
    if (!fiche) return
    if (!confirm(`Supprimer la figuration « ${fiche.titre} » ?`)) return
    try {
      await api.remove(fiche.id)
      onDeleted()
    } catch (e) {
      alert(`Suppression échouée : ${(e as Error).message}`)
    }
  }

  if (loading) return <div className="text-[13px] opacity-60 italic">Chargement...</div>
  if (!fiche) return <div className="text-[13px] opacity-60 italic">Fiche introuvable.</div>

  if (editing) {
    return (
      <Suspense fallback={<div className="text-[13px] opacity-60 italic">Chargement de l'éditeur...</div>}>
        <FicheEditor
          mode="edit"
          cours={fiche.cours}
          fiche={fiche}
          onCancel={() => setEditing(false)}
          onSaved={updated => {
            setFiche(updated)
            setEditing(false)
          }}
        />
      </Suspense>
    )
  }

  const dateStr = new Date(fiche.updated_at * 1000).toISOString().slice(0, 10)

  return (
    <div>
      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 border border-[var(--color-ink)] px-3 sm:px-3.5 py-2 rounded text-[13px] hover:bg-[var(--color-parchment-soft)]"
        >
          <ArrowLeft size={14} /> Retour
        </button>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 border border-[var(--color-ink)] px-3 sm:px-3.5 py-2 rounded text-[13px] hover:bg-[var(--color-parchment-soft)]"
        >
          <Pencil size={14} /> Éditer
        </button>
        <button
          onClick={remove}
          className="flex items-center gap-1.5 border border-[var(--color-alert)] text-[var(--color-alert)] px-3 sm:px-3.5 py-2 rounded text-[13px] hover:bg-[var(--color-parchment-soft)]"
        >
          <Trash2 size={14} /> Supprimer
        </button>
      </div>

      <div className="text-[13px] tracking-[1px] uppercase opacity-70 mb-2">
        {coursNom(fiche.cours)}
      </div>
      <h1
        className="text-[30px] sm:text-[40px] italic m-0 mb-7 break-words leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {fiche.titre}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SECTIONS.map(s => (
          <section
            key={s.key as string}
            className="bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded-md px-5 py-4"
          >
            <div className="text-[12px] tracking-[2px] uppercase opacity-70 mb-3">{s.label}</div>
            <div
              className="fiche-content text-[15px]"
              dangerouslySetInnerHTML={{ __html: (fiche[s.key] as string) || '<p class="opacity-50 italic">—</p>' }}
            />
          </section>
        ))}
      </div>

      <div className="mt-7 pt-4 border-t border-[var(--color-ink)]/30 text-[13px] italic opacity-70">
        Dernière modification — {dateStr}
      </div>
    </div>
  )
}
