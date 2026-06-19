import { useEffect, useState, lazy, Suspense } from 'react'
import { Sidebar } from './components/Sidebar'
import { FigurationList } from './components/FigurationList'
import { FicheView } from './components/FicheView'
import { COURS } from './data/cours'
import { api } from './lib/api'

const FicheEditor = lazy(() =>
  import('./components/FicheEditor').then(m => ({ default: m.FicheEditor }))
)

const EditorFallback = () => (
  <div className="text-[13px] opacity-60 italic">Chargement de l'éditeur...</div>
)

type View = { kind: 'list' } | { kind: 'create' } | { kind: 'fiche'; id: string }

export default function App() {
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
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-[1100px] mx-auto bg-[var(--color-parchment)] border border-[var(--color-parchment-line)] rounded-xl px-6 py-6 md:px-8 md:py-7">
        <header className="flex justify-between items-center pb-3.5 border-b-[1.5px] border-[var(--color-ink)] mb-5">
          <button
            onClick={() => setView({ kind: 'list' })}
            className="text-[26px] italic m-0 bg-transparent border-0 cursor-pointer hover:opacity-80"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
          >
            La Tambouille d'Elixir
          </button>
          <div className="text-[12px] opacity-70 italic">
            {total} figuration{total > 1 ? 's' : ''}
          </div>
        </header>

        <div className="grid grid-cols-[180px_1fr] gap-5">
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
      </div>
    </div>
  )
}
