// Varispeed rhythmic-loop sampler — a Tone.Sampler-shaped wrapper around Tone.Players
// built for tempo-synced rhythmic loops (breakbeats, top loops, grooves).
//
// Why custom: the built-in sampler (Tone.Sampler) repitches a sample by the
// *keyboard interval* between the played note and the sample's root, which is
// the opposite of what a rhythmic loop wants. Here each note maps to one slice and is
// played at its natural pitch — the ONLY pitch/speed change is a global
// varispeed lock to the transport tempo.
//
// Tempo sync: a slice cut on bar boundaries carries internal rhythm, so we play
// it back at `playbackRate = transportBpm / sliceBpm`. That compresses/expands
// the slice's real-time length to fit the grid at any tempo, keeping its groove
// locked. Speed and pitch couple (classic sped-up-jungle sound) — accepted by
// design, and the reason there are zero stretch artifacts (no grain stitching).
// Each slice has its OWN source tempo (the pack mixes loops recorded at
// different BPMs), so the ratio is computed per note from `bpms`.
//
// The rate is read live at each trigger, so changing the global tempo tracks
// automatically with no extra wiring; a slice already ringing keeps its rate
// until the next trigger (acceptable — the next step re-locks it).

import * as Tone from 'tone'
import { RhythmConfig } from './samplerConfigs'

// The subset of the Tone.Sampler surface that Channel.tsx / useInstruments call.
// Implementing it lets a RhythmSampler drop into the existing `instrument.current`
// path with no special-casing in the audio loop.
export class RhythmSampler {
  private players: Tone.Players
  private names: string[]
  private bpms: Record<string, number>
  private _attack = 0
  private _release = 1

  constructor(config: RhythmConfig) {
    this.bpms = config.bpms
    this.names = Object.keys(config.urls)
    // baseUrl mirrors the Tone.Sampler path (origin + relative). Instantiated
    // client-side only (from useInstruments' effect), so window is available.
    this.players = new Tone.Players({
      urls: config.urls,
      baseUrl: window.location.origin + config.baseUrl,
      volume: config.volume,
    })
  }

  // transport-locked varispeed ratio for a given slice, read fresh each trigger
  // so tempo changes are picked up automatically. Uses that slice's own source
  // tempo (the pack mixes loops from different BPMs); falls back to 1:1.
  private rate(note: string): number {
    const sourceBpm = this.bpms[note] > 0 ? this.bpms[note] : Tone.getTransport().bpm.value
    return Tone.getTransport().bpm.value / sourceBpm
  }

  // Channel.playNote gates on `instrument.current.loaded` before triggering.
  get loaded(): boolean {
    return this.players.loaded
  }

  // useSamplerParams assigns `.attack`/`.release` directly (like the real
  // sampler); map them onto each player's fade in/out.
  get attack(): number {
    return this._attack
  }
  set attack(value: number) {
    this._attack = value
  }
  get release(): number {
    return this._release
  }
  set release(value: number) {
    this._release = value
  }

  // note → slice. `duration` is the real-time gate from the sustain/hold logic
  // (choke length); we pass it straight through so a short sustain chokes the
  // slice and hold mode plays it out. velocity scales the per-slice volume.
  triggerAttackRelease(note: string | number, duration: number, time?: number, velocity = 1): this {
    const name = String(note)
    if (!this.players.has(name)) return this
    const player = this.players.player(name)
    player.playbackRate = this.rate(name)
    player.fadeIn = this._attack
    player.fadeOut = this._release
    player.volume.setValueAtTime(Tone.gainToDb(velocity), time ?? Tone.now())
    player.start(time, 0, duration)
    return this
  }

  triggerAttack(note: string | number, time?: number, velocity = 1): this {
    const name = String(note)
    if (!this.players.has(name)) return this
    const player = this.players.player(name)
    player.playbackRate = this.rate(name)
    player.fadeIn = this._attack
    player.volume.setValueAtTime(Tone.gainToDb(velocity), time ?? Tone.now())
    player.start(time)
    return this
  }

  // With no note, release every voice (used by cleanup). The real sampler's
  // arg-less release is a no-op-ish all-release; match that.
  triggerRelease(note?: string | number, time?: number): this {
    if (note !== undefined) {
      const name = String(note)
      if (this.players.has(name) && this.players.player(name).state === 'started') {
        this.players.player(name).stop(time)
      }
      return this
    }
    for (const name of this.names) {
      const player = this.players.player(name)
      if (player.state === 'started') player.stop(time)
    }
    return this
  }

  // Mirror Tone.Sampler.set for the params updateInstruments pushes.
  set(options: { attack?: number; release?: number; volume?: number }): this {
    if (options.attack !== undefined) this._attack = options.attack
    if (options.release !== undefined) this._release = options.release
    if (options.volume !== undefined) this.players.volume.value = options.volume
    return this
  }

  connect(destination: Tone.InputNode): this {
    this.players.connect(destination)
    return this
  }

  disconnect(destination?: Tone.InputNode): this {
    if (destination) this.players.disconnect(destination)
    else this.players.disconnect()
    return this
  }

  dispose(): this {
    this.players.dispose()
    return this
  }
}
