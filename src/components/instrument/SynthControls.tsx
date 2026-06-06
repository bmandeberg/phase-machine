import React, { useMemo } from 'react'
import Switch from 'react-switch'
import classNames from 'classnames'
import RotaryKnob from '../RotaryKnob'
import Dropdown from '../Dropdown'
import NumInput from '../NumInput'
import EnvelopeControls from './EnvelopeControls'
import { SIGNAL_TYPES, SYNTH_TYPES, themedSwitch } from '../../globals'
import useSynthParams, { oscModifiers } from './useSynthParams'
import { Setter } from '../../types'

const rolloffOptions = ['-12', '-24', '-48', '-96']

type SynthControlsProps = ReturnType<typeof useSynthParams> & {
  theme: string
  grabbing?: boolean
  setGrabbing: Setter<boolean>
}

function SynthControls({
  synthType,
  oscModifier,
  poly,
  setPoly,
  portamento,
  setPortamento,
  modulationType,
  setModulationType,
  harmonicity,
  setHarmonicity,
  fatSpread,
  setFatSpread,
  fatCount,
  setFatCount,
  pulseWidth,
  setPulseWidth,
  pwmFreq,
  setPwmFreq,
  envAttack,
  setEnvAttack,
  envDecay,
  setEnvDecay,
  envSustain,
  setEnvSustain,
  envRelease,
  setEnvRelease,
  cutoff,
  setCutoff,
  resonance,
  setResonance,
  rolloffString,
  updateRolloff,
  filterAttack,
  setFilterAttack,
  filterDecay,
  setFilterDecay,
  filterSustain,
  setFilterSustain,
  filterRelease,
  setFilterRelease,
  filterAmount,
  setFilterAmount,
  synthBase,
  updateSynthType,
  updateOscModifier,
  theme,
  grabbing,
  setGrabbing,
}: SynthControlsProps) {
  const signalTypeOptions = useMemo(
    () =>
      Object.keys(SIGNAL_TYPES).map((instr) => ({
        value: instr,
        label: SIGNAL_TYPES[instr](theme),
      })),
    [theme]
  )
  const synthTypeOptions = useMemo(
    () =>
      Object.keys(SYNTH_TYPES).map((type) => ({
        value: type,
        label: SYNTH_TYPES[type](theme),
      })),
    [theme]
  )
  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, false), [theme])
  const onHandleColor = useMemo(() => themedSwitch('onHandleColor', theme), [theme])

  return (
    <div className="synth-controls">
      <div className="controls-row">
        <div className="controls-module">
          <p className="controls-label">Voicing</p>
          <div className="poly-switch instrument-item">
            <span className={classNames('poly-switch-label', { active: !poly })}>Mono</span>
            <Switch
              className="switch"
              onChange={setPoly}
              checked={poly}
              uncheckedIcon={false}
              checkedIcon={false}
              offColor={offColor}
              onColor={onColor}
              offHandleColor={offHandleColor}
              onHandleColor={onHandleColor}
              width={48}
              height={24}
            />
            <span className={classNames('poly-switch-label', { active: poly })}>Poly</span>
          </div>
        </div>
        <div className="controls-module">
          <p className="controls-label">Oscillator</p>
          <Dropdown
            className="instrument-item"
            label="Wave"
            options={synthTypeOptions}
            setValue={updateSynthType}
            value={synthBase}
          />
          {Object.keys(SIGNAL_TYPES).includes(synthBase) && (
            <Dropdown
              className="instrument-item"
              label="Modifier"
              options={oscModifiers}
              setValue={updateOscModifier}
              value={oscModifier}
            />
          )}
          <RotaryKnob
            className="instrument-item"
            min={0}
            max={1}
            value={portamento}
            setValue={setPortamento}
            label="Portamento"
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            inline={false}
            mute={false}
            theme={theme}
          />
          {(synthType.startsWith('am') || synthType.startsWith('fm')) && (
            <div className="controls-aux">
              <Dropdown
                className="instrument-item"
                label="Modulation"
                options={signalTypeOptions}
                setValue={setModulationType}
                value={modulationType}
                minWidth={95}
              />
              <RotaryKnob
                className="instrument-item"
                min={0}
                max={2}
                value={harmonicity}
                setValue={setHarmonicity}
                label="Harmonicity"
                detent
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline={false}
                mute={false}
                theme={theme}
              />
            </div>
          )}
          {synthType.startsWith('fat') && (
            <div className="controls-aux">
              <RotaryKnob
                className="instrument-item"
                min={10}
                max={40}
                value={fatSpread}
                setValue={setFatSpread}
                label="Detune"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline={false}
                mute={false}
                theme={theme}
              />
              <NumInput
                className="instrument-item fat-count"
                value={fatCount}
                setValue={setFatCount}
                label="# Osc"
                min={2}
                max={5}
                inline={false}
                short={false}
              />
            </div>
          )}
          {synthType === 'pulse' && (
            <div className="controls-aux">
              <RotaryKnob
                className="instrument-item"
                min={-0.5}
                max={0.5}
                value={pulseWidth}
                setValue={setPulseWidth}
                label="Pulse Width"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline={false}
                mute={false}
                theme={theme}
              />
            </div>
          )}
          {synthType === 'pwm' && (
            <div className="controls-aux">
              <RotaryKnob
                className="instrument-item"
                min={0.1}
                max={5}
                value={pwmFreq}
                setValue={setPwmFreq}
                label="PWM Freq"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline={false}
                mute={false}
                theme={theme}
              />
            </div>
          )}
        </div>
      </div>
      <div className="controls-row">
        <EnvelopeControls
          label="Envelope"
          attack={envAttack}
          setAttack={setEnvAttack}
          decay={envDecay}
          setDecay={setEnvDecay}
          sustain={envSustain}
          setSustain={setEnvSustain}
          release={envRelease}
          setRelease={setEnvRelease}
          theme={theme}
          grabbing={grabbing}
          setGrabbing={setGrabbing}
        />
      </div>
      <div className="controls-row">
        <div className="controls-module">
          <p className="controls-label">Filter</p>
          <RotaryKnob
            className="instrument-item"
            min={20}
            max={5000}
            value={cutoff}
            setValue={setCutoff}
            label="Cutoff"
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            inline={false}
            mute={false}
            theme={theme}
            logarithmic
          />
          <RotaryKnob
            className="instrument-item"
            min={0}
            max={15}
            value={resonance}
            setValue={setResonance}
            label="Resonance"
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            inline={false}
            mute={false}
            theme={theme}
          />
          <Dropdown
            className="instrument-item"
            label="Rolloff"
            options={rolloffOptions}
            setValue={updateRolloff}
            value={rolloffString}
          />
        </div>
        <EnvelopeControls
          label="Filter Envelope"
          attack={filterAttack}
          setAttack={setFilterAttack}
          decay={filterDecay}
          setDecay={setFilterDecay}
          sustain={filterSustain}
          setSustain={setFilterSustain}
          release={filterRelease}
          setRelease={setFilterRelease}
          amount={filterAmount}
          setAmount={setFilterAmount}
          theme={theme}
          grabbing={grabbing}
          setGrabbing={setGrabbing}
        />
      </div>
    </div>
  )
}

export default React.memo(SynthControls)
