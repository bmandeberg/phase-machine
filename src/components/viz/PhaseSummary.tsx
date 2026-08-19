import React from 'react'
import VizCard from './VizCard'
import { SimResult } from '../../visualization'

interface PhaseSummaryProps {
  sim: SimResult
  tempo: number
  color: string
}

function formatBeats(beats: number): string {
  return Number.isInteger(beats) ? `${beats}` : beats.toFixed(2).replace(/\.?0+$/, '')
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 2 : 1)}s`
  const m = Math.floor(seconds / 60)
  const s = seconds - m * 60
  return `${m}m ${s.toFixed(0)}s`
}

// One cycle strip: tick marks at every cycle boundary across the full phase
function CycleStrip({ label, cycleBeats, phaseBeats, color }: { label: string; cycleBeats: number; phaseBeats: number; color?: string }) {
  const count = Math.round(phaseBeats / cycleBeats)
  const showTicks = count <= 128
  return (
    <div className="viz-cycle-strip">
      <span className="viz-label">{label}</span>
      <div className="viz-strip">
        {showTicks ? (
          Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              className="viz-strip-block"
              style={{ left: `${(i / count) * 100}%`, width: `calc(${100 / count}% - 2px)`, backgroundColor: color }}
            />
          ))
        ) : (
          <div className="viz-strip-block dense" style={{ left: 0, width: '100%', backgroundColor: color }} />
        )}
      </div>
      <span className="viz-strip-count">×{count}</span>
    </div>
  )
}

// The polymetric arithmetic of the channel: how long each loop's cycle is, and
// how long until the two realign (the full phase).
export default React.memo(function PhaseSummary({ sim, tempo, color }: PhaseSummaryProps) {
  const { phase } = sim
  const beatSeconds = 60 / tempo

  const rows = [
    {
      label: 'sequence cycle',
      ticks: `${phase.seqCycleTicks} steps`,
      beats: phase.seqCycleBeats,
    },
    {
      label: 'key cycle',
      ticks: `${phase.keyCycleTicks} notes`,
      beats: phase.keyCycleBeats,
    },
  ]

  return (
    <VizCard
      title="Phase"
      subtitle={phase.deterministic ? undefined : 'non-repeating'}
      description="This channel is two independent loops: the sequencer walks its steps at the sequence rate while the key arpeggiates the selected pitches at the key rate. Each loop repeats after its own cycle, and the full phase is how long until both cycles land together again (their least common multiple), the moment the channel truly starts over. The strips show how many of each cycle fit inside one full phase; a random movement never repeats, so no full phase exists.">
      <div className="viz-readout">
        {rows.map((row) => (
          <div key={row.label}>
            <span className="viz-label">{row.label}</span>
            {row.ticks} = {formatBeats(row.beats)} beats · {formatBeats(row.beats / 4)} measures ·{' '}
            {formatSeconds(row.beats * beatSeconds)}
          </div>
        ))}
        <div>
          <span className="viz-label">full phase</span>
          {phase.phaseBeats === null ? (
            <>never repeats (random movement)</>
          ) : (
            <>
              {formatBeats(phase.phaseBeats)} beats · {formatBeats(phase.phaseBeats / 4)} measures ·{' '}
              {formatSeconds(phase.phaseBeats * beatSeconds)}
            </>
          )}
        </div>
        {phase.phaseBeats !== null && (
          <div>
            <span className="viz-label">alignment</span>
            {phase.seqCyclesPerPhase} sequence {phase.seqCyclesPerPhase === 1 ? 'cycle' : 'cycles'} meet{' '}
            {phase.keyCyclesPerPhase} key {phase.keyCyclesPerPhase === 1 ? 'cycle' : 'cycles'}
          </div>
        )}
        {sim.truncated && (
          <div className="viz-note">views below are truncated to the first {formatBeats(sim.simulatedBeats)} beats</div>
        )}
      </div>
      {phase.phaseBeats !== null && (
        <div className="viz-strips">
          <CycleStrip label="seq" cycleBeats={phase.seqCycleBeats} phaseBeats={phase.phaseBeats} color={color} />
          <CycleStrip label="key" cycleBeats={phase.keyCycleBeats} phaseBeats={phase.phaseBeats} />
        </div>
      )}
    </VizCard>
  )
})
