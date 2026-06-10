import { useState, useRef, useEffect } from 'react'
import { WebMidi } from 'webmidi'
import * as Tone from 'tone'
import { alertDialog } from '../dialog'

/* eslint-disable @typescript-eslint/no-explicit-any */
// WebMidi / Tone transport carry custom runtime props (midiClockIn/Out,
// midiContinue, etc.) not in their published types; cast to any pragmatically.
const WM = WebMidi as any
const transport = () => Tone.getTransport() as any

const MIDI_IO_CHANGED = {
  IN: 0,
  OUT: 0,
}

// Why the MIDI dropdowns are empty, phrased for the user. `null` once MIDI is
// enabled. The default empty-list copy used to say "MIDI only works in Google
// Chrome", which is misleading when enable() fails IN Chrome (a blocked MIDI
// permission, or a Chromium browser like Brave that disables Web MIDI). We now
// classify the actual failure so the dropdown explains what's really wrong.
const MIDI_UNSUPPORTED =
  'This browser doesn’t support Web MIDI. Try Google Chrome (desktop) for MIDI.'
const MIDI_BLOCKED =
  'MIDI access is blocked. Allow MIDI for this site in your browser settings, then reload.'
const MIDI_FAILED = 'MIDI couldn’t start in this browser.'

// requestMIDIAccess rejects with a DOMException; a denied/blocked permission
// surfaces as SecurityError or NotAllowedError (Chrome wording has varied).
function midiFailureReason(err: any): string {
  const name = err?.name ?? ''
  const msg = String(err?.message ?? err ?? '').toLowerCase()
  if (
    name === 'SecurityError' ||
    name === 'NotAllowedError' ||
    msg.includes('denied') ||
    msg.includes('permission') ||
    msg.includes('blocked')
  ) {
    return MIDI_BLOCKED
  }
  return MIDI_FAILED
}

export default function useMIDI(setPlaying: any, setResetTransport: any) {
  const [midiEnabled, setMidiEnabled] = useState(false)
  // Start by assuming MIDI will work; the enable effect sets a real reason if it
  // doesn't. This keeps the dropdowns quiet during the brief enable() pending gap.
  const [midiUnavailableReason, setMidiUnavailableReason] = useState<string | null>(null)
  const [midiOut, setMidiOut] = useState<string | null>(null)
  const midiOutRef = useRef<any>(undefined)
  const [midiOuts, setMidiOuts] = useState<string[]>([])
  const [midiIn, setMidiIn] = useState<string | null>(null)
  const midiInRef = useRef<any>(undefined)
  const [midiIns, setMidiIns] = useState<string[]>([])
  const [midiNoteOn, setMidiNoteOn] = useState<any>(null)
  const [midiNoteOff, setMidiNoteOff] = useState<any>(null)
  const [midiClockIn, setMidiClockIn] = useState(
    JSON.parse(window.localStorage.getItem('midiClockIn') as string) ?? true
  )
  const [midiClockOut, setMidiClockOut] = useState(
    JSON.parse(window.localStorage.getItem('midiClockOut') as string) ?? true
  )

  useEffect(() => {
    if (WebMidi.enabled) {
      window.localStorage.setItem('midiIn', midiIn as string)
    }
  }, [midiIn])

  useEffect(() => {
    if (WebMidi.enabled) {
      window.localStorage.setItem('midiOut', midiOut as string)
    }
  }, [midiOut])

  useEffect(() => {
    WM.midiClockIn = midiClockIn
    window.localStorage.setItem('midiClockIn', midiClockIn)
  }, [midiClockIn])

  useEffect(() => {
    WM.midiClockOut = midiClockOut
    window.localStorage.setItem('midiClockOut', midiClockOut)
  }, [midiClockOut])

  // init MIDI

  useEffect(() => {
    function connectMidi() {
      setMidiOuts(WebMidi.outputs.map((o) => o.name).concat(['(None)']))
      setMidiIns(WebMidi.inputs.map((i) => i.name).concat(['(None)']))
    }
    function disconnectMidi(e: any) {
      setMidiOuts(WebMidi.outputs.map((o) => o.name).concat(['(None)']))
      setMidiOut((midiOut) => (e.port.name === midiOut ? null : midiOut))
      setMidiIns(WebMidi.inputs.map((i) => i.name).concat(['(None)']))
      setMidiIn((midiIn) => (e.port.name === midiIn ? null : midiIn))
    }
    // No Web MIDI API at all (Safari, Firefox, non-secure context, …) — enable()
    // would reject; report it directly without the noisy console error.
    if (typeof navigator === 'undefined' || typeof navigator.requestMIDIAccess !== 'function') {
      setMidiUnavailableReason(MIDI_UNSUPPORTED)
      return
    }
    WebMidi.enable()
      .then(() => {
        setMidiUnavailableReason(null)
        // Populate the device lists from the ports that are already present at enable time.
        // The 'connected'/'disconnected' listeners below only cover changes afterward, and
        // can't be relied on to fire (or to fire after they're attached) for pre-existing
        // ports — so without this the dropdowns stay empty even though MIDI is enabled.
        connectMidi()
        // initialize MIDI I/O
        const mo = window.localStorage.getItem('midiOut')
        setMidiOut(() => (mo !== null && WebMidi.outputs.map((o) => o.name).includes(mo) && mo) || null)
        const mi = window.localStorage.getItem('midiIn')
        setMidiIn(() => (mi !== null && WebMidi.inputs.map((i) => i.name).includes(mi) && mi) || null)
        // schedule MIDI clock output
        transport().midiContinue = false
        if (Tone.getTransport().PPQ % 24 === 0) {
          Tone.getTransport().scheduleRepeat((time) => {
            if (
              WM.midiClockOut &&
              midiOutRef.current &&
              (!midiInRef.current || midiInRef.current.name !== midiOutRef.current)
            ) {
              const clockOffset = WM.time - Tone.immediate() * 1000
              WM.getOutputByName(midiOutRef.current).sendClock({
                time: time * 1000 + clockOffset + 10,
              })
            }
          }, Tone.getTransport().PPQ / 24 + 'i')
        }
        setMidiEnabled(true)
        WebMidi.addListener('connected', connectMidi)
        WebMidi.addListener('disconnected', disconnectMidi)
      })
      .catch((err) => {
        // Most often a blocked MIDI permission, or a Chromium browser (e.g. Brave)
        // that disables Web MIDI — both reject here even though it IS "Chrome".
        setMidiUnavailableReason(midiFailureReason(err))
        console.warn('Web MIDI enable() failed:', err)
      })
    return () => {
      // WebMidi.enable() is async, so under React 18 StrictMode the cleanup can
      // run before it resolves; removing listeners then throws. Guard on enabled.
      if (WebMidi.enabled) {
        WebMidi.removeListener('connected', connectMidi)
        WebMidi.removeListener('disconnected', disconnectMidi)
      }
    }
  }, [])

  // update MIDI ins and outs

  useEffect(() => {
    if (midiInRef.current) {
      midiInRef.current.removeListener()
    }
    if (midiIn) {
      if (midiIn === midiOutRef.current && MIDI_IO_CHANGED.IN > 2) {
        alertDialog(
          'Setting MIDI input to current MIDI output - to avoid circular MIDI, the MIDI input will only receive MIDI clock, and the MIDI output will not send MIDI clock.'
        )
      }
      midiInRef.current = WebMidi.getInputByName(midiIn)
      // MIDI input listeners
      midiInRef.current.addListener('noteon', (e: any) => {
        if (midiIn !== midiOutRef.current) {
          setMidiNoteOn(e)
        }
      })
      midiInRef.current.addListener('noteoff', (e: any) => {
        if (midiIn !== midiOutRef.current) {
          setMidiNoteOff(e)
        }
      })
      midiInRef.current.addListener('start', () => {
        if (WM.midiClockIn) {
          Tone.getTransport().start()
          setPlaying(true)
          // MIDI out
          midiStartContinue(midiOutRef.current, midiIn)
        }
      })
      midiInRef.current.addListener('continue', () => {
        if (WM.midiClockIn) {
          Tone.getTransport().start()
          setPlaying(true)
          // MIDI out
          midiStartContinue(midiOutRef.current, midiIn)
        }
      })
      midiInRef.current.addListener('stop', () => {
        if (WM.midiClockIn) {
          Tone.getTransport().pause()
          setPlaying(false)
          // MIDI out
          midiStop(midiOutRef.current, midiIn)
        }
      })
      midiInRef.current.addListener('songposition', (e: any) => {
        if (WM.midiClockIn && e.message.data && e.message.data[0] === 242 && e.message.data[1] === 0) {
          setResetTransport(true)
          // MIDI out
          midiSongpositionReset(midiOutRef.current, midiIn)
        }
      })
    } else {
      midiInRef.current = null
    }
    MIDI_IO_CHANGED.IN++
  }, [midiIn, setPlaying, setResetTransport])

  useEffect(() => {
    if (midiOut && midiInRef.current && midiOut === midiInRef.current.name && MIDI_IO_CHANGED.OUT > 2) {
      alertDialog(
        'Setting MIDI output to current MIDI input - to avoid circular MIDI, the MIDI input will only receive MIDI clock, and the MIDI output will not send MIDI clock.'
      )
    }
    midiOutRef.current = midiOut
    MIDI_IO_CHANGED.OUT++
  }, [midiOut])

  return {
    midiOutRef,
    midiInRef,
    midiOut,
    midiIn,
    midiNoteOn,
    midiNoteOff,
    midiOuts,
    midiIns,
    setMidiOut,
    setMidiIn,
    midiEnabled,
    midiUnavailableReason,
    midiClockIn,
    setMidiClockIn,
    midiClockOut,
    setMidiClockOut,
  }
}

// MIDI out

export function midiStartContinue(midiOut: any, midiIn: any) {
  if (WM.midiClockOut && midiOut && midiOut !== midiIn) {
    const midiOutObj = WM.getOutputByName(midiOut)
    if (transport().midiContinue) {
      midiOutObj.sendContinue()
    } else {
      midiOutObj.sendStart()
      transport().midiContinue = true
    }
  }
}

export function midiSongpositionReset(midiOut: any, midiIn: any) {
  if (WM.midiClockOut && midiOut && midiOut !== midiIn) {
    WM.getOutputByName(midiOut).sendSongPosition(0)
  }
}

export function midiStop(midiOut: any, midiIn: any, reset?: boolean) {
  if (WM.midiClockOut && midiOut && midiOut !== midiIn) {
    WM.getOutputByName(midiOut).sendStop()
    if (reset) {
      midiSongpositionReset(midiOut, midiIn)
      transport().midiContinue = false
    }
  }
}
