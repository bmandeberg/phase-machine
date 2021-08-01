import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { v4 as uuid } from 'uuid'
import parse from 'html-react-parser'
import './AboutModal.scss'

const ABOUT_SECTIONS = [
  {
    title: 'The Phase Machine',
    text: `The Phase Machine is a musical sequencer and composition tool. It can have one or more Channels, each of which is monophonic (can play one note at a time). Each Channel defines its own musical Key, and has a Sequence and Arpeggio, which work together to choose and play a note. The Sequence and Arpeggio can have different rates and lengths, which can lead to their series of events becoming out of phase with each other, creating unique and shifting patterns of notes - hence The "Phase" Machine.
    
The Key defines which pitches are available to a Channel. The Arpeggio cycles through those pitches to select the pitch that will be heard when a note is played. The Sequence defines when a note can be played. When the Sequence reaches a step that is on, a note is played at the current selected pitch. Also, when the Arpeggio selects a new pitch, a note is played if the current selected Sequence step is on.
    
The Phase Machine can send MIDI notes when a note is played, and receive MIDI notes to define the Key for a Channel (MIDI only works in Google Chrome). Each Channel also has a customizable Instrument that can be heard in the browser. Presets can be saved, exported, and imported. For now, Presets are only saved locally in the browser, sort of like a cookie, so beware that clearing your browser cache will permanently delete any saved Presets (it is recommended to export your Presets beforehand).

To share presets, ask questions, and post insights, you can use <a href="https://groups.google.com/g/phase-machine" target="_blank">the forum</a>`,
  },
  {
    title: 'Header',
    img: {
      src: 'header',
      width: 1330,
    },
    text: 'Global controls.',
    tags: ['header', 'play/pause', 'channels', 'view', 'midi in', 'tempo', 'preset', 'midi out', 'settings'],
  },
  {
    title: 'Preset',
    img: {
      src: 'preset',
      width: 565,
    },
    text: 'Manage saved patches.',
    tags: [
      'preset',
      'name field',
      'dropdown menu',
      'save preset',
      'delete preset',
      'duplicate preset',
      'preset dirty',
      'preset hotkey',
    ],
    warnings: [
      'For now, presets are saved locally in your browser, sort of like a cookie. This means that if you clear your cache/cookies, or perhaps update your browser, you will lose all of your presets! For this reason, we strongly recommend you use the Export Presets feature often to store your presets elsewhere in case you need to restore them. Sometime soon, you will be able to make a user profile and securely store your presets in a database...',
    ],
  },
  {
    title: 'Settings Modal Window',
    img: {
      src: 'settings',
      width: 811,
    },
    text: 'Import/export presets, and set other global preferences.',
    tags: [
      'settings',
      'modal',
      'Show Step Numbers',
      'Hotkey Restart Sequencer',
      'Default channel mode',
      'Presets restart timeline',
      'Knob type',
      'theme',
      'export presets',
      'import presets',
      'delete presets settings',
    ],
    tips: [
      'If you want a smoother transition when going between Presets, you can turn off "Presets restart timeline". Also, Presets that are created from each other will transition between each other a bit better. Turning on "Presets restart timeline" may cause a time jump when selecting a new Preset, but it will preserve precise note positions and phases that can become unaligned when the timeline is not restarted.',
    ],
  },
  {
    title: 'Channel - Stacked View',
    img: {
      src: 'channel',
      width: 1356,
    },
    text: 'In a Channel, the Key, Arpeggio, and Sequence work together to choose and play one note at a time. The Key defines what pitches are available to the Channel. The Arpeggio cycles through those available pitches. The Sequence determines when a note can be played. The Channel will play a note when the Sequence reaches a step that is on, or when the Arpeggio selects a new pitch while the current sequence step is on. Each channel has general mixing and MIDI routing controls, and an intstrument which can be heard in the browser.',
    tags: ['channel', 'general', 'key', 'arpeggio', 'sequence', 'instrument'],
  },
  {
    title: 'Channel - Clock View',
    img: {
      src: 'clock',
      width: 1044,
    },
    text: 'Clock View is an alternative way of viewing a Channel. In clock view, the Pitch Classes are placed in a circle instead of on a keyboard octave. This has added benefit for visualizing pitch class transformations, such as flipping the pitch classes over an axis on the clock, or shifting the pitch classes by semitones.',
    tags: ['channel', 'clock', 'view', 'general', 'key', 'drawer control', 'arpeggio', 'sequence', 'instrument'],
  },
  {
    title: 'General',
    img: {
      src: 'general',
      width: 585,
    },
    text: 'Duplicate, delete, mute, or solo a channel. Also set MIDI routing and channel velocity/volume. Click and drag the Channel Number to rearrange Channels.',
    tags: [
      'channel',
      'general',
      'channel number',
      'duplicate channel',
      'delete channel',
      'mute',
      'solo',
      'midi modal window',
      'midi in',
      'velocity',
    ],
  },
  {
    title: 'MIDI Modal',
    img: {
      src: 'midi',
      width: 801,
    },
    tags: ['channel', 'midi', 'modal', 'MIDI Output Channel', 'Custom Output Channel', 'MIDI In Toggle/Hold'],
    warnings: ['MIDI only works in Google Chrome.'],
  },
  {
    title: 'Key - Range Mode',
    img: {
      src: 'range',
      width: 1289,
    },
    text: 'Available pitches are defined by selecting pitch classes and assigning a range across the keyboard. Transformations can be applied to the set of pitch classes. MIDI input notes will turn a pitch class on or off, e.g. pressing C4 will control the C pitch class. Generally, green means "on" or "selected", and orange means "playing".',
    tags: [
      'channel',
      'key',
      'range',
      'channel mode',
      'Pitch Classes',
      'shift',
      'axis',
      'opposite',
      'flip',
      'piano',
      'range',
    ],
  },
  {
    title: 'Key - Keybd Mode',
    img: {
      src: 'keybd',
      width: 1289,
    },
    text: 'Available pitches are defined by selecting pitches directly on the Piano. This allows you to dial in exactly which pitches will be played by this Channel. Generally, green means "on" or "selected", and orange means "playing".',
    tags: ['channel', 'key', 'keybd', 'channel mode', 'pitch classes', 'midi input mode', 'clear', 'restart', 'piano'],
    tips: ['To preview a note or sample, hold ALT (or OPTION) and click on a note in the Piano'],
  },
  {
    title: 'Arpeggio',
    img: {
      src: 'arpeggio',
      width: 819,
    },
    text: 'Arpeggiates through the pitches selected in the Key. If a new pitch is selected while the current Sequence step is on, a note will be played.',
    tags: ['channel', 'arpeggio', 'rate', 'movement', 'sustain', 'swing', 'swing length'],
  },
  {
    title: 'Sequence',
    img: {
      src: 'sequence',
      width: 1341,
    },
    text: 'Triggers notes to be played, and allows notes from the Key/Arpeggio to play while a sequence step is on.  Generally, green means "on" or "selected", and orange means "playing".',
    tags: ['channel', 'sequence', 'steps', 'rate', 'movement', 'swing', 'swing length', 'hold', 'restart', 'opposite'],
  },
  {
    title: 'Instrument Modal',
    img: {
      src: 'instrument',
      width: 981,
    },
    text: 'From this window, the Channel\'s browser instrument can be configured and effects can be added. The synthesizer instrument has many typical monophonic synth parameters available, as well as extra modifiers for AM/FM modulation and "Fat" oscillators with a detuned spread of multiple oscillators. The sampler instruments simply have an attack/release envelope available.',
    tags: ['instrument', 'modal', 'on/off', 'type', 'instrument parameters', 'effects'],
  },
  {
    title: 'Notes',
    tips: [
      'If you are on a Mac, you can send MIDI from The Phase Machine to other applications on your computer, like a DAW, by configuring the IAC Driver in Audio MIDI Setup: https://support.apple.com/guide/audio-midi-setup/transfer-midi-information-between-apps-ams1013/mac',
      'To clear your current patch, you can set the number of Channels to 0, and then reintroduce blank Channels from the Header.',
      "The Phase machine is not built for mobile, but it is still technically possible to use it on mobile. It's difficult to turn knobs and access interface features, but if you click and hold you'll be able to grab the knobs. It may select other things on the page, but after you're done turning the knob you can click elsewhere to deselect.",
    ],
    warnings: [
      'Beware! There is not yet any undo/redo, so things you do, presets or channels you delete, cannot be undone.',
      'The clock may drift if you navigate away from The Phase Machine while it is running. If you want your timing to be as consistent as possible, make sure The Phase Machine is focused while it is running.',
    ],
    tags: ['notes'],
  },
  {
    tags: ['about'],
    text: `The Phase Machine is inspired by <a href="https://en.wikipedia.org/wiki/Post-tonal_music_theory" target="_blank">post-tonal music theory</a>, specifically <a href="https://en.wikipedia.org/wiki/Set_theory_(music)" target="_blank">set theory</a>.

This project is made possible by the excellent <a href="https://tonejs.github.io/" target="_blank">Tone.js</a> web audio framework, and <a href="https://github.com/djipco/webmidi" target="_blank">WebMidi.js</a>.

The Phase Machine is an open-source project. Get the code at our <a href="https://github.com/bmandeberg/phase-machine" target="_blank">GitHub page</a>

Please direct any questions, comments, or hate-mail to <a href="mailto:manberg@manberg.zone">manberg@manberg.zone</a>

© 2021 Manberg LLC | <a href="/legal/phase_machine_cookie_policy.pdf" target="_blank">Cookie Policy</a> | <a href="/legal/phase_machine_privacy_policy.pdf" target="_blank">Privacy Policy</a> | <a href="/legal/phase_machine_terms_of_use.pdf" target="_blank">Terms Of Use</a>`,
  },
]

export default function AboutModal({ theme }) {
  const [filter, setFilter] = useState('')

  const updateFilter = useCallback((e) => {
    setFilter(e.target.value)
  }, [])

  const sections = useMemo(
    () =>
      ABOUT_SECTIONS.filter((section) =>
        filter
          ? section.tags && section.tags.some((tag) => tag.toLocaleLowerCase().includes(filter.toLocaleLowerCase()))
          : true
      ).map((section) => (
        <div key={uuid()} className="about-section">
          {section.title && <p className="about-section-title">{section.title}</p>}
          {section.text && <p className="about-section-text">{parse(section.text)}</p>}
          {section.img && (
            <img
              className="about-section-image"
              style={{ width: section.img.width }}
              src={`images/${section.img.src}_${theme}.png`}
              alt=""
            />
          )}
          {section.warnings &&
            section.warnings.map((warning, i) => (
              <div key={uuid()} className="about-section-warning-container" style={i ? { marginTop: 10 } : null}>
                <div className="about-section-warning">
                  <div className="about-section-warning-icon"></div>
                  <p className="about-section-warning-content">{warning}</p>
                </div>
              </div>
            ))}
          {section.tips &&
            section.tips.map((tip, i) => (
              <div
                key={uuid()}
                className="about-section-tip-container"
                style={i || section.warnings ? { marginTop: 10 } : null}>
                <div className="about-section-tip">
                  <div className="about-section-tip-icon"></div>
                  {parseLinks(tip, 'tip')}
                </div>
              </div>
            ))}
        </div>
      )),
    [filter, theme]
  )

  return (
    <div className="about-container">
      <input
        className="about-filter"
        type="text"
        value={filter}
        onChange={updateFilter}
        placeholder="Search Features"
      />
      {sections}
    </div>
  )
}
AboutModal.propTypes = {
  theme: PropTypes.string,
}

function parseLinks(text, type) {
  const className = `about-section-${type}-content`
  const linkedContent = text.replaceAll(/(https?:.+)$/g, (match, p1) => `<a href="${p1}" target="_blank">${p1}</a>`)
  return <div className={className}>{parse(linkedContent)}</div>
}
