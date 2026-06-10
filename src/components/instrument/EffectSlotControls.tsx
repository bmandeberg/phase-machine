import React, { useMemo, useCallback } from 'react'
import classNames from 'classnames'
import * as Tone from 'tone'
import RotaryKnob from '../RotaryKnob'
import Dropdown from '../Dropdown'
import Switch from 'react-switch'
import { EFFECTS, WET_EFFECTS, themedSwitch, RATES } from '../../globals'
import { rateToSeconds } from '../../math'
import { EffectSlot, EffectType, Setter } from '../../types'
import { SlotController } from './useEffectParams'
import EqGraph from './EqGraph'
import MultibandGraph from './MultibandGraph'
import VUMeter from './VUMeter'

// Dropdown options: the effect type strings, with friendlier display labels where the
// raw value reads badly. The value (e.g. 'multibandComp', 'pitch') is unchanged
// everywhere — only the shown label differs.
const EFFECT_LABELS: Record<string, string> = { multibandComp: 'multiband comp', pitch: 'pitch shift' }
const EFFECT_OPTIONS = EFFECTS.map((e) => (EFFECT_LABELS[e] ? { value: e, label: EFFECT_LABELS[e] } : e))

interface EffectSlotControlsProps {
  controller: SlotController
  savedSlot?: EffectSlot
  theme: string
  grabbing?: boolean
  setGrabbing: Setter<boolean>
  tempo: number
  color: string
}

function EffectSlotControls({
  controller,
  savedSlot,
  theme,
  grabbing,
  setGrabbing,
  tempo,
  color,
}: EffectSlotControlsProps) {
  const { index, slot, setType, setField, canMoveUp, canMoveDown, move, getNode } = controller

  // Live gain-reduction accessors for the meters (stable: getNode reads a ref). Each
  // returns 0 when the live node isn't (yet) the expected compressor type.
  const getCompReduction = useCallback(() => {
    const n = getNode()
    return n && n.type === 'compressor' ? (n.input as unknown as Tone.Compressor).reduction : 0
  }, [getNode])
  const getMbReductions = useCallback((): [number, number, number] => {
    const n = getNode()
    if (n && n.type === 'multibandComp') {
      const mb = n.input as unknown as Tone.MultibandCompressor
      return [mb.low.reduction, mb.mid.reduction, mb.high.reduction]
    }
    return [0, 0, 0]
  }, [getNode])
  // Live FFT magnitudes (dB) from the EQ's output tap, for the graph's spectrum.
  const getEqSpectrum = useCallback((): Float32Array | null => {
    const n = getNode()
    return n && n.type === 'eq' && n.analyser ? (n.analyser.getValue() as Float32Array) : null
  }, [getNode])

  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, false), [theme])
  const onHandleColor = color

  // Helper to render a knob bound to one slot field.
  const knob = useCallback(
    (
      field: keyof EffectSlot,
      label: string,
      min: number,
      max: number,
      opts?: { logarithmic?: boolean; detent?: boolean }
    ) => (
      <RotaryKnob
        className="instrument-item"
        min={min}
        max={max}
        value={slot[field] as number}
        setValue={(v: number) => setField(field, v)}
        label={label}
        setGrabbing={setGrabbing}
        grabbing={grabbing}
        inline={false}
        mute={false}
        theme={theme}
        logarithmic={opts?.logarithmic}
        detent={opts?.detent}
        resetValue={savedSlot?.[field] as number | undefined}
      />
    ),
    [slot, setField, setGrabbing, grabbing, theme, savedSlot]
  )

  // ── tempo-synced delay (per slot) ──────────────────────────────────────────
  const syncedDelayOptions = useMemo(() => RATES.filter((rate) => rateToSeconds(rate, tempo) <= 1), [tempo])
  const syncedDelay = useMemo(
    () => (typeof slot.syncDelayTime === 'string' ? slot.syncDelayTime : null),
    [slot.syncDelayTime]
  )
  const setSyncedDelay = useCallback((rate: string) => setField('syncDelayTime', rate), [setField])
  const toggleSyncDelay = useCallback(
    (on: boolean) => {
      if (!on) {
        setField('syncDelayTime', false)
        return
      }
      let nearest = syncedDelayOptions[0]
      let bestDiff = Infinity
      for (const rate of syncedDelayOptions) {
        const diff = Math.abs(rateToSeconds(rate, tempo) - slot.delayTime)
        if (diff < bestDiff) {
          bestDiff = diff
          nearest = rate
        }
      }
      setField('syncDelayTime', nearest)
    },
    [setField, syncedDelayOptions, tempo, slot.delayTime]
  )

  const showAmount = WET_EFFECTS.includes(slot.type)

  return (
    <div className={classNames('effect-slot', { active: slot.type !== 'none', 'eq-slot': slot.type === 'eq' })}>
      <span className="effect-slot-num">{index + 1}</span>
      <div className="effect-slot-type">
        <Dropdown
          className="instrument-item"
          label="Effect"
          options={EFFECT_OPTIONS}
          setValue={(t: string) => setType(t as EffectType)}
          value={slot.type}
          container=".modal-content"
        />
        {/* the EQ's Mid Q sits under the dropdown, to the left of the graph */}
        {slot.type === 'eq' && knob('eqMidQ', 'Mid Q', 0.1, 10)}
      </div>

      {slot.type !== 'none' && (
        <div className="effect-slot-controls">
          {showAmount && knob('wet', 'Amount', 0, 1)}

          {slot.type === 'chorus' && (
            <>
              {knob('chorusDepth', 'Depth', 0, 1, { logarithmic: true })}
              {knob('chorusDelayTime', 'Delay', 0.1, 10)}
              {knob('chorusFreq', 'Freq', 1, 20, { logarithmic: true })}
              {knob('chorusSpread', 'Stereo', 0, 180)}
            </>
          )}

          {slot.type === 'distortion' && knob('distortion', 'Drive', 0, 3)}

          {slot.type === 'delay' && (
            <>
              <div className="switch-container instrument-item">
                <Switch
                  className="switch"
                  onChange={toggleSyncDelay}
                  checked={!!slot.syncDelayTime}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  offColor={offColor}
                  onColor={onColor}
                  offHandleColor={offHandleColor}
                  onHandleColor={onHandleColor}
                  width={48}
                  height={24}
                />
                <p className="switch-label">Sync</p>
              </div>
              {!slot.syncDelayTime && knob('delayTime', 'Time', 0, 1)}
              {slot.syncDelayTime && (
                <Dropdown
                  className="instrument-item"
                  label="Time"
                  options={syncedDelayOptions}
                  setValue={setSyncedDelay}
                  value={syncedDelay}
                  placeholder="Select Rate"
                  noTextTransform
                  container=".modal-content"
                />
              )}
              {knob('delayFeedback', 'Feedback', 0, 1)}
            </>
          )}

          {slot.type === 'reverb' && (
            <>
              {knob('reverbDecay', 'Decay', 0, 4)}
              {knob('reverbPreDelay', 'Pre Delay', 0, 0.5)}
            </>
          )}

          {slot.type === 'vibrato' && (
            <>
              {knob('vibratoDepth', 'Depth', 0, 1)}
              {knob('vibratoFreq', 'Freq', 1, 20, { logarithmic: true })}
            </>
          )}

          {slot.type === 'bitcrusher' && knob('bits', 'Bits', 1, 16)}

          {slot.type === 'pitch' && (
            <>
              {knob('pitchShift', 'Pitch', -12, 12, { detent: true })}
              {knob('pitchFeedback', 'Feedback', 0, 1)}
            </>
          )}

          {slot.type === 'phaser' && (
            <>
              {knob('phaserFreq', 'Rate', 0.1, 10, { logarithmic: true })}
              {knob('phaserOctaves', 'Octaves', 0, 6)}
              {knob('phaserBaseFreq', 'Base', 50, 2000, { logarithmic: true })}
              {knob('phaserQ', 'Q', 0, 20)}
            </>
          )}

          {slot.type === 'compressor' && (
            <>
              {knob('compThreshold', 'Threshold', -60, 0)}
              {knob('compRatio', 'Ratio', 1, 20)}
              {knob('compAttack', 'Attack', 0, 1)}
              {knob('compRelease', 'Release', 0, 1)}
              <VUMeter getReduction={getCompReduction} color={color} />
            </>
          )}

          {slot.type === 'multibandComp' && (
            <div className="mb-controls">
              <MultibandGraph
                slot={slot}
                setField={setField}
                color={color}
                setGrabbing={setGrabbing}
                getReductions={getMbReductions}
              />
              <div className="mb-knobs">
                {knob('mbRatio', 'Ratio', 1, 20)}
                {knob('mbAttack', 'Attack', 0, 1)}
                {knob('mbRelease', 'Release', 0, 1)}
              </div>
            </div>
          )}

          {slot.type === 'eq' && (
            <EqGraph
              slot={slot}
              setField={setField}
              color={color}
              setGrabbing={setGrabbing}
              getSpectrum={getEqSpectrum}
              sampleRate={Tone.getContext().sampleRate}
            />
          )}
        </div>
      )}

      {/* reorder the slot within the series chain (top = first effect hit) */}
      <div className="effect-slot-move">
        <button
          type="button"
          className="effect-slot-move-btn"
          aria-label="Move effect earlier in the chain"
          title="Move earlier in the chain"
          disabled={!canMoveUp}
          onClick={() => move(-1)}
        >
          ▲
        </button>
        <button
          type="button"
          className="effect-slot-move-btn"
          aria-label="Move effect later in the chain"
          title="Move later in the chain"
          disabled={!canMoveDown}
          onClick={() => move(1)}
        >
          ▼
        </button>
      </div>
    </div>
  )
}

export default React.memo(EffectSlotControls)
