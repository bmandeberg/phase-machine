// Preset schema helpers: migration (patch*) and validation for preset objects
// from every untrusted or versioned source — localStorage, imported files, and
// ?preset= share links. A pure leaf module (imports globals/types only, like
// math.ts) so both the pre-mount boot gate (presetBoot.ts) and the app
// (App.tsx, usePresets) can use the same patch-then-validate flow.

import { DEFAULT_PRESET, migrateEffectSlots, ALL_MIDI_CHANNELS } from './globals'
import { Channel as ChannelType, Preset } from './types'

// The patch* helpers backfill missing fields on presets/channels loaded from
// localStorage or imported files (schema migration). The objects are partially
// formed, so they're walked generically via a loose indexable view.
export function patchPreset(preset: Preset, updated?: boolean) {
  const p = preset as unknown as Record<string, unknown>
  const defaults = DEFAULT_PRESET as unknown as Record<string, unknown>
  for (const prop in DEFAULT_PRESET) {
    if (p[prop] === undefined) {
      p[prop] = defaults[prop]
      updated = true
    }
  }
  return updated
}

export function patchChannel(channel: ChannelType, tempo?: number, updated?: boolean) {
  const defaultChannel = DEFAULT_PRESET.channels[0]
  const c = channel as unknown as Record<string, unknown>
  // Migrate the retired orange channel color to baby pink so orange is reserved for the
  // "playing" indicator (channel/instrument selected/on now uses the channel color).
  if (c.color === '#ff9700') {
    c.color = '#ff85de'
    updated = true
  }
  // Migrate the retired output tri-state (midiOutAll / customMidiOutChannel /
  // midiOutChannel) to the explicit midiOutChannels set — the old default becomes
  // a stored [channelNum + 1]. Must run BEFORE the generic fill below, both so old
  // presets keep their routing and so no default array is aliased across channels.
  if (c.midiOutChannels === undefined) {
    c.midiOutChannels =
      c.midiOutAll === true
        ? ALL_MIDI_CHANNELS.slice()
        : c.customMidiOutChannel === true && typeof c.midiOutChannel === 'number'
        ? [c.midiOutChannel]
        : [channel.channelNum + 1]
    delete c.midiOutAll
    delete c.customMidiOutChannel
    delete c.midiOutChannel
    updated = true
  }
  const cParams = channel.instrumentParams as unknown as Record<string, unknown>
  const dc = defaultChannel as unknown as Record<string, unknown>
  const dcParams = defaultChannel.instrumentParams as unknown as Record<string, unknown>
  for (const prop in defaultChannel) {
    if (c[prop] === undefined) {
      c[prop] = dc[prop]
      updated = true
    }
  }
  // 3-slot effects: migrate legacy single-effect presets into slot 0 / normalize.
  // Flag a change only when there was no `effects` yet (avoids spurious re-saves on
  // every load). NB: must run BEFORE the generic instrumentParams fill, and that
  // loop must SKIP `effects` so it never aliases DEFAULT_PRESET's slot array onto
  // every channel (migrateEffectSlots always returns fresh per-channel objects).
  if (cParams.effects === undefined) {
    updated = true
  }
  cParams.effects = migrateEffectSlots(cParams, tempo)
  for (const prop in defaultChannel.instrumentParams) {
    if (prop === 'effects') continue
    if (cParams[prop] === undefined) {
      cParams[prop] = dcParams[prop]
      updated = true
    }
  }
  return updated
}

export function patchPresetAndChannels(preset: Preset, updated?: boolean) {
  updated = patchPreset(preset, updated)
  preset.channels.forEach((channel) => {
    updated = patchChannel(channel, preset.tempo, updated)
  })
  return updated
}

// Validates arbitrary parsed JSON (imported files, ?preset= share links), so the
// shapes are genuinely untrusted/unknown here — `any` is the pragmatic choice.
// Run patchPresetAndChannels first: legacy fields are migrated into the shapes
// checked here before validation runs.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function validPreset(preset: any) {
  function invalidProp(obj: any, prop: string, type: string) {
    const typeCheck = typeof obj[prop] !== type
    return !obj.hasOwnProperty(prop) || (type === 'number' ? typeCheck && obj[prop] !== null : typeCheck)
  }
  if (
    invalidProp(preset, 'name', 'string') ||
    invalidProp(preset, 'id', 'string') ||
    invalidProp(preset, 'hotkey', 'number') ||
    invalidProp(preset, 'placeholder', 'boolean') ||
    invalidProp(preset, 'numChannels', 'number') ||
    invalidProp(preset, 'channelSync', 'boolean') ||
    invalidProp(preset, 'tempo', 'number') ||
    invalidProp(preset, 'channels', 'object')
  ) {
    return false
  }
  for (let i = 0; i < preset.channels.length; i++) {
    const channel = preset.channels[i]
    if (
      invalidProp(channel, 'id', 'string') ||
      invalidProp(channel, 'color', 'string') ||
      invalidProp(channel, 'channelNum', 'number') ||
      invalidProp(channel, 'velocity', 'number') ||
      invalidProp(channel, 'key', 'object') ||
      channel.key.length !== 12 ||
      invalidProp(channel, 'keyRate', 'string') ||
      invalidProp(channel, 'keyMovement', 'string') ||
      invalidProp(channel, 'keyArpInc1', 'number') ||
      invalidProp(channel, 'keyArpInc2', 'number') ||
      invalidProp(channel, 'sustain', 'number') ||
      invalidProp(channel, 'keySwing', 'number') ||
      invalidProp(channel, 'keySwingLength', 'number') ||
      invalidProp(channel, 'mute', 'boolean') ||
      invalidProp(channel, 'solo', 'boolean') ||
      invalidProp(channel, 'shiftAmt', 'number') ||
      invalidProp(channel, 'axis', 'number') ||
      invalidProp(channel, 'rangeStart', 'number') ||
      invalidProp(channel, 'rangeEnd', 'number') ||
      invalidProp(channel, 'seqSteps', 'object') ||
      invalidProp(channel, 'seqLength', 'number') ||
      invalidProp(channel, 'seqShiftAmt', 'number') ||
      invalidProp(channel, 'seqRate', 'string') ||
      invalidProp(channel, 'seqMovement', 'string') ||
      invalidProp(channel, 'seqArpInc1', 'number') ||
      invalidProp(channel, 'seqArpInc2', 'number') ||
      invalidProp(channel, 'seqSwing', 'number') ||
      invalidProp(channel, 'seqSwingLength', 'number') ||
      invalidProp(channel, 'hold', 'boolean') ||
      invalidProp(channel, 'instrumentOn', 'boolean') ||
      invalidProp(channel, 'instrumentType', 'string') ||
      invalidProp(channel, 'rangeMode', 'boolean') ||
      invalidProp(channel, 'fifthsClock', 'boolean') ||
      invalidProp(channel, 'keybdPitches', 'object') ||
      invalidProp(channel, 'midiIn', 'boolean') ||
      invalidProp(channel, 'midiHold', 'boolean') ||
      invalidProp(channel, 'customMidiInChannel', 'boolean') ||
      invalidProp(channel, 'midiInChannel', 'number') ||
      // legacy midiOutAll/customMidiOutChannel/midiOutChannel presets are migrated
      // into this set by patchPresetAndChannels before validation runs
      invalidProp(channel, 'midiOutChannels', 'object')
    ) {
      return false
    }
    if (
      invalidProp(channel.instrumentParams, 'gain', 'number') ||
      invalidProp(channel.instrumentParams, 'pan', 'number') ||
      invalidProp(channel.instrumentParams, 'poly', 'boolean') ||
      invalidProp(channel.instrumentParams, 'portamento', 'number') ||
      invalidProp(channel.instrumentParams, 'modulationType', 'string') ||
      invalidProp(channel.instrumentParams, 'harmonicity', 'number') ||
      invalidProp(channel.instrumentParams, 'fatSpread', 'number') ||
      invalidProp(channel.instrumentParams, 'fatCount', 'number') ||
      invalidProp(channel.instrumentParams, 'pulseWidth', 'number') ||
      invalidProp(channel.instrumentParams, 'pwmFreq', 'number') ||
      invalidProp(channel.instrumentParams, 'envAttack', 'number') ||
      invalidProp(channel.instrumentParams, 'envDecay', 'number') ||
      invalidProp(channel.instrumentParams, 'envSustain', 'number') ||
      invalidProp(channel.instrumentParams, 'envRelease', 'number') ||
      invalidProp(channel.instrumentParams, 'cutoff', 'number') ||
      invalidProp(channel.instrumentParams, 'resonance', 'number') ||
      invalidProp(channel.instrumentParams, 'rolloff', 'number') ||
      invalidProp(channel.instrumentParams, 'filterAttack', 'number') ||
      invalidProp(channel.instrumentParams, 'filterDecay', 'number') ||
      invalidProp(channel.instrumentParams, 'filterSustain', 'number') ||
      invalidProp(channel.instrumentParams, 'filterRelease', 'number') ||
      invalidProp(channel.instrumentParams, 'filterAmount', 'number') ||
      invalidProp(channel.instrumentParams, 'samplerAttack', 'number') ||
      invalidProp(channel.instrumentParams, 'samplerRelease', 'number') ||
      invalidProp(channel.instrumentParams, 'metalHarmonicity', 'number') ||
      invalidProp(channel.instrumentParams, 'metalModulationIndex', 'number') ||
      invalidProp(channel.instrumentParams, 'metalResonance', 'number') ||
      invalidProp(channel.instrumentParams, 'metalOctaves', 'number') ||
      invalidProp(channel.instrumentParams, 'metalAttack', 'number') ||
      invalidProp(channel.instrumentParams, 'metalDecay', 'number') ||
      invalidProp(channel.instrumentParams, 'metalRelease', 'number') ||
      invalidProp(channel.instrumentParams, 'pluckAttackNoise', 'number') ||
      invalidProp(channel.instrumentParams, 'pluckDampening', 'number') ||
      invalidProp(channel.instrumentParams, 'pluckResonance', 'number') ||
      invalidProp(channel.instrumentParams, 'pluckRelease', 'number') ||
      // 3-slot effects array. Legacy flat effect fields are no longer validated —
      // patchPresetAndChannels migrates/normalizes them into 3 fully-populated
      // slots before validation runs, so an object/array check is sufficient.
      invalidProp(channel.instrumentParams, 'effects', 'object')
    ) {
      return false
    }
  }
  return true
}
/* eslint-enable @typescript-eslint/no-explicit-any */
