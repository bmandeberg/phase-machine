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
  const [poly, setPoly] = useState(instrumentParams.poly)
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

  // Push options to the live synth node. PolySynth (poly mode) only exposes
  // .set()/.get(), while MonoSynth accepts the same nested options — so one path
  // covers both. The node is cast to MonoSynth so the union's .set() arg type
  // resolves (the options are identical at runtime); callers widen oscillator
  // sub-options through unknown where Tone's strict subtype unions get in the way.
  const setSynth = useCallback(
    (options: Parameters<Tone.MonoSynth['set']>[0]) => {
      ;(instruments.synthInstrument.current as Tone.MonoSynth | null)?.set(options)
    },
    [instruments.synthInstrument]
  )

  useEffect(() => {
    updateInstrumentParams('synthType', synthType)
  }, [instruments.synthInstrument, synthType, updateInstrumentParams])

  // Persist the mono/poly flag; the actual MonoSynth<->PolySynth node swap is done
  // by a dedicated effect in useInstruments keyed on instrumentParams.poly.
  useEffect(() => {
    updateInstrumentParams('poly', poly)
  }, [poly, updateInstrumentParams])

  // Each param effect pushes its value to the live node via setSynth() and
  // persists it. Oscillator sub-options (spread/count/width/etc.) live on
  // specific oscillator subtypes, so those args widen through unknown.
  useEffect(() => {
    setSynth({ portamento })
    updateInstrumentParams('portamento', portamento)
  }, [setSynth, portamento, updateInstrumentParams])

  useEffect(() => {
    setSynth({ oscillator: { modulationType } } as unknown as Tone.MonoSynthOptions)
    updateInstrumentParams('modulationType', modulationType)
  }, [setSynth, modulationType, updateInstrumentParams])

  useEffect(() => {
    setSynth({ oscillator: { harmonicity } } as unknown as Tone.MonoSynthOptions)
    updateInstrumentParams('harmonicity', harmonicity)
  }, [harmonicity, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ oscillator: { spread: fatSpread } } as unknown as Tone.MonoSynthOptions)
    updateInstrumentParams('fatSpread', fatSpread)
  }, [fatSpread, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ oscillator: { count: fatCount } } as unknown as Tone.MonoSynthOptions)
    updateInstrumentParams('fatCount', fatCount)
  }, [fatCount, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ oscillator: { width: pulseWidth } } as unknown as Tone.MonoSynthOptions)
    updateInstrumentParams('pulseWidth', pulseWidth)
  }, [setSynth, pulseWidth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ oscillator: { modulationFrequency: pwmFreq } } as unknown as Tone.MonoSynthOptions)
    updateInstrumentParams('pwmFreq', pwmFreq)
  }, [setSynth, pwmFreq, updateInstrumentParams])

  useEffect(() => {
    setSynth({ envelope: { attack: envAttack } })
    updateInstrumentParams('envAttack', envAttack)
  }, [envAttack, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ envelope: { decay: envDecay } })
    updateInstrumentParams('envDecay', envDecay)
  }, [envDecay, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ envelope: { sustain: envSustain } })
    updateInstrumentParams('envSustain', envSustain)
  }, [envSustain, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ envelope: { release: envRelease } })
    updateInstrumentParams('envRelease', envRelease)
  }, [envRelease, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ filter: { Q: resonance } })
    updateInstrumentParams('resonance', resonance)
  }, [setSynth, resonance, updateInstrumentParams])

  useEffect(() => {
    setSynth({ filter: { rolloff: rolloff as Tone.FilterRollOff } })
    updateInstrumentParams('rolloff', rolloff)
  }, [setSynth, rolloff, updateInstrumentParams])

  useEffect(() => {
    setSynth({ filterEnvelope: { baseFrequency: cutoff } })
    updateInstrumentParams('cutoff', cutoff)
  }, [cutoff, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ filterEnvelope: { attack: filterAttack } })
    updateInstrumentParams('filterAttack', filterAttack)
  }, [filterAttack, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ filterEnvelope: { decay: filterDecay } })
    updateInstrumentParams('filterDecay', filterDecay)
  }, [filterDecay, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ filterEnvelope: { sustain: filterSustain } })
    updateInstrumentParams('filterSustain', filterSustain)
  }, [filterSustain, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ filterEnvelope: { release: filterRelease } })
    updateInstrumentParams('filterRelease', filterRelease)
  }, [filterRelease, setSynth, updateInstrumentParams])

  useEffect(() => {
    setSynth({ filterEnvelope: { octaves: filterAmount } })
    updateInstrumentParams('filterAmount', filterAmount)
  }, [filterAmount, setSynth, updateInstrumentParams])

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
      // arg through unknown at this free-string boundary.
      setSynth({ oscillator: { harmonicity, type: updatedType } } as unknown as Tone.MonoSynthOptions)
    },
    [harmonicity, setSynth, oscModifier]
  )
  const updateOscModifier = useCallback(
    (modifier: string) => {
      const updatedModifier = modifier === oscModifiers[0] ? '' : modifier
      setSynthType(updatedModifier + synthBase)
      setSynth({ oscillator: { harmonicity, type: updatedModifier + synthBase } } as unknown as Tone.MonoSynthOptions)
      setOscModifier(modifier)
    },
    [harmonicity, setSynth, synthBase]
  )

  return {
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
  }
}
