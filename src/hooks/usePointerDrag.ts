import React, { useCallback, useRef } from 'react'

// Shared pointer-drag wiring for the SVG effect graphs (EqGraph / MultibandGraph):
// press a handle to begin, then track the pointer on `window` until it's released or
// cancelled. Pointer (not mouse) events so a finger drag works on touch devices too —
// note the graph's HTML parent must set `touch-action: none` (Chrome ignores it on the
// SVG itself) or the browser claims the first touch-move as a scroll and fires
// pointercancel, ending the drag.
//
// `onMove` is kept in a ref so the window listeners stay stable across re-renders (the
// drag updates state every move, re-rendering the caller); the listener always runs the
// latest callback while the same function references are cleanly added and removed.
export default function usePointerDrag<T>(
  onMove: (e: PointerEvent, payload: T) => void,
  setGrabbing: (grabbing: boolean) => void
) {
  const dragRef = useRef<T | null>(null)
  const onMoveRef = useRef(onMove)
  onMoveRef.current = onMove

  const onDrag = useCallback((e: PointerEvent) => {
    if (dragRef.current !== null) onMoveRef.current(e, dragRef.current)
  }, [])

  const endDrag = useCallback(() => {
    dragRef.current = null
    setGrabbing(false)
    window.removeEventListener('pointermove', onDrag)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', endDrag)
  }, [onDrag, setGrabbing])

  return useCallback(
    (payload: T) => (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragRef.current = payload
      setGrabbing(true)
      window.addEventListener('pointermove', onDrag)
      window.addEventListener('pointerup', endDrag)
      window.addEventListener('pointercancel', endDrag)
    },
    [onDrag, endDrag, setGrabbing]
  )
}
