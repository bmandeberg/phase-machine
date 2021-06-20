import React, { useState, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { whiteKey, blackKeyLeft, blackKeyRight, nextBlackKey, prevBlackKey, OCTAVES, constrain } from '../globals'
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
  mute,
  rangeMode,
  keybdPitches,
  setKeybdPitches,
  theme,
}) {
  const [changingRange, setChangingRange] = useState(false)
  const [rangeStartReference, setRangeStartReference] = useState(rangeStart)
  const [rangeEndReference, setRangeEndReference] = useState(rangeEnd)
  const pxStart = useMemo(() => noteToPx(rangeStart, false), [rangeStart])
  const pxEnd = useMemo(() => noteToPx(rangeEnd - 1, true), [rangeEnd])

  useEffect(() => {
    if (!changingRange) {
      setRangeStartReference(rangeStart)
      setRangeEndReference(rangeEnd)
    }
  }, [rangeStart, rangeEnd, changingRange])

  const dragRangeLeft = useGesture({
    onDrag: ({ movement: [mx, my] }) => {
      setRangeStart(constrain(rangeStartReference + keyOffset(mx), 0, rangeEnd - 1))
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
      setRangeEnd(constrain(rangeEndReference + keyOffset(mx), rangeStart + 1, OCTAVES * 12))
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
            'next-black-key-near': nextBlackKey.near(i),
            'next-black-key-middle': nextBlackKey.middle(i),
            'next-black-key-far': nextBlackKey.far(i),
            'prev-black-key-near': prevBlackKey.near(i),
            'prev-black-key-middle': prevBlackKey.middle(i),
            'prev-black-key-far': prevBlackKey.far(i),
            'black-key-left': blackKeyLeft(i),
            'black-key-right': blackKeyRight(i),
            'in-range': !mute && (!rangeMode || (i >= rangeStart && i < rangeEnd)),
            selected: !rangeMode && keybdPitches.includes(i),
            interactive: !rangeMode,
            playing: noteOn && playingNote === i,
          })}></div>
      ))}
      {rangeMode && (
        <svg
          style={{ left: pxStart.px - 2 }}
          className="piano-range"
          width={pxEnd.px - pxStart.px + 2}
          height="99"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d={`${noteLeftBoundary(pxStart.boundaryType, 1, CHANNEL_HEIGHT)} ${noteRightBoundary(
              pxEnd.boundaryType,
              pxEnd.px - pxStart.px + 1
            )}`}
          />
        </svg>
      )}
      {rangeMode && (
        <div
          {...dragRangeLeft()}
          style={{ left: pxStart.px - 6, width: pxStart.boundaryType ? 14 : 10 }}
          className="range-resize"></div>
      )}
      {rangeMode && (
        <div
          {...dragRange()}
          style={{
            left: pxStart.px + (pxStart.boundaryType ? 8 : 4),
            width: pxEnd.px - pxStart.px - 10 - (pxStart.boundaryType ? 4 : 0) - (pxEnd.boundaryType ? 4 : 0),
          }}
          className={classNames('range-drag', { grabbing, resizing })}></div>
      )}
      {rangeMode && (
        <div
          {...dragRangeRight()}
          style={{ left: pxEnd.px - (pxEnd.boundaryType ? 10 : 6), width: pxEnd.boundaryType ? 14 : 10 }}
          className="range-resize"></div>
      )}
      {rangeMode && (
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
            d={`${noteLeftBoundary(pxStart.boundaryType, 1, CHANNEL_HEIGHT)} ${noteRightBoundary(
              pxEnd.boundaryType,
              pxEnd.px - pxStart.px + 1
            )}`}
          />
        </svg>
      )}
      {(mute || (theme === 'light' && !rangeMode)) && (
        <div className={classNames('piano-border', { 'dark-border': !rangeMode })}></div>
      )}
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
  mute: PropTypes.bool,
  rangeMode: PropTypes.bool,
  keybdPitches: PropTypes.array,
  setKeybdPitches: PropTypes.func,
  theme: PropTypes.string,
}

function noteLeftBoundary(boundaryType, x, height) {
  switch (boundaryType) {
    case 0:
      return `M${x} 1 V ${height}`
    case 1:
      return `M${x} 1 V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / 2} V ${height}`
    case 2:
      return `M${x + BLACK_KEY_WIDTH / 2} 1 V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / -2} V ${height}`
    case 3:
      return `M${x} 1 V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / 2 + 1} V ${height}`
    case 4:
      return `M${x + BLACK_KEY_WIDTH / 2 - 1} 1 V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / -2 + 1} V ${height}`
    case 5:
      return `M${x} 1 V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / 2 - 1} V ${height}`
    case 6:
      return `M${x + BLACK_KEY_WIDTH / 2 + 1} 1 V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / -2 - 1} V ${height}`
    default:
      return ''
  }
}

function noteRightBoundary(boundaryType, x) {
  switch (boundaryType) {
    case 0:
      return ` H ${x} V 1 Z`
    case 1:
      return ` H ${x} V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / -2} V 1 Z`
    case 2:
      return ` H ${x - BLACK_KEY_WIDTH / 2} V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / 2} V 1 Z`
    case 3:
      return ` H ${x - BLACK_KEY_WIDTH / 2 + 1} V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / 2 - 1} V 1 Z`
    case 4:
      return ` H ${x} V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / -2 + 1} V 1 Z`
    case 5:
      return ` H ${x - BLACK_KEY_WIDTH / 2 - 1} V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / 2 + 1} V 1 Z`
    case 6:
      return ` H ${x} V ${BLACK_KEY_HEIGHT} h ${BLACK_KEY_WIDTH / -2 - 1} V 1 Z`
    default:
      return ''
  }
}

function noteToPx(note, after) {
  let px = 0
  let boundaryType = 0
  const i = note % 12
  let afterPx = WHITE_KEY_WIDTH
  if (i === 0 || i === 5) {
    boundaryType = after ? 6 : 0
    if (i === 5) {
      px = WHITE_KEY_WIDTH * 3
    }
  } else if (i === 1 || i === 6) {
    boundaryType = 3
    afterPx = BLACK_KEY_WIDTH
    px = WHITE_KEY_WIDTH * (i === 1 ? 1 : 4) - BLACK_KEY_WIDTH / 2 - 1
  } else if (i === 2) {
    boundaryType = 4
    px = WHITE_KEY_WIDTH
  } else if (i === 3 || i === 10) {
    boundaryType = 5
    afterPx = BLACK_KEY_WIDTH
    px = WHITE_KEY_WIDTH * (i === 3 ? 2 : 6) - BLACK_KEY_WIDTH / 2 + 1
  } else if (i === 4 || i === 11) {
    boundaryType = after ? 0 : 6
    px = WHITE_KEY_WIDTH * (i === 4 ? 2 : 6)
  } else if (i === 7) {
    boundaryType = after ? 1 : 4
    px = WHITE_KEY_WIDTH * 4
  } else if (i === 8) {
    boundaryType = after ? 2 : 1
    afterPx = BLACK_KEY_WIDTH
    px = WHITE_KEY_WIDTH * 5 - BLACK_KEY_WIDTH / 2
  } else if (i === 9) {
    boundaryType = after ? 4 : 2
    px = WHITE_KEY_WIDTH * 5
  }
  px += Math.floor(note / 12) * WHITE_KEY_WIDTH * 7
  if (after) {
    px += afterPx
  }
  return { px, boundaryType }
}

function keyOffset(x) {
  return Math.round(x / ((WHITE_KEY_WIDTH * 7) / 12))
}
