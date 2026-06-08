import { useState, useEffect, useCallback } from 'react'
import * as Tone from 'tone'
import { InstrumentParams, InstrumentRefs } from '../../types'

// Owns all PluckSynth parameter state and the effects that push each value to
// the live Tone node + persist it. Called unconditionally by InstrumentModal.
export default function usePluckParams(
  instruments: InstrumentRefs,
  instrumentParams: InstrumentParams,
  updateInstrumentParams: (param: string, value: InstrumentParams[keyof InstrumentParams]) => void
) {
  const [pluckAttackNoise, setPluckAttackNoise] = useState(instrumentParams.pluckAttackNoise)
  const [pluckDampening, setPluckDampening] = useState(instrumentParams.pluckDampening)
  const [pluckResonance, setPluckResonance] = useState(instrumentParams.pluckResonance)
  const [pluckRelease, setPluckRelease] = useState(instrumentParams.pluckRelease)

  const setPluck = useCallback(
    (options: Parameters<Tone.PluckSynth['set']>[0]) => {
      instruments.pluckInstrument.current?.set(options)
    },
    [instruments.pluckInstrument]
  )

  useEffect(() => {
    setPluck({ attackNoise: pluckAttackNoise })
    updateInstrumentParams('pluckAttackNoise', pluckAttackNoise)
  }, [setPluck, pluckAttackNoise, updateInstrumentParams])

  useEffect(() => {
    setPluck({ dampening: pluckDampening })
    updateInstrumentParams('pluckDampening', pluckDampening)
  }, [setPluck, pluckDampening, updateInstrumentParams])

  useEffect(() => {
    setPluck({ resonance: pluckResonance })
    updateInstrumentParams('pluckResonance', pluckResonance)
  }, [setPluck, pluckResonance, updateInstrumentParams])

  useEffect(() => {
    setPluck({ release: pluckRelease })
    updateInstrumentParams('pluckRelease', pluckRelease)
  }, [setPluck, pluckRelease, updateInstrumentParams])

  return {
    pluckAttackNoise,
    setPluckAttackNoise,
    pluckDampening,
    setPluckDampening,
    pluckResonance,
    setPluckResonance,
    pluckRelease,
    setPluckRelease,
  }
}
