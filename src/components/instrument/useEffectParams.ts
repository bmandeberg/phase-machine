import { useState, useEffect, useRef } from 'react'
import { CHORUS_ENABLED } from '../../globals'
import { InstrumentParams, InstrumentRefs, EffectRefs, GainRef, SignalDestination } from '../../types'

// Owns all effect parameter state plus the signal-routing effect (connect /
// disconnect every instrument to the selected effect) and the per-effect
// parameter syncs. Called unconditionally by InstrumentModal so effect firing
// matches the original inline top-level hooks exactly.
export default function useEffectParams(
  instruments: InstrumentRefs,
  effects: EffectRefs,
  gainNode: GainRef,
  instrumentParams: InstrumentParams,
  updateInstrumentParams: (param: string, value: InstrumentParams[keyof InstrumentParams]) => void
) {
  const [effectType, setEffectType] = useState(instrumentParams.effectType)
  const [effectWet, setEffectWet] = useState(instrumentParams.effectWet)
  const [chorusDepth, setChorusDepth] = useState(instrumentParams.chorusDepth)
  const [chorusDelayTime, setChorusDelayTime] = useState(instrumentParams.chorusDelayTime)
  const [chorusFreq, setChorusFreq] = useState(instrumentParams.chorusFreq)
  const [chorusSpread, setChorusSpread] = useState(instrumentParams.chorusSpread)
  const [distortion, setDistortion] = useState(instrumentParams.distortion)
  const [syncDelayTime, setSyncDelayTime] = useState(instrumentParams.syncDelayTime)
  const [delayTime, setDelayTime] = useState(instrumentParams.delayTime)
  const [delayFeedback, setDelayFeedback] = useState(instrumentParams.delayFeedback)
  const [reverbDecay, setReverbDecay] = useState(instrumentParams.reverbDecay)
  const [reverbPreDelay, setReverbPreDelay] = useState(instrumentParams.reverbPreDelay)
  const [vibratoDepth, setVibratoDepth] = useState(instrumentParams.vibratoDepth)
  const [vibratoFreq, setVibratoFreq] = useState(instrumentParams.vibratoFreq)

  const effectRef = useRef<SignalDestination | null | undefined>(undefined)

  useEffect(() => {
    if (CHORUS_ENABLED) {
      if (effectType === 'chorus') {
        effects.chorusEffect.current?.start()
      } else {
        effects.chorusEffect.current?.stop()
      }
    }
    let effect: SignalDestination | null | undefined
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
        effect = gainNode.current
    }
    effect = effect || gainNode.current
    if (effectRef.current) {
      Object.values(instruments).forEach((instrument) => {
        if (instrument.current && effectRef.current) {
          instrument.current.disconnect(effectRef.current)
        }
      })
    }
    effectRef.current = effect
    Object.values(instruments).forEach((instrument) => {
      if (instrument.current && effect) {
        instrument.current.connect(effect)
      }
    })
    updateInstrumentParams('effectType', effectType)
  }, [effectType, effects, gainNode, instruments, updateInstrumentParams])

  useEffect(() => {
    Object.values(effects).forEach((effect) => {
      if (effect.current) {
        effect.current.set({ wet: effectWet })
      }
    })
    updateInstrumentParams('effectWet', effectWet)
  }, [effectWet, effects, updateInstrumentParams])

  useEffect(() => {
    if (effects.chorusEffect.current) {
      effects.chorusEffect.current.depth = chorusDepth
    }
    updateInstrumentParams('chorusDepth', chorusDepth)
  }, [chorusDepth, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    if (effects.chorusEffect.current) {
      effects.chorusEffect.current.delayTime = chorusDelayTime
    }
    updateInstrumentParams('chorusDelayTime', chorusDelayTime)
  }, [chorusDelayTime, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    if (effects.chorusEffect.current) {
      effects.chorusEffect.current.set({ frequency: chorusFreq })
    }
    updateInstrumentParams('chorusFreq', chorusFreq)
  }, [chorusFreq, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    if (effects.chorusEffect.current) {
      effects.chorusEffect.current.spread = chorusSpread
    }
    updateInstrumentParams('chorusSpread', chorusSpread)
  }, [chorusSpread, effects.chorusEffect, updateInstrumentParams])

  useEffect(() => {
    effects.distortionEffect.current!.distortion = distortion
    updateInstrumentParams('distortion', distortion)
  }, [distortion, effects.distortionEffect, updateInstrumentParams])

  useEffect(() => {
    updateInstrumentParams('syncDelayTime', syncDelayTime)
  }, [syncDelayTime, updateInstrumentParams])

  useEffect(() => {
    effects.delayEffect.current!.set({ delayTime })
    updateInstrumentParams('delayTime', delayTime)
  }, [delayTime, effects.delayEffect, updateInstrumentParams])

  useEffect(() => {
    effects.delayEffect.current!.set({ feedback: delayFeedback })
    updateInstrumentParams('delayFeedback', delayFeedback)
  }, [delayFeedback, effects.delayEffect, updateInstrumentParams])

  useEffect(() => {
    effects.reverbEffect.current!.decay = reverbDecay
    updateInstrumentParams('reverbDecay', reverbDecay)
  }, [effects.reverbEffect, reverbDecay, updateInstrumentParams])

  useEffect(() => {
    effects.reverbEffect.current!.preDelay = reverbPreDelay
    updateInstrumentParams('reverbPreDelay', reverbPreDelay)
  }, [effects.reverbEffect, reverbPreDelay, updateInstrumentParams])

  useEffect(() => {
    effects.vibratoEffect.current!.set({ depth: vibratoDepth })
    updateInstrumentParams('vibratoDepth', vibratoDepth)
  }, [effects.vibratoEffect, updateInstrumentParams, vibratoDepth])

  useEffect(() => {
    effects.vibratoEffect.current!.set({ frequency: vibratoFreq })
    updateInstrumentParams('vibratoFreq', vibratoFreq)
  }, [effects.vibratoEffect, updateInstrumentParams, vibratoFreq])

  return {
    effectType,
    setEffectType,
    effectWet,
    setEffectWet,
    chorusDepth,
    setChorusDepth,
    chorusDelayTime,
    setChorusDelayTime,
    chorusFreq,
    setChorusFreq,
    chorusSpread,
    setChorusSpread,
    distortion,
    setDistortion,
    syncDelayTime,
    setSyncDelayTime,
    delayTime,
    setDelayTime,
    delayFeedback,
    setDelayFeedback,
    reverbDecay,
    setReverbDecay,
    reverbPreDelay,
    setReverbPreDelay,
    vibratoDepth,
    setVibratoDepth,
    vibratoFreq,
    setVibratoFreq,
  }
}
