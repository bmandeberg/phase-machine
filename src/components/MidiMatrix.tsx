import React, { useCallback, useState, useEffect, useRef } from 'react'
import classNames from 'classnames'
import { ALL_MIDI_CHANNELS, normalizeMidiOutChannels } from '../globals'
import { arrayEq } from '../math'
import useDragPaint from '../hooks/useDragPaint'
import { ChannelMidiAssignment } from '../types'
import './MidiMatrix.scss'

// The settings MIDI routing matrices and their building blocks. Both matrices
// (and the MIDI modal's output row) speak the same value language: a number[]
// per phase machine channel.
//   out: the midiOutChannels set — empty = NO MIDI output
//   in:  the input filter — [n] = only channel n, empty = accept all
export type MidiMatrixVariant = 'out' | 'in'

function valueOf(variant: MidiMatrixVariant, c: ChannelMidiAssignment): number[] {
  return variant === 'out' ? c.midiOutChannels : c.midiInChannels
}

// A value's cells light up directly (nothing when output is deactivated); the
// "all" cell lights when the value means "every channel" — a full set for
// output, the empty accept-all filter for input.
export function midiAllCellLit(variant: MidiMatrixVariant, value: number[]): boolean {
  return variant === 'in' ? value.length === 0 : value.length === ALL_MIDI_CHANNELS.length
}

// The next output set after clicking a cell. Plain click assigns exclusively —
// except on the only lit cell, which deactivates MIDI output entirely (empty
// set). Additive (shift/cmd/ctrl, and every click in the MIDI modal) toggles the
// cell in and out of the set — dropping the last member also deactivates. The
// "all" cell fills the set, or deactivates when it is already full.
export function nextMidiOutChannels(value: number[], midiChannel: number | null, additive: boolean): number[] {
  if (midiChannel === null) {
    return value.length === ALL_MIDI_CHANNELS.length ? [] : ALL_MIDI_CHANNELS.slice()
  }
  if (additive) {
    return normalizeMidiOutChannels(
      value.includes(midiChannel) ? value.filter((c) => c !== midiChannel) : [...value, midiChannel]
    )
  }
  return value.length === 1 && value[0] === midiChannel ? [] : [midiChannel]
}

// Paint one swept cell into an output set: add/remove per the drag's paint state,
// or null when the cell already matches (nothing to commit).
export function sweepMidiOutChannels(value: number[], midiChannel: number, paint: boolean): number[] | null {
  if (paint === value.includes(midiChannel)) return null
  return paint ? normalizeMidiOutChannels([...value, midiChannel]) : value.filter((c) => c !== midiChannel)
}

function nextValue(
  variant: MidiMatrixVariant,
  value: number[],
  midiChannel: number | null,
  additive: boolean
): number[] {
  // input is single-or-all — no multi-select, additive behaves like a plain click
  if (variant === 'in') {
    return midiChannel === null ? [] : [midiChannel]
  }
  return nextMidiOutChannels(value, midiChannel, additive)
}

// The header row of column labels ("all" + 1-16). rowLabelSpacer aligns it with
// rows that lead with a channel-number label (the settings matrices).
export function MidiChannelLabels({ rowLabelSpacer }: { rowLabelSpacer?: boolean }) {
  return (
    <div className="midi-matrix-row">
      {rowLabelSpacer && <div className="midi-matrix-row-label"></div>}
      <div className="midi-matrix-column-label all">all</div>
      {ALL_MIDI_CHANNELS.map((midiChannel) => (
        <div key={midiChannel} className="midi-matrix-column-label">
          {midiChannel}
        </div>
      ))}
    </div>
  )
}

// One row of radio/toggle cells: the "all" cell plus MIDI channels 1-16.
// onSelect fires on mousedown (null for the "all" cell, additive = shift/cmd/ctrl
// held); onSweep fires when the pointer enters a numbered cell mid-drag — the
// parent gates it on its drag state.
interface MidiChannelCellsProps {
  lit: number[]
  allLit: boolean
  color: string
  onSelect: (midiChannel: number | null, additive: boolean) => void
  onSweep?: (midiChannel: number) => void
}

export function MidiChannelCells({ lit, allLit, color, onSelect, onSweep }: MidiChannelCellsProps) {
  const select = (midiChannel: number | null) => (e: React.MouseEvent) => {
    if (e.button !== 0) return // left-click only
    e.preventDefault() // avoid text/drag selection while painting
    onSelect(midiChannel, e.shiftKey || e.metaKey || e.ctrlKey)
  }
  return (
    <>
      <div
        className={classNames('midi-matrix-cell', { assigned: allLit })}
        style={allLit ? { backgroundColor: color } : undefined}
        onMouseDown={select(null)}></div>
      {ALL_MIDI_CHANNELS.map((midiChannel) => (
        <div
          key={midiChannel}
          className={classNames('midi-matrix-cell', { assigned: lit.includes(midiChannel) })}
          style={lit.includes(midiChannel) ? { backgroundColor: color } : undefined}
          onMouseDown={select(midiChannel)}
          onMouseEnter={() => onSweep?.(midiChannel)}></div>
      ))}
    </>
  )
}

// One settings MIDI routing matrix: rows are phase machine channels. Owns its own
// condensed/expanded state (collapsed by default, re-condensing when the modal
// closes) and an optimistic overlay: a clicked assignment round-trips through the
// channel (whose upward state report is debounced) before it comes back in
// `channels`, so the clicked value is held here in the meantime — which also lets
// rapid additive clicks compose without waiting on the round trip. An entry is
// dropped once the channel catches up, or when the actual value changes to
// anything else, so an external write can never be masked by a stale click.
interface MidiMatrixProps {
  label: string
  channels: ChannelMidiAssignment[]
  variant: MidiMatrixVariant
  onAssign?: (id: string, midiChannels: number[]) => void
  modalType?: string | null
}

export default React.memo(function MidiMatrix({ label, channels, variant, onAssign, modalType }: MidiMatrixProps) {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => setExpanded((e) => !e), [])
  const [pending, setPending] = useState<Record<string, number[]>>({})
  // mousedown applies click semantics and records whether the pressed cell ended
  // up lit; dragging paints that state across cells (and across rows)
  const { beginPaint, paintState } = useDragPaint()

  const prevChannels = useRef(channels)
  useEffect(() => {
    const prev = prevChannels.current
    prevChannels.current = channels
    setPending((pending) => {
      if (Object.keys(pending).length === 0) return pending
      let changed = false
      const next = { ...pending }
      channels.forEach((c) => {
        if (!(c.id in next)) return
        const actual = valueOf(variant, c)
        // the find is lazy — it only runs when the caught-up check misses
        const changedExternally = () => {
          const prevChannel = prev.find((p) => p.id === c.id)
          return !!prevChannel && !arrayEq(actual, valueOf(variant, prevChannel))
        }
        if (arrayEq(actual, next[c.id]) || changedExternally()) {
          delete next[c.id]
          changed = true
        }
      })
      return changed ? next : pending
    })
  }, [channels, variant])

  useEffect(() => {
    if (!modalType) {
      setExpanded(false)
      setPending({})
    }
  }, [modalType])

  return (
    <div className="settings-item midi-matrix-item">
      <div className="midi-matrix-header" onClick={toggleExpanded}>
        <p className="settings-label">{label}</p>
        <span className={classNames('midi-matrix-arrow', { expanded })}></span>
      </div>
      {expanded && (
        <div className="midi-matrix">
          {channels.length ? (
            <>
              <MidiChannelLabels rowLabelSpacer />
              {channels.map((channel) => {
                const value = channel.id in pending ? pending[channel.id] : valueOf(variant, channel)
                const commit = (next: number[]) => {
                  setPending((pending) => ({ ...pending, [channel.id]: next }))
                  onAssign?.(channel.id, next)
                }
                return (
                  <div key={channel.id} className="midi-matrix-row">
                    <div className="midi-matrix-row-label" style={{ color: channel.color }}>
                      {channel.channelNum + 1}
                    </div>
                    <MidiChannelCells
                      lit={value}
                      allLit={midiAllCellLit(variant, value)}
                      color={channel.color}
                      onSelect={(midiChannel, additive) => {
                        const next = nextValue(variant, value, midiChannel, additive)
                        if (midiChannel !== null) beginPaint(next.includes(midiChannel))
                        commit(next)
                      }}
                      onSweep={(midiChannel) => {
                        const paint = paintState()
                        if (paint === null) return
                        let next: number[] | null = null
                        if (variant === 'in') {
                          // sweep exclusive-assigns per row (a vertical drag paints a column)
                          if (paint && !(value.length === 1 && value[0] === midiChannel)) {
                            next = [midiChannel]
                          }
                        } else {
                          next = sweepMidiOutChannels(value, midiChannel, paint)
                        }
                        if (next !== null) commit(next)
                      }}
                    />
                  </div>
                )
              })}
            </>
          ) : (
            <p className="midi-matrix-empty">no channels</p>
          )}
        </div>
      )}
    </div>
  )
})
