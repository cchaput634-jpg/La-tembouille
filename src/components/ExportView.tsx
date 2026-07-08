import { useMemo, useState } from 'react'
import { X, ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { coursNom } from '@/data/cours'
import {
  typeColor,
  typeLabel,
  eventTitle,
  STATUT_TP_OPTIONS,
} from '@/data/eventTypes'
import type { CalendarEvent, StatutTP } from '@/lib/types'

interface Props {
  events: CalendarEvent[]
  label: string
  onClose: () => void
}

const EXPORT_TYPES = new Set(['mapping_only', 'tp_figuration'])
const LONG_THRESHOLD = 220

function frenchDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || ''
}

function LieuBlock({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false)
  const plainLength = useMemo(() => stripHtml(html).length, [html])
  const isLong = plainLength > LONG_THRESHOLD

  if (!html.trim()) {
    return <div className="text-[13px] opacity-50 italic">Aucun lieu renseigné.</div>
  }

  return (
    <div>
      <div
        className="fiche-content text-[14px]"
        style={{
          maxHeight: isLong && !expanded ? '110px' : 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {isLong && !expanded && (
        <div
          style={{
            marginTop: -30,
            height: 30,
            background:
              'linear-gradient(to bottom, transparent, var(--color-parchment-soft))',
            pointerEvents: 'none',
          }}
        />
      )}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 flex items-center gap-1 text-[12px] opacity-70 hover:opacity-100"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} /> Réduire
            </>
          ) : (
            <>
              <ChevronDown size={14} /> Voir plus
            </>
          )}
        </button>
      )}
    </div>
  )
}

export function ExportView({ events, label, onClose }: Props) {
  const [statuts, setStatuts] = useState<Record<string, StatutTP | null>>(() =>
    Object.fromEntries(events.map(e => [e.id, e.statut_tp]))
  )
  const [pending, setPending] = useState<Record<string, boolean>>({})

  const filtered = useMemo(
    () =>
      events
        .filter(e => EXPORT_TYPES.has(e.type) && e.figuration_id && e.figuration_titre)
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date)
          return a.heure.localeCompare(b.heure)
        }),
    [events]
  )

  const setStatut = async (eventId: string, next: StatutTP | null) => {
    const previous = statuts[eventId] ?? null
    setStatuts(prev => ({ ...prev, [eventId]: next }))
    setPending(prev => ({ ...prev, [eventId]: true }))
    try {
      await api.events.update(eventId, { statut_tp: next })
    } catch (e) {
      setStatuts(prev => ({ ...prev, [eventId]: previous }))
      alert(`Statut non enregistré : ${(e as Error).message}`)
    } finally {
      setPending(prev => ({ ...prev, [eventId]: false }))
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26, 37, 71, 0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded-xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-5 pb-3 border-b border-[var(--color-ink)]/30">
          <div>
            <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-1">
              Export demandes TP · Mapping
            </div>
            <h3
              className="text-[24px] italic m-0 leading-tight capitalize"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {label}
            </h3>
            <div className="text-[12px] opacity-70 mt-1.5">
              {filtered.length} demande{filtered.length > 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-[13px] opacity-60 italic py-8 text-center">
            Aucune demande TP ou Mapping avec figuration associée.
          </div>
        ) : (
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            {filtered.map(e => (
              <li
                key={e.id}
                className="bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded-md px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  <span
                    className="inline-block w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: typeColor(e.type) }}
                    title={typeLabel(e.type)}
                  />
                  <span className="text-[12px] font-semibold tracking-[1px] opacity-80">
                    {frenchDate(e.date)} · {e.heure.replace(':', 'h')}
                  </span>
                  <span className="text-[11px] opacity-60 uppercase tracking-[1.5px]">
                    · {typeLabel(e.type)}
                  </span>
                </div>

                <div
                  className="text-[16px] break-words leading-snug mb-2.5"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
                >
                  {eventTitle(e)}
                </div>

                <div className="border-t border-[var(--color-parchment-line)] pt-2.5 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] tracking-[2px] uppercase opacity-70 mb-1.5">
                    <MapPin size={12} /> Lieu — {coursNom(e.cours)}
                  </div>
                  <LieuBlock html={e.figuration_lieu ?? ''} />
                </div>

                <div className="border-t border-[var(--color-parchment-line)] pt-2.5">
                  <div className="text-[11px] tracking-[2px] uppercase opacity-70 mb-1.5">
                    Statut
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUT_TP_OPTIONS.map(opt => {
                      const active = statuts[e.id] === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() =>
                            setStatut(e.id, active ? null : opt.value)
                          }
                          disabled={pending[e.id]}
                          className="px-2.5 py-1 rounded text-[12px] border transition-colors disabled:opacity-60"
                          style={{
                            borderColor: opt.color,
                            backgroundColor: active ? opt.color : 'transparent',
                            color: active ? '#fff' : opt.color,
                            fontWeight: 600,
                          }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
