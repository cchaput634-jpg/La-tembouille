import { X, Plus } from 'lucide-react'
import { typeColor, eventTitle } from '@/data/eventTypes'
import type { CalendarEvent } from '@/lib/types'

interface Props {
  date: string
  events: CalendarEvent[]
  onClose: () => void
  onOpenEvent: (event: CalendarEvent) => void
  onCreateEvent: () => void
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

export function DayView({ date, events, onClose, onOpenEvent, onCreateEvent }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26, 37, 71, 0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded-xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-[var(--color-ink)]/30">
          <h3
            className="text-[22px] italic m-0 leading-tight capitalize break-words"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {frenchDate(date)}
          </h3>
          <button
            onClick={onClose}
            className="opacity-60 hover:opacity-100 ml-2 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-[13px] opacity-60 italic py-6 text-center">
            Aucun événement ce jour.
          </div>
        ) : (
          <ul className="flex flex-col gap-2 list-none p-0 m-0 mb-4">
            {events.map(e => (
              <li
                key={e.id}
                onClick={() => onOpenEvent(e)}
                className="bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] hover:border-[var(--color-ink)] rounded-md px-3.5 py-3 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="inline-block w-3.5 h-3.5 rounded flex-shrink-0 mt-[6px]"
                    style={{ backgroundColor: typeColor(e.type) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold tracking-[1px] opacity-70">
                      {e.heure.replace(':', 'h')}
                    </div>
                    <div
                      className="text-[16px] italic break-words leading-tight mt-0.5"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {eventTitle(e)}
                    </div>
                    {e.nombre_figurants != null && (
                      <div className="text-[12px] opacity-70 mt-1">
                        {e.nombre_figurants} figurant{e.nombre_figurants > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onCreateEvent}
          className="w-full flex items-center justify-center gap-1.5 bg-[var(--color-ink)] text-[var(--color-parchment)] px-3.5 py-2.5 rounded text-[13px] hover:opacity-90"
        >
          <Plus size={14} /> Nouvel événement
        </button>
      </div>
    </div>
  )
}
