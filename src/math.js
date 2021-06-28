import { BLANK_PITCH_CLASSES, OCTAVES } from './globals'

export function rangeWrapper(n, range = 12) {
  return n < 0 ? range - 1 + ((n + 1) % range) : n % range
}

export function flip(axis, key) {
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

export function opposite(key) {
  const keyCopy = key.slice()
  key.forEach((pitchClass, i) => {
    keyCopy[i] = !pitchClass
  })
  return keyCopy
}

export function shiftWrapper(n, shiftDirectionForward) {
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

export function shift(shiftAmt, key) {
  const shiftedPitchClasses = BLANK_PITCH_CLASSES()
  for (let i = 0; i < key.length; i++) {
    if (key[i]) {
      const shiftedIndex = rangeWrapper(i + shiftAmt)
      shiftedPitchClasses[shiftedIndex] = true
    }
  }
  return shiftedPitchClasses
}

export function pitchesInRange(rangeStart, rangeEnd, key) {
  const pitchIndexes = []
  key.forEach((pitchClass, i) => {
    if (pitchClass) {
      pitchIndexes.push(i)
    }
  })
  const allPitches = []
  for (let i = 0; i < OCTAVES; i++) {
    allPitches.push(...pitchIndexes.map((pi) => pi + 12 * i))
  }
  return allPitches.filter((pitch) => pitch >= rangeStart && pitch < rangeEnd)
}

export function lerp(n1, n2, t) {
  return n1 + (n2 - n1) * t
}

export function scaleToRange(num, inMin, inMax, outMin, outMax) {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

export function expInterpolate(min, max, value, invert = false) {
  const exp = invert ? 1/Math.E : Math.E
  return (max - min) * Math.pow((value - min) / (max - min), exp) + min
}

export function constrain(n, min, max) {
  return Math.min(Math.max(n, min), max)
}
