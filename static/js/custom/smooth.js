var RBOT = RBOT || {}
RBOT.smooth = RBOT.smooth || {};

(function() {

    var speedKnob = $("#speed");
    speedKnob.knob({
        min : 0,
        max : 6,
        'skin':"tron",
        displayInput : false,
        'change' : function (value) {
            console.log(value);
        }
    });

    var btnFwd = $('#forward'),
        btnBack = $('#back'),
        btnLeft = $('#left'),
        btnRight = $('#right');

    function registerEndXEvent(jqBtn) {
        var hammertimeBtn = Hammer(jqBtn.get(0));
        hammertimeBtn.on("release", function(ev) {
            ev.preventDefault();
            clearTimeout(timeoutId);
        });
    }

    function registerStartXEvent(jqBtn, motorAction) {
        var hammertimeBtn = Hammer(jqBtn.get(0));
        hammertimeBtn.on("touch", function(ev) {
            ev.preventDefault();

            motorAction();
            registerTimeout(function() {
                motorAction();
            })
        });
    }

    function init() {
        registerStartXEvent(btnFwd, function() { allEngineSend() });
        registerStartXEvent(btnLeft, function() { leftEngineSend() });
        registerStartXEvent(btnRight, function() { rightEngineSend() });
        registerStartXEvent(btnBack, function() { revAllEngineSend() });

        registerEndXEvent(btnFwd);
        registerEndXEvent(btnLeft);
        registerEndXEvent(btnRight);
        registerEndXEvent(btnBack);
    }

    RBOT.smooth.init = init;

})($);

