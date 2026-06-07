import React, { useState, useEffect, useCallback, useRef } from 'react'
import Instrument from './Instrument'
import RotaryKnob from './RotaryKnob'
import classNames from 'classnames'
import { InstrumentParams, InstrumentRefs, EffectRefs, GainRef, PannerRef, Setter } from '../types'
import useSynthParams from './instrument/useSynthParams'
import useSamplerParams from './instrument/useSamplerParams'
import useEffectParams from './instrument/useEffectParams'
import SynthControls from './instrument/SynthControls'
import SamplerControls from './instrument/SamplerControls'
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
  effects: EffectRefs
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
  effects,
  grabbing,
  setGrabbing,
  tempo,
  color,
}: InstrumentModalProps) {
  const [gain, setGain] = useState(instrumentParams.gain)
  const [pan, setPan] = useState(instrumentParams.pan)

  // Single debounced writer shared by every parameter (synth, sampler, effect,
  // gain). One shared timer means rapid edits across params coalesce into one
  // setInstrumentParams — preserved exactly as the original component had it.
  const instrumentParamsDebounce = useRef<ReturnType<typeof setTimeout>>(undefined)
  const updateInstrumentParams = useCallback(
    (param: string, value: InstrumentParams[keyof InstrumentParams]) => {
      clearTimeout(instrumentParamsDebounce.current)
      const debounceTime = 200
      instrumentParamsDebounce.current = setTimeout(() => {
        setInstrumentParams((instrumentParams: InstrumentParams) =>
          Object.assign({}, instrumentParams, { [param]: value })
        )
      }, debounceTime)
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
  const synthParams = useSynthParams(instruments, instrumentParams, updateInstrumentParams)
  const samplerParams = useSamplerParams(instruments, instrumentParams, updateInstrumentParams)
  const effectParams = useEffectParams(instruments, effects, gainNode, instrumentParams, updateInstrumentParams, tempo)

  return (
    <div className={classNames('instrument-modal', { short: instrumentType !== 'synth' })}>
      <div className="instrument-type">
        <Instrument
          className="modal-instrument"
          instrumentOn={instrumentOn}
          setInstrumentOn={setInstrumentOn}
          instrumentType={instrumentType}
          setInstrumentType={setInstrumentType}
          small={false}
          theme={theme}
          mute={false}
          inModal={true}
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
        {instrumentType !== 'synth' && (
          <SamplerControls
            {...samplerParams}
            savedInstrumentParams={savedInstrumentParams}
            theme={theme}
            grabbing={grabbing}
            setGrabbing={setGrabbing}
          />
        )}
        <EffectControls
          {...effectParams}
          savedInstrumentParams={savedInstrumentParams}
          effects={effects}
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
