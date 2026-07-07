import { X, Plus, FileDown, Users } from 'lucide-react'
import { typeColor, eventTitle, isEventLate, LATE_COLOR } from '@/data/eventTypes'
import type { CalendarEvent } from '@/lib/types'

interface Props {
  date: string
  events: CalendarEvent[]
  onClose: () => void
  onOpenEvent: (event: CalendarEvent) => void
  onCreateEvent: () => void
  onExportTP: () => void
  onExportFigu: () => void
}

const EXPORT_TP_TYPES = new Set(['mapping_only', 'tp_figuration'])
const EXPORT_FIGU_TYPES = new Set(['figuration_only', 'tp_figuration'])

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

export function DayView({
  date,
  events,
  onClose,
  onOpenEvent,
  onCreateEvent,
  onExportTP,
  onExportFigu,
}: Props) {
  const hasExportTP = events.some(
    e => EXPORT_TP_TYPES.has(e.type) && e.figuration_id && e.figuration_titre
  )
  const hasExportFigu = events.some(e => EXPORT_FIGU_TYPES.has(e.type))

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
            {events.map(e => {
              const late = isEventLate(e)
              return (
                <li
                  key={e.id}
                  onClick={() => onOpenEvent(e)}
                  className="relative overflow-hidden bg-[var(--color-parchment-soft)] border rounded-md px-3.5 py-3 cursor-pointer transition-colors"
                  style={{
                    borderColor: late ? LATE_COLOR : 'var(--color-parchment-line)',
                    color: late ? LATE_COLOR : undefined,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="inline-block w-3.5 h-3.5 rounded flex-shrink-0 mt-[6px]"
                      style={{ backgroundColor: late ? LATE_COLOR : typeColor(e.type) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold tracking-[1px] opacity-70">
                        {e.heure.replace(':', 'h')}
                        {late && <span className="ml-2 uppercase">· Tardif</span>}
                      </div>
                      <div
                        className="text-[16px] break-words leading-snug mt-1"
                        style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
                      >
                        {eventTitle(e)}
                      </div>
                      {e.nombre_figurants != null && (
                        <div className="text-[13px] opacity-80 mt-1" style={{ fontWeight: 500 }}>
                          {e.nombre_figurants} figurant{e.nombre_figurants > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  {late && (
                    <span
                      className="absolute right-0 top-0 bottom-0 w-[6px]"
                      style={{ backgroundColor: typeColor(e.type) }}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={onCreateEvent}
            className="flex items-center justify-center gap-1.5 bg-[var(--color-ink)] text-[var(--color-parchment)] px-3.5 py-2.5 rounded text-[13px] hover:opacity-90"
          >
            <Plus size={14} /> Nouvel événement
          </button>
          {(hasExportTP || hasExportFigu) && (
            <div className="flex flex-col sm:flex-row gap-2">
              {hasExportTP && (
                <button
                  onClick={onExportTP}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-ink)] text-[var(--color-ink)] px-3.5 py-2.5 rounded text-[13px] hover:bg-[var(--color-parchment-soft)]"
                >
                  <FileDown size={14} /> Export TP
                </button>
              )}
              {hasExportFigu && (
                <button
                  onClick={onExportFigu}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-ink)] text-[var(--color-ink)] px-3.5 py-2.5 rounded text-[13px] hover:bg-[var(--color-parchment-soft)]"
                >
                  <Users size={14} /> Export Figu
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
