import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, UserPlus, CalendarX, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { usePolling } from '@/lib/usePolling'
import { DISPO_OPTIONS } from '@/data/dispoStatuts'
import type {
  AbsenceFigurant,
  DispoStatut,
  FigurantPerm,
} from '@/lib/types'

function frenchDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function FigurantsView() {
  const [figurants, setFigurants] = useState<FigurantPerm[]>([])
  const [absences, setAbsences] = useState<AbsenceFigurant[]>([])
  const [loading, setLoading] = useState(true)
  const [newNom, setNewNom] = useState('')
  const [pendingDispo, setPendingDispo] = useState<Record<string, boolean>>({})
  const [absenceFiguId, setAbsenceFiguId] = useState('')
  const [absenceDebut, setAbsenceDebut] = useState('')
  const [absenceFin, setAbsenceFin] = useState('')
  const [absSaving, setAbsSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([api.figurants.list(), api.absences.list()])
      .then(([figs, abs]) => {
        setFigurants(figs)
        setAbsences(abs)
      })
      .catch(e => alert(`Erreur : ${e.message}`))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  usePolling(() => {
    Promise.all([api.figurants.list(), api.absences.list()])
      .then(([figs, abs]) => {
        setFigurants(figs)
        setAbsences(abs)
      })
      .catch(() => {})
  }, 15000)

  const addFigurant = async () => {
    const nom = newNom.trim()
    if (!nom) return
    try {
      const created = await api.figurants.create(nom)
      setFigurants(prev => [...prev, created].sort((a, b) => a.nom.localeCompare(b.nom)))
      setNewNom('')
    } catch (e) {
      alert(`Ajout échoué : ${(e as Error).message}`)
    }
  }

  const removeFigurant = async (f: FigurantPerm) => {
    if (!confirm(`Retirer ${f.nom} de la liste ?`)) return
    try {
      await api.figurants.remove(f.id)
      setFigurants(prev => prev.filter(x => x.id !== f.id))
      setAbsences(prev => prev.filter(a => a.figurant_id !== f.id))
    } catch (e) {
      alert(`Suppression échouée : ${(e as Error).message}`)
    }
  }

  const setDispo = async (f: FigurantPerm, next: DispoStatut | null) => {
    const previous = f.dispo
    setFigurants(prev => prev.map(x => (x.id === f.id ? { ...x, dispo: next } : x)))
    setPendingDispo(prev => ({ ...prev, [f.id]: true }))
    try {
      const updated = await api.figurants.setDispo(f.id, next)
      setFigurants(prev => prev.map(x => (x.id === f.id ? updated : x)))
    } catch (e) {
      setFigurants(prev => prev.map(x => (x.id === f.id ? { ...x, dispo: previous } : x)))
      alert(`Statut non enregistré : ${(e as Error).message}`)
    } finally {
      setPendingDispo(prev => ({ ...prev, [f.id]: false }))
    }
  }

  const addAbsence = async () => {
    if (!absenceFiguId || !absenceDebut || !absenceFin) {
      alert('Sélectionne un figurant et les deux dates.')
      return
    }
    if (absenceFin < absenceDebut) {
      alert('La date de fin doit être postérieure ou égale à la date de début.')
      return
    }
    setAbsSaving(true)
    try {
      const created = await api.absences.create(absenceFiguId, absenceDebut, absenceFin)
      setAbsences(prev => [created, ...prev])
      setAbsenceFiguId('')
      setAbsenceDebut('')
      setAbsenceFin('')
    } catch (e) {
      alert(`Ajout échoué : ${(e as Error).message}`)
    } finally {
      setAbsSaving(false)
    }
  }

  const removeAbsence = async (a: AbsenceFigurant) => {
    if (!confirm(`Supprimer cette absence de ${a.figurant_nom} ?`)) return
    try {
      await api.absences.remove(a.id)
      setAbsences(prev => prev.filter(x => x.id !== a.id))
    } catch (e) {
      alert(`Suppression échouée : ${(e as Error).message}`)
    }
  }

  const sortedFigurants = useMemo(
    () => [...figurants].sort((a, b) => a.nom.localeCompare(b.nom)),
    [figurants]
  )

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <section className="bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded-md px-5 py-5 md:px-6 md:py-6">
        <div className="flex items-center gap-2 mb-1">
          <Users size={18} />
          <h2
            className="text-[22px] sm:text-[26px] italic m-0 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Disponibilités du jour
          </h2>
        </div>
        <div className="text-[12px] opacity-70 mb-4 italic">
          Les disponibilités se réinitialisent chaque nuit à minuit (heure de Paris).
        </div>

        <div className="flex gap-2 mb-5">
          <input
            type="text"
            value={newNom}
            onChange={e => setNewNom(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') addFigurant()
            }}
            placeholder="Nom d'un nouveau figurant..."
            className="flex-1 bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          />
          <button
            onClick={addFigurant}
            disabled={!newNom.trim()}
            className="flex items-center gap-1.5 bg-[var(--color-ink)] text-[var(--color-parchment)] px-3.5 py-2 rounded text-[13px] hover:opacity-90 disabled:opacity-50"
          >
            <UserPlus size={14} /> Ajouter
          </button>
        </div>

        {loading ? (
          <div className="text-[13px] opacity-60 italic">Chargement...</div>
        ) : sortedFigurants.length === 0 ? (
          <div className="text-[13px] opacity-60 italic py-6 text-center">
            Aucun figurant enregistré. Ajoute-en un ci-dessus.
          </div>
        ) : (
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {sortedFigurants.map(f => (
              <li
                key={f.id}
                className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded-md px-3.5 py-2.5 flex flex-wrap items-center gap-3"
              >
                <div
                  className="flex-1 min-w-[120px] text-[16px]"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
                >
                  {f.nom}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DISPO_OPTIONS.map(opt => {
                    const active = f.dispo === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setDispo(f, active ? null : opt.value)}
                        disabled={pendingDispo[f.id]}
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
                <button
                  onClick={() => removeFigurant(f)}
                  className="opacity-50 hover:opacity-100 hover:text-[var(--color-alert)]"
                  title="Retirer"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-[var(--color-parchment-soft)] border border-[var(--color-parchment-line)] rounded-md px-5 py-5 md:px-6 md:py-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarX size={18} />
          <h2
            className="text-[22px] sm:text-[26px] italic m-0 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Absences
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 mb-5">
          <select
            value={absenceFiguId}
            onChange={e => setAbsenceFiguId(e.target.value)}
            className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            <option value="">— Figurant —</option>
            {sortedFigurants.map(f => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
          <input
            type="date"
            value={absenceDebut}
            onChange={e => setAbsenceDebut(e.target.value)}
            className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          />
          <input
            type="date"
            value={absenceFin}
            onChange={e => setAbsenceFin(e.target.value)}
            className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          />
          <button
            onClick={addAbsence}
            disabled={absSaving}
            className="flex items-center justify-center gap-1.5 bg-[var(--color-ink)] text-[var(--color-parchment)] px-3.5 py-2 rounded text-[13px] hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={14} /> {absSaving ? '...' : 'Enregistrer'}
          </button>
        </div>

        {loading ? (
          <div className="text-[13px] opacity-60 italic">Chargement...</div>
        ) : absences.length === 0 ? (
          <div className="text-[13px] opacity-60 italic py-6 text-center">
            Aucune absence enregistrée.
          </div>
        ) : (
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {absences.map(a => (
              <li
                key={a.id}
                className="bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded-md px-3.5 py-2.5 flex flex-wrap items-center gap-3"
              >
                <div
                  className="flex-1 min-w-[120px] text-[15px]"
                  style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
                >
                  {a.figurant_nom ?? 'Figurant supprimé'}
                </div>
                <div className="text-[13px] opacity-80">
                  du {frenchDate(a.date_debut)} au {frenchDate(a.date_fin)}
                </div>
                <button
                  onClick={() => removeAbsence(a)}
                  className="opacity-50 hover:opacity-100 hover:text-[var(--color-alert)]"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
