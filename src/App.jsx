import { useState, useEffect } from 'react'
import WebMidi from 'webmidi'
import Header from './components/Header'
import './App.css'

const VIEWS = ['stacked', 'horizontal', 'grid']
const SECTIONS = ['key', 'piano roll', 'pitch set', 'sequencer']

export default function App() {
  const [tempo, setTempo] = useState(120)
  const [playing, setPlaying] = useState(false)
  const [numChannels, setNumChannels] = useState(4)
  const [view, setView] = useState(VIEWS[0])
  const [midiOut, setMidiOut] = useState(null)
  const [scrollTo, setScrollTo] = useState(SECTIONS[0])
  const [channelSync, setChannelSync] = useState(false)

  useEffect(() => {
    WebMidi.enable((err) => {
      if (err) {
        alert('Unable to enable Web MIDI 😢')
      } else {
        WebMidi.addListener('connected', () => {
          setMidiOut((midiOut) => (!midiOut ? WebMidi.outputs[0] : midiOut))
        })
      }
    })
  }, [])

  return (
    <Header
      tempo={tempo}
      setTempo={setTempo}
      playing={playing}
      setPlaying={setPlaying}
      midiOutputs={WebMidi.outputs}
      midiOut={midiOut}
      setMidiOut={setMidiOut}
      numChannels={numChannels}
      setNumChannels={setNumChannels}
      VIEWS={VIEWS}
      view={view}
      setView={setView}
      SECTIONS={SECTIONS}
      scrollTo={scrollTo}
      setScrollTo={setScrollTo}
      channelSync={channelSync}
      setChannelSync={setChannelSync}
    />
  )
}
