import { useState, useEffect, useCallback, useRef } from 'react'
import { EffectSlot, EffectSlots, EffectType } from '../../types'
import { rateToSeconds } from '../../math'
import { SlotNodesRef } from '../../hooks/useInstruments'

export type SlotFieldValue = number | boolean | string

// One slot's controller, handed to EffectSlotControls: the current slot state, the
// setters that update local state / persist to instrumentParams.effects / push to the
// live Tone node, plus the up/down reorder controls (move + boundary flags).
export interface SlotController {
  index: number
  slot: EffectSlot
  setType: (type: EffectType) => void
  setField: (field: keyof EffectSlot, value: SlotFieldValue) => void
  canMoveUp: boolean
  canMoveDown: boolean
  move: (dir: -1 | 1) => void
  // the saved-preset slot this row's effect came from — follows the effect across
  // reorders so a knob's double-click reset restores the right effect's values.
  savedSlot?: EffectSlot
}

// Internal per-slot state bundle. Same as SlotController minus the reorder controls
// (those are injected by useEffectParams, which can see all 3 slots) plus the raw
// full-state setter that a reorder uses to swap two slots' entire param objects.
interface SlotState {
  index: number
  slot: EffectSlot
  setSlot: (slot: EffectSlot) => void
  setType: (type: EffectType) => void
  setField: (field: keyof EffectSlot, value: SlotFieldValue) => void
}

function useSlotParams(
  index: number,
  initial: EffectSlot,
  slotNodesRef: SlotNodesRef,
  updateSlotParam: (index: number, field: string, value: SlotFieldValue) => void,
  tempo: number
): SlotState {
  const [slot, setSlot] = useState<EffectSlot>(initial)

  const setField = useCallback(
    (field: keyof EffectSlot, value: SlotFieldValue) => {
      setSlot((prev) => ({ ...prev, [field]: value }))
      updateSlotParam(index, field as string, value)
    },
    [index, updateSlotParam]
  )

  const setType = useCallback((type: EffectType) => setField('type', type), [setField])

  // Push this slot's params to its live node — but only when the node currently
  // matches the slot's type. On a type change the chain rebuild creates the node
  // with params already applied, so skipping here avoids poking a stale node.
  useEffect(() => {
    const n = slotNodesRef.current[index]
    if (n && n.type === slot.type) n.setParams(slot)
  }, [slot, slotNodesRef, index])

  // Tempo-synced delay: when this slot is a delay locked to a note-rate, derive the
  // delay time in seconds from the global BPM (mirrors the modal-closed lock in
  // Channel.tsx so the delay tracks tempo whether the modal is open or not).
  useEffect(() => {
    if (slot.type === 'delay' && typeof slot.syncDelayTime === 'string') {
      const seconds = rateToSeconds(slot.syncDelayTime, tempo)
      if (slot.delayTime !== seconds) setField('delayTime', seconds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo, slot.type, slot.syncDelayTime])

  return { index, slot, setSlot, setType, setField }
}

// Owns the 3 effect slots' state. Calls useSlotParams exactly 3 times (fixed count,
// so the rules-of-hooks and the project's "param hooks fire unconditionally" rule
// both hold), and rebuilds the series chain whenever a slot's effect TYPE changes.
export default function useEffectParams(
  slotNodesRef: SlotNodesRef,
  rebuildEffectChain: (slots: EffectSlots) => void,
  effects: EffectSlots,
  updateSlotParam: (index: number, field: string, value: SlotFieldValue) => void,
  reorderSlots: (effects: EffectSlots) => void,
  savedEffects: EffectSlots | undefined,
  tempo: number
): [SlotController, SlotController, SlotController] {
  const slot0 = useSlotParams(0, effects[0], slotNodesRef, updateSlotParam, tempo)
  const slot1 = useSlotParams(1, effects[1], slotNodesRef, updateSlotParam, tempo)
  const slot2 = useSlotParams(2, effects[2], slotNodesRef, updateSlotParam, tempo)

  // Permutation from current row -> saved-preset slot index, so a knob reset restores
  // the saved values of the effect actually in that row (not whatever the preset had
  // at that position). Permutes with every move; snaps back to identity whenever a
  // fresh saved baseline arrives (save/reload), where current order == saved order.
  const [savedOrder, setSavedOrder] = useState<[number, number, number]>([0, 1, 2])
  useEffect(() => {
    setSavedOrder([0, 1, 2])
  }, [savedEffects])

  // Keep the latest slot states in a ref so `move` has a stable identity but always
  // reads fresh slot params (it runs from a click handler, not during render).
  const statesRef = useRef<[SlotState, SlotState, SlotState]>([slot0, slot1, slot2])
  statesRef.current = [slot0, slot1, slot2]

  // Reorder: swap the moving slot with its neighbour by exchanging their FULL param
  // objects (local state + persisted effects[]). The audio follows for free — if the
  // two types differ the type-change effect below rebuilds the chain; if they're the
  // same type the per-slot param push re-parametrizes the in-place nodes, which is
  // exactly the swapped-order sound.
  const move = useCallback(
    (index: number, dir: -1 | 1) => {
      const target = index + dir
      if (target < 0 || target > 2) return
      const states = statesRef.current
      const moving = states[index].slot
      const displaced = states[target].slot
      states[index].setSlot(displaced)
      states[target].setSlot(moving)
      const next = [states[0].slot, states[1].slot, states[2].slot] as EffectSlots
      next[index] = displaced
      next[target] = moving
      reorderSlots(next)
      // carry each row's saved-slot reference along with its effect
      setSavedOrder((prev) => {
        const swapped = prev.slice() as [number, number, number]
        ;[swapped[index], swapped[target]] = [swapped[target], swapped[index]]
        return swapped
      })
    },
    [reorderSlots]
  )

  // Rebuild the chain only when a slot's TYPE actually changes (create/dispose nodes
  // + rewire). prevTypes starts at the mounted types so opening the modal doesn't
  // trigger a spurious rebuild (the chain was already built by useInstruments). A
  // reorder of two same-typed slots leaves this key unchanged → no rebuild (correct).
  const prevTypes = useRef(`${effects[0].type}|${effects[1].type}|${effects[2].type}`)
  useEffect(() => {
    const key = `${slot0.slot.type}|${slot1.slot.type}|${slot2.slot.type}`
    if (prevTypes.current === key) return
    prevTypes.current = key
    rebuildEffectChain([slot0.slot, slot1.slot, slot2.slot])
  }, [slot0.slot, slot1.slot, slot2.slot, rebuildEffectChain])

  // Wrap each slot state into a full controller, injecting the reorder controls (which
  // need cross-slot knowledge of boundaries and the shared `move`) and the saved slot
  // that follows this row's effect across reorders.
  return [
    {
      ...slot0,
      canMoveUp: false,
      canMoveDown: true,
      move: (dir: -1 | 1) => move(0, dir),
      savedSlot: savedEffects?.[savedOrder[0]],
    },
    {
      ...slot1,
      canMoveUp: true,
      canMoveDown: true,
      move: (dir: -1 | 1) => move(1, dir),
      savedSlot: savedEffects?.[savedOrder[1]],
    },
    {
      ...slot2,
      canMoveUp: true,
      canMoveDown: false,
      move: (dir: -1 | 1) => move(2, dir),
      savedSlot: savedEffects?.[savedOrder[2]],
    },
  ]
}
