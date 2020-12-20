import React, { useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import NumericInput from 'react-numeric-input'
import './NumInput.scss'

export default function NumInput({
  label,
  value,
  setValue,
  className,
  min,
  max,
  smallInput,
  inline,
  preview,
  setShowKeyPreview,
  setDirectionForward,
  buttonText,
  buttonAction,
}) {
  const input = useRef()

  const hidePreview = useCallback(() => {
    if (setShowKeyPreview) {
      setShowKeyPreview(false)
    }
  }, [setShowKeyPreview])

  const showPreview = useCallback(() => {
    preview()
  }, [preview])

  const showPreviewForward = useCallback(() => {
    preview(true)
    setDirectionForward(true)
  }, [preview, setDirectionForward])

  const showPreviewBack = useCallback(() => {
    preview(false)
    setDirectionForward(false)
  }, [preview, setDirectionForward])

  useEffect(() => {
    setTimeout(() => {
      const inputEl = input.current.querySelector('input')
      inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length)
    }, 500)
  }, [value])

  useEffect(() => {
    if (preview && setShowKeyPreview && input.current) {
      const inputEl = input.current.querySelector('input')
      inputEl.addEventListener('click', showPreview)
      inputEl.addEventListener('blur', hidePreview)
      const buttons = input.current.querySelectorAll('b')
      if (buttons.length) {
        buttons[0].addEventListener('mouseover', showPreviewForward)
        buttons[0].addEventListener('mouseout', hidePreview)
        buttons[1].addEventListener('mouseover', showPreviewBack)
        buttons[1].addEventListener('mouseout', hidePreview)
      }
      return () => {
        buttons[0].removeEventListener('mouseover', showPreviewForward)
        buttons[0].removeEventListener('mouseout', hidePreview)
        buttons[1].removeEventListener('mouseover', showPreviewBack)
        buttons[1].removeEventListener('mouseout', hidePreview)
        inputEl.removeEventListener('click', showPreview)
        inputEl.removeEventListener('blur', hidePreview)
      }
    }
  }, [hidePreview, preview, setShowKeyPreview, showPreview, showPreviewBack, showPreviewForward])

  return (
    <div ref={input} className={classNames('num-input', className, { 'small-input': smallInput, 'inline-input': inline })}>
      {/* eslint-disable-next-line */}
      <NumericInput min={min} max={max} value={value} onChange={setValue} style={false} strict />
      {buttonText && buttonAction ? (
        <div className="button" onClick={buttonAction} onMouseOver={showPreview} onMouseOut={hidePreview}>
          {buttonText}
        </div>
      ) : (
        <p className="num-input-label no-select">{label}</p>
      )}
    </div>
  )
}
NumInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  setValue: PropTypes.func,
  className: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  smallInput: PropTypes.bool,
  inline: PropTypes.bool,
  preview: PropTypes.func,
  setShowKeyPreview: PropTypes.func,
  setDirectionForward: PropTypes.func,
  buttonText: PropTypes.string,
  buttonAction: PropTypes.func,
}
