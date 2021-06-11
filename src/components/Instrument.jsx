import React, { useCallback } from 'react'
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
  mute
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

  return (
    <div className={classNames('instrument', className)}>
      <div className="instrument-switch-container">
        <div>
          {!small && <p className="switch-label">Off</p>}
          <Switch
            className="instrument-switch"
            onChange={setInstrumentOn}
            checked={instrumentOn}
            uncheckedIcon={false}
            checkedIcon={false}
            offColor={themedSwitch('offColor', theme)}
            onColor={themedSwitch('onColor', theme)}
            offHandleColor={themedSwitch('offHandleColor', theme, mute)}
            onHandleColor={themedSwitch('onHandleColor', theme)}
            width={48}
            height={24}
          />
          {!small && <p className="switch-label">On</p>}
        </div>
        {!small && <div className="instrument-label">Instrument</div>}
      </div>
      {small ? (
        <div className="button disabled">Instr</div>
      ) : (
        <SplitButton
          content={INSTRUMENT_TYPES[instrumentType](theme)}
          rightAction={() => incrementInstrument(true)}
          leftAction={() => incrementInstrument(false)}
        />
      )}
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
}
