import { describe, it, expect } from 'vitest'
import { deflateRawSync } from 'node:zlib'
import { encodePreset, decodePreset, decodePresetText, parsePresetText } from './presetCode'
import { DEFAULT_PRESETS_COMPRESSED } from './defaultPresets'

// jsdom doesn't implement the Compression Streams API — borrow Node's (same spec)
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompressionStream as NodeCS, DecompressionStream as NodeDS } from 'node:stream/web'
if (typeof globalThis.CompressionStream === 'undefined') {
  ;(globalThis as any).CompressionStream = NodeCS
}
if (typeof globalThis.DecompressionStream === 'undefined') {
  ;(globalThis as any).DecompressionStream = NodeDS
}
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('presetCode', () => {
  it('round-trips a preset-shaped object, including non-Latin1 text', async () => {
    const preset = {
      name: '🫧 Leola’s chimes',
      tempo: 120,
      channels: [{ key: [true, false], seqSteps: Array(16).fill(true), instrumentParams: { gain: 0.5 } }],
    }
    const encoded = await encodePreset(preset)
    // URL-safe: no +, /, or = that would need escaping in a query string
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(await decodePreset(encoded)).toEqual(preset)
  })

  it('compresses (encoded text is much smaller than the JSON)', async () => {
    const big = { channels: Array(8).fill({ seqSteps: Array(32).fill(false), name: 'channel' }) }
    const encoded = await encodePreset(big)
    expect(encoded.length).toBeLessThan(JSON.stringify(big).length / 2)
  })

  it('accepts standard base64 (+ / and padding) as produced by Node Buffer.toString', async () => {
    const json = JSON.stringify({ some: 'preset', emoji: '👽👽👽👽👽👽' })
    const standardB64 = deflateRawSync(Buffer.from(json, 'utf8')).toString('base64')
    expect(await decodePresetText(standardB64)).toBe(json)
  })

  it('parsePresetText accepts both legacy raw JSON and the compressed format', async () => {
    const value = [{ name: 'legacy preset', channels: [] }]
    expect(await parsePresetText(JSON.stringify(value))).toEqual(value)
    expect(await parsePresetText('  ' + JSON.stringify(value) + '\n')).toEqual(value)
    expect(await parsePresetText(await encodePreset(value))).toEqual(value)
  })

  it('decodes the factory presets blob into the 14 default presets', async () => {
    const presets = (await decodePreset(DEFAULT_PRESETS_COMPRESSED)) as Array<{
      name: string
      id: string
      channels: unknown[]
    }>
    expect(Array.isArray(presets)).toBe(true)
    expect(presets).toHaveLength(14)
    for (const preset of presets) {
      expect(typeof preset.name).toBe('string')
      expect(typeof preset.id).toBe('string')
      expect(Array.isArray(preset.channels)).toBe(true)
    }
  })
})
