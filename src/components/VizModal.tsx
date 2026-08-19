import React, { useMemo, useState } from 'react'
import { simulateChannel, VizChannelConfig } from '../visualization'
import { Setter } from '../types'
import KeyAnalysis from './viz/KeyAnalysis'
import PhaseSummary from './viz/PhaseSummary'
import PitchHistogram from './viz/PitchHistogram'
import IntervalHistogram from './viz/IntervalHistogram'
import TransitionGraph from './viz/TransitionGraph'
import PianoRoll from './viz/PianoRoll'
import PhaseOrbit from './viz/PhaseOrbit'
import RhythmView from './viz/RhythmView'
import './VizModal.scss'

// Everything the read-only visualizer needs from a channel. Built by Channel only
// while its visualizer modal is open (null otherwise), so the live playing* fields
// don't re-render every channel's Modal on each note while the modal is closed.
export interface VizData {
  config: VizChannelConfig
  tempo: number
  color: string
  axis: number
  keySwing: number
  keySwingLength: number
  seqSwing: number
  seqSwingLength: number
  playingPitchClass?: number | null
  playingNote?: number
  playingStep?: number
}

// The visualizer renders either as the fullscreen modal or docked inline below
// its channel; the user's last choice persists across sessions (like 'theme').
export type VizViewMode = 'modal' | 'dock'
const VIZ_VIEW_KEY = 'vizView'
export function getVizViewMode(): VizViewMode {
  if (typeof window === 'undefined') return 'modal'
  return window.localStorage.getItem(VIZ_VIEW_KEY) === 'dock' ? 'dock' : 'modal'
}
export function setVizViewMode(mode: VizViewMode) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(VIZ_VIEW_KEY, mode)
  }
}

// Edit/audition hooks the interactive views use, provided by Channel and riding
// the same paths as the main controls (fan-out gestures, ALT+click audition).
export interface VizActions {
  setKey: Setter<boolean[]>
  doFlip: () => void
  doOpposite: () => void
  shiftKey: (amount: number) => void
  auditionPitch: (pitch: number) => void
}

interface VizModalProps {
  data: VizData
  actions?: VizActions
  // docked below the channel instead of inside the modal window: adds the
  // compact toolbar whose buttons hand control back to Channel
  dock?: boolean
  onExpand?: () => void
  onClose?: () => void
}

// The per-channel visualizer: a gallery of views derived from the channel's
// config via the pure phase simulator (see visualization.ts). The key card can
// edit the channel's key (range mode only, where the key isn't derived from the
// piano), and pitch-bearing charts audition on click; everything else is a pure
// function of channel state, so edits re-simulate every view live.
export default function VizModal({ data, actions, dock, onExpand, onClose }: VizModalProps) {
  const { config, tempo, color } = data

  // the reroll control below bumps the seed to resample a random-movement
  // channel; deterministic channels ignore it
  const [seed, setSeed] = useState(1)
  const sim = useMemo(() => simulateChannel(config, { tempo, seed }), [config, tempo, seed])

  const empty = !sim.pitchRange.length
  const silent = !empty && !sim.events.length

  return (
    <div className="viz-modal" style={{ '--viz-accent': color } as React.CSSProperties}>
      {dock && (
        <div className="viz-dock-toolbar">
          <span className="viz-dock-title" style={{ color }}>
            visualizer
          </span>
          <button className="viz-button" onClick={onExpand} title="Open as fullscreen window">
            expand
          </button>
          <button className="viz-button" onClick={onClose} title="Close visualizer">
            close
          </button>
        </div>
      )}
      {!sim.phase.deterministic && (
        <div className="viz-banner">
          A random movement makes this channel non-repeating, so the views below show one sampled performance.
          <button className="viz-button" onClick={() => setSeed((s) => s + 1)}>
            resample
          </button>
        </div>
      )}
      {empty && <div className="viz-banner">No pitches are in play. Select some notes in the key to see more.</div>}
      {silent && (
        <div className="viz-banner">
          No steps are on in the sequence, so the channel is silent and the views below only reflect the key.
        </div>
      )}
      <div className="viz-grid">
        <PhaseSummary sim={sim} tempo={tempo} color={color} />
        <KeyAnalysis
          musicalKey={config.key}
          axis={data.axis}
          color={color}
          playingPitchClass={data.playingPitchClass}
          // in keybd mode the key derives from the piano's pitches, so key-level
          // edits there would be clobbered — the card goes read-only, like the
          // main key controls do
          editable={config.rangeMode}
          setKey={actions?.setKey}
          doFlip={actions?.doFlip}
          doOpposite={actions?.doOpposite}
          shiftKey={actions?.shiftKey}
        />
        <PitchHistogram sim={sim} color={color} playingNote={data.playingNote} auditionPitch={actions?.auditionPitch} />
        <IntervalHistogram events={sim.events} color={color} />
        <TransitionGraph events={sim.events} color={color} auditionPitch={actions?.auditionPitch} />
        <PhaseOrbit sim={sim} color={color} />
        <RhythmView
          keySwing={data.keySwing}
          keySwingLength={data.keySwingLength}
          seqSwing={data.seqSwing}
          seqSwingLength={data.seqSwingLength}
          color={color}
        />
        <PianoRoll sim={sim} color={color} auditionPitch={actions?.auditionPitch} />
      </div>
    </div>
  )
}
