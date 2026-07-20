interface Slice {
  label: string
  value: number
  color: string
}

interface Props {
  data: Slice[]
  size?: number
  emptyLabel?: string
}

function polar(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const s = polar(cx, cy, r, start)
  const e = polar(cx, cy, r, end)
  const largeArc = end - start > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`
}

export function PieChart({ data, size = 180, emptyLabel = 'Aucune donnée' }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-[12px] italic opacity-60"
        style={{ width: size, height: size }}
      >
        {emptyLabel}
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.value - a.value)
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 2
  let angle = -Math.PI / 2

  if (sorted.length === 1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill={sorted[0].color} />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {sorted.map((s, i) => {
        const sliceAngle = (s.value / total) * 2 * Math.PI
        const d = arcPath(cx, cy, r, angle, angle + sliceAngle)
        angle += sliceAngle
        return (
          <path
            key={i}
            d={d}
            fill={s.color}
            stroke="var(--color-parchment)"
            strokeWidth="1.5"
          />
        )
      })}
    </svg>
  )
}

export function PieLegend({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const sorted = [...data].sort((a, b) => b.value - a.value)
  return (
    <ul className="flex flex-col gap-1 list-none p-0 m-0 text-[12px]">
      {sorted.map((s, i) => {
        const pct = total === 0 ? 0 : Math.round((s.value / total) * 100)
        return (
          <li key={i} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="flex-1 min-w-0 truncate">{s.label}</span>
            <span className="opacity-80 tabular-nums whitespace-nowrap">
              {s.value} <span className="opacity-60">({pct}%)</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
