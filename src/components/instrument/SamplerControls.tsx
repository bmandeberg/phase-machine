import React from 'react'
import RotaryKnob from '../RotaryKnob'
import Dropdown from '../Dropdown'
import useSamplerParams from './useSamplerParams'
import { Setter, InstrumentParams } from '../../types'
import { NOTE_STACK_OPTIONS, STACKABLE_INSTRUMENTS } from '../../globals'

type SamplerControlsProps = ReturnType<typeof useSamplerParams> & {
  theme: string
  grabbing?: boolean
  setGrabbing: Setter<boolean>
  savedInstrumentParams?: InstrumentParams
  instrumentType: string
}

function SamplerControls({
  samplerAttack,
  setSamplerAttack,
  samplerRelease,
  setSamplerRelease,
  samplerStack,
  setSamplerStack,
  theme,
  grabbing,
  setGrabbing,
  savedInstrumentParams,
  instrumentType,
}: SamplerControlsProps) {
  // Stacking transposed copies of the note only makes sense for the pitched samplers
  // (piano/bass/etc.), not the loop/drum banks.
  const showStack = STACKABLE_INSTRUMENTS.includes(instrumentType)

  return (
    <div className="sampler-controls">
      <div className="controls-row">
        <div className="controls-module">
          <p className="controls-label">Envelope</p>
          <RotaryKnob
            className="instrument-item"
            min={0}
            max={1}
            value={samplerAttack}
            setValue={setSamplerAttack}
            label="Attack"
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            inline={false}
            mute={false}
            theme={theme}
            resetValue={savedInstrumentParams?.samplerAttack}
          />
          <RotaryKnob
            className="instrument-item"
            min={0}
            max={1}
            value={samplerRelease}
            setValue={setSamplerRelease}
            label="Release"
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            inline={false}
            mute={false}
            theme={theme}
            resetValue={savedInstrumentParams?.samplerRelease}
          />
        </div>
        {showStack && (
          <div className="controls-module">
            <p className="controls-label">Stack</p>
            <Dropdown
              className="instrument-item"
              label="Notes"
              options={NOTE_STACK_OPTIONS}
              setValue={setSamplerStack}
              value={samplerStack}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(SamplerControls)
