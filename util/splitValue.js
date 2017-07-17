
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
  const newExpression = [];
  splitValueExpression.forEach((splitValue) => {
    if (splitValue.type === 'digit' ) {
      if (splitValue.value !== index){
        newExpression.push(splitValue);
      }
    }else if (splitValue.type === 'range'){
      if (index >= splitValue.lowIndex && index <= splitValue.highIndex){
        const lowSplitValue = ({
          type: 'range',
          lowIndex: splitValue.lowIndex,
          highIndex: index -1,
        });
        const highSplitValue = ({
          type: 'range',
          lowIndex: index+1,
          highIndex: splitValue.highIndex,
        });

        if (lowSplitValue.lowIndex === lowSplitValue.highIndex){
          newExpression.push(({
            type: 'digit',
            value: lowSplitValue.lowIndex,
          }))
        }else if (!(lowSplitValue.lowIndex > lowSplitValue.highIndex)){
          newExpression.push(lowSplitValue);
        }

        if (highSplitValue.lowIndex === highSplitValue.highIndex){
          newExpression.push(({
            type: 'digit',
            value: highSplitValue.lowIndex,
          }))
        }else if (!(highSplitValue.lowIndex > highSplitValue.highIndex)){
          newExpression.push(highSplitValue);
        }
      }else{
        newExpression.push(splitValue);
      }
    }

  });
  return newExpression;
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
};

const addToStringExpression = (commaRangeString, index) => (
  convertSplitValueExpressionToString(
    optimizeSplitValueExpression(
      addToSplitValueExpression(
        tryGetSplitValueExpression(commaRangeString)
      ,index)
    )
  )
);

const removeToStringExpression = (commaRangeString, index) => (
  convertSplitValueExpressionToString(
    optimizeSplitValueExpression(
      removeToSplitValueExpression(
        tryGetSplitValueExpression(commaRangeString)
        ,index)
    )
  )
);

module.exports = {
  tryGetSplitValueExpression,
  convertSplitValueExpressionToString,
  addToSplitValueExpression,
  addToStringExpression,
  removeToSplitValueExpression,
  removeToStringExpression,
  optimize,
};

