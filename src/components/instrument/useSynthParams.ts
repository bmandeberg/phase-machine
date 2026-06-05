import { useState, useEffect, useMemo, useCallback } from 'react'
import * as Tone from 'tone'
import { SIGNAL_TYPES } from '../../globals'
import { InstrumentParams, InstrumentRefs } from '../../types'

// Oscillator modifier prefixes. Index 0 ('none') means "no modifier"; the
// others are stripped from / prepended to the wave name to form synthType
// (e.g. 'fm' + 'sine' -> 'fmsine').
export const oscModifiers = ['none', 'am', 'fm', 'fat']

// Owns all synth (MonoSynth) parameter state and the effects that push each
// value to the live Tone node + persist it via updateInstrumentParams. Called
// unconditionally by InstrumentModal so its effects fire exactly as they did
// when these hooks lived inline at the top of that component.
export default function useSynthParams(
  instruments: InstrumentRefs,
  instrumentParams: InstrumentParams,
  updateInstrumentParams: (param: string, value: InstrumentParams[keyof InstrumentParams]) => void
) {
  const [synthType, setSynthType] = useState(instrumentParams.synthType)
  const [oscModifier, setOscModifier] = useState(() => {
    for (let i = 1; i < oscModifiers.length; i++) {
      if (instrumentParams.synthType.startsWith(oscModifiers[i])) {
        return oscModifiers[i]
      }
    }
    return oscModifiers[0]
  })
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

  const rolloffString = useMemo(() => `${rolloff}`, [rolloff])
  const updateRolloff = useCallback((r: string) => {
    setRolloff(+r)
  }, [])

  useEffect(() => {
    updateInstrumentParams('synthType', synthType)
  }, [instruments.synthInstrument, synthType, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.portamento = portamento
    }
    updateInstrumentParams('portamento', portamento)
  }, [instruments.synthInstrument, portamento, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.oscillator.modulationType = modulationType as Tone.ToneOscillatorType
    }
    updateInstrumentParams('modulationType', modulationType)
  }, [instruments.synthInstrument, modulationType, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.oscillator.set({ harmonicity })
    }
    updateInstrumentParams('harmonicity', harmonicity)
  }, [harmonicity, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.oscillator.spread = fatSpread
    }
    updateInstrumentParams('fatSpread', fatSpread)
  }, [fatSpread, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.oscillator.count = fatCount
    }
    updateInstrumentParams('fatCount', fatCount)
  }, [fatCount, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.oscillator.set({ width: pulseWidth })
    }
    updateInstrumentParams('pulseWidth', pulseWidth)
  }, [instruments.synthInstrument, pulseWidth, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.oscillator.set({ modulationFrequency: pwmFreq })
    }
    updateInstrumentParams('pwmFreq', pwmFreq)
  }, [instruments.synthInstrument, pwmFreq, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.envelope.attack = envAttack
    }
    updateInstrumentParams('envAttack', envAttack)
  }, [envAttack, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.envelope.decay = envDecay
    }
    updateInstrumentParams('envDecay', envDecay)
  }, [envDecay, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.envelope.sustain = envSustain
    }
    updateInstrumentParams('envSustain', envSustain)
  }, [envSustain, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.envelope.release = envRelease
    }
    updateInstrumentParams('envRelease', envRelease)
  }, [envRelease, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.filter.set({ Q: resonance })
    }
    updateInstrumentParams('resonance', resonance)
  }, [instruments.synthInstrument, resonance, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.filter.rolloff = rolloff as Tone.FilterRollOff
    }
    updateInstrumentParams('rolloff', rolloff)
  }, [instruments.synthInstrument, rolloff, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.filterEnvelope.baseFrequency = cutoff
    }
    updateInstrumentParams('cutoff', cutoff)
  }, [cutoff, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.filterEnvelope.attack = filterAttack
    }
    updateInstrumentParams('filterAttack', filterAttack)
  }, [filterAttack, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.filterEnvelope.decay = filterDecay
    }
    updateInstrumentParams('filterDecay', filterDecay)
  }, [filterDecay, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.filterEnvelope.sustain = filterSustain
    }
    updateInstrumentParams('filterSustain', filterSustain)
  }, [filterSustain, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.filterEnvelope.release = filterRelease
    }
    updateInstrumentParams('filterRelease', filterRelease)
  }, [filterRelease, instruments.synthInstrument, updateInstrumentParams])

  useEffect(() => {
    if (instruments.synthInstrument.current) {
      instruments.synthInstrument.current.filterEnvelope.octaves = filterAmount
    }
    updateInstrumentParams('filterAmount', filterAmount)
  }, [filterAmount, instruments.synthInstrument, updateInstrumentParams])

  const synthBase = useMemo(() => {
    for (let i = 1; i < oscModifiers.length; i++) {
      if (synthType.startsWith(oscModifiers[i])) {
        return synthType.substring(oscModifiers[i].length)
      }
    }
    return synthType
  }, [synthType])
  const updateSynthType = useCallback(
    (newType: string) => {
      const updatedType =
        oscModifier !== oscModifiers[0] && Object.keys(SIGNAL_TYPES).includes(newType) ? oscModifier + newType : newType
      setSynthType(updatedType)
      // harmonicity only exists on AM/FM oscillator option subtypes; widen the
      // arg to the oscillator's own set() param type at this free-string boundary.
      instruments.synthInstrument.current?.oscillator.set({
        harmonicity,
        type: updatedType,
      } as unknown as Parameters<Tone.MonoSynth['oscillator']['set']>[0])
    },
    [harmonicity, instruments.synthInstrument, oscModifier]
  )
  const updateOscModifier = useCallback(
    (modifier: string) => {
      const updatedModifier = modifier === oscModifiers[0] ? '' : modifier
      setSynthType(updatedModifier + synthBase)
      instruments.synthInstrument.current?.oscillator.set({
        harmonicity,
        type: updatedModifier + synthBase,
      } as unknown as Parameters<Tone.MonoSynth['oscillator']['set']>[0])
      setOscModifier(modifier)
    },
    [harmonicity, instruments.synthInstrument, synthBase]
  )

  return {
    synthType,
    oscModifier,
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
  }
}
