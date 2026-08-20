import React, { useMemo, useState, useCallback } from 'react'
import classNames from 'classnames'
import VizCard from './VizCard'
import { intervalVector, identifyScales, pitchClassName } from '../../visualization'
import { flip, opposite, shift, fifthsPos } from '../../math'
import { Setter } from '../../types'

interface KeyAnalysisProps {
  musicalKey: boolean[]
  axis: number
  color: string
  playingPitchClass?: number | null
  // editing (range mode only — in keybd mode the key derives from the piano)
  editable?: boolean
  setKey?: Setter<boolean[]>
  doFlip?: () => void
  doOpposite?: () => void
  shiftKey?: (amount: number) => void
}

const SIZE = 240
const CENTER = SIZE / 2
const RADIUS = 92

// angle (radians, 12 o'clock = position 0, clockwise) for circle position p of 12
function angle(p: number) {
  return (p / 12) * Math.PI * 2 - Math.PI / 2
}

function nodeXY(p: number, radius = RADIUS) {
  return { x: CENTER + Math.cos(angle(p)) * radius, y: CENTER + Math.sin(angle(p)) * radius }
}

function polygonPoints(key: boolean[], pcAt: number[]) {
  return pcAt
    .map((pc, p) => (key[pc] ? p : null))
    .filter((p): p is number => p !== null)
    .map((p) => {
      const { x, y } = nodeXY(p, RADIUS - 14)
      return `${x},${y}`
    })
}

// The key drawn on the 12-tone circle — the selected pitch classes as a polygon,
// in chromatic order (with the channel's reflection axis) or circle-of-fifths
// order — plus set-theory readouts: interval vector and matching scale names.
// In range mode the circle is a control too: click nodes to toggle pitches, and
// the shift/flip/opposite buttons apply the channel's key transforms (hovering
// them previews the result as a ghost polygon).
export default React.memo(function KeyAnalysis({
  musicalKey,
  axis,
  color,
  playingPitchClass,
  editable,
  setKey,
  doFlip,
  doOpposite,
  shiftKey,
}: KeyAnalysisProps) {
  const [fifths, setFifths] = useState(false)
  // which transform's result to preview as a ghost polygon (hovered button).
  // Only armed on real pointing devices — on touch, a tap fires mouseenter but
  // never mouseleave, which would leave the ghost stuck (same test as App.isTouch).
  const [preview, setPreview] = useState<'flip' | 'opposite' | 'left' | 'right' | null>(null)
  const hoverable = useMemo(
    () => typeof window !== 'undefined' && !window.matchMedia('(hover: none) and (pointer: coarse)').matches,
    []
  )

  // circle position -> pitch class: chromatic is identity, fifths steps by 7
  const pcAt = useMemo(() => Array.from({ length: 12 }, (_, p) => (fifths ? fifthsPos(p) : p)), [fifths])

  const polygon = useMemo(() => polygonPoints(musicalKey, pcAt), [musicalKey, pcAt])
  const previewKey = useMemo(() => {
    if (!preview) return null
    if (preview === 'flip') return flip(axis, musicalKey)
    if (preview === 'opposite') return opposite(musicalKey)
    return shift(preview === 'left' ? -1 : 1, musicalKey)
  }, [preview, axis, musicalKey])
  const previewPolygon = useMemo(() => (previewKey ? polygonPoints(previewKey, pcAt) : null), [previewKey, pcAt])

  const togglePitchClass = useCallback(
    (pc: number) => {
      setKey?.((prev) => {
        const next = prev.slice()
        next[pc] = !next[pc]
        return next
      })
    },
    [setKey]
  )

  const vector = useMemo(() => intervalVector(musicalKey), [musicalKey])
  const scales = useMemo(() => identifyScales(musicalKey), [musicalKey])
  const pcs = useMemo(
    () => musicalKey.map((on, pc) => (on ? pitchClassName(pc) : null)).filter(Boolean) as string[],
    [musicalKey]
  )

  // the key's reflection axis passes through (axis/2) and its opposite point
  const axisPos = (axis / 2) % 6
  const axisA = nodeXY(axisPos, RADIUS + 18)
  const axisB = nodeXY(axisPos + 6, RADIUS + 18)

  const canEdit = !!(editable && setKey)
  const transformButtons: { key: 'left' | 'right' | 'flip' | 'opposite'; label: string; action?: () => void }[] = [
    { key: 'left', label: '◀', action: shiftKey && (() => shiftKey(-1)) },
    { key: 'right', label: '▶', action: shiftKey && (() => shiftKey(1)) },
    { key: 'flip', label: 'flip', action: doFlip },
    { key: 'opposite', label: 'opposite', action: doOpposite },
  ]

  return (
    <VizCard
      title="Key"
      subtitle={fifths ? 'circle of fifths' : 'chromatic circle'}
      description="The 12 pitch classes on a circle, with the key drawn as a polygon. Symmetric shapes sound stable under the key transforms, lopsided ones don't. FIFTHS reorders the circle by perfect fifths, where tonal keys cluster into an arc and spread-out shapes read as dissonant. The dashed line is the channel's reflection axis: FLIP mirrors the key across it, OPPOSITE swaps every pitch on and off, and the arrows rotate the key by a semitone (hover any of them to preview the result). Click a note on the circle to toggle it, and watch every other view re-simulate as the key changes. The interval vector counts every note pair by interval class, from semitone (first slot) to tritone (last), giving a fingerprint of the key's color. SCALE names the set when it matches a known scale.">
      <div className="viz-key-toolbar">
        <div className="viz-seg">
          <button className={classNames('viz-seg-option', { active: !fifths })} onClick={() => setFifths(false)}>
            chromatic
          </button>
          <button className={classNames('viz-seg-option', { active: fifths })} onClick={() => setFifths(true)}>
            fifths
          </button>
        </div>
        {canEdit && (
          <div className="viz-seg">
            {transformButtons.map(({ key: k, label, action }) => (
              <button
                key={k}
                className="viz-seg-option"
                onClick={action}
                onMouseEnter={hoverable ? () => setPreview(k) : undefined}
                onMouseLeave={hoverable ? () => setPreview(null) : undefined}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <svg className="viz-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS - 14} className="viz-faint-stroke" fill="none" />
        {!fifths && (
          <line x1={axisA.x} y1={axisA.y} x2={axisB.x} y2={axisB.y} className="viz-axis-line" stroke={color} />
        )}
        {polygon.length > 1 && (
          <polygon
            points={polygon.join(' ')}
            fill={color}
            fillOpacity={previewPolygon ? 0.06 : 0.15}
            stroke={color}
            strokeOpacity={previewPolygon ? 0.35 : 1}
            strokeWidth={1.5}
          />
        )}
        {previewPolygon && previewPolygon.length > 1 && (
          <polygon
            points={previewPolygon.join(' ')}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
        )}
        {pcAt.map((pc, p) => {
          const { x, y } = nodeXY(p, RADIUS - 14)
          const label = nodeXY(p, RADIUS + 4)
          const active = musicalKey[pc]
          const previewActive = previewKey?.[pc]
          const playing = playingPitchClass === pc
          return (
            <g
              key={p}
              className={classNames({ 'viz-key-node': canEdit })}
              onClick={canEdit ? () => togglePitchClass(pc) : undefined}>
              {/* generous invisible hit area so the small nodes are easy to click */}
              {canEdit && <circle cx={x} cy={y} r={13} fill="transparent" />}
              <circle
                cx={x}
                cy={y}
                r={playing ? 8 : 6}
                fill={active ? color : 'none'}
                className={active ? undefined : 'viz-faint-stroke'}
                stroke={playing ? 'currentColor' : active ? color : undefined}
                strokeWidth={playing ? 2 : 1}
              />
              {/* ghost ring showing this node's state under the hovered transform */}
              {previewKey && previewActive && !active && (
                <circle cx={x} cy={y} r={6} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="2.5 2" />
              )}
              <text x={label.x} y={label.y} className={classNames('viz-text', { faint: !active })}>
                {pitchClassName(pc)}
              </text>
            </g>
          )
        })}
      </svg>
      {editable === false && <div className="viz-note">keybd mode: edit pitches on the channel's piano</div>}
      <div className="viz-readout">
        <div>
          <span className="viz-label">pitch classes</span>
          {pcs.length ? pcs.join(' · ') : 'none'}
        </div>
        <div>
          <span className="viz-label">interval vector</span>
          {'⟨' + vector.join(' ') + '⟩'}
        </div>
        <div>
          <span className="viz-label">scale</span>
          {scales.length
            ? scales.slice(0, 3).join(', ') + (scales.length > 3 ? ` +${scales.length - 3} more` : '')
            : pcs.length
            ? 'no common name'
            : '—'}
        </div>
      </div>
    </VizCard>
  )
})
