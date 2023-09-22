# About the Phase Machine

https://www.phasemachine.com/

The Phase Machine is a musical sequencer and composition tool. It can have one or more Channels, each of which is monophonic (can play one note at a time). Each Channel defines its own musical Key, and has a Sequence and Arpeggio, which work together to choose and play a note. The Sequence and Arpeggio can have different rates and lengths, which can lead to their series of events becoming out of phase with each other, creating unique and shifting patterns of notes - hence The "Phase" Machine.
    
The Key defines which pitches are available to a Channel. The Arpeggio cycles through those pitches to select the pitch that will be heard when a note is played. The Sequence defines when a note can be played. When the Sequence reaches a step that is on, a note is played at the current selected pitch. Also, when the Arpeggio selects a new pitch, a note is played if the current selected Sequence step is on.
    
The Phase Machine can send MIDI notes when a note is played, and receive MIDI notes to define the Key for a Channel (MIDI only works in Google Chrome). Each Channel also has a customizable Instrument that can be heard in the browser. Presets can be saved, exported, and imported. For now, Presets are only saved locally in the browser, sort of like a cookie, so beware that clearing your browser cache will permanently delete any saved Presets (it is recommended to export your Presets beforehand).

The Phase Machine is built using React and Tone.js

# Initializing repo after clone

```
yarn install
```

# Running the server

```
yarn start
```
the website URL will be http://localhost:8080/
