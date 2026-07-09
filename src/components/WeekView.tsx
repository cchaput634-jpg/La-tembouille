import { useMemo } from 'react'
import { typeColor, eventTitle, isEventLate, LATE_COLOR } from '@/data/eventTypes'
import type { CalendarEvent } from '@/lib/types'

interface Props {
  weekStart: Date
  eventsByDate: Record<string, CalendarEvent[]>
  todayISO: string
  onCellClick: (iso: string) => void
  onEventClick: (event: CalendarEvent) => void
}

const DAY_LABELS_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const DAY_LABELS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_ABBR = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
]

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function WeekView({
  weekStart,
  eventsByDate,
  todayISO,
  onCellClick,
  onEventClick,
}: Props) {
  const days = useMemo(() => {
    const arr: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      arr.push(d)
    }
    return arr
  }, [weekStart])

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-1.5">
      {days.map((d, idx) => {
        const iso = toISO(d)
        const dayEvents = eventsByDate[iso] ?? []
        const isToday = iso === todayISO
        const showMonth = idx === 0 || d.getDate() === 1

        return (
          <div
            key={iso}
            onClick={() => onCellClick(iso)}
            className={`bg-[var(--color-parchment-soft)] border rounded-md p-2.5 min-h-[110px] md:min-h-[360px] cursor-pointer hover:border-[var(--color-ink)] transition-colors flex flex-col ${
              isToday
                ? 'border-[var(--color-ink)] border-2'
                : 'border-[var(--color-parchment-line)]'
            }`}
          >
            <div className="flex md:flex-col md:items-start items-baseline justify-between md:justify-start gap-1 mb-2 pb-2 border-b border-[var(--color-parchment-line)]">
              <div className="text-[11px] uppercase tracking-[1.5px] opacity-70">
                <span className="hidden md:inline">{DAY_LABELS_SHORT[idx]}</span>
                <span className="md:hidden">{DAY_LABELS_FULL[idx]}</span>
              </div>
              <div
                className="text-[18px] md:text-[20px] leading-none"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: isToday ? 700 : 600,
                }}
              >
                {d.getDate()}
                {showMonth && (
                  <span className="opacity-70 text-[14px] ml-1">{MONTH_ABBR[d.getMonth()]}</span>
                )}
              </div>
            </div>

            {dayEvents.length === 0 ? (
              <div className="text-[11px] opacity-40 italic md:mt-auto text-center py-1">
                —
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {dayEvents.map(e => {
                  const late = isEventLate(e)
                  return (
                    <button
                      key={e.id}
                      onClick={ev => {
                        ev.stopPropagation()
                        onEventClick(e)
                      }}
                      className="relative text-left px-2 py-1.5 rounded text-white overflow-hidden hover:opacity-90"
                      style={{ backgroundColor: late ? LATE_COLOR : typeColor(e.type) }}
                    >
                      <div className="text-[12px] font-semibold leading-tight">
                        {e.heure.replace(':', 'h')}
                      </div>
                      <div className="text-[11px] leading-snug mt-0.5 opacity-95 break-words">
                        {eventTitle(e)}
                      </div>
                      {late && (
                        <span
                          className="absolute right-0 top-0 bottom-0 w-[5px]"
                          style={{ backgroundColor: typeColor(e.type) }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
