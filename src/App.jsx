import React, { useState, useEffect, useRef, useCallback } from 'react'
import regeneratorRuntime from 'regenerator-runtime'
import * as Tone from 'tone'
import WebMidi from 'webmidi'
import classNames from 'classnames'
import { VIEWS, SECTIONS, DEFAULT_SETTINGS } from './globals'
import Header from './components/Header'
import Channel from './components/Channel'

const CLOCK_WIDTH = 658

export default function App() {
  const [tempo, setTempo] = useState(120)
  const [playing, setPlaying] = useState(false)
  const [numChannels, setNumChannels] = useState(1)
  const [view, setView] = useState(VIEWS[0])
  const [midiOut, setMidiOut] = useState(null)
  const [scrollTo, setScrollTo] = useState(SECTIONS[0])
  const [channelSync, setChannelSync] = useState(false)
  const [numChannelsSoloed, setNumChannelsSoloed] = useState(0)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

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
    viewRef.current = VIEWS[0]
    const containerEl = container.current
    function handleScroll() {
      if (viewRef.current === 'horizontal') {
        const scrollPositions = [
          0,
          document.querySelector('.piano').offsetLeft - 43,
          document.querySelector('.sequencer').offsetLeft - 59,
        ]
        let scrollEl = 0
        for (let i = 0; i < SECTIONS.length; i++) {
          if (containerEl.scrollLeft >= scrollPositions[i]) {
            scrollEl = i
          }
        }
        setScrollTo(SECTIONS[scrollEl])
      }
    }
    containerEl.addEventListener('scroll', handleScroll)
    return () => {
      containerEl.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const updateView = useCallback((view) => {
    viewRef.current = view
    if (view === 'horizontal') {
      setScrollTo(SECTIONS[0])
    }
    setView(view)
  }, [])

  const doScroll = useCallback((scrollEl) => {
    const scrollPositions = [
      0,
      document.querySelector('.piano').offsetLeft - 43,
      document.querySelector('.sequencer').offsetLeft - 59,
    ]
    const scrollElIndex = SECTIONS.indexOf(scrollEl)
    if (scrollElIndex !== -1) {
      container.current.scroll({
        left: scrollPositions[scrollElIndex],
        behavior: 'smooth',
      })
    }
  }, [])

  useEffect(() => {
    container.current.scroll({
      left: 0,
    })
  }, [view])

  useEffect(() => {
    if (Tone.Transport.bpm.value !== tempo) {
      Tone.Transport.bpm.value = tempo
    }
  }, [tempo])

  return (
    <div
      id="container"
      ref={container}
      className={classNames({ grabbing, resizing })}
      style={{
        minWidth:
          view === 'clock' && numChannels > 0
            ? CLOCK_WIDTH * Math.max(Math.floor(window.innerWidth / CLOCK_WIDTH), 2)
            : null,
      }}>
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
      <div id="channels" className={classNames({ empty: numChannels === 0 })}>
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
            tempo={tempo}
            playing={playing}
            settings={settings}
            midiOut={midiOut}
          />
        ))}
        {numChannels === 0 && (
          <div className="no-channels">
            <p>😴</p>
            <p>no channels</p>
          </div>
        )}
      </div>
    </div>
  )
}
