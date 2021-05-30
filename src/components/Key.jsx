import React, { useCallback } from 'react'
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
}) {
  const togglePitchClass = useCallback(
    (i) => {
      if (musicalKey[i] && playingPitchClass === i) {
        setPlayingPitchClass(null)
      }
      setKey((key) => {
        const keyCopy = key.slice()
        keyCopy[i] = !keyCopy[i]
        return keyCopy
      })
    },
    [musicalKey, playingPitchClass, setKey, setPlayingPitchClass]
  )

  return (
    <div
      className={classNames('key', className, {
        'piano-keys': pianoKeys,
        clock: !pianoKeys,
        'to-top': turningAxisKnob,
      })}>
      {!pianoKeys && <img className="pitch-class-labels no-select" src={pitchClassesCircle} alt="" />}
      {[...Array(12)].map((d, i) => (
        <div
          key={i}
          className={classNames('pitch-class', {
            'white-key': whiteKey(i),
            'black-key-left': blackKeyLeft(i),
            'black-key-right': blackKeyRight(i),
            selected: musicalKey[i],
            previewed: !pianoKeys && showKeyPreview && keyPreview[i],
            playing: playingPitchClass === i,
            mute,
          })}
          style={{
            transform: !pianoKeys ? `rotate(${i * 30}deg) translate(0px, -81px)` : null,
          }}
          onClick={() => togglePitchClass(i)}></div>
      ))}
      {pianoKeys &&
        [...Array(12)].map((d, i) => (
          <SelectedKey key={i} visible={showKeyPreview && keyPreview[i]} {...SELECTED_KEYS[i]} />
        ))}
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
}

function SelectedKey({ left, type, visible }) {
  if (type === 0) {
    return (
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
    )
  } else if (type === 1) {
    return (
      <svg
        style={{ left }}
        className={classNames('piano-key-selected', { visible })}
        width="16"
        height="38"
        xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="16" height="38" />
      </svg>
    )
  } else if (type === 2) {
    return (
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
    )
  } else if (type === 3) {
    return (
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
    )
  } else if (type === 4) {
    return (
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
    )
  } else if (type === 5) {
    return (
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
    )
  }
  return null
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
