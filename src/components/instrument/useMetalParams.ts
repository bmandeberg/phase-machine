import { useState, useEffect, useCallback } from 'react'
import * as Tone from 'tone'
import { InstrumentParams, InstrumentRefs } from '../../types'

// Owns all MetalSynth parameter state and the effects that push each value to
// the live Tone node + persist it. Called unconditionally by InstrumentModal
// (like the other param hooks) so its effects fire regardless of which panel
// is shown.
export default function useMetalParams(
  instruments: InstrumentRefs,
  instrumentParams: InstrumentParams,
  updateInstrumentParams: (param: string, value: InstrumentParams[keyof InstrumentParams]) => void
) {
  const [metalHarmonicity, setMetalHarmonicity] = useState(instrumentParams.metalHarmonicity)
  const [metalModulationIndex, setMetalModulationIndex] = useState(instrumentParams.metalModulationIndex)
  const [metalResonance, setMetalResonance] = useState(instrumentParams.metalResonance)
  const [metalOctaves, setMetalOctaves] = useState(instrumentParams.metalOctaves)
  const [metalAttack, setMetalAttack] = useState(instrumentParams.metalAttack)
  const [metalDecay, setMetalDecay] = useState(instrumentParams.metalDecay)
  const [metalRelease, setMetalRelease] = useState(instrumentParams.metalRelease)

  const setMetal = useCallback(
    (options: Parameters<Tone.MetalSynth['set']>[0]) => {
      instruments.metalInstrument.current?.set(options)
    },
    [instruments.metalInstrument]
  )

  useEffect(() => {
    setMetal({ harmonicity: metalHarmonicity })
    updateInstrumentParams('metalHarmonicity', metalHarmonicity)
  }, [setMetal, metalHarmonicity, updateInstrumentParams])

  useEffect(() => {
    setMetal({ modulationIndex: metalModulationIndex })
    updateInstrumentParams('metalModulationIndex', metalModulationIndex)
  }, [setMetal, metalModulationIndex, updateInstrumentParams])

  useEffect(() => {
    setMetal({ resonance: metalResonance })
    updateInstrumentParams('metalResonance', metalResonance)
  }, [setMetal, metalResonance, updateInstrumentParams])

  useEffect(() => {
    setMetal({ octaves: metalOctaves })
    updateInstrumentParams('metalOctaves', metalOctaves)
  }, [setMetal, metalOctaves, updateInstrumentParams])

  useEffect(() => {
    setMetal({ envelope: { attack: metalAttack } })
    updateInstrumentParams('metalAttack', metalAttack)
  }, [setMetal, metalAttack, updateInstrumentParams])

  useEffect(() => {
    setMetal({ envelope: { decay: metalDecay } })
    updateInstrumentParams('metalDecay', metalDecay)
  }, [setMetal, metalDecay, updateInstrumentParams])

  useEffect(() => {
    setMetal({ envelope: { release: metalRelease } })
    updateInstrumentParams('metalRelease', metalRelease)
  }, [setMetal, metalRelease, updateInstrumentParams])

  return {
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
  }
}
