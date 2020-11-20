import React from 'react'
import PropTypes from 'prop-types'
import logo from '../assets/logo.png'
import './Transport.scss'

export default function Transport(props) {

  return <div id="transport">
    <img id="logo" src={logo} alt="Phase Machine" />
  </div>
}