import { useEffect, useCallback, useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import { midiStartContinue, midiStop, PRESET_HOLD_TIME } from '../globals'
import { patchPresetAndChannels } from '../App'
import * as Tone from 'tone'

export default function usePresets(
  setUIState,
  channelSync,
  tempo,
  setTempo,
  uiState,
  currentPreset,
  presets,
  setCurrentPreset,
  deepStateCopy,
  setNumChannels,
  setChannelSync,
  setPresets,
  keydownTimer,
  setRestartChannels,
  presetsRestartTransport,
  presetsStopTransport,
  playing,
  setPlaying,
  midiOutRef,
  midiInRef,
  ignorePresetsTempo
) {
  // state management for presets

  useEffect(() => {
    window.localStorage.setItem('activePatch', JSON.stringify(uiState))
  }, [uiState])

  const setChannelState = useCallback(
    (id, state) => {
      setUIState((uiState) => {
        const uiStateCopy = deepStateCopy(uiState)
        const channelIndex = uiStateCopy.channels.findIndex((c) => c.id === id)
        if (channelIndex !== -1) {
          uiStateCopy.channels[channelIndex] = state
        }
        return uiStateCopy
      })
    },
    [deepStateCopy, setUIState]
  )

  useEffect(() => {
    setUIState((uiState) => {
      const uiStateCopy = Object.assign({}, uiState, {
        channelSync,
      })
      return uiStateCopy
    })
  }, [channelSync, setUIState])

  useEffect(() => {
    setUIState((uiState) => {
      const uiStateCopy = Object.assign({}, uiState, {
        tempo,
      })
      return uiStateCopy
    })
  }, [tempo, setUIState])

  const setPresetName = useCallback(
    (presetName) => {
      setUIState((uiState) => {
        return Object.assign({}, uiState, { name: presetName.target.value })
      })
    },
    [setUIState]
  )

  const presetDirty = useMemo(() => {
    for (const param in uiState) {
      if (uiState.hasOwnProperty(param)) {
        // check global preset params
        if (param !== 'channels') {
          if (uiState[param] !== currentPreset[param] && (param !== 'tempo' || !ignorePresetsTempo)) {
            return true
          }
        } else {
          // check channels
          for (let i = 0; i < uiState[param].length; i++) {
            if (!currentPreset[param][i]) return true
            const channel = uiState[param][i]
            const presetChannel = currentPreset[param][i]
            for (const channelParam in channel) {
              if (channel.hasOwnProperty(channelParam) && channelParam !== 'id') {
                if (['key', 'seqSteps', 'keybdPitches'].some((s) => s === channelParam)) {
                  // compare arrays
                  for (let j = 0; j < channel[channelParam].length; j++) {
                    if (channel[channelParam][j] !== presetChannel[channelParam][j]) {
                      return true
                    }
                  }
                } else if (channelParam === 'instrumentParams') {
                  // compare objects
                  for (const key in channel[channelParam]) {
                    if (channel[channelParam][key] !== presetChannel[channelParam][key]) {
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
    return false
  }, [currentPreset, ignorePresetsTempo, uiState])

  // preset actions

  const setPreset = useCallback(
    (presetID) => {
      const preset = presets.find((p) => p.id === presetID)
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
        Tone.Transport.stop()
        midiStop(midiOutRef.current, midiInRef.current && midiInRef.current.name, true)
        Tone.Transport.midiContinue = false
        if (presetsStopTransport) {
          setPlaying(false)
        } else if (playing) {
          Tone.Transport.start()
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

  const dedupName = useCallback((name, id, presets) => {
    const sameNamePreset = presets.find((p) => p.name === name)
    if (sameNamePreset && !(id && sameNamePreset.id === id)) {
      const digitMatch = /\s\((\d+)\)$/
      const baseName = name.replace(digitMatch, '')
      const incRegex = new RegExp(baseName + '\\s\\((\\d+)\\)$')
      const nameIncrements = presets.reduce(
        (acc, curr) => {
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
    (e, hotkey = null) => {
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
      setPresets((presets) => {
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
    (e, hotkey = null) => {
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
      setPresets((presets) => {
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
    setPresets((presets) => presets.filter((p) => p.id !== uiState.id))
    setUIState(deepStateCopy(uiStateCopy))
    setCurrentPreset(uiStateCopy)
    setRestartChannels(false)
    // save in localStorage
    window.localStorage.removeItem('activePreset')
  }, [dedupName, deepStateCopy, presets, setCurrentPreset, setPresets, setRestartChannels, setUIState, uiState])

  const validPreset = useCallback((preset) => {
    function invalidProp(obj, prop, type) {
      const typeCheck = typeof obj[prop] !== type
      return !obj.hasOwnProperty(prop) || (type === 'number' ? typeCheck && obj[prop] !== null : typeCheck)
    }
    if (
      invalidProp(preset, 'name', 'string') ||
      invalidProp(preset, 'id', 'string') ||
      invalidProp(preset, 'hotkey', 'number') ||
      invalidProp(preset, 'placeholder', 'boolean') ||
      invalidProp(preset, 'numChannels', 'number') ||
      invalidProp(preset, 'channelSync', 'boolean') ||
      invalidProp(preset, 'tempo', 'number') ||
      invalidProp(preset, 'channels', 'object')
    ) {
      return false
    }
    for (let i = 0; i < preset.channels.length; i++) {
      const channel = preset.channels[i]
      if (
        invalidProp(channel, 'id', 'string') ||
        invalidProp(channel, 'color', 'string') ||
        invalidProp(channel, 'channelNum', 'number') ||
        invalidProp(channel, 'velocity', 'number') ||
        invalidProp(channel, 'key', 'object') ||
        channel.key.length !== 12 ||
        invalidProp(channel, 'keyRate', 'string') ||
        invalidProp(channel, 'keyMovement', 'string') ||
        invalidProp(channel, 'keyArpInc1', 'number') ||
        invalidProp(channel, 'keyArpInc2', 'number') ||
        invalidProp(channel, 'sustain', 'number') ||
        invalidProp(channel, 'keySwing', 'number') ||
        invalidProp(channel, 'keySwingLength', 'number') ||
        invalidProp(channel, 'mute', 'boolean') ||
        invalidProp(channel, 'solo', 'boolean') ||
        invalidProp(channel, 'shiftAmt', 'number') ||
        invalidProp(channel, 'axis', 'number') ||
        invalidProp(channel, 'rangeStart', 'number') ||
        invalidProp(channel, 'rangeEnd', 'number') ||
        invalidProp(channel, 'seqSteps', 'object') ||
        invalidProp(channel, 'seqLength', 'number') ||
        invalidProp(channel, 'seqRate', 'string') ||
        invalidProp(channel, 'seqMovement', 'string') ||
        invalidProp(channel, 'seqArpInc1', 'number') ||
        invalidProp(channel, 'seqArpInc2', 'number') ||
        invalidProp(channel, 'seqSwing', 'number') ||
        invalidProp(channel, 'seqSwingLength', 'number') ||
        invalidProp(channel, 'hold', 'boolean') ||
        invalidProp(channel, 'instrumentOn', 'boolean') ||
        invalidProp(channel, 'instrumentType', 'string') ||
        invalidProp(channel, 'rangeMode', 'boolean') ||
        invalidProp(channel, 'keybdPitches', 'object') ||
        invalidProp(channel, 'midiIn', 'boolean') ||
        invalidProp(channel, 'midiHold', 'boolean') ||
        invalidProp(channel, 'customMidiOutChannel', 'boolean') ||
        invalidProp(channel, 'midiOutChannel', 'number')
      ) {
        return false
      }
      if (
        invalidProp(channel.instrumentParams, 'gain', 'number') ||
        invalidProp(channel.instrumentParams, 'portamento', 'number') ||
        invalidProp(channel.instrumentParams, 'modulationType', 'string') ||
        invalidProp(channel.instrumentParams, 'harmonicity', 'number') ||
        invalidProp(channel.instrumentParams, 'fatSpread', 'number') ||
        invalidProp(channel.instrumentParams, 'fatCount', 'number') ||
        invalidProp(channel.instrumentParams, 'pulseWidth', 'number') ||
        invalidProp(channel.instrumentParams, 'pwmFreq', 'number') ||
        invalidProp(channel.instrumentParams, 'envAttack', 'number') ||
        invalidProp(channel.instrumentParams, 'envDecay', 'number') ||
        invalidProp(channel.instrumentParams, 'envSustain', 'number') ||
        invalidProp(channel.instrumentParams, 'envRelease', 'number') ||
        invalidProp(channel.instrumentParams, 'cutoff', 'number') ||
        invalidProp(channel.instrumentParams, 'resonance', 'number') ||
        invalidProp(channel.instrumentParams, 'rolloff', 'number') ||
        invalidProp(channel.instrumentParams, 'filterAttack', 'number') ||
        invalidProp(channel.instrumentParams, 'filterDecay', 'number') ||
        invalidProp(channel.instrumentParams, 'filterSustain', 'number') ||
        invalidProp(channel.instrumentParams, 'filterRelease', 'number') ||
        invalidProp(channel.instrumentParams, 'filterAmount', 'number') ||
        invalidProp(channel.instrumentParams, 'samplerAttack', 'number') ||
        invalidProp(channel.instrumentParams, 'samplerRelease', 'number') ||
        invalidProp(channel.instrumentParams, 'effectType', 'string') ||
        invalidProp(channel.instrumentParams, 'effectWet', 'number') ||
        invalidProp(channel.instrumentParams, 'chorusDepth', 'number') ||
        invalidProp(channel.instrumentParams, 'chorusDelayTime', 'number') ||
        invalidProp(channel.instrumentParams, 'chorusFreq', 'number') ||
        invalidProp(channel.instrumentParams, 'chorusSpread', 'number') ||
        invalidProp(channel.instrumentParams, 'distortion', 'number') ||
        invalidProp(channel.instrumentParams, 'delayTime', 'number') ||
        invalidProp(channel.instrumentParams, 'delayFeedback', 'number') ||
        invalidProp(channel.instrumentParams, 'reverbDecay', 'number') ||
        invalidProp(channel.instrumentParams, 'reverbPreDelay', 'number') ||
        invalidProp(channel.instrumentParams, 'vibratoDepth', 'number') ||
        invalidProp(channel.instrumentParams, 'vibratoFreq', 'number')
      ) {
        return false
      }
    }
    return true
  }, [])

  const importPresets = useCallback(
    (presetsString) => {
      try {
        const parsedPresets = JSON.parse(presetsString)
        if (Array.isArray(parsedPresets) && parsedPresets.length) {
          for (let i = 0; i < parsedPresets.length; i++) {
            patchPresetAndChannels(parsedPresets[i])
            if (!validPreset(parsedPresets[i])) {
              alert('Some presets are invalid format!')
              return
            }
          }
          setPresets((presets) => {
            const presetsCopy = presets.slice()
            parsedPresets.forEach((p) => {
              const id = uuid()
              presetsCopy.push(Object.assign(p, { name: dedupName(p.name, id, presetsCopy), id, hotkey: null }))
            })
            return presetsCopy
          })
          alert(`${parsedPresets.length} Preset${parsedPresets.length !== 1 ? 's' : ''} imported`)
        } else alert('No valid presets to import')
      } catch (error) {
        alert('Invalid presets!')
      }
    },
    [dedupName, setPresets, validPreset]
  )

  // update localStorage when presets change

  useEffect(() => {
    window.localStorage.setItem('presets', JSON.stringify(presets))
  }, [presets])

  // handle preset keypresses

  useEffect(() => {
    function keydown(e) {
      if (
        e.key !== ' ' &&
        !isNaN(+e.key) &&
        document.activeElement.getAttribute('type') !== 'text' &&
        document.activeElement.nodeName !== 'TEXTAREA'
      ) {
        if (keydownTimer.current === null) {
          keydownTimer.current = window.performance.now()
        } else if (keydownTimer.current && window.performance.now() - keydownTimer.current > PRESET_HOLD_TIME) {
          setPresets((presets) => {
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
    function keyup(e) {
      if (
        !isNaN(+e.key) &&
        document.activeElement.getAttribute('type') !== 'text' &&
        document.activeElement.nodeName !== 'TEXTAREA'
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
    setPresetName,
    presetDirty,
    setPreset,
    savePreset,
    newPreset,
    deletePreset,
    importPresets,
  }
}
