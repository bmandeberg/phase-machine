import React from 'react'
import './AddChannel.scss'

interface AddChannelProps {
  addChannel: () => void
}

// A faint circular "+" button sitting beneath the last channel — the way to add a
// channel (channels are removed via each channel's "..." menu). The parent hides it
// at MAX_CHANNELS. The plus is an inline SVG using currentColor, so each theme only
// has to set the button's color/border (see the *-theme.scss files).
export default function AddChannel({ addChannel }: AddChannelProps) {
  return (
    <div className="add-channel-row">
      <button
        type="button"
        className="add-channel-button"
        onClick={addChannel}
        aria-label="Add channel"
        title="Add channel">
        <svg className="add-channel-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
