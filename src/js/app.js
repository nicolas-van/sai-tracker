
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
        className: "synth-params",
        render: function() {
            return _.template($("#synth-params-tmpl").html());
        },
        doIt: function() {
            var x = {
                oscillators: [
                    {
                        type: "sine",
                        gain: 1,
                        freqOsc: {
                            type: "sine",
                            amount: 255 * 100,
                            frequency: Math.pow(2, 8 - 8),
                        },
                    },
                ],
                filters: [
                    /*{
                        type: "bandpass",
                        frequency: 10000,
                        gain: 0,
                        q: 1000,
                    },*/
                ],
                attack: 0.05,
                sustain: 0.2,
                release: 0.1,
                gain: 0.2,
                noise: 0,
                delay: 0,
                delayTime: 0.3,
                panAmount: 0,
                panFrequency: 2,
            };
        },
    });
    
})();
