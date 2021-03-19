import { BLANK_PITCH_CLASSES } from './globals'

export function pitchClassWrapper(n) {
  return n < 0 ? 11 + ((n + 1) % 12) : n % 12
}

export function flip(axis, key) {
  const dedupAxis = (axis / 2) % 6
  const keyCopy = key.slice()
  key.forEach((pitchClass, i) => {
    if (i % 6 !== dedupAxis) {
      const flippedIndex = pitchClassWrapper(dedupAxis - (i - dedupAxis))
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
      const shiftedIndex = pitchClassWrapper(i + shiftAmt)
      shiftedPitchClasses[shiftedIndex] = true
    }
  }
  return shiftedPitchClasses
}

export function lerp(n1, n2, t) {
  return n1 + (n2 - n1) * t
}

export function scaleToRange(num, inMin, inMax, outMin, outMax) {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}
