import { describe, it, expect } from 'vitest'
import { noteString, convertMidiNumber, handleArpMode, migrateEffectSlots, BLANK_EFFECT_SLOT } from './globals'

describe('noteString', () => {
  it('returns null for null/undefined', () => {
    expect(noteString(null)).toBeNull()
    expect(noteString(undefined)).toBeNull()
  })
  it('treats 0 as a real note (not null)', () => {
    expect(noteString(0)).toBe('C1')
  })
  it('names notes with octave', () => {
    expect(noteString(11)).toBe('B1')
    expect(noteString(12)).toBe('C2')
    expect(noteString(13)).toBe('Db2')
    expect(noteString(36)).toBe('C4') // MIDDLE_C
  })
})

describe('convertMidiNumber', () => {
  it('offsets by -24 (internal index -> MIDI)', () => {
    expect(convertMidiNumber(24)).toBe(0)
    expect(convertMidiNumber(60)).toBe(36)
  })
})

describe('handleArpMode', () => {
  it('up: advances and wraps to 0 at the end; undefined starts at 0', () => {
    expect(handleArpMode('up', 4, undefined, null)).toBe(0)
    expect(handleArpMode('up', 4, 0, null)).toBe(1)
    expect(handleArpMode('up', 4, 2, null)).toBe(3)
    expect(handleArpMode('up', 4, 3, null)).toBe(0)
  })
  it('down: retreats and wraps to top; undefined starts at length-1', () => {
    expect(handleArpMode('down', 4, undefined, null)).toBe(3)
    expect(handleArpMode('down', 4, 3, null)).toBe(2)
    expect(handleArpMode('down', 4, 0, null)).toBe(3)
  })
  it('up/down: bounces at the boundaries via the util flag', () => {
    const ascending = { current: false }
    expect(handleArpMode('up/down', 4, 0, ascending)).toBe(1)
    const atTop = { current: false }
    // at the top boundary it flips to descending, then steps back down
    expect(handleArpMode('up/down', 4, 3, atTop)).toBe(2)
    expect(atTop.current).toBe(true)
  })
})

describe('migrateEffectSlots', () => {
  it('migrates a legacy single effect into slot 0, slots 1-2 blank', () => {
    const slots = migrateEffectSlots({
      effectType: 'delay',
      effectWet: 0.4,
      delayTime: 0.3,
      delayFeedback: 0.7,
      syncDelayTime: '8n.',
    })
    expect(slots).toHaveLength(3)
    expect(slots[0].type).toBe('delay')
    expect(slots[0].wet).toBe(0.4)
    expect(slots[0].delayTime).toBe(0.3)
    expect(slots[0].delayFeedback).toBe(0.7)
    expect(slots[0].syncDelayTime).toBe('8n.')
    // unspecified legacy params fall back to blank defaults
    expect(slots[0].reverbDecay).toBe(BLANK_EFFECT_SLOT().reverbDecay)
    expect(slots[1].type).toBe('none')
    expect(slots[2].type).toBe('none')
  })

  it('defaults to all-none when there is no effects and no legacy effectType', () => {
    const slots = migrateEffectSlots({ gain: 1 })
    expect(slots.map((s) => s.type)).toEqual(['none', 'none', 'none'])
  })

  it('normalizes an existing effects array to 3 slots, backfilling missing keys', () => {
    const slots = migrateEffectSlots({ effects: [{ type: 'phaser', wet: 0.5 }] })
    expect(slots).toHaveLength(3)
    expect(slots[0].type).toBe('phaser')
    expect(slots[0].wet).toBe(0.5)
    // a partial slot gets every other param from the blank default
    expect(slots[0].phaserFreq).toBe(BLANK_EFFECT_SLOT().phaserFreq)
    expect(slots[1].type).toBe('none')
    expect(slots[2].type).toBe('none')
  })

  it('preserves three already-populated slots', () => {
    const slots = migrateEffectSlots({
      effects: [
        { ...BLANK_EFFECT_SLOT(), type: 'distortion', distortion: 2 },
        { ...BLANK_EFFECT_SLOT(), type: 'reverb', reverbDecay: 3 },
        { ...BLANK_EFFECT_SLOT(), type: 'eq', eqMidGain: 6 },
      ],
    })
    expect(slots.map((s) => s.type)).toEqual(['distortion', 'reverb', 'eq'])
    expect(slots[0].distortion).toBe(2)
    expect(slots[1].reverbDecay).toBe(3)
    expect(slots[2].eqMidGain).toBe(6)
  })

  it('returns fresh objects (no shared references across calls)', () => {
    const a = migrateEffectSlots({ gain: 1 })
    const b = migrateEffectSlots({ gain: 1 })
    expect(a[0]).not.toBe(b[0])
    a[0].wet = 0.123
    expect(b[0].wet).toBe(1)
  })
})
