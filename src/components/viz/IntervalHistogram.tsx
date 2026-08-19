import React, { useMemo } from 'react'
import classNames from 'classnames'
import VizCard from './VizCard'
import { intervalHistogram, SimNoteEvent } from '../../visualization'

interface IntervalHistogramProps {
  events: SimNoteEvent[]
  color: string
}

const WIDTH = 280
const HEIGHT = 160
const BOTTOM = 28

// The melodic motion of the phase: how far (in semitones, signed) each note
// steps from the previous one. Complements the pitch histogram — "moves in
// thirds" rather than "plays these notes".
export default React.memo(function IntervalHistogram({ events, color }: IntervalHistogramProps) {
  const bins = useMemo(() => intervalHistogram(events), [events])

  const max = Math.max(1, ...bins.map((b) => b.count))
  const barW = bins.length ? Math.min(32, (WIDTH - 8) / bins.length) : 0
  const x0 = (WIDTH - barW * bins.length) / 2
  const labelEvery = Math.ceil(bins.length / 12)

  return (
    <VizCard
      title="Melodic intervals"
      subtitle="semitones between consecutive notes"
      description="The channel's melodic motion: how far each note steps from the one before it, in signed semitones (up is positive, 0 is a repeated pitch). Two channels can play exactly the same pitches yet feel completely different depending on whether they move in seconds, leap in sixths, or hover on repeats. This is that difference, made visible. The movement mode shapes it directly: 'up' produces mostly small positive steps with one big reset leap, 'up/down' balances positive and negative, and '+/-' alternates its two increments.">
      {bins.length ? (
        <svg className="viz-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT}>
          <line x1={0} y1={HEIGHT - BOTTOM} x2={WIDTH} y2={HEIGHT - BOTTOM} className="viz-faint-stroke" />
          {bins.map(({ value, count }, i) => {
            const h = (count / max) * (HEIGHT - BOTTOM - 16)
            const x = x0 + i * barW
            return (
              <g key={value}>
                <rect
                  x={x + 1.5}
                  y={HEIGHT - BOTTOM - h}
                  width={Math.max(barW - 3, 1)}
                  height={h}
                  fill={color}
                  fillOpacity={value === 0 ? 0.4 : 0.75}
                />
                <text x={x + barW / 2} y={HEIGHT - BOTTOM - h - 4} className="viz-text small">
                  {count}
                </text>
                {i % labelEvery === 0 && (
                  <text x={x + barW / 2} y={HEIGHT - BOTTOM + 12} className={classNames('viz-text small', { faint: value === 0 })}>
                    {value > 0 ? `+${value}` : value}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      ) : (
        <div className="viz-empty">not enough notes</div>
      )}
    </VizCard>
  )
})
