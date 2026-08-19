import { useEffect, useCallback, useMemo, ChangeEvent, MutableRefObject } from 'react'
import { v4 as uuid } from 'uuid'
import { PRESET_HOLD_TIME } from '../globals'
import { arrayEq } from '../math'
import { midiStartContinue, midiStop } from './useMIDI'
import { patchPresetAndChannels, validPreset } from '../preset'
import { parsePresetText } from '../presetCode'
import * as Tone from 'tone'
import { alertDialog } from '../dialog'
import { Channel, Preset, Setter, MidiOutRef, MidiInRef } from '../types'

export default function usePresets(
  setUIState: Setter<Preset>,
  channelSync: boolean,
  tempo: number,
  setTempo: Setter<number>,
  uiState: Preset,
  currentPreset: Preset,
  presets: Preset[],
  setCurrentPreset: Setter<Preset>,
  deepStateCopy: (state: Preset) => Preset,
  setNumChannels: Setter<number>,
  setChannelSync: Setter<boolean>,
  setPresets: Setter<Preset[]>,
  // Holds performance.now() while a number key is held, or null/false between presses.
  keydownTimer: MutableRefObject<number | null | false>,
  setRestartChannels: Setter<boolean>,
  presetsRestartTransport: boolean,
  presetsStopTransport: boolean,
  playing: boolean,
  setPlaying: Setter<boolean>,
  midiOutRef: MidiOutRef,
  midiInRef: MidiInRef,
  ignorePresetsTempo: boolean
) {
  // state management for presets

  useEffect(() => {
    window.localStorage.setItem('activePatch', JSON.stringify(uiState))
  }, [uiState])

  const setChannelState = useCallback(
    (id: string, state: Channel) => {
      setUIState((uiState: Preset) => {
        const uiStateCopy = deepStateCopy(uiState)
        const channelIndex = uiStateCopy.channels.findIndex((c: Channel) => c.id === id)
        if (channelIndex !== -1) {
          uiStateCopy.channels[channelIndex] = state
        }
        return uiStateCopy
      })
    },
    [deepStateCopy, setUIState]
  )

  // Update just one channel's color (user picks it from the channel number). Lives here
  // so it writes uiState.channels directly; the change flows back to the channel as its
  // `color` prop and persists/marks-dirty like any other channel field.
  const setChannelColor = useCallback(
    (id: string, color: string) => {
      setUIState((uiState: Preset) => {
        const uiStateCopy = deepStateCopy(uiState)
        const channelIndex = uiStateCopy.channels.findIndex((c: Channel) => c.id === id)
        if (channelIndex !== -1) {
          uiStateCopy.channels[channelIndex].color = color
        }
        return uiStateCopy
      })
    },
    [deepStateCopy, setUIState]
  )

  useEffect(() => {
    setUIState((uiState: Preset) => {
      const uiStateCopy = Object.assign({}, uiState, {
        channelSync,
      })
      return uiStateCopy
    })
  }, [channelSync, setUIState])

  useEffect(() => {
    setUIState((uiState: Preset) => {
      const uiStateCopy = Object.assign({}, uiState, {
        tempo,
      })
      return uiStateCopy
    })
  }, [tempo, setUIState])

  const setPresetName = useCallback(
    (presetName: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setUIState((uiState: Preset) => {
        return Object.assign({}, uiState, { name: presetName.target.value })
      })
    },
    [setUIState]
  )

  const presetDirty = useMemo(() => {
    // Generic deep-equality walk over every key of the active vs. saved preset to
    // detect unsaved edits. The keyed access is intentionally dynamic across
    // heterogeneous fields (scalars, arrays, nested objects), hence the loose casts.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const ui = uiState as Record<string, any>
    const cur = currentPreset as Record<string, any>
    for (const param in ui) {
      if (ui.hasOwnProperty(param)) {
        // check global preset params
        if (param !== 'channels') {
          if (ui[param] !== cur[param] && (param !== 'tempo' || !ignorePresetsTempo)) {
            return true
          }
        } else {
          // check channels
          for (let i = 0; i < ui[param].length; i++) {
            if (!cur[param][i]) return true
            const channel = ui[param][i]
            const presetChannel = cur[param][i]
            for (const channelParam in channel) {
              if (channel.hasOwnProperty(channelParam) && channelParam !== 'id') {
                if (['key', 'seqSteps', 'keybdPitches', 'midiOutChannels'].some((s) => s === channelParam)) {
                  // compare arrays element-wise (keybdPitches/midiOutChannels grow and shrink)
                  if (!arrayEq(channel[channelParam], presetChannel[channelParam])) {
                    return true
                  }
                } else if (channelParam === 'instrumentParams') {
                  // compare objects
                  for (const key in channel[channelParam]) {
                    const a = channel[channelParam][key]
                    const b = presetChannel[channelParam][key]
                    if (key === 'effects') {
                      // effects is an array of slot objects (all-primitive fields) —
                      // a plain !== always trips (distinct array instances each copy),
                      // so deep-compare slot-by-slot, field-by-field.
                      if (!Array.isArray(b) || a.length !== b.length) return true
                      for (let s = 0; s < a.length; s++) {
                        for (const f in a[s]) {
                          if (a[s][f] !== b[s][f]) return true
                        }
                      }
                    } else if (a !== b) {
                      return true
                    }
                  }
                } else {
                  // compare everything else
                  if (channel[channelParam] !== presetChannel[channelParam]) {
                    return true
                  }
                }
              }
            }
          }
        }
      }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    return false
  }, [currentPreset, ignorePresetsTempo, uiState])

  // preset actions

  const setPreset = useCallback(
    (presetID: string) => {
      const preset = presets.find((p) => p.id === presetID)!
      setCurrentPreset(deepStateCopy(preset))
      setRestartChannels(presetsRestartTransport)
      setUIState(deepStateCopy(preset))
      setNumChannels(preset.numChannels)
      if (!ignorePresetsTempo) {
        setTempo(preset.tempo)
      }
      setChannelSync(preset.channelSync)
      // restart transport if necessary
      if (presetsRestartTransport || presetsStopTransport) {
        Tone.getTransport().stop()
        midiStop(midiOutRef.current, midiInRef.current && midiInRef.current.name, true)
        // midiContinue is a runtime prop the app attaches to the transport (see useMIDI), not in Tone's types.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(Tone.getTransport() as any).midiContinue = false
        if (presetsStopTransport) {
          setPlaying(false)
        } else if (playing) {
          Tone.getTransport().start()
          midiStartContinue(midiOutRef.current, midiInRef.current && midiInRef.current.name)
        }
      }
      // save in localStorage
      window.localStorage.setItem('activePreset', presetID)
    },
    [
      deepStateCopy,
      ignorePresetsTempo,
      midiInRef,
      midiOutRef,
      playing,
      presets,
      presetsRestartTransport,
      presetsStopTransport,
      setChannelSync,
      setCurrentPreset,
      setNumChannels,
      setPlaying,
      setRestartChannels,
      setTempo,
      setUIState,
    ]
  )

  const dedupName = useCallback((name: string, id: string | null, presets: Preset[]) => {
    const sameNamePreset = presets.find((p) => p.name === name)
    if (sameNamePreset && !(id && sameNamePreset.id === id)) {
      const digitMatch = /\s\((\d+)\)$/
      const baseName = name.replace(digitMatch, '')
      const incRegex = new RegExp(baseName + '\\s\\((\\d+)\\)$')
      const nameIncrements = presets.reduce(
        (acc: number[], curr) => {
          const match = curr.name.match(incRegex)
          if (match && !(id && curr.id === id)) {
            acc.push(+match[1])
          }
          return acc
        },
        [1]
      )
      const maxInc = Math.max(...nameIncrements)
      return `${baseName} (${maxInc + 1})`
    } else return name
  }, [])

  const savePreset = useCallback(
    (_e: unknown, hotkey: number | null = null) => {
      const uiStateCopy = Object.assign({}, uiState, {
        placeholder: false,
        hotkey: hotkey ?? uiState.hotkey,
      })
      for (let i = 0; i < presets.length; i++) {
        if (presets[i].name === uiStateCopy.name && presets[i].id !== uiStateCopy.id) {
          uiStateCopy.name = dedupName(uiStateCopy.name, uiStateCopy.id, presets)
          break
        }
      }
      setUIState(deepStateCopy(uiStateCopy))
      setCurrentPreset(uiStateCopy)
      setRestartChannels(false)
      setPresets((presets: Preset[]) => {
        const presetsCopy = presets.slice()
        const i = presetsCopy.findIndex((p) => p.id === uiStateCopy.id)
        if (i !== -1) {
          const tempo = ignorePresetsTempo ? presetsCopy[i].tempo : uiStateCopy.tempo
          presetsCopy[i] = uiStateCopy
          presetsCopy[i].tempo = tempo
        } else {
          presetsCopy.push(uiStateCopy)
        }
        return presetsCopy
      })
      // save in localStorage
      window.localStorage.setItem('activePreset', uiStateCopy.id)
    },
    [
      dedupName,
      deepStateCopy,
      ignorePresetsTempo,
      presets,
      setCurrentPreset,
      setPresets,
      setRestartChannels,
      setUIState,
      uiState,
    ]
  )

  const newPreset = useCallback(
    (_e: unknown, hotkey: number | null = null) => {
      const id = uuid()
      const uiStateCopy = Object.assign({}, uiState, {
        name: dedupName(uiState.name !== currentPreset.name ? uiState.name : 'New Preset', id, presets),
        placeholder: false,
        id,
        hotkey,
      })
      // sync state and presets
      setUIState(deepStateCopy(uiStateCopy))
      setCurrentPreset(uiStateCopy)
      setRestartChannels(false)
      setPresets((presets: Preset[]) => {
        const presetsCopy = presets.slice()
        presetsCopy.push(uiStateCopy)
        return presetsCopy
      })
      // save in localStorage
      window.localStorage.setItem('activePreset', uiStateCopy.id)
    },
    [
      currentPreset.name,
      dedupName,
      deepStateCopy,
      presets,
      setCurrentPreset,
      setPresets,
      setRestartChannels,
      setUIState,
      uiState,
    ]
  )

  const deletePreset = useCallback(() => {
    const uiStateCopy = Object.assign({}, uiState, {
      name: dedupName('New Preset', uiState.id, presets),
      id: uuid(),
      hotkey: null,
      placeholder: true,
    })
    setPresets((presets: Preset[]) => presets.filter((p) => p.id !== uiState.id))
    setUIState(deepStateCopy(uiStateCopy))
    setCurrentPreset(uiStateCopy)
    setRestartChannels(false)
    // save in localStorage
    window.localStorage.removeItem('activePreset')
  }, [dedupName, deepStateCopy, presets, setCurrentPreset, setPresets, setRestartChannels, setUIState, uiState])

  const importPresets = useCallback(
    async (presetsString: string) => {
      try {
        // compressed base64 or legacy raw JSON — parsePresetText handles both
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let parsedPresets: any = await parsePresetText(presetsString)
        // a single shared preset object imports as a one-element library
        if (!Array.isArray(parsedPresets) && parsedPresets && Array.isArray(parsedPresets.channels)) {
          parsedPresets = [parsedPresets]
        }
        if (Array.isArray(parsedPresets) && parsedPresets.length) {
          for (let i = 0; i < parsedPresets.length; i++) {
            patchPresetAndChannels(parsedPresets[i])
            if (!validPreset(parsedPresets[i])) {
              alertDialog('Some presets are invalid format!')
              return
            }
          }
          setPresets((presets: Preset[]) => {
            const presetsCopy = presets.slice()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsedPresets.forEach((p: any) => {
              const id = uuid()
              presetsCopy.push(Object.assign(p, { name: dedupName(p.name, id, presetsCopy), id, hotkey: null }))
            })
            return presetsCopy
          })
          alertDialog(`${parsedPresets.length} Preset${parsedPresets.length !== 1 ? 's' : ''} imported`)
        } else alertDialog('No valid presets to import')
      } catch {
        alertDialog('Invalid presets!')
      }
    },
    [dedupName, setPresets]
  )

  // update localStorage when presets change

  useEffect(() => {
    window.localStorage.setItem('presets', JSON.stringify(presets))
  }, [presets])

  // handle preset keypresses

  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      if (
        e.key !== ' ' &&
        !isNaN(+e.key) &&
        document.activeElement?.getAttribute('type') !== 'text' &&
        document.activeElement?.nodeName !== 'TEXTAREA'
      ) {
        if (keydownTimer.current === null) {
          keydownTimer.current = window.performance.now()
        } else if (keydownTimer.current && window.performance.now() - keydownTimer.current > PRESET_HOLD_TIME) {
          setPresets((presets: Preset[]) => {
            const presetsCopy = presets.slice()
            presetsCopy.forEach((p) => {
              if (p.hotkey === +e.key) {
                p.hotkey = null
              }
            })
            return presetsCopy
          })
          savePreset(null, +e.key)
          keydownTimer.current = false
        }
      }
    }
    function keyup(e: KeyboardEvent) {
      if (
        !isNaN(+e.key) &&
        document.activeElement?.getAttribute('type') !== 'text' &&
        document.activeElement?.nodeName !== 'TEXTAREA'
      ) {
        if (keydownTimer.current && window.performance.now() - keydownTimer.current < PRESET_HOLD_TIME) {
          const preset = presets.find((p) => p.hotkey === +e.key)
          if (preset) {
            setPreset(preset.id)
          }
        }
        keydownTimer.current = null
      }
    }
    document.addEventListener('keydown', keydown)
    document.addEventListener('keyup', keyup)
    return () => {
      document.removeEventListener('keydown', keydown)
      document.removeEventListener('keyup', keyup)
    }
  }, [keydownTimer, presets, savePreset, setPreset, setPresets])

  return {
    setChannelState,
    setChannelColor,
    setPresetName,
    presetDirty,
    setPreset,
    savePreset,
    newPreset,
    deletePreset,
    importPresets,
  }
}
