import React, { useRef, useCallback } from 'react'
import { EffectSlot } from '../../types'
import { constrain } from '../../math'

// EQ-8-style interactive 3-band EQ: drag each band's node to set frequency (x, log)
// and gain (y, dB); a live response curve is drawn from the real biquad responses.
// Low band = low-shelf, mid = peaking (Q via the separate knob), high = high-shelf.

const WIDTH = 392
const HEIGHT = 120
const FMIN = 20
const FMAX = 20000
const GVIEW = 15 // y-axis half-range (dB); nodes clamp to ±12, curve has headroom
const LOG_RATIO = Math.log(FMAX / FMIN)
const N = 128 // response-curve resolution

// per-band draggable frequency limits (match the prior knob ranges)
const BAND_FREQ = {
  low: [50, 1000],
  mid: [200, 8000],
  high: [2000, 16000],
} as const

const freqToX = (f: number) => (WIDTH * Math.log(f / FMIN)) / LOG_RATIO
const xToFreq = (x: number) => FMIN * Math.exp((x / WIDTH) * LOG_RATIO)
const gainToY = (g: number) => ((GVIEW - g) / (2 * GVIEW)) * HEIGHT
const yToGain = (y: number) => GVIEW - (y / HEIGHT) * 2 * GVIEW

type Band = 'low' | 'mid' | 'high'

interface EqGraphProps {
  slot: EffectSlot
  setField: (field: keyof EffectSlot, value: number) => void
  color: string
  setGrabbing: (g: boolean) => void
}

function EqGraph({ slot, setField, color, setGrabbing }: EqGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<Band | null>(null)

  // One reusable offline context + 3 biquads to read the exact filter response.
  const filtersRef = useRef<{ low: BiquadFilterNode; mid: BiquadFilterNode; high: BiquadFilterNode } | null>(null)
  if (!filtersRef.current && typeof window !== 'undefined' && window.OfflineAudioContext) {
    const ctx = new OfflineAudioContext(1, 256, 44100)
    const mk = (type: BiquadFilterType) => {
      const f = ctx.createBiquadFilter()
      f.type = type
      return f
    }
    filtersRef.current = { low: mk('lowshelf'), mid: mk('peaking'), high: mk('highshelf') }
  }

  // sample the summed response across log-spaced frequencies -> SVG points
  const curvePoints = (() => {
    const f = filtersRef.current
    if (!f) return ''
    const freqs = new Float32Array(N)
    for (let i = 0; i < N; i++) freqs[i] = xToFreq((i / (N - 1)) * WIDTH)
    const mag = new Float32Array(N)
    const phase = new Float32Array(N)
    const sumDb = new Float32Array(N)
    const apply = (node: BiquadFilterNode, freq: number, gain: number, q: number) => {
      node.frequency.value = freq
      node.gain.value = gain
      node.Q.value = q
      node.getFrequencyResponse(freqs, mag, phase)
      for (let i = 0; i < N; i++) sumDb[i] += 20 * Math.log10(mag[i] || 1e-6)
    }
    apply(f.low, slot.eqLowFreq, slot.eqLowGain, 0.7)
    apply(f.mid, slot.eqMidFreq, slot.eqMidGain, slot.eqMidQ)
    apply(f.high, slot.eqHighFreq, slot.eqHighGain, 0.7)
    let pts = ''
    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1)) * WIDTH
      const y = constrain(gainToY(sumDb[i]), 0, HEIGHT)
      pts += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `
    }
    return pts
  })()

  const onDrag = useCallback(
    (e: MouseEvent) => {
      const band = dragRef.current
      const svg = svgRef.current
      if (!band || !svg) return
      const r = svg.getBoundingClientRect()
      const x = constrain(((e.clientX - r.left) / r.width) * WIDTH, 0, WIDTH)
      const y = constrain(((e.clientY - r.top) / r.height) * HEIGHT, 0, HEIGHT)
      const [fMin, fMax] = BAND_FREQ[band]
      const freq = Math.round(constrain(xToFreq(x), fMin, fMax))
      const gain = +constrain(yToGain(y), -12, 12).toFixed(2)
      const cap = band[0].toUpperCase() + band.slice(1)
      setField(`eq${cap}Freq` as keyof EffectSlot, freq)
      setField(`eq${cap}Gain` as keyof EffectSlot, gain)
    },
    [setField]
  )

  const endDrag = useCallback(() => {
    dragRef.current = null
    setGrabbing(false)
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', endDrag)
  }, [onDrag, setGrabbing])

  const startDrag = useCallback(
    (band: Band) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragRef.current = band
      setGrabbing(true)
      window.addEventListener('mousemove', onDrag)
      window.addEventListener('mouseup', endDrag)
    },
    [onDrag, endDrag, setGrabbing]
  )

  const nodes: { band: Band; freq: number; gain: number }[] = [
    { band: 'low', freq: slot.eqLowFreq, gain: slot.eqLowGain },
    { band: 'mid', freq: slot.eqMidFreq, gain: slot.eqMidGain },
    { band: 'high', freq: slot.eqHighFreq, gain: slot.eqHighGain },
  ]

  return (
    <svg ref={svgRef} className="eq-graph" width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      {/* vertical gridlines + Hz labels at decade frequencies */}
      {([
        [100, '100'],
        [1000, '1k'],
        [10000, '10k'],
      ] as const).map(([f, label]) => (
        <g key={f}>
          <line className="eq-grid" x1={freqToX(f)} y1={0} x2={freqToX(f)} y2={HEIGHT} />
          <text className="eq-label" x={freqToX(f) + 3} y={HEIGHT - 4}>
            {label}
          </text>
        </g>
      ))}
      {/* 0 dB centerline */}
      <line className="eq-grid eq-zero" x1={0} y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} />
      {/* response curve */}
      <path className="eq-curve" d={curvePoints} fill="none" stroke={color} />
      {/* draggable band nodes */}
      {nodes.map(({ band, freq, gain }) => (
        <circle
          key={band}
          className="eq-node"
          cx={freqToX(freq)}
          cy={gainToY(gain)}
          r={6}
          fill={color}
          onMouseDown={startDrag(band)}
        />
      ))}
    </svg>
  )
}

export default React.memo(EqGraph)
