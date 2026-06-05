import React from 'react'
import RotaryKnob from '../RotaryKnob'
import useSamplerParams from './useSamplerParams'
import { Setter } from '../../types'

type SamplerControlsProps = ReturnType<typeof useSamplerParams> & {
  theme: string
  grabbing?: boolean
  setGrabbing: Setter<boolean>
}

function SamplerControls({
  samplerAttack,
  setSamplerAttack,
  samplerRelease,
  setSamplerRelease,
  theme,
  grabbing,
  setGrabbing,
}: SamplerControlsProps) {
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
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(SamplerControls)
