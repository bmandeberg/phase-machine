export const VIEWS = ['stacked', 'horizontal', 'grid']

export const SECTIONS = ['key', 'piano roll', 'pitch set', 'sequencer']

export const KNOB_MAX = 127

export const MAX_CHANNELS = 4

export const BLANK_PITCH_CLASSES = () => [false, false, false, false, false, false, false, false, false, false, false, false]

export const RANDOM_PITCH_CLASSES = () => [...Array(12)].map(() => Math.random() > 0.5)

export const whiteKey = (i) => {
  i = i % 12
  if (i <= 4) {
    return i % 2 === 0
  } else {
    return i % 2 !== 0
  }
}

export const MIDDLE_C = 36

export const OCTAVES = 8