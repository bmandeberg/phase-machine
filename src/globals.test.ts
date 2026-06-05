import { describe, it, expect } from 'vitest'
import { noteString, convertMidiNumber, handleArpMode } from './globals'

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
