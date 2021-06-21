import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Switch from 'react-switch'
import { themedSwitch } from '../globals'
import './NotesMode.scss'

export default function NotesMode({ rangeMode, setRangeMode, theme }) {
  const setRangeModeTrue = useCallback(() => setRangeMode(true), [setRangeMode])
  const setRangeModeFalse = useCallback(() => setRangeMode(false), [setRangeMode])

  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const onHandleColor = useMemo(() => themedSwitch('onHandleColor', theme), [theme])

  return (
    <div className="notes-mode">
      <Switch
        className="switch"
        onChange={setRangeMode}
        checked={rangeMode}
        uncheckedIcon={false}
        checkedIcon={false}
        offColor={offColor}
        onColor={onColor}
        offHandleColor={onHandleColor}
        onHandleColor={onHandleColor}
        width={46}
        height={24}
      />
      <div className="notes-mode-labels">
        <p onClick={setRangeModeTrue} className={classNames('notes-mode-label', { 'notes-mode-selected': rangeMode })}>
          Range
        </p>
        <p
          onClick={setRangeModeFalse}
          className={classNames('notes-mode-label', { 'notes-mode-selected': !rangeMode })}>
          Keybd
        </p>
      </div>
      <p className="notes-mode-title">Mode</p>
    </div>
  )
}
NotesMode.propTypes = {
  rangeMode: PropTypes.bool,
  setRangeMode: PropTypes.func,
  theme: PropTypes.string,
}
