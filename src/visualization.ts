// Pure analysis + phase-simulation helpers for the per-channel visualizer modal.
//
// simulateChannel mirrors the live scheduling in Channel.tsx (seqCallback /
// keyCallback / clearPlayNoteBuffer) closely enough to reproduce the note stream
// a channel would play, WITHOUT touching Tone or the transport:
//  - the sequence loop advances currentStep via the seq movement's arp, the key
//    loop advances noteIndex through the pitch range via the key movement's arp
//  - a note fires on a tick only while the current step is on; a seq tick takes
//    priority over a key tick landing at the same moment (the play-note buffer)
//  - hold sustains through consecutive on-steps and repeated pitches; otherwise
//    notes last max(sustain * keyInterval, 0.08s), cut short by the next note
// Two knowing simplifications: ticks merge only when they land at exactly the
// same musical time (the live buffer merges anything within 15ms), and events
// sit on the straight grid — swing warps live timing inside a phrase but never
// changes which notes play, so it's displayed separately (see swingTickPosition).
//
// Everything here is pure and unit-tested (visualization.test.ts). Time is kept
// in beats (quarter notes) as exact fractions so triplet/dotted rates align and
// the full polymetric phase is a true LCM, not a float approximation.

import { MOVEMENTS } from './globals'
import { pitchesInRange, rangeWrapper, scaleToRange, lerp, constrain } from './math'

// ---------------------------------------------------------------------------
// exact beat fractions

export interface Frac {
  n: number
  d: number
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

function reduce(f: Frac): Frac {
  const g = gcd(f.n, f.d) || 1
  return { n: f.n / g, d: f.d / g }
}

export function fracToNumber(f: Frac): number {
  return f.n / f.d
}

// Exact-fraction twin of math.rateToSeconds, in beats (quarter notes).
export function rateToBeatsFrac(rate: string): Frac {
  if (rate[0] === '/') return { n: parseInt(rate.slice(1), 10), d: 1 }
  if (rate[0] === '*') return { n: 1, d: parseInt(rate.slice(1), 10) }
  let f: Frac = rate.endsWith('m') ? { n: parseInt(rate, 10) * 4, d: 1 } : { n: 4, d: parseInt(rate, 10) }
  if (rate.endsWith('t')) {
    f = { n: f.n * 2, d: f.d * 3 }
  } else if (rate.endsWith('.')) {
    f = { n: f.n * 3, d: f.d * 2 }
  }
  return reduce(f)
}

export function mulFrac(f: Frac, k: number): Frac {
  return reduce({ n: f.n * k, d: f.d })
}

// LCM of two positive fractions: reduce both, then lcm(numerators)/gcd(denominators).
export function lcmFrac(a: Frac, b: Frac): Frac {
  const ra = reduce(a)
  const rb = reduce(b)
  const n = (ra.n / gcd(ra.n, rb.n)) * rb.n
  const d = gcd(ra.d, rb.d)
  return { n, d }
}

// ---------------------------------------------------------------------------
// arp movement stepping

// One arp advance, matching globals.handleArpMode but with injectable randomness
// (MOVEMENTS.random uses Math.random, which would make simulations unrepeatable).
function arpStep(
  mode: string,
  length: number,
  i: number | undefined,
  util: { current: boolean },
  inc1: number,
  inc2: number,
  rng: () => number
): number {
  switch (mode) {
    case 'up':
    case 'down':
      return MOVEMENTS[mode](length, i)
    case 'up/down':
      return MOVEMENTS['up/down'](length, i, util)
    case '+/-':
      return MOVEMENTS['+/-'](length, i, inc1, inc2, util)
    case 'random':
      return Math.floor(rng() * length)
    default:
      return 0
  }
}

export interface VizChannelConfig {
  key: boolean[]
  keyRate: string
  keyMovement: string
  keyArpInc1: number
  keyArpInc2: number
  sustain: number
  rangeMode: boolean
  rangeStart: number
  rangeEnd: number
  keybdPitches: number[]
  seqSteps: boolean[]
  seqLength: number
  seqRate: string
  seqMovement: string
  seqArpInc1: number
  seqArpInc2: number
  hold: boolean
}

// The two steppers replicate the live loops' index bookkeeping exactly — including
// their edge quirks (up/down can step outside the range: the seq loop constrains
// the index it hands back to the arp while currentStep itself may sit out of
// bounds on an always-off step; the key loop plays silence and restarts the arp
// cold). Cycle detection and simulateChannel share them so they can't diverge.

interface SeqStepper {
  tick: () => void
  state: () => { currentStep: number; prevStep: number; nextStep: number }
  stateKey: () => string
}

function makeSeqStepper(cfg: VizChannelConfig, rng: () => number): SeqStepper {
  let currentStep: number | undefined
  let prevStep: number | undefined
  let nextStep: number | undefined
  const util = { current: false }
  return {
    tick: () => {
      if (currentStep === undefined) {
        currentStep = arpStep(cfg.seqMovement, cfg.seqLength, undefined, util, cfg.seqArpInc1, cfg.seqArpInc2, rng)
      }
      prevStep = currentStep
      if (nextStep !== undefined) {
        currentStep = nextStep
      }
      nextStep = arpStep(
        cfg.seqMovement,
        cfg.seqLength,
        constrain(currentStep, 0, cfg.seqLength - 1),
        util,
        cfg.seqArpInc1,
        cfg.seqArpInc2,
        rng
      )
    },
    state: () => ({ currentStep: currentStep as number, prevStep: prevStep as number, nextStep: nextStep as number }),
    stateKey: () => `${currentStep}|${nextStep}|${util.current}`,
  }
}

interface KeyStepper {
  tick: () => void
  state: () => { noteIdx: number | undefined; prevNoteIdx: number | undefined }
  stateKey: () => string
}

function makeKeyStepper(cfg: VizChannelConfig, pitchRange: number[], rng: () => number): KeyStepper {
  let noteIdx: number | undefined
  let prevNoteIdx: number | undefined
  const util = { current: false }
  return {
    tick: () => {
      prevNoteIdx = noteIdx
      let currentPitchIndex: number | undefined
      if (noteIdx !== undefined) {
        // static config: the sounding pitch is always found (the live nearest-pitch
        // fallback only matters when the range/key changes mid-note), but an
        // out-of-range arp result leaves noteIdx undefined and restarts the arp
        const found = pitchRange.indexOf(noteIdx)
        currentPitchIndex = found === -1 ? undefined : found
      }
      const next = arpStep(
        cfg.keyMovement,
        pitchRange.length,
        currentPitchIndex,
        util,
        cfg.keyArpInc1,
        cfg.keyArpInc2,
        rng
      )
      noteIdx = pitchRange[next]
    },
    state: () => ({ noteIdx, prevNoteIdx }),
    stateKey: () => `${noteIdx}|${util.current}`,
  }
}

// Ticks after which a stepper's walk repeats (found by replaying it from the cold
// start until a state recurs; a pre-cycle transient is skipped). null = no cycle
// found within the cap — random movements, or degenerate configs.
function cycleTicks(stepper: { tick: () => void; stateKey: () => string }, cap: number): number | null {
  const seen = new Map<string, number>()
  for (let tick = 0; tick < cap; tick++) {
    stepper.tick()
    const key = stepper.stateKey()
    const prior = seen.get(key)
    if (prior !== undefined) {
      return tick - prior
    }
    seen.set(key, tick)
  }
  return null
}

export function seqCycleTicks(cfg: VizChannelConfig): number | null {
  if (cfg.seqMovement === 'random' || cfg.seqLength <= 0) return null
  const cap = Math.max(4 * cfg.seqLength * cfg.seqLength, 64)
  return cycleTicks(makeSeqStepper(cfg, () => 0), cap)
}

export function keyCycleTicks(cfg: VizChannelConfig, pitchRange: number[]): number | null {
  if (cfg.keyMovement === 'random' || !pitchRange.length) return null
  const cap = Math.max(8 * pitchRange.length, 64)
  return cycleTicks(makeKeyStepper(cfg, pitchRange, () => 0), cap)
}

// ---------------------------------------------------------------------------
// channel phase simulation

export interface SimNoteEvent {
  // onset/duration in beats from the start of the simulated phase
  time: number
  duration: number
  pitch: number // internal pitch number (noteString-compatible)
  step: number // seq step index at onset
  source: 'seq' | 'key'
}

export interface PhaseInfo {
  deterministic: boolean
  // ticks per movement cycle (falls back to the nominal length when random)
  seqCycleTicks: number
  keyCycleTicks: number
  // beats per cycle / per full combined phase
  seqCycleBeats: number
  keyCycleBeats: number
  phaseBeats: number | null // null when a movement is random
  // how many of each cycle fit in the full phase (deterministic only)
  seqCyclesPerPhase: number | null
  keyCyclesPerPhase: number | null
}

export interface SimResult {
  events: SimNoteEvent[]
  pitchRange: number[]
  phase: PhaseInfo
  // beats actually simulated (== phaseBeats unless truncated/random)
  simulatedBeats: number
  truncated: boolean
}

export interface SimOptions {
  tempo?: number // bpm, for the 0.08s minimum sustain floor (default 120)
  maxBeats?: number // cap on the simulated span (default 512)
  maxEvents?: number
  seed?: number // rng seed for random movements
}

// Deterministic small PRNG (mulberry32) so random-movement simulations are repeatable.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function vizPitchRange(cfg: VizChannelConfig): number[] {
  return cfg.rangeMode ? pitchesInRange(cfg.rangeStart, cfg.rangeEnd, cfg.key) : cfg.keybdPitches
}

export function phaseInfo(cfg: VizChannelConfig): PhaseInfo {
  const pitchRange = vizPitchRange(cfg)
  const seqInt = rateToBeatsFrac(cfg.seqRate)
  const keyInt = rateToBeatsFrac(cfg.keyRate)
  const seqCycle = seqCycleTicks(cfg)
  const keyCycle = keyCycleTicks(cfg, pitchRange)
  const deterministic = seqCycle !== null && keyCycle !== null
  const seqTicks = seqCycle ?? Math.max(cfg.seqLength, 1)
  const keyTicks = keyCycle ?? Math.max(pitchRange.length, 1)
  const seqCycleFrac = mulFrac(seqInt, seqTicks)
  const keyCycleFrac = mulFrac(keyInt, keyTicks)
  const phaseFrac = deterministic ? lcmFrac(seqCycleFrac, keyCycleFrac) : null
  return {
    deterministic,
    seqCycleTicks: seqTicks,
    keyCycleTicks: keyTicks,
    seqCycleBeats: fracToNumber(seqCycleFrac),
    keyCycleBeats: fracToNumber(keyCycleFrac),
    phaseBeats: phaseFrac ? fracToNumber(phaseFrac) : null,
    seqCyclesPerPhase: phaseFrac ? Math.round(fracToNumber(phaseFrac) / fracToNumber(seqCycleFrac)) : null,
    keyCyclesPerPhase: phaseFrac ? Math.round(fracToNumber(phaseFrac) / fracToNumber(keyCycleFrac)) : null,
  }
}

export function simulateChannel(cfg: VizChannelConfig, opts: SimOptions = {}): SimResult {
  const { tempo = 120, maxBeats = 512, maxEvents = 4000, seed = 1 } = opts
  const pitchRange = vizPitchRange(cfg)
  const phase = phaseInfo(cfg)
  const rng = mulberry32(seed)

  // span to simulate: the full phase when we know it and it fits, else a cap
  let spanBeats = phase.phaseBeats ?? Math.min(maxBeats, 128)
  let truncated = false
  if (spanBeats > maxBeats) {
    spanBeats = maxBeats
    truncated = true
  }

  const events: SimNoteEvent[] = []
  const result: SimResult = { events, pitchRange, phase, simulatedBeats: spanBeats, truncated }
  if (!pitchRange.length || cfg.seqLength <= 0) return result

  const seqInt = rateToBeatsFrac(cfg.seqRate)
  const keyInt = rateToBeatsFrac(cfg.keyRate)
  // integer tick times on a shared subdivision so simultaneous ticks compare exactly
  const den = (seqInt.d / gcd(seqInt.d, keyInt.d)) * keyInt.d
  const seqUnits = seqInt.n * (den / seqInt.d)
  const keyUnits = keyInt.n * (den / keyInt.d)
  const spanUnits = spanBeats * den

  const seq = makeSeqStepper(cfg, rng)
  const keyStepper = makeKeyStepper(cfg, pitchRange, rng)
  let open: SimNoteEvent | null = null // currently-sounding event
  let openHeld = false // live noNoteOffScheduled

  const minSustainBeats = (0.08 * tempo) / 60
  const sustainBeats = Math.max(cfg.sustain * fracToNumber(keyInt), minSustainBeats)

  const closeOpen = (t: number) => {
    if (open) {
      open.duration = Math.min(open.duration, Math.max(t - open.time, 0))
      open = null
      openHeld = false
    }
  }

  let seqTickNum = 0
  let keyTickNum = 0
  while (events.length < maxEvents) {
    const tSeq = seqTickNum * seqUnits
    const tKey = keyTickNum * keyUnits
    const t = Math.min(tSeq, tKey)
    if (t >= spanUnits) break
    const tBeats = t / den
    // an unheld note's scheduled off happens on its own timeout, before this tick
    if (open && !openHeld && open.time + open.duration <= tBeats) {
      open = null
    }
    const seqTicked = tSeq === t
    const keyTicked = tKey === t
    if (seqTicked) {
      seqTickNum++
      seq.tick()
    }
    if (keyTicked) {
      keyTickNum++
      keyStepper.tick()
    }
    const { currentStep, prevStep, nextStep } = seq.state()
    const { noteIdx, prevNoteIdx } = keyStepper.state()

    // ---- buffer flush (clearPlayNoteBuffer) ----
    const stepOn = cfg.seqSteps[currentStep]
    if (stepOn && noteIdx !== undefined) {
      let source: 'seq' | 'key' | null = null
      if (seqTicked && (!cfg.hold || !cfg.seqSteps[prevStep] || !open)) {
        source = 'seq'
      } else if (keyTicked && (!open || !(cfg.hold && prevNoteIdx === noteIdx))) {
        source = 'key'
      }
      if (source) {
        closeOpen(tBeats)
        const unheld = !cfg.hold || !cfg.seqSteps[nextStep]
        const ev: SimNoteEvent = {
          time: tBeats,
          duration: unheld ? sustainBeats : spanBeats - tBeats,
          pitch: noteIdx,
          step: currentStep,
          source,
        }
        events.push(ev)
        open = ev
        openHeld = !unheld
      }
    }
    // while holding, notes end when the sequence lands on an off step
    if (openHeld && !stepOn) {
      closeOpen(tBeats)
    }
  }
  closeOpen(spanBeats)
  return result
}

// ---------------------------------------------------------------------------
// event analysis

export interface HistogramBin {
  value: number // pitch (or interval) the bin counts
  count: number
}

export function pitchHistogram(events: SimNoteEvent[], fromBeats = 0, toBeats = Infinity): HistogramBin[] {
  const counts = new Map<number, number>()
  for (const e of events) {
    if (e.time >= fromBeats && e.time < toBeats) {
      counts.set(e.pitch, (counts.get(e.pitch) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([value, count]) => ({ value, count }))
}

// distribution of melodic steps (signed semitones between consecutive events)
export function intervalHistogram(events: SimNoteEvent[]): HistogramBin[] {
  const counts = new Map<number, number>()
  for (let i = 1; i < events.length; i++) {
    const delta = events[i].pitch - events[i - 1].pitch
    counts.set(delta, (counts.get(delta) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([value, count]) => ({ value, count }))
}

export interface PitchTransition {
  from: number
  to: number
  count: number
}

export function pitchTransitions(events: SimNoteEvent[]): PitchTransition[] {
  const counts = new Map<string, PitchTransition>()
  for (let i = 1; i < events.length; i++) {
    const from = events[i - 1].pitch
    const to = events[i].pitch
    const key = `${from}>${to}`
    const t = counts.get(key)
    if (t) {
      t.count++
    } else {
      counts.set(key, { from, to, count: 1 })
    }
  }
  return [...counts.values()]
}

// ---------------------------------------------------------------------------
// pitch-class set analysis

// Standard interval vector: counts of interval classes 1..6 across all pairs.
export function intervalVector(key: boolean[]): number[] {
  const pcs: number[] = []
  key.forEach((on, i) => on && pcs.push(i))
  const vector = [0, 0, 0, 0, 0, 0]
  for (let a = 0; a < pcs.length; a++) {
    for (let b = a + 1; b < pcs.length; b++) {
      const d = (pcs[b] - pcs[a]) % 12
      vector[Math.min(d, 12 - d) - 1]++
    }
  }
  return vector
}

const PC_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export function pitchClassName(pc: number): string {
  return PC_NAMES[rangeWrapper(pc)]
}

const SCALE_TEMPLATES: { name: string; steps: number[] }[] = [
  { name: 'major', steps: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'natural minor', steps: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'harmonic minor', steps: [0, 2, 3, 5, 7, 8, 11] },
  { name: 'melodic minor', steps: [0, 2, 3, 5, 7, 9, 11] },
  { name: 'dorian', steps: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'phrygian', steps: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'lydian', steps: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'mixolydian', steps: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'locrian', steps: [0, 1, 3, 5, 6, 8, 10] },
  { name: 'major pentatonic', steps: [0, 2, 4, 7, 9] },
  { name: 'minor pentatonic', steps: [0, 3, 5, 7, 10] },
  { name: 'blues', steps: [0, 3, 5, 6, 7, 10] },
  { name: 'whole tone', steps: [0, 2, 4, 6, 8, 10] },
  { name: 'diminished', steps: [0, 2, 3, 5, 6, 8, 9, 11] },
  { name: 'augmented', steps: [0, 3, 4, 7, 8, 11] },
  { name: 'chromatic', steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
]

// Every "<root> <scale name>" whose pitch-class set equals the key exactly.
export function identifyScales(key: boolean[]): string[] {
  const size = key.filter(Boolean).length
  const matches: string[] = []
  for (const { name, steps } of SCALE_TEMPLATES) {
    if (steps.length !== size) continue
    for (let root = 0; root < 12; root++) {
      if (steps.every((s) => key[rangeWrapper(root + s)])) {
        matches.push(`${pitchClassName(root)} ${name}`)
        if (name === 'chromatic' || name === 'whole tone') break // all rotations match; name it once
      }
    }
  }
  return matches
}

// ---------------------------------------------------------------------------
// swing timing (mirrors tonejs/Loop.ts, solved analytically)

// Where tick k of a swing phrase lands, in intervals from the phrase start.
// The live Loop warps x = k/length through a quadratic bezier (0,0)-(x1,y1)-(1,1)
// with x1 = 1-swingAmt and y1 = lerp(1-skew/2, skew/2, 1-swingAmt); at 0.5 swing
// is disabled and ticks sit on the straight grid.
export function swingTickPosition(k: number, swingAmt: number, swingLength: number): number {
  const x = k / swingLength
  if (swingAmt === 0.5) return x * swingLength
  const skew = swingLength === 2 ? 0 : scaleToRange(swingLength, 3, 6, 0.25, 1)
  const x1 = lerp(0, 1, 1 - swingAmt)
  const y1 = lerp(1 - skew * 0.5, skew * 0.5, 1 - swingAmt)
  // solve Bx(t) = 2t(1-t)x1 + t^2 = x for t in [0,1]
  const a = 1 - 2 * x1
  let t: number
  if (Math.abs(a) < 1e-9) {
    t = x // x1 = 0.5 -> Bx(t) = t
  } else {
    const disc = x1 * x1 + a * x
    if (disc < 0) return x * swingLength
    t = (-x1 + Math.sqrt(disc)) / a
    if (t < 0 || t > 1) t = (-x1 - Math.sqrt(disc)) / a
    if (t < 0 || t > 1) return x * swingLength
  }
  const y = 2 * t * (1 - t) * y1 + t * t
  return y * swingLength
}
