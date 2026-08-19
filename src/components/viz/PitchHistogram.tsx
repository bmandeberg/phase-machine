import React, { useMemo, useState } from 'react'
import classNames from 'classnames'
import VizCard from './VizCard'
import { pitchHistogram, SimResult } from '../../visualization'
import { noteString } from '../../globals'

interface PitchHistogramProps {
  sim: SimResult
  color: string
  playingNote?: number
  auditionPitch?: (pitch: number) => void
}

const WIDTH = 280
const HEIGHT = 160
const BOTTOM = 28

type Timeframe = 'phase' | 'seq' | 'key' | 'measure'

const TIMEFRAME_LABELS: { value: Timeframe; label: string }[] = [
  { value: 'phase', label: 'phase' },
  { value: 'seq', label: 'seq cycle' },
  { value: 'key', label: 'key cycle' },
  { value: 'measure', label: 'measure' },
]

// How often each pitch in the range actually sounds over a musical timeframe.
// Clicking a bar auditions its pitch (the ALT+click path).
export default React.memo(function PitchHistogram({ sim, color, playingNote, auditionPitch }: PitchHistogramProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('phase')

  const windowBeats =
    timeframe === 'phase'
      ? sim.simulatedBeats
      : timeframe === 'seq'
      ? sim.phase.seqCycleBeats
      : timeframe === 'key'
      ? sim.phase.keyCycleBeats
      : 4

  const bins = useMemo(() => {
    const counts = new Map(pitchHistogram(sim.events, 0, windowBeats).map((b) => [b.value, b.count]))
    // every pitch of the range gets a bar, so unplayed range pitches read as gaps
    return sim.pitchRange.map((pitch) => ({ pitch, count: counts.get(pitch) ?? 0 }))
  }, [sim, windowBeats])

  const max = Math.max(1, ...bins.map((b) => b.count))
  const barW = bins.length ? Math.min(24, (WIDTH - 8) / bins.length) : 0
  const x0 = (WIDTH - barW * bins.length) / 2
  const labelEvery = Math.ceil(bins.length / Math.floor(WIDTH / 30))

  return (
    <VizCard
      title="Pitches"
      subtitle={`first ${TIMEFRAME_LABELS.find((t) => t.value === timeframe)?.label}`}
      description="How often each pitch in the channel's range actually sounds, counted from a simulated performance over the chosen window: the whole phase, one sequence or key cycle, or the first measure. Because notes only sound where an on-step meets the arp's current pitch, the phasing can favor some pitches and skip others entirely. Empty slots are range pitches the alignment never lands on in that window. Click any column to hear its pitch. While the transport runs, the sounding note is outlined.">
      <div className="viz-seg">
        {TIMEFRAME_LABELS.map(({ value, label }) => (
          <button
            key={value}
            className={classNames('viz-seg-option', { active: timeframe === value })}
            onClick={() => setTimeframe(value)}>
            {label}
          </button>
        ))}
      </div>
      {bins.length ? (
        <svg className="viz-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT}>
          <line x1={0} y1={HEIGHT - BOTTOM} x2={WIDTH} y2={HEIGHT - BOTTOM} className="viz-faint-stroke" />
          {bins.map(({ pitch, count }, i) => {
            const h = (count / max) * (HEIGHT - BOTTOM - 16)
            const x = x0 + i * barW
            const playing = playingNote === pitch
            return (
              <g
                key={pitch}
                className={auditionPitch ? 'viz-audition' : undefined}
                onClick={auditionPitch ? () => auditionPitch(pitch) : undefined}>
                {/* full-column hit area so zero-count pitches audition too */}
                {auditionPitch && (
                  <rect x={x} y={16} width={barW} height={HEIGHT - BOTTOM - 16} fill="transparent">
                    <title>{noteString(pitch)}</title>
                  </rect>
                )}
                <rect
                  x={x + 1}
                  y={HEIGHT - BOTTOM - h}
                  width={Math.max(barW - 2, 1)}
                  height={h}
                  fill={color}
                  fillOpacity={count ? (playing ? 1 : 0.75) : 0}
                  stroke={playing ? 'currentColor' : 'none'}
                />
                {count > 0 && (
                  <text x={x + barW / 2} y={HEIGHT - BOTTOM - h - 4} className="viz-text small">
                    {count}
                  </text>
                )}
                {i % labelEvery === 0 && (
                  <text x={x + barW / 2} y={HEIGHT - BOTTOM + 12} className={classNames('viz-text small', { faint: !count })}>
                    {noteString(pitch)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      ) : (
        <div className="viz-empty">no pitches in range</div>
      )}
    </VizCard>
  )
})
