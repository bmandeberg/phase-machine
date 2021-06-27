import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
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

  const instrumentParamsDebounce = useRef()
  const updateInstrumentParams = useCallback(() => {
    clearTimeout(instrumentParamsDebounce.current)
    const debounceTime = 200
    instrumentParamsDebounce.current = setTimeout(() => {
      setInstrumentParams({
        portamento,
        modulationType,
        harmonicity,
        fatSpread,
        fatCount,
        pulseWidth,
        pwmFreq,
        envAttack,
        envDecay,
        envSustain,
        envRelease,
        cutoff,
        resonance,
        rolloff,
        filterAttack,
        filterDecay,
        filterSustain,
        filterRelease,
        filterAmount,
        samplerAttack,
        samplerRelease,
        effectType,
        effectWet,
        chorusDepth,
        chorusDelayTime,
        chorusFreq,
        chorusSpread,
        chorusType,
        distortion,
        delayTime,
        delayFeedback,
        reverbDecay,
        reverbPreDelay,
        tremoloDepth,
        tremoloFreq,
        tremoloSpread,
        tremoloType,
        vibratoDepth,
        vibratoFreq,
        vibratoType,
      })
    }, debounceTime)
  }, [
    chorusDelayTime,
    chorusDepth,
    chorusFreq,
    chorusSpread,
    chorusType,
    cutoff,
    delayFeedback,
    delayTime,
    distortion,
    effectType,
    effectWet,
    envAttack,
    envDecay,
    envRelease,
    envSustain,
    fatCount,
    fatSpread,
    filterAmount,
    filterAttack,
    filterDecay,
    filterRelease,
    filterSustain,
    harmonicity,
    modulationType,
    portamento,
    pulseWidth,
    pwmFreq,
    resonance,
    reverbDecay,
    reverbPreDelay,
    rolloff,
    samplerAttack,
    samplerRelease,
    setInstrumentParams,
    tremoloDepth,
    tremoloFreq,
    tremoloSpread,
    tremoloType,
    vibratoDepth,
    vibratoFreq,
    vibratoType,
  ])

  // update synth params

  useEffect(() => {
    instruments.synthInstrument.current.portamento = portamento
    updateInstrumentParams()
  }, [instruments.synthInstrument, portamento, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.modulationType = modulationType
    updateInstrumentParams()
  }, [instruments.synthInstrument, modulationType, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.set({ harmonicity })
    updateInstrumentParams()
  }, [harmonicity, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.spread = fatSpread
    updateInstrumentParams()
  }, [fatSpread, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.count = fatCount
    updateInstrumentParams()
  }, [fatCount, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.set({ width: pulseWidth })
    updateInstrumentParams()
  }, [instruments.synthInstrument, pulseWidth, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.oscillator.set({ modulationFrequency: pwmFreq })
    updateInstrumentParams()
  }, [instruments.synthInstrument, pwmFreq, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.attack = envAttack
    updateInstrumentParams()
  }, [envAttack, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.decay = envDecay
    updateInstrumentParams()
  }, [envDecay, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.sustain = envSustain
    updateInstrumentParams()
  }, [envSustain, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.envelope.release = envRelease
    updateInstrumentParams()
  }, [envRelease, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filter.set({ Q: resonance })
    updateInstrumentParams()
  }, [instruments.synthInstrument, resonance, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filter.rolloff = rolloff
    updateInstrumentParams()
  }, [instruments.synthInstrument, rolloff, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.baseFrequency = cutoff
    updateInstrumentParams()
  }, [cutoff, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.attack = filterAttack
    updateInstrumentParams()
  }, [filterAttack, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.decay = filterDecay
    updateInstrumentParams()
  }, [filterDecay, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.sustain = filterSustain
    updateInstrumentParams()
  }, [filterSustain, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.release = filterRelease
    updateInstrumentParams()
  }, [filterRelease, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    instruments.synthInstrument.current.filterEnvelope.octaves = filterAmount
    updateInstrumentParams()
  }, [filterAmount, instruments.synthInstrument, updateInstrumentParams])

  // update sampler params

  useEffect(() => {
    instruments.pianoInstrument.current.attack = samplerAttack
    instruments.marimbaInstrument.current.attack = samplerAttack
    instruments.drumsInstrument.current.attack = samplerAttack
    updateInstrumentParams()
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
    updateInstrumentParams()
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
    updateInstrumentParams()
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
    updateInstrumentParams,
  ])

  useEffect(() => {
    Object.values(effects).forEach((effect) => {
      effect.current.set({ wet: effectWet })
    })
    updateInstrumentParams()
  }, [effectWet, effects, updateInstrumentParams])

  useEffect(() => {
    effects.chorusEffect.current.depth = chorusDepth
    updateInstrumentParams()
  }, [chorusDepth, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    effects.chorusEffect.current.delayTime = chorusDelayTime
    updateInstrumentParams()
  }, [chorusDelayTime, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    effects.chorusEffect.current.set({ frequency: chorusFreq })
    updateInstrumentParams()
  }, [chorusFreq, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    effects.chorusEffect.current.spread = chorusSpread
    updateInstrumentParams()
  }, [chorusSpread, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    effects.chorusEffect.current.type = chorusType
    updateInstrumentParams()
  }, [chorusType, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    effects.distortionEffect.current.distortion = distortion
    updateInstrumentParams()
  }, [distortion, effects.distortionEffect, updateInstrumentParams])

  useEffect(() => {
    effects.delayEffect.current.set({ delayTime })
    updateInstrumentParams()
  }, [delayTime, effects.delayEffect, updateInstrumentParams])

  useEffect(() => {
    effects.delayEffect.current.set({ feedback: delayFeedback })
    updateInstrumentParams()
  }, [delayFeedback, effects.delayEffect, updateInstrumentParams])

  useEffect(() => {
    effects.reverbEffect.current.decay = reverbDecay
    updateInstrumentParams()
  }, [effects.reverbEffect, reverbDecay, updateInstrumentParams])

  useEffect(() => {
    effects.reverbEffect.current.preDelay = reverbPreDelay
    updateInstrumentParams()
  }, [effects.reverbEffect, reverbPreDelay, updateInstrumentParams])

  useEffect(() => {
    effects.tremoloEffect.current.set({ depth: tremoloDepth })
    updateInstrumentParams()
  }, [effects.tremoloEffect, tremoloDepth, updateInstrumentParams])

  useEffect(() => {
    effects.tremoloEffect.current.set({ frequency: tremoloFreq })
    updateInstrumentParams()
  }, [effects.tremoloEffect, tremoloFreq, updateInstrumentParams])

  useEffect(() => {
    effects.tremoloEffect.current.spread = tremoloSpread
    updateInstrumentParams()
  }, [effects.tremoloEffect, tremoloSpread, updateInstrumentParams])

  useEffect(() => {
    effects.tremoloEffect.current.type = tremoloType
    updateInstrumentParams()
  }, [effects.tremoloEffect, tremoloType, updateInstrumentParams])

  useEffect(() => {
    effects.vibratoEffect.current.set({ depth: vibratoDepth })
    updateInstrumentParams()
  }, [effects.vibratoEffect, updateInstrumentParams, vibratoDepth])

  useEffect(() => {
    effects.vibratoEffect.current.set({ frequency: vibratoFreq })
    updateInstrumentParams()
  }, [effects.vibratoEffect, updateInstrumentParams, vibratoFreq])

  useEffect(() => {
    effects.vibratoEffect.current.type = vibratoType
    updateInstrumentParams()
  }, [effects.vibratoEffect, updateInstrumentParams, vibratoType])

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
