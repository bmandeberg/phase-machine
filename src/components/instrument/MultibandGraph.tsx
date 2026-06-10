import React, { useRef, useCallback } from 'react'
import { EffectSlot } from '../../types'
import { constrain } from '../../math'
import useRafLoop from '../../hooks/useRafLoop'

// Typical multiband-compressor view: the spectrum split into 3 band regions by two
// draggable crossover lines; each band has a draggable threshold, and the region
// above the threshold (the part that gets compressed) is shaded — taller shaded
// rectangle = lower threshold = more compression.

const WIDTH = 392
const HEIGHT = 120
const FMIN = 20
const FMAX = 20000
const DBMIN = -60
const DBMAX = 0
const LOG_RATIO = Math.log(FMAX / FMIN)

const freqToX = (f: number) => (WIDTH * Math.log(f / FMIN)) / LOG_RATIO
const xToFreq = (x: number) => FMIN * Math.exp((x / WIDTH) * LOG_RATIO)
const dbToY = (db: number) => ((DBMAX - db) / (DBMAX - DBMIN)) * HEIGHT
const yToDb = (y: number) => DBMAX - (y / HEIGHT) * (DBMAX - DBMIN)

// Gain-reduction meter height scale: a band fill reaches the full graph height at
// this much reduction. Smaller than the -60 dB threshold axis so typical reduction
// reads as a taller, more visible bar — tune this to make the bars taller/shorter.
const GR_FULL_DB = 36
const grBarHeight = (db: number) => Math.min(HEIGHT, (Math.max(0, -db) / GR_FULL_DB) * HEIGHT)

type Drag = { k: 'thr'; band: 'low' | 'mid' | 'high' } | { k: 'xover'; which: 'low' | 'high' }

const THR_FIELD = { low: 'mbLowThreshold', mid: 'mbMidThreshold', high: 'mbHighThreshold' } as const

interface MultibandGraphProps {
  slot: EffectSlot
  setField: (field: keyof EffectSlot, value: number) => void
  color: string
  setGrabbing: (g: boolean) => void
  // Live per-band gain reduction [low, mid, high] in dB (<= 0). Read each frame.
  getReductions?: () => [number, number, number]
}

function MultibandGraph({ slot, setField, color, setGrabbing, getReductions }: MultibandGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<Drag | null>(null)

  // Per-band gain-reduction meters: sample the live compressors' .reduction each
  // animation frame and grow a full-width band fill downward from 0 dB, on the
  // graph's own dB scale (dbToY), plus a dB readout in each band's top-left corner.
  // DOM mutated via refs — no per-frame React state.
  const grRefs = useRef<(SVGRectElement | null)[]>([null, null, null])
  const grTextRefs = useRef<(SVGTextElement | null)[]>([null, null, null])
  useRafLoop(() => {
    const r = getReductions?.() ?? [0, 0, 0]
    for (let i = 0; i < 3; i++) {
      const bar = grRefs.current[i]
      if (bar) bar.setAttribute('height', String(grBarHeight(r[i])))
      const txt = grTextRefs.current[i]
      if (txt) txt.textContent = (r[i] <= -0.1 ? r[i] : 0).toFixed(1)
    }
  })

  const lowX = freqToX(slot.mbLowFreq)
  const highX = freqToX(slot.mbHighFreq)
  const bands = [
    { band: 'low' as const, x0: 0, x1: lowX, thr: slot.mbLowThreshold },
    { band: 'mid' as const, x0: lowX, x1: highX, thr: slot.mbMidThreshold },
    { band: 'high' as const, x0: highX, x1: WIDTH, thr: slot.mbHighThreshold },
  ]
  const xovers = [
    { which: 'low' as const, x: lowX, freq: slot.mbLowFreq },
    { which: 'high' as const, x: highX, freq: slot.mbHighFreq },
  ]

  const onDrag = useCallback(
    (e: MouseEvent) => {
      const d = dragRef.current
      const svg = svgRef.current
      if (!d || !svg) return
      const r = svg.getBoundingClientRect()
      const x = constrain(((e.clientX - r.left) / r.width) * WIDTH, 0, WIDTH)
      const y = constrain(((e.clientY - r.top) / r.height) * HEIGHT, 0, HEIGHT)
      if (d.k === 'thr') {
        setField(THR_FIELD[d.band], +constrain(yToDb(y), -60, 0).toFixed(1))
      } else {
        const freq = Math.round(xToFreq(x))
        if (d.which === 'low') setField('mbLowFreq', constrain(freq, 40, slot.mbHighFreq - 50))
        else setField('mbHighFreq', constrain(freq, slot.mbLowFreq + 50, 16000))
      }
    },
    [setField, slot.mbHighFreq, slot.mbLowFreq]
  )

  const endDrag = useCallback(() => {
    dragRef.current = null
    setGrabbing(false)
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', endDrag)
  }, [onDrag, setGrabbing])

  const startDrag = useCallback(
    (d: Drag) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragRef.current = d
      setGrabbing(true)
      window.addEventListener('mousemove', onDrag)
      window.addEventListener('mouseup', endDrag)
    },
    [onDrag, endDrag, setGrabbing]
  )

  return (
    <svg ref={svgRef} className="mb-graph" width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      {/* Hz gridlines + labels */}
      {([
        [100, '100'],
        [1000, '1k'],
        [10000, '10k'],
      ] as const).map(([f, label]) => (
        <g key={f}>
          <line className="mb-grid" x1={freqToX(f)} y1={0} x2={freqToX(f)} y2={HEIGHT} />
          <text className="mb-label" x={freqToX(f) + 3} y={HEIGHT - 4}>
            {label}
          </text>
        </g>
      ))}

      {/* per-band shaded "over threshold" rectangles */}
      {bands.map((b) => (
        <rect
          key={`band-${b.band}`}
          className="mb-band"
          x={b.x0}
          y={0}
          width={Math.max(0, b.x1 - b.x0)}
          height={dbToY(b.thr)}
          fill={color}
        />
      ))}

      {/* live per-band gain-reduction meters: a FULL-WIDTH band fill growing down from
          0 dB on the graph's own dB scale, with a dB readout in the band's top-left
          corner. Height + text set per frame via refs. */}
      {bands.map((b, i) => (
        <g key={`gr-${b.band}`}>
          <rect
            ref={(el) => {
              grRefs.current[i] = el
            }}
            className="mb-gr"
            x={b.x0}
            y={0}
            width={Math.max(0, b.x1 - b.x0)}
            height={0}
            fill={color}
          />
          <text
            ref={(el) => {
              grTextRefs.current[i] = el
            }}
            className="mb-gr-label"
            x={b.x0 + 4}
            y={11}>
            0.0
          </text>
        </g>
      ))}

      {/* per-band threshold lines (on top of the band + GR fills so they stay crisp) */}
      {bands.map((b) => (
        <g key={`thr-${b.band}`}>
          <line className="mb-thr" x1={b.x0} y1={dbToY(b.thr)} x2={b.x1} y2={dbToY(b.thr)} stroke={color} />
          <rect
            className="mb-thr-hit"
            x={b.x0}
            y={dbToY(b.thr) - 5}
            width={Math.max(0, b.x1 - b.x0)}
            height={10}
            onMouseDown={startDrag({ k: 'thr', band: b.band })}
          />
        </g>
      ))}

      {/* draggable crossover dividers (vertical) with a top grip; freq label sits at
          the bottom (the top-left corners are taken by the per-band GR readouts) */}
      {xovers.map((c) => (
        <g key={c.which}>
          <line className="mb-xover" x1={c.x} y1={0} x2={c.x} y2={HEIGHT} />
          <text className="mb-label mb-xover-label" x={c.x + 3} y={HEIGHT - 4}>
            {c.freq >= 1000 ? `${(c.freq / 1000).toFixed(1)}k` : `${c.freq}`}
          </text>
          <rect
            className="mb-xover-hit"
            x={c.x - 5}
            y={0}
            width={10}
            height={HEIGHT}
            onMouseDown={startDrag({ k: 'xover', which: c.which })}
          />
          <rect className="mb-xover-grip" x={c.x - 4} y={0} width={8} height={7} fill={color} onMouseDown={startDrag({ k: 'xover', which: c.which })} />
        </g>
      ))}
    </svg>
  )
}

export default React.memo(MultibandGraph)
