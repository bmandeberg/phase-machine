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

// Rotate the active portion (the first seqLength steps) of a sequence by
// shiftAmt, wrapping within that length and leaving any steps beyond seqLength
// untouched. A positive shift moves each step later (to the right).
export function shiftSeq(shiftAmt: number, seqSteps: boolean[], seqLength: number) {
  const shifted = seqSteps.slice()
  if (seqLength <= 0) return shifted
  const n = (((shiftAmt % seqLength) + seqLength) % seqLength) || 0
  for (let i = 0; i < seqLength; i++) {
    shifted[(i + n) % seqLength] = seqSteps[i]
  }
  return shifted
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

// Maps `value` across [min, max] through a power curve of strength `strength`.
// strength > 1 packs fine resolution at the LOW end of the range; strength < 1
// packs it at the HIGH end. `invert` applies the reciprocal exponent — used to go
// the opposite direction (value↔knob-position), so a forward + inverted call round
// trips. Default strength e keeps the historical logarithmic knob behavior.
export function expInterpolate(min: number, max: number, value: number, invert = false, strength = Math.E) {
  const exp = invert ? 1 / strength : strength
  return (max - min) * Math.pow((value - min) / (max - min), exp) + min
}

export function constrain(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

// Convert a rate to seconds at the given tempo, assuming 4/4. Handles Tone-style note
// notation (e.g. '4n', '8n.', '8t', '1m') and clock divisions relative to the beat
// (quarter note): '/N' divides the beat (N times slower) and '*N' multiplies it (N times
// faster), so '*1' == '4n'. Pure equivalent of Tone.Transport.toSeconds for note values
// that depends on `bpm` directly (not the live Transport), so values can be recomputed
// deterministically when global tempo changes. See RATES / CLOCK_RATES.
export function rateToSeconds(rate: string, bpm: number) {
  const quarterNote = 60 / bpm
  // clock divisions/multiplications, relative to the beat
  if (rate[0] === '/') return quarterNote * parseInt(rate.slice(1), 10)
  if (rate[0] === '*') return quarterNote / parseInt(rate.slice(1), 10)
  // beats are in quarter-note units. Measures ('Nm') are N * 4 beats in 4/4 ('1m' = 4,
  // '2m' = 8, '4m' = 16); note values ('Nn') are 4 / N beats ('1n' = 4, '4n' = 1, '8n' = 0.5).
  let beats = rate.endsWith('m') ? parseInt(rate, 10) * 4 : 4 / parseInt(rate, 10)
  if (rate.endsWith('t')) {
    beats *= 2 / 3 // triplet
  } else if (rate.endsWith('.')) {
    beats *= 1.5 // dotted
  }
  return beats * quarterNote
}

// Inverse of rateToSeconds: pick the note-rate from `rates` whose interval is
// closest to `seconds` at the given tempo. Used to upgrade legacy synced-delay
// presets that stored sync as a boolean `true` — the actual rate has to be
// recovered from the baked-in delayTime (in seconds at the preset's tempo).
export function secondsToRate(seconds: number, bpm: number, rates: string[]) {
  let best = rates[0]
  let bestErr = Infinity
  for (const rate of rates) {
    const err = Math.abs(rateToSeconds(rate, bpm) - seconds)
    if (err < bestErr) {
      bestErr = err
      best = rate
    }
  }
  return best
}
