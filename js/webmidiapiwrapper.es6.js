'use strict';

export default class WebMIDIAPIWrapper {
    constructor(){
        this.midiAccess = null;
        this.ports = { 'input':[], 'output':[] };
        this.devices = { };
        this.sysex = false;
        this.performanceNow = window.performance.now();
        this.lastStatusByte = null;
    }
    setSysEx(val) {
        this.sysex = val;
    }
    async initMIDIAccess() {
        let ret;
        try{
            this.midiAccess = await navigator.requestMIDIAccess( { sysex: this.sysex } );
            if (typeof this.midiAccess.inputs === 'function') {
                this.devices.input = this.midiAccess.inputs();
                this.devices.output = this.midiAccess.outputs();
            } else {
                let inputIterator = this.midiAccess.inputs.values();
                this.devices.input = [];
                for (let o = inputIterator.next(); !o.done; o = inputIterator.next()) {
                    o.value.isAvailable = true;
                    this.devices.input.push(o.value);
                }
                let outputIterator = this.midiAccess.outputs.values();
                this.devices.output = [];
                for (let o = outputIterator.next(); !o.done; o = outputIterator.next()) {
                    o.value.isAvailable = true;
                    this.devices.output.push(o.value);
                }
            }
            this.midiAccess.onstatechange = this._handleStateChange.bind(this);
            //console.log("[OutputDevices] ", this.devices.output, "[InputDevices]", this.devices.input);
            ret = true;
        } catch(err) {
            console.log('[ERROR] ', err);
            ret = false;
        }
        return ret;
    }
    getMIDIDeviceList() {
        return this.devices;
    }
    updateMIDIDeviceList(new_device_list) {
        this.devices = new_device_list;
    }
    _stateChangeHandler(type, value) {
        console.log('[Handler for handling state changes is not set] Use setStateChangeHandler(callback) to set');
    }
    setStateChangeHandler(callback) {
        this._stateChangeHandler = (type, midi_device_list) => {
            callback.bind(this)(type, midi_device_list);
        };
    }
    _handleStateChange(event) {
        const target = event.port;
        let midi_device_list = this.getMIDIDeviceList();
        let master_list = (target.type == 'output')
            ? midi_device_list.output : midi_device_list.input;

        for(let i=0; i<master_list.length; i++) {
            let ret_isExist = isExist(master_list, target);
            switch(target.state) {
            case 'connected':
                if( ret_isExist === false) {
                    // add
                    target.isAvailable = true;
                    master_list.push(target);
                } else {
                    // update
                    master_list[ret_isExist.id].isAvailable = true; 
                }
                break;
            case 'disconnected':
                if( ret_isExist !== false) {
                    // remove (off device from list)
                    master_list[ret_isExist.id].isAvailable = false; 
                    if(target.type == 'input') master_list[ret_isExist.id].onmidimessage = function(){};
                }
                break;
            }
        }

        let previous_midi_device_list = this.getMIDIDeviceList();
        this.updateMIDIDeviceList(midi_device_list);
        
        let out = (target.type == 'output') ? (this.getMIDIDeviceList()).output : (this.getMIDIDeviceList()).input;
        this._stateChangeHandler.bind(this)(target.type, out);

        function isExist(master_list, target) {
            let out = false;
            for(let i=0; i<master_list.length; i++) {
                if( master_list[i].id == target.id ) {
                    out = { id: i };
                    break;
                }
            }
            return out;
        }
    }
    setMIDIInputToPort(device_id, portNo, callback) {
        let sel_idx = this._getPortByDeviceid('input', device_id);
        this.devices.input[sel_idx].onmidimessage = callback.bind(this);
        let out = false;
        portNo = this._checkPortNo(portNo);
        if(portNo !== false) {
            this.ports.input[portNo] = this.devices.input[sel_idx];
            out = true;
        }
        return out;
    }
    setMIDIOutputToPort(device_id, portNo) {
        let sel_idx = this._getPortByDeviceid('output', device_id);
        let out = false;
        portNo = this._checkPortNo(portNo);
        if(portNo !== false) {
            this.ports.output[portNo] = this.devices.output[sel_idx];
            out = true;
        }
        return out;
    }
    _getPortByDeviceid(type, device_id) {
        let target_list = (type == 'output') ? this.devices.output : this.devices.input;
        let out = false;
        for(let i in target_list) {
            if(target_list[i].id == device_id) {
                out = i;
                break;
            }
        }
        return out;
    }
    initializePerformanceNow() {
        this.performanceNow=window.performance.now();
    }
    _checkTypeof(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }
    _checkPortNo(portNo) {
        if(isNaN(portNo) === true) {
            console.log("[ERROR] PortNo is NOT the type of number. ["+ portNo +"]");
            return false;
        }
        return parseInt(portNo ,10);
    }
    sendNoteOn(portNo, ch, note, velocity, time) {
        portNo = this._checkPortNo(portNo);
        if(portNo === false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        let now=this.performanceNow;
        let fb = parseInt("0x9" + ch.toString(16), 16);
        if(typeof time !== "number") {
            time = 0;
        }
        let msg=[fb, note, velocity];
        this.ports.output[portNo].send(msg, now + time);
    }
    sendNoteOff(portNo, ch, note, velocity, time) {
        portNo = this._checkPortNo(portNo);
        if(portNo === false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        let now = this.performanceNow;
        let fb = parseInt("0x8" + ch.toString(16), 16);
        if(typeof time !== "number") {
            time = 0;
        }
        let msg = [fb, note, velocity];
        this.ports.output[portNo].send(msg, now + time);
    }
    sendProgramChange(portNo, ch, programNo, time) {
        portNo = this._checkPortNo(portNo);
        if(portNo === false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        let now = this.performanceNow;
        let value = value < 0 ? 0 : value > 127 ? 127 : value;
        let fb=parseInt("0xc" + ch.toString(16), 16);
        if(typeof time !== "number") {
            time = 0;
        }
        let msg = [fb, programNo];
        this.ports.output[portNo].send(msg, now + time);
    }
    setPitchBendValue(portNo, min, max, center) {
        portNo = this._checkPortNo(portNo);
        if(portNo === false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        this.ports.output[portNo].pitchBendValue =
            {"min": parseInt(min), "max": parseInt(max), "center": parseInt(center)};
    }
    sendPitchBend(portNo, ch, value, time) {
        portNo = this._checkPortNo(portNo);
        if(portNo === false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        let now = this.performanceNow;
        let fb = parseInt("0xe" + ch.toString(16), 16);
        let value = value < this.ports.output[portNo].pitchBendValue.min ? this.ports.output[portNo].pitchBendValue.min : value > this.ports.output[portNo].pitchBendValue.max ? this.ports.output[portNo].pitchBendValue.max : value;
        let msb = (~~(value/128));
        let lsb = (value%128);

        let msg = [fb, lsb, msb];
        this.ports.output[portNo].send(msg, now + time);
    }
    sendSustainStatus(portNo, ch, status, time) {
        portNo = this._checkPortNo(portNo);
        if(portNo === false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        let now = this.performanceNow;
        let fb = parseInt("0xb" + ch.toString(16), 16);
        let msg = [fb, 0x40, 0x00];
        switch(status) {
        case "on":
            msg = [fb, 0x40, 0x7f];
            break;
        }
        this.ports.output[portNo].send(msg, now + time);
    }
    sendAllSoundOff(portNo, ch, time) {
        portNo = this._checkPortNo(portNo);
        if(portNo === false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        let now = this.performanceNow;
        let fb = parseInt("0xb" + ch.toString(16), 16);
        let msg = [ fb, 0x78, 0x00 ];
        this.ports.output[portNo].send(msg, now + time);
    }
    sendResetAllController(portNo, ch, time) {
        portNo = this._checkPortNo(portNo);
        if(portNo === false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        let now = this.performanceNow;
        let fb = parseInt("0xb" + ch.toString(16), 16);
        let msg = [ fb, 0x79, 0x00 ];
        this.ports.output[portNo].send(msg, now + time);
    }
    sendAllNoteOff(portNo, ch, time) {
        portNo = this._checkPortNo(portNo);
        if(portNo === false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        let now = this.performanceNow;
        let fb = parseInt("0xb" + ch.toString(16), 16);
        let msg = [ fb, 0x7b, 0x00 ];
        this.ports.output[portNo].send(msg, now + time);
    }
    sendRaw(portNo, msg, time) {
        portNo = this._checkPortNo(portNo);
        if(portNo === false) {
            console.log("[ERROR] @sendNoteOn");
            return;
        }
        let now = this.performanceNow;
        if(this._checkTypeof("array", msg) === true) {
            console.log("[Error] SendRaw : msg must array." + msg);
            return;
        }
        this.ports.output[portNo].send(msg, now + time);
    }
    parseMIDIMessage(msg) {
        if(typeof msg !== "object") {
            return;
        }

        let msg16 = new Array();
        let event = { };
        let out={ };
        for(let i=0; i<msg.length; i++) {
            msg16.push(msg[i].toString(16));
        }
        let eventTypeByte = parseInt(msg[0], 16);
        if((msg[0] & 0xf0) == 0xf0) {
            // Systen Event
            if(msg[0] == 0xf0) {
                event.type = "SysEx";
                event.raw = msg;
            } else {
                console.log("Not Supportted Message. ", msg);
            }
            out={
                "type": event.type,
                "data": event.raw,
                "event": event
            };
        } else {
            // Channel Event
            event.type = "channel";
            event.raw = msg;
            // Not Supporting Running
            this.lastStatusByte = msg16[0]; // for Running Status
            event.statusNum = msg16[0].replace("0x", "").substr(0,1).toLowerCase();
            event.channel = parseInt((msg16[0].replace("0x", "").substr(1,1)),16);
            switch(event.statusNum) {
            case "8":
                event.subType = "noteOff";
                event.noteNumber = msg[1];
                event.velocity = msg[2];
                break;
            case "9":
                event.subType = "noteOn";
                event.noteNumber = msg[1];
                event.velocity = msg[2];
                // 0x9x 0xXX 0x00
                if(event.velocity == 0) {
                    event.subType = "noteOff";
                }
                break;
            case "a":
                event.subType = "noteAftertouch";
                event.noteNumber = msg[1];
                event.amount = msg[2];
                break;
            case "b":
                event.subType = "controller";
					      event.ctrlNo = msg[1];
					      event.value = msg[2];
                switch(event.ctrlNo) {
                case 0x00:
                case "0x00":
                    event.ctrlName = "BankSelect";
                    event.valueType = "MSB";
                    break;
                case 0x20:
                case "0x20":
                    event.ctrlName = "BankSelect";
                    event.valueType = "LSB";
                    break;
                case 0x01:
                case "0x01":
                    event.ctrlName = "Modulation";
                    event.valueType = "MSB";
                    break;
                case 0x21:
                case "0x21":
                    event.ctrlName = "Modulation";
                    event.valueType = "LSB";
                    break;
                case 0x05:
                case "0x05":
                    event.ctrlName = "Portament";
                    event.valueType = "MSB";
                    break;
                case 0x25:
                case "0x25":
                    event.ctrlName = "Portament";
                    event.valueType = "LSB";
                    break;
                case 0x06:
                case "0x06":
                    event.ctrlName = "DataEntry";
                    event.valueType = "MSB";
                    break;
                case 0x26:
                case "0x26":
                    event.ctrlName = "DataEntry";
                    event.valueType = "LSB";
                    break;
                case 0x07:
                case "0x07":
                    event.ctrlName = "MainVolume";
                    event.valueType = "MSB";
                    break;
                case 0x27:
                case "0x27":
                    event.ctrlName = "MainVolume";
                    event.valueType = "LSB";
                    break;
                case 0x10:
                case "0x10":
                    event.ctrlName = "PanPot";
                    event.valueType = "MSB";
                    break;
                case 0x2a:
                case "0x2a":
                    event.ctrlName = "PanPot";
                    event.valueType = "LSB";
                    break;
                case 0x11:
                case "0x11":
                    event.ctrlName = "Expression";
                    event.valueType = "MSB";
                    break;
                case 0x2b:
                case "0x2b":
                    event.ctrlName = "Expression";
                    event.valueType = "LSB";
                    break;
                case 0x40:
                case "0x40":
                    event.ctrlName = "Hold";
                    event.ctrlStatus = "Off";
                    if(event.value >= 0x40) {
                        event.ctrlStatus = "On";
                    }
                    break;
                case 0x41:
                case "0x41":
                    event.ctrlName = "Portament";
                    event.ctrlStatus = "Off";
                    if(event.value >= 0x40) {
                        event.ctrlStatus="On";
                    }
                    break;
                case 0x42:
                case "0x42":
                    event.ctrlName ="SosTenuto";
                    event.ctrlStatus = "Off";
                    if(event.value >= 0x40) {
                        event.ctrlStatus = "On";
                    }
                    break;
                case 0x43:
                case "0x43":
                    event.ctrlName = "SoftPedal";
                    event.ctrlStatus = "Off";
                    if(event.value >= 0x40) {
                        event.ctrlStatus = "On";
                    }
                    break;
                case 0x46:
                case "0x46":
                    event.ctrlName = "SoundController1";
                    break;
                case 0x47:
                case "0x47":
                    event.ctrlName = "SoundController2";
                    break;
                case 0x48:
                case "0x48":
                    event.ctrlName = "SoundController3";
                    break;
                case 0x49:
                case "0x49":
                    event.ctrlName = "SoundController4";
                    break;
                case 0x50:
                case "0x50":
                    event.ctrlName = "SoundController5";
                    break;
                case 0x5b:
                case "0x5b":
                    event.ctrlName = "effectSendLevel1"; // SendLevel: Reberb
                    break;
                case 0x5d:
                case "0x5d":
                    event.ctrlName = "effectSendLevel3"; // SendLevel: Chrus
                    break;
                case 0x5e:
                case "0x5e":
                    event.ctrlName = "effectSendLevel4"; // [XG] ValiationEffect, [SC-88] SendLevel: Delay
                    break;
                case 0x60:
                case "0x60":
                    event.ctrlName = "DataIncrement";
                    break;
                case 0x61:
                case "0x61":
                    event.ctrlName = "DataDecrement";
                    break;
                case 0x62:
                case "0x62":
                    event.ctrlName = "NRPN";
                    event.valueType = "LSB";
                    break;
                case 0x63:
                case "0x63":
                    event.ctrlName = "NRPN";
                    event.valueType = "MSB";
                    break;
                case 0x64:
                case "0x64":
                    event.ctrlName = "RPN";
                    event.valueType = "LSB";
                    break;
                case 0x65:
                case "0x65":
                    event.ctrlName = "RPN";
                    event.valueType = "MSB";
                    break;
                case 0x78:
                case "0x78":
                    event.ctrlName = "AllSoundOff";
                    break;
                case 0x79:
                case "0x79":
                    event.ctrlName = "ResetAllController";
                    break;
                case 0x7b:
                case "0x7b":
                    event.ctrlName = "OmniOff";
                    break;
                case 0x7c:
                case "0x7c":
                    event.ctrlName = "OmniOn";
                    break;
                case 0x7e:
                case "0x7e":
                    event.ctrlName = "Mono";
                    break;
                case 0x7f:
                case "0x7f":
                    event.ctrlName = "Poly";
                    break;
                default:
                    event.ctrlName = "NotDefined";
                    break;
                }
                break;
            case "c":
                event.subType = 'programChange';
					      event.programNumber = msg[1];
                break;
				    case "d":
					      event.subType = 'channelAftertouch';
					      event.amount = msg[1];
                break;
				    case "e":
					      event.subType = 'pitchBend';
                let msb=msg[2], lsb = msg[1];
                if( (msg[2]>>6).toString(2) == "1" ) {
                    event.value = -1*(((msb-64)<<7) + lsb +1) ;
                } else {
                    let bsMsb=msb<<7;
					          event.value = bsMsb + lsb;
                }
                break;
            default:
                console.log("Not Supportted Message. ", msg);
                return;
                break;
            }
            out = {
                "type": event.type,
                "subType": event.subType,
                "data" : event.raw,
                "event": event
            };
        }
        return out;
    }
}
