import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { typeColor, eventTitle, isEventLate, LATE_COLOR } from '@/data/eventTypes'
import type { CalendarEvent } from '@/lib/types'
import { EventForm } from './EventForm'
import { EventDetail } from './EventDetail'
import { DayView } from './DayView'
import { ExportView } from './ExportView'

interface Props {
  onOpenFigu: (id: string) => void
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function toISODate(y: number, m: number, d: number): string {
  const mm = String(m + 1).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function firstDayOffset(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function exportDayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function CalendrierView({ onOpenFigu }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [formDate, setFormDate] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [dayViewDate, setDayViewDate] = useState<string | null>(null)
  const [exportDate, setExportDate] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const monthStart = toISODate(year, month, 1)
  const monthEnd = toISODate(year, month, daysInMonth(year, month))

  useEffect(() => {
    setLoading(true)
    api.events
      .listRange(monthStart, monthEnd)
      .then(setEvents)
      .catch(e => alert(`Erreur : ${e.message}`))
      .finally(() => setLoading(false))
  }, [monthStart, monthEnd, refreshKey])

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const e of events) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.heure.localeCompare(b.heure))
    }
    return map
  }, [events])

  const prevMonth = () => {
    if (month === 0) {
      setYear(y => y - 1)
      setMonth(11)
    } else {
      setMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setYear(y => y + 1)
      setMonth(0)
    } else {
      setMonth(m => m + 1)
    }
  }

  const goToday = () => {
    const t = new Date()
    setYear(t.getFullYear())
    setMonth(t.getMonth())
  }

  const offset = firstDayOffset(year, month)
  const nbDays = daysInMonth(year, month)
  const todayISO = toISODate(now.getFullYear(), now.getMonth(), now.getDate())

  const cells: Array<{ iso: string; day: number } | null> = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= nbDays; d++) cells.push({ iso: toISODate(year, month, d), day: d })
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="border border-[var(--color-ink)] rounded p-2 hover:bg-[var(--color-parchment-soft)]"
            title="Mois précédent"
          >
            <ChevronLeft size={18} />
          </button>
          <h2
            className="text-[28px] sm:text-[34px] italic m-0 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="border border-[var(--color-ink)] rounded p-2 hover:bg-[var(--color-parchment-soft)]"
            title="Mois suivant"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          onClick={goToday}
          className="border border-[var(--color-ink)] rounded px-3 py-2 text-[13px] hover:bg-[var(--color-parchment-soft)]"
        >
          Aujourd'hui
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-[11px] uppercase tracking-[1.5px] opacity-60">
        {DAY_LABELS.map(l => (
          <div key={l} className="text-center py-1">{l}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="min-h-[80px] sm:min-h-[110px]" />
          const dayEvents = eventsByDate[cell.iso] ?? []
          const isToday = cell.iso === todayISO
          return (
            <div
              key={i}
              className={`min-h-[80px] sm:min-h-[110px] bg-[var(--color-parchment-soft)] border rounded-md p-1.5 sm:p-2 flex flex-col gap-1 cursor-pointer hover:border-[var(--color-ink)] transition-colors ${
                isToday
                  ? 'border-[var(--color-ink)] border-2'
                  : 'border-[var(--color-parchment-line)]'
              }`}
              onClick={() => setDayViewDate(cell.iso)}
            >
              <div className="flex justify-between items-start">
                <span
                  className="text-[14px] sm:text-[16px]"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: isToday ? 700 : 600,
                  }}
                >
                  {cell.day}
                </span>
                {dayEvents.length === 0 && (
                  <Plus size={12} className="opacity-0 group-hover:opacity-40" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayEvents.map(e => {
                  const label = eventTitle(e)
                  const late = isEventLate(e)
                  return (
                    <button
                      key={e.id}
                      onClick={ev => {
                        ev.stopPropagation()
                        setSelectedEvent(e)
                      }}
                      className="relative text-left text-[11px] sm:text-[12px] pl-1.5 pr-2 py-[3px] rounded text-white truncate hover:opacity-80 overflow-hidden"
                      style={{
                        backgroundColor: late ? LATE_COLOR : typeColor(e.type),
                        fontWeight: 600,
                      }}
                      title={`${e.heure} · ${label}${late ? ' · TARDIF' : ''}`}
                    >
                      <span>{e.heure}</span>{' '}
                      <span className="hidden sm:inline">{label}</span>
                      {late && (
                        <span
                          className="absolute right-0 top-0 bottom-0 w-[6px]"
                          style={{ backgroundColor: typeColor(e.type) }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {loading && (
        <div className="mt-3 text-[12px] opacity-60 italic">Chargement du mois...</div>
      )}

      {dayViewDate && (
        <DayView
          date={dayViewDate}
          events={eventsByDate[dayViewDate] ?? []}
          onClose={() => setDayViewDate(null)}
          onOpenEvent={e => {
            setDayViewDate(null)
            setSelectedEvent(e)
          }}
          onCreateEvent={() => {
            const d = dayViewDate
            setDayViewDate(null)
            setFormDate(d)
          }}
          onExport={() => {
            const d = dayViewDate
            setDayViewDate(null)
            setExportDate(d)
          }}
        />
      )}

      {formDate && (
        <EventForm
          date={formDate}
          onClose={() => setFormDate(null)}
          onSaved={() => {
            setFormDate(null)
            setRefreshKey(k => k + 1)
          }}
        />
      )}

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onChanged={updated => {
            setSelectedEvent(updated)
            setRefreshKey(k => k + 1)
          }}
          onOpenFigu={id => {
            setSelectedEvent(null)
            onOpenFigu(id)
          }}
        />
      )}

      {exportDate && (
        <ExportView
          events={eventsByDate[exportDate] ?? []}
          label={exportDayLabel(exportDate)}
          onClose={() => setExportDate(null)}
          onOpenFigu={id => {
            setExportDate(null)
            onOpenFigu(id)
          }}
        />
      )}
    </div>
  )
}
