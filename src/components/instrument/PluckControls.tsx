import React from 'react'
import RotaryKnob from '../RotaryKnob'
import usePluckParams from './usePluckParams'
import { Setter, InstrumentParams } from '../../types'

type PluckControlsProps = ReturnType<typeof usePluckParams> & {
  theme: string
  grabbing?: boolean
  setGrabbing: Setter<boolean>
  savedInstrumentParams?: InstrumentParams
}

function PluckControls({
  pluckAttackNoise,
  setPluckAttackNoise,
  pluckDampening,
  setPluckDampening,
  pluckResonance,
  setPluckResonance,
  pluckRelease,
  setPluckRelease,
  theme,
  grabbing,
  setGrabbing,
  savedInstrumentParams,
}: PluckControlsProps) {
  const knob = (
    value: number,
    setValue: Setter<number>,
    label: string,
    min: number,
    max: number,
    reset?: number,
    logarithmic?: boolean
  ) => (
    <RotaryKnob
      className="instrument-item"
      min={min}
      max={max}
      value={value}
      setValue={setValue}
      label={label}
      setGrabbing={setGrabbing}
      grabbing={grabbing}
      inline={false}
      mute={false}
      theme={theme}
      logarithmic={logarithmic}
      resetValue={reset}
    />
  )
  return (
    <div className="sampler-controls">
      <div className="controls-row">
        <div className="controls-module">
          <p className="controls-label">Pluck</p>
          {knob(pluckAttackNoise, setPluckAttackNoise, 'Attack Noise', 0.1, 20, savedInstrumentParams?.pluckAttackNoise)}
          {knob(pluckDampening, setPluckDampening, 'Dampening', 100, 7000, savedInstrumentParams?.pluckDampening, true)}
          {knob(pluckResonance, setPluckResonance, 'Resonance', 0, 0.99, savedInstrumentParams?.pluckResonance)}
          {knob(pluckRelease, setPluckRelease, 'Release', 0.01, 4, savedInstrumentParams?.pluckRelease)}
        </div>
      </div>
    </div>
  )
}

export default React.memo(PluckControls)
