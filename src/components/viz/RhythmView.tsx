import React from 'react'
import VizCard from './VizCard'
import { swingTickPosition } from '../../visualization'

interface RhythmViewProps {
  keySwing: number
  keySwingLength: number
  seqSwing: number
  seqSwingLength: number
  color: string
}

const WIDTH = 280
const ROW_HEIGHT = 46

function SwingRow({
  label,
  swing,
  length,
  color,
  y,
}: {
  label: string
  swing: number
  length: number
  color: string
  y: number
}) {
  const straight = swing === 0.5
  const x = (pos: number) => 36 + (pos / length) * (WIDTH - 84)
  return (
    <g>
      <text x={0} y={y + 4} className="viz-text left small">
        {label}
      </text>
      <line x1={36} y1={y} x2={WIDTH - 48} y2={y} className="viz-faint-stroke" />
      {Array.from({ length }, (_, k) => {
        const swungX = x(swingTickPosition(k, swing, length))
        return (
          <g key={k}>
            {/* the straight-grid ghost of this tick */}
            <line x1={x(k)} y1={y - 8} x2={x(k)} y2={y + 8} stroke="currentColor" strokeOpacity={0.25} />
            {/* where the tick actually lands under swing */}
            <line x1={swungX} y1={y - 10} x2={swungX} y2={y + 10} stroke={color} strokeWidth={2.5} />
          </g>
        )
      })}
      <text x={WIDTH} y={y + 4} className="viz-text right small faint">
        {straight ? 'straight' : `${Math.round(swing * 100)}%`}
      </text>
    </g>
  )
}

// Where each loop's ticks actually land inside one swing phrase, against the
// straight-grid ghosts they're displaced from. At 50% swing both rows sit on
// the grid; the phrase spans swingLength ticks.
export default React.memo(function RhythmView({ keySwing, keySwingLength, seqSwing, seqSwingLength, color }: RhythmViewProps) {
  return (
    <VizCard
      title="Swing timing"
      subtitle="one swing phrase per loop"
      description="Where each loop's ticks actually land inside one swing phrase, against the straight grid they're displaced from (the ghost ticks). 50% swing is straight time; higher values push the off-ticks late (classic shuffle at 2), lower values pull them early, and phrase lengths above 2 skew the warp across the whole phrase instead of alternating pairs. Swing bends timing only. It never changes which notes play, which is why the other views sit on the straight grid.">
      <svg className="viz-svg" viewBox={`0 0 ${WIDTH} ${ROW_HEIGHT * 2 + 10}`} width={WIDTH} height={ROW_HEIGHT * 2 + 10}>
        <SwingRow label="seq" swing={seqSwing} length={seqSwingLength} color={color} y={ROW_HEIGHT * 0.6} />
        <SwingRow label="key" swing={keySwing} length={keySwingLength} color={color} y={ROW_HEIGHT * 1.6} />
      </svg>
    </VizCard>
  )
})
