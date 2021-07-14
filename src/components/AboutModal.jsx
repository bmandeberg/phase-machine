import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { v4 as uuid } from 'uuid'
import './AboutModal.scss'

const ABOUT_SECTIONS = [
  {
    title: 'The Phase Machine 🚧 ABOUT SECTION UNDER CONSTRUCTION 🚧',
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque a neque non nisi tincidunt consectetur id id tellus. Duis gravida lacinia mauris ut luctus. Pellentesque convallis mattis tellus, quis ultricies eros mollis tempor. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In condimentum accumsan leo, nec elementum mi fermentum sit amet. Aenean vel sapien laoreet mauris viverra ultrices id sit amet nunc. Morbi erat turpis, luctus id venenatis sed, viverra quis turpis. Quisque consectetur mauris quis sem bibendum laoreet ac id enim. Aliquam sem sem, porttitor nec massa id, bibendum posuere justo.

Donec blandit eget nisi vitae tincidunt. Aliquam aliquet imperdiet sem, in lacinia metus convallis a. In id venenatis augue. Nam lobortis luctus purus, vitae mattis mauris auctor quis. Phasellus bibendum, ipsum nec dictum suscipit, nulla lacus hendrerit urna, in venenatis augue dui eu leo. Quisque sollicitudin risus ac massa tincidunt, vel porttitor enim euismod. Vestibulum mauris elit, suscipit nec bibendum eget, ullamcorper eu sem. Mauris eleifend ipsum quis est pulvinar vehicula. Fusce elementum, turpis non congue dignissim, dolor orci tempus nisl, et consectetur odio tellus lobortis neque. Suspendisse elementum ipsum at suscipit venenatis. Sed luctus imperdiet risus, eget accumsan turpis tempor nec.`,
  },
  {
    title: 'Header',
    img: {
      src: 'header',
      width: 1096,
    },
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    tags: ['header', 'play/pause', 'channels', 'view', 'midi in', 'tempo', 'preset', 'midi out', 'settings'],
  },
  {
    title: 'Preset',
    img: {
      src: 'preset',
      width: 526,
    },
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
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    ],
  },
  {
    title: 'Settings Modal Window',
    img: {
      src: 'settings',
      width: 663,
    },
    tags: [
      'settings',
      'modal',
      'Show Step Numbers',
      'Hotkey Restart Sequencer',
      'Default channel mode',
      'Knob type',
      'theme',
      'export presets',
      'import presets',
      'delete presets settings',
    ],
  },
  {
    title: 'Channel - Stacked View',
    img: {
      src: 'channel',
      width: 1356,
    },
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    tags: ['channel', 'general', 'key', 'arpeggio', 'sequence', 'instrument'],
  },
  {
    title: 'Channel - Clock View',
    img: {
      src: 'clock',
      width: 771,
    },
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    tags: ['channel', 'clock', 'view', 'general', 'key', 'arpeggio', 'sequence', 'instrument'],
  },
  {
    title: 'General',
    img: {
      src: 'general',
      width: 455,
    },
    tags: [
      'channel',
      'general',
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
      width: 573,
    },
    tags: ['channel', 'midi', 'modal', 'MIDI Output Channel', 'Custom Output Channel', 'MIDI In Toggle/Hold'],
    warnings: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    ],
  },
  {
    title: 'Key - Range Mode',
    img: {
      src: 'range',
      width: 1289,
    },
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
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
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    tags: ['channel', 'key', 'keybd', 'channel mode', 'pitch classes', 'midi input mode', 'clear', 'restart', 'piano'],
  },
  {
    title: 'Arpeggio',
    img: {
      src: 'arpeggio',
      width: 481,
    },
    tags: ['channel', 'arpeggio', 'rate', 'movement', 'sustain', 'swing', 'swing length'],
  },
  {
    title: 'Sequence',
    img: {
      src: 'sequence',
      width: 1352,
    },
    tags: ['channel', 'sequence', 'steps', 'rate', 'movement', 'swing', 'swing length', 'hold', 'restart', 'opposite'],
  },
  {
    title: 'Instrument Modal',
    img: {
      src: 'instrument',
      width: 879,
    },
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    tags: ['instrument', 'modal', 'on/off', 'type', 'instrument parameters', 'effects'],
  },
  {
    title: 'Notes',
    tips: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    ],
    warnings: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    ],
  },
  {
    title: 'Inspiration',
    tags: ['about'],
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque a neque non nisi tincidunt consectetur id id tellus. Duis gravida lacinia mauris ut luctus. Pellentesque convallis mattis tellus, quis ultricies eros mollis tempor. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In condimentum accumsan leo, nec elementum mi fermentum sit amet. Aenean vel sapien laoreet mauris viverra ultrices id sit amet nunc. Morbi erat turpis, luctus id venenatis sed, viverra quis turpis. Quisque consectetur mauris quis sem bibendum laoreet ac id enim. Aliquam sem sem, porttitor nec massa id, bibendum posuere justo.

Donec blandit eget nisi vitae tincidunt. Aliquam aliquet imperdiet sem, in lacinia metus convallis a. In id venenatis augue. Nam lobortis luctus purus, vitae mattis mauris auctor quis. Phasellus bibendum, ipsum nec dictum suscipit, nulla lacus hendrerit urna, in venenatis augue dui eu leo. Quisque sollicitudin risus ac massa tincidunt, vel porttitor enim euismod. Vestibulum mauris elit, suscipit nec bibendum eget, ullamcorper eu sem. Mauris eleifend ipsum quis est pulvinar vehicula. Fusce elementum, turpis non congue dignissim, dolor orci tempus nisl, et consectetur odio tellus lobortis neque. Suspendisse elementum ipsum at suscipit venenatis. Sed luctus imperdiet risus, eget accumsan turpis tempor nec.`,
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
          {section.text && <p className="about-section-text">{section.text}</p>}
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
                  <p className="about-section-tip-content">{tip}</p>
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
