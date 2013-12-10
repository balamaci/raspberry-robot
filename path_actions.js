var Commons = require('./commons');

var MOTOR_TO_CM_COEF = 500,

    adjustmentCoef = 1,
    actions = [],
    lastExecutedPathAction,
    poz = 0;

var convertUnitToTime = function(value, unit) {
    if(unit === 'm') {
        value *= 100;
    }
    value *= MOTOR_TO_CM_COEF;

    value *= adjustmentCoef;

    return value;
};


var executeNextPathAction = function (motorCommand) {
    if(this.poz >= this.actions.length) {
        return;
    }

    var action = this.actions[this.poz];

    var motorDirection = function(direction) {
        switch(direction) {

            case 'fwd' : return Commons.ALL_ENGINES_ON;
            case 'bck' : return Commons.REV_ALL_ENGINES_ON;
            case 'lft' : return Commons.LEFT_ENGINE_ON;
            case 'rgt' : return Commons.RIGHT_ENGINE_ON;

            default : return 'unknown';
        }
    };
    var data = {
        timeMs : convertUnitToTime(action.value, action.unit)
    };

    motorCommand.call(undefined, motorDirection(action.direction), data);
    this.lastExecutedPathAction = action;
    this.poz++;
};


module.exports.adjustmentCoef = adjustmentCoef;
module.exports.actions = actions;
module.exports.poz = poz;
module.exports.lastExecutedPathAction = lastExecutedPathAction;
module.exports.convertUnitToTime = convertUnitToTime;
module.exports.executeNextPathAction = executeNextPathAction;