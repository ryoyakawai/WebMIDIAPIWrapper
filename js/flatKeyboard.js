/**
 *  flatKeyboard.js v1.1.1 by @ryoyakawai
 *  Copyright (c) 2014 Ryoya KAWAI. All rights reserved.
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

var FlatKeyboard = function(elem) {
    this.touchSupport = ('ontouchstart' in window);
    this.drawKeys=[];
    this.drawCtrls=[];
    this.mouseClick=false;
    
    this.octave={"draw":2, "now":3, "min":1, "max":7};
    this.drawSize={
        "canvas":   { "width":false, "height":false },
        "preSet":   {
            "top": {"white": false, "black": 12, "ctrl": 34 },
            "left": {"white": 148, "black": false, "ctrl": 34 }
        },
        "ctrlArea": { "width": 140,
                      "octave": {
                          "disp": {"left": 22, "top": 95, "width": 90, "height":30},
                          "minus": {"left": 16, "top": 135, "width": 45, "height": 45},
                          "plus": {"left": 73, "top": 135, "width": 45, "height": 45}
                      }
                    },
        "key":      { "width":40, "height":80, "spaceX":5, "spaceY":20 }
    };
    this.drawSize.canvas={
        "width":this.drawSize.preSet.left.white+this.octave.draw*7*(this.drawSize.key.width+this.drawSize.key.spaceX)+(this.drawSize.key.width+this.drawSize.key.spaceX)+3*this.drawSize.key.spaceX,
        "height":2*this.drawSize.key.height+2*this.drawSize.key.spaceY
    };
    this.drawSize.preSet.top.white=this.drawSize.key.height+2*this.drawSize.preSet.top.black;
    this.drawSize.preSet.left.black=this.drawSize.preSet.left.white+this.drawSize.key.width/2;
    this.color={
        "key": { "white": { "fill":"#ffffff", "stroke":"#707070" },
                 "black": { "fill":"#a0a0a0", "stroke":"#707070" }
               },
        "text": {"logo": {"fill":"#696969", "stroke":"#606060"}}
    };
    
    this.key={ };
    this.key={
        "note": ["C", "D", "E", "F", "G", "A", "B"],
        "order": ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
        "itnl2Key": {},
        "key2Itnl": []
    };
    for(var i=24, j=0, number=1; i<=108; i++) {
        this.key["itnl2Key"][this.key["order"][j]+number]=i;
        this.key["key2Itnl"][i]=this.key["order"][j]+number;
        j++;
        if(j==this.key["order"].length) {
            j=0; number++;
        }
    }
    this.key["itnl2Key"]["A0"]=21,  this.key["key2Itnl"][21]="A0";
    this.key["itnl2Key"]["A#0"]=22, this.key["key2Itnl"][22]="A#0";
    this.key["itnl2Key"]["B0"]=23,  this.key["key2Itnl"][23]="B0";
    
    this.noteOnStatus=[];
    for(var i=0; i<this.key.key2Itnl.length; i++) {
        this.noteOnStatus[i]=false;
    }

    // octave
    this.drawCtrls.push({ "label":"octaveMinus", "on":false, "x":this.drawSize.ctrlArea.octave.minus.left, "y":this.drawSize.ctrlArea.octave.minus.top });
    this.drawCtrls.push({ "label":"octavePlus", "on":false, "x":this.drawSize.ctrlArea.octave.plus.left, "y":this.drawSize.ctrlArea.octave.plus.top });

    // white
    for(var i=0, keyCnt=0, keyOct=0; i<=7*this.octave.draw; i++) {
        if(i!=0 && i%this.key.note.length==0) {
            keyOct++;
            keyCnt=0;
        }
        var label=this.key.note[keyCnt]+":"+keyOct;
        var info={ "label":label, "on":false, "x":this.drawSize.preSet.left.white+i*(this.drawSize.key.spaceX+this.drawSize.key.width), "y":this.drawSize.preSet.top.white };
        this.drawKeys.push(info);
        keyCnt++;
    }
    // black
    for(var i=0, keyCnt=0, keyOct=0; i<7*this.octave.draw; i++) {
        if(i!=0 && i%this.key.note.length==0) {
            keyOct++;
            keyCnt=0;
        }
        var label=this.key.note[keyCnt]+"#:"+keyOct;
        if(label.match(/E|B/)==null) {
            var info={ "label":label, "on":false, "x":this.drawSize.preSet.left.white+i*(this.drawSize.key.spaceX+this.drawSize.key.width)+Math.floor((this.drawSize.key.width+this.drawSize.key.spaceX)/2), "y":this.drawSize.preSet.top.black};
            this.drawKeys.push(info);
        }
        keyCnt++;
    }

    this.canvas=document.getElementById(elem);

    this.context=this.canvas.getContext("2d");
    this.canvas.setAttribute("width", parseInt(this.drawSize.canvas.width)+1+"px");
    this.canvas.setAttribute("height", parseInt(this.drawSize.canvas.height)+1+"px");

    this.connected=false;
    this.MIDIEvent=false;
    this.timerId=false;

    var self=this;
    function updateNoteon(keyOn) {
        for(var i=0; i<this.key.key2Itnl.length; i++) {
            if(this.noteOnStatus[i]===false) {
                if(typeof keyOn[i]!="undefined") {
                    this.noteOnStatus[i]=true;
                    this.noteOn(i);
                }
            } else {
                if(typeof keyOn[i]=="undefined") {
                    this.noteOnStatus[i]=false;
                    this.noteOff(i);
                }
            }
        }
    }
    function convert2Itnl(dKeyNo) {
        var t=this.drawKeys[dKeyNo].label.split(":");
        t[1]=parseInt(t[1])+this.octave.now;
        return {"keyNo":dKeyNo, "itnl":t.join("")};
    }
    function updateKey(event) {
        var keyOn=[];
        allDispNoteOff.bind(this)();
        if(event.type=="mouseup") {
            updateNoteon.bind(this)([]);
            return;
        }
        var pos=this.getPosition.bind(this)(event);
        // all touched ended
        if(pos.length==0) {
            updateNoteon.bind(this)([]);
        }
        for(var i=0; i<pos.length; i++) {
            var key=this.getActiveKeyInfo(pos[i]);
            if(key.type=="key" && key.num!="undefined") {
                event.preventDefault();
                this.drawKeys[key.num].on=true;
                this.onmessageLED.bind(this)();
                // conver to Key Name
                var itnl=convert2Itnl.bind(this)(key.num);
                var midiNoteNo=this.key.itnl2Key[itnl.itnl];
                keyOn[midiNoteNo]=itnl.itnl;
            }
            updateNoteon.bind(this)(keyOn);
            if(key.type=="ctrl" && key.num!="undefined" && event.type!="touchmove") {
                event.preventDefault();
                updateCtrl.bind(this)(this.drawCtrls[key.num]);
                this.drawCtrls[key.num].on=true;
            }
        }
    }
    function updateCtrl(key) {
        if(key.label.match(/octave/)!=null) {
            if(key.label.match(/Plus/)!=null) {
                if(this.octave.max>=this.octave.now+this.octave.draw) {
                    this.octave.now++;
                }
            }
            if(key.label.match(/Minus/)!=null) {
                if(this.octave.min<this.octave.now) {
                    this.octave.now--;
                }
            }
        }
    }
    
    // event listener
    this.canvas.addEventListener("touchstart", function(event){
        updateKey.bind(self)(event);
    });
    this.canvas.addEventListener("touchmove", function(event){
        updateKey.bind(self)(event);
    });
    this.canvas.addEventListener("touchend", function(event){
        updateKey.bind(self)(event);
    });
    this.canvas.addEventListener("mousedown", function(event){
        self.mouseClick=true;
        updateKey.bind(self)(event);
    });
    this.canvas.addEventListener("mousemove", function(event){
        if(self.mouseClick==true) {
            updateKey.bind(self)(event);
        }
    });
    this.canvas.addEventListener("mouseup", function(event){
        self.mouseClick=false;
        updateKey.bind(self)(event);
    });
    
    function allDispNoteOff() {
        for(var i=0; i<this.drawKeys.length; i++) {
            this.drawKeys[i].on=false;
        }
        for(var i=0; i<this.drawCtrls.length; i++) {
            this.drawCtrls[i].on=false;
        }
    }
    
};

FlatKeyboard.prototype={
    setOctave: function(num){
        this.octave.draw=num;
    },

    // Refferd URL: http://devlabo.blogspot.jp/2010/03/javascriptcanvas.html
    // l: left, t: top, w: width, h: height, r: radius
    drawRoundRect: function(context, type, l, t, w, h, r) {
        var pi = Math.PI;
        context.beginPath();
        context.arc(l + r, t + r, r, - pi, - 0.5 * pi, false);
        context.arc(l + w - r, t + r, r, - 0.5 * pi, 0, false);
        context.arc(l + w - r, t + h - r, r, 0, 0.5 * pi, false);
        context.arc(l + r, t + h - r, r, 0.5 * pi, pi, false);
        context.closePath();
        switch(type) {
          case "fill":
            context.fill();
            break;
          case "stroke":
            context.stroke();
            break;
        }
    },

    setConnected: function() {
        this.connected=true;
    },
    onmessage: function(midiMsg) {
        this.onmessageLED();
        var data={
            "raw": midiMsg,
            "msg": midiMsg[0].toString(16),
            "itnl": this.key.key2Itnl[parseInt(midiMsg[1])]
        };
        var tOct=data.itnl.substr(-1, 1);
        var tKey=data.itnl.substr(0, 1);
        if(data.itnl.length>=3) {
            tKey=data.itnl.substr(0, 2);
        }
        var tko=[tKey, tOct-this.octave.now].join("");
        if(this.octave.now<=tOct && this.octave.now+2>=tOct) {
            for(var i=0; i<this.drawKeys.length; i++) {
                if(tko == (this.drawKeys[i].label.split(":")).join("")) {
                    if(data.msg.substr(0, 1)=="8") {
                        this.drawKeys[i].on=false;
                    }
                    if(data.msg.substr(0, 1)=="9") {
                        this.drawKeys[i].on=true;
                    }
                }
            }
        }
    },
    noteOn: function(note) {
        console.log("[Set noteOn Eventhandler] note:", note);
    },
    noteOff: function(note) {
        console.log("[Set noteOff Eventhandler] note:", note);
    },

    draw: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.context.fillStyle="#ffffff";
        this.context.strokeStyle="#a0a0a0";
        this.drawRoundRect(this.context, "fill", 0.5, 0.5, this.drawSize.canvas.width, this.drawSize.canvas.height, 5);
        this.drawRoundRect(this.context, "stroke", 0.5, 0.5, this.drawSize.canvas.width+0.5, this.drawSize.canvas.height+0.5, 5);

        // keys
        for(var i=0; i<this.drawKeys.length; i++) {
            this.context.strokeStyle="#707070";
            this.context.fillStyle="#ffffff";
            if(this.drawKeys[i].label.match(/#/)!=null){
                this.context.fillStyle="#a0a0a0";
                this.context.strokeStyle="#707070";
            }
            if(this.drawKeys[i].on==true){
                this.context.fillStyle="#f9897c";
            }
            this.drawRoundRect(this.context, "fill", this.drawKeys[i].x+0.5, this.drawKeys[i].y+0.5, this.drawSize.key.width, this.drawSize.key.height, 5);
            this.drawRoundRect(this.context, "stroke", this.drawKeys[i].x+0.5, this.drawKeys[i].y+0.5, this.drawSize.key.width, this.drawSize.key.height, 5);
        }
        
        // MIDI Input LED
        this.context.fillStyle="#f5f5f5";
        if(this.MIDIEvent===true) {
            this.context.fillStyle="#c0c0c0";
        }
        this.drawRoundRect(this.context, "fill", 8+0.5, 8+0.5, 15, 5, 2);
        this.context.strokeStyle="#696969";
        this.drawRoundRect(this.context, "stroke", 8+0.5, 8+0.5, 15, 5, 2);

        // octave display
        this.context.fillStyle="#696969";
        this.drawRoundRect(this.context, "fill", this.drawSize.ctrlArea.octave.disp.left+0.5, this.drawSize.ctrlArea.octave.disp.top+0.5, this.drawSize.ctrlArea.octave.disp.width, this.drawSize.ctrlArea.octave.disp.height, 2);
        this.context.strokeStyle="#898989";
        this.drawRoundRect(this.context, "stroke", this.drawSize.ctrlArea.octave.disp.left+0.5, this.drawSize.ctrlArea.octave.disp.top+0.5, this.drawSize.ctrlArea.octave.disp.width, this.drawSize.ctrlArea.octave.disp.height, 2);
        this.context.fillStyle="#f5f5f5";
        this.context.font="13px 'Arial'";
        this.context.fillText("Octave", this.drawSize.ctrlArea.octave.disp.left+3+0.5, this.drawSize.ctrlArea.octave.disp.top+11+0.5);
        this.context.font="22px bold 'Arial'";
        this.context.fillText(this.octave.now, this.drawSize.ctrlArea.octave.disp.left+63+0.5, this.drawSize.ctrlArea.octave.disp.top+24+0.5);
        this.context.fillStyle="#ffffff";
        if(this.drawCtrls[0].on==true){
            this.context.fillStyle="#f9897c";
        }
        this.drawRoundRect(this.context, "fill", this.drawSize.ctrlArea.octave.minus.left+0.5, this.drawSize.ctrlArea.octave.minus.top+0.5, this.drawSize.ctrlArea.octave.minus.width, this.drawSize.ctrlArea.octave.minus.height, 5);
        this.drawRoundRect(this.context, "stroke", this.drawSize.ctrlArea.octave.minus.left+0.5, this.drawSize.ctrlArea.octave.minus.top+0.5, this.drawSize.ctrlArea.octave.minus.width, this.drawSize.ctrlArea.octave.minus.height, 5);
        this.context.fillStyle="#ffffff";
        if(this.drawCtrls[1].on==true){
            this.context.fillStyle="#f9897c";
        }
        this.drawRoundRect(this.context, "fill", this.drawSize.ctrlArea.octave.plus.left+0.5, this.drawSize.ctrlArea.octave.plus.top+0.5, this.drawSize.ctrlArea.octave.plus.width, this.drawSize.ctrlArea.octave.plus.height, 5);
        this.drawRoundRect(this.context, "stroke", this.drawSize.ctrlArea.octave.plus.left+0.5, this.drawSize.ctrlArea.octave.plus.top+0.5, this.drawSize.ctrlArea.octave.plus.width, this.drawSize.ctrlArea.octave.plus.height, 5);

        // sign on control keys
        this.context.strokeStyle="#696969";
        this.context.font="36px 'Arial'";
        this.context.strokeText("-", this.drawSize.ctrlArea.octave.minus.left+16+0.5, 168+0.5);
        this.context.strokeText("+", this.drawSize.ctrlArea.octave.plus.left+12+0.5, 168+0.5);

        

        // Logo
        this.context.fillStyle=this.color.text.logo.fill;
        this.context.font="italic bold 30px 'Verdana'";
        this.context.fillText("flatKEY", 20+0.5, 73+0.5);
        this.context.strokeStyle=this.color.text.logo.stroke;
        this.context.font="italic bold 30px 'Verdana'";
        this.context.strokeText("flatKEY", 20+0.5, 73+0.5);

        this.context.fillStyle=this.color.text.logo.fill;
        this.context.font="italic bold 12px 'Verdana'";
        this.context.fillText("Output NoteNo", 32+0.5, 38+0.5);
        this.context.strokeStyle=this.color.text.logo.stroke;
        this.context.font="italic bold 12px 'Verdana'";
        this.context.strokeText("Output NoteNo", 32+0.5, 38+0.5);

    },
    
    getPosition: function(event) {
        var out=[];
        var rect = event.target.getBoundingClientRect();

        if(event.type.match(/mouse/)!=null) {
            out.push({
                "x": event.clientX - rect.left,
                "y": event.clientY - rect.top
            });
        } else if(event.type.match(/touch/)!=null) {
            for(var i=0; i<event.touches.length; i++) {
                out.push({
                    "x": event.touches[i].clientX-rect.left,
                    "y": event.touches[i].clientY-rect.top
                });
            }
        } else {
            console.log("EVENT: ether mouse event nor touch event.");
        }
        return out;
    },

    getActiveKeyInfo: function(pos) {
        var out={"num": "undefined", "type":"undefined"};
        for(var i=0; i<this.drawKeys.length; i++) {
            if(pos.x>this.drawKeys[i].x && pos.x<this.drawKeys[i].x+this.drawSize.key.width
              && pos.y>this.drawKeys[i].y && pos.y<this.drawKeys[i].y+this.drawSize.key.height) {
                out={"num": i, "type":"key"};
                break;
            }
        }
        if(out.num=="undefined" && out.type=="undefined") {
            for(var i=0; i<this.drawCtrls.length; i++) {
                if(pos.x>this.drawCtrls[i].x && pos.x<this.drawCtrls[i].x+this.drawSize.ctrlArea.octave.minus.width
                   && pos.y>this.drawCtrls[i].y && pos.y<this.drawCtrls[i].y+this.drawSize.ctrlArea.octave.minus.height) {
                    out={"num": i, "type":"ctrl"};
                    break;
                }
            }
        }
        return out;
    },

    onmessageLED: function() {
        // MIDI Input LED
        var self=this;
        if(this.MIDIEvent===false && this.timerId===false) {
            self.MIDIEvent=true;
            self.timerId=setTimeout(function() {
                self.MIDIEvent=false;
                clearTimeout(self.timerId);
                self.timerId=false;
            }, 128);
        }
    }
};

