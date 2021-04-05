import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { whiteKey, OCTAVES, constrain } from '../globals'
import { useGesture } from 'react-use-gesture'
import './Piano.scss'

const CHANNEL_HEIGHT = 98
const BLACK_KEY_HEIGHT = 58
const BLACK_KEY_WIDTH = 8
const WHITE_KEY_WIDTH = 13

export default function Piano({
  playingNote,
  rangeStart,
  setRangeStart,
  rangeEnd,
  setRangeEnd,
  grabbing,
  setGrabbing,
  resizing,
  setResizing,
  noteOn,
}) {
  const [changingRange, setChangingRange] = useState(false)
  const [rangeStartReference, setRangeStartReference] = useState(rangeStart)
  const [rangeEndReference, setRangeEndReference] = useState(rangeEnd)
  const pxStart = useMemo(() => noteToPx(rangeStart, false), [rangeStart])
  const pxEnd = useMemo(() => noteToPx(rangeEnd - 1, true), [rangeEnd])

  const dragRangeLeft = useGesture({
    onDrag: ({ movement: [mx, my] }) => {
      const newRangeStart = constrain(rangeStartReference + keyOffset(mx), 0, rangeEnd - 1)
      if (newRangeStart !== rangeStart) {
        setRangeStart(newRangeStart)
      }
    },
    onDragStart: () => {
      setResizing(true)
      setChangingRange(true)
    },
    onDragEnd: () => {
      setRangeStartReference(rangeStart)
      setResizing(false)
      setChangingRange(false)
    },
  })

  const dragRangeRight = useGesture({
    onDrag: ({ movement: [mx, my] }) => {
      const newRangeEnd = constrain(rangeEndReference + keyOffset(mx), rangeStart + 1, OCTAVES * 12)
      if (newRangeEnd !== rangeEnd) {
        setRangeEnd(newRangeEnd)
      }
    },
    onDragStart: () => {
      setResizing(true)
      setChangingRange(true)
    },
    onDragEnd: () => {
      setRangeEndReference(rangeEnd)
      setResizing(false)
      setChangingRange(false)
    },
  })

  const dragRange = useGesture({
    onDrag: ({ movement: [mx, my] }) => {
      const offset = constrain(keyOffset(mx), -rangeStartReference, OCTAVES * 12 - rangeEndReference)
      const newRangeStart = rangeStartReference + offset
      const newRangeEnd = rangeEndReference + offset
      if (newRangeStart !== rangeStart) {
        setRangeStart(newRangeStart)
        setRangeEnd(newRangeEnd)
      }
    },
    onDragStart: () => {
      setGrabbing(true)
      setChangingRange(true)
    },
    onDragEnd: () => {
      setRangeStartReference(rangeStart)
      setRangeEndReference(rangeEnd)
      setGrabbing(false)
      setChangingRange(false)
    },
  })

  return (
    <div className="piano channel-module">
      {[...Array(12 * OCTAVES)].map((d, i) => (
        <div
          key={i}
          className={classNames('piano-note', {
            'white-key': whiteKey(i),
            'skip-black-key': whiteKey(i + 1),
            'in-range': i >= rangeStart && i < rangeEnd,
            playing: noteOn && playingNote === i,
          })}></div>
      ))}
      <svg
        style={{ left: pxStart.px - 2 }}
        className="piano-range"
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
      <div
        {...dragRangeLeft()}
        style={{ left: pxStart.px - 6, width: pxStart.boundary ? 14 : 10 }}
        className="range-resize"></div>
      <div
        {...dragRange()}
        style={{
          left: pxStart.px + (pxStart.boundary ? 8 : 4),
          width: pxEnd.px - pxStart.px - 10 - (pxStart.boundary ? 4 : 0) - (pxEnd.boundary ? 4 : 0),
        }}
        className={classNames('range-drag', { grabbing, resizing })}></div>
      <div
        {...dragRangeRight()}
        style={{ left: pxEnd.px - (pxEnd.boundary ? 10 : 6), width: pxEnd.boundary ? 14 : 10 }}
        className="range-resize"></div>
      <svg
        style={{ left: pxStart.px - 2 }}
        className={classNames('piano-range piano-range-glow', { 'show-range-glow': changingRange })}
        width={pxEnd.px - pxStart.px + 2}
        height="99"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow">
            <feGaussianBlur id="blur" result="coloredBlur" stdDeviation="4"></feGaussianBlur>
            <feMerge>
              <feMergeNode in="coloredBlur"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
          </filter>
        </defs>
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
Piano.propTypes = {
  playingNote: PropTypes.number,
  rangeStart: PropTypes.number,
  setRangeStart: PropTypes.func,
  rangeEnd: PropTypes.number,
  setRangeEnd: PropTypes.func,
  grabbing: PropTypes.bool,
  setGrabbing: PropTypes.func,
  resizing: PropTypes.bool,
  setResizing: PropTypes.func,
  noteOn: PropTypes.bool,
}

function noteLeftBoundary(i, x, height) {
  switch (i) {
    case 0:
      return `M${x} 1 V ${height}`
    case 1:
      return `M${x} 1 V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / 2} V ${height}`
    case 2:
      return `M${x + BLACK_KEY_WIDTH / 2} 1 V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / -2} V ${height}`
    default:
      return ''
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
    default:
      return ''
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

function keyOffset(x) {
  return Math.round(x / ((WHITE_KEY_WIDTH * 7) / 12))
}
