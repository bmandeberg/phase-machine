import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Switch from 'react-switch'
import SplitButton from './SplitButton'
import { INSTRUMENT_TYPES, themedSwitch } from '../globals'
import './Instrument.scss'

export default function Instrument({
  className,
  instrumentOn,
  setInstrumentOn,
  instrumentType,
  setInstrumentType,
  small,
  theme,
  mute,
  openInstrumentModal,
  inModal,
}) {
  const incrementInstrument = useCallback(
    (next) => {
      const instrumentTypes = Object.keys(INSTRUMENT_TYPES)
      const instrumentIndex = instrumentTypes.indexOf(instrumentType)
      if (instrumentIndex !== -1) {
        let nextIndex = instrumentIndex + (next ? 1 : -1)
        if (nextIndex < 0) {
          nextIndex = instrumentTypes.length - 1
        } else if (nextIndex > instrumentTypes.length - 1) {
          nextIndex = 0
        }
        setInstrumentType(instrumentTypes[nextIndex])
      }
    },
    [instrumentType, setInstrumentType]
  )

  const offColor = useMemo(() => themedSwitch('offColor', theme), [theme])
  const onColor = useMemo(() => themedSwitch('onColor', theme), [theme])
  const offHandleColor = useMemo(() => themedSwitch('offHandleColor', theme, mute), [mute, theme])
  const onHandleColor = useMemo(() => themedSwitch('onHandleColor', theme), [theme])

  const splitButtonContent = useMemo(() => INSTRUMENT_TYPES[instrumentType](theme), [instrumentType, theme])
  const splitButtonRight = useCallback(() => incrementInstrument(true), [incrementInstrument])
  const splitButtonLeft = useCallback(() => incrementInstrument(false), [incrementInstrument])

  const switchLabelOff = useMemo(() => <p className="switch-label">Off</p>, [])
  const switchLabelOn = useMemo(() => <p className="switch-label">On</p>, [])
  const switchLabel = useMemo(() => <div className="instrument-label">Instrument</div>, [])
  const instrButton = useMemo(
    () => (
      <div onClick={openInstrumentModal} className="button">
        Instr
      </div>
    ),
    [openInstrumentModal]
  )
  const instrSplitButton = useMemo(
    () => (
      <SplitButton
        content={splitButtonContent}
        rightAction={splitButtonRight}
        leftAction={splitButtonLeft}
        contentAction={openInstrumentModal}
      />
    ),
    [openInstrumentModal, splitButtonContent, splitButtonLeft, splitButtonRight]
  )

  return (
    <div className={classNames('instrument', className)}>
      <div className="instrument-switch-container">
        <div>
          {!small && switchLabelOff}
          <Switch
            className="instrument-switch"
            onChange={setInstrumentOn}
            checked={instrumentOn}
            uncheckedIcon={false}
            checkedIcon={false}
            offColor={offColor}
            onColor={onColor}
            offHandleColor={offHandleColor}
            onHandleColor={onHandleColor}
            width={48}
            height={24}
          />
          {!small && switchLabelOn}
        </div>
        {!small && switchLabel}
      </div>
      {small ? instrButton : instrSplitButton}
    </div>
  )
}
Instrument.propTypes = {
  instrumentOn: PropTypes.bool,
  setInstrumentOn: PropTypes.func,
  instrumentType: PropTypes.string,
  setInstrumentType: PropTypes.func,
  className: PropTypes.string,
  small: PropTypes.bool,
  theme: PropTypes.string,
  mute: PropTypes.bool,
  openInstrumentModal: PropTypes.func,
  inModal: PropTypes.bool,
}
