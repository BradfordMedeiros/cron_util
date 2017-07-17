
const splitValue = require('./util/splitValue');

const getSecondExpression = schedule => schedule.split(' ')[0];
const getMinuteExpression = schedule => schedule.split(' ')[1];
const getHourExpression = schedule => schedule.split(' ')[2];
const getDayExpression = schedule => schedule.split(' ')[3];
const getWeekExpression = schedule => schedule.split(' ')[4];
const getMonthExpression = schedule => schedule.split(' ')[5];

const isSelected = (splitValueExpression, index) => {
  return splitValueExpression.some(expression => {
    if (expression.type === 'any'){
      return true;
    }else if (expression.type === 'digit' && expression.value === index){
      return true;
    }else if (expression.type === 'range' && (index >= expression.lowIndex && index <= expression.highIndex)){
      return true;
    }
    return false;
  });
};

const isSelectedAny = getExpressionForType => (schedule, index) => {
  const splitValueExpression = splitValue.tryGetSplitValueExpression(getExpressionForType(schedule));
  return splitValueExpression === 'invalid' ? false : isSelected(splitValueExpression, index);
};

const addAny = typeIndex => (schedule, index) => {
  const newSchedule = schedule.slice().split(' ');
  const expression = newSchedule[typeIndex];
  const newExpression = splitValue.addToStringExpression(expression, index);
  newSchedule[typeIndex] = newExpression;
  return newSchedule.join(' ');

};

const removeAny = typeIndex => (schedule, index) => {
  const newSchedule = schedule.slice().split(' ');
  const expression = newSchedule[typeIndex];
  const newExpression = splitValue.removeToStringExpression(expression, index);
  newSchedule[typeIndex] = newExpression;
  return newSchedule.join(' ');
};


const isSelectedUtil = {
  second : {
    isSelected: isSelectedAny(getSecondExpression),
    add: addAny(0),
    remove: removeAny(0),
  },
  minute: {
    isSelected: isSelectedAny(getMinuteExpression),
    add: addAny(1),
    remove: removeAny(1),
  },
  hour: {
    isSelectedAny: isSelectedAny(getHourExpression),
    add: addAny(2),
    remove: removeAny(2),
  },
  day: {
    isSelected: isSelectedAny(getDayExpression),
    add: addAny(3),
    remove: removeAny(3),
  },
  week: {
    isSelectedAny: isSelectedAny(getWeekExpression),
    add: addAny(4),
    remove: removeAny(4),
  },
  month: {
    isSelected: isSelectedAny(getMonthExpression),
    add: addAny(5),
    remove: removeAny(5),
  }
};

module.exports = isSelectedUtil;
