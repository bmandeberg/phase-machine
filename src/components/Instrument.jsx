import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Switch from 'react-switch'
import SplitButton from './SplitButton'
import { INSTRUMENT_TYPES } from '../globals'
import './Instrument.scss'

export default function Instrument({
  className,
  instrumentOn,
  setInstrumentOn,
  instrumentType,
  setInstrumentType,
  small,
}) {
  const incrementInstrument = useCallback(
    (next) => {
      const instrumentIndex = INSTRUMENT_TYPES.indexOf(instrumentType)
      if (instrumentIndex !== -1) {
        let nextIndex = instrumentIndex + (next ? 1 : -1)
        if (nextIndex < 0) {
          nextIndex = INSTRUMENT_TYPES.length - 1
        } else if (nextIndex > INSTRUMENT_TYPES.length - 1) {
          nextIndex = 0
        }
        setInstrumentType(INSTRUMENT_TYPES[nextIndex])
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
            offColor={'#e6e6e6'}
            onColor={'#e6e6e6'}
            offHandleColor={'#666666'}
            onHandleColor={'#33ff00'}
            width={48}
            height={24}
          />
          {!small && <p className="switch-label">On</p>}
        </div>
        {!small && <div className="instrument-label">Instrument</div>}
      </div>
      {small ? (
        <div className="button">Instr</div>
      ) : (
        <SplitButton
          content={instrumentType.name}
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
  instrumentType: PropTypes.object,
  setInstrumentType: PropTypes.func,
  className: PropTypes.string,
  small: PropTypes.bool,
}
