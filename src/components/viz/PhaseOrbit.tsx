import React, { useMemo } from 'react'
import VizCard from './VizCard'
import { SimResult } from '../../visualization'

interface PhaseOrbitProps {
  sim: SimResult
  color: string
}

const SIZE = 240
const CENTER = SIZE / 2
const AMPLITUDE = SIZE / 2 - 20

// Lissajous portrait of the polymeter: x follows the sequence cycle, y follows
// the key cycle, both as sines. The curve closes exactly once per full phase —
// simple ratios draw simple figures, distant ratios weave dense braids. Dots
// mark where notes actually sound along the orbit.
export default React.memo(function PhaseOrbit({ sim, color }: PhaseOrbitProps) {
  const { phase } = sim
  const spanBeats = phase.phaseBeats ?? sim.simulatedBeats

  const points = useMemo(() => {
    const n = 1200
    const pts: string[] = []
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * spanBeats
      const x = CENTER + Math.sin((t / phase.seqCycleBeats) * Math.PI * 2) * AMPLITUDE
      const y = CENTER + Math.sin((t / phase.keyCycleBeats) * Math.PI * 2) * AMPLITUDE
      pts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
    }
    return pts.join(' ')
  }, [spanBeats, phase.seqCycleBeats, phase.keyCycleBeats])

  const dots = useMemo(
    () =>
      sim.events.slice(0, 512).map((e) => ({
        x: CENTER + Math.sin((e.time / phase.seqCycleBeats) * Math.PI * 2) * AMPLITUDE,
        y: CENTER + Math.sin((e.time / phase.keyCycleBeats) * Math.PI * 2) * AMPLITUDE,
      })),
    [sim.events, phase.seqCycleBeats, phase.keyCycleBeats]
  )

  return (
    <VizCard
      title="Phase orbit"
      subtitle="seq cycle × key cycle"
      description="A Lissajous portrait of the polymeter: the horizontal position sweeps once per sequence cycle, the vertical once per key cycle, so the curve closes on itself exactly once per full phase. Simple cycle ratios like 3:2 or 4:3 draw simple figures; distant ratios weave dense braids. The visual density is the polymetric complexity. Dots mark the moments notes actually sound along the orbit, so sparse patterns trace a constellation over the figure.">
      <svg className="viz-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
        <line x1={CENTER} y1={8} x2={CENTER} y2={SIZE - 8} className="viz-faint-stroke" />
        <line x1={8} y1={CENTER} x2={SIZE - 8} y2={CENTER} className="viz-faint-stroke" />
        <polyline points={points} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={2.5} fill={color} fillOpacity={0.9} />
        ))}
      </svg>
    </VizCard>
  )
})
