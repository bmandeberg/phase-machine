import { useState, useEffect } from 'react'
import { InstrumentParams, InstrumentRefs } from '../../types'

// Owns the sampler envelope (attack/release) state and the effects that apply
// it to every loaded sampler + persist it. Called unconditionally by
// InstrumentModal, preserving the original top-level effect-firing semantics.
export default function useSamplerParams(
  instruments: InstrumentRefs,
  instrumentParams: InstrumentParams,
  updateInstrumentParams: (param: string, value: InstrumentParams[keyof InstrumentParams]) => void
) {
  const [samplerAttack, setSamplerAttack] = useState(instrumentParams.samplerAttack)
  const [samplerRelease, setSamplerRelease] = useState(instrumentParams.samplerRelease)

  useEffect(() => {
    if (instruments.pianoInstrument.current) {
      instruments.pianoInstrument.current.attack = samplerAttack
    }
    if (instruments.marimbaInstrument.current) {
      instruments.marimbaInstrument.current.attack = samplerAttack
    }
    if (instruments.bassInstrument.current) {
      instruments.bassInstrument.current.attack = samplerAttack
    }
    if (instruments.vibesInstrument.current) {
      instruments.vibesInstrument.current.attack = samplerAttack
    }
    if (instruments.harpInstrument.current) {
      instruments.harpInstrument.current.attack = samplerAttack
    }
    if (instruments.choralInstrument.current) {
      instruments.choralInstrument.current.attack = samplerAttack
    }
    if (instruments.drumsInstrument.current) {
      instruments.drumsInstrument.current.attack = samplerAttack
    }
    if (instruments.hxcInstrument.current) {
      instruments.hxcInstrument.current.attack = samplerAttack
    }
    if (instruments.rhythmInstrument.current) {
      instruments.rhythmInstrument.current.attack = samplerAttack
    }
    updateInstrumentParams('samplerAttack', samplerAttack)
  }, [instruments, samplerAttack, updateInstrumentParams])

  useEffect(() => {
    if (instruments.pianoInstrument.current) {
      instruments.pianoInstrument.current.release = samplerRelease
    }
    if (instruments.marimbaInstrument.current) {
      instruments.marimbaInstrument.current.release = samplerRelease
    }
    if (instruments.bassInstrument.current) {
      instruments.bassInstrument.current.release = samplerRelease
    }
    if (instruments.vibesInstrument.current) {
      instruments.vibesInstrument.current.release = samplerRelease
    }
    if (instruments.harpInstrument.current) {
      instruments.harpInstrument.current.release = samplerRelease
    }
    if (instruments.choralInstrument.current) {
      instruments.choralInstrument.current.release = samplerRelease
    }
    if (instruments.drumsInstrument.current) {
      instruments.drumsInstrument.current.release = samplerRelease
    }
    if (instruments.hxcInstrument.current) {
      instruments.hxcInstrument.current.release = samplerRelease
    }
    if (instruments.rhythmInstrument.current) {
      instruments.rhythmInstrument.current.release = samplerRelease
    }
    updateInstrumentParams('samplerRelease', samplerRelease)
  }, [instruments, samplerRelease, updateInstrumentParams])

  return { samplerAttack, setSamplerAttack, samplerRelease, setSamplerRelease }
}
