import React, { useState, useRef, useEffect, useCallback } from 'react'

interface NumericInputProps {
  min?: number
  max?: number
  value: number
  onChange: (value: number) => void
}

// Press-and-hold on a stepper: fire once immediately, then after a short pause
// auto-repeat until release.
const HOLD_DELAY = 350 // ms held before auto-repeat kicks in
const HOLD_INTERVAL = 90 // ms between repeats while held (~11/sec)

// Drop-in replacement for the abandoned `react-numeric-input` (style={false},
// strict). Renders the same DOM structure it did — `.react-numeric-input`
// wrapper, an <input>, and two stepper <b><i/></b> elements (first = up,
// last = down) — so NumInput.scss and NumInput's preview-listener wiring
// (which reaches for `input` and `b` nodes) keep working unchanged.
export default function NumericInput({ min, max, value, onChange }: NumericInputProps) {
  const [text, setText] = useState(String(value))
  const focused = useRef(false)

  // Sync the displayed text when the value changes externally (presets,
  // steppers elsewhere) — but never while the user is mid-edit.
  useEffect(() => {
    if (!focused.current) setText(String(value))
  }, [value])

  const clamp = useCallback(
    (n: number) => Math.min(max != null ? max : Infinity, Math.max(min != null ? min : -Infinity, n)),
    [min, max]
  )

  // Clamp, reflect in the field, and emit if changed.
  const emit = useCallback(
    (n: number) => {
      const c = clamp(n)
      setText(String(c))
      if (c !== value) onChange(c)
    },
    [clamp, onChange, value]
  )

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      setText(raw)
      const n = parseInt(raw, 10)
      // Emit live only for in-range values; out-of-range/partial waits for blur.
      if (!Number.isNaN(n) && n >= (min != null ? min : -Infinity) && n <= (max != null ? max : Infinity)) {
        if (n !== value) onChange(n)
      }
    },
    [min, max, onChange, value]
  )

  const handleBlur = useCallback(() => {
    focused.current = false
    const n = parseInt(text, 10)
    if (Number.isNaN(n)) setText(String(value))
    else emit(n)
  }, [text, value, emit])

  const step = useCallback(
    (delta: number) => {
      const base = parseInt(text, 10)
      emit((Number.isNaN(base) ? value : base) + delta)
    },
    [text, value, emit]
  )

  // Auto-repeat has to call the LATEST `step` each tick (it closes over `text`, which
  // changes on every increment), so route repeats through a ref rather than capturing
  // `step` in the interval.
  const stepRef = useRef(step)
  stepRef.current = step
  const holdDelay = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdRepeat = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopRepeat = useCallback(() => {
    if (holdDelay.current) {
      clearTimeout(holdDelay.current)
      holdDelay.current = null
    }
    if (holdRepeat.current) {
      clearInterval(holdRepeat.current)
      holdRepeat.current = null
    }
  }, [])

  const startRepeat = useCallback(
    (delta: number) => {
      stopRepeat() // guard against a stuck prior hold
      stepRef.current(delta) // one immediate step (a plain click stops before the delay)
      holdDelay.current = setTimeout(() => {
        holdRepeat.current = setInterval(() => stepRef.current(delta), HOLD_INTERVAL)
      }, HOLD_DELAY)
    },
    [stopRepeat]
  )

  useEffect(() => stopRepeat, [stopRepeat]) // clear timers on unmount

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleBlur()
      else if (e.key === 'ArrowUp') {
        e.preventDefault()
        step(1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        step(-1)
      }
    },
    [handleBlur, step]
  )

  return (
    <span className="react-numeric-input">
      <input
        type="text"
        value={text}
        onFocus={() => (focused.current = true)}
        onChange={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {/* Pointer events unify mouse/touch; capture guarantees we see the release even if
          the pointer drifts off the button. Down = start (immediate + hold-repeat). */}
      <b
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          startRepeat(1)
        }}
        onPointerUp={stopRepeat}
        onPointerCancel={stopRepeat}>
        <i />
      </b>
      <b
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          startRepeat(-1)
        }}
        onPointerUp={stopRepeat}
        onPointerCancel={stopRepeat}>
        <i />
      </b>
    </span>
  )
}
