
(function() {
"use strict";

    window.saitracker = {};

    var pageScale = 1;

    function resizeBody() {
        var bw = $(".app-container").width();
        var bh = $(".app-container").height();
        var bar = bw / bh;
        var ww = $(window).width();
        var wh = $(window).height();
        var war = ww / wh;
        if (bar > war) {
            pageScale = 1 / (bw / ww);
        } else {
            pageScale = 1 / (bh / wh);
        }
        var xt = (ww - (pageScale * bw)) / 2;
        var yt = (wh - (pageScale * bh)) / 2;
        $(".app-container").css("transform-origin", "top left");
        $(".app-container").css("transform", "translate(" + xt + "px, " + yt + "px) scale(" + pageScale + "," + pageScale + ")");
    }

    saitracker.init = function() {
        saitracker.audioCtx = new AudioContext();
        var app = new saitracker.App().appendTo($("body"));
        resizeBody();
        $(window).resize(resizeBody);
    };

    saitracker.App = widget.Widget.$extend({
        className: "app-container",
        constructor: function(parent) {
            this.$super(parent);
            this.synthParams = new saitracker.SynthParams(this).appendTo(this.$(".right-area"));
            this.synthParams.on("change:instrument", this.updateInst.bind(this));
            this.track = new sai.Track(saitracker.audioCtx, this.synthParams.get("instrument"));
            this.track.output.connect(saitracker.audioCtx.destination);
            this.keys = new saitracker.Keys(this).appendTo(this.$(".bottom-area"));
            this.keys.on("notePressed", _.bind(this.playNote, this));
            this.keys.on("noteReleased", _.bind(this.stopNote, this));
            this.notes = {};
        },
        render: function() {
            return _.template($("#app-container-tmpl").html());
        },
        playNote: function(note) {
            this.stopNote(note);
            this.notes[note] = this.track.playNote(note, saitracker.audioCtx.currentTime, false);
        },
        stopNote: function(note) {
            if (this.notes[note]) {
                this.notes[note].end();
                this.notes[note] = null;
            }
        },
        updateInst: function() {
            this.track.setInstrument(this.synthParams.get("instrument"));
        },
    });

    saitracker.SynthParams = widget.Widget.$extend({
        className: "synth-params",
        domEvents: {
            "change input": "updateInst",
            "change select": "updateInst",
        },
        constructor: function(parent) {
            this.$super(parent);
            this.updateInst();
        },
        render: function() {
            return _.template($("#synth-params-tmpl").html());
        },
        fval: function(input) {
            var e = this.$("." + input);
            if (e.length !== 1)
                throw new ring.ValueError("input with class '" + input + "' not found");
            var v = e.val();
            if (! v)
                throw new ring.ValueError("invalid value");
            var pv = parseFloat(v);
            return isNaN(pv) ? v : pv;
        },
        updateInst: function() {
            var inst = {
                oscillators: [
                    {
                        type: this.fval("osc1-type"),
                        gain: this.fval("osc1-gain"),
                        freqOsc: {
                            type: this.fval("osc1-freq-osc-type"),
                            frequency: this.fval("osc1-freq-osc-freq"),
                            amount: this.fval("osc1-freq-osc-amt"),
                        },
                    },
                    {
                        type: this.fval("osc2-type"),
                        gain: this.fval("osc2-gain"),
                        freqOsc: {
                            type: this.fval("osc2-freq-osc-type"),
                            frequency: this.fval("osc2-freq-osc-freq"),
                            amount: this.fval("osc2-freq-osc-amt"),
                        },
                    }
                ],
                filters: [
                    {
                        type: this.fval("filter-type"),
                        frequency: this.fval("filter-freq"),
                        gain: this.fval("filter-gain"),
                        q: this.fval("filter-q"),
                    },
                ],
                attack: this.fval("env-attack"),
                decay: this.fval("env-decay"),
                sustainLevel: this.fval("env-sustain-level"),
                sustainTime: this.fval("env-sustain-time"),
                release: this.fval("env-release"),
                gain: this.fval("env-gain"),
                delay: this.fval("delay-amount"),
                delayTime: this.fval("delay-time"),
                panAmount: this.fval("pan-amount"),
                panFrequency: this.fval("pan-frequency"),
            };
            if (! _.isEqual(inst, this.get("instrument")))
                this.set("instrument", inst);
        },
    });

    saitracker.Keys = widget.Widget.$extend({
        className: "keys",
        events: {
            "appendedToDom": "apply",
            "notePressed": function(note) {
                this.notes[note].addClass("pressed");
            },
            "noteReleased": function(note) {
                this.notes[note].removeClass("pressed");
            },
        },
        constructor: function(parent) {
            this.fingers = {};
            this.$super(parent);
            if (Modernizr.touch) {
                this.$().on("touchstart", ".keyboad-overlay", this.calcTouch.bind(this))
                    .on("touchend", ".keyboad-overlay", this.calcTouch.bind(this))
                    .on("touchmove", ".keyboad-overlay", this.calcTouch.bind(this));
            } else {
                this.$().on("mousedown", ".keyboad-overlay", this.calcMouse.bind(this))
                    .on("mouseup", ".keyboad-overlay", this.calcMouse.bind(this))
                    .on("mouseenter", ".keyboad-overlay", this.calcMouse.bind(this))
                    .on("mouseout", ".keyboad-overlay", this.calcMouse.bind(this))
                    .on("mousemove", ".keyboad-overlay", this.calcMouse.bind(this));
            }
        },
        apply: function() {
            var width = this.$().innerWidth();
            var height = this.$().innerHeight();
            var nbrWhite = 7 * 6;
            var blackHProp = 0.6;
            var blackWProp = 0.65;
            var offset = 0;
            var firstNote = 69 - 9 - (12 * 2);

            var kwidth = width / nbrWhite;
            var kheight = height;
            var bkwidth = kwidth * blackWProp;
            var bkheight = kheight * blackHProp;
            var pos = 0;
            var note = firstNote;
            var blacks = [];
            var whites = [];
            this.notes = {};
            _.each(_.range(nbrWhite), function(i) {
                var k = $("<div></div>");
                k.css("top", 0);
                k.css("left", pos);
                k.data("left", pos);
                k.css("width", kwidth);
                k.css("height", kheight);
                k.addClass("white");
                k.data("note", note);
                if (note % 12 === (69 - 9) % 12) {
                    k.append($("<span></span>").text(Math.floor(note / 12) - 1));
                }
                this.$().append(k);
                whites.push(k);
                this.notes[note] = k;
                note += 1;

                if (_.contains([0, 1, 3, 4, 5], (i + offset) % 7)) {
                    k = $("<div></div>");
                    k.css("top", 0);
                    k.css("left", pos + kwidth - (bkwidth / 2));
                    k.data("left", pos + kwidth - (bkwidth / 2));
                    k.css("width", bkwidth);
                    k.css("height", bkheight);
                    k.addClass("black");
                    k.data("note", note);
                    this.$().append(k);
                    blacks.push(k);
                    this.notes[note] = k;
                    note += 1;
                }

                pos += kwidth;
            }, this);
            this.keys = [].concat(blacks).concat(whites);
            this.$().append($("<div></div>").addClass("keyboad-overlay"));
        },
        findNote: function(x, y) {
            for (var i = 0; i < this.keys.length; i++) {
                var k = this.keys[i];
                if (x >= k.data("left") && x <= k.data("left") + k.width() &&
                    y >= 0 && y <= k.height())
                    return k.data("note");
            }
            return null;
        },
        finger: function(num) {
            if (! (("" + num) in this.fingers)) {
                this.fingers[num] = {current: null};
            }
            return this.fingers[num];
        },
        calcMouse: function(e) {
            var finger = this.finger(0);
            if ((e.type === "mouseout" || e.type === "mouseup") && finger.current !== null) {
                this.trigger("noteReleased", finger.current);
                finger.current = null;
                return;
            }
            var note = this.findNote(e.offsetX, e.offsetY);
            if (note === null)
                return;
            if (e.type === "mousedown" || (e.type === "mouseenter" && e.which === 1)) {
                console.log("note", note);
                this.trigger("notePressed", note);
                finger.current = note;
            } else if (e.type === "mousemove") {
                if (finger.current !== null && finger.current !== note) {
                    this.trigger("noteReleased", finger.current);
                    this.trigger("notePressed", note);
                    console.log("note", note);
                    finger.current = note;
                }
            }
        },
        calcTouch: function(e) {
            _.each(e.originalEvent.touches, _.bind(function(touch) {
                var finger = this.finger(touch.identifier);
                var top = this.$().offset().top;
                var left = this.$().offset().left;
                var x = touch.pageX - left;
                var y = touch.pageY - top;
                var note = this.findNote(x / pageScale, y / pageScale);
                if (finger.current !== note) {
                    if (finger.current !== null)
                        this.trigger("noteReleased", finger.current);
                    if (note !== null)
                        this.trigger("notePressed", note);
                    finger.current = note;
                }
            }, this));
            var touches = _.map(e.originalEvent.touches, function(touch) {
                return "" + touch.identifier;
            });
            _.each(this.fingers, _.bind(function(finger, id) {
                if (! _.contains(touches, id)) {
                    this.trigger("noteReleased", finger.current);
                    finger.current = null;
                }
            }, this));
        },
    });

    $(function() {
        saitracker.init();
    });
    
})();
