const generateSplitValue = require('./generateSplitValue');

const combineDigits = (splitValue0, splitValue1) => {
  if (splitValue0.type === 'digit' && splitValue1.type === 'digit'){
    if (splitValue0.value === splitValue1.value){
      return ([{
        type: 'digit',
        value: splitValue0.value,
      }])
    }else if (splitValue0.value === (splitValue1.value +1)){
      return ([{
        type: 'range',
        lowIndex: splitValue1.value,
        highIndex: splitValue0.value,
      }])
    }else if ((splitValue0.value + 1) === splitValue1.value){
      return ([{
        type: 'range',
        lowIndex: splitValue0.value,
        highIndex: splitValue1.value,
      }])
    }else{
      return ([
        {
          type: 'digit',
          value: splitValue0.value,
        },
        {
          type: 'digit',
          value: splitValue1.value,
        }
      ])
    }
  }else{
    return [splitValue0, splitValue1];
  }
};


const sortDigitArray = digits =>  digits.slice().sort( (digit0, digit1) => digit0.value > digit1.value);
const sortRangeArrays = ranges => ranges.slice().sort( (range0, range1) => range0.lowIndex > range1.lowIndex);


const combineDigitArray = digits => {
  const result = [ ];
  const sortedArray = sortDigitArray(digits);

  for (let i = 0; i < sortedArray.length; i++){
    if(i === 0){
      result.push(sortedArray[i]);
      continue;
    }
    if (sortedArray[i].value === result[result.length-1].value){
      continue; // already in array continue
    }else if (result[result.length-1].type === 'digit' && ((result[result.length-1].value + 1) === sortedArray[i].value)){
      result[result.length-1] = ({
        type: 'range',
        lowIndex: result[result.length-1].value,
        highIndex: sortedArray[i].value,
      })
    }
    else{
      result.push(sortedArray[i]);
    }
  }
  return result;
};


const digitInRange = (range, digit) => {
  return (digit.value >=  range.lowIndex && digit.value <= range.highIndex);
};

const digitInExpandedRange = (range, digit) => {
  return ((digit.value === range.lowIndex -1) || (digit.value  === range.highIndex+1));
};

const combineDigitsAndRange = (ranges, digits) => {
  const digitsNotInRanges = [ ];

  digits.forEach(digit => {
    ranges.forEach((range, index) => {
        if (digit.value === range.lowIndex-1){
          range.lowIndex = digit.value;
        }else if (digit.value === range.highIndex + 1){
          range.highIndex = digit.value;
        }
    });

    const isInARange = ranges.some(range => digitInRange(range, digit));
    if (isInARange === false){
      digitsNotInRanges.push(digit);
    }
  });

  const rangeCopy = ranges.map(x => ({
    type: x.type,
    value: x.value,
    lowIndex: x.lowIndex,
    highIndex: x.highIndex,
  }));
  digitsNotInRanges.forEach(digit => rangeCopy.push(digit));
  return rangeCopy;
};


const optimizeRanges = rangeExpression => {
  if (rangeExpression.length === 0){
    return [ ];
  }

  const sortedRanges = sortRangeArrays(rangeExpression);
  const results = [];
  results.push(sortedRanges[0]);
  for (let i = 1;  i < sortedRanges.length; i++){
    if (sortedRanges[i].highIndex <= results[results.length -1].highIndex){
      continue; // it's already included in the other range
    }
    else if (
      (sortedRanges[i].type === 'range' && results[results.length-1].type === 'range') &&
      ((sortedRanges[i].lowIndex === results[results.length -1].highIndex) ||
      (sortedRanges[i].lowIndex === results[results.length -1].highIndex+1))){
      results[results.length-1] = ({
        type: 'range',
        lowIndex: results[results.length-1].lowIndex,
        highIndex: sortedRanges[i].highIndex,
      });
    }
    else{
      results.push(sortedRanges[i]);
    }
  }
  return results;
};

const optimizeSplitValueExpression = splitValueExpression  => {
  const copy =  splitValueExpression.map(item => ({
    type: item.type,
    value: item.value,
    lowIndex: item.lowIndex,
    highIndex: item.highIndex,
  }));

  if (copy.some(copy => copy.type === 'any')){
    return [generateSplitValue('*')];
  }

  const ranges = splitValueExpression.filter(expression => expression.type === 'range');
  const digits = splitValueExpression.filter(expression => expression.type === 'digit');

  const combinedDigits = combineDigitArray(digits);
  const combinedDigitsWithRangesUnoptimized = combineDigitsAndRange(ranges, combinedDigits);

  return optimizeRanges(combinedDigitsWithRangesUnoptimized);

};

module.exports = optimizeSplitValueExpression;
