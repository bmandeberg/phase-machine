import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './SplitButton.scss'

function notImplemented() {
  alert('Not implemented yet 😉')
}

export default function SplitButton(props) {
  return (
    <div className={classNames('split-button-container', props.className)}>
      <div className="split-button">
        <div
          className="split-button-action split-button-arrow split-button-arrow-left"
          onClick={props.leftAction || notImplemented}></div>
        <div className="split-button-action split-button-content" onClick={props.contentAction || notImplemented}>
          {props.content || 'Edit'}
        </div>
        <div
          className="split-button-action split-button-arrow split-button-arrow-right"
          onClick={props.rightAction || notImplemented}></div>
      </div>
      <p className="split-button-label">{props.label}</p>
    </div>
  )
}
SplitButton.propTypes = {
  className: PropTypes.string,
  content: PropTypes.string,
  label: PropTypes.string,
  leftAction: PropTypes.func,
  rightAction: PropTypes.func,
  contentAction: PropTypes.func,
}
