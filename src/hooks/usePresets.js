import { useEffect, useCallback, useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import { PRESET_HOLD_TIME } from '../globals'

export default function usePresets(
  setUIState,
  numChannels,
  tempo,
  channelSync,
  uiState,
  currentPreset,
  presets,
  setCurrentPreset,
  deepStateCopy,
  setTempo,
  setNumChannels,
  setChannelSync,
  setPresets,
  keydownTimer
) {
  // state management for presets

  const setChannelState = useCallback(
    (channelNum, state) => {
      setUIState((uiState) => {
        const uiStateCopy = Object.assign({}, uiState)
        uiStateCopy.channels[channelNum] = state
        return uiStateCopy
      })
    },
    [setUIState]
  )

  useEffect(() => {
    setUIState((uiState) => {
      const uiStateCopy = Object.assign({}, uiState)
      uiStateCopy.channels = uiStateCopy.channels.slice(0, numChannels)
      return uiStateCopy
    })
  }, [numChannels, setUIState])

  useEffect(() => {
    setUIState((uiState) => {
      const uiStateCopy = Object.assign({}, uiState, {
        tempo,
        numChannels,
        channelSync,
      })
      return uiStateCopy
    })
  }, [channelSync, numChannels, setUIState, tempo])

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
          if (uiState[param] !== currentPreset[param]) {
            return true
          }
        } else {
          // check channels
          for (let i = 0; i < uiState[param].length; i++) {
            if (!currentPreset[param][i]) return true
            const channel = uiState[param][i]
            const presetChannel = currentPreset[param][i]
            for (const channelParam in channel) {
              if (channel.hasOwnProperty(channelParam)) {
                // compare arrays
                if (['key', 'seqSteps'].some((s) => s === channelParam)) {
                  for (let j = 0; j < channel[channelParam].length; j++) {
                    if (channel[channelParam][j] !== presetChannel[channelParam][j]) {
                      return true
                    }
                  }
                } else if (channelParam === 'instrumentType') {
                  // compare special cases
                  if (channel[channelParam].value !== presetChannel[channelParam].value) {
                    return true
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
  }, [currentPreset, uiState])

  // preset actions

  const setPreset = useCallback(
    (presetID) => {
      const preset = presets.find((p) => p.id === presetID)
      setCurrentPreset(deepStateCopy(preset))
      setUIState(deepStateCopy(preset))
      setTempo(preset.tempo)
      setNumChannels(preset.numChannels)
      setChannelSync(preset.channelSync)
      // save in localStorage
      window.localStorage.setItem('activePreset', presetID)
    },
    [deepStateCopy, presets, setChannelSync, setCurrentPreset, setNumChannels, setTempo, setUIState]
  )

  const dedupName = useCallback(
    (name, id) => {
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
    },
    [presets]
  )

  const savePreset = useCallback(
    (e, hotkey = null) => {
      const uiStateCopy = Object.assign({}, uiState, {
        placeholder: false,
        hotkey: hotkey !== null ? hotkey : uiState.hotkey,
      })
      for (let i = 0; i < presets.length; i++) {
        if (presets[i].name === uiStateCopy.name && presets[i].id !== uiStateCopy.id) {
          uiStateCopy.name = dedupName(uiStateCopy.name, uiStateCopy.id)
          break
        }
      }
      setUIState(deepStateCopy(uiStateCopy))
      setCurrentPreset(uiStateCopy)
      setPresets((presets) => {
        const presetsCopy = presets.slice()
        const i = presetsCopy.findIndex((p) => p.id === uiStateCopy.id)
        if (i !== -1) {
          presetsCopy[i] = uiStateCopy
        } else {
          presetsCopy.push(uiStateCopy)
        }
        return presetsCopy
      })
      // save in localStorage
      window.localStorage.setItem('activePreset', uiStateCopy.id)
    },
    [dedupName, deepStateCopy, presets, setCurrentPreset, setPresets, setUIState, uiState]
  )

  const newPreset = useCallback(
    (e, hotkey = null) => {
      const uiStateCopy = Object.assign({}, uiState, {
        name: dedupName(uiState.name),
        placeholder: false,
        id: uuid(),
        hotkey,
      })
      // sync state and presets
      setUIState(deepStateCopy(uiStateCopy))
      setCurrentPreset(uiStateCopy)
      setPresets((presets) => {
        const presetsCopy = presets.slice()
        presetsCopy.push(uiStateCopy)
        return presetsCopy
      })
      // save in localStorage
      window.localStorage.setItem('activePreset', uiStateCopy.id)
    },
    [dedupName, deepStateCopy, setCurrentPreset, setPresets, setUIState, uiState]
  )

  const deletePreset = useCallback(() => {
    const uiStateCopy = Object.assign({}, uiState, {
      name: dedupName('New Preset', uiState.id),
      id: uuid(),
      hotkey: null,
      placeholder: true,
    })
    setPresets((presets) => presets.filter((p) => p.id !== uiState.id))
    setUIState(deepStateCopy(uiStateCopy))
    setCurrentPreset(uiStateCopy)
    // save in localStorage
    window.localStorage.removeItem('activePreset')
  }, [dedupName, deepStateCopy, setCurrentPreset, setPresets, setUIState, uiState])

  useEffect(() => {
    window.localStorage.setItem('presets', JSON.stringify(presets))
  }, [presets])

  // handle preset keypresses

  useEffect(() => {
    function keydown(e) {
      if (!isNaN(+e.key)) {
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
      if (!isNaN(+e.key)) {
        if (keydownTimer.current && window.performance.now() - keydownTimer.current < PRESET_HOLD_TIME) {
          const preset = presets.find((p) => p.hotkey === +e.key)
          if (preset) {
            setPreset(preset.id)
          }
        }
        keydownTimer.current = null
      }
    }
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
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
  }
}
