import { useState, useEffect } from 'react'
import WebMidi from 'webmidi'
import classNames from 'classnames'
import { VIEWS, SECTIONS } from './globals'
import Header from './components/Header'
import Channel from './components/Channel'

export default function App() {
  const [tempo, setTempo] = useState(120)
  const [playing, setPlaying] = useState(false)
  const [numChannels, setNumChannels] = useState(1)
  const [view, setView] = useState(VIEWS[0])
  const [midiOut, setMidiOut] = useState(null)
  const [scrollTo, setScrollTo] = useState(SECTIONS[0])
  const [channelSync, setChannelSync] = useState(false)
  const [numChannelsSoloed, setNumChannelsSoloed] = useState(0)

  const [turningKnob, setTurningKnob] = useState(false)

  useEffect(() => {
    WebMidi.enable((err) => {
      if (err) {
        alert('Unable to enable Web MIDI 😢')
      } else {
        WebMidi.addListener('connected', () => {
          setMidiOut((midiOut) => midiOut ?? WebMidi.outputs[0])
        })
      }
    })
  }, [])

  return (
    <div id="container" className={classNames({ 'turning-knob': turningKnob })}>
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
        view={view}
        setView={setView}
        scrollTo={scrollTo}
        setScrollTo={setScrollTo}
        channelSync={channelSync}
        setChannelSync={setChannelSync}
      />
      <div id="channels">
        {Array.from(Array(numChannels).keys()).map((i) => (
          <Channel
            key={i}
            channelNum={i}
            setTurningKnob={setTurningKnob}
            turningKnob={turningKnob}
            view={view}
            numChannelsSoloed={numChannelsSoloed}
            setNumChannelsSoloed={setNumChannelsSoloed}
          />
        ))}
      </div>
    </div>
  )
}
