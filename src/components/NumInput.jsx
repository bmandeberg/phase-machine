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
  previewShift,
  setShowKeyPreview,
  setShiftDirectionForward,
}) {
  const input = useRef()

  const hidePreview = useCallback(() => {
    if (setShowKeyPreview) {
      setShowKeyPreview(false)
    }
  }, [setShowKeyPreview])

  const showPreviewForward = useCallback(() => {
    previewShift(true)
    setShiftDirectionForward(true)
  }, [previewShift, setShiftDirectionForward])

  const showPreviewBack = useCallback(() => {
    previewShift(false)
    setShiftDirectionForward(false)
  }, [previewShift, setShiftDirectionForward])

  useEffect(() => {
    const inputEl = input.current.querySelector('input')
    inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length)
  }, [])

  useEffect(() => {
    if (previewShift && setShowKeyPreview && input.current) {
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
      }
    }
  }, [hidePreview, previewShift, setShowKeyPreview, showPreviewBack, showPreviewForward])

  return (
    <div ref={input} className={classNames('num-input', className, { 'small-input': smallInput })}>
      <NumericInput
        min={min}
        max={max}
        value={value}
        onChange={(value) => {
          setValue(value)
        }}
        style={false}
        strict
      />
      <p className="num-input-label">{label.toUpperCase()}</p>
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
  previewShift: PropTypes.func,
  setShowKeyPreview: PropTypes.func,
  setShiftDirectionForward: PropTypes.func,
}
