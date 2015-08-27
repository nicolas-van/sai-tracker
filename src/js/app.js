
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
            this.synthParams = new saitracker.SynthParams(this);
            this.synthParams.appendTo(this.$(".right-area"));
        },
        render: function() {
            return _.template($("#app-container-tmpl").html());
        },
    });

    saitracker.SynthParams = widget.Widget.$extend({
        domEvents: {
            "click .play-btn": "doIt",
        },
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
        doIt: function() {
            var x = {
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
                sustain: this.fval("env-sustain"),
                release: this.fval("env-release"),
                gain: this.fval("env-gain"),
                noise: this.fval("noise"),
                delay: this.fval("delay-amount"),
                delayTime: this.fval("delay-time"),
                panAmount: this.fval("pan-amount"),
                panFrequency: this.fval("pan-frequency"),
            };
            var t = new sai.Track(saitracker.audioCtx, x);
            t.output.connect(saitracker.audioCtx.destination);
            t.playNote(69, saitracker.audioCtx.currentTime);
        },
    });

    $(function() {
        saitracker.init();
    });
    
})();
