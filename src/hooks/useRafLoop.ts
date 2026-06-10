import { useRef, useEffect } from 'react'

// Run `callback` on every animation frame while the component is mounted, cancelling
// the loop on unmount. The latest callback is always invoked (kept in a ref), so it
// reads fresh props/state each frame without restarting the loop. Used by the meter
// overlays (VU meter, multiband GR bars, EQ spectrum) so the rAF lifecycle — and the
// guarantee that it stops the moment the panel unmounts — lives in one place.
export default function useRafLoop(callback: () => void) {
  const cb = useRef(callback)
  cb.current = callback
  useEffect(() => {
    let raf = 0
    const tick = () => {
      cb.current()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
}
