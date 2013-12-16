var RBOT = RBOT || {}
    RBOT.path = RBOT.path || {};

(function(){

    var pathFwd = $('#fwd'),
        pathBack = $('#bck'),
        pathLeft = $('#lft'),
        pathRight = $('#rgt'),

        btnCm = $('#cm'),
        btnM = $('#meter'),
        btnDeg = $('#deg'),

        executedActionsTable = $('#executed-actions');

    var socket;

    var btnPathAdd = $('#add-path'),
        btnPathAddBefore = $('#add-path-before');

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

    function getSelectedEntryPoz() {
        return $("#path-actions").find(".list-group-item.active").data('id');
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
            addPathAction();
        });

        var hammAddBefore = Hammer(btnPathAddBefore.get(0));
        hammAddBefore.on('tap', function(ev) {
            var poz = getSelectedEntryPoz();
            if(poz > 0) {
                poz--;
            }
            addPathAction(poz);
        });


        $('#path-stop').click(function(ev) {
            ev.preventDefault();
            sendExecutePathActions(actions[poz]);
        });

        registerPathExec();
        registerPathReverse();
        registerPathDelete();
    }

    function registerPathExec() {
        $('#path-exec-all').click(function(ev) {
            ev.preventDefault();
            var actions = getPathActions();
            sendExecutePathActions(actions);
        });
        $('#path-exec').click(function(ev) {
            ev.preventDefault();
            var actions = getPathActions();
            var poz = getSelectedEntryPoz();

            var executeActions = [ actions[poz] ];

            sendExecutePathActions(executeActions);
        });
    }

    function registerPathReverse() {
        $('#path-rev-all').click(function(ev) {
            ev.preventDefault();
            var actions = getReversedPathActions();

            sendExecutePathActions(actions);
        });

        $('#path-rev').click(function(ev) {
            ev.preventDefault();

            var poz = getSelectedEntryPoz();
            var action = getPathActions() [poz];

            var revAction = [ getReversedPathAction(action) ];

            sendExecutePathActions(revAction);
        });
    }

    function registerPathDelete() {
        $('#path-del-all').click(function(ev) {
            ev.preventDefault();
            localStorage.removeItem("actions");

            renderPathItems();
        });

        $('#path-del-item').click(function(ev) {
            ev.preventDefault();

            var actions = getPathActions();
            var poz = getSelectedEntryPoz();

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

    function getReversedPathAction(action) {
        var direction = action.direction;
        switch(direction) {
            case 'fwd' :
                direction = 'bck';
                break;
            case 'bck' :
                direction = 'fwd';
                break;
            case 'rgt' :
                direction = 'lft';
                break;
            case 'lft' :
                direction = 'rgt';
                break;
        }

        return new Action(direction, action.value, action.unit);
    }

    function getReversedPathActions() {
        var actions = getPathActions().reverse();

        return actions.map(function (it) {
            return getReversedPathAction(it);
        });
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

    function newAction() {
        var direction = $(".active.path-btn").attr('id');
        var unit = $(".active.units").attr('id');
        var unitValue = $('#path-unit-value').val();

        return new Action(direction, unitValue, unit);
    }

    function addPathAction(poz) {
        var actions = getPathActions();
        var action = newAction();
        if(poz) {
            actions.splice(poz, 0, action);
        } else {
            actions.push(action);
        }

        persistActions(actions);
        renderPathItems();
    }

    function addExecutedPathAction(actionStr) {
        var entries = executedActionsTable.children('tr').length;
        if(entries > 5) {
            executedActionsTable.find('tr:first').remove();
        }

        executedActionsTable.append('<tr><td>' + actionStr + '</td></tr>');
    }

    function init(socket) {
        this.socket = socket;

        registerPathBtns();
        renderPathItems();
        registerPathListEntriesWatcher();
    }

    RBOT.path.init = init;
    RBOT.path.Action = Action;
    RBOT.path.getActions = getPathActions();

})($);

