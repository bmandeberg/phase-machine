# Rhythmic pack

One flat sample pack for the **rhythmic** instrument (varispeed engine — see
`src/rhythmSampler.ts`). Every slice — breakbeats, top loops, grooves — lives in
a single instrument, laid out across the keyboard (C1↑). There's no bank
selector; it's all one pack.

Each slice plays at `globalBPM / sliceBpm`, so a slice cut on a bar boundary
keeps its internal rhythm locked to the global grid (pitch rises with tempo —
the intended sound). Because the pack mixes loops recorded at **different
tempos**, the source BPM is stored **per slice** (the `bpms` map), not per pack.

Organized in subfolders by source loop (`amen/`, `think/`, …) for sanity, but
they all map into the one instrument.

## Current layout (`src/samplerConfigs.ts` → `RHYTHM_PACK`)

| Notes  | Loop          | Slices | Source BPM |
|--------|---------------|--------|------------|
| C1–D2  | amen          | 15     | 138        |
| Eb2–Bb2| think         | 8      | 113        |
| B2–E4  | funky-drummer | 18     | 98         |
| F4–C5  | hot-pants     | 8      | 113        |
| Db5–E6 | vec-loops     | 16     | 140        |
| F6–Ab7 | tighten-up    | 16     | 130        |
| A7–B8  | skullsnaps    | 15     | 96         |

**96 / 96 slots used — pack is full.**

## Adding more loops to the pack

1. Chop your loop and drop the sliced **mp3** files in a new subfolder here,
   e.g. `public/samples/rhythmic/<name>/<name>_01.mp3`, `_02.mp3`, … in
   playback order. (Hand me wav chops and I'll encode them — 320 kbps mp3 via
   `ffmpeg -codec:a libmp3lame`. The LAME gapless header means the browser trims
   all encoder delay, so the timing is sample-accurate — measured Δ = 0 ms vs
   wav in Chrome — at ~¼ the file size. Same format every other instrument uses.)
2. In `src/samplerConfigs.ts` → `RHYTHM_PACK`, **continue the chromatic note
   sequence** from where it left off: add each slice to `urls` as
   `<note>: '<name>/<file>'`, and add the same note to `bpms` with that loop's
   source tempo.
3. That's it — the slices appear on the next free keys of the one rhythmic
   instrument. 96 slots total (C1–B8).

Note keys use flats (Db, Eb, Gb, Ab, Bb) to match `noteString` in
`src/globals.tsx` — the same convention the drum banks use.
