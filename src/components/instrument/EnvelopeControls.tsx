import React from 'react'
import RotaryKnob from '../RotaryKnob'
import { Setter } from '../../types'

interface EnvelopeControlsProps {
  label: string
  attack: number
  setAttack: Setter<number>
  decay: number
  setDecay: Setter<number>
  sustain: number
  setSustain: Setter<number>
  release: number
  setRelease: Setter<number>
  // The filter envelope adds an "Amount" (octaves) knob; the amp envelope omits it.
  amount?: number
  setAmount?: Setter<number>
  theme: string
  grabbing?: boolean
  setGrabbing: Setter<boolean>
}

// Reusable ADSR knob group, shared by the synth's amplitude envelope and its
// filter envelope (which additionally shows the Amount knob).
function EnvelopeControls({
  label,
  attack,
  setAttack,
  decay,
  setDecay,
  sustain,
  setSustain,
  release,
  setRelease,
  amount,
  setAmount,
  theme,
  grabbing,
  setGrabbing,
}: EnvelopeControlsProps) {
  return (
    <div className="controls-module envelope-controls">
      <p className="controls-label">{label}</p>
      <RotaryKnob
        className="instrument-item"
        min={0}
        max={1}
        value={attack}
        setValue={setAttack}
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
        value={decay}
        setValue={setDecay}
        label="Decay"
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
        value={sustain}
        setValue={setSustain}
        label="Sustain"
        setGrabbing={setGrabbing}
        grabbing={grabbing}
        inline={false}
        mute={false}
        theme={theme}
      />
      <RotaryKnob
        className="instrument-item"
        min={0}
        max={4}
        value={release}
        setValue={setRelease}
        label="Release"
        setGrabbing={setGrabbing}
        grabbing={grabbing}
        inline={false}
        mute={false}
        theme={theme}
      />
      {setAmount && (
        <RotaryKnob
          className="instrument-item"
          min={1}
          max={5}
          value={amount ?? 0}
          setValue={setAmount}
          label="Amount"
          setGrabbing={setGrabbing}
          grabbing={grabbing}
          inline={false}
          mute={false}
          theme={theme}
        />
      )}
    </div>
  )
}

export default React.memo(EnvelopeControls)
