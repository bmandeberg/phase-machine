// Compact text encoding for presets — used by the ?preset= share links, the
// Settings export/import blobs, and the factory presets in defaultPresets.ts.
//
// Format: JSON → deflate-raw (native CompressionStream) → URL-safe base64
// (-_ alphabet, no padding), so an encoded preset drops from ~5–45KB of JSON
// to ~1.5–5KB and can live in a query string. Node's zlib.deflateRawSync
// produces the same byte stream, which is how defaultPresets.ts is generated.
//
// This module is deliberately dependency-free: it runs in the pre-mount boot
// gate (see presetBoot.ts) before the main app chunk loads.

async function pumpThrough(
  stream: CompressionStream | DecompressionStream,
  input: Uint8Array<ArrayBuffer>
): Promise<Uint8Array> {
  const writer = stream.writable.getWriter()
  // failures (e.g. corrupt data in a tampered share link) surface through the
  // readable side below — swallow the writer-side copies of the same rejection
  // so they don't hit the console as unhandled
  writer.write(input).catch(() => {})
  writer.close().catch(() => {})
  return new Uint8Array(await new Response(stream.readable).arrayBuffer())
}

function bytesToBase64Url(bytes: Uint8Array): string {
  // build the binary string in chunks — String.fromCharCode(...bytes) blows the
  // argument limit on large presets
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(encoded: string): Uint8Array<ArrayBuffer> {
  // accept both the -_ URL alphabet and standard +/ base64 (with or without padding)
  const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function encodePreset(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  return bytesToBase64Url(await pumpThrough(new CompressionStream('deflate-raw'), bytes))
}

export async function decodePresetText(encoded: string): Promise<string> {
  const decompressed = await pumpThrough(new DecompressionStream('deflate-raw'), base64UrlToBytes(encoded.trim()))
  return new TextDecoder().decode(decompressed)
}

export async function decodePreset(encoded: string): Promise<unknown> {
  return JSON.parse(await decodePresetText(encoded))
}

// The import path's single entry point: accepts the compressed base64 format or
// raw preset JSON (legacy exports), so the wire-format rule lives with the codec.
export async function parsePresetText(text: string): Promise<unknown> {
  const trimmed = text.trim()
  // raw JSON starts with [ or { — characters base64 never contains
  return trimmed.startsWith('[') || trimmed.startsWith('{') ? JSON.parse(trimmed) : decodePreset(trimmed)
}
