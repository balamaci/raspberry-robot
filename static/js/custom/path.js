var RBOT = RBOT || {}
    RBOT.path = RBOT.path || {};

(function(){

    var pathFwd = $('#fwd'),
        pathBack = $('#bck'),
        pathLeft = $('#lft'),
        pathRight = $('#rgt'),

        btnCm = $('#cm'),
        btnM = $('#meter'),
        btnDeg = $('#deg');

    var btnPathAdd = $('#add-path');

    var templatePathActions = $('#path-actions-template').html();

    function Action(direction, value, unit) {
        this.direction = direction;
        this.value = value;
        this.unit = unit;
    }

    Action.prototype.displayName = function() {
        switch (this.direction) {
            case 'fwd' : return 'Forward';
            case 'bck' : return 'Back';
            case 'lft' : return 'Left';
            case 'rgt' : return 'Right';
            default : return '';
        }
    };


    function makePathBtnActive(jqBtn) {
        var hammertimeBtn = Hammer(jqBtn.get(0));
        hammertimeBtn.on("tap", function(ev) {
            ev.preventDefault();

            $('.active.path-btn').each(function () {
                $(this).removeClass('active');
                $(this).removeClass('btn-primary');
                $(this).addClass('btn-default');
            });

            $('.dst-measurement').removeClass('active');
            $('.deg-measurement').removeClass('active');

            jqBtn.addClass('active');
            jqBtn.removeClass('btn-default');
            jqBtn.addClass('btn-primary');

            var id = jqBtn.attr('id');

            if(id === 'fwd' || id==='bck') {
                $('#dst-measurement-panel').show();
                $('#deg-measurement-panel').hide();

                btnCm.removeClass('active');
                if(! btnM.hasClass('active')) {
                    btnM.addClass('active');
                }

                btnDeg.removeClass('active');
            }

            if(id === 'lft' || id==='rgt') {
                $('#dst-measurement-panel').hide();
                $('#deg-measurement-panel').show();

                btnCm.removeClass('active');
                btnM.removeClass('active');

                btnDeg.addClass('active');
            }
        });
    }

    function registerPathBtns() {
        makePathBtnActive(pathFwd);
        makePathBtnActive(pathBack);
        makePathBtnActive(pathLeft);
        makePathBtnActive(pathRight);

        var hammCm = Hammer(btnCm.get(0));
        hammCm.on('tap', function(ev) {
            ev.preventDefault();

            btnM.removeClass('active');
            btnCm.addClass('active');
        });
        var hammM = Hammer(btnM.get(0));
        hammM.on('tap', function(ev) {
            btnM.addClass('active');
            btnCm.removeClass('active');
        });

        var hammAdd = Hammer(btnPathAdd.get(0));
        hammAdd.on('tap', function(ev) {
            var direction = $(".active.path-btn").attr('id');

            var unit = $(".active.units").attr('id');
            var unitValue = $('#path-unit-value').val();

            addPathAction(direction, unitValue, unit);
        });

        $('#path-del-all').click(function(ev) {
            ev.preventDefault();
            localStorage.removeItem("actions");

            renderPathItems();
        });

        $('#path-del-item').click(function(ev) {
            ev.preventDefault();
            var poz = $("#path-actions").find(".list-group-item.active").data('id');

            var actions = getPathActions();
            actions.splice(poz, 1);
            persistActions(actions);

            renderPathItems();
        });
    }

    function renderPathItems() {
        var actions = getPathActions();

        var template = _.template(templatePathActions, {actions:actions});

        $("#path-actions").html(template);
    }

    function getPathActions() {
        var localStActions = localStorage.getItem('actions');
        var actions = [];
        if(localStActions) {
            actions = JSON.parse(localStActions).map(function(it) {
                return new Action(it.direction, it.value, it.unit);
            });
        }

        return actions;
    }

    function registerPathListEntriesWatcher() {
        $('#path-actions').on('click', '.list-group-item', function(ev) {
            $('#path-actions').find('.list-group-item').each(function() {
                $(this).removeClass('active');
            });

            $(this).addClass('active');
        });
    }

    function persistActions(actions) {
        localStorage.setItem("actions", JSON.stringify(actions));
    }

    function addPathAction(direction, unitValue, unit, poz) {
        var actions = getPathActions();
        if(poz) {

        } else {
            actions.push(new Action(direction, unitValue, unit));
        }

        persistActions(actions);
        renderPathItems();
    }

    function init() {
        registerPathBtns();
        renderPathItems();
        registerPathListEntriesWatcher();
    }

    RBOT.path.init = init;
    RBOT.path.Action = Action;
    RBOT.path.getActions = getPathActions();

})($);

