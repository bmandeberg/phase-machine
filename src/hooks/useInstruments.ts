import { useRef, useEffect, useCallback, useMemo, MutableRefObject } from 'react'
import { CHORUS_ENABLED } from '../globals'
import * as Tone from 'tone'
import {
  InstrumentParams,
  InstrumentRef,
  InstrumentRefs,
  EffectSlot,
  EffectSlots,
  EffectType,
  GainRef,
  PannerRef,
  SamplerRef,
} from '../types'
import { SAMPLER_CONFIGS, SamplerConfig, RHYTHM_PACK, PERCUSSION_PACK } from '../samplerConfigs'
import { RhythmSampler } from '../rhythmSampler'

// Tone.Chorus.start()/stop() drive its internal LFOs and are NOT idempotent —
// starting an already-running LFO (or stopping a stopped one) throws "Start time
// must be strictly greater than previous start time". Guard start/stop by reading
// the LFO's actual playback state. _lfoL is private in Tone's types, hence the cast.
function chorusRunning(chorus: Tone.Chorus) {
  return (chorus as unknown as { _lfoL: { state: string } })._lfoL?.state === 'started'
}

// A uniform handle over one slot's live Tone node (a single effect, or — for the
// EQ — a small composite of filters). `input` is where upstream feeds in; connect()
// wires this slot's OUTPUT to the next node; setParams() pushes the slot's params to
// the node; start/stop drive any LFO (chorus only). Created lazily by type; null = none.
export interface SlotNode {
  type: EffectType
  input: Tone.ToneAudioNode
  connect: (dest: Tone.ToneAudioNode) => void
  disconnect: () => void
  dispose: () => void
  setParams: (slot: EffectSlot) => void
  start: () => void
  stop: () => void
  // FFT tap for slots that visualize the signal (currently the EQ's spectrum).
  analyser?: Tone.Analyser
}
export type SlotNodes = [SlotNode | null, SlotNode | null, SlotNode | null]
export type SlotNodesRef = MutableRefObject<SlotNodes>

function wrapNode(
  type: EffectType,
  node: Tone.ToneAudioNode,
  setParams: (slot: EffectSlot) => void,
  lfo?: { start: () => void; stop: () => void }
): SlotNode {
  return {
    type,
    input: node,
    connect: (dest) => {
      node.connect(dest)
    },
    disconnect: () => {
      try {
        node.disconnect()
      } catch {
        /* node had no outgoing connections */
      }
    },
    dispose: () => node.dispose(),
    setParams,
    start: lfo?.start ?? (() => {}),
    stop: lfo?.stop ?? (() => {}),
  }
}

// Build the live Tone node for a slot from its params. Returns null for `none`
// (passthrough) — and for chorus when CHORUS_ENABLED is false (Safari).
export function createSlotNode(slot: EffectSlot): SlotNode | null {
  switch (slot.type) {
    case 'chorus': {
      if (!CHORUS_ENABLED) return null
      const n = new Tone.Chorus(slot.chorusFreq, slot.chorusDelayTime, slot.chorusDepth)
      n.set({ wet: slot.wet, spread: slot.chorusSpread })
      return wrapNode(
        'chorus',
        n,
        (s) => n.set({ wet: s.wet, depth: s.chorusDepth, delayTime: s.chorusDelayTime, frequency: s.chorusFreq, spread: s.chorusSpread }),
        {
          start: () => {
            if (!chorusRunning(n)) n.start()
          },
          stop: () => {
            if (chorusRunning(n)) n.stop()
          },
        }
      )
    }
    case 'distortion': {
      const n = new Tone.Distortion(slot.distortion)
      n.set({ wet: slot.wet })
      return wrapNode('distortion', n, (s) => {
        n.set({ wet: s.wet })
        n.distortion = s.distortion
      })
    }
    case 'delay': {
      const n = new Tone.FeedbackDelay(slot.delayTime, slot.delayFeedback)
      n.set({ wet: slot.wet })
      return wrapNode('delay', n, (s) => n.set({ wet: s.wet, delayTime: s.delayTime, feedback: s.delayFeedback }))
    }
    case 'reverb': {
      const n = new Tone.Reverb(slot.reverbDecay)
      n.set({ wet: slot.wet, preDelay: slot.reverbPreDelay })
      return wrapNode('reverb', n, (s) => n.set({ wet: s.wet, decay: s.reverbDecay, preDelay: s.reverbPreDelay }))
    }
    case 'vibrato': {
      const n = new Tone.Vibrato(slot.vibratoFreq, slot.vibratoDepth)
      n.set({ wet: slot.wet })
      return wrapNode('vibrato', n, (s) => n.set({ wet: s.wet, depth: s.vibratoDepth, frequency: s.vibratoFreq }))
    }
    case 'bitcrusher': {
      const n = new Tone.BitCrusher(slot.bits)
      n.set({ wet: slot.wet })
      return wrapNode('bitcrusher', n, (s) => {
        n.set({ wet: s.wet })
        n.bits.value = s.bits
      })
    }
    case 'pitch': {
      const n = new Tone.PitchShift({ pitch: slot.pitchShift, feedback: slot.pitchFeedback })
      n.set({ wet: slot.wet })
      return wrapNode('pitch', n, (s) => {
        n.set({ wet: s.wet, feedback: s.pitchFeedback })
        n.pitch = s.pitchShift
      })
    }
    case 'phaser': {
      const n = new Tone.Phaser({
        frequency: slot.phaserFreq,
        octaves: slot.phaserOctaves,
        baseFrequency: slot.phaserBaseFreq,
        Q: slot.phaserQ,
      })
      n.set({ wet: slot.wet })
      return wrapNode('phaser', n, (s) =>
        n.set({ wet: s.wet, frequency: s.phaserFreq, octaves: s.phaserOctaves, baseFrequency: s.phaserBaseFreq, Q: s.phaserQ })
      )
    }
    case 'compressor': {
      const n = new Tone.Compressor({
        threshold: slot.compThreshold,
        ratio: slot.compRatio,
        attack: slot.compAttack,
        release: slot.compRelease,
      })
      return wrapNode('compressor', n, (s) =>
        n.set({ threshold: s.compThreshold, ratio: s.compRatio, attack: s.compAttack, release: s.compRelease })
      )
    }
    case 'multibandComp': {
      const band = (threshold: number) => ({ threshold, ratio: slot.mbRatio, attack: slot.mbAttack, release: slot.mbRelease })
      const n = new Tone.MultibandCompressor({
        lowFrequency: slot.mbLowFreq,
        highFrequency: slot.mbHighFreq,
        low: band(slot.mbLowThreshold),
        mid: band(slot.mbMidThreshold),
        high: band(slot.mbHighThreshold),
      })
      return wrapNode('multibandComp', n, (s) => {
        n.low.set({ threshold: s.mbLowThreshold, ratio: s.mbRatio, attack: s.mbAttack, release: s.mbRelease })
        n.mid.set({ threshold: s.mbMidThreshold, ratio: s.mbRatio, attack: s.mbAttack, release: s.mbRelease })
        n.high.set({ threshold: s.mbHighThreshold, ratio: s.mbRatio, attack: s.mbAttack, release: s.mbRelease })
        n.lowFrequency.value = s.mbLowFreq
        n.highFrequency.value = s.mbHighFreq
      })
    }
    case 'eq': {
      // low-shelf -> mid peak -> high-shelf, exposed as one slot node.
      const low = new Tone.Filter({ type: 'lowshelf', frequency: slot.eqLowFreq, gain: slot.eqLowGain })
      const mid = new Tone.Filter({ type: 'peaking', frequency: slot.eqMidFreq, gain: slot.eqMidGain, Q: slot.eqMidQ })
      const high = new Tone.Filter({ type: 'highshelf', frequency: slot.eqHighFreq, gain: slot.eqHighGain })
      low.connect(mid)
      mid.connect(high)
      // FFT tap on the EQ output, for the graph's spectrum overlay. Re-attached in
      // connect() (disconnect() blanket-clears high's outputs, including this tap) so
      // it survives a slot reorder; passive, so it never alters the audio.
      const analyser = new Tone.Analyser('fft', 512)
      return {
        type: 'eq',
        input: low,
        analyser,
        connect: (dest) => {
          high.connect(dest)
          high.connect(analyser)
        },
        disconnect: () => {
          try {
            high.disconnect()
          } catch {
            /* no outgoing connection */
          }
        },
        dispose: () => {
          low.dispose()
          mid.dispose()
          high.dispose()
          analyser.dispose()
        },
        setParams: (s) => {
          low.set({ frequency: s.eqLowFreq, gain: s.eqLowGain })
          mid.set({ frequency: s.eqMidFreq, gain: s.eqMidGain, Q: s.eqMidQ })
          high.set({ frequency: s.eqHighFreq, gain: s.eqHighGain })
        },
        start: () => {},
        stop: () => {},
      }
    }
    default:
      return null
  }
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
  const hxcInstrument = useRef<Tone.Sampler | null>(null)
  const rhythmInstrument = useRef<RhythmSampler | null>(null)
  const percussionInstrument = useRef<RhythmSampler | null>(null)
  const metalInstrument = useRef<Tone.MetalSynth | null>(null)
  const pluckInstrument = useRef<Tone.PluckSynth | null>(null)

  // 3 serial effect slots: the live nodes, and the node instruments feed into
  // (slot0's input, or the gain when every slot is `none`).
  const slotNodesRef: SlotNodesRef = useRef<SlotNodes>([null, null, null])
  const chainHeadRef = useRef<Tone.ToneAudioNode | null>(null)

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
      hxcInstrument,
      rhythmInstrument,
      percussionInstrument,
      metalInstrument,
      pluckInstrument,
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
      hxcInstrument,
      rhythmInstrument,
      percussionInstrument,
      metalInstrument,
      pluckInstrument,
    ]
  )

  // The node instruments should connect to: slot0's input, or the gain if all none.
  const getChainHead = useCallback((): Tone.ToneAudioNode => {
    return chainHeadRef.current ?? (gainNode.current as Tone.ToneAudioNode)
  }, [])

  // Rebuild the whole series chain from a fresh `effects` array. Only the type of a
  // slot triggers create/dispose; slots whose type is unchanged keep their node and
  // just get .setParams(). Handles reconnecting every initialized instrument to the
  // new head and (re)starting chorus LFOs. Safe to call repeatedly.
  const rebuildEffectChain = useCallback(
    (slots: EffectSlots) => {
      if (!gainNode.current) return
      const gain = gainNode.current
      const nodes = slotNodesRef.current
      const oldHead = chainHeadRef.current

      // 1. detach instruments from the current head (if any)
      if (oldHead) {
        Object.values(instruments).forEach((r) => {
          if (r.current) {
            try {
              r.current.disconnect(oldHead)
            } catch {
              /* wasn't connected */
            }
          }
        })
      }
      // 2. drop every live node's outgoing edges (tail->gain and inter-slot links)
      nodes.forEach((n) => n?.disconnect())
      // 3. reconcile each slot: rebuild on type change, else just update params
      for (let i = 0; i < 3; i++) {
        const want = slots[i].type
        const have = nodes[i] ? nodes[i]!.type : 'none'
        if (want !== have) {
          if (nodes[i]) {
            nodes[i]!.stop()
            nodes[i]!.dispose()
          }
          nodes[i] = createSlotNode(slots[i])
        } else {
          nodes[i]?.setParams(slots[i])
        }
      }
      // 4. active nodes in order
      const active = nodes.filter((n): n is SlotNode => !!n)
      // 5. chain them: each -> next slot's input, last -> gain
      active.forEach((n, k) => n.connect(k < active.length - 1 ? active[k + 1].input : gain))
      chainHeadRef.current = active.length ? active[0].input : gain
      // 6. reconnect instruments to the new head
      const head = chainHeadRef.current
      Object.values(instruments).forEach((r) => {
        if (r.current) r.current.connect(head)
      })
      // 7. (re)start any chorus LFOs that are now active
      active.forEach((n) => n.start())
    },
    [instruments]
  )

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
      synthInstrument.current = instrumentParamsRef.current.poly
        ? new Tone.PolySynth(Tone.MonoSynth, synthOptions as unknown as Tone.MonoSynthOptions)
        : new Tone.MonoSynth(synthOptions as unknown as Tone.MonoSynthOptions)
      synthInstrument.current.connect(getChainHead())
    }
  }, [getChainHead])

  // Generic sampler initializer — the 8 sample banks differ only in their URL map,
  // folder, and volume (all in SAMPLER_CONFIGS). Guards on `!ref.current`.
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
        ref.current.connect(getChainHead())
      }
    },
    [getChainHead]
  )

  // Varispeed engine for the single flat rhythmic pack (built lazily on activate).
  const initRhythmInstrument = useCallback(() => {
    if (!rhythmInstrument.current) {
      rhythmInstrument.current = new RhythmSampler(RHYTHM_PACK)
      rhythmInstrument.current.set({
        attack: instrumentParamsRef.current.samplerAttack,
        release: instrumentParamsRef.current.samplerRelease,
      })
      rhythmInstrument.current.connect(getChainHead())
    }
  }, [getChainHead])

  // Second varispeed engine for the percussion-chops pack (same shape as rhythmic).
  const initPercussionInstrument = useCallback(() => {
    if (!percussionInstrument.current) {
      percussionInstrument.current = new RhythmSampler(PERCUSSION_PACK)
      percussionInstrument.current.set({
        attack: instrumentParamsRef.current.samplerAttack,
        release: instrumentParamsRef.current.samplerRelease,
      })
      percussionInstrument.current.connect(getChainHead())
    }
  }, [getChainHead])

  const initMetalInstrument = useCallback(() => {
    if (!metalInstrument.current) {
      const p = instrumentParamsRef.current
      metalInstrument.current = new Tone.MetalSynth({
        harmonicity: p.metalHarmonicity,
        modulationIndex: p.metalModulationIndex,
        resonance: p.metalResonance,
        octaves: p.metalOctaves,
        envelope: { attack: p.metalAttack, decay: p.metalDecay, release: p.metalRelease },
        volume: -12,
      })
      metalInstrument.current.connect(getChainHead())
    }
  }, [getChainHead])

  const initPluckInstrument = useCallback(() => {
    if (!pluckInstrument.current) {
      const p = instrumentParamsRef.current
      pluckInstrument.current = new Tone.PluckSynth({
        attackNoise: p.pluckAttackNoise,
        dampening: p.pluckDampening,
        resonance: p.pluckResonance,
        release: p.pluckRelease,
      })
      pluckInstrument.current.connect(getChainHead())
    }
  }, [getChainHead])

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
      hxc: hxcInstrument,
    }),
    []
  )

  const activateInstrument = useCallback(
    (type: string) => {
      if (type === 'rhythmic') {
        initRhythmInstrument()
        instrument.current = rhythmInstrument.current
        return
      }
      if (type === 'percussion') {
        initPercussionInstrument()
        instrument.current = percussionInstrument.current
        return
      }
      if (type === 'metal') {
        initMetalInstrument()
        instrument.current = metalInstrument.current
        return
      }
      if (type === 'pluck') {
        initPluckInstrument()
        instrument.current = pluckInstrument.current
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
    [
      initRhythmInstrument,
      initPercussionInstrument,
      initMetalInstrument,
      initPluckInstrument,
      initSampler,
      initSynthInstrument,
      instrument,
      samplerRefs,
    ]
  )

  // initialize instruments
  useEffect(() => {
    // Channel output chain: instruments -> effects[0..2] -> gain -> panner -> dest.
    pannerNode.current = new Tone.Panner(instrumentParamsRef.current.pan).toDestination()
    gainNode.current = new Tone.Gain(instrumentParamsRef.current.gain).connect(pannerNode.current)
    chainHeadRef.current = gainNode.current
    rebuildEffectChain(instrumentParamsRef.current.effects)
    activateInstrument(initInstrumentType.current)

    // cleanup instruments
    return () => {
      cleanupRef.current()
      // Dispose AND null each instrument ref so a StrictMode remount recreates them
      // rather than reusing a disposed Sampler (which throws "No available buffers").
      const refs = [
        synthInstrument,
        marimbaInstrument,
        pianoInstrument,
        bassInstrument,
        vibesInstrument,
        harpInstrument,
        choralInstrument,
        drumsInstrument,
        drumMachineInstrument,
        hxcInstrument,
        rhythmInstrument,
        percussionInstrument,
        metalInstrument,
        pluckInstrument,
      ]
      refs.forEach((r) => {
        if (r.current) {
          r.current.dispose()
          r.current = null
        }
      })
      slotNodesRef.current.forEach((n) => {
        n?.stop()
        n?.dispose()
      })
      slotNodesRef.current = [null, null, null]
      chainHeadRef.current = null
      if (gainNode.current) gainNode.current.dispose()
      if (pannerNode.current) pannerNode.current.dispose()
      instrument.current = null
    }
  }, [activateInstrument, instrument, rebuildEffectChain])

  useEffect(() => {
    if (instrument.current) {
      if (instrument.current instanceof Tone.PolySynth) {
        instrument.current.releaseAll()
      } else {
        ;(instrument.current as Tone.MonoSynth).triggerRelease()
      }
    }
    activateInstrument(instrumentType)
  }, [activateInstrument, instrument, instrumentType])

  // Swap the synth node when the mono/poly flag changes (different node type).
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

  // Push a full instrumentParams snapshot to the live nodes (used on preset load):
  // gain/pan, the synth/sampler voice params, and a rebuild of the effect chain.
  const reloadInstruments = useCallback(
    (params: InstrumentParams) => {
      gainNode.current?.set({ gain: params.gain })
      pannerNode.current?.set({ pan: params.pan })
      if (synthInstrument.current) {
        ;(synthInstrument.current as Tone.MonoSynth).set({
          portamento: params.portamento,
          oscillator: {
            type: params.synthType,
            modulationType: params.modulationType,
            harmonicity: params.harmonicity,
            spread: params.fatSpread,
            count: params.fatCount,
            width: params.pulseWidth,
            modulationFrequency: params.pwmFreq,
          },
          envelope: {
            attack: params.envAttack,
            decay: params.envDecay,
            sustain: params.envSustain,
            release: params.envRelease,
          },
          filter: {
            Q: params.resonance,
            rolloff: params.rolloff,
          },
          filterEnvelope: {
            baseFrequency: params.cutoff,
            attack: params.filterAttack,
            decay: params.filterDecay,
            sustain: params.filterSustain,
            release: params.filterRelease,
            octaves: params.filterAmount,
          },
        } as unknown as Tone.MonoSynthOptions)
      }
      Object.values(samplerRefs).forEach((r) =>
        r.current?.set({ attack: params.samplerAttack, release: params.samplerRelease })
      )
      // Both varispeed packs share the sampler attack/release; metal/pluck have their own.
      rhythmInstrument.current?.set({ attack: params.samplerAttack, release: params.samplerRelease })
      percussionInstrument.current?.set({ attack: params.samplerAttack, release: params.samplerRelease })
      metalInstrument.current?.set({
        harmonicity: params.metalHarmonicity,
        modulationIndex: params.metalModulationIndex,
        resonance: params.metalResonance,
        octaves: params.metalOctaves,
        envelope: { attack: params.metalAttack, decay: params.metalDecay, release: params.metalRelease },
      })
      pluckInstrument.current?.set({
        attackNoise: params.pluckAttackNoise,
        dampening: params.pluckDampening,
        resonance: params.pluckResonance,
        release: params.pluckRelease,
      })
      rebuildEffectChain(params.effects)
    },
    [rebuildEffectChain, samplerRefs]
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
    hxcInstrument,
    rhythmInstrument,
    percussionInstrument,
    metalInstrument,
    pluckInstrument,
    slotNodesRef,
    rebuildEffectChain,
    reloadInstruments,
    getChainHead,
    openInstrumentModal,
    instruments,
  }
}
