import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './MuteSolo.scss'

export default function MuteSolo({ mute, setMute, solo, setSolo }) {
  const toggleMute = useCallback(() => {
    setMute((mute) => !mute)
  }, [setMute])

  const toggleSolo = useCallback(() => {
    setSolo((solo) => !solo)
  }, [setSolo])

  return (
    <div className="mute-solo channel-module">
      <div className={classNames('button mute', { muted: mute })} onClick={toggleMute}>M</div>
      <div className={classNames('button solo', { soloed: solo })} onClick={toggleSolo}>S</div>
    </div>
  )
}
MuteSolo.propTypes = {
  mute: PropTypes.bool,
  setMute: PropTypes.func,
  solo: PropTypes.bool,
  setSolo: PropTypes.func,
}
