import React from 'react'
import RotaryKnob from '../RotaryKnob'
import useMetalParams from './useMetalParams'
import { Setter, InstrumentParams } from '../../types'

type MetalControlsProps = ReturnType<typeof useMetalParams> & {
  theme: string
  grabbing?: boolean
  setGrabbing: Setter<boolean>
  savedInstrumentParams?: InstrumentParams
}

function MetalControls({
  metalHarmonicity,
  setMetalHarmonicity,
  metalModulationIndex,
  setMetalModulationIndex,
  metalResonance,
  setMetalResonance,
  metalOctaves,
  setMetalOctaves,
  metalAttack,
  setMetalAttack,
  metalDecay,
  setMetalDecay,
  metalRelease,
  setMetalRelease,
  theme,
  grabbing,
  setGrabbing,
  savedInstrumentParams,
}: MetalControlsProps) {
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
          <p className="controls-label">Metal</p>
          {knob(metalHarmonicity, setMetalHarmonicity, 'Harmonicity', 0.5, 20, savedInstrumentParams?.metalHarmonicity)}
          {knob(
            metalModulationIndex,
            setMetalModulationIndex,
            'Mod Index',
            1,
            100,
            savedInstrumentParams?.metalModulationIndex
          )}
          {knob(metalResonance, setMetalResonance, 'Resonance', 100, 7000, savedInstrumentParams?.metalResonance, true)}
          {knob(metalOctaves, setMetalOctaves, 'Octaves', 0, 8, savedInstrumentParams?.metalOctaves)}
        </div>
        <div className="controls-module metal-envelope">
          <p className="controls-label">Envelope</p>
          {knob(metalAttack, setMetalAttack, 'Attack', 0.001, 1, savedInstrumentParams?.metalAttack)}
          {knob(metalDecay, setMetalDecay, 'Decay', 0.01, 4, savedInstrumentParams?.metalDecay)}
          {knob(metalRelease, setMetalRelease, 'Release', 0.01, 4, savedInstrumentParams?.metalRelease)}
        </div>
      </div>
    </div>
  )
}

export default React.memo(MetalControls)
