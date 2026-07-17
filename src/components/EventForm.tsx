import { useEffect, useMemo, useState } from 'react'
import { X, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { COURS } from '@/data/cours'
import { EVENT_TYPES, willBeLate } from '@/data/eventTypes'
import type {
  EventHeure,
  EventType,
  FigurationSummary,
  CalendarEvent,
} from '@/lib/types'

interface Props {
  date?: string
  event?: CalendarEvent
  onClose: () => void
  onSaved: (event: CalendarEvent) => void
}

const NEEDS_FIGURANTS = (t: EventType) => t === 'figuration_only' || t === 'tp_figuration'

export function EventForm({ date, event, onClose, onSaved }: Props) {
  const isEdit = !!event
  const [dateVal, setDateVal] = useState(event?.date ?? date ?? '')
  const [heure, setHeure] = useState<EventHeure>(event?.heure ?? '21:00')
  const [cours, setCours] = useState<string>(event?.cours ?? COURS[0].slug)
  const [professeur, setProfesseur] = useState<string>(event?.professeur ?? '')
  const [nbFigurants, setNbFigurants] = useState<string>(
    event?.nombre_figurants != null ? String(event.nombre_figurants) : ''
  )
  const [figurationId, setFigurationId] = useState<string>(event?.figuration_id ?? '')
  const [type, setType] = useState<EventType>(event?.type ?? 'mapping_only')
  const [staffOnly, setStaffOnly] = useState<boolean>(event?.staff_only === 1)
  const [emplacementDepart, setEmplacementDepart] = useState<string>(event?.emplacement_depart ?? '')
  const [motifRetard, setMotifRetard] = useState<string>(event?.motif_retard ?? '')
  const [figurations, setFigurations] = useState<FigurationSummary[]>([])
  const [saving, setSaving] = useState(false)

  const isLate = useMemo(() => willBeLate(dateVal, heure), [dateVal, heure])

  useEffect(() => {
    api
      .listByCours(cours)
      .then(setFigurations)
      .catch(() => setFigurations([]))
    if (event && cours === event.cours) return
    setFigurationId('')
  }, [cours, event])

  const save = async () => {
    if (!figurationId) {
      alert('Une figuration associée est obligatoire.')
      return
    }
    if (isLate && !motifRetard.trim()) {
      alert('Motif du retard requis pour un événement à moins de 48h.')
      return
    }
    setSaving(true)
    const payload = {
      date: dateVal,
      heure,
      cours,
      professeur: professeur.trim(),
      nombre_figurants: NEEDS_FIGURANTS(type) && nbFigurants ? Number(nbFigurants) : null,
      figuration_id: figurationId || null,
      type,
      staff_only: NEEDS_FIGURANTS(type) && staffOnly ? 1 : 0,
      emplacement_depart: emplacementDepart.trim(),
      motif_retard: isLate ? motifRetard.trim() : event?.motif_retard ?? null,
    }
    try {
      const saved = isEdit
        ? await api.events.update(event!.id, payload)
        : await api.events.create(payload)
      onSaved(saved)
    } catch (e) {
      alert(`Sauvegarde échouée : ${(e as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26, 37, 71, 0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--color-ink)]/30">
          <h3 className="text-[22px] italic m-0" style={{ fontFamily: 'var(--font-display)' }}>
            {isEdit ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h3>
          <button onClick={onClose} className="opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] tracking-[2px] uppercase opacity-70 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={dateVal}
              onChange={e => setDateVal(e.target.value)}
              className="w-full bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase opacity-70 mb-1.5">
              Heure
            </label>
            <div className="flex gap-2">
              {(['21:00', '21:45'] as EventHeure[]).map(h => (
                <button
                  key={h}
                  onClick={() => setHeure(h)}
                  className={`flex-1 px-3 py-2 rounded border text-[14px] transition-colors ${
                    heure === h
                      ? 'bg-[var(--color-ink)] text-[var(--color-parchment)] border-[var(--color-ink)]'
                      : 'border-[var(--color-parchment-line)] hover:border-[var(--color-ink)]'
                  }`}
                >
                  {h.replace(':', 'h')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase opacity-70 mb-1.5">
              Matière
            </label>
            <select
              value={cours}
              onChange={e => setCours(e.target.value)}
              className="w-full bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {COURS.map(c => (
                <option key={c.slug} value={c.slug}>{c.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase opacity-70 mb-1.5">
              Professeur
            </label>
            <input
              type="text"
              value={professeur}
              onChange={e => setProfesseur(e.target.value)}
              placeholder="Nom du professeur"
              className="w-full bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase opacity-70 mb-1.5">
              Emplacement de départ
            </label>
            <input
              type="text"
              value={emplacementDepart}
              onChange={e => setEmplacementDepart(e.target.value)}
              placeholder="Lieu de départ (RDV, coordonnées, salle...)"
              className="w-full bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase opacity-70 mb-1.5">
              Figuration associée <span className="opacity-70 normal-case tracking-normal">— requise</span>
            </label>
            <select
              value={figurationId}
              onChange={e => setFigurationId(e.target.value)}
              className="w-full bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              <option value="">— Sélectionner une figuration —</option>
              {figurations.map(f => (
                <option key={f.id} value={f.id}>{f.titre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase opacity-70 mb-1.5">
              Type
            </label>
            <div className="flex flex-col gap-1.5">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-3 px-3 py-2 rounded border text-[14px] text-left transition-colors ${
                    type === t.value
                      ? 'border-[var(--color-ink)]'
                      : 'border-[var(--color-parchment-line)] hover:border-[var(--color-ink)]'
                  }`}
                >
                  <span
                    className="inline-block w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {NEEDS_FIGURANTS(type) && (
            <>
              <div>
                <label className="block text-[11px] tracking-[2px] uppercase opacity-70 mb-1.5">
                  Nombre de figurants
                </label>
                <input
                  type="number"
                  min="0"
                  value={nbFigurants}
                  onChange={e => setNbFigurants(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={staffOnly}
                  onChange={e => setStaffOnly(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-ink)]"
                />
                <span className="text-[14px]" style={{ fontFamily: 'var(--font-serif)' }}>
                  Staff only
                </span>
              </label>
            </>
          )}

          {isLate && (
            <div className="border border-[var(--color-alert)] rounded-md p-3.5 bg-[var(--color-alert)]/5">
              <label
                className="block text-[11px] tracking-[2px] uppercase mb-1.5 font-semibold"
                style={{ color: 'var(--color-alert)' }}
              >
                Motif du retard <span className="opacity-70">— requis (&lt; 48 h)</span>
              </label>
              <textarea
                value={motifRetard}
                onChange={e => setMotifRetard(e.target.value)}
                placeholder="Pourquoi cette demande arrive-t-elle à moins de 48 h ?"
                rows={2}
                className="w-full bg-[var(--color-parchment-soft)] border border-[var(--color-alert)] rounded px-3 py-2 text-[14px] focus:outline-none resize-y"
                style={{ fontFamily: 'var(--font-serif)' }}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-ink)]/30 mt-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 border border-[var(--color-ink)] px-3.5 py-2 rounded text-[13px] hover:bg-[var(--color-parchment-soft)]"
            >
              <X size={14} /> Annuler
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[var(--color-ink)] text-[var(--color-parchment)] px-3.5 py-2 rounded text-[13px] hover:opacity-90 disabled:opacity-50"
            >
              <Check size={14} /> {saving ? 'Sauvegarde...' : isEdit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
