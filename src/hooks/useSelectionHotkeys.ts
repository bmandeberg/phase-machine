import { useEffect, useRef } from 'react'

// Global hotkeys that act on the selected channels:
//   m / s   → mute / solo the selection (unified — see App's handler)
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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (typingTarget()) return
      const p = ref.current
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
        case 'Escape':
          if (p.anySelected() && !p.isBlocked()) {
            p.onDeselect()
          }
          break
        default:
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
