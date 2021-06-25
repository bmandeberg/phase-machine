import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import Instrument from './Instrument'
import './InstrumentModal.scss'

export default function InstrumentModal({ instrumentOn, setInstrumentOn, instrumentType, setInstrumentType, theme }) {
  return (
    <div className="instrument-modal">
      <div className="instrument-type">
        <Instrument
          className="modal-instrument"
          instrumentOn={instrumentOn}
          setInstrumentOn={setInstrumentOn}
          instrumentType={instrumentType}
          setInstrumentType={setInstrumentType}
          small={false}
          theme={theme}
          mute={false}
          inModal={true}
        />
      </div>
    </div>
  )
}
InstrumentModal.propTypes = {
  instrumentOn: PropTypes.bool,
  setInstrumentOn: PropTypes.func,
  instrumentType: PropTypes.string,
  setInstrumentType: PropTypes.func,
  theme: PropTypes.string,
}
