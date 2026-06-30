import { useCallback, useEffect, useRef, useState } from 'react'
import { Preset } from '../types'

// Conservative cap — a snapshot is a few KB of JSON, so memory isn't the concern;
// this just keeps the stack from growing unbounded over a long session.
const MAX_HISTORY = 50
// Ignore uiState churn for a beat after mount: each channel emits its (normalized)
// state ~200ms in, which can differ slightly from the raw initial preset. Arming
// after that settles means the baseline is the real resting state, not a phantom step.
const ARM_DELAY = 600
// After an undo/redo we rewrite uiState and the channels re-emit their restored values
// ~200ms later. Ignore captures during this window so a restore never logs itself as a
// new step. Comfortably longer than the channel debounce + a render.
const RESTORE_QUIET = 500

// Generic structural deep-equality. Preset is plain JSON (primitives, arrays, nested
// plain objects), so this is key-order-independent and needs no schema knowledge.
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  const aArr = Array.isArray(a)
  if (aArr !== Array.isArray(b)) return false
  const ak = Object.keys(a as object)
  const bk = Object.keys(b as object)
  if (ak.length !== bk.length) return false
  for (const k of ak) {
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false
  }
  return true
}

// Undo/redo is scoped to musical / structural state. Preset identity (name, id, hotkey,
// placeholder) is deliberately excluded so renaming a preset doesn't create history
// steps — and so an unrelated undo never reverts a rename.
function contentEqual(a: Preset, b: Preset): boolean {
  return (
    a.tempo === b.tempo &&
    a.channelSync === b.channelSync &&
    a.numChannels === b.numChannels &&
    deepEqual(a.channels, b.channels)
  )
}

const clone = (p: Preset): Preset => JSON.parse(JSON.stringify(p))

/**
 * File-less undo/redo over the app's authoritative `uiState` snapshot.
 *
 * Capture is passive: whenever uiState settles to content that differs from the current
 * pointer, a copy is pushed (truncating any redo branch). Because channel edits are
 * already 200ms-debounced, each settled gesture is one step.
 *
 * Restore is delegated to `applySnapshot` (owned by App, which has the channel setters):
 * we move the pointer, mark a short quiet window so the restore's own writes/re-emits
 * aren't re-captured, then hand the snapshot to applySnapshot.
 */
export default function useHistory(uiState: Preset, applySnapshot: (snap: Preset) => void) {
  const history = useRef<Preset[]>([])
  const pointer = useRef(-1)
  const armed = useRef(false)
  const latest = useRef(uiState)
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const sync = useCallback(() => {
    setCanUndo(pointer.current > 0)
    setCanRedo(pointer.current < history.current.length - 1)
  }, [])

  // Arm once the mount-time normalization has settled, seeding the baseline.
  useEffect(() => {
    const t = setTimeout(() => {
      armed.current = true
      history.current = [clone(latest.current)]
      pointer.current = 0
      sync()
    }, ARM_DELAY)
    return () => clearTimeout(t)
  }, [sync])

  // Passive capture.
  useEffect(() => {
    latest.current = uiState
    if (!armed.current || restoreTimer.current !== null) return
    if (contentEqual(uiState, history.current[pointer.current])) return
    const next = history.current.slice(0, pointer.current + 1)
    next.push(clone(uiState))
    if (next.length > MAX_HISTORY) next.shift()
    history.current = next
    pointer.current = next.length - 1
    sync()
  }, [uiState, sync])

  const restore = useCallback(
    (nextPointer: number) => {
      pointer.current = nextPointer
      if (restoreTimer.current !== null) clearTimeout(restoreTimer.current)
      restoreTimer.current = setTimeout(() => {
        restoreTimer.current = null
      }, RESTORE_QUIET)
      applySnapshot(history.current[nextPointer])
      sync()
    },
    [applySnapshot, sync]
  )

  const undo = useCallback(() => {
    if (pointer.current > 0) restore(pointer.current - 1)
  }, [restore])

  const redo = useCallback(() => {
    if (pointer.current < history.current.length - 1) restore(pointer.current + 1)
  }, [restore])

  // Cmd/Ctrl+Z = undo, Cmd/Ctrl+Shift+Z or Ctrl+Y = redo. Bail when focus is in an
  // editable text field so the browser's native text-undo keeps working there.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      const key = e.key.toLowerCase()
      if (key !== 'z' && key !== 'y') return
      const el = document.activeElement
      if (el && (el.nodeName === 'TEXTAREA' || (el.nodeName === 'INPUT' && (el as HTMLInputElement).type === 'text')))
        return
      e.preventDefault()
      if (key === 'y' || e.shiftKey) redo()
      else undo()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [undo, redo])

  return { undo, redo, canUndo, canRedo }
}
