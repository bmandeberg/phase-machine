import { BLANK_PITCH_CLASSES, OCTAVES } from './globals'

export function rangeWrapper(n: number, range = 12) {
  return n < 0 ? range - 1 + ((n + 1) % range) : n % range
}

export function flip(axis: number, key: boolean[]) {
  const dedupAxis = (axis / 2) % 6
  const keyCopy = key.slice()
  key.forEach((pitchClass, i) => {
    if (i % 6 !== dedupAxis) {
      const flippedIndex = rangeWrapper(dedupAxis - (i - dedupAxis))
      keyCopy[flippedIndex] = pitchClass
    }
  })
  return keyCopy
}

export function opposite(key: boolean[]) {
  const keyCopy = key.slice()
  key.forEach((pitchClass, i) => {
    keyCopy[i] = !pitchClass
  })
  return keyCopy
}

export function shiftWrapper(n: number, shiftDirectionForward: boolean) {
  if (n < -11) {
    n = 11
  } else if (n > 11) {
    n = -11
  } else if (n === 0) {
    n += shiftDirectionForward ? 1 : -1
  } else {
    n %= 12
  }
  return n
}

export function shift(shiftAmt: number, key: boolean[]) {
  const shiftedPitchClasses = BLANK_PITCH_CLASSES()
  for (let i = 0; i < key.length; i++) {
    if (key[i]) {
      const shiftedIndex = rangeWrapper(i + shiftAmt)
      shiftedPitchClasses[shiftedIndex] = true
    }
  }
  return shiftedPitchClasses
}

export function pitchesInRange(rangeStart: number, rangeEnd: number, key: boolean[]) {
  const pitchIndexes: number[] = []
  key.forEach((pitchClass, i) => {
    if (pitchClass) {
      pitchIndexes.push(i)
    }
  })
  const allPitches: number[] = []
  for (let i = 0; i < OCTAVES; i++) {
    allPitches.push(...pitchIndexes.map((pi) => pi + 12 * i))
  }
  return allPitches.filter((pitch) => pitch >= rangeStart && pitch < rangeEnd)
}

export function lerp(n1: number, n2: number, t: number) {
  return n1 + (n2 - n1) * t
}

export function scaleToRange(num: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

export function expInterpolate(min: number, max: number, value: number, invert = false) {
  const exp = invert ? 1 / Math.E : Math.E
  return (max - min) * Math.pow((value - min) / (max - min), exp) + min
}

export function constrain(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

// Convert a Tone-style rate notation (e.g. '4n', '8n.', '8t', '1m') to seconds at
// the given tempo, assuming 4/4. Pure equivalent of Tone.Transport.toSeconds(rate)
// that depends on `bpm` directly (not the live Transport), so tempo-synced values
// can be recomputed deterministically when global tempo changes. See RATES.
export function rateToSeconds(rate: string, bpm: number) {
  const quarterNote = 60 / bpm
  // beats are in quarter-note units: '1m'/'1n' = 4, '2n' = 2, '4n' = 1, '8n' = 0.5, ...
  let beats = rate === '1m' ? 4 : 4 / parseInt(rate, 10)
  if (rate.endsWith('t')) {
    beats *= 2 / 3 // triplet
  } else if (rate.endsWith('.')) {
    beats *= 1.5 // dotted
  }
  return beats * quarterNote
}
