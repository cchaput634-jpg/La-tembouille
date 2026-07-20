import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, FileDown } from 'lucide-react'
import { api } from '@/lib/api'
import { usePolling } from '@/lib/usePolling'
import { coursNom, COURS } from '@/data/cours'
import type { CalendarEvent } from '@/lib/types'
import { PieChart, PieLegend } from './PieChart'

type Mode = 'mois' | 'semaine'

const CHART_PALETTE = [
  '#3D5A80', '#C87B2A', '#6B4C93', '#4A7C43',
  '#B85A46', '#5C7C99', '#A8814A', '#A24E7C',
  '#3E8A94', '#7C8A3D', '#A0533F', '#1A2547',
]

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const FIGU_TYPES = new Set(['figuration_only', 'tp_figuration'])

function iso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function frenchDayLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length]
}

export function ExportFiguPerm() {
  const [mode, setMode] = useState<Mode>('mois')
  const [focus, setFocus] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const { rangeStart, rangeEnd, label } = useMemo(() => {
    if (mode === 'mois') {
      const start = new Date(focus.getFullYear(), focus.getMonth(), 1)
      const end = new Date(focus.getFullYear(), focus.getMonth() + 1, 0)
      return {
        rangeStart: iso(start),
        rangeEnd: iso(end),
        label: `${MONTH_NAMES[focus.getMonth()]} ${focus.getFullYear()}`,
      }
    }
    const start = startOfWeekMonday(focus)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const sameMonth = start.getMonth() === end.getMonth()
    const startMonth = MONTH_NAMES[start.getMonth()].toLowerCase()
    const endMonth = MONTH_NAMES[end.getMonth()].toLowerCase()
    const lbl = sameMonth
      ? `${start.getDate()} — ${end.getDate()} ${endMonth} ${end.getFullYear()}`
      : `${start.getDate()} ${startMonth} — ${end.getDate()} ${endMonth} ${end.getFullYear()}`
    return { rangeStart: iso(start), rangeEnd: iso(end), label: lbl }
  }, [mode, focus])

  useEffect(() => {
    setLoading(true)
    api.events
      .listRange(rangeStart, rangeEnd)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [rangeStart, rangeEnd])

  usePolling(() => {
    api.events
      .listRange(rangeStart, rangeEnd)
      .then(setEvents)
      .catch(() => {})
  }, 20000)

  const figuEvents = useMemo(
    () => events.filter(e => FIGU_TYPES.has(e.type)),
    [events]
  )

  const byDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const e of figuEvents) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.heure.localeCompare(b.heure))
    }
    return map
  }, [figuEvents])

  const sortedDays = useMemo(() => Object.keys(byDay).sort(), [byDay])

  const matiereChart = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of figuEvents) {
      const n = e.nombre_figurants ?? 0
      counts[e.cours] = (counts[e.cours] ?? 0) + n
    }
    return COURS
      .filter(c => (counts[c.slug] ?? 0) > 0)
      .map((c, i) => ({
        label: c.nom,
        value: counts[c.slug],
        color: paletteColor(i),
      }))
  }, [figuEvents])

  const permChart = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of figuEvents) {
      if (e.gerant_figuration) counts[e.gerant_figuration] = (counts[e.gerant_figuration] ?? 0) + 1
      if (e.accompagnateur) counts[e.accompagnateur] = (counts[e.accompagnateur] ?? 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label,
        value,
        color: paletteColor(i),
      }))
  }, [figuEvents])

  const goPrev = () => {
    if (mode === 'mois') {
      const d = new Date(focus.getFullYear(), focus.getMonth() - 1, 1)
      setFocus(d)
    } else {
      const d = new Date(focus)
      d.setDate(d.getDate() - 7)
      setFocus(d)
    }
  }

  const goNext = () => {
    if (mode === 'mois') {
      const d = new Date(focus.getFullYear(), focus.getMonth() + 1, 1)
      setFocus(d)
    } else {
      const d = new Date(focus)
      d.setDate(d.getDate() + 7)
      setFocus(d)
    }
  }

  const goToday = () => setFocus(new Date())

  return (
    <section className="bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded-md px-5 py-5 md:px-6 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <FileDown size={18} />
        <h2
          className="text-[22px] sm:text-[26px] italic m-0 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Export
        </h2>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 mb-5">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          <button
            onClick={goPrev}
            className="border border-[var(--color-ink)] rounded p-1.5 sm:p-2 hover:bg-[var(--color-parchment)] flex-shrink-0"
            title={mode === 'mois' ? 'Mois précédent' : 'Semaine précédente'}
          >
            <ChevronLeft size={16} />
          </button>
          <div
            className="text-[16px] sm:text-[20px] italic leading-tight capitalize truncate"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {label}
          </div>
          <button
            onClick={goNext}
            className="border border-[var(--color-ink)] rounded p-1.5 sm:p-2 hover:bg-[var(--color-parchment)] flex-shrink-0"
            title={mode === 'mois' ? 'Mois suivant' : 'Semaine suivante'}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="inline-flex border border-[var(--color-ink)] rounded overflow-hidden">
            <button
              onClick={() => setMode('mois')}
              className={`px-2.5 py-1.5 text-[12px] transition-colors ${
                mode === 'mois'
                  ? 'bg-[var(--color-ink)] text-[var(--color-parchment)]'
                  : 'hover:bg-[var(--color-parchment)]'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setMode('semaine')}
              className={`px-2.5 py-1.5 text-[12px] transition-colors border-l border-[var(--color-ink)] ${
                mode === 'semaine'
                  ? 'bg-[var(--color-ink)] text-[var(--color-parchment)]'
                  : 'hover:bg-[var(--color-parchment)]'
              }`}
            >
              Semaine
            </button>
          </div>
          <button
            onClick={goToday}
            className="border border-[var(--color-ink)] rounded px-2.5 py-1.5 text-[12px] hover:bg-[var(--color-parchment)]"
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-2">
          Historique par jour
        </div>
        {loading ? (
          <div className="text-[13px] opacity-60 italic">Chargement...</div>
        ) : figuEvents.length === 0 ? (
          <div className="text-[13px] opacity-60 italic py-4 text-center">
            Aucune figuration sur cette période.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedDays.map(day => (
              <div key={day}>
                <div
                  className="text-[14px] mb-1.5 capitalize"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
                >
                  {frenchDayLabel(day)}
                </div>
                <ul className="flex flex-col gap-1 list-none p-0 m-0">
                  {byDay[day].map(e => (
                    <li
                      key={e.id}
                      className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[13px] flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
                    >
                      <span
                        className="font-semibold tabular-nums whitespace-nowrap"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {e.heure.replace(':', 'h')}
                      </span>
                      <span
                        style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
                      >
                        {coursNom(e.cours)}
                      </span>
                      <span className="opacity-80">
                        Gérant : {e.gerant_figuration || <em className="opacity-60">—</em>}
                      </span>
                      {e.accompagnateur && (
                        <span className="opacity-80">Acc. : {e.accompagnateur}</span>
                      )}
                      {e.nombre_figurants != null && (
                        <span className="opacity-70 tabular-nums">
                          · {e.nombre_figurants} figurant{e.nombre_figurants > 1 ? 's' : ''}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[var(--color-parchment-line)]">
        <div>
          <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-3">
            Figurants demandés par matière
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="flex-shrink-0">
              <PieChart data={matiereChart} size={160} />
            </div>
            <div className="flex-1 min-w-0 w-full">
              {matiereChart.length === 0 ? (
                <div className="text-[12px] italic opacity-60">Aucune donnée.</div>
              ) : (
                <PieLegend data={matiereChart} />
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-3">
            Participations des figurants perm
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="flex-shrink-0">
              <PieChart data={permChart} size={160} />
            </div>
            <div className="flex-1 min-w-0 w-full">
              {permChart.length === 0 ? (
                <div className="text-[12px] italic opacity-60">Aucune donnée.</div>
              ) : (
                <PieLegend data={permChart} />
              )}
            </div>
          </div>
          <div className="text-[11px] opacity-60 italic mt-2">
            Une participation = être gérant ou accompagnateur d'un événement figuration.
          </div>
        </div>
      </div>
    </section>
  )
}
