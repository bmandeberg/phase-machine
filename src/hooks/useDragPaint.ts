import { useEffect, useRef, useCallback } from 'react'

// Shared lifecycle for click-drag painting over toggle cells: mousedown applies
// the press to the first cell and records the state it ended up in (beginPaint);
// while the button is held, paintState() returns that value to paint across the
// cells the pointer enters, and null once the mouse is released anywhere — even
// outside the cells. Used by the MIDI matrices and the MIDI modal's output row;
// Sequencer and Piano hand-roll the same pattern and could adopt this.
export default function useDragPaint() {
  const dragging = useRef(false)
  const paintValue = useRef(false)

  useEffect(() => {
    const stopDragging = () => {
      dragging.current = false
    }
    window.addEventListener('mouseup', stopDragging)
    return () => window.removeEventListener('mouseup', stopDragging)
  }, [])

  const beginPaint = useCallback((lit: boolean) => {
    dragging.current = true
    paintValue.current = lit
  }, [])

  const paintState = useCallback(() => (dragging.current ? paintValue.current : null), [])

  return { beginPaint, paintState }
}
