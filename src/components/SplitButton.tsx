import React, { useMemo } from 'react'
import classNames from 'classnames'
import { alertDialog } from '../dialog'
import './SplitButton.scss'

interface SplitButtonProps {
  className?: string
  content?: React.ReactNode
  label?: string
  leftAction?: () => void
  rightAction?: () => void
  contentAction?: () => void
  small?: boolean
}

function notImplemented() {
  alertDialog('Not implemented yet 😉')
}

export default function SplitButton(props: SplitButtonProps) {
  const splitButtonLabel = useMemo(() => <p className="split-button-label no-select">{props.label}</p>, [props.label])

  return (
    <div className={classNames('split-button-container', props.className, { 'small-split-button': props.small })}>
      {props.small ? (
        <div className="split-button">
          <div
            className="split-button-action split-button-arrow split-button-arrow-left"
            onClick={props.leftAction || notImplemented}></div>
          <div className="split-button-content" onClick={props.contentAction || notImplemented}>
            {props.content || 'Edit'}
          </div>
          <div
            className="split-button-action split-button-arrow split-button-arrow-right"
            onClick={props.rightAction || notImplemented}></div>
        </div>
      ) : (
        <div className="split-button">
          <div className="split-button-content" onClick={props.contentAction || notImplemented}>
            {props.content || 'Edit'}
          </div>
          <div
            className="split-button-action split-button-arrow split-button-arrow-left"
            onClick={props.leftAction || notImplemented}></div>
          <div
            className="split-button-action split-button-arrow split-button-arrow-right"
            onClick={props.rightAction || notImplemented}></div>
        </div>
      )}
      {props.label && splitButtonLabel}
    </div>
  )
}
