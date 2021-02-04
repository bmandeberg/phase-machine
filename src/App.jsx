import { useState, useEffect, useRef, useCallback } from 'react'
import WebMidi from 'webmidi'
import classNames from 'classnames'
import { VIEWS, SECTIONS } from './globals'
import Header from './components/Header'
import Channel from './components/Channel'

export default function App() {
  const [tempo, setTempo] = useState(120)
  const [playing, setPlaying] = useState(false)
  const [numChannels, setNumChannels] = useState(4)
  const [view, setView] = useState(VIEWS[2])
  const [midiOut, setMidiOut] = useState(null)
  const [scrollTo, setScrollTo] = useState(SECTIONS[0])
  const [channelSync, setChannelSync] = useState(false)
  const [numChannelsSoloed, setNumChannelsSoloed] = useState(0)

  const [grabbing, setGrabbing] = useState(false)
  const [resizing, setResizing] = useState(false)

  const container = useRef()
  const viewRef = useRef()

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
    const containerEl = container.current
    function handleScroll() {
      if (viewRef.current === 'horizontal') {
        const scrollPositions = [
          0,
          document.querySelector('.piano-roll').offsetLeft,
          document.querySelector('.sequencer').offsetLeft - 16,
        ]
        let scrollEl = 0
        for (let i = 0; i < SECTIONS.length; i++) {
          if (containerEl.scrollLeft >= scrollPositions[i]) {
            scrollEl = i
          }
        }
        setScrollTo((scrollTo) => (SECTIONS[scrollEl] !== scrollTo ? SECTIONS[scrollEl] : scrollTo))
      }
    }
    containerEl.addEventListener('scroll', handleScroll)
    return () => {
      containerEl.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const updateView = useCallback((view) => {
    viewRef.current = view
    setView(view)
  }, [])

  const doScroll = useCallback((scrollEl) => {
    const scrollPositions = [
      0,
      document.querySelector('.piano-roll').offsetLeft,
      document.querySelector('.sequencer').offsetLeft - 16,
    ]
    const scrollElIndex = SECTIONS.indexOf(scrollEl)
    if (scrollElIndex !== -1) {
      container.current.scroll({
        left: scrollPositions[scrollElIndex],
        behavior: 'smooth',
      })
    }
    setScrollTo(scrollEl)
  }, [])

  useEffect(() => {
    container.current.scroll({
      left: 0,
    })
  }, [view])

  return (
    <div id="container" ref={container} className={classNames({ grabbing, resizing })}>
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
        setView={updateView}
        scrollTo={scrollTo}
        setScrollTo={doScroll}
        channelSync={channelSync}
        setChannelSync={setChannelSync}
      />
      <div id="header-border"></div>
      <div id="channels">
        {[...Array(numChannels)].map((d, i) => (
          <Channel
            numChannels={numChannels}
            key={i}
            channelNum={i}
            setGrabbing={setGrabbing}
            grabbing={grabbing}
            resizing={resizing}
            setResizing={setResizing}
            view={view}
            numChannelsSoloed={numChannelsSoloed}
            setNumChannelsSoloed={setNumChannelsSoloed}
          />
        ))}
      </div>
    </div>
  )
}
