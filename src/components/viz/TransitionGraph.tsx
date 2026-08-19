import React, { useMemo } from 'react'
import VizCard from './VizCard'
import { pitchTransitions, SimNoteEvent } from '../../visualization'
import { noteString } from '../../globals'

interface TransitionGraphProps {
  events: SimNoteEvent[]
  color: string
  auditionPitch?: (pitch: number) => void
}

const WIDTH = 280
const HEIGHT = 190
const BASELINE = 120

// Arc diagram of which pitch follows which over the phase. Ascending motion
// arcs above the baseline, descending below; thickness scales with how often
// the transition happens; repeats are a loop on the node. Clicking a node
// auditions its pitch (the ALT+click path).
export default React.memo(function TransitionGraph({ events, color, auditionPitch }: TransitionGraphProps) {
  const { pitches, transitions, maxCount } = useMemo(() => {
    const transitions = pitchTransitions(events)
    const pitchSet = new Set<number>()
    transitions.forEach((t) => {
      pitchSet.add(t.from)
      pitchSet.add(t.to)
    })
    return {
      pitches: [...pitchSet].sort((a, b) => a - b),
      transitions,
      maxCount: Math.max(1, ...transitions.map((t) => t.count)),
    }
  }, [events])

  const xFor = useMemo(() => {
    const map = new Map<number, number>()
    const span = WIDTH - 48
    pitches.forEach((pitch, i) => {
      map.set(pitch, 24 + (pitches.length === 1 ? span / 2 : (i / (pitches.length - 1)) * span))
    })
    return map
  }, [pitches])

  return (
    <VizCard
      title="Transitions"
      subtitle="which pitch follows which"
      description="Every pitch that sounds sits on the baseline; each arc connects a pitch to one that follows it somewhere in the phase, and thicker arcs are transitions that happen more often. Ascending motion bows above the line (bright), descending below (dim), and a small loop on a node marks a pitch that repeats back-to-back. Movement modes have signature shapes here: 'up' draws a neat fan with one long return arc, 'up/down' mirrors itself, and 'random' fills in a dense web. Click a pitch on the baseline to hear it.">
      {transitions.length ? (
        <svg className="viz-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT}>
          <line x1={12} y1={BASELINE} x2={WIDTH - 12} y2={BASELINE} className="viz-faint-stroke" />
          {transitions.map((t) => {
            const x1 = xFor.get(t.from) as number
            const x2 = xFor.get(t.to) as number
            const w = 0.75 + 3 * (t.count / maxCount)
            if (t.from === t.to) {
              // a repeat: small loop sitting on the node
              return (
                <circle
                  key={`${t.from}>${t.to}`}
                  cx={x1}
                  cy={BASELINE - 8}
                  r={7}
                  fill="none"
                  stroke={color}
                  strokeOpacity={0.8}
                  strokeWidth={w}
                />
              )
            }
            // ascending arcs bow above the line, descending below
            const up = t.to > t.from
            const height = Math.min(90, 14 + Math.abs(x2 - x1) * 0.45)
            const cy = up ? BASELINE - height : BASELINE + height * 0.55
            return (
              <path
                key={`${t.from}>${t.to}`}
                d={`M ${x1} ${BASELINE} Q ${(x1 + x2) / 2} ${cy} ${x2} ${BASELINE}`}
                fill="none"
                stroke={color}
                strokeOpacity={up ? 0.85 : 0.45}
                strokeWidth={w}
              />
            )
          })}
          {pitches.map((pitch) => {
            const x = xFor.get(pitch) as number
            return (
              <g
                key={pitch}
                className={auditionPitch ? 'viz-audition' : undefined}
                onClick={auditionPitch ? () => auditionPitch(pitch) : undefined}>
                {auditionPitch && <circle cx={x} cy={BASELINE + 6} r={12} fill="transparent" />}
                <circle cx={x} cy={BASELINE} r={3.5} fill="currentColor" />
                <text x={x} y={BASELINE + 18} className="viz-text small">
                  {noteString(pitch)}
                </text>
              </g>
            )
          })}
        </svg>
      ) : (
        <div className="viz-empty">not enough notes</div>
      )}
      <div className="viz-legend">
        <span>
          <span className="viz-swatch" style={{ backgroundColor: color }} /> bright = ascending · dim = descending
        </span>
      </div>
    </VizCard>
  )
})
