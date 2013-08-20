var wmaw= new WebMIDIAPIWrapper( false );

wmaw.setMidiInputSelect=function() {
    var miButton=document.createElement("input"); // mi: midi input
    miButton.type="button"; miButton.id="connectinput"; miButton.value="Select Input";
    var miSelect=document.createElement("select");
    miSelect.id="midiinlist";
    miSelect.style.setProperty("width", "300px");
    for(var i=0; i<this.devices.inputs.length; i++) {
        miSelect.options[i]=new Option(this.devices.inputs[i]["name"]+" ("+this.devices.inputs[i]["id"]+")", i);
    }
    document.getElementById("midiInDevices").appendChild(miSelect);
    document.getElementById("midiInDevices").appendChild(miButton);

    // eventlistener for miButton
    document.getElementById("connectinput").addEventListener("click", function(){
        var selIdx=document.getElementById("midiinlist").value;
        function onmidimessage(event) {
            var midimsg0=event.data[0].toString(16), midimsg1=event.data[1].toString(16), midimsg2=event.data[2].toString(16);
            console.log(midimsg0 + " " + midimsg1 + " " + midimsg2);
            if(typeof wmaw.ports.out[0]==="object") {
                wmaw.ports.out[0].send([event.data[0], event.data[1], event.data[2]]);
            }
        }
        wmaw.setMidiInputToPort(selIdx, 0, onmidimessage);
    });

};


wmaw.setMidiOutputSelect=function() {
    var moButton=document.createElement("input"); // mo: midi output
    moButton.type="button"; moButton.id="connectoutput"; moButton.value="Select Output";
    var moSelect=document.createElement("select");
    moSelect.id="midioutlist";
    moSelect.style.setProperty("width", "300px");
    for(var i=0; i<this.devices.outputs.length; i++) {
        moSelect.options[i]=new Option(this.devices.outputs[i]["name"]+" ("+this.devices.outputs[i]["id"]+")", i);
    }
    document.getElementById("midiOutDevices").appendChild(moSelect);
    document.getElementById("midiOutDevices").appendChild(moButton);

    // eventlistener for moButton
    document.getElementById("connectoutput").addEventListener("click", function(){
        var selIdx=document.getElementById("midioutlist").value;
        wmaw.setMidiOutputToPort(selIdx, 0);
        
        var fireMidi = document.createElement("input");
        fireMidi.id="fireMidi"; fireMidi.type="button"; 
        fireMidi.value="Fire MIDI";
        document.getElementById("midiFireButton").appendChild(fireMidi);
        document.getElementById("fireMidi").addEventListener("click", function() {
            wmaw.initializePerformanceNow();
            
            /////////////////////////////////////////////            
            wmaw.sendProgramChange(0, 0, 1, 0);

            wmaw.sendNoteOn(0, 0, 72, 60, 0);
            wmaw.sendNoteOff(0, 0, 72, 60, 500);
            
            wmaw.sendNoteOn(0, 0, 74, 80, 500);
            wmaw.sendNoteOff(0, 0, 74, 80, 1000);
            
            wmaw.sendNoteOn(0, 0, 76, 100, 1000);
            wmaw.sendNoteOff(0, 0, 76, 100, 1500);
            
            wmaw.sendNoteOn(0, 0, 77, 120, 1500);
            wmaw.sendNoteOff(0, 0, 77, 120, 2000);
            
            wmaw.sendNoteOn(0, 0, 79, 127, 2000);
            wmaw.sendNoteOff(0, 0, 79, 127, 2500);

            /////////////////////////////////////////////
            wmaw.sendProgramChange(0, 0, 10, 2500);

            wmaw.sendNoteOn(0, 0, 72, 60, 2500);
            wmaw.sendNoteOff(0, 0, 72, 60,3000);
            
            wmaw.sendNoteOn(0, 0, 74, 80, 3000);
            wmaw.sendNoteOff(0, 0, 74, 80, 3500);
            
            wmaw.sendNoteOn(0, 0, 76, 100, 3500);
            wmaw.sendNoteOff(0, 0, 76, 100, 4000);
            
            wmaw.sendNoteOn(0, 0, 77, 120, 4000);
            wmaw.sendNoteOff(0, 0, 77, 120, 4500);
            
            wmaw.sendNoteOn(0, 0, 79, 127, 4500);
            wmaw.sendNoteOff(0, 0, 79, 127, 5000);


            /////////////////////////////////////////////
            wmaw.sendProgramChange(0, 0, 20, 5000);

            wmaw.sendNoteOn(0, 0, 72, 60, 5000);
            wmaw.sendNoteOff(0, 0, 72, 60, 5500);
            
            wmaw.sendNoteOn(0, 0, 74, 80, 5500);
            wmaw.sendNoteOff(0, 0, 74, 80, 6000);
            
            wmaw.sendNoteOn(0, 0, 76, 100, 6000);
            wmaw.sendNoteOff(0, 0, 76, 100, 6500);
            
            wmaw.sendNoteOn(0, 0, 77, 120, 6500);
            wmaw.sendNoteOff(0, 0, 77, 120, 7000);
            
            wmaw.sendNoteOn(0, 0, 79, 127, 7000);
            wmaw.sendNoteOff(0, 0, 79, 127, 7500);

        });

        var fireSustain = document.createElement("input");
        fireSustain.id="fireSustain"; fireSustain.type="button"; 
        fireSustain.value="Fire Midi (Sustain)";
        document.getElementById("sustainFireButton").appendChild(fireSustain);
        document.getElementById("fireSustain").addEventListener("click", function() {
            wmaw.initializePerformanceNow();
            wmaw.sendProgramChange(0, 0, 20, 0);

            wmaw.sendSustainStatus(0, 0, "on", 0);
            wmaw.sendSustainStatus(0, 0, "off", 2500);

            wmaw.sendNoteOn(0, 0, 72, 60, 0);
            wmaw.sendNoteOff(0, 0, 72, 60, 500);
            
            wmaw.sendNoteOn(0, 0, 74, 80, 500);
            wmaw.sendNoteOff(0, 0, 74, 80, 1000);
            
            wmaw.sendNoteOn(0, 0, 76, 100, 1000);
            wmaw.sendNoteOff(0, 0, 76, 100, 1500);
            
            wmaw.sendNoteOn(0, 0, 77, 120, 1500);
            wmaw.sendNoteOff(0, 0, 77, 120, 2000);
            
            wmaw.sendNoteOn(0, 0, 79, 127, 2000);
            wmaw.sendNoteOff(0, 0, 79, 127, 2500);
        });

        
        var fireBend = document.createElement("input");
        fireBend.id="fireBend"; fireBend.type="button"; 
        fireBend.value="Fire Midi (Bend)";
        document.getElementById("bendFireButton").appendChild(fireBend);
        document.getElementById("fireBend").addEventListener("click", function() {
            wmaw.setPitchBendValue(0, 0, 16384, 8192);
            wmaw.sendProgramChange(0, 0, 30, 0);
            
            wmaw.sendNoteOn(0, 0, 72, 120, 0);
            var val=wmaw.ports.out[0].pitchBendValue.center;
            var d=1;
            var t=null;
            t=setInterval(function() {
                if(val>wmaw.ports.out[0].pitchBendValue.max) {
                    d=-1;
                } else if(val<=wmaw.ports.out[0].pitchBendValue.min) {
                    d=1;                    
                    clearInterval(t);
                    t=false;
                }                
                val = val + d*128;
                wmaw.sendPitchBend(0, 0, val, 0);
                if(t==false) {
                    wmaw.sendNoteOff(0, 0, 72, 120, 0);
                    wmaw.sendPitchBend(0, 0, wmaw.ports.out[0].pitchBendValue.center, 0);
                }
                document.getElementById("bendvalue").innerHTML=val;
            }, 10);
        });
        
        var fireMod = document.createElement("input");
        fireMod.id="fireMod"; fireMod.type="button"; 
        fireMod.value="Fire Midi (Mod)";
        document.getElementById("modFireButton").appendChild(fireMod);
        document.getElementById("fireMod").addEventListener("click", function() {
            wmaw.setPitchBendValue(0, 0, 16384, 8192);
            wmaw.sendProgramChange(0, 0, 34, 0);
            
            wmaw.sendNoteOn(0, 0, 72, 120, 0);
            var val=0;
            var d=1;
            var t=null;
            t=setInterval(function() {
                val++;
                if(val>=127) {
                    d=-1;
                } else if(val<=0) {
                    clearInterval(t);
                    t=false;
                }
                if(t==false) {
                    wmaw.sendNoteOff(0, 0, 72, 120, 0);
                    val=0;
                } else {
                    val=val+d*2;
                }
                wmaw.sendModulationValue(0, 0, val, 0);
                document.getElementById("modvalue").innerHTML=val;
                console.log(val);
            }, 50);
            
        });

        
    });

    

};


wmaw.initMidi();

