import { useState, useEffect } from 'react'
import WebMidi from 'webmidi'
import Transport from './components/Transport'
import './App.css'

export default function App() {
  const [midiOutputs, setMidiOutputs] = useState([])

  useEffect(() => {
    WebMidi.enable((err) => {
      setMidiOutputs(WebMidi.outputs)
    })
    WebMidi.addListener('connected', () => {
      setMidiOutputs(WebMidi.outputs)
    })
  }, [])

  return <Transport midiOutputs={midiOutputs} />
}
