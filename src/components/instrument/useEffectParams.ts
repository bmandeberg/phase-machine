import { useState, useEffect, useCallback, useRef } from 'react'
import { EffectSlot, EffectSlots, EffectType } from '../../types'
import { rateToSeconds } from '../../math'
import { SlotNodesRef } from '../../hooks/useInstruments'

export type SlotFieldValue = number | boolean | string

// One slot's controller, handed to EffectSlotControls: the current slot state plus
// setters that update local state, persist to instrumentParams.effects, and push to
// the live Tone node.
export interface SlotController {
  index: number
  slot: EffectSlot
  setType: (type: EffectType) => void
  setField: (field: keyof EffectSlot, value: SlotFieldValue) => void
}

function useSlotParams(
  index: number,
  initial: EffectSlot,
  slotNodesRef: SlotNodesRef,
  updateSlotParam: (index: number, field: string, value: SlotFieldValue) => void,
  tempo: number
): SlotController {
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

  return { index, slot, setType, setField }
}

// Owns the 3 effect slots' state. Calls useSlotParams exactly 3 times (fixed count,
// so the rules-of-hooks and the project's "param hooks fire unconditionally" rule
// both hold), and rebuilds the series chain whenever a slot's effect TYPE changes.
export default function useEffectParams(
  slotNodesRef: SlotNodesRef,
  rebuildEffectChain: (slots: EffectSlots) => void,
  effects: EffectSlots,
  updateSlotParam: (index: number, field: string, value: SlotFieldValue) => void,
  tempo: number
): [SlotController, SlotController, SlotController] {
  const slot0 = useSlotParams(0, effects[0], slotNodesRef, updateSlotParam, tempo)
  const slot1 = useSlotParams(1, effects[1], slotNodesRef, updateSlotParam, tempo)
  const slot2 = useSlotParams(2, effects[2], slotNodesRef, updateSlotParam, tempo)

  // Rebuild the chain only when a slot's TYPE actually changes (create/dispose nodes
  // + rewire). prevTypes starts at the mounted types so opening the modal doesn't
  // trigger a spurious rebuild (the chain was already built by useInstruments).
  const prevTypes = useRef(`${effects[0].type}|${effects[1].type}|${effects[2].type}`)
  useEffect(() => {
    const key = `${slot0.slot.type}|${slot1.slot.type}|${slot2.slot.type}`
    if (prevTypes.current === key) return
    prevTypes.current = key
    rebuildEffectChain([slot0.slot, slot1.slot, slot2.slot])
  }, [slot0.slot, slot1.slot, slot2.slot, rebuildEffectChain])

  return [slot0, slot1, slot2]
}
