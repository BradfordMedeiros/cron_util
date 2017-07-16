
const generateSplitValue = require('./generateSplitValue');
const optimizeSplitValueExpression = require('./optimizeExpression');

const getSplitValueExpression = commaRangeString => {
  return commaRangeString.split(',').map(range => range.trim()).filter(x => x.length > 0).map(generateSplitValue);
};

const addToSplitValueExpression = (splitValueExpression, index) => {
  const copy = splitValueExpression.map(item => ({
    type: item.type,
    value: item.value,
    lowIndex: item.lowIndex,
    highIndex: item.highIndex,
  }));
  copy.push({
    type: 'digit',
    value: index,
  });

  return optimizeSplitValueExpression(copy);
};

const removeToSplitValueExpression = (splitValueExpression, index) => {
  return splitValueExpression;
};

const rangeToString = splitValue => {
  return `${splitValue.lowIndex}-${splitValue.highIndex}`;
};
const digitToString = splitValue => {
  return `${splitValue.value}`
};
const anyToString = splitValue => {
  return '*';
};

const splitValuetoStringMap = {
    'range': rangeToString,
    'digit': digitToString,
    'any': anyToString,
};

const convertSplitValueExpressionToString = splitValueExpression => (
  splitValueExpression.map(
    splitValue => splitValuetoStringMap[splitValue.type](splitValue)
  ).join(',')
);


const tryGetSplitValueExpression = commaRangeString => {
  try {
    return getSplitValueExpression(commaRangeString);
  }catch (err) {
    return 'invalid';
  }
};

const optimize = commaRangeString => {
  return convertSplitValueExpressionToString(optimizeSplitValueExpression(tryGetSplitValueExpression(commaRangeString)));
}


module.exports = {
  tryGetSplitValueExpression,
  convertSplitValueExpressionToString,
  addToSplitValueExpression,
  removeToSplitValueExpression,
  optimize,
};

