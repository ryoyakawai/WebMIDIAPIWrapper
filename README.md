# Web MIDI API Wrapper

## Live Demo
[http://ryoyakawai.github.io/WebMIDIAPIWrapper/](http://ryoyakawai.github.io/WebMIDIAPIWrapper/)

 - Mac users: Select "Apple DLS Synth (0.Apple DLS Synth)" for output device.
 - Windows users: Select "Microsoft GS Wavetable Synth (0.Microsoft GS Wavetable Synth)" for output device.

In the demo, js/ctrlctrlWebmidilib.js is the main JavaScript file. 

![](https://raw.github.com/ryoyakawai/WebMIDIAPIWrapper/master/images/screenshot.jpg)

## What is this?
This script is JavaScript wrapper for developers who wants to play with Musical Instruments and web browser!!

 - What is MIDI? -> [MIDI@wikipedia](http://en.wikipedia.org/wiki/MIDI)
 - What is Web MIDI API? -> [Web MIDI API@W3C](http://webaudio.github.io/web-midi-api/)

## Purpose of using this Wrapper
MIDI is well defined protocol. But to use the protocol you must learn 7bit code, such as NoteOn: 9nH, NoteOff: 8nH.
With using this wrapper you do NOT have to learn those 7bit code. And also, you do NOT have to know about method in Web MIDI API. A thing you must know is really basic JavaScript only!!
Therefore, you can easily build MIDI application only with the wrapper and JavaScript !!

## Supported MIDI Message (as is 2013 Aug 19)

 - NoteOn
 - NoteOff
 - PitchBend
 - Sustain
 - Modulation
 - AllSoundOff
 - ResetAllController
 - AllNoteOff

## Requirements (as is 2013 Aug 19)
Web MIDI API is NOT fully implemented in browser. Only [Chrome Canary](http://www.google.co.jp/intl/ja/chrome/browser/canary.html) accept MIDI input.  
So, please install [Jazz-Plugin](http://jazz-soft.net/) developed by Jazz-Soft.net.

## How to use
 - clone this repository
 - link to the wrapper and [Web MIDI API Shim](https://github.com/cwilso/WebMIDIAPIShim)

```
<script src="[PathToJS]/WebMIDIAPI.js"></script>
<script src="[PathToJS]/WebMIDIAPIWrapper.js"></script>
```

 - create constructor

```
 var wmaw = new WebMIDIAPIWrapper( false );
 ```


 - Set an EventHandler for **setMidiInputSelect** and **setMidiOutputSelect**
     - **setMidiInputSelect** : display MIDI *input* ports, and EventHandler of when MIDI *input* port is specified
     - **setMidiOutputSelect** : display MIDI *output* ports, and EventHandler of when MIDI *output* port is specified
 - Set an EventHandler named **onmidimessage** inside of setMidiInputSelect EventHandler.

 - Do initialization.

```
wmaw.init();
```

## Method to send MIDI Messages

**'sendNoteOn(portNo, ch, note, velocity, time)'**  
*description*: send noteOn message to ch of portNo.  
*values*:

- portNo: port number to send message
- ch: ch number to send message in the port
- note: [noteNo](http://upload.wikimedia.org/wikipedia/commons/7/7a/NoteNamesFrequenciesAndMidiNumbers.svg) to noteOn
- velocity : velocity of note
- time: the time at which to begin sending the data to the port

**'sendNoteOff(portNo, ch, note, velocity, time)'**  
*description*: send noteOff message to ch of portNo.  
*values*:

- portNo: port number to send message
- ch: ch number to send message in the port
- note: [noteNo](http://upload.wikimedia.org/wikipedia/commons/7/7a/NoteNamesFrequenciesAndMidiNumbers.svg) to noteOff
- velocity : velocity of note (some MIDI device accept the value as speed of noteOff)
- time: the time at which to begin sending the data to the port

**'sendProgramChange(portNo, ch, programNo, time)'**  
*description*: send programchange message to change voice  
*values*:

- portNo: port number to send message
- ch: ch number to send message in the port
- programNo: voice number to change
- time: the time at which to begin sending the data to the port


**'setPitchBendValue(portNo, min, max, center)'**  
*description*: set the range of the pitch change value.(sometimes -8192 to 8191(center:0), 0 to 16383(center:8192). This value is depends on the MIDI device.)  
*values*:

- portNo: port number to send message
- min: minimum number of pitchbend value
- max: maximum number of pitchbend value
- center: center number of pitchbend value

**'sendPitchBend(portNo, ch, value, time)'**  
*description*: send pitchbend message by value  
*values*:

- portNo: port number to send message
- ch: ch number to send message in the port
- value: value to change
- time: the time at which to begin sending the data to the port

**'sendSustainStatus(portNo, ch, status, time)'**  
*description*: send sustain message by status  
*values*:

- portNo: port number to send message
- ch: ch number to send message in the port
- status: "on" or "off"
- time: the time at which to begin sending the data to the port

**'sendModulationValue(portNo, ch, value, time)'**  
*description*: send modulation message by value  
*values*:

- portNo: port number to send message
- ch: ch number to send message in the port
- value: value to change
- time: the time at which to begin sending the data to the port

**'sendAllSoundOff(portNo, ch, time)'**  
*description*: send AllSoundOff message to stop all sounds(even sustain and sound reflection) in channel.  
*values*:

- portNo: port number to send message
- ch: ch number to send message in the port
- time: the time at which to begin sending the data to the port

**'sendResetAllController(portNo, ch, time)'**  
*description*: send ResetAllController to reset all controller(pitchbend, after-touch and so on) to initial value in channel.  
*values*:

- portNo: port number to send message
- ch: ch number to send message in the port
- time: the time at which to begin sending the data to the port

**'sendAllNoteOff(portNo, ch, time)'**  
*description*: send AllNoteOff message to stop all sounds(sustain and sound reflection are NOTE affected) in channel.  
*values*:
  
- portNo: port number to send message
- ch: ch number to send message in the port
- time: the time at which to begin sending the data to the port

**'sendRaw(portNo, msg, time)'**  
*description*: send Raw MIDI message by array.  
*values*:
  
- portNo: port number to send message
- msg: set MIDI message as array. In the array, either hexadecimal or decimal (even mixture format) is allow to specify.  e.g.) [0x80, 72, 120]
- time: the time at which to begin sending the data to the port

**'initializePerformanceNow()'**  
*description*: Initialize start time.  
*values*: no valuables

## License

The Apache License Version 2.0
