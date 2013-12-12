if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([ 'path_actions'], function(path_actions) {

    var PathActions = function(app) {
        this.app = app;
        this.MOTOR_TO_CM_COEF = 50;

        this.adjustmentCoef = 1;

        this.actions = [];
        this.poz = 0;

        this.lastExecutedPathAction = null;
    };


    PathActions.prototype.convertUnitToTime = function(value, unit) {
        if(unit === 'meter') {
            value *= 100;
        }
        value *= this.MOTOR_TO_CM_COEF;

        value *= this.adjustmentCoef;

        return value;
    };


    PathActions.prototype.executeNextPathAction = function () {
        if(this.poz >= this.actions.length) {
            return;
        }

        var action = this.actions[this.poz];

        var data = {
            timeMs : this.convertUnitToTime(action.value, action.unit)
        };


        var motors = this.app.get('motors');
        var direction = action.direction;

        if(direction == 'fwd') {
            motors.forward(data);
        }
        if(direction == 'bck') {
            motors.reverse(data);
        }
        if(direction == 'lft') {
            motors.left(data);
        }
        if(direction == 'rgt') {
            motors.right(data);
        }

        this.lastExecutedPathAction = action;
        this.poz++;
    };

    var exports = PathActions;

    return exports;
});
