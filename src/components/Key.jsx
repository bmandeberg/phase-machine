import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './Key.scss'

const NUM_NOTES = 12

export default function Key({ musicalKey, setKey, playingPitchClass }) {
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
    <div className="key channel-module">
      {Array.from(Array(NUM_NOTES).keys()).map((i) => (
        <div
          key={i}
          className={classNames('pitch-class', {
            'white-key': whiteKey(i),
            selected: musicalKey[i],
            playing: playingPitchClass === i,
          })}
          onClick={() => togglePitchClass(i)}></div>
      ))}
    </div>
  )
}
Key.propTypes = {
  musicalKey: PropTypes.array,
  setKey: PropTypes.func,
  playingPitchClass: PropTypes.number,
}
