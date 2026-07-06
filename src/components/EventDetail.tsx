import { useEffect, useState } from 'react'
import { X, Trash2, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { coursNom } from '@/data/cours'
import { typeColor, typeLabel } from '@/data/eventTypes'
import type { CalendarEvent, Figuration } from '@/lib/types'

interface Props {
  event: CalendarEvent
  onClose: () => void
  onDeleted: () => void
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

export function EventDetail({ event, onClose, onDeleted, onOpenFigu }: Props) {
  const [figu, setFigu] = useState<Figuration | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!event.figuration_id) return
    api
      .get(event.figuration_id)
      .then(setFigu)
      .catch(() => setFigu(null))
  }, [event.figuration_id])

  const remove = async () => {
    if (!confirm('Supprimer cet événement ?')) return
    setDeleting(true)
    try {
      await api.events.remove(event.id)
      onDeleted()
    } catch (e) {
      alert(`Suppression échouée : ${(e as Error).message}`)
      setDeleting(false)
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
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-[var(--color-ink)]/30">
          <div className="flex-1 min-w-0">
            <div className="text-[12px] tracking-[1.5px] uppercase opacity-70 mb-1">
              {frenchDate(event.date)} · {event.heure.replace(':', 'h')}
            </div>
            <h3
              className="text-[24px] italic m-0 leading-tight break-words"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {coursNom(event.cours)}
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

          <div>
            <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-1">
              Figuration associée
            </div>
            {event.figuration_id ? (
              figu ? (
                <button
                  onClick={() => onOpenFigu(event.figuration_id!)}
                  className="w-full flex items-center justify-between gap-2 bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] hover:border-[var(--color-ink)] rounded px-3 py-2.5 text-left transition-colors"
                >
                  <span
                    className="text-[15px] italic"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {figu.titre}
                  </span>
                  <BookOpen size={16} className="opacity-60 flex-shrink-0" />
                </button>
              ) : (
                <div className="text-[13px] opacity-60 italic">Chargement...</div>
              )
            ) : (
              <div className="text-[13px] opacity-60 italic">Aucune</div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-ink)]/30 mt-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 border border-[var(--color-ink)] px-3.5 py-2 rounded text-[13px] hover:bg-[var(--color-parchment-soft)]"
            >
              <X size={14} /> Fermer
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
