import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import classNames from 'classnames'
import NumericInput from './NumericInput'
import './NumInput.scss'

interface NumInputProps {
  label?: string
  value: number
  setValue: (value: number) => void
  className?: string
  min?: number
  max?: number
  small?: boolean
  inline?: boolean
  preview?: (directionForward?: boolean) => void
  setShowKeyPreview?: (show: boolean) => void
  setDirectionForward?: (forward: boolean) => void
  buttonText?: string
  buttonAction?: () => void
  short?: boolean
  disabled?: boolean
}

export default function NumInput({
  label,
  value,
  setValue,
  className,
  min,
  max,
  small,
  inline,
  preview,
  setShowKeyPreview,
  setDirectionForward,
  buttonText,
  buttonAction,
  short,
  disabled,
}: NumInputProps) {
  const input = useRef<HTMLDivElement>(null)

  const hidePreview = useCallback(() => {
    if (setShowKeyPreview) {
      setShowKeyPreview(false)
    }
  }, [setShowKeyPreview])

  const showPreview = useCallback(() => {
    preview?.()
  }, [preview])

  const showPreviewForward = useCallback(() => {
    preview?.(true)
    setDirectionForward?.(true)
  }, [preview, setDirectionForward])

  const showPreviewBack = useCallback(() => {
    preview?.(false)
    setDirectionForward?.(false)
  }, [preview, setDirectionForward])

  useEffect(() => {
    setTimeout(() => {
      if (input.current) {
        const inputEl = input.current.querySelector('input')
        if (inputEl) inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length)
      }
    }, 500)
  }, [value])

  useEffect(() => {
    if (preview && setShowKeyPreview && input.current) {
      const inputEl = input.current.querySelector('input') as HTMLInputElement
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

  const numInputButton = useMemo(
    () => (
      <div className="button" onClick={buttonAction} onMouseOver={showPreview} onMouseOut={hidePreview}>
        {buttonText}
      </div>
    ),
    [buttonAction, buttonText, hidePreview, showPreview]
  )
  const numInputLabel = useMemo(() => <p className="num-input-label no-select">{label}</p>, [label])

  return (
    <div
      ref={input}
      className={classNames('num-input', className, { 'small-input': small, 'inline-input': inline, short, disabled })}>
      <NumericInput min={min} max={max} value={value} onChange={setValue} />
      {buttonText && buttonAction ? numInputButton : numInputLabel}
    </div>
  )
}
