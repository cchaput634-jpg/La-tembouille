import { useEffect, useState, lazy, Suspense } from 'react'
import { Sidebar } from './components/Sidebar'
import { FigurationList } from './components/FigurationList'
import { FicheView } from './components/FicheView'
import { CalendrierView } from './components/CalendrierView'
import { COURS } from './data/cours'
import { api } from './lib/api'

const FicheEditor = lazy(() =>
  import('./components/FicheEditor').then(m => ({ default: m.FicheEditor }))
)

const EditorFallback = () => (
  <div className="text-[13px] opacity-60 italic">Chargement de l'éditeur...</div>
)

type Section = 'grimoire' | 'calendrier'
type View = { kind: 'list' } | { kind: 'create' } | { kind: 'fiche'; id: string }

export default function App() {
  const [section, setSection] = useState<Section>('grimoire')
  const [activeCours, setActiveCours] = useState<string>(COURS[0].slug)
  const [view, setView] = useState<View>({ kind: 'list' })
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    Promise.all(
      COURS.map(c => api.listByCours(c.slug).then(rows => [c.slug, rows.length] as const))
    )
      .then(entries => {
        const m = Object.fromEntries(entries)
        setCounts(m)
        setTotal(Object.values(m).reduce((a, b) => a + b, 0))
      })
      .catch(() => {})
  }, [refreshKey])

  const openCreate = () => setView({ kind: 'create' })

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="w-full min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-3rem)] bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded-xl px-5 py-7 md:px-12 md:py-10">
        <header className="flex flex-col gap-4 pb-5 sm:pb-6 border-b-[1.5px] border-[var(--color-ink)] mb-7 sm:mb-9">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <button
              onClick={() => {
                setSection('grimoire')
                setView({ kind: 'list' })
              }}
              className="text-[30px] sm:text-[40px] italic m-0 bg-transparent border-0 cursor-pointer hover:opacity-80 text-left leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
            >
              La Tambouille d'Elixir
            </button>
            {section === 'grimoire' && (
              <div className="text-[13px] opacity-70 italic">
                {total} figuration{total > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <nav className="flex gap-1">
            <button
              onClick={() => {
                setSection('grimoire')
                setView({ kind: 'list' })
              }}
              className={`px-4 py-2 text-[14px] rounded transition-colors ${
                section === 'grimoire'
                  ? 'bg-[var(--color-ink)] text-[var(--color-parchment)]'
                  : 'border border-[var(--color-parchment-line)] hover:border-[var(--color-ink)]'
              }`}
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Grimoire
            </button>
            <button
              onClick={() => setSection('calendrier')}
              className={`px-4 py-2 text-[14px] rounded transition-colors ${
                section === 'calendrier'
                  ? 'bg-[var(--color-ink)] text-[var(--color-parchment)]'
                  : 'border border-[var(--color-parchment-line)] hover:border-[var(--color-ink)]'
              }`}
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Calendrier
            </button>
          </nav>
        </header>

        {section === 'grimoire' ? (
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 md:gap-8">
            <Sidebar
              active={activeCours}
              counts={counts}
              onSelect={slug => {
                setActiveCours(slug)
                setView({ kind: 'list' })
              }}
            />

            <main>
              {view.kind === 'list' && (
                <FigurationList
                  cours={activeCours}
                  onOpen={id => setView({ kind: 'fiche', id })}
                  onCreate={openCreate}
                  refreshKey={refreshKey}
                  onChanged={() => setRefreshKey(k => k + 1)}
                />
              )}
              {view.kind === 'create' && (
                <Suspense fallback={<EditorFallback />}>
                  <FicheEditor
                    mode="create"
                    cours={activeCours}
                    onCancel={() => setView({ kind: 'list' })}
                    onSaved={created => {
                      setRefreshKey(k => k + 1)
                      setView({ kind: 'fiche', id: created.id })
                    }}
                  />
                </Suspense>
              )}
              {view.kind === 'fiche' && (
                <FicheView
                  id={view.id}
                  onBack={() => {
                    setView({ kind: 'list' })
                    setRefreshKey(k => k + 1)
                  }}
                  onDeleted={() => {
                    setView({ kind: 'list' })
                    setRefreshKey(k => k + 1)
                  }}
                />
              )}
            </main>
          </div>
        ) : (
          <CalendrierView
            onOpenFigu={id => {
              setSection('grimoire')
              setView({ kind: 'fiche', id })
            }}
          />
        )}
      </div>
    </div>
  )
}
