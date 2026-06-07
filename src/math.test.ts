import { describe, it, expect } from 'vitest'
import {
  rangeWrapper,
  flip,
  opposite,
  shiftWrapper,
  shift,
  shiftSeq,
  pitchesInRange,
  lerp,
  scaleToRange,
  expInterpolate,
  constrain,
} from './math'

const P = (...trueIndexes: number[]) => Array.from({ length: 12 }, (_, i) => trueIndexes.includes(i))

describe('rangeWrapper', () => {
  it('passes through values within [0, range)', () => {
    expect(rangeWrapper(0)).toBe(0)
    expect(rangeWrapper(5)).toBe(5)
    expect(rangeWrapper(11)).toBe(11)
  })
  it('wraps values >= range', () => {
    expect(rangeWrapper(12)).toBe(0)
    expect(rangeWrapper(13)).toBe(1)
  })
  it('wraps negative values into range', () => {
    expect(rangeWrapper(-1)).toBe(11)
    expect(rangeWrapper(-2)).toBe(10)
    expect(rangeWrapper(-12)).toBe(0)
  })
  it('honors a custom range', () => {
    expect(rangeWrapper(8, 7)).toBe(1)
    expect(rangeWrapper(-1, 7)).toBe(6)
  })
})

describe('opposite', () => {
  it('inverts every pitch class', () => {
    expect(opposite(P(0, 2))).toEqual(P(1, 3, 4, 5, 6, 7, 8, 9, 10, 11))
  })
  it('does not mutate the input', () => {
    const key = P(0)
    opposite(key)
    expect(key).toEqual(P(0))
  })
})

describe('shift', () => {
  it('moves each active pitch class by the amount', () => {
    expect(shift(1, P(0))).toEqual(P(1))
    expect(shift(2, P(0, 5))).toEqual(P(2, 7))
  })
  it('wraps around the octave', () => {
    expect(shift(1, P(11))).toEqual(P(0))
    expect(shift(-1, P(0))).toEqual(P(11))
  })
  it('is identity for a shift of 0', () => {
    expect(shift(0, P(3, 7))).toEqual(P(3, 7))
  })
})

describe('shiftSeq', () => {
  it('rotates the active steps to the right', () => {
    expect(shiftSeq(1, [true, false, false, false], 4)).toEqual([false, true, false, false])
    expect(shiftSeq(2, [true, false, true, false], 4)).toEqual([true, false, true, false])
  })
  it('wraps within seqLength', () => {
    expect(shiftSeq(1, [false, false, false, true], 4)).toEqual([true, false, false, false])
    expect(shiftSeq(-1, [true, false, false, false], 4)).toEqual([false, false, false, true])
  })
  it('leaves steps beyond seqLength untouched', () => {
    // only the first 2 steps are active; the trailing steps stay put
    expect(shiftSeq(1, [true, false, true, true], 2)).toEqual([false, true, true, true])
  })
  it('is identity for a shift of 0 or a full rotation', () => {
    expect(shiftSeq(0, [true, false, true], 3)).toEqual([true, false, true])
    expect(shiftSeq(3, [true, false, true], 3)).toEqual([true, false, true])
  })
})

describe('flip', () => {
  it('reflects pitch classes about the axis (axis 0: 1<->11)', () => {
    expect(flip(0, P(1))).toEqual(P(11))
    expect(flip(0, P(11))).toEqual(P(1))
  })
  it('leaves a pitch class on the axis fixed', () => {
    expect(flip(0, P(0))).toEqual(P(0))
  })
  it('does not mutate the input', () => {
    const key = P(1)
    flip(0, key)
    expect(key).toEqual(P(1))
  })
})

describe('shiftWrapper', () => {
  it('nudges 0 by direction', () => {
    expect(shiftWrapper(0, true)).toBe(1)
    expect(shiftWrapper(0, false)).toBe(-1)
  })
  it('wraps past the +/-11 bounds', () => {
    expect(shiftWrapper(12, true)).toBe(-11)
    expect(shiftWrapper(-12, true)).toBe(11)
  })
  it('passes through in-range non-zero values', () => {
    expect(shiftWrapper(5, true)).toBe(5)
    expect(shiftWrapper(-5, false)).toBe(-5)
  })
})

describe('pitchesInRange', () => {
  it('expands an active pitch class across octaves and filters to the range', () => {
    // pitch class 0 -> 0,12,24,...,84; keep those in [0,13)
    expect(pitchesInRange(0, 13, P(0))).toEqual([0, 12])
  })
  it('returns empty when no pitch classes are active', () => {
    expect(pitchesInRange(0, 96, P())).toEqual([])
  })
  it('respects an exclusive upper bound', () => {
    expect(pitchesInRange(12, 24, P(0))).toEqual([12])
  })
})

describe('lerp', () => {
  it('interpolates linearly', () => {
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 1)).toBe(10)
    expect(lerp(0, 10, 0.5)).toBe(5)
  })
})

describe('scaleToRange', () => {
  it('maps a value from one range onto another', () => {
    expect(scaleToRange(5, 0, 10, 0, 100)).toBe(50)
    expect(scaleToRange(0, 0, 10, 0, 100)).toBe(0)
    expect(scaleToRange(10, 0, 10, 0, 100)).toBe(100)
  })
})

describe('expInterpolate', () => {
  it('maps the endpoints to the endpoints', () => {
    expect(expInterpolate(0, 10, 0)).toBeCloseTo(0)
    expect(expInterpolate(0, 10, 10)).toBeCloseTo(10)
  })
  it('is non-linear between endpoints (curves below the midpoint)', () => {
    expect(expInterpolate(0, 10, 5)).toBeLessThan(5)
  })
})

describe('constrain', () => {
  it('clamps to the range', () => {
    expect(constrain(5, 0, 10)).toBe(5)
    expect(constrain(-3, 0, 10)).toBe(0)
    expect(constrain(42, 0, 10)).toBe(10)
  })
})
