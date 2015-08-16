
(function() {
"use strict";

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
    };
    resizeBody();
    $(window).resize(resizeBody);
    
})();
