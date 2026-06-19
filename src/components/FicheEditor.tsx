import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { coursNom } from '@/data/cours'
import type { Figuration } from '@/lib/types'
import { RichEditor } from './RichEditor'

interface Props {
  mode: 'create' | 'edit'
  cours: string
  fiche?: Figuration
  onCancel: () => void
  onSaved: (saved: Figuration) => void
}

const SECTIONS: Array<{ key: keyof Figuration; label: string }> = [
  { key: 'deroule', label: 'Déroulé de la figuration' },
  { key: 'info_a_savoir', label: 'Info à savoir' },
  { key: 'type_ped', label: 'Type de Ped' },
  { key: 'item_a_demander', label: 'Item à demander' },
  { key: 'lieu', label: 'Lieu' },
  { key: 'autre', label: 'Autre' },
]

export function FicheEditor({ mode, cours, fiche, onCancel, onSaved }: Props) {
  const [titre, setTitre] = useState(fiche?.titre ?? '')
  const [draft, setDraft] = useState<Record<string, string>>({
    deroule: fiche?.deroule ?? '',
    info_a_savoir: fiche?.info_a_savoir ?? '',
    type_ped: fiche?.type_ped ?? '',
    item_a_demander: fiche?.item_a_demander ?? '',
    lieu: fiche?.lieu ?? '',
    autre: fiche?.autre ?? '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!titre.trim()) {
      alert('Le titre est obligatoire.')
      return
    }
    setSaving(true)
    try {
      const saved =
        mode === 'create'
          ? await api.create({ cours, titre: titre.trim(), ...draft })
          : await api.update(fiche!.id, { titre: titre.trim(), ...draft })
      onSaved(saved)
    } catch (e) {
      alert(`Sauvegarde échouée : ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-[12px] tracking-[1px] uppercase opacity-70">
          {coursNom(cours)} ·{' '}
          {mode === 'create' ? 'Nouvelle figuration' : 'Modification'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 border border-[var(--color-ink)] px-3.5 py-2 rounded text-[13px] hover:bg-[var(--color-parchment-soft)]"
          >
            <X size={14} /> Annuler
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 bg-[var(--color-ink)] text-[var(--color-parchment)] px-3.5 py-2 rounded text-[13px] hover:opacity-90 disabled:opacity-50"
          >
            <Check size={14} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={titre}
        onChange={e => setTitre(e.target.value)}
        placeholder="Titre de la figuration"
        autoFocus={mode === 'create'}
        className="w-full bg-transparent border-0 border-b border-[var(--color-ink)]/30 text-[28px] italic mb-5 outline-none focus:border-[var(--color-ink)] pb-1 placeholder:opacity-40"
        style={{ fontFamily: 'var(--font-display)' }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map(s => (
          <section key={s.key as string}>
            <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-2">{s.label}</div>
            <RichEditor
              value={draft[s.key as string]}
              onChange={html => setDraft(prev => ({ ...prev, [s.key as string]: html }))}
            />
          </section>
        ))}
      </div>
    </div>
  )
}
