import React, { useState, useRef, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import { INSTRUMENT_TYPES } from '../globals'
import plusIcon from '../assets/plus-icon-green.png'
import trashIcon from '../assets/trash-icon-red.png'
import './ChannelButtons.scss'

interface ChannelButtonsProps {
  id: string
  instrumentType: string
  theme: string
  mute?: boolean
  openInstrumentModal: () => void
  duplicateChannel: (id: string) => void
  deleteChannel: (id: string) => void
}

// The buttons at the start of a channel: the channel's instrument icon (opens the
// instrument modal) stacked above a "..." button that opens a little menu with
// Duplicate / Delete actions.
export default function ChannelButtons({
  id,
  instrumentType,
  theme,
  mute,
  openInstrumentModal,
  duplicateChannel,
  deleteChannel,
}: ChannelButtonsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // close the menu on a click/touch outside of these buttons, or on Escape
  useEffect(() => {
    if (!menuOpen) return
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), [])
  const duplicate = useCallback(() => {
    duplicateChannel(id)
    setMenuOpen(false)
  }, [duplicateChannel, id])
  const trash = useCallback(() => {
    deleteChannel(id)
    setMenuOpen(false)
  }, [deleteChannel, id])

  const instrumentIcon = INSTRUMENT_TYPES[instrumentType]?.(theme) ?? INSTRUMENT_TYPES.synth(theme)

  return (
    <div ref={containerRef} className={classNames('channel-buttons', { mute })}>
      <div className="channel-instrument-button" onClick={openInstrumentModal} title="Edit instrument">
        {instrumentIcon}
      </div>
      <div
        className={classNames('channel-menu-button', { open: menuOpen })}
        onClick={toggleMenu}
        title="Channel options">
        <span></span>
        <span></span>
        <span></span>
      </div>
      {menuOpen && (
        <div className="channel-menu">
          <div className="channel-menu-item" onClick={duplicate}>
            <img className="channel-menu-icon" src={plusIcon} alt="" draggable="false" />
            <span>Duplicate Channel</span>
          </div>
          <div className="channel-menu-item" onClick={trash}>
            <img className="channel-menu-icon" src={trashIcon} alt="" draggable="false" />
            <span>Delete Channel</span>
          </div>
        </div>
      )}
    </div>
  )
}
