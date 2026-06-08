import { useRef, useEffect, useCallback, useMemo } from 'react'
import { CHORUS_ENABLED } from '../globals'
import * as Tone from 'tone'
import {
  InstrumentParams,
  InstrumentRef,
  InstrumentRefs,
  EffectRefs,
  SignalDestination,
  GainRef,
  PannerRef,
  SamplerRef,
} from '../types'
import { SAMPLER_CONFIGS, SamplerConfig, RHYTHM_PACK } from '../samplerConfigs'
import { RhythmSampler } from '../rhythmSampler'

// Tone.Chorus.start()/stop() drive its internal LFOs and are NOT idempotent —
// starting an already-running LFO (or stopping a stopped one) throws "Start time
// must be strictly greater than previous start time". Since the chorus is started
// at init and updateInstruments re-runs on every preset load, guard start/stop by
// reading the LFO's actual playback state. _lfoL is private in Tone's types, hence
// the cast.
function chorusRunning(chorus: Tone.Chorus) {
  return (chorus as unknown as { _lfoL: { state: string } })._lfoL?.state === 'started'
}

export default function useInstruments(
  instrument: InstrumentRef,
  instrumentParams: InstrumentParams,
  instrumentType: string,
  cleanup: () => void,
  setModalType: (type: string) => void
) {
  const instrumentParamsRef = useRef(instrumentParams)
  useEffect(() => {
    instrumentParamsRef.current = instrumentParams
  }, [instrumentParams])

  const cleanupRef = useRef(cleanup)
  useEffect(() => {
    cleanupRef.current = cleanup
  }, [cleanup])

  const getCurrentEffect = useCallback((): SignalDestination => {
    let effect: SignalDestination | null | undefined
    switch (instrumentParamsRef.current.effectType) {
      case 'chorus':
        effect = chorusEffect.current
        break
      case 'distortion':
        effect = distortionEffect.current
        break
      case 'delay':
        effect = delayEffect.current
        break
      case 'reverb':
        effect = reverbEffect.current
        break
      case 'vibrato':
        effect = vibratoEffect.current
        break
      default:
        effect = gainNode.current
    }
    // gainNode is always initialized before any instrument connects through this.
    return (effect || gainNode.current) as SignalDestination
  }, [])

  // instrument

  const initInstrumentType = useRef(instrumentType)
  const gainNode: GainRef = useRef<Tone.Gain | null>(null)
  const pannerNode: PannerRef = useRef<Tone.Panner | null>(null)
  const synthInstrument = useRef<Tone.MonoSynth | Tone.PolySynth<Tone.MonoSynth> | null>(null)
  const drumsInstrument = useRef<Tone.Sampler | null>(null)
  const drumMachineInstrument = useRef<Tone.Sampler | null>(null)
  const pianoInstrument = useRef<Tone.Sampler | null>(null)
  const marimbaInstrument = useRef<Tone.Sampler | null>(null)
  const bassInstrument = useRef<Tone.Sampler | null>(null)
  const vibesInstrument = useRef<Tone.Sampler | null>(null)
  const harpInstrument = useRef<Tone.Sampler | null>(null)
  const choralInstrument = useRef<Tone.Sampler | null>(null)
  // Varispeed engine for the single flat rhythmic pack (built lazily on activate).
  const rhythmInstrument = useRef<RhythmSampler | null>(null)
  const chorusEffect = useRef<Tone.Chorus | null>(null)
  const distortionEffect = useRef<Tone.Distortion | null>(null)
  const delayEffect = useRef<Tone.FeedbackDelay | null>(null)
  const reverbEffect = useRef<Tone.Reverb | null>(null)
  const vibratoEffect = useRef<Tone.Vibrato | null>(null)

  const initSynthInstrument = useCallback(() => {
    if (!synthInstrument.current) {
      const synthOptions = {
        portamento: instrumentParamsRef.current.portamento,
        volume: -15,
        oscillator: {
          type: instrumentParamsRef.current.synthType,
          modulationType: instrumentParamsRef.current.modulationType,
          harmonicity: instrumentParamsRef.current.harmonicity,
          spread: instrumentParamsRef.current.fatSpread,
          count: instrumentParamsRef.current.fatCount,
          width: instrumentParamsRef.current.pulseWidth,
          modulationFrequency: instrumentParamsRef.current.pwmFreq,
        },
        envelope: {
          attack: instrumentParamsRef.current.envAttack,
          decay: instrumentParamsRef.current.envDecay,
          sustain: instrumentParamsRef.current.envSustain,
          release: instrumentParamsRef.current.envRelease,
        },
        filter: {
          Q: instrumentParamsRef.current.resonance,
          rolloff: instrumentParamsRef.current.rolloff,
        },
        filterEnvelope: {
          baseFrequency: instrumentParamsRef.current.cutoff,
          attack: instrumentParamsRef.current.filterAttack,
          decay: instrumentParamsRef.current.filterDecay,
          sustain: instrumentParamsRef.current.filterSustain,
          release: instrumentParamsRef.current.filterRelease,
          octaves: instrumentParamsRef.current.filterAmount,
        },
      }
      // synthType/modulationType are stored as free strings; Tone types them as
      // strict oscillator-type unions, so widen through unknown at the boundary.
      // Poly mode wraps the same MonoSynth voice options in a PolySynth so a
      // note's release can ring while the next step plays (mono cuts it off).
      synthInstrument.current = instrumentParamsRef.current.poly
        ? new Tone.PolySynth(Tone.MonoSynth, synthOptions as unknown as Tone.MonoSynthOptions)
        : new Tone.MonoSynth(synthOptions as unknown as Tone.MonoSynthOptions)
      synthInstrument.current.connect(getCurrentEffect())
    }
  }, [getCurrentEffect])

  // Generic sampler initializer — the 8 sample banks differ only in their
  // URL map, folder, and volume (all in SAMPLER_CONFIGS), so one function
  // covers them all. Guards on `!ref.current` so it's safe to call repeatedly.
  const initSampler = useCallback(
    (ref: SamplerRef, config: SamplerConfig) => {
      if (!ref.current) {
        ref.current = new Tone.Sampler({
          urls: config.urls,
          baseUrl: window.location.origin + config.baseUrl,
        })
        ref.current.set({
          attack: instrumentParamsRef.current.samplerAttack,
          release: instrumentParamsRef.current.samplerRelease,
          volume: config.volume,
        })
        ref.current.connect(getCurrentEffect())
      }
    },
    [getCurrentEffect]
  )

  // Build the rhythmic engine from the single flat pack (if needed). Guards on
  // `!rhythmInstrument.current` so it's safe to call repeatedly.
  const initRhythmInstrument = useCallback(() => {
    if (!rhythmInstrument.current) {
      rhythmInstrument.current = new RhythmSampler(RHYTHM_PACK)
      rhythmInstrument.current.set({
        attack: instrumentParamsRef.current.samplerAttack,
        release: instrumentParamsRef.current.samplerRelease,
      })
      rhythmInstrument.current.connect(getCurrentEffect())
    }
  }, [getCurrentEffect])

  // Maps an instrument type string to its sampler ref. The synth is handled
  // separately (it's a MonoSynth, not a Sampler).
  const samplerRefs = useMemo<Record<string, SamplerRef>>(
    () => ({
      piano: pianoInstrument,
      marimba: marimbaInstrument,
      bass: bassInstrument,
      vibes: vibesInstrument,
      harp: harpInstrument,
      choral: choralInstrument,
      drums: drumsInstrument,
      'drum-machine': drumMachineInstrument,
    }),
    []
  )

  // Initialize (if needed) the instrument for `type` and point `instrument` at
  // it. Unknown types fall back to the synth (matching the prior switch default).
  const activateInstrument = useCallback(
    (type: string) => {
      if (type === 'rhythmic') {
        initRhythmInstrument()
        instrument.current = rhythmInstrument.current
        return
      }
      const config = SAMPLER_CONFIGS[type]
      if (config) {
        const ref = samplerRefs[type]
        initSampler(ref, config)
        instrument.current = ref.current
      } else {
        initSynthInstrument()
        instrument.current = synthInstrument.current
      }
    },
    [initRhythmInstrument, initSampler, initSynthInstrument, instrument, samplerRefs]
  )

  // initialize instruments

  useEffect(() => {
    // Channel output chain: instrument -> effect -> gain -> panner -> destination.
    // The panner applies stereo position to the whole channel.
    pannerNode.current = new Tone.Panner(instrumentParamsRef.current.pan).toDestination()
    gainNode.current = new Tone.Gain(instrumentParamsRef.current.gain).connect(pannerNode.current)
    if (CHORUS_ENABLED) {
      chorusEffect.current = new Tone.Chorus(
        instrumentParamsRef.current.chorusFreq,
        instrumentParamsRef.current.chorusDelayTime,
        instrumentParamsRef.current.chorusDepth
      ).connect(gainNode.current)
      chorusEffect.current.set({
        wet: instrumentParamsRef.current.effectWet,
        spread: instrumentParamsRef.current.chorusSpread,
      })
      if (instrumentParamsRef.current.effectType === 'chorus' && !chorusRunning(chorusEffect.current)) {
        chorusEffect.current.start()
      }
    }
    distortionEffect.current = new Tone.Distortion(instrumentParamsRef.current.distortion).connect(gainNode.current)
    distortionEffect.current.set({ wet: instrumentParamsRef.current.effectWet })
    delayEffect.current = new Tone.FeedbackDelay(
      instrumentParamsRef.current.delayTime,
      instrumentParamsRef.current.delayFeedback
    ).connect(gainNode.current)
    delayEffect.current.set({ wet: instrumentParamsRef.current.effectWet })
    reverbEffect.current = new Tone.Reverb(instrumentParamsRef.current.reverbDecay).connect(gainNode.current)
    reverbEffect.current.set({
      wet: instrumentParamsRef.current.effectWet,
      preDelay: instrumentParamsRef.current.reverbPreDelay,
    })
    vibratoEffect.current = new Tone.Vibrato(
      instrumentParamsRef.current.vibratoFreq,
      instrumentParamsRef.current.vibratoDepth
    ).connect(gainNode.current)
    vibratoEffect.current.set({
      wet: instrumentParamsRef.current.effectWet,
    })
    activateInstrument(initInstrumentType.current)
    instrument.current?.connect(getCurrentEffect())

    // cleanup instruments
    return () => {
      cleanupRef.current()
      // Dispose AND null each instrument ref. The init*Instrument() guards on
      // `if (!x.current)`, so leaving a disposed instance in the ref would make
      // a remount (e.g. React StrictMode's double-invoke in dev) skip recreation
      // and reuse a disposed Sampler — which has zero buffers and throws
      // "No available buffers" on triggerAttackRelease.
      if (synthInstrument.current) {
        synthInstrument.current.dispose()
        synthInstrument.current = null
      }
      if (marimbaInstrument.current) {
        marimbaInstrument.current.dispose()
        marimbaInstrument.current = null
      }
      if (pianoInstrument.current) {
        pianoInstrument.current.dispose()
        pianoInstrument.current = null
      }
      if (bassInstrument.current) {
        bassInstrument.current.dispose()
        bassInstrument.current = null
      }
      if (vibesInstrument.current) {
        vibesInstrument.current.dispose()
        vibesInstrument.current = null
      }
      if (harpInstrument.current) {
        harpInstrument.current.dispose()
        harpInstrument.current = null
      }
      if (choralInstrument.current) {
        choralInstrument.current.dispose()
        choralInstrument.current = null
      }
      if (drumsInstrument.current) {
        drumsInstrument.current.dispose()
        drumsInstrument.current = null
      }
      if (drumMachineInstrument.current) {
        drumMachineInstrument.current.dispose()
        drumMachineInstrument.current = null
      }
      if (rhythmInstrument.current) {
        rhythmInstrument.current.dispose()
        rhythmInstrument.current = null
      }
      if (chorusEffect.current) {
        chorusEffect.current.dispose()
      }
      distortionEffect.current?.dispose()
      delayEffect.current?.dispose()
      reverbEffect.current?.dispose()
      vibratoEffect.current?.dispose()
      if (gainNode.current) {
        gainNode.current.dispose()
      }
      if (pannerNode.current) {
        pannerNode.current.dispose()
      }
      instrument.current = null
    }
  }, [activateInstrument, getCurrentEffect, instrument])

  useEffect(() => {
    if (instrument.current) {
      // Monophonic's triggerRelease is arg-less while Sampler's requires a note;
      // releasing the active note with no arg is valid for both at runtime.
      // PolySynth's triggerRelease needs a note, so release every voice instead.
      if (instrument.current instanceof Tone.PolySynth) {
        instrument.current.releaseAll()
      } else {
        ;(instrument.current as Tone.MonoSynth).triggerRelease()
      }
    }
    activateInstrument(instrumentType)
  }, [activateInstrument, instrument, instrumentType])

  // Swap the synth node when the mono/poly flag changes. The node *type* differs
  // (MonoSynth vs PolySynth), so we dispose and rebuild rather than .set(). Guard
  // on a ref so this skips the initial mount (the synth is built lazily above).
  const polyRef = useRef(instrumentParams.poly)
  useEffect(() => {
    if (polyRef.current === instrumentParams.poly) return
    polyRef.current = instrumentParams.poly
    if (synthInstrument.current) {
      const wasActive = instrument.current === synthInstrument.current
      synthInstrument.current.dispose()
      synthInstrument.current = null
      initSynthInstrument()
      if (wasActive) {
        instrument.current = synthInstrument.current
      }
    }
  }, [initSynthInstrument, instrument, instrumentParams.poly])

  const openInstrumentModal = useCallback(() => {
    setModalType('instrument')
  }, [setModalType])

  const instruments = useMemo<InstrumentRefs>(
    () => ({
      synthInstrument,
      pianoInstrument,
      marimbaInstrument,
      bassInstrument,
      vibesInstrument,
      harpInstrument,
      choralInstrument,
      drumsInstrument,
      drumMachineInstrument,
      rhythmInstrument,
    }),
    [
      bassInstrument,
      choralInstrument,
      drumMachineInstrument,
      drumsInstrument,
      harpInstrument,
      marimbaInstrument,
      pianoInstrument,
      synthInstrument,
      vibesInstrument,
      rhythmInstrument,
    ]
  )
  const effects = useMemo<EffectRefs>(
    () => ({
      chorusEffect,
      distortionEffect,
      delayEffect,
      reverbEffect,
      vibratoEffect,
    }),
    [chorusEffect, delayEffect, distortionEffect, reverbEffect, vibratoEffect]
  )

  return {
    gainNode,
    pannerNode,
    synthInstrument,
    pianoInstrument,
    marimbaInstrument,
    drumsInstrument,
    drumMachineInstrument,
    bassInstrument,
    vibesInstrument,
    harpInstrument,
    choralInstrument,
    rhythmInstrument,
    chorusEffect,
    distortionEffect,
    delayEffect,
    reverbEffect,
    vibratoEffect,
    getCurrentEffect,
    openInstrumentModal,
    instruments,
    effects,
  }
}

export function updateInstruments(
  gainNode: Tone.Gain,
  pannerNode: Tone.Panner | null | undefined,
  synthInstrument: Tone.MonoSynth | Tone.PolySynth<Tone.MonoSynth> | null | undefined,
  samplerInstruments: Array<Tone.Sampler | null | undefined>,
  rhythmInstrument: RhythmSampler | null | undefined,
  chorusEffect: Tone.Chorus | null | undefined,
  distortionEffect: Tone.Distortion,
  delayEffect: Tone.FeedbackDelay,
  reverbEffect: Tone.Reverb,
  vibratoEffect: Tone.Vibrato,
  instrumentParams: InstrumentParams,
  currentEffect: SignalDestination | null | undefined
) {
  gainNode.set({ gain: instrumentParams.gain })
  pannerNode?.set({ pan: instrumentParams.pan })
  if (CHORUS_ENABLED) {
    chorusEffect?.set({
      wet: instrumentParams.effectWet,
      depth: instrumentParams.chorusDepth,
      delayTime: instrumentParams.chorusDelayTime,
      frequency: instrumentParams.chorusFreq,
      spread: instrumentParams.chorusSpread,
    })
  }
  distortionEffect.set({
    wet: instrumentParams.effectWet,
    distortion: instrumentParams.distortion,
  })
  delayEffect.set({
    wet: instrumentParams.effectWet,
    delayTime: instrumentParams.delayTime,
    feedback: instrumentParams.delayFeedback,
  })
  reverbEffect.set({
    wet: instrumentParams.effectWet,
    decay: instrumentParams.reverbDecay,
    preDelay: instrumentParams.reverbPreDelay,
  })
  vibratoEffect.set({
    wet: instrumentParams.effectWet,
    depth: instrumentParams.vibratoDepth,
    frequency: instrumentParams.vibratoFreq,
  })
  let effect: SignalDestination | null | undefined
  switch (instrumentParams.effectType) {
    case 'chorus':
      effect = chorusEffect
      if (CHORUS_ENABLED && chorusEffect && !chorusRunning(chorusEffect)) chorusEffect.start()
      break
    case 'distortion':
      effect = distortionEffect
      break
    case 'delay':
      effect = delayEffect
      break
    case 'reverb':
      effect = reverbEffect
      break
    case 'vibrato':
      effect = vibratoEffect
      break
    default:
      effect = gainNode
  }
  const destination: SignalDestination = effect || gainNode
  if (CHORUS_ENABLED && instrumentParams.effectType !== 'chorus' && chorusEffect && chorusRunning(chorusEffect)) {
    chorusEffect.stop()
  }
  if (synthInstrument) {
    // synthType/modulationType are stored as free strings; Tone types them as
    // strict oscillator-type unions, so widen through unknown at the boundary.
    // MonoSynth and PolySynth take the same nested voice options at runtime, so
    // type the receiver as MonoSynth to satisfy the union method-call check.
    ;(synthInstrument as Tone.MonoSynth).set({
      portamento: instrumentParams.portamento,
      oscillator: {
        type: instrumentParams.synthType,
        modulationType: instrumentParams.modulationType,
        harmonicity: instrumentParams.harmonicity,
        spread: instrumentParams.fatSpread,
        count: instrumentParams.fatCount,
        width: instrumentParams.pulseWidth,
        modulationFrequency: instrumentParams.pwmFreq,
      },
      envelope: {
        attack: instrumentParams.envAttack,
        decay: instrumentParams.envDecay,
        sustain: instrumentParams.envSustain,
        release: instrumentParams.envRelease,
      },
      filter: {
        Q: instrumentParams.resonance,
        rolloff: instrumentParams.rolloff,
      },
      filterEnvelope: {
        baseFrequency: instrumentParams.cutoff,
        attack: instrumentParams.filterAttack,
        decay: instrumentParams.filterDecay,
        sustain: instrumentParams.filterSustain,
        release: instrumentParams.filterRelease,
        octaves: instrumentParams.filterAmount,
      },
    } as unknown as Tone.MonoSynthOptions)
    if (currentEffect) {
      synthInstrument.disconnect(currentEffect)
    }
    synthInstrument.connect(destination)
  }
  samplerInstruments.forEach((sampler) => {
    if (sampler) {
      sampler.set({
        attack: instrumentParams.samplerAttack,
        release: instrumentParams.samplerRelease,
      })
      if (currentEffect) {
        sampler.disconnect(currentEffect)
      }
      sampler.connect(destination)
    }
  })
  // The rhythmic engine shares the sampler attack/release and the same effect chain.
  if (rhythmInstrument) {
    rhythmInstrument.set({
      attack: instrumentParams.samplerAttack,
      release: instrumentParams.samplerRelease,
    })
    if (currentEffect) {
      rhythmInstrument.disconnect(currentEffect)
    }
    rhythmInstrument.connect(destination)
  }
}
