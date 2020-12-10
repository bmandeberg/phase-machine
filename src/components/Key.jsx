import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import pitchClassesCircle from '../assets/pitch-classes-circle.svg'
import classNames from 'classnames'
import './Key.scss'

export default function Key({
  musicalKey,
  setKey,
  playingPitchClass,
  className,
  pianoKeys,
  turningAxisKnob,
  keyPreview,
  showKeyPreview,
}) {
  const whiteKey = useCallback((i) => {
    if (i <= 4) {
      return i % 2 === 0
    } else {
      return i % 2 !== 0
    }
  }, [])

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
            selected: musicalKey[i],
            previewed: !pianoKeys && showKeyPreview && keyPreview[i],
            playing: playingPitchClass === i,
          })}
          style={{
            transform: !pianoKeys ? `rotate(${i * 30}deg) translate(0px, -81px)` : null,
          }}
          onClick={() => togglePitchClass(i)}></div>
      ))}
      {pianoKeys &&
        [...Array(12)].map((d, i) => <SelectedKey visible={showKeyPreview && keyPreview[i]} {...SELECTED_KEYS[i]} />)}
    </div>
  )
}
Key.propTypes = {
  musicalKey: PropTypes.array,
  setKey: PropTypes.func,
  playingPitchClass: PropTypes.number,
  pianoKeys: PropTypes.bool,
  className: PropTypes.string,
  turningAxisKnob: PropTypes.bool,
  keyPreview: PropTypes.array,
  showKeyPreview: PropTypes.bool,
}

function SelectedKey({ left, type, visible }) {
  if (!visible) {
    return null
  }
  if (type === 0) {
    return (
      <svg style={{ left }} className="piano-key-selected" width="23" height="64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="key-1-clip">
            <path d="M0 0 V 64 H 23 v -24 h -9 V 0 Z" />
          </clipPath>
        </defs>
        <path d="M0 0 V 64 H 23 v -24 h -9 V 0 Z" clip-path="url(#key-1-clip)" />
      </svg>
    )
  } else if (type === 1) {
    return (
      <svg style={{ left }} className="piano-key-selected" width="16" height="38" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="16" height="38" />
      </svg>
    )
  } else if (type === 2) {
    return (
      <svg style={{ left }} className="piano-key-selected" width="23" height="64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="key-3-clip">
            <path d="M0 40 V 64 H 23 V 40 H 14 V 0 H 9 V 40 Z" />
          </clipPath>
        </defs>
        <path d="M0 40 V 64 H 23 V 40 H 14 V 0 H 9 V 40 Z" clip-path="url(#key-3-clip)" />
      </svg>
    )
  } else if (type === 3) {
    return (
      <svg style={{ left }} className="piano-key-selected" width="23" height="64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="key-4-clip">
            <path d="M0 40 V 64 H 23 V 0 H 9 V 40 Z" />
          </clipPath>
        </defs>
        <path d="M0 40 V 64 H 23 V 0 H 9 V 40 Z" clip-path="url(#key-4-clip)" />
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
    left: 18,
    type: 1,
  },
  {
    left: 27,
    type: 2,
  },
  {
    left: 43,
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
    left: 93,
    type: 1,
  },
  {
    left: 102,
    type: 2,
  },
  {
    left: 118,
    type: 1,
  },
  {
    left: 127,
    type: 2,
  },
  {
    left: 143,
    type: 1,
  },
  {
    left: 152,
    type: 3,
  },
]
