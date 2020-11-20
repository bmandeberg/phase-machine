import { useEffect } from 'react'
import WebMidi from 'webmidi'
import Transport from './components/Transport'
import './App.css'

function App() {

  useEffect(() => {
    WebMidi.enable((err) => {
      console.log(WebMidi.outputs)
    })
  }, [])

  return (
    <Transport />
  )
}

export default App
