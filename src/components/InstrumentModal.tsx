import React, { useState, useEffect, useCallback, useRef } from 'react'
import Instrument from './Instrument'
import RotaryKnob from './RotaryKnob'
import classNames from 'classnames'
import { InstrumentParams, InstrumentRefs, EffectSlot, EffectSlots, GainRef, PannerRef, Setter } from '../types'
import { SlotNodesRef } from '../hooks/useInstruments'
import useSynthParams from './instrument/useSynthParams'
import useSamplerParams from './instrument/useSamplerParams'
import useMetalParams from './instrument/useMetalParams'
import usePluckParams from './instrument/usePluckParams'
import useEffectParams from './instrument/useEffectParams'
import SynthControls from './instrument/SynthControls'
import SamplerControls from './instrument/SamplerControls'
import MetalControls from './instrument/MetalControls'
import PluckControls from './instrument/PluckControls'
import EffectControls from './instrument/EffectControls'
import './InstrumentModal.scss'

interface InstrumentModalProps {
  instrumentOn?: boolean
  setInstrumentOn: Setter<boolean>
  instrumentType: string
  setInstrumentType: Setter<string>
  theme: string
  instrumentParams: InstrumentParams
  setInstrumentParams: Setter<InstrumentParams>
  savedInstrumentParams?: InstrumentParams
  instruments: InstrumentRefs
  gainNode: GainRef
  pannerNode: PannerRef
  slotNodesRef: SlotNodesRef
  rebuildEffectChain: (slots: EffectSlots) => void
  grabbing?: boolean
  setGrabbing: Setter<boolean>
  tempo: number
  color: string
}

export default function InstrumentModal({
  instrumentOn,
  setInstrumentOn,
  instrumentType,
  setInstrumentType,
  theme,
  instrumentParams,
  setInstrumentParams,
  savedInstrumentParams,
  instruments,
  gainNode,
  pannerNode,
  slotNodesRef,
  rebuildEffectChain,
  grabbing,
  setGrabbing,
  tempo,
  color,
}: InstrumentModalProps) {
  const [gain, setGain] = useState(instrumentParams.gain)
  const [pan, setPan] = useState(instrumentParams.pan)

  // Single debounced writer shared by every parameter (synth, sampler, effect,
  // gain). One shared timer coalesces rapid edits into one setInstrumentParams.
  // NB: pending updates accumulate into a ref keyed by param — the timer only
  // schedules the *flush*. Each call must NOT carry just its own {param: value},
  // or a second param updating within the window would clobber the first (this
  // is what dropped tempo-synced delay: selecting a rate sets syncDelayTime, then
  // the derived delayTime update landed last and the syncDelayTime write was lost).
  const instrumentParamsDebounce = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pendingInstrumentParams = useRef<Partial<InstrumentParams>>({})
  // pending per-slot field edits, keyed by slot index, merged into effects[] on flush
  const pendingSlots = useRef<Record<number, Partial<EffectSlot>>>({})

  const flushParams = useCallback(() => {
    const flat = pendingInstrumentParams.current
    const slotEdits = pendingSlots.current
    pendingInstrumentParams.current = {}
    pendingSlots.current = {}
    setInstrumentParams((prev: InstrumentParams) => {
      const next = Object.assign({}, prev, flat)
      const indices = Object.keys(slotEdits)
      if (indices.length) {
        next.effects = prev.effects.map((slot, i) =>
          slotEdits[i] ? Object.assign({}, slot, slotEdits[i]) : slot
        ) as EffectSlots
      }
      return next
    })
  }, [setInstrumentParams])

  const scheduleFlush = useCallback(() => {
    clearTimeout(instrumentParamsDebounce.current)
    instrumentParamsDebounce.current = setTimeout(flushParams, 200)
  }, [flushParams])

  // Single debounced writer for the flat (synth/sampler/gain) params. Pending edits
  // accumulate into a ref keyed by param so a second param updating within the 200ms
  // window can't clobber the first; the timer only schedules the flush.
  const updateInstrumentParams = useCallback(
    (param: string, value: InstrumentParams[keyof InstrumentParams]) => {
      pendingInstrumentParams.current = Object.assign({}, pendingInstrumentParams.current, { [param]: value })
      scheduleFlush()
    },
    [scheduleFlush]
  )

  // Nested writer for one effect slot's field — immutably updates effects[index].
  const updateSlotParam = useCallback(
    (index: number, field: string, value: number | boolean | string) => {
      pendingSlots.current = Object.assign({}, pendingSlots.current, {
        [index]: Object.assign({}, pendingSlots.current[index], { [field]: value }),
      })
      scheduleFlush()
    },
    [scheduleFlush]
  )

  // Reorder writer: a slot move hands back the whole reordered effects array. It
  // supersedes any queued per-field edits (the array already carries the current slot
  // states, in-flight edits included), so drop them and write the array immediately —
  // a discrete click doesn't need the knob-drag debounce.
  const reorderSlots = useCallback(
    (nextEffects: EffectSlots) => {
      pendingSlots.current = {}
      setInstrumentParams((prev: InstrumentParams) => Object.assign({}, prev, { effects: nextEffects }))
    },
    [setInstrumentParams]
  )

  useEffect(() => {
    if (gainNode.current) {
      gainNode.current.set({ gain })
    }
    updateInstrumentParams('gain', gain)
  }, [gainNode, gain, updateInstrumentParams])

  useEffect(() => {
    if (pannerNode.current) {
      pannerNode.current.set({ pan })
    }
    updateInstrumentParams('pan', pan)
  }, [pannerNode, pan, updateInstrumentParams])

  // These hooks each own their group's state + the effects that push values to
  // the live Tone nodes. They're called unconditionally (never behind the
  // instrumentType branch) so their effects fire identically to when they lived
  // inline at the top of this component.
  const metalParams = useMetalParams(instruments, instrumentParams, updateInstrumentParams)
  const pluckParams = usePluckParams(instruments, instrumentParams, updateInstrumentParams)
  const synthParams = useSynthParams(instruments, instrumentParams, updateInstrumentParams)
  const samplerParams = useSamplerParams(instruments, instrumentParams, updateInstrumentParams)
  const effectSlots = useEffectParams(
    slotNodesRef,
    rebuildEffectChain,
    instrumentParams.effects,
    updateSlotParam,
    reorderSlots,
    savedInstrumentParams?.effects,
    tempo
  )

  return (
    <div className={classNames('instrument-modal', { short: instrumentType !== 'synth' })}>
      <div className="instrument-type">
        <Instrument
          className="modal-instrument"
          instrumentOn={instrumentOn}
          setInstrumentOn={setInstrumentOn}
          instrumentType={instrumentType}
          setInstrumentType={setInstrumentType}
          theme={theme}
          color={color}
        />
        <RotaryKnob
          className="instrument-item"
          min={0}
          max={1}
          value={gain}
          setValue={setGain}
          label="Volume"
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          inline={true}
          mute={false}
          theme={theme}
          resetValue={savedInstrumentParams?.gain}
        />
        <RotaryKnob
          className="instrument-item pan-knob"
          min={-1}
          max={1}
          value={pan}
          setValue={setPan}
          label="Pan"
          detent
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          inline={true}
          mute={false}
          theme={theme}
          resetValue={savedInstrumentParams?.pan}
        />
      </div>
      <div className="instrument-controls">
        {instrumentType === 'synth' && (
          <SynthControls
            {...synthParams}
            savedInstrumentParams={savedInstrumentParams}
            theme={theme}
            grabbing={grabbing}
            setGrabbing={setGrabbing}
          />
        )}
        {instrumentType === 'metal' && (
          <MetalControls
            {...metalParams}
            savedInstrumentParams={savedInstrumentParams}
            theme={theme}
            grabbing={grabbing}
            setGrabbing={setGrabbing}
          />
        )}
        {instrumentType === 'pluck' && (
          <PluckControls
            {...pluckParams}
            savedInstrumentParams={savedInstrumentParams}
            theme={theme}
            grabbing={grabbing}
            setGrabbing={setGrabbing}
          />
        )}
        {instrumentType !== 'synth' && instrumentType !== 'metal' && instrumentType !== 'pluck' && (
          <SamplerControls
            {...samplerParams}
            savedInstrumentParams={savedInstrumentParams}
            theme={theme}
            grabbing={grabbing}
            setGrabbing={setGrabbing}
          />
        )}
        <EffectControls
          slots={effectSlots}
          theme={theme}
          grabbing={grabbing}
          setGrabbing={setGrabbing}
          tempo={tempo}
          color={color}
        />
      </div>
    </div>
  )
}
