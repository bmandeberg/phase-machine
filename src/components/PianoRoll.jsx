import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { whiteKey, OCTAVES } from '../globals'
import './PianoRoll.scss'

function noteToPx(note, after) {
  let px = 0
  const i = note % 12
  const keyWidth = {
    white: 13,
    black: 8,
  }
  let afterPx = keyWidth.white
  if (i <= 4) {
    if (i % 2 === 0) {
      px = (i / 2) * keyWidth.white
    } else {
      afterPx = keyWidth.black
      px = keyWidth.white - keyWidth.black / 2 + keyWidth.white * Math.floor(i / 2)
    }
  } else {
    if (i % 2 === 0) {
      afterPx = keyWidth.black
      px = keyWidth.white * 4 - keyWidth.black / 2 + keyWidth.white * ((i - 6) / 2)
    } else {
      px = ((i - 5) / 2 + 3) * keyWidth.white
    }
  }
  px += Math.floor(note / 12) * keyWidth.white * 7
  if (after) {
    px += afterPx
  }
  return px
}

export default function PianoRoll({ playingNote, rangeStart, setRangeStart, rangeEnd, setRangeEnd }) {
  const pxStart = useMemo(() => noteToPx(rangeStart, false), [rangeStart])
  const pxEnd = useMemo(() => noteToPx(rangeEnd - 1, true), [rangeEnd])

  return (
    <div className="piano-roll channel-module">
      {[...Array(12 * OCTAVES)].map((d, i) => (
        <div
          key={i}
          className={classNames('piano-roll-note', {
            'white-key': whiteKey(i),
            'in-range': i >= rangeStart && i < rangeEnd,
            playing: playingNote === i,
          })}></div>
      ))}
      <div style={{ left: pxStart - 2, width: pxEnd - pxStart - 2 }} className="piano-roll-range"></div>
    </div>
  )
}
PianoRoll.propTypes = {
  playingNote: PropTypes.number,
  rangeStart: PropTypes.number,
  setRangeStart: PropTypes.func,
  rangeEnd: PropTypes.number,
  setRangeEnd: PropTypes.func,
}
