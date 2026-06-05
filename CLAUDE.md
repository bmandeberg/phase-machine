# phase-machine

A browser-based polymetric MIDI sequencer / synthesizer. Each **channel** has a
pitch-class **key**, a step **sequencer**, and an **instrument** (Tone.js synth
or sampler), and can drive both the built-in instruments and external MIDI
outputs. Live at [phasemachine.com](https://phasemachine.com).

Stack: **Next.js 15 (App Router) + React 19**, TypeScript, Sass, **Tone.js**
(audio) and **webmidi** (MIDI I/O).

## Dev & verification

```bash
yarn dev                 # Next dev server
yarn test                # Vitest unit tests (pure logic: math.ts, globals)
PORT=3100 yarn dev &     # then, in another shell:
yarn regression          # Puppeteer e2e — EXPECTS the app on :3100
yarn build               # production build (also the type gate, see below)
```

- **There is no ESLint configured** (`yarn lint` / `next lint` only prompts to
  set it up). `eslint-disable` comments in the source are inert. The real gate
  is **`npx tsc --noEmit`** + **`yarn build`** — run them after every change.
- `yarn regression` drives real user flows (transport/playhead, the 3 channel
  views, channel CRUD, presets, persistence) and has a console-error gate, but
  it runs **headless and cannot verify actual audio/MIDI output** — it asserts
  the playhead advances, not that anything sounds. Audio/MIDI is a **manual
  ear-check** (best done on a Vercel preview before merging).

## Deploy

`master` **auto-deploys to production** (phasemachine.com) via Vercel's git
integration. Always branch for work, push for a preview URL, ear-check, then
merge to `master`.

## Layout

```
src/
  components/
    Channel.tsx          # a channel: owns all state, audio-loop scheduling, MIDI, effects
    channel/             #   its three view layouts (presentational, React.memo)
      StackedView / HorizontalView / ClockView
    InstrumentModal.tsx  # thin orchestrator for the instrument editor
    instrument/          #   logic hooks + presentational panels:
      useSynthParams / useSamplerParams / useEffectParams   (state + Tone-node sync)
      SynthControls / EnvelopeControls / SamplerControls / EffectControls
    Sequencer, Key, Piano, Modal, RotaryKnob, Dropdown, NumInput, Fader, ...
  hooks/
    useInstruments.ts    # creates/disposes the Tone instruments + effects graph
    usePresets.ts        # preset load/save/import/export + dirty tracking
    useUI.tsx            # builds the channel's memoized UI elements (the `ui` bag)
    useLoop, useKeyManipulation, useMIDI, useAlt
  types.ts               # shared domain types (Channel, Preset, InstrumentParams,
                         #   Setter<T>, Tone node/ref aliases, MIDI types)
  samplerConfigs.ts      # static sample-bank data (urls / folder / volume per bank)
  globals.tsx            # constants + small shared helpers (noteString, handleArpMode, …)
  math.ts                # pure math helpers (unit-tested)
```

## Conventions / gotchas

- Shared types live in `src/types.ts`; prefer them over re-declaring. `Setter<T>`
  is the alias for a `useState` setter.
- Synth `type`/`modulationType` are stored as free strings while Tone types them
  as strict oscillator-type unions — widen with `as unknown as ...` only at those
  boundaries (see `useInstruments` / `useSynthParams`).
- `InstrumentModal`'s param hooks are called **unconditionally** (never behind the
  `instrumentType` branch) so their effects fire regardless of which panel is
  shown — keep it that way; it's what makes the synth/sampler nodes stay in sync.
- The dense note-scheduling / loop / MIDI logic in `Channel.tsx` is intentionally
  left in one place (it shares many mutable refs). Only the view layer was
  extracted. Treat changes there as audio-critical and ear-check them.
- App Router emits component CSS **after** global/theme CSS, so equal-specificity
  theme rules can lose to component rules by source order — when a dark/contrast
  override doesn't take, bump its selector specificity to match the component's.
