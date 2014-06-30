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

    // to parse midi message
    var parseMIDIInput=document.createElement("input");
    parseMIDIInput.id="midiMsg";
    parseMIDIInput.size="50";
    parseMIDIInput.style.setProperty("border-radius", "4px");
    parseMIDIInput.value="0x90 0x4f 0x7f";
    var parseMIDIInputB=document.createElement("input");
    parseMIDIInputB.id="midiMsgB"; parseMIDIInputB.type="button";
    parseMIDIInputB.value="Parse MIDI Message";
    document.querySelector("#midiMsgTextBox").appendChild(parseMIDIInput);
    document.querySelector("#midiMsgTextBox").appendChild(parseMIDIInputB);
    document.querySelector("#midiMsgB").addEventListener("click", function(){
        var midiMsg=document.querySelector("#midiMsg").value;
        if(midiMsg=="") {
            document.querySelector("#midiMsg").style.setProperty("border", "2px solid #dc143c");
            document.querySelector("#midiMsg").style.setProperty("background-color", "#db99a6");
            setTimeout(function(){
                document.querySelector("#midiMsg").style.removeProperty("border");
                document.querySelector("#midiMsg").style.removeProperty("background-color");
            }, 400);
        } else {
            var mm=midiMsg.split(" ");
            for(var i=0; i<mm.length; i++) {
                mm[i]=parseInt(mm[i], 16);
            }
            var result=wmaw.parseMIDIMessage(mm);
            var dispResult="", tmp=[];
            if(typeof result.type!="undefined") tmp.push("[Type] " + result.type + "<br>");
            if(typeof result.subType!="undefined") tmp.push("[subType] " + result.subType + "<br>");
            if(typeof result.event.channel!="undefined") tmp.push("[channel] " + result.event.channel + "<br>");
            if(typeof result.event.ctrlName!="undefined") tmp.push("[ctrlName] " + result.event.ctrlName + "<br>");
            if(typeof result.event.ctrlStatus!="undefined") tmp.push("[ctrlStatus] " + result.event.ctrlStatus + "<br>");
            if(typeof result.event.programNumber!="undefined") tmp.push("[programNo] " + result.event.programNumber + "<br>");
            if(typeof result.event.valueType!="undefined") tmp.push("[Type] " + result.event.valueType + "<br>");
            if(typeof result.event.noteNumber!="undefined") tmp.push("[noteNum] " + result.event.noteNumber + "<br>");
            if(typeof result.event.velocity!="undefined") tmp.push("[velocity] " + result.event.velocity + "<br>");
            if(typeof result.event.value!="undefined") tmp.push("[value] " + result.event.value + "<br>");
            if(typeof result.event.amount!="undefined") tmp.push("[amount] " + result.event.amount + "<br>");
            console.log(result);
            var raw="";
            for(var i=0; i<result.data.length; i++) {
                raw = raw + " " + "0x" + result.data[i].toString(16);
            }
            tmp.push("[raw] " + raw);
            
            for(var i=0; i<tmp.length; i++) {
                dispResult=dispResult + tmp[i];
            }
            document.querySelector("#result").innerHTML=dispResult;
            //console.log(result, dispResult);
        }
    });
    
    
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
                try {
                    var midimsg0=event.data[0].toString(16), midimsg1=event.data[1].toString(16), midimsg2=event.data[2].toString(16);
                    var ch=document.querySelector("#changeChValue").value-1;
                    var sb="0x"+midimsg0.substr(0, 1) + ch;
                    if(typeof wmaw.ports.out[0]==="object") {
                        wmaw.ports.out[0].send([sb, event.data[1], event.data[2]]);
                    }
                    fKey.onmessage(event.data);
                    wmaw.parseMIDIMessage([sb, event.data[1], event.data[2]]);
                } catch (err) {
                    // console.error('Invalid Value', err);
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
                    var ch=document.querySelector("#changeChValue").value-1;;
                    wmaw.sendNoteOn(0, ch, noteNo, 127, 0);
                };
                fKey.noteOff=function(noteNo) {
                    var ch=document.querySelector("#changeChValue").value-1;;
                    wmaw.sendNoteOff(0, ch, noteNo, 127, 0);
                };

                var selIdx=document.getElementById("midioutlist").value;
                wmaw.setMidiOutputToPort(selIdx, 0);
            
                var fireMidi = document.createElement("input");
                fireMidi.id="fireMidi"; fireMidi.type="button"; 
                fireMidi.value="Fire MIDI";
                document.getElementById("midiFireButton").appendChild(fireMidi);
                document.getElementById("fireMidi").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();
                    var ch=document.querySelector("#changeChValue").value-1;;
                
                    wmaw.sendNoteOn(0, ch, 72, 60, 0);
                    wmaw.sendNoteOff(0, ch, 72, 60, 500);
                    
                    wmaw.sendNoteOn(0, ch, 74, 80, 500);
                    wmaw.sendNoteOff(0, ch, 74, 80, 1000);
                    
                    wmaw.sendNoteOn(0, ch, 76, 100, 1000);
                    wmaw.sendNoteOff(0, ch, 76, 100, 1500);
                    
                    wmaw.sendNoteOn(0, ch, 77, 120, 1500);
                    wmaw.sendNoteOff(0, ch, 77, 120, 2000);
                    
                    wmaw.sendNoteOn(0, ch, 79, 127, 2000);
                    wmaw.sendNoteOff(0, ch, 79, 127, 2500);
                    
                });
            
                var fireSustain = document.createElement("input");
                fireSustain.id="fireSustain"; fireSustain.type="button"; 
                fireSustain.value="Fire MIDI (Sustain)";
                document.getElementById("sustainFireButton").appendChild(fireSustain);
                document.getElementById("fireSustain").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();

                    var ch=document.querySelector("#changeChValue").value-1;;
                    
                    wmaw.sendSustainStatus(0, ch, "on", 0);
                    wmaw.sendSustainStatus(0, ch, "off", 2500);
                    
                    wmaw.sendNoteOn(0, ch, 72, 60, 0);
                    wmaw.sendNoteOff(0, ch, 72, 60, 500);
                    
                    wmaw.sendNoteOn(0, ch, 74, 80, 500);
                    wmaw.sendNoteOff(0, ch, 74, 80, 1000);
                    
                    wmaw.sendNoteOn(0, ch, 76, 100, 1000);
                    wmaw.sendNoteOff(0, ch, 76, 100, 1500);
                    
                    wmaw.sendNoteOn(0, ch, 77, 120, 1500);
                    wmaw.sendNoteOff(0, ch, 77, 120, 2000);
                    
                    wmaw.sendNoteOn(0, ch, 79, 127, 2000);
                    wmaw.sendNoteOff(0, ch, 79, 127, 2500);
                });
                
                
                var fireBend = document.createElement("input");
                fireBend.id="fireBend"; fireBend.type="button"; 
                fireBend.value="Fire MIDI (Bend)";
                document.getElementById("bendFireButton").appendChild(fireBend);
                document.getElementById("fireBend").addEventListener("click", function() {
                    wmaw.setPitchBendValue(0, 0, 16384, 8192);
                    //wmaw.sendProgramChange(0, 0, 30, 0);
                    var ch=document.querySelector("#changeChValue").value-1;;
                    
                    wmaw.sendNoteOn(0, ch, 72, 120, 0);
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
                        var ch=document.querySelector("#changeChValue").value-1;;
                        wmaw.sendPitchBend(0, ch, val, 0);
                        if(t==false) {
                            wmaw.sendNoteOff(0, ch, 72, 120, 0);
                            wmaw.sendPitchBend(0, ch, wmaw.ports.out[0].pitchBendValue.center, 0);
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
                    var ch=document.querySelector("#changeChValue").value-1;;
                    wmaw.sendProgramChange(0, ch, this.value, 0);
                    config.programNo=this.value;
                });
                document.getElementById("prgChange").appendChild(prgChange);
                document.getElementById("voicename").innerHTML="0. "+voiceList.getGMVoiceName("instruments", 0);
                document.getElementById("prgChange").appendChild(prgChange);
                document.getElementById("prgChangeText").style.removeProperty("visibility");
                document.getElementById("prgChangeText01").style.removeProperty("visibility");
                document.getElementById("prgChangeText02").style.removeProperty("visibility");
                
                var changeCh = document.createElement("input");
                changeCh.id="changeChValue"; changeCh.type="number"; 
                changeCh.style.setProperty("width", "40px");
                changeCh.min=1, changeCh.max=16, changeCh.value=1;
                document.getElementById("changeCh").appendChild(changeCh);
                document.getElementById("changeCh").style.setProperty("padding", "3px");
                document.getElementById("changeCh").style.setProperty("margin", "0px 0px 10px 0px");
                document.getElementById("control").style.removeProperty("visibility");


                var fireMod = document.createElement("input");
                fireMod.id="fireMod"; fireMod.type="button"; 
                fireMod.value="Fire MIDI (Mod)";
                document.getElementById("modFireButton").appendChild(fireMod);
                document.getElementById("fireMod").addEventListener("click", function() {
                    wmaw.setPitchBendValue(0, 0, 16384, 8192);
                    //wmaw.sendProgramChange(0, 0, 34, 0);
                    
                    var ch=document.querySelector("#changeChValue").value-1;;

                    wmaw.sendNoteOn(0, ch, 72, 120, 0);
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
                            wmaw.sendNoteOff(0, ch, 72, 120, 0);
                            val=0;
                        } else {
                            val=val+d*2;
                        }
                        wmaw.sendModulationValue(0, ch, val, 0);
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

                    var ch=document.querySelector("#changeChValue").value-1;;

                    wmaw.sendProgramChange(0, ch, 12, 0);
                    wmaw.sendProgramChange(0, ch, config.programNo, 370);
                    
                    wmaw.sendNoteOn(0, ch, 62, 127, 0);
                    wmaw.sendNoteOff(0, ch, 62, 0, 120);
                    
                    wmaw.sendNoteOn(0, ch, 69, 127, 120);
                    wmaw.sendNoteOff(0, ch, 69, 0, 240);
                    
                    wmaw.sendNoteOn(0, ch, 74, 127, 240);
                    wmaw.sendNoteOff(0, ch, 74, 0, 360);
                    
                });
                
                var fireSustain2 = document.createElement("input");
                fireSustain2.id="fireSustain2"; fireSustain2.type="button"; 
                fireSustain2.value="Fire MIDI (Sustain one Note)";
                document.getElementById("sustain2FireButton").appendChild(fireSustain2);
                document.getElementById("fireSustain2").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();

                    var ch=document.querySelector("#changeChValue").value-1;;
                    
                    wmaw.sendSustainStatus(0, ch, "on", 0);
                    wmaw.sendSustainStatus(0, ch, "off", 5000);
                    
                    wmaw.sendNoteOn(0, ch, 72, 127, 0);
                    wmaw.sendNoteOff(0, ch, 72, 127, 5000);
                });
                
                document.getElementById("allOffText").style.removeProperty("visibility");
                var allSndOff = document.createElement("input");
                allSndOff.id="allSnfOff"; allSndOff.type="button"; 
                allSndOff.value="AllSoundOff";
                document.getElementById("allSndOff").appendChild(allSndOff);
                document.getElementById("allSndOff").addEventListener("click", function() {
                    wmaw.initializePerformanceNow();
                    for(var i=0; i<16; i++) {
                        wmaw.sendAllSoundOff(0, i, 0);
                    }
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
                    var ch=document.querySelector("#changeChValue").value-1;;
                    var chH=ch.toString(16);
                    console.log(chH);
                    
                    wmaw.sendRaw(0, ["0x9"+chH, 72, 60], 0);
                    wmaw.sendRaw(0, ["0x8"+chH, 72, 60], 500);
                    
                    wmaw.sendRaw(0, ["0x9"+chH, 74, 80], 500);
                    wmaw.sendRaw(0, ["0x8"+chH, 74, 80], 1000);
                    
                    wmaw.sendRaw(0, ["0x9"+chH, 76, 100], 1000);
                    wmaw.sendRaw(0, ["0x8"+chH, 76, 100], 1500);
                    
                    wmaw.sendRaw(0, ["0x9"+chH, 77, 120], 1500);
                    wmaw.sendRaw(0, ["0x8"+chH, 77, 120], 2000);
                    
                    wmaw.sendRaw(0, ["0x9"+chH, 79, 127], 2000);
                    wmaw.sendRaw(0, ["0x8"+chH, 79, 127], 2500);
                    
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



