import { useEffect, useRef } from 'react'

// Global hotkeys that act on the selected channels:
//   Cmd/Ctrl+S → save the current preset (app-wide, not selection-scoped)
//   Cmd/Ctrl+C → copy the selected channels to the channel clipboard
//   Cmd/Ctrl+V → paste the copied channels (after the selection, or at the end)
//   m / s   → mute / solo the selection (unified — see App's handler)
//   i / v   → open the instrument editor / visualizer for the selection
//   Delete  → delete the selected channels
//   Escape  → deselect all (only when no modal / dialog / menu is open)
// One document keydown listener (bubble phase). Dropdowns + AlertDialog already swallow
// Escape on the capture phase, so they pre-empt us; the modal is guarded explicitly via
// `isBlocked`. Mirrors the existing text-input guard used by the spacebar / preset keys.

interface SelectionHotkeysParams {
  anySelected: () => boolean
  onMute: () => void
  onSolo: () => void
  onDelete: () => void
  onDeselect: () => void
  onSelectAll: () => void
  onOpenInstrument: () => void
  onOpenVisualizer: () => void
  onSavePreset: () => void
  onCopy: () => void
  onPaste: () => void
  // true when the channel clipboard holds something to paste
  canPaste: () => boolean
  // true while a modal / alert dialog is open — Escape and Delete should defer to it
  isBlocked: () => boolean
}

function typingTarget(): boolean {
  const el = document.activeElement
  if (!el) return false
  return (
    el.classList.contains('spacebar-ok') ||
    el.nodeName === 'TEXTAREA' ||
    el.nodeName === 'INPUT' ||
    el.getAttribute('type') === 'text'
  )
}

export default function useSelectionHotkeys(params: SelectionHotkeysParams) {
  // keep the latest callbacks in a ref so the listener never needs re-subscribing
  const ref = useRef(params)
  ref.current = params

  // Was the selection "blocked" (a modal / dialog open) at the moment Escape was pressed?
  // Set by the capture-phase listener in the effect below; read by the bubble handler.
  const escapeBlockedAtCapture = useRef(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const p = ref.current
      // Cmd/Ctrl+A selects all channels, overriding the browser's select-all (which would
      // otherwise highlight stray page text/graphics). Defer to native select-all while
      // typing in a field or when a modal is open (so text there still selects).
      if ((e.key === 'a' || e.key === 'A') && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        if (!typingTarget() && !p.isBlocked()) {
          e.preventDefault()
          p.onSelectAll()
        }
        return
      }
      // Cmd/Ctrl+S saves the current preset, overriding the browser's save-page dialog.
      // Always preventDefault (there's no useful native Cmd+S here); save unless a modal /
      // dialog is open. Fires even while editing the preset-name field — the natural place
      // to hit save — since the guard below (which bails on text inputs) is skipped here.
      if ((e.key === 's' || e.key === 'S') && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        if (!p.isBlocked()) p.onSavePreset()
        return
      }
      // Cmd/Ctrl+C copies the selected channels; Cmd/Ctrl+V pastes them. Both defer to the
      // native clipboard while typing in a field or when a modal is open, and only preempt
      // the browser when there's actually a selection to copy / clipboard content to paste.
      if ((e.key === 'c' || e.key === 'C') && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        if (!typingTarget() && !p.isBlocked() && p.anySelected()) {
          e.preventDefault()
          p.onCopy()
        }
        return
      }
      if ((e.key === 'v' || e.key === 'V') && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        if (!typingTarget() && !p.isBlocked() && p.canPaste()) {
          e.preventDefault()
          p.onPaste()
        }
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (typingTarget()) return
      switch (e.key) {
        case 'm':
        case 'M':
          if (p.anySelected()) {
            e.preventDefault()
            p.onMute()
          }
          break
        case 's':
        case 'S':
          if (p.anySelected()) {
            e.preventDefault()
            p.onSolo()
          }
          break
        case 'Delete':
        case 'Backspace':
          if (p.anySelected() && !p.isBlocked()) {
            e.preventDefault()
            p.onDelete()
          }
          break
        case 'i':
        case 'I':
          // open the instrument editor for the selection (first channel in order)
          if (p.anySelected() && !p.isBlocked()) {
            e.preventDefault()
            p.onOpenInstrument()
          }
          break
        case 'v':
        case 'V':
          // open the visualizer for the selection (first channel in order); plain v
          // only — Cmd/Ctrl+V (paste) is handled and returned from above
          if (p.anySelected() && !p.isBlocked()) {
            e.preventDefault()
            p.onOpenVisualizer()
          }
          break
        case 'Escape':
          // Use the capture-phase snapshot, not a fresh isBlocked() call: a Modal closing
          // on this same Escape flushes synchronously and clears its open-state before this
          // bubble handler runs, so isBlocked() would read false and wrongly deselect. (A
          // Dropdown / menu / dialog stops propagation on capture, so this never runs for
          // them.) Deselect only if nothing was open when Escape was pressed.
          if (p.anySelected() && !escapeBlockedAtCapture.current) {
            p.onDeselect()
          }
          break
        default:
      }
    }
    // Snapshot isBlocked() for Escape on the CAPTURE phase — before handleKeyDown (bubble)
    // runs. A Modal closes itself on Escape (bubble) and that state update flushes
    // synchronously, clearing its open-state mid-event; reading isBlocked() in the bubble
    // handler above would therefore miss it and deselect the channel. Capturing here freezes
    // the answer while the modal is still open. (Runs for every Escape but only reads state.)
    function captureEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') escapeBlockedAtCapture.current = ref.current.isBlocked()
    }
    document.addEventListener('keydown', captureEscape, true)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', captureEscape, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
