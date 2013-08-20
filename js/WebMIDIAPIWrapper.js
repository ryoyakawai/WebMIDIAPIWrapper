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
    // channel, note, velocity, time(ms)
    sendNoteOn: function(portNo, ch, note, velocity, time) {
        var portNo=0, now=this.performanceNow;
        var fb=parseInt("0x9" + ch.toString(16), 16);
        if(typeof time!=="number") {
            time=0;
        }
        var msg=[fb, note, velocity];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendNoteOff: function(portNo, ch, note, velocity, time) {
        var portNo=0, now=this.performanceNow;
        var fb=parseInt("0x8" + ch.toString(16), 16);
        if(typeof time!=="number") {
            time=0;
        }
        var msg=[fb, note, velocity];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendProgramChange: function(portNo, ch, programNo, time) {
        var portNo=0, now=this.performanceNow;
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
        var portNo=0, now=this.performanceNow;
        var fb=parseInt("0xe" + ch.toString(16), 16);
        var value = value < this.ports.out[portNo].pitchBendValue.min ? this.ports.out[portNo].pitchBendValue.min : value > this.ports.out[portNo].pitchBendValue.max ? this.ports.out[portNo].pitchBendValue.max : value;
        var msb=(~~(value/128));//.toString(16);
        var lsb=(value%128);//.toString(16);

        var msg=[fb, lsb, msb];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendSustainStatus: function(portNo, ch, status, time) {
        var portNo=0, now=this.performanceNow;
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
        var portNo=0, now=this.performanceNow;
        var fb=parseInt("0xb" + ch.toString(16), 16);
        var value = value < 0 ? 0 : value > 127 ? 127 : value;
        var msg=[fb, 0x01, value];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendAllSoundOff: function(portNo, ch, time) {
        var portNo=0, now=this.performanceNow;
        var fb=parseInt("0xb" + ch.toString(16), 16);
        var msg=[ fb, 0x78, 0x00 ];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendResetAllController: function(portNo, ch, time) {
        var portNo=0, now=this.performanceNow;
        var fb=parseInt("0xb" + ch.toString(16), 16);
        var msg=[ fb, 0x79, 0x00 ];
        this.ports.out[portNo].send(msg, now+time);
    },
    sendAllNoteOff: function(portNo, ch, time) {
        var portNo=0, now=this.performanceNow;
        var fb=parseInt("0xb" + ch.toString(16), 16);
        var msg=[ fb, 0x7b, 0x00 ];
        this.ports.out[portNo].send(msg, now+time);
    }


};

