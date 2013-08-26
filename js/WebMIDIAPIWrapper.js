/**
 *  Copyright 2013 Ryoya KAWAI
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 **/

var WebMIDIAPIWrapper = function( sysex ){
    this.midiAccess=null;
    this.ports={"in":[], "out":[]};
    this.devices={ };
    this.sysex=sysex;
    this.performanceNow=window.performance.now();
};

WebMIDIAPIWrapper.prototype = {
    initMidi: function() {
        navigator.requestMIDIAccess({sysex: this.sysex}).then( this.scb.bind(this), this.ecb.bind(this) );
    },
    scb: function(access) {
        this.midiAccess = access;
        this.devices.inputs=this.midiAccess.inputs();
        this.devices.outputs=this.midiAccess.outputs();
        this.setMidiInputSelect.bind(this)();
        this.setMidiOutputSelect.bind(this)();
        console.log("[OutputDevices] ", this.devices.outputs, "[InputDevices]", this.devices.inputs);
    },
    ecb: function(msg){
        console.log("[ERROR] " + msg);
    },
    
    setMidiInputSelect: function() {
        console.log("[ERROR] Set EventHandler : setMidiInputSelect");  
    },
    setMidiOutputSelect: function() {
        console.log("[ERROR] Set EventHandler : setMidiOutputSelect");  
    },

    setMidiInputToPort: function(selIdx, portNo, onmidimessage) {
        var portNo=0;
        this.ports.in[portNo]=this.devices.inputs[selIdx];
        this.ports.in[portNo].onmidimessage=onmidimessage.bind(this);
    },
    setMidiOutputToPort: function(selIdx, portNo) {
        var portNo=0;
        this.ports.out[portNo]=this.devices.outputs[selIdx];
        //this.setPitchBendValue(0, -8192, 8192, 0);
        this.setPitchBendValue(0, 0, 16383, 8192); // Apple DLS Synth
    },
    initializePerformanceNow: function() {
        this.performanceNow=window.performance.now();
    },
    _checkTyeof: function(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    },
    _checkPortNo: function(portNo) {
        if(isNaN(portNo)===true) {
            console.log("[ERROR] PortNo is NOT the type of number. ["+ portNo+"]");
            return false;
        }
        return parseInt(portNo ,10);
    },
    sendNoteOn: function(portNo, ch, note, velocity, time) {
        var portNo=this._checkPortNo(portNo);
        if(portNo===false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        var now=this.performanceNow;
        var fb=parseInt("0x9" + ch.toString(16), 16);
        if(typeof time!=="number") {
            time=0;
        }
        var msg=[fb, note, velocity];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendNoteOff: function(portNo, ch, note, velocity, time) {
        var portNo=this._checkPortNo(portNo);
        if(portNo===false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        var now=this.performanceNow;
        var fb=parseInt("0x8" + ch.toString(16), 16);
        if(typeof time!=="number") {
            time=0;
        }
        var msg=[fb, note, velocity];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendProgramChange: function(portNo, ch, programNo, time) {
        var portNo=this._checkPortNo(portNo);
        if(portNo===false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        var now=this.performanceNow;
        var value = value < 0 ? 0 : value > 127 ? 127 : value;
        var fb=parseInt("0xc" + ch.toString(16), 16);
        if(typeof time!=="number") {
            time=0;
        }
        var msg=[fb, programNo];
        this.ports.out[portNo].send(msg, now+time);
    },
    setPitchBendValue: function(portNo, min, max, center) {
        this.ports.out[portNo].pitchBendValue={"min": parseInt(min), "max": parseInt(max), "center": parseInt(center)};
    },
    sendPitchBend: function(portNo, ch, value, time) {
        var portNo=this._checkPortNo(portNo);
        if(portNo===false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        var now=this.performanceNow;
        var fb=parseInt("0xe" + ch.toString(16), 16);
        var value = value < this.ports.out[portNo].pitchBendValue.min ? this.ports.out[portNo].pitchBendValue.min : value > this.ports.out[portNo].pitchBendValue.max ? this.ports.out[portNo].pitchBendValue.max : value;
        var msb=(~~(value/128));
        var lsb=(value%128);

        var msg=[fb, lsb, msb];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendSustainStatus: function(portNo, ch, status, time) {
        var portNo=this._checkPortNo(portNo);
        if(portNo===false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        var now=this.performanceNow;
        var fb=parseInt("0xb" + ch.toString(16), 16);
        var msg=[fb, 0x40, 0x00];
        switch(status) {
            case "on":
            msg=[fb, 0x40, 0x7f];
            break;
        }
        this.ports.out[portNo].send(msg, now+time);
    },
    sendModulationValue: function(portNo, ch, value, time) {
        var portNo=this._checkPortNo(portNo);
        if(portNo===false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        var now=this.performanceNow;
        var fb=parseInt("0xb" + ch.toString(16), 16);
        var value = value < 0 ? 0 : value > 127 ? 127 : value;
        var msg=[fb, 0x01, value];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendAllSoundOff: function(portNo, ch, time) {
        var portNo=this._checkPortNo(portNo);
        if(portNo===false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        var now=this.performanceNow;
        var fb=parseInt("0xb" + ch.toString(16), 16);
        var msg=[ fb, 0x78, 0x00 ];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendResetAllController: function(portNo, ch, time) {
        var portNo=this._checkPortNo(portNo);
        if(portNo===false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        var now=this.performanceNow;
        var fb=parseInt("0xb" + ch.toString(16), 16);
        var msg=[ fb, 0x79, 0x00 ];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendAllNoteOff: function(portNo, ch, time) {
        var portNo=this._checkPortNo(portNo);
        if(portNo===false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        var now=this.performanceNow;
        var fb=parseInt("0xb" + ch.toString(16), 16);
        var msg=[ fb, 0x7b, 0x00 ];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendRaw: function(portNo, msg, time) {
        var portNo=this._checkPortNo(portNo);
        if(portNo===false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        var now=this.performanceNow;
        if(this._checkTyeof("array", msg)===true) {
            console.log("[Error] SendRaw : msg must array." + msg);
            return;
        }
        this.ports.out[portNo].send(msg, now+time);
    }
};

