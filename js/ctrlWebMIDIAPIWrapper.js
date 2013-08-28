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

try {
    if(typeof navigator.requestMIDIAccess!=="function") {
        throw new Error("navigator.requestMIDIAccess is NOT a function.");
    }
    document.getElementById("errorText").style.setProperty("display", "none");

    var wmaw = new WebMIDIAPIWrapper( true );
    var config = { "programNo": 0 };
    var timerId;
    var disp=false;
    var fKey = new FlatKeyboard("keyboard");
    
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
                if(typeof wmaw.ports.out[0]==="object") {
                    wmaw.ports.out[0].send([event.data[0], event.data[1], event.data[2]]);
                }
                fKey.onmessage(event.data);
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
        document.getElementById("devicesText").style.removeProperty("visibility");
        
        // eventlistener for moButton
        document.getElementById("connectoutput").addEventListener("click", function(){
            if(disp===false) {
                disp=true;
                
                timerId = setInterval(function(){
                    fKey.draw();
                }, 80);
                fKey.setConnected();
                fKey.noteOn=function(noteNo) {
                    wmaw.sendNoteOn(0, 0, noteNo, 127, 0);
                };
                fKey.noteOff=function(noteNo) {
                    wmaw.sendNoteOff(0, 0, noteNo, 127, 0);
                };

                var selIdx=document.getElementById("midioutlist").value;
                wmaw.setMidiOutputToPort(selIdx, 0);
            
                var fireMidi = document.createElement("input");
                fireMidi.id="fireMidi"; fireMidi.type="button"; 
                fireMidi.value="Fire MIDI";
                document.getElementById("midiFireButton").appendChild(fireMidi);
                document.getElementById("fireMidi").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();
                
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
            
                var fireSustain = document.createElement("input");
                fireSustain.id="fireSustain"; fireSustain.type="button"; 
                fireSustain.value="Fire MIDI (Sustain)";
                document.getElementById("sustainFireButton").appendChild(fireSustain);
                document.getElementById("fireSustain").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();
                    
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
                fireBend.value="Fire MIDI (Bend)";
                document.getElementById("bendFireButton").appendChild(fireBend);
                document.getElementById("fireBend").addEventListener("click", function() {
                    wmaw.setPitchBendValue(0, 0, 16384, 8192);
                    //wmaw.sendProgramChange(0, 0, 30, 0);
                    
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
                
                var prgChange = document.createElement("input");
                prgChange.id="prgChange"; prgChange.type="range"; 
                prgChange.min=0, prgChange.max=127, prgChange.value=0;
                prgChange.style.setProperty("width", "200px");
                prgChange.addEventListener("change", function() {
                    document.getElementById("voicename").innerHTML=this.value+". "+voiceList.getGMVoiceName("instruments", this.value);
                    wmaw.sendProgramChange(0, 0, this.value, 0);
                    config.programNo=this.value;
                });
                document.getElementById("prgChange").appendChild(prgChange);
                document.getElementById("prgChange").style.setProperty("margin", "100px 0px 0px 0px");
                document.getElementById("voicename").innerHTML="0. "+voiceList.getGMVoiceName("instruments", 0);
                document.getElementById("prgChange").appendChild(prgChange);
                document.getElementById("prgChangeText").style.removeProperty("visibility");
                document.getElementById("prgChangeText01").style.removeProperty("visibility");
                document.getElementById("prgChangeText02").style.removeProperty("visibility");
                
                var fireMod = document.createElement("input");
                fireMod.id="fireMod"; fireMod.type="button"; 
                fireMod.value="Fire MIDI (Mod)";
                document.getElementById("modFireButton").appendChild(fireMod);
                document.getElementById("fireMod").addEventListener("click", function() {
                    wmaw.setPitchBendValue(0, 0, 16384, 8192);
                    //wmaw.sendProgramChange(0, 0, 34, 0);
                    
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
                    }, 50);
                    
                });  
                
                var fireTri = document.createElement("input");
                fireTri.id="fireSustain"; fireTri.type="button"; 
                fireTri.value="Fire Tritone";
                document.getElementById("fireTri").appendChild(fireTri);
                document.getElementById("fireTriText").style.removeProperty("visibility");
                document.getElementById("fireTri").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();
                    wmaw.sendProgramChange(0, 0, 12, 0);
                    wmaw.sendProgramChange(0, 0, config.programNo, 370);
                    
                    wmaw.sendNoteOn(0, 0, 62, 127, 0);
                    wmaw.sendNoteOff(0, 0, 62, 0, 120);
                    
                    wmaw.sendNoteOn(0, 0, 69, 127, 120);
                    wmaw.sendNoteOff(0, 0, 69, 0, 240);
                    
                    wmaw.sendNoteOn(0, 0, 74, 127, 240);
                    wmaw.sendNoteOff(0, 0, 74, 0, 360);
                    
                });
                
                var fireSustain2 = document.createElement("input");
                fireSustain2.id="fireSustain2"; fireSustain2.type="button"; 
                fireSustain2.value="Fire MIDI (Sustain one Note)";
                document.getElementById("sustain2FireButton").appendChild(fireSustain2);
                document.getElementById("fireSustain2").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();
                    
                    wmaw.sendSustainStatus(0, 0, "on", 0);
                    wmaw.sendSustainStatus(0, 0, "off", 5000);
                    
                    wmaw.sendNoteOn(0, 0, 72, 127, 0);
                    wmaw.sendNoteOff(0, 0, 72, 127, 5000);
                });
                
                document.getElementById("allOffText").style.removeProperty("visibility");
                var allSndOff = document.createElement("input");
                allSndOff.id="allSnfOff"; allSndOff.type="button"; 
                allSndOff.value="AllSoundOff";
                document.getElementById("allSndOff").appendChild(allSndOff);
                document.getElementById("allSndOff").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();
                    wmaw.sendAllSoundOff(0, 0, 0);
                });

                var allNoteOff = document.createElement("input");
                allNoteOff.id="allSnfOff"; allNoteOff.type="button"; 
                allNoteOff.value="AllNoteOff";
                document.getElementById("allNoteOff").appendChild(allNoteOff);
                document.getElementById("allNoteOff").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();
                    wmaw.sendAllNoteOff(0, 0, 0);
                });
                
                document.getElementById("sendRaw01").style.removeProperty("visibility");
                var sendRaw = document.createElement("input");
                sendRaw.id="sendRaw"; sendRaw.type="button"; 
                sendRaw.value="Fire MIDI (sendRaw())";
                document.getElementById("sendRaw").appendChild(sendRaw);
                document.getElementById("sendRaw").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();
                    
                    wmaw.sendRaw(0, [0x90, 72, 60], 0);
                    wmaw.sendRaw(0, [0x80, 72, 60], 500);
                    
                    wmaw.sendRaw(0, [0x90, 74, 80], 500);
                    wmaw.sendRaw(0, [0x80, 74, 80], 1000);
                    
                    wmaw.sendRaw(0, [0x90, 76, 100], 1000);
                    wmaw.sendRaw(0, [0x80, 76, 100], 1500);
                    
                    wmaw.sendRaw(0, [0x90, 77, 120], 1500);
                    wmaw.sendRaw(0, [0x80, 77, 120], 2000);
                    
                    wmaw.sendRaw(0, [0x90, 79, 127], 2000);
                    wmaw.sendRaw(0, [0x80, 79, 127], 2500);
                    
                });
            }
        });
        
    };
    
    wmaw.initMidi();

} catch (e) {
    document.getElementById("errorText").style.removeProperty("visibility");
    document.getElementById("errorText").innerHTML='Something went wrong....<br> I think you might need to install <a href="http://jazz-soft.net/doc/Jazz-Plugin" target="_blank">Jazz-Plugin<a>.';
    console.log(e.message);
}



