var RBOT = RBOT || {}
RBOT.smooth = RBOT.smooth || {};

(function() {

    var btnFwd = $('#forward'),
        btnBack = $('#back'),
        btnLeft = $('#left'),
        btnRight = $('#right'),
        timeoutId;

    function registerTimeout(motorCommand) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(function() {
            motorCommand();
            timeoutId = registerTimeout(motorCommand);
        }, 400);
        return timeoutId;
    }

    function registerEndXEvent(jqBtn) {
        var hammertimeBtn = Hammer(jqBtn.get(0));
        hammertimeBtn.on("release", function(ev) {
            ev.preventDefault();
            jqBtn.removeClass('active');

            btnFwd.css('color', 'green');

            clearTimeout(timeoutId);
        });
    }

    function registerStartXEvent(jqBtn, motorAction) {
        var hammertimeBtn = Hammer(jqBtn.get(0));
        hammertimeBtn.on("touch", function(ev) {
            ev.preventDefault();
            jqBtn.addClass('active');

            btnFwd.css('color', 'red');

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

