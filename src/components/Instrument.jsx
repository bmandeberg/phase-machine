import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Switch from 'react-switch'
import SplitButton from './SplitButton'
import './Instrument.scss'

export default function Instrument({ className, instrumentOn, setInstrumentOn, instrumentType, setInstrumentType }) {
  return (
    <div className={classNames('instrument', className)}>
      <div className="instrument-switch-container">
        <p className="switch-label">Off</p>
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
          width={44}
          height={22}
        />
        <p className="switch-label">On</p>
        <div className="instrument-label">Instrument</div>
      </div>
      <SplitButton content={instrumentType} />
    </div>
  )
}
Instrument.propTypes = {
  instrumentOn: PropTypes.bool,
  setInstrumentOn: PropTypes.func,
  instrumentType: PropTypes.string,
  setInstrumentType: PropTypes.func,
  className: PropTypes.string,
}
