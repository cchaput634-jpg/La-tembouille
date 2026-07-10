import { X } from 'lucide-react'
import { typeColor, isEventLate, LATE_COLOR } from '@/data/eventTypes'
import { coursNom } from '@/data/cours'
import type { CalendarEvent, EventType } from '@/lib/types'

interface Props {
  date: string
  events: CalendarEvent[]
  onClose: () => void
}

const WEEKDAYS = [
  'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi',
]

const MONTHS_SHORT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
]

function shortHeader(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${WEEKDAYS[date.getDay()]} ${d} ${MONTHS_SHORT[m - 1]} ${y}`
}

function endTime(start: string): string {
  const [h, m] = start.split(':').map(Number)
  const total = h * 60 + m + 30
  const endH = Math.floor(total / 60) % 24
  const endM = total % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

function slashTitle(e: CalendarEvent): string {
  const parts: string[] = [coursNom(e.cours)]
  if (e.figuration_titre) parts.push(e.figuration_titre)
  if (e.professeur) parts.push(e.professeur)
  if (e.gerant_figuration) parts.push(e.gerant_figuration)
  return parts.join(' / ')
}

function metaLabel(e: CalendarEvent): string {
  const n = e.nombre_figurants
  switch (e.type as EventType) {
    case 'mapping_only':
      return 'Mapping Only'
    case 'figuration_only':
      return n != null
        ? `${n} figurant${n > 1 ? 's' : ''}`
        : 'Figuration Only'
    case 'tp_figuration':
      return n != null
        ? `${n} figurant${n > 1 ? 's' : ''} + TP`
        : 'TP + Figuration'
    default:
      return ''
  }
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
        className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded-xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto"
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

        <div className="px-5 sm:px-7 pb-6 pt-1">
          <h3
            className="text-[18px] sm:text-[20px] m-0 mb-4 lowercase first-letter:capitalize"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
          >
            <span style={{ fontWeight: 500 }}>{shortHeader(date).split(' ')[0]}</span>
            <span> </span>
            <span>{shortHeader(date).split(' ').slice(1).join(' ')}</span>
          </h3>

          {sorted.length === 0 ? (
            <div className="text-[14px] opacity-60 italic py-6 text-center">
              Aucun événement.
            </div>
          ) : (
            <div
              className="grid gap-x-3 sm:gap-x-5 gap-y-1.5 text-[13px] sm:text-[14px]"
              style={{
                gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {sorted.map(e => {
                const late = isEventLate(e)
                const color = late ? LATE_COLOR : typeColor(e.type)
                return (
                  <div key={e.id} className="contents">
                    <div
                      className="tabular-nums whitespace-nowrap"
                      style={{ fontWeight: 500 }}
                    >
                      {e.heure} — {endTime(e.heure)}
                    </div>
                    <div
                      className="break-words"
                      style={{ color, fontWeight: 600 }}
                    >
                      {slashTitle(e)}
                    </div>
                    <div
                      className="whitespace-nowrap text-right opacity-90"
                      style={{ fontWeight: 500 }}
                    >
                      ({metaLabel(e)})
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
