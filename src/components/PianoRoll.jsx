import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { whiteKey, OCTAVES } from '../globals'
import './PianoRoll.scss'

const CHANNEL_HEIGHT = 98
const BLACK_KEY_HEIGHT = 58
const BLACK_KEY_WIDTH = 8
const WHITE_KEY_WIDTH = 13

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
      <svg
        style={{ left: pxStart.px - 2 }}
        className="piano-roll-range"
        width={pxEnd.px - pxStart.px + 2}
        height="99"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d={`${noteLeftBoundary(pxStart.boundary, 1, CHANNEL_HEIGHT)} ${noteRightBoundary(
            pxEnd.boundary,
            pxEnd.px - pxStart.px + 1
          )}`}
        />
      </svg>
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

function noteLeftBoundary(i, x, height) {
  switch (i) {
    case 0:
      return `M${x} 1 V ${height}`
    case 1:
      return `M${x} 1 V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / 2} V ${height}`
    case 2:
      return `M${x + BLACK_KEY_WIDTH / 2} 1 V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / -2} V ${height}`
  }
}

function noteRightBoundary(i, x) {
  switch (i) {
    case 0:
      return ` H ${x} V 1 Z`
    case 1:
      return ` H ${x} V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / -2} V 1 Z`
    case 2:
      return ` H ${x - BLACK_KEY_WIDTH / 2} V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / 2} V 1 Z`
  }
}

function noteToPx(note, after) {
  let px = 0
  let boundary = 0
  const i = note % 12
  let afterPx = WHITE_KEY_WIDTH
  if (i <= 4) {
    if (!after && i > 0) {
      boundary = i < 3 ? i : i - 2
    } else if (after && i < 4) {
      boundary = i % 2 === 0 ? 1 : 2
    }
    if (i % 2 === 0) {
      px = (i / 2) * WHITE_KEY_WIDTH
    } else {
      afterPx = BLACK_KEY_WIDTH
      px = WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2 + WHITE_KEY_WIDTH * Math.floor(i / 2)
    }
  } else {
    if (!after && i > 5) {
      boundary = i % 2 === 0 ? 1 : 2
    } else if (after && i < 11) {
      boundary = i % 2 === 0 ? 2 : 1
    }
    if (i % 2 === 0) {
      afterPx = BLACK_KEY_WIDTH
      px = WHITE_KEY_WIDTH * 4 - BLACK_KEY_WIDTH / 2 + WHITE_KEY_WIDTH * ((i - 6) / 2)
    } else {
      px = ((i - 5) / 2 + 3) * WHITE_KEY_WIDTH
    }
  }
  px += Math.floor(note / 12) * WHITE_KEY_WIDTH * 7
  if (after) {
    px += afterPx
  }
  return { px, boundary }
}
