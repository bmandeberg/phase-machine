import React, { useState } from 'react'
import classNames from 'classnames'

interface VizCardProps {
  title: string
  // a one-line qualifier shown next to the title (e.g. the window being analyzed)
  subtitle?: string
  // an in-depth explanation of the view, collapsed behind the "?" toggle
  description?: string
  // span the full grid width (piano roll & other wide views)
  wide?: boolean
  children: React.ReactNode
}

export default function VizCard({ title, subtitle, description, wide, children }: VizCardProps) {
  const [descOpen, setDescOpen] = useState(false)
  return (
    <div className={classNames('viz-card', { wide })}>
      <div className="viz-card-header">
        <span className="viz-card-title">{title}</span>
        {subtitle && <span className="viz-card-subtitle">{subtitle}</span>}
        {description && (
          <button
            className={classNames('viz-card-desc-toggle', { open: descOpen })}
            onClick={() => setDescOpen((open) => !open)}
            title={descOpen ? 'Hide description' : 'What is this?'}
            aria-expanded={descOpen}>
            ?
          </button>
        )}
      </div>
      {description && (
        <div className={classNames('viz-card-desc', { open: descOpen })}>
          <div className="viz-card-desc-inner">{description}</div>
        </div>
      )}
      <div className="viz-card-body">{children}</div>
    </div>
  )
}
