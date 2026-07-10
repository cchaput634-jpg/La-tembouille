import { X } from 'lucide-react'
import { typeColor, typeLabel, eventTitle, isEventLate, LATE_COLOR } from '@/data/eventTypes'
import type { CalendarEvent } from '@/lib/types'

interface Props {
  date: string
  events: CalendarEvent[]
  onClose: () => void
}

function frenchDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DayRecap({ date, events, onClose }: Props) {
  const sorted = [...events].sort((a, b) => a.heure.localeCompare(b.heure))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26, 37, 71, 0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded-xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-end pt-2 pr-2">
          <button
            onClick={onClose}
            className="opacity-50 hover:opacity-100"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-1">
          <div className="text-center pb-5 border-b border-[var(--color-ink)]/30 mb-5">
            <div className="text-[11px] tracking-[3px] uppercase opacity-60 mb-1">
              La Tambouille d'Elixir
            </div>
            <h3
              className="text-[26px] italic m-0 leading-tight capitalize"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {frenchDate(date)}
            </h3>
            <div className="text-[12px] opacity-70 mt-1.5">
              {sorted.length} événement{sorted.length > 1 ? 's' : ''} programmé
              {sorted.length > 1 ? 's' : ''}
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="text-[14px] opacity-60 italic text-center py-8">
              Aucun événement.
            </div>
          ) : (
            <ol className="flex flex-col gap-3 list-none p-0 m-0">
              {sorted.map(e => {
                const late = isEventLate(e)
                return (
                  <li
                    key={e.id}
                    className="relative overflow-hidden bg-[var(--color-parchment-soft)] border rounded-md px-4 py-3"
                    style={{
                      borderColor: late ? LATE_COLOR : 'var(--color-parchment-line)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                        <div
                          className="text-[18px] font-bold leading-none"
                          style={{
                            fontFamily: 'var(--font-serif)',
                            color: late ? LATE_COLOR : 'var(--color-ink)',
                          }}
                        >
                          {e.heure.replace(':', 'h')}
                        </div>
                        <span
                          className="mt-1.5 inline-block w-3 h-3 rounded"
                          style={{ backgroundColor: typeColor(e.type) }}
                          title={typeLabel(e.type)}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[16px] break-words leading-snug"
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontWeight: 600,
                            color: late ? LATE_COLOR : undefined,
                          }}
                        >
                          {eventTitle(e)}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] opacity-80">
                          <span>{typeLabel(e.type)}</span>
                          {e.nombre_figurants != null && (
                            <span>
                              · {e.nombre_figurants} figurant
                              {e.nombre_figurants > 1 ? 's' : ''}
                            </span>
                          )}
                          {late && (
                            <span
                              className="uppercase font-semibold tracking-[1px]"
                              style={{ color: LATE_COLOR }}
                            >
                              · Tardif
                            </span>
                          )}
                        </div>
                        {late && e.motif_retard && (
                          <div
                            className="mt-1.5 text-[12px] italic"
                            style={{ color: LATE_COLOR }}
                          >
                            « {e.motif_retard} »
                          </div>
                        )}
                      </div>
                    </div>
                    {late && (
                      <span
                        className="absolute right-0 top-0 bottom-0 w-[5px]"
                        style={{ backgroundColor: typeColor(e.type) }}
                      />
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
