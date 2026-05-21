import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

// Drop-in replacement for the abandoned `react-numeric-input` (style={false},
// strict). Renders the same DOM structure it did — `.react-numeric-input`
// wrapper, an <input>, and two stepper <b><i/></b> elements (first = up,
// last = down) — so NumInput.scss and NumInput's preview-listener wiring
// (which reaches for `input` and `b` nodes) keep working unchanged.
export default function NumericInput({ min, max, value, onChange }) {
  const [text, setText] = useState(String(value))
  const focused = useRef(false)

  // Sync the displayed text when the value changes externally (presets,
  // steppers elsewhere) — but never while the user is mid-edit.
  useEffect(() => {
    if (!focused.current) setText(String(value))
  }, [value])

  const clamp = useCallback(
    (n) => Math.min(max != null ? max : Infinity, Math.max(min != null ? min : -Infinity, n)),
    [min, max]
  )

  // Clamp, reflect in the field, and emit if changed.
  const emit = useCallback(
    (n) => {
      const c = clamp(n)
      setText(String(c))
      if (c !== value) onChange(c)
    },
    [clamp, onChange, value]
  )

  const handleInput = useCallback(
    (e) => {
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
    (delta) => {
      const base = parseInt(text, 10)
      emit((Number.isNaN(base) ? value : base) + delta)
    },
    [text, value, emit]
  )

  const handleKeyDown = useCallback(
    (e) => {
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
      <b onClick={() => step(1)}>
        <i />
      </b>
      <b onClick={() => step(-1)}>
        <i />
      </b>
    </span>
  )
}
NumericInput.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func,
}
