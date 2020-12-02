import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './MuteSolo.scss'

export default function MuteSolo({ mute, setMute, solo, setSolo, setNumChannelsSoloed }) {
  const toggleMute = useCallback(() => {
    setMute((mute) => !mute)
  }, [setMute])

  const toggleSolo = useCallback(() => {
    const increment = solo ? -1 : 1
    setNumChannelsSoloed((numChannelsSoloed) => numChannelsSoloed + increment)
    setSolo((solo) => !solo)
  }, [solo, setSolo, setNumChannelsSoloed])

  return (
    <div className="mute-solo channel-module">
      <div className={classNames('button no-select mute', { muted: mute })} onClick={toggleMute}>
        M
      </div>
      <div className={classNames('button no-select solo', { soloed: solo })} onClick={toggleSolo}>
        S
      </div>
    </div>
  )
}
MuteSolo.propTypes = {
  mute: PropTypes.bool,
  setMute: PropTypes.func,
  solo: PropTypes.bool,
  setSolo: PropTypes.func,
  setNumChannelsSoloed: PropTypes.func,
}
