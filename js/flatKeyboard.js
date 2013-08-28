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

var FlatKeyboard = function(elementName) {
    this.cSize={"width": 530, "height": 190};
    this.preSet={ "white": 148, "black": 28, "ctrl": 34 };
    
    this.canvas=document.getElementById(elementName);
    this.canvas.setAttribute("width", this.cSize.width+"px");
    this.canvas.setAttribute("height", this.cSize.height+"px");
    this.ctx=this.canvas.getContext("2d");

    this.playKey=[];
    this.ctrlKey=null;

    this.connected=false;
    
    this.octave=4;

    this.MIDIEvent=false;
    this.timerId=false;
    
    this.key={ };
    this.key={
        "note": ["C", "D", "E", "F", "G", "A", "B", "C+"],
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
};

FlatKeyboard.prototype={
    setConnected: function() {
        this.connected=true;
    },
    onmessage: function(midiMsg) {
        this.onmessageLED();
        var data={
            "raw": midiMsg,
            "msg": midiMsg[0].toString(16),
            "keyInfo": this.key.key2Itnl[midiMsg[1]]
        };
        data.octave=data.keyInfo.substr(data.keyInfo.length-1, 1);
        data.key=data.keyInfo.substr(0, 1);
        data.sf=null;
        switch(data.keyInfo.length.toString()) {
            case "3":
            data.sf="#";
            break;
        }
        for(var i=0; i<this.key.note.length; i++) {
            if(this.key.note[i]==data.key) {
                data.keyLetter=i.toString();
                if(data.keyLetter==0 && data.octave==this.octave+1) {
                    data.keyLetter="7"; // C in 1 octave higher 
                }
                if(data.sf=="#") {
                    data.keyLetter="#"+i.toString();
                }
                break;
            }
        }
        if((this.octave==data.octave) || (data.keyLetter=="7" && data.octave==this.octave+1))
        switch(data.msg.substr(0, 1)) {
          case "8":
            for(var i=0; i<this.playKey.length; i++) {
                if(typeof this.playKey[i] !=="undefined") {
                    if(this.playKey[i]==data.keyLetter) {
                        this.playKey.splice(i, 1);
                    }
                }
            }
            break;
          case "9":
            this.playKey.push(data.keyLetter);
            break;
        }
    }, 
    noteOn: function(note) {
        console.log("[Set noteOn Eventhandler] note:", note);
    },
    noteOff: function(note) {
        console.log("[Set noteOff Eventhandler] note:", note);
    },
    control00: function() {
        console.log("[Set Control00 Eventhandler] ");
    },
    control01: function() {
        console.log("[Set Control01 Eventhandler] ");
    },
    draw: function() {
        this.ctx.fillStyle="#ffffff";
        fillRoundRect(this.ctx, "fill", 2, 2, 530, 190, 5);
        this.ctx.strokeStyle="#a0a0a0";
        fillRoundRect(this.ctx, "stroke", 0, 0, 530-0.5, 190-0.5, 5);
        
        // keys
        // // black
        for(var i=0; i<7; i++) {
            if( i!=2 && i!=6 ) {
                this.ctx.fillStyle="#a0a0a0";
                this.ctx.strokeStyle="#707070";
                for(var j=0; j<this.playKey.length; j++) {
                    if(this.playKey[j].substring(0, 1)=="#"
                       && parseInt(this.playKey[j].substring(1, 2), 10)==i) {
                        this.ctx.fillStyle="#f9897c";
                    }
                }
                fillRoundRect(this.ctx, "fill", this.preSet.white+this.preSet.black+45*i+0.5, 10+0.5, 40, 80, 5);
                fillRoundRect(this.ctx, "stroke", this.preSet.white+this.preSet.black+45*i+0.5, 10+0.5, 40, 80, 5);
            }
        }
        // // white
        for(var i=0; i<8; i++) {
            this.ctx.strokeStyle="#707070";
            this.ctx.fillStyle="#ffffff";
            for(var j=0; j<this.playKey.length; j++) {
                if(this.playKey[j]==i) {
                    this.ctx.fillStyle="#f9897c";
                }
            }
            fillRoundRect(this.ctx, "fill", this.preSet.white+45*i+0.5, 100+0.5, 40, 80, 5);
            fillRoundRect(this.ctx, "stroke", this.preSet.white+45*i+0.5, 100+0.5, 40, 80, 5);
        }
        
        // controller
        this.ctx.strokeStyle="#707070";
        for(var i=0; i<3; i++) {
            if(i==0 || i==1){
                this.ctx.fillStyle="#ffffff";
                if(this.ctrlKey==i) {
                    this.ctx.fillStyle="#f9897c";
                }
                fillRoundRect(this.ctx, "fill", this.preSet.ctrl+38*i+0.5, 145+0.5, 30, 30, 5);
                fillRoundRect(this.ctx, "stroke", this.preSet.ctrl+38*i+0.5, 145+0.5, 30, 30, 5);
            }
            /*
            // to write other control button, change this condition
            if(i<0) { 
                fillRoundRect(this.ctx, "fill", this.preSet.ctrl+38*i, 148, 30, 30, 5);
                fillRoundRect(this.ctx, "stroke", this.preSet.ctrl+38*i, 148, 30, 30, 5);
            }
            */
        }
        

        // octave display
        this.ctx.fillStyle="#696969";
        fillRoundRect(this.ctx, "fill", this.preSet.ctrl+0.5, 105+0.5, 70, 30, 2);
        this.ctx.strokeStyle="#898989";
        fillRoundRect(this.ctx, "stroke", this.preSet.ctrl+0.5, 105+0.5, 70, 30, 2);
        this.ctx.fillStyle="#f5f5f5";
        this.ctx.font="11px 'Arial'";
        this.ctx.fillText("Octave", this.preSet.ctrl+3+0.5, 105+11+0.5);
        this.ctx.font="20px 'Arial'";
        this.ctx.fillText(this.octave, this.preSet.ctrl+48+0.5, 105+25+0.5);
        // sign on control keys
        this.ctx.strokeStyle="#696969";
        this.ctx.font="30px 'Arial'";
        this.ctx.strokeText("-", this.preSet.ctrl+9+0.5, 167+0.5);
        this.ctx.strokeText("+", this.preSet.ctrl+44+0.5, 170+0.5);
        // MIDI Input LED
        this.ctx.fillStyle="#f5f5f5";
        if(this.MIDIEvent===true) {
            this.ctx.fillStyle="#c0c0c0";
        }
        fillRoundRect(this.ctx, "fill", 8+0.5, 8+0.5, 15, 5, 2);
        this.ctx.strokeStyle="#696969";
        fillRoundRect(this.ctx, "stroke", 8+0.5, 8+0.5, 15, 5, 2);
        
        // Logo
        this.ctx.fillStyle="#696969";
        this.ctx.font="italic bold 30px 'Verdana'";
        this.ctx.fillText("flatKEY", 20+0.5, 73+0.5);
        this.ctx.strokeStyle="#606060";
        this.ctx.font="italic bold 30px 'Verdana'";
        this.ctx.strokeText("flatKEY", 20+0.5, 73+0.5);

        this.ctx.fillStyle="#696969";
        this.ctx.font="italic bold 12px 'Verdana'";
        this.ctx.fillText("Output NoteNo", 32+0.5, 38+0.5);
        this.ctx.strokeStyle="#606060";
        this.ctx.font="italic bold 12px 'Verdana'";
        this.ctx.strokeText("Output NoteNo", 32+0.5, 38+0.5);

        // Refferd URL: http://devlabo.blogspot.jp/2010/03/javascriptcanvas.html
        // l: left, t: top, w: width, h: height, r: radius
        function fillRoundRect(ctx, type, l, t, w, h, r) {
            var pi = Math.PI;
            ctx.beginPath();
            ctx.arc(l + r, t + r, r, - pi, - 0.5 * pi, false);
            ctx.arc(l + w - r, t + r, r, - 0.5 * pi, 0, false);
            ctx.arc(l + w - r, t + h - r, r, 0, 0.5 * pi, false);
            ctx.arc(l + r, t + h - r, r, 0.5 * pi, pi, false);
            ctx.closePath();
            switch(type) {
              case "fill":
                ctx.fill();
                break;
              case "stroke":
                ctx.stroke();
                break;
            }
        };

        var self=this;
        this.canvas.onmousedown=(function(event) {
            if(self.connected===false) {
                return;
            }
            var rect = event.target.getBoundingClientRect();
            var keyLetter=checkKey(event, rect);
            if(keyLetter===false) {
                return;
            }

            self.onmessageLED();

            // control key
            if(keyLetter.substr(0, 4)=="ctrl") {
                var idx=self.ctrlKey=keyLetter.substr(4,1);
                switch(idx) {
                  case "0":
                    if(self.octave>1) self.octave--;  
                    break;
                  case "1":
                    if(self.octave<7) self.octave++;  
                    break;
                }
            } else {
                // noteOn/Off
                var t=false;
                for(var i=0; i<self.playKey.length; i++) {
                    if(self.playKey==keyLetter) {
                        t=true;
                        break;
                    }
                }
                if(t===false)  {
                    self.playKey.push(keyLetter);
                    var noteNo=convert2KeyNo(keyLetter);
                    self.noteOn(noteNo);
                }
            }


        });
        this.canvas.onmouseup=(function(event) {
            if(self.connected===false) {
                return;
            }
            var rect = event.target.getBoundingClientRect();
            var keyLetter=checkKey(event, rect);
            if(keyLetter===false) {
                return;
            }

            self.onmessageLED();

            // control key
            if(keyLetter.substr(0, 4)=="ctrl") {
                self.ctrlKey=null;
            } else {
                // noteOn/Off
                var noteNo=convert2KeyNo(keyLetter);
                self.noteOff(noteNo);
                for(var i=0; i<self.playKey.length; i++) {
                    if(typeof self.playKey[i] !=="undefined") {
                        if(self.playKey[i]==keyLetter) {
                            self.playKey.splice(i, 1);
                        }
                    }
                }
            }
        });

        function convert2KeyNo(keyLetter) {
            if(keyLetter.substring(0,1)=="#") {
                keyLetter=self.key.note[keyLetter.substring(1,2)]+"#";
            } else {
                keyLetter=self.key.note[keyLetter];
            }

            var tOct=self.octave;
            if(keyLetter.length>=2 && keyLetter.substring(1,2)=="+") {
                tOct++;
                keyLetter=keyLetter.substring(0, 1);
            }
            return self.key["itnl2Key"][keyLetter+tOct.toString()];
        }
        
        function checkKey(event, rect) {
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            var out=false;
            
            if(y>=10 && y<=90) {
                for(var i=0; i<7; i++) {
                    var xKey=self.preSet.white+self.preSet.black+45*i+0.5;
                    if((i!=2 && i!=6) && x>= xKey && x<=xKey+40) {
                        out="#"+i;
                        break;
                    }
                }
            } else if(y>=100 && y<=180){
                for(var i=0; i<8; i++) {
                    var xKey=self.preSet.white+45*i+0.5;
                    if(x>=xKey && x<=xKey+40) {
                        out=i.toString();
                        break;
                    }
                }
            }
            // controller
            if(y>=145 &&y<=175) {
                for(var i=0; i<3; i++) {
                    var xKey=self.preSet.ctrl+38*i+0.5;
                    if(x>=xKey && x<=xKey+30) {
                        out="ctrl"+i;
                    }
                }
            }
            return out;
        }

        
    },
    onmessageLED: function() {
        // MIDI Input LED
        var self=this;
        if(this.MIDIEvent===false && this.timerId===false) {
            this.MIDIEvent=true;
            this.timerId=setTimeout(function() {
                self.MIDIEvent=false;
                clearTimeout(self.timerId);
                self.timerId=false;
            }, 128);
        }
    }


};

