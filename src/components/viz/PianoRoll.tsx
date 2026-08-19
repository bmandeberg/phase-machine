import React, { useMemo } from 'react'
import VizCard from './VizCard'
import { SimResult } from '../../visualization'
import { noteString } from '../../globals'

interface PianoRollProps {
  sim: SimResult
  color: string
  auditionPitch?: (pitch: number) => void
}

const GUTTER = 44
const ROW = 12
const AXIS = 24

// The emergent melody of one full phase, unrolled. Nobody programmed this line —
// it falls out of the seq and key cycles drifting against each other, so the
// cycle boundaries are marked to show where the phasing happens. Clicking a
// note auditions its pitch (the ALT+click path).
export default React.memo(function PianoRoll({ sim, color, auditionPitch }: PianoRollProps) {
  const { pitchRange, events, phase } = sim
  const spanBeats = sim.simulatedBeats

  // low pitches at the bottom
  const rows = useMemo(() => [...pitchRange].sort((a, b) => b - a), [pitchRange])
  const rowFor = useMemo(() => new Map(rows.map((p, i) => [p, i])), [rows])

  const pxPerBeat = Math.max(6, Math.min(48, 1100 / Math.max(spanBeats, 1)))
  const width = GUTTER + spanBeats * pxPerBeat + 8
  const height = rows.length * ROW + AXIS

  const measures = Math.ceil(spanBeats / 4)
  const labelEvery = Math.ceil(measures / 24)

  const cycleLines = (cycleBeats: number) => {
    const lines: number[] = []
    if (spanBeats / cycleBeats > 200) return lines
    for (let b = cycleBeats; b < spanBeats - 1e-9; b += cycleBeats) {
      lines.push(b)
    }
    return lines
  }

  return (
    <VizCard
      title="Piano roll"
      subtitle="one full phase, unrolled"
      wide
      description="The channel's actual note stream, unrolled left to right across one full phase. This is the melody that emerges from the two loops drifting against each other, rather than anything programmed directly. Bright notes are struck by sequencer steps; dimmer ones are re-triggers where the key loop changed pitch mid-step. Dashed verticals mark sequence-cycle boundaries and dotted ones key-cycle boundaries: watch how the same step pattern lands on different pitches after each boundary until the two cycles realign and the whole thing repeats. Hover a note for its details, or click it to hear it.">
      {events.length ? (
        <>
          <div className="viz-scroll">
            <svg className="viz-svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
              {rows.map((pitch, i) => (
                <g key={pitch}>
                  <line
                    x1={GUTTER}
                    y1={i * ROW + ROW / 2}
                    x2={width - 8}
                    y2={i * ROW + ROW / 2}
                    stroke="currentColor"
                    strokeOpacity={0.08}
                  />
                  <text x={GUTTER - 6} y={i * ROW + ROW / 2 + 3} className="viz-text right small faint">
                    {noteString(pitch)}
                  </text>
                </g>
              ))}
              {Array.from({ length: measures + 1 }, (_, m) => (
                <g key={m}>
                  <line
                    x1={GUTTER + m * 4 * pxPerBeat}
                    y1={0}
                    x2={GUTTER + m * 4 * pxPerBeat}
                    y2={height - AXIS}
                    stroke="currentColor"
                    strokeOpacity={0.12}
                  />
                  {m % labelEvery === 0 && m < measures && (
                    <text x={GUTTER + m * 4 * pxPerBeat + 3} y={height - 8} className="viz-text left small faint">
                      {m + 1}
                    </text>
                  )}
                </g>
              ))}
              {cycleLines(phase.seqCycleBeats).map((b) => (
                <line
                  key={`s${b}`}
                  x1={GUTTER + b * pxPerBeat}
                  y1={0}
                  x2={GUTTER + b * pxPerBeat}
                  y2={height - AXIS}
                  stroke={color}
                  strokeOpacity={0.6}
                  strokeDasharray="4 3"
                />
              ))}
              {cycleLines(phase.keyCycleBeats).map((b) => (
                <line
                  key={`k${b}`}
                  x1={GUTTER + b * pxPerBeat}
                  y1={0}
                  x2={GUTTER + b * pxPerBeat}
                  y2={height - AXIS}
                  stroke="currentColor"
                  strokeOpacity={0.35}
                  strokeDasharray="1.5 3"
                />
              ))}
              {events.map((e, i) => (
                <rect
                  key={i}
                  className={auditionPitch ? 'viz-audition' : undefined}
                  onClick={auditionPitch ? () => auditionPitch(e.pitch) : undefined}
                  x={GUTTER + e.time * pxPerBeat}
                  y={(rowFor.get(e.pitch) as number) * ROW + 1.5}
                  width={Math.max(e.duration * pxPerBeat - 1, 3)}
                  height={ROW - 3}
                  rx={1.5}
                  fill={color}
                  fillOpacity={e.source === 'seq' ? 0.9 : 0.55}>
                  <title>{`${noteString(e.pitch)} · beat ${+e.time.toFixed(2) + 1} · ${e.source}`}</title>
                </rect>
              ))}
            </svg>
          </div>
          <div className="viz-legend">
            <span>
              <span className="viz-swatch" style={{ backgroundColor: color }} /> seq-step note
            </span>
            <span>
              <span className="viz-swatch" style={{ backgroundColor: color, opacity: 0.55 }} /> key-retrigger note
            </span>
            <span>
              <span className="viz-swatch dash" style={{ borderColor: color }} /> seq cycle
            </span>
            <span>
              <span className="viz-swatch dot" /> key cycle
            </span>
          </div>
        </>
      ) : (
        <div className="viz-empty">nothing plays yet: turn on some steps and key notes</div>
      )}
    </VizCard>
  )
})
