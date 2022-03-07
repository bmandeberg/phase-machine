import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { whiteKey, blackKeyLeft, blackKeyRight } from '../globals'
import pitchClassesCircle from '../assets/pitch-classes-circle.svg'
import classNames from 'classnames'
import './Key.scss'

export default function Key({
  musicalKey,
  setKey,
  playingPitchClass,
  setPlayingPitchClass,
  className,
  pianoKeys,
  turningAxisKnob,
  keyPreview,
  showKeyPreview,
  mute,
  rangeMode,
}) {
  const togglePitchClass = useCallback(
    (i) => {
      setKey((key) => {
        const keyCopy = key.slice()
        keyCopy[i] = !keyCopy[i]
        return keyCopy
      })
    },
    [setKey]
  )

  const selectedKeyVisible = useCallback((i) => showKeyPreview && keyPreview[i], [keyPreview, showKeyPreview])

  const pitchClasses = useMemo(
    () =>
      [...Array(12)].map((d, i) => (
        <div
          key={i}
          className={classNames('pitch-class', {
            'white-key': whiteKey(i),
            'black-key-left': blackKeyLeft(i),
            'black-key-right': blackKeyRight(i),
            selected: musicalKey[i],
            previewed: !pianoKeys && showKeyPreview && keyPreview[i],
            playing: playingPitchClass === i && musicalKey[i],
            'ghost-playing': playingPitchClass === i && !musicalKey[i],
            mute,
            'no-pointer-events': !rangeMode,
          })}
          style={{
            transform: !pianoKeys ? `rotate(${i * 30}deg) translate(0px, -81px)` : null,
          }}
          onClick={() => togglePitchClass(i)}></div>
      )),
    [keyPreview, musicalKey, mute, pianoKeys, playingPitchClass, rangeMode, showKeyPreview, togglePitchClass]
  )

  const selectedKeys = useMemo(
    () => [...Array(12)].map((d, i) => <SelectedKey key={i} visible={selectedKeyVisible(i)} {...SELECTED_KEYS[i]} />),
    [selectedKeyVisible]
  )

  const pitchClassLabels = useMemo(
    () => <img className="pitch-class-labels no-select" src={pitchClassesCircle} alt="" />,
    []
  )

  return (
    <div
      className={classNames('key', className, {
        'piano-keys': pianoKeys,
        clock: !pianoKeys,
        'to-top': turningAxisKnob,
      })}>
      {!pianoKeys && pitchClassLabels}
      {pitchClasses}
      {pianoKeys && selectedKeys}
    </div>
  )
}
Key.propTypes = {
  musicalKey: PropTypes.array,
  setKey: PropTypes.func,
  playingPitchClass: PropTypes.number,
  setPlayingPitchClass: PropTypes.func,
  pianoKeys: PropTypes.bool,
  className: PropTypes.string,
  turningAxisKnob: PropTypes.bool,
  keyPreview: PropTypes.array,
  showKeyPreview: PropTypes.bool,
  mute: PropTypes.bool,
  rangeMode: PropTypes.bool,
}

function SelectedKey({ left, type, visible }) {
  const type0 = useMemo(
    () => (
      <svg
        style={{ left }}
        className={classNames('piano-key-selected', { visible })}
        width="23"
        height="64"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="key-1-clip">
            <path d="M0 0 V 64 H 23 v -24 h -11 V 0 Z" />
          </clipPath>
        </defs>
        <path d="M0 0 V 64 H 23 v -24 h -11 V 0 Z" clipPath="url(#key-1-clip)" />
      </svg>
    ),
    [left, visible]
  )
  const type1 = useMemo(
    () => (
      <svg
        style={{ left }}
        className={classNames('piano-key-selected', { visible })}
        width="16"
        height="38"
        xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="16" height="38" />
      </svg>
    ),
    [left, visible]
  )
  const type2 = useMemo(
    () => (
      <svg
        style={{ left }}
        className={classNames('piano-key-selected', { visible })}
        width="23"
        height="64"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="key-3-clip">
            <path d="M0 40 V 64 H 23 V 40 H 16 V 0 H 7 V 40 Z" />
          </clipPath>
        </defs>
        <path d="M0 40 V 64 H 23 V 40 H 16 V 0 H 7 V 40 Z" clipPath="url(#key-3-clip)" />
      </svg>
    ),
    [left, visible]
  )
  const type3 = useMemo(
    () => (
      <svg
        style={{ left }}
        className={classNames('piano-key-selected', { visible })}
        width="23"
        height="64"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="key-4-clip">
            <path d="M0 40 V 64 H 23 V 0 H 11 V 40 Z" />
          </clipPath>
        </defs>
        <path d="M0 40 V 64 H 23 V 0 H 11 V 40 Z" clipPath="url(#key-4-clip)" />
      </svg>
    ),
    [left, visible]
  )
  const type4 = useMemo(
    () => (
      <svg
        style={{ left }}
        className={classNames('piano-key-selected', { visible })}
        width="23"
        height="64"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="key-5-clip">
            <path d="M0 40 V 64 H 23 V 40 H 14 V 0 H 7 V 40 Z" />
          </clipPath>
        </defs>
        <path d="M0 40 V 64 H 23 V 40 H 14 V 0 H 7 V 40 Z" clipPath="url(#key-5-clip)" />
      </svg>
    ),
    [left, visible]
  )
  const type5 = useMemo(
    () => (
      <svg
        style={{ left }}
        className={classNames('piano-key-selected', { visible })}
        width="23"
        height="64"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="key-6-clip">
            <path d="M0 40 V 64 H 23 V 40 H 16 V 0 H 9 V 40 Z" />
          </clipPath>
        </defs>
        <path d="M0 40 V 64 H 23 V 40 H 16 V 0 H 9 V 40 Z" clipPath="url(#key-6-clip)" />
      </svg>
    ),
    [left, visible]
  )

  switch (type) {
    case 0:
      return type0
    case 1:
      return type1
    case 2:
      return type2
    case 3:
      return type3
    case 4:
      return type4
    case 5:
      return type5
    default:
      return null
  }
}
SelectedKey.propTypes = {
  left: PropTypes.number,
  type: PropTypes.number,
  visible: PropTypes.bool,
}

const SELECTED_KEYS = [
  {
    left: 2,
    type: 0,
  },
  {
    left: 16,
    type: 1,
  },
  {
    left: 27,
    type: 2,
  },
  {
    left: 45,
    type: 1,
  },
  {
    left: 52,
    type: 3,
  },
  {
    left: 77,
    type: 0,
  },
  {
    left: 91,
    type: 1,
  },
  {
    left: 102,
    type: 4,
  },
  {
    left: 118,
    type: 1,
  },
  {
    left: 127,
    type: 5,
  },
  {
    left: 145,
    type: 1,
  },
  {
    left: 152,
    type: 3,
  },
]
