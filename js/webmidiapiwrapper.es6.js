export class WebMIDIAPIWrapper {
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
    async initMIDI(inputSelectCallback, outputSelectCallback) {
        try{
            this.midiAccess = await navigator.requestMIDIAccess( { sysex: this.sysex } );
            if (typeof this.midiAccess.inputs === "function") {
                this.devices.inputs=this.midiAccess.inputs();
                this.devices.outputs=this.midiAccess.outputs();
            } else {
                let inputIterator = this.midiAccess.inputs.values();
                this.devices.inputs = [];
                for (let o = inputIterator.next(); !o.done; o = inputIterator.next()) {
                    this.devices.inputs.push(o.value);
                }
                let outputIterator = this.midiAccess.outputs.values();
                this.devices.outputs = [];
                for (let o = outputIterator.next(); !o.done; o = outputIterator.next()) {
                    this.devices.outputs.push(o.value);
                }
            }
            this.setMidiInputSelect = inputSelectCallback.bind(this)();
            this.setMidiOutputSelect = outputSelectCallback.bind(this)();
            console.log("[OutputDevices] ", this.devices.outputs, "[InputDevices]", this.devices.inputs);
        } catch(err) {
            console.log('[ERROR] ', err);
        }
    }

    setMidiInputSelect: function() {
        throw "[ERROR] Set EventHandler : setMidiInputSelect()";
    }
    setMidiOutputSelect: function() {
        throw "[ERROR] Set EventHandler : setMidiOutputSelect()";
    }



    
}
