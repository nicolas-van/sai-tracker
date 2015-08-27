
(function() {
"use strict";

    window.saitracker = {};

    function resizeBody() {
        var bw = $(".app-container").width();
        var bh = $(".app-container").height();
        var bar = bw / bh;
        var ww = $(window).width();
        var wh = $(window).height();
        var war = ww / wh;
        var scale;
        if (bar > war) {
            scale = 1 / (bw / ww);
        } else {
            scale = 1 / (bh / wh);
        }
        var xt = (ww - (scale * bw)) / 2;
        var yt = (wh - (scale * bh)) / 2;
        $(".app-container").css("transform-origin", "top left");
        $(".app-container").css("transform", "translate(" + xt + "px, " + yt + "px) scale(" + scale + "," + scale + ")");
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
            this.keys = new saitracker.Keys(this).appendTo(this.$(".bottom-area"));
            this.keys.on("notePressed", _.bind(this.playNote, this));
        },
        render: function() {
            return _.template($("#app-container-tmpl").html());
        },
        playNote: function(note) {
            var t = new sai.Track(saitracker.audioCtx, this.synthParams.getInst());
            t.output.connect(saitracker.audioCtx.destination);
            t.playNote(note, saitracker.audioCtx.currentTime);
        },
    });

    saitracker.SynthParams = widget.Widget.$extend({
        className: "synth-params",
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
        getInst: function() {
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
                noise: this.fval("noise"),
                delay: this.fval("delay-amount"),
                delayTime: this.fval("delay-time"),
                panAmount: this.fval("pan-amount"),
                panFrequency: this.fval("pan-frequency"),
            };
            return inst;
        },
    });

    saitracker.Keys = widget.Widget.$extend({
        className: "keys",
        events: {
            "appendedToDom": "apply",
        },
        domEvents: {
            "mousedown >div": "calcKey",
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
            _.each(_.range(nbrWhite), function(i) {
                var k = $("<div></div>");
                k.css("top", 0);
                k.css("left", pos);
                k.css("width", kwidth);
                k.css("height", kheight);
                k.addClass("white");
                k.data("note", note);
                if (note % 12 === (69 - 9) % 12) {
                    k.append($("<span></span>").text(Math.floor(note / 12) - 1));
                }
                this.$().append(k);
                note += 1;

                if (_.contains([0, 1, 3, 4, 5], (i + offset) % 7)) {
                    k = $("<div></div>");
                    k.css("top", 0);
                    k.css("left", pos + kwidth - (bkwidth / 2));
                    k.css("width", bkwidth);
                    k.css("height", bkheight);
                    k.addClass("black");
                    k.data("note", note);
                    this.$().append(k);
                    note += 1;
                }

                pos += kwidth;
            }, this);
        },
        calcKey: function(e) {
            this.trigger("notePressed", $(e.target).data("note"));
        }
    });

    $(function() {
        saitracker.init();
    });
    
})();
