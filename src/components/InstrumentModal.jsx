import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import Instrument from './Instrument'
import RotaryKnob from './RotaryKnob'
import Dropdn from './Dropdn'
import NumInput from './NumInput'
import Switch from 'react-switch'
import { SAMPLER_INSTRUMENTS, SIGNAL_TYPES, EFFECTS, themedSwitch, RATES } from '../globals'
import * as Tone from 'tone'
import './InstrumentModal.scss'

const rolloffOptions = ['-12', '-24', '-48', '-96']

export default function InstrumentModal({
  instrumentOn,
  setInstrumentOn,
  instrumentType,
  setInstrumentType,
  theme,
  instrumentParams,
  setInstrumentParams,
  instruments,
  effects,
  grabbing,
  setGrabbing,
  linearKnobs,
}) {
  // synth
  const [portamento, setPortamento] = useState(instrumentParams.portamento)
  const [modulationType, setModulationType] = useState(instrumentParams.modulationType)
  const [harmonicity, setHarmonicity] = useState(instrumentParams.harmonicity)
  const [fatSpread, setFatSpread] = useState(instrumentParams.fatSpread)
  const [fatCount, setFatCount] = useState(instrumentParams.fatCount)
  const [pulseWidth, setPulseWidth] = useState(instrumentParams.pulseWidth)
  const [pwmFreq, setPwmFreq] = useState(instrumentParams.pwmFreq)
  const [envAttack, setEnvAttack] = useState(instrumentParams.envAttack)
  const [envDecay, setEnvDecay] = useState(instrumentParams.envDecay)
  const [envSustain, setEnvSustain] = useState(instrumentParams.envSustain)
  const [envRelease, setEnvRelease] = useState(instrumentParams.envRelease)
  const [cutoff, setCutoff] = useState(instrumentParams.cutoff)
  const [resonance, setResonance] = useState(instrumentParams.resonance)
  const [rolloff, setRolloff] = useState(instrumentParams.rolloff)
  const [filterAttack, setFilterAttack] = useState(instrumentParams.filterAttack)
  const [filterDecay, setFilterDecay] = useState(instrumentParams.filterDecay)
  const [filterSustain, setFilterSustain] = useState(instrumentParams.filterSustain)
  const [filterRelease, setFilterRelease] = useState(instrumentParams.filterRelease)
  const [filterAmount, setFilterAmount] = useState(instrumentParams.filterAmount)
  // sampler
  const [samplerAttack, setSamplerAttack] = useState(instrumentParams.samplerAttack)
  const [samplerRelease, setSamplerRelease] = useState(instrumentParams.samplerRelease)
  // effects
  const [effectType, setEffectType] = useState(instrumentParams.effectType)
  const [effectWet, setEffectWet] = useState(instrumentParams.effectWet)
  const [chorusDepth, setChorusDepth] = useState(instrumentParams.chorusDepth)
  const [chorusDelayTime, setChorusDelayTime] = useState(instrumentParams.chorusDelayTime)
  const [chorusFreq, setChorusFreq] = useState(instrumentParams.chorusFreq)
  const [chorusSpread, setChorusSpread] = useState(instrumentParams.chorusSpread)
  const [distortion, setDistortion] = useState(instrumentParams.distortion)
  const [syncDelayTime, setSyncDelayTime] = useState(false)
  const [delayTime, setDelayTime] = useState(instrumentParams.delayTime)
  const [delayFeedback, setDelayFeedback] = useState(instrumentParams.delayFeedback)
  const [reverbDecay, setReverbDecay] = useState(instrumentParams.reverbDecay)
  const [reverbPreDelay, setReverbPreDelay] = useState(instrumentParams.reverbPreDelay)
  const [vibratoDepth, setVibratoDepth] = useState(instrumentParams.vibratoDepth)
  const [vibratoFreq, setVibratoFreq] = useState(instrumentParams.vibratoFreq)

  const effectRef = useRef()

  const rolloffString = useMemo(() => `${rolloff}`, [rolloff])
  const updateRolloff = useCallback((r) => {
    setRolloff(+r)
  }, [])

  const setSyncedDelay = useCallback((rate) => {
    setDelayTime(Tone.Transport.toSeconds(rate))
  }, [])
  const syncedDelayOptions = useMemo(() => {
    return RATES.filter((rate) => Tone.Transport.toSeconds(rate) <= 1)
  }, [])
  const syncedDelay = useMemo(() => {
    for (let i = 0; i < RATES.length; i++) {
      if (delayTime === Tone.Transport.toSeconds(RATES[i])) {
        return RATES[i]
      }
    }
    return null
  }, [delayTime])

  const instrumentParamsDebounce = useRef()
  const updateInstrumentParams = useCallback(
    (param, value) => {
      clearTimeout(instrumentParamsDebounce.current)
      const debounceTime = 200
      instrumentParamsDebounce.current = setTimeout(() => {
        setInstrumentParams((instrumentParams) => Object.assign({}, instrumentParams, { [param]: value }))
      }, debounceTime)
    },
    [setInstrumentParams]
  )

  // update synth params

  useEffect(() => {
    instruments.synthInstrument.current.portamento = portamento
    updateInstrumentParams('portamento', portamento)
  }, [instruments.synthInstrument, portamento, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.modulationType = modulationType
    updateInstrumentParams('modulationType', modulationType)
  }, [instruments.synthInstrument, modulationType, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.set({ harmonicity })
    updateInstrumentParams('harmonicity', harmonicity)
  }, [harmonicity, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.spread = fatSpread
    updateInstrumentParams('fatSpread', fatSpread)
  }, [fatSpread, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.count = fatCount
    updateInstrumentParams('fatCount', fatCount)
  }, [fatCount, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.set({ width: pulseWidth })
    updateInstrumentParams('pulseWidth', pulseWidth)
  }, [instruments.synthInstrument, pulseWidth, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.set({ modulationFrequency: pwmFreq })
    updateInstrumentParams('pwmFreq', pwmFreq)
  }, [instruments.synthInstrument, pwmFreq, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.attack = envAttack
    updateInstrumentParams('envAttack', envAttack)
  }, [envAttack, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.decay = envDecay
    updateInstrumentParams('envDecay', envDecay)
  }, [envDecay, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.sustain = envSustain
    updateInstrumentParams('envSustain', envSustain)
  }, [envSustain, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.release = envRelease
    updateInstrumentParams('envRelease', envRelease)
  }, [envRelease, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filter.set({ Q: resonance })
    updateInstrumentParams('resonance', resonance)
  }, [instruments.synthInstrument, resonance, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filter.rolloff = rolloff
    updateInstrumentParams('rolloff', rolloff)
  }, [instruments.synthInstrument, rolloff, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.baseFrequency = cutoff
    updateInstrumentParams('cutoff', cutoff)
  }, [cutoff, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.attack = filterAttack
    updateInstrumentParams('filterAttack', filterAttack)
  }, [filterAttack, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.decay = filterDecay
    updateInstrumentParams('filterDecay', filterDecay)
  }, [filterDecay, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.sustain = filterSustain
    updateInstrumentParams('filterSustain', filterSustain)
  }, [filterSustain, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.release = filterRelease
    updateInstrumentParams('filterRelease', filterRelease)
  }, [filterRelease, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.octaves = filterAmount
    updateInstrumentParams('filterAmount', filterAmount)
  }, [filterAmount, instruments.synthInstrument, updateInstrumentParams])

  // update sampler params

  useEffect(() => {
    instruments.pianoInstrument.current.attack = samplerAttack
    instruments.marimbaInstrument.current.attack = samplerAttack
    instruments.drumsInstrument.current.attack = samplerAttack
    updateInstrumentParams('samplerAttack', samplerAttack)
  }, [
    instruments.drumsInstrument,
    instruments.marimbaInstrument,
    instruments.pianoInstrument,
    samplerAttack,
    updateInstrumentParams,
  ])

  useEffect(() => {
    instruments.pianoInstrument.current.release = samplerRelease
    instruments.marimbaInstrument.current.release = samplerRelease
    instruments.drumsInstrument.current.release = samplerRelease
    updateInstrumentParams('samplerRelease', samplerRelease)
  }, [
    instruments.drumsInstrument,
    instruments.marimbaInstrument,
    instruments.pianoInstrument,
    samplerRelease,
    updateInstrumentParams,
  ])

  // update effect params

  useEffect(() => {
    if (effectType === 'chorus') {
      effects.chorusEffect.current.start()
    } else {
      effects.chorusEffect.current.stop()
    }
    let effect
    switch (effectType) {
      case 'chorus':
        effect = effects.chorusEffect.current
        break
      case 'distortion':
        effect = effects.distortionEffect.current
        break
      case 'delay':
        effect = effects.delayEffect.current
        break
      case 'reverb':
        effect = effects.reverbEffect.current
        break
      case 'vibrato':
        effect = effects.vibratoEffect.current
        break
      default:
        effect = null
    }
    if (effectRef.current) {
      Object.values(instruments).forEach((instrument) => {
        instrument.current.disconnect(effectRef.current)
      })
    }
    if (effect) {
      effectRef.current = effect
      Object.values(instruments).forEach((instrument) => {
        instrument.current.connect(effect)
      })
    } else {
      effectRef.current = Tone.getDestination()
      Object.values(instruments).forEach((instrument) => {
        instrument.current.toDestination()
      })
    }
    updateInstrumentParams('effectType', effectType)
  }, [effectType, effects, instruments, updateInstrumentParams])

  useEffect(() => {
    Object.values(effects).forEach((effect) => {
      effect.current.set({ wet: effectWet })
    })
    updateInstrumentParams('effectWet', effectWet)
  }, [effectWet, effects, updateInstrumentParams])

  useEffect(() => {
    effects.chorusEffect.current.depth = chorusDepth
    updateInstrumentParams('chorusDepth', chorusDepth)
  }, [chorusDepth, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    effects.chorusEffect.current.delayTime = chorusDelayTime
    updateInstrumentParams('chorusDelayTime', chorusDelayTime)
  }, [chorusDelayTime, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    effects.chorusEffect.current.set({ frequency: chorusFreq })
    updateInstrumentParams('chorusFreq', chorusFreq)
  }, [chorusFreq, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    effects.chorusEffect.current.spread = chorusSpread
    updateInstrumentParams('chorusSpread', chorusSpread)
  }, [chorusSpread, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    effects.distortionEffect.current.distortion = distortion
    updateInstrumentParams('distortion', distortion)
  }, [distortion, effects.distortionEffect, updateInstrumentParams])

  useEffect(() => {
    effects.delayEffect.current.set({ delayTime })
    updateInstrumentParams('delayTime', delayTime)
  }, [delayTime, effects.delayEffect, updateInstrumentParams])

  useEffect(() => {
    effects.delayEffect.current.set({ feedback: delayFeedback })
    updateInstrumentParams('delayFeedback', delayFeedback)
  }, [delayFeedback, effects.delayEffect, updateInstrumentParams])

  useEffect(() => {
    effects.reverbEffect.current.decay = reverbDecay
    updateInstrumentParams('reverbDecay', reverbDecay)
  }, [effects.reverbEffect, reverbDecay, updateInstrumentParams])

  useEffect(() => {
    effects.reverbEffect.current.preDelay = reverbPreDelay
    updateInstrumentParams('reverbPreDelay', reverbPreDelay)
  }, [effects.reverbEffect, reverbPreDelay, updateInstrumentParams])

  useEffect(() => {
    effects.vibratoEffect.current.set({ depth: vibratoDepth })
    updateInstrumentParams('vibratoDepth', vibratoDepth)
  }, [effects.vibratoEffect, updateInstrumentParams, vibratoDepth])

  useEffect(() => {
    effects.vibratoEffect.current.set({ frequency: vibratoFreq })
    updateInstrumentParams('vibratoFreq', vibratoFreq)
  }, [effects.vibratoEffect, updateInstrumentParams, vibratoFreq])

  const samplerInstrument = useMemo(() => SAMPLER_INSTRUMENTS.includes(instrumentType), [instrumentType])

  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, false), [theme])
  const onHandleColor = useMemo(() => themedSwitch('onHandleColor', theme), [theme])

  return (
    <div className="instrument-modal">
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
        />
      </div>
      <div className="instrument-controls">
        {!samplerInstrument && (
          <div className="synth-controls">
            <div className="controls-row">
              <div className="controls-module">
                <p className="controls-label">Oscillator</p>
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
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                {(instrumentType.startsWith('am') || instrumentType.startsWith('fm')) && (
                  <div className="controls-aux">
                    <Dropdn
                      className="instrument-item"
                      label="Modulation"
                      options={SIGNAL_TYPES}
                      setValue={setModulationType}
                      value={modulationType}
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
                      linearKnobs={linearKnobs}
                      theme={theme}
                    />
                  </div>
                )}
                {instrumentType.startsWith('fat') && (
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
                      linearKnobs={linearKnobs}
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
                {instrumentType === 'pulse' && (
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
                      linearKnobs={linearKnobs}
                      theme={theme}
                    />
                  </div>
                )}
                {instrumentType === 'pwm' && (
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
                      linearKnobs={linearKnobs}
                      theme={theme}
                    />
                  </div>
                )}
              </div>
              <div className="controls-module envelope-controls">
                <p className="controls-label">Envelope</p>
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={1}
                  value={envAttack}
                  setValue={setEnvAttack}
                  label="Attack"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={1}
                  value={envDecay}
                  setValue={setEnvDecay}
                  label="Decay"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={1}
                  value={envSustain}
                  setValue={setEnvSustain}
                  label="Sustain"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={4}
                  value={envRelease}
                  setValue={setEnvRelease}
                  label="Release"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
              </div>
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
                  linearKnobs={linearKnobs}
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
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <Dropdn
                  className="instrument-item"
                  label="Rolloff"
                  options={rolloffOptions}
                  setValue={updateRolloff}
                  value={rolloffString}
                />
              </div>
              <div className="controls-module envelope-controls">
                <p className="controls-label">Filter Envelope</p>
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={1}
                  value={filterAttack}
                  setValue={setFilterAttack}
                  label="Attack"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={1}
                  value={filterDecay}
                  setValue={setFilterDecay}
                  label="Decay"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={1}
                  value={filterSustain}
                  setValue={setFilterSustain}
                  label="Sustain"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={4}
                  value={filterRelease}
                  setValue={setFilterRelease}
                  label="Release"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <RotaryKnob
                  className="instrument-item"
                  min={1}
                  max={5}
                  value={filterAmount}
                  setValue={setFilterAmount}
                  label="Amount"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        )}
        {samplerInstrument && (
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
                  linearKnobs={linearKnobs}
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
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        )}
        <div className="controls-row">
          <div className="controls-module effects-controls">
            <p className="controls-label">Effects</p>
            <Dropdn
              className="instrument-item"
              label="Effect"
              options={EFFECTS}
              setValue={setEffectType}
              value={effectType}
            />
            {effectType !== 'none' && (
              <RotaryKnob
                className="instrument-item"
                min={0}
                max={1}
                value={effectWet}
                setValue={setEffectWet}
                label="Amount"
                setGrabbing={setGrabbing}
                grabbing={grabbing}
                inline={false}
                mute={false}
                linearKnobs={linearKnobs}
                theme={theme}
              />
            )}
            {effectType === 'chorus' && (
              <div className="controls-aux">
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={1}
                  value={chorusDepth}
                  setValue={setChorusDepth}
                  label="Depth"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                  logarithmic
                />
                <RotaryKnob
                  className="instrument-item"
                  min={0.1}
                  max={10}
                  value={chorusDelayTime}
                  setValue={setChorusDelayTime}
                  label="Delay"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <RotaryKnob
                  className="instrument-item"
                  min={1}
                  max={20}
                  value={chorusFreq}
                  setValue={setChorusFreq}
                  label="Freq"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                  logarithmic
                />
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={180}
                  value={chorusSpread}
                  setValue={setChorusSpread}
                  label="Stereo"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
              </div>
            )}
            {effectType === 'distortion' && (
              <div className="controls-aux">
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={3}
                  value={distortion}
                  setValue={setDistortion}
                  label="Distortion"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
              </div>
            )}
            {effectType === 'delay' && (
              <div className="controls-aux">
                <div className="switch-container instrument-item">
                  <Switch
                    className="switch"
                    onChange={setSyncDelayTime}
                    checked={syncDelayTime}
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
                {!syncDelayTime && (
                  <RotaryKnob
                    className="instrument-item"
                    min={0}
                    max={1}
                    value={delayTime}
                    setValue={setDelayTime}
                    label="Time"
                    setGrabbing={setGrabbing}
                    grabbing={grabbing}
                    inline={false}
                    mute={false}
                    linearKnobs={linearKnobs}
                    theme={theme}
                  />
                )}
                {syncDelayTime && (
                  <Dropdn
                    className="instrument-item"
                    label="Time"
                    options={syncedDelayOptions}
                    setValue={setSyncedDelay}
                    value={syncedDelay}
                    placeholder="Select Rate"
                    noTextTransform
                  />
                )}
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={1}
                  value={delayFeedback}
                  setValue={setDelayFeedback}
                  label="Feedback"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
              </div>
            )}
            {effectType === 'reverb' && (
              <div className="controls-aux">
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={4}
                  value={reverbDecay}
                  setValue={setReverbDecay}
                  label="Decay"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={0.5}
                  value={reverbPreDelay}
                  setValue={setReverbPreDelay}
                  label="Pre Delay"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
              </div>
            )}
            {effectType === 'vibrato' && (
              <div className="controls-aux">
                <RotaryKnob
                  className="instrument-item"
                  min={0}
                  max={1}
                  value={vibratoDepth}
                  setValue={setVibratoDepth}
                  label="Depth"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                />
                <RotaryKnob
                  className="instrument-item"
                  min={1}
                  max={20}
                  value={vibratoFreq}
                  setValue={setVibratoFreq}
                  label="Freq"
                  setGrabbing={setGrabbing}
                  grabbing={grabbing}
                  inline={false}
                  mute={false}
                  linearKnobs={linearKnobs}
                  theme={theme}
                  logarithmic
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
InstrumentModal.propTypes = {
  instrumentOn: PropTypes.bool,
  setInstrumentOn: PropTypes.func,
  instrumentType: PropTypes.string,
  setInstrumentType: PropTypes.func,
  theme: PropTypes.string,
  instrumentParams: PropTypes.object,
  setInstrumentParams: PropTypes.func,
  instruments: PropTypes.object,
  effects: PropTypes.object,
  grabbing: PropTypes.bool,
  setGrabbing: PropTypes.func,
  linearKnobs: PropTypes.bool,
}
