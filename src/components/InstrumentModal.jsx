import React, { useState, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import Instrument from './Instrument'
import { SAMPLER_INSTRUMENTS } from '../globals'
import './InstrumentModal.scss'

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
  const [rolloff, setRollof] = useState(instrumentParams.rolloff)
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
  const [chorusType, setChorusType] = useState(instrumentParams.chorusType)
  const [distortion, setDistortion] = useState(instrumentParams.distortion)
  const [syncDelayTime, setSyncDelayTime] = useState(false)
  const [delayTime, setDelayTime] = useState(instrumentParams.delayTime)
  const [delayFeedback, setDelayFeedback] = useState(instrumentParams.delayFeedback)
  const [reverbDecay, setReverbDecay] = useState(instrumentParams.reverbDecay)
  const [reverbPreDelay, setReverbPreDelay] = useState(instrumentParams.reverbPreDelay)
  const [tremoloDepth, setTremoloDepth] = useState(instrumentParams.tremoloDepth)
  const [tremoloFreq, setTremoloFreq] = useState(instrumentParams.tremoloFreq)
  const [tremoloSpread, setTremoloSpread] = useState(instrumentParams.tremoloSpread)
  const [tremoloType, setTremoloType] = useState(instrumentParams.tremoloType)
  const [vibratoDepth, setVibratoDepth] = useState(instrumentParams.vibratoDepth)
  const [vibratoFreq, setVibratoFreq] = useState(instrumentParams.vibratoFreq)
  const [vibratoType, setVibratoType] = useState(instrumentParams.vibratoType)

  // update synth params

  useEffect(() => {
    instruments.synthInstrument.current.portamento = portamento
  }, [instruments.synthInstrument, portamento])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.modulationType = modulationType
  }, [instruments.synthInstrument, modulationType])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.set({ harmonicity })
  }, [harmonicity, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.spread = fatSpread
  }, [fatSpread, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.count = fatCount
  }, [fatCount, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.set({ width: pulseWidth })
  }, [instruments.synthInstrument, pulseWidth])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.set({ modulationFrequency: pwmFreq })
  }, [instruments.synthInstrument, pwmFreq])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.attack = envAttack
  }, [envAttack, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.decay = envDecay
  }, [envDecay, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.sustain = envSustain
  }, [envSustain, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.release = envRelease
  }, [envRelease, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.filter.set({ Q: resonance })
  }, [instruments.synthInstrument, resonance])

  useEffect(() => {
    instruments.synthInstrument.current.filter.rolloff = rolloff
  }, [instruments.synthInstrument, rolloff])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.baseFrequency = cutoff
  }, [cutoff, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.attack = filterAttack
  }, [filterAttack, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.decay = filterDecay
  }, [filterDecay, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.sustain = filterSustain
  }, [filterSustain, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.release = filterRelease
  }, [filterRelease, instruments.synthInstrument])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.octaves = filterAmount
  }, [filterAmount, instruments.synthInstrument])

  // update sampler params

  useEffect(() => {
    instruments.pianoInstrument.current.attack = samplerAttack
    instruments.marimbaInstrument.current.attack = samplerAttack
    instruments.drumsInstrument.current.attack = samplerAttack
  }, [instruments.drumsInstrument, instruments.marimbaInstrument, instruments.pianoInstrument, samplerAttack])

  useEffect(() => {
    instruments.pianoInstrument.current.release = samplerRelease
    instruments.marimbaInstrument.current.release = samplerRelease
    instruments.drumsInstrument.current.release = samplerRelease
  }, [instruments.drumsInstrument, instruments.marimbaInstrument, instruments.pianoInstrument, samplerRelease])

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
      case 'tremolo':
        effect = effects.tremoloEffect.current
        break
      case 'vibrato':
        effect = effects.vibratoEffect.current
        break
      default:
        effect = null
    }
    if (effect) {
      instruments.synthInstrument.current.connect(effect)
      instruments.pianoInstrument.current.connect(effect)
      instruments.marimbaInstrument.current.connect(effect)
      instruments.drumsInstrument.current.connect(effect)
    } else {
      instruments.synthInstrument.current.toDestination()
      instruments.pianoInstrument.current.toDestination()
      instruments.marimbaInstrument.current.toDestination()
      instruments.drumsInstrument.current.toDestination()
    }
  }, [
    effectType,
    effects.chorusEffect,
    effects.delayEffect,
    effects.distortionEffect,
    effects.reverbEffect,
    effects.tremoloEffect,
    effects.vibratoEffect,
    instruments.drumsInstrument,
    instruments.marimbaInstrument,
    instruments.pianoInstrument,
    instruments.synthInstrument,
  ])

  useEffect(() => {
    Object.values(effects).forEach((effect) => {
      effect.current.set({ wet: effectWet })
    })
  }, [effectWet, effects])

  useEffect(() => {
    effects.chorusEffect.current.depth = chorusDepth
  }, [chorusDepth, effects.chorusEffect])

  useEffect(() => {
    effects.chorusEffect.current.delayTime = chorusDelayTime
  }, [chorusDelayTime, effects.chorusEffect])

  useEffect(() => {
    effects.chorusEffect.current.set({ frequency: chorusFreq })
  }, [chorusFreq, effects.chorusEffect])

  useEffect(() => {
    effects.chorusEffect.current.spread = chorusSpread
  }, [chorusSpread, effects.chorusEffect])

  useEffect(() => {
    effects.chorusEffect.current.type = chorusType
  }, [chorusType, effects.chorusEffect])

  useEffect(() => {
    effects.distortionEffect.current.distortion = distortion
  }, [distortion, effects.distortionEffect])

  useEffect(() => {
    effects.delayEffect.current.set({ delayTime })
  }, [delayTime, effects.delayEffect])

  useEffect(() => {
    effects.delayEffect.current.set({ feedback: delayFeedback })
  }, [delayFeedback, effects.delayEffect])

  useEffect(() => {
    effects.reverbEffect.current.decay = reverbDecay
  }, [effects.reverbEffect, reverbDecay])

  useEffect(() => {
    effects.reverbEffect.current.preDelay = reverbPreDelay
  }, [effects.reverbEffect, reverbPreDelay])

  useEffect(() => {
    effects.tremoloEffect.current.set({ depth: tremoloDepth })
  }, [effects.tremoloEffect, tremoloDepth])

  useEffect(() => {
    effects.tremoloEffect.current.set({ frequency: tremoloFreq })
  }, [effects.tremoloEffect, tremoloFreq])

  useEffect(() => {
    effects.tremoloEffect.current.spread = tremoloSpread
  }, [effects.tremoloEffect, tremoloSpread])

  useEffect(() => {
    effects.tremoloEffect.current.type = tremoloType
  }, [effects.tremoloEffect, tremoloType])

  useEffect(() => {
    effects.vibratoEffect.current.set({ depth: vibratoDepth })
  }, [effects.vibratoEffect, vibratoDepth])

  useEffect(() => {
    effects.vibratoEffect.current.set({ frequency: vibratoFreq })
  }, [effects.vibratoEffect, vibratoFreq])

  useEffect(() => {
    effects.vibratoEffect.current.type = vibratoType
  }, [effects.vibratoEffect, vibratoType])

  const samplerInstrument = useMemo(() => SAMPLER_INSTRUMENTS.includes(instrumentType), [instrumentType])

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
        {!samplerInstrument && <div className="synth-controls"></div>}
        {samplerInstrument && <div className="sampler-controls"></div>}
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
}
