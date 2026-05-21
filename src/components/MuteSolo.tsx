import React, { useCallback } from 'react'
import classNames from 'classnames'
import './MuteSolo.scss'

interface MuteSoloProps {
  mute?: boolean
  setMute: React.Dispatch<React.SetStateAction<boolean>>
  solo?: boolean
  setSolo: React.Dispatch<React.SetStateAction<boolean>>
}

export default function MuteSolo({ mute, setMute, solo, setSolo }: MuteSoloProps) {
  const toggleMute = useCallback(() => {
    setMute((mute) => !mute)
  }, [setMute])

  const toggleSolo = useCallback(() => {
    setSolo((solo) => !solo)
  }, [setSolo])

  return (
    <div className="mute-solo">
      <div className={classNames('button no-select mute', { muted: mute })} onClick={toggleMute}>
        M
      </div>
      <div className={classNames('button no-select solo', { soloed: solo })} onClick={toggleSolo}>
        S
      </div>
    </div>
  )
}
