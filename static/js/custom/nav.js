var RBOT = RBOT || {}
    RBOT.nav = RBOT.nav || {};

(function(){
    var smoothControlsPanel = $('#smooth-controls'),
        navPathPanel = $('#path-nav');

    var position = smoothControlsPanel.position();

    var hammertime = Hammer(document.getElementById("toucharea"));
    var carousel = $('#carousel');

    carousel.carousel('pause');

    function init() {
        hammertime.on("swipeleft", function(ev) {
            ev.gesture.preventDefault();

            carousel.carousel('next');
            carousel.carousel('pause');
        });

        hammertime.on("swiperight", function(ev) {
            ev.gesture.preventDefault();

            carousel.carousel('prev');
            carousel.carousel('pause');
        });

/*
        carousel.on('slide.bs.carousel', function () {
            smoothControlsPanel.css('opacity', '0.6');
            navPathPanel.css('opacity', '0.6');
        });

        carousel.on('slid.bs.carousel', function () {
            smoothControlsPanel.css('opacity', '1');
            navPathPanel.css('opacity', '1');
        });
*/
    }

    RBOT.nav.init = init;
})($);
