import { describe, it, expect } from 'vitest'
import {
  gcd,
  rateToBeatsFrac,
  fracToNumber,
  lcmFrac,
  seqCycleTicks,
  keyCycleTicks,
  phaseInfo,
  simulateChannel,
  pitchHistogram,
  intervalHistogram,
  pitchTransitions,
  intervalVector,
  identifyScales,
  swingTickPosition,
  VizChannelConfig,
} from './visualization'
import { rateToSeconds } from './math'
import { RATES } from './globals'

const P = (...trueIndexes: number[]) => Array.from({ length: 12 }, (_, i) => trueIndexes.includes(i))

// a baseline config: C-E-G key over one octave, 4 of 8 steps on, everything 'up'
function baseConfig(overrides: Partial<VizChannelConfig> = {}): VizChannelConfig {
  return {
    key: P(0, 4, 7),
    keyRate: '4n',
    keyMovement: 'up',
    keyArpInc1: 2,
    keyArpInc2: -1,
    sustain: 0.5,
    rangeMode: true,
    rangeStart: 36,
    rangeEnd: 48,
    keybdPitches: [],
    seqSteps: [true, false, true, false, true, false, true, false, ...Array(56).fill(false)],
    seqLength: 8,
    seqRate: '4n',
    seqMovement: 'up',
    seqArpInc1: 2,
    seqArpInc2: -1,
    hold: false,
    ...overrides,
  }
}

describe('rateToBeatsFrac', () => {
  it('agrees with rateToSeconds across every rate', () => {
    for (const rate of RATES) {
      const frac = rateToBeatsFrac(rate)
      // at 60 bpm one beat is one second
      expect(fracToNumber(frac)).toBeCloseTo(rateToSeconds(rate, 60), 10)
    }
    expect(fracToNumber(rateToBeatsFrac('/3'))).toBeCloseTo(rateToSeconds('/3', 60), 10)
    expect(fracToNumber(rateToBeatsFrac('*4'))).toBeCloseTo(rateToSeconds('*4', 60), 10)
  })
  it('keeps triplets exact', () => {
    expect(rateToBeatsFrac('8t')).toEqual({ n: 1, d: 3 })
    expect(rateToBeatsFrac('4n.')).toEqual({ n: 3, d: 2 })
  })
})

describe('lcmFrac', () => {
  it('computes the least common multiple of fractions', () => {
    // 3/2 and 1/3 -> 3
    expect(fracToNumber(lcmFrac({ n: 3, d: 2 }, { n: 1, d: 3 }))).toBe(3)
    expect(fracToNumber(lcmFrac({ n: 4, d: 1 }, { n: 6, d: 1 }))).toBe(12)
  })
  it('gcd handles zero', () => {
    expect(gcd(0, 5)).toBe(5)
    expect(gcd(12, 8)).toBe(4)
  })
})

describe('cycle detection', () => {
  it('up and down cycle over the full length', () => {
    expect(seqCycleTicks(baseConfig())).toBe(8)
    expect(seqCycleTicks(baseConfig({ seqMovement: 'down' }))).toBe(8)
  })
  it('up/down cycles over 2(n-1)', () => {
    expect(seqCycleTicks(baseConfig({ seqMovement: 'up/down' }))).toBe(14)
  })
  it('+/- alternating +2/-1 walks every step in 2n ticks', () => {
    expect(seqCycleTicks(baseConfig({ seqMovement: '+/-', seqArpInc1: 2, seqArpInc2: -1 }))).toBe(16)
  })
  it('random has no cycle', () => {
    expect(seqCycleTicks(baseConfig({ seqMovement: 'random' }))).toBeNull()
  })
  it('key cycle covers the pitches in range', () => {
    const cfg = baseConfig() // C E G across one octave -> 3 pitches
    expect(keyCycleTicks(cfg, [36, 40, 43])).toBe(3)
  })
})

describe('phaseInfo', () => {
  it('computes the polymetric phase as an LCM of the two cycles', () => {
    // seq: 8 steps at 4n = 8 beats; key: 3 pitches at 4n = 3 beats; phase = 24 beats
    const info = phaseInfo(baseConfig())
    expect(info.seqCycleBeats).toBe(8)
    expect(info.keyCycleBeats).toBe(3)
    expect(info.phaseBeats).toBe(24)
    expect(info.seqCyclesPerPhase).toBe(3)
    expect(info.keyCyclesPerPhase).toBe(8)
  })
  it('handles triplet rates exactly', () => {
    // seq: 8 steps at 8t = 8/3 beats; key: 3 pitches at 4n = 3 beats; lcm(8/3, 3) = 24
    const info = phaseInfo(baseConfig({ seqRate: '8t' }))
    expect(info.phaseBeats).toBe(24)
  })
  it('is non-deterministic when a movement is random', () => {
    const info = phaseInfo(baseConfig({ keyMovement: 'random' }))
    expect(info.deterministic).toBe(false)
    expect(info.phaseBeats).toBeNull()
  })
})

describe('simulateChannel', () => {
  it('plays the arpeggiated pitches on the on-steps', () => {
    const { events, phase, simulatedBeats } = simulateChannel(baseConfig())
    expect(simulatedBeats).toBe(24)
    // same rate, steps 0,2,4,6 on of 8 -> one event per 2 beats over 24 beats
    expect(events.length).toBe(12)
    // both loops tick together; on-step events come from the seq tick
    expect(events.every((e) => e.source === 'seq')).toBe(true)
    // key arps C-E-G (36,40,43) every beat, but only even beats sound: 36,43,40,36...
    expect(events.slice(0, 3).map((e) => e.pitch)).toEqual([36, 43, 40])
    expect(events.map((e) => e.step)).toEqual([0, 2, 4, 6, 0, 2, 4, 6, 0, 2, 4, 6])
  })
  it('fires between steps when the key loop runs faster', () => {
    // key at 8n over 2 pitches: seq tick plays, then the key retrigger half a beat later
    const cfg = baseConfig({ keyRate: '8n', key: P(0, 4), rangeEnd: 41 })
    const { events } = simulateChannel(cfg)
    const atHalfBeat = events.filter((e) => e.time % 1 === 0.5)
    expect(atHalfBeat.length).toBeGreaterThan(0)
    expect(atHalfBeat.every((e) => e.source === 'key')).toBe(true)
  })
  it('hold sustains through consecutive on-steps and repeated pitches', () => {
    const cfg = baseConfig({
      hold: true,
      seqSteps: [true, true, true, false, false, false, false, false, ...Array(56).fill(false)],
      key: P(0),
      rangeEnd: 37, // single pitch: nothing retriggers while held
    })
    const { events } = simulateChannel(cfg)
    // one note per pass of steps 0-2, held for 3 beats (off lands on step 3's tick)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].time).toBe(0)
    expect(events[0].duration).toBe(3)
  })
  it('unheld notes last sustain * key interval', () => {
    const { events } = simulateChannel(baseConfig({ sustain: 0.5 }))
    expect(events[0].duration).toBeCloseTo(0.5, 10)
  })
  it('returns no events for an empty key', () => {
    const { events } = simulateChannel(baseConfig({ key: P() }))
    expect(events).toEqual([])
  })
  it('random movements are repeatable for a given seed and bounded', () => {
    const cfg = baseConfig({ keyMovement: 'random' })
    const a = simulateChannel(cfg, { seed: 7 })
    const b = simulateChannel(cfg, { seed: 7 })
    expect(a.events).toEqual(b.events)
    expect(a.phase.deterministic).toBe(false)
    expect(a.simulatedBeats).toBeLessThanOrEqual(128)
  })
  it('truncates phases longer than the cap', () => {
    // seq: 7 steps at 2m = 56 beats; key: 3 pitches at 4n. = 4.5 beats; lcm = 504 beats
    const cfg = baseConfig({ seqRate: '2m', seqLength: 7 })
    expect(phaseInfo({ ...cfg, keyRate: '4n.' }).phaseBeats).toBe(504)
    const result = simulateChannel({ ...cfg, keyRate: '4n.' }, { maxBeats: 64 })
    expect(result.truncated).toBe(true)
    expect(result.simulatedBeats).toBe(64)
  })
})

describe('analysis', () => {
  it('pitch histogram counts events in a window', () => {
    const { events } = simulateChannel(baseConfig())
    const all = pitchHistogram(events)
    expect(all.reduce((sum, b) => sum + b.count, 0)).toBe(events.length)
    const firstCycle = pitchHistogram(events, 0, 8)
    expect(firstCycle.reduce((sum, b) => sum + b.count, 0)).toBe(4)
  })
  it('interval histogram tracks melodic deltas', () => {
    const { events } = simulateChannel(baseConfig())
    const bins = intervalHistogram(events)
    expect(bins.reduce((sum, b) => sum + b.count, 0)).toBe(events.length - 1)
  })
  it('transitions count from->to pairs', () => {
    const { events } = simulateChannel(baseConfig())
    const transitions = pitchTransitions(events)
    expect(transitions.reduce((sum, t) => sum + t.count, 0)).toBe(events.length - 1)
  })
})

describe('pitch-class set analysis', () => {
  it('computes the major-scale interval vector', () => {
    expect(intervalVector(P(0, 2, 4, 5, 7, 9, 11))).toEqual([2, 5, 4, 3, 6, 1])
  })
  it('computes a triad interval vector', () => {
    expect(intervalVector(P(0, 4, 7))).toEqual([0, 0, 1, 1, 1, 0])
  })
  it('identifies scales including enharmonic families', () => {
    const matches = identifyScales(P(0, 2, 4, 5, 7, 9, 11))
    expect(matches).toContain('C major')
    expect(matches).toContain('A natural minor')
    expect(matches).toContain('D dorian')
  })
  it('identifies whole tone once', () => {
    const matches = identifyScales(P(0, 2, 4, 6, 8, 10))
    expect(matches).toEqual(['C whole tone'])
  })
  it('returns nothing for unnamed sets', () => {
    expect(identifyScales(P(0, 1))).toEqual([])
  })
})

describe('swingTickPosition', () => {
  it('is the straight grid at half swing', () => {
    expect(swingTickPosition(0, 0.5, 2)).toBe(0)
    expect(swingTickPosition(1, 0.5, 2)).toBe(1)
  })
  it('pushes the offbeat late for swing > 0.5', () => {
    expect(swingTickPosition(1, 0.75, 2)).toBeGreaterThan(1)
    expect(swingTickPosition(0, 0.75, 2)).toBe(0)
  })
  it('pulls the offbeat early for swing < 0.5', () => {
    expect(swingTickPosition(1, 0.25, 2)).toBeLessThan(1)
  })
  it('stays within the phrase', () => {
    for (const amt of [0.1, 0.3, 0.62, 0.9]) {
      for (const len of [2, 3, 4, 5, 6]) {
        for (let k = 0; k < len; k++) {
          const pos = swingTickPosition(k, amt, len)
          expect(pos).toBeGreaterThanOrEqual(0)
          expect(pos).toBeLessThan(len)
        }
      }
    }
  })
})
