export const VIEWS = ['stacked', 'horizontal', 'grid']

export const SECTIONS = ['key', 'piano roll', 'pitch set', 'sequencer']

export const KNOB_MAX = 1023

export const MAX_CHANNELS = 4

export const BLANK_PITCH_CLASSES = () => [false, false, false, false, false, false, false, false, false, false, false, false]

export const RANDOM_PITCH_CLASSES = () => [...Array(12)].map(() => Math.random() > 0.5)