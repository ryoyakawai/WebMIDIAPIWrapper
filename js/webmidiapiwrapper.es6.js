'use strict';

export default class WebMIDIAPIWrapper {
    constructor(){
        this.midiAccess = null;
        this.ports = { 'in':[], 'out':[] };
        this.devices = { };
        this.sysex = false;
        this.performanceNow = window.performance.now();
        this.lastStatusByte = null;
    }
    setSysEx(val) {
        this.sysex = val;
    }
    test(){
    }
    async initMIDIAccess() {
        let ret;
        try{
            this.midiAccess = await navigator.requestMIDIAccess( { sysex: this.sysex } );
            if (typeof this.midiAccess.inputs === 'function') {
                this.devices.inputs=this.midiAccess.inputs();
                this.devices.outputs=this.midiAccess.outputs();
            } else {
                let inputIterator = this.midiAccess.inputs.values();
                this.devices.inputs = [];
                for (let o = inputIterator.next(); !o.done; o = inputIterator.next()) {
                    o.value.isAvailable = true;
                    this.devices.inputs.push(o.value);
                }
                let outputIterator = this.midiAccess.outputs.values();
                this.devices.outputs = [];
                for (let o = outputIterator.next(); !o.done; o = outputIterator.next()) {
                    o.value.isAvailable = true;
                    this.devices.outputs.push(o.value);
                }
            }
            this.midiAccess.onstatechange = this._handleStateChange.bind(this);
            console.log("[OutputDevices] ", this.devices.outputs, "[InputDevices]", this.devices.inputs);
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
    setStateChangeHandler(callback) {
        this._stateChangeHandler = event => {
            callback.bind(this)(event);
        };
    }
    _stateChangeHandler(value) {
        console.log('[Handler for handling state changes is not set] Use setStateChangeHandler(callback) to set');
    }
    _handleStateChange(event) {
        const target = event.port;
        let midi_device_list = this.getMIDIDeviceList();
        let master_list = target.type == 'output'
            ? midi_device_list.outputs : midi_device_list.inputs;

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
                }
                break;
            }
        }

        this.updateMIDIDeviceList(midi_device_list);
        this._stateChangeHandler.bind(this)(this.getMIDIDeviceList());
        
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

    
}
