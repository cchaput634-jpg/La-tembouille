import { useEffect, useState } from 'react'
import { X, Trash2, BookOpen, Pencil } from 'lucide-react'
import { api } from '@/lib/api'
import { typeColor, typeLabel, eventTitle, isEventLate, LATE_COLOR } from '@/data/eventTypes'
import type { CalendarEvent, FigurantPerm } from '@/lib/types'
import { EventForm } from './EventForm'

interface Props {
  event: CalendarEvent
  onClose: () => void
  onChanged: (updated: CalendarEvent | null) => void
  onOpenFigu: (id: string) => void
}

function frenchDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function EventDetail({ event, onClose, onChanged, onOpenFigu }: Props) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [figurants, setFigurants] = useState<FigurantPerm[]>([])
  const [savingGerant, setSavingGerant] = useState(false)

  useEffect(() => {
    api.figurants
      .list()
      .then(setFigurants)
      .catch(() => setFigurants([]))
  }, [])

  const changeGerant = async (nom: string) => {
    const previous = event.gerant_figuration
    onChanged({ ...event, gerant_figuration: nom })
    setSavingGerant(true)
    try {
      const updated = await api.events.update(event.id, { gerant_figuration: nom })
      onChanged(updated)
    } catch (e) {
      onChanged({ ...event, gerant_figuration: previous })
      alert(`Sauvegarde échouée : ${(e as Error).message}`)
    } finally {
      setSavingGerant(false)
    }
  }

  const remove = async () => {
    if (!confirm('Supprimer cet événement ?')) return
    setDeleting(true)
    try {
      await api.events.remove(event.id)
      onChanged(null)
    } catch (e) {
      alert(`Suppression échouée : ${(e as Error).message}`)
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <EventForm
        event={event}
        onClose={() => setEditing(false)}
        onSaved={updated => {
          setEditing(false)
          onChanged(updated)
        }}
      />
    )
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
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-[var(--color-ink)]/30">
          <div className="flex-1 min-w-0">
            <div className="text-[12px] tracking-[1.5px] uppercase opacity-70 mb-1">
              {frenchDate(event.date)} · {event.heure.replace(':', 'h')}
            </div>
            <h3
              className="text-[24px] italic m-0 leading-tight break-words"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {eventTitle(event)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="opacity-60 hover:opacity-100 ml-2 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-block w-3.5 h-3.5 rounded flex-shrink-0"
              style={{ backgroundColor: typeColor(event.type) }}
            />
            <span className="text-[14px]">{typeLabel(event.type)}</span>
          </div>

          {event.professeur && (
            <div>
              <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-1">
                Professeur
              </div>
              <div className="text-[15px]">{event.professeur}</div>
            </div>
          )}

          {event.emplacement_depart && (
            <div>
              <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-1">
                Emplacement de départ
              </div>
              <div className="text-[15px]">{event.emplacement_depart}</div>
            </div>
          )}

          {event.nombre_figurants != null && (
            <div>
              <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-1">
                Nombre de figurants
              </div>
              <div className="text-[15px]">
                {event.nombre_figurants}
                {event.staff_only === 1 && (
                  <span
                    className="ml-2 inline-block px-2 py-[2px] rounded text-[11px] uppercase tracking-[1.5px]"
                    style={{
                      backgroundColor: 'var(--color-ink)',
                      color: 'var(--color-parchment)',
                      fontWeight: 600,
                    }}
                  >
                    Staff only
                  </span>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-1">
              Gérant
            </div>
            <select
              value={event.gerant_figuration}
              onChange={e => changeGerant(e.target.value)}
              disabled={savingGerant}
              className="w-full bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)] disabled:opacity-60"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              <option value="">— Aucun —</option>
              {figurants.map(f => (
                <option key={f.id} value={f.nom}>
                  {f.nom}
                </option>
              ))}
              {event.gerant_figuration &&
                !figurants.some(f => f.nom === event.gerant_figuration) && (
                  <option value={event.gerant_figuration}>
                    {event.gerant_figuration} (ancien)
                  </option>
                )}
            </select>
          </div>

          {isEventLate(event) && (
            <div className="border rounded-md p-3.5" style={{ borderColor: LATE_COLOR }}>
              <div
                className="text-[11px] tracking-[2px] uppercase mb-1 font-semibold"
                style={{ color: LATE_COLOR }}
              >
                Motif du retard <span className="opacity-70">— demande &lt; 48 h</span>
              </div>
              <div className="text-[15px]" style={{ color: LATE_COLOR }}>
                {event.motif_retard}
              </div>
            </div>
          )}

          <div>
            <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-1">
              Figuration associée
            </div>
            {event.figuration_id && event.figuration_titre ? (
              <button
                onClick={() => onOpenFigu(event.figuration_id!)}
                className="w-full flex items-center justify-between gap-2 bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] hover:border-[var(--color-ink)] rounded px-3 py-2.5 text-left transition-colors"
              >
                <span
                  className="text-[15px] italic"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {event.figuration_titre}
                </span>
                <BookOpen size={16} className="opacity-60 flex-shrink-0" />
              </button>
            ) : (
              <div className="text-[13px] opacity-60 italic">Aucune</div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-[var(--color-ink)]/30 mt-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 border border-[var(--color-ink)] px-3.5 py-2 rounded text-[13px] hover:bg-[var(--color-parchment-soft)]"
            >
              <X size={14} /> Fermer
            </button>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 border border-[var(--color-ink)] px-3.5 py-2 rounded text-[13px] hover:bg-[var(--color-parchment-soft)]"
            >
              <Pencil size={14} /> Modifier
            </button>
            <button
              onClick={remove}
              disabled={deleting}
              className="flex items-center gap-1.5 border border-[var(--color-alert)] text-[var(--color-alert)] px-3.5 py-2 rounded text-[13px] hover:bg-[var(--color-parchment-soft)] disabled:opacity-50"
            >
              <Trash2 size={14} /> {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
