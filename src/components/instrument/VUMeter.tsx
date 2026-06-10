import React, { useRef } from 'react'
import useRafLoop from '../../hooks/useRafLoop'

// An analog VU-style gain-reduction meter, à la the UREI 1176: the needle pivots at
// the visible hub (bottom-center) and rests at the right (0 dB, no reduction),
// swinging left as the compressor pulls gain down. The dB scale is printed along the
// arc. Sampled each animation frame and driven through refs (needle transform +
// readout text) — no per-frame React state — and only mounted while the modal shows
// a compressor slot, so the rAF stops on close. Narrow enough to sit inline with the
// knobs + effect dropdown.

const W = 110
const H = 64
const CX = W / 2
const PY = H - 5 // needle pivot / hub, near the bottom edge (visible)
const L = PY - 5 // needle length (tip near the top edge)
const R = L // scale/tick radius — the needle tip rides the scale
const SWEEP = 42 // half the needle's angular travel, in degrees
const GR_MAX = 20 // dB of gain reduction at the far-left end of the scale

const TICKS = [0, 5, 10, 15, 20]

// gain reduction (dB, >= 0) -> needle angle (deg from vertical; + = clockwise/right)
const grToAngle = (gr: number) => SWEEP - (Math.min(GR_MAX, Math.max(0, gr)) / GR_MAX) * 2 * SWEEP
const polar = (angleDeg: number, radius: number) => {
  const a = (angleDeg * Math.PI) / 180
  return { x: CX + radius * Math.sin(a), y: PY - radius * Math.cos(a) }
}

const arcStart = polar(grToAngle(GR_MAX), R) // left end (max reduction)
const arcEnd = polar(grToAngle(0), R) // right end (no reduction)
const ARC = `M ${arcStart.x.toFixed(1)} ${arcStart.y.toFixed(1)} A ${R} ${R} 0 0 1 ${arcEnd.x.toFixed(1)} ${arcEnd.y.toFixed(1)}`

interface VUMeterProps {
  // Current gain reduction in dB (<= 0; 0 = none). Read live each frame.
  getReduction: () => number
  color: string
}

function VUMeter({ getReduction, color }: VUMeterProps) {
  const needleRef = useRef<SVGLineElement>(null)
  const readoutRef = useRef<SVGTextElement>(null)

  useRafLoop(() => {
    const r = getReduction() // <= 0
    const angle = grToAngle(-r)
    needleRef.current?.setAttribute('transform', `rotate(${angle.toFixed(2)} ${CX} ${PY})`)
    if (readoutRef.current) readoutRef.current.textContent = `${(r <= -0.1 ? r : 0).toFixed(1)}`
  })

  return (
    <div className="vu-meter instrument-item">
      <svg className="vu-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect className="vu-face" x={0.5} y={0.5} width={W - 1} height={H - 1} rx={3} />
        <path className="vu-arc" d={ARC} fill="none" />
        {TICKS.map((v) => {
          const ang = grToAngle(v)
          const outer = polar(ang, R)
          const inner = polar(ang, R - 4)
          const lbl = polar(ang, R - 10)
          return (
            <g key={v}>
              <line className="vu-tick" x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} />
              <text className="vu-label" x={lbl.x} y={lbl.y + 2.5} textAnchor="middle">
                {v}
              </text>
            </g>
          )
        })}
        <text ref={readoutRef} className="vu-readout" x={5} y={11}>
          0.0
        </text>
        <text className="vu-caption" x={W - 5} y={11} textAnchor="end">
          GR dB
        </text>
        <line ref={needleRef} className="vu-needle" x1={CX} y1={PY} x2={CX} y2={PY - L} stroke={color} />
        <circle className="vu-hub" cx={CX} cy={PY} r={3} fill={color} />
      </svg>
    </div>
  )
}

export default VUMeter
