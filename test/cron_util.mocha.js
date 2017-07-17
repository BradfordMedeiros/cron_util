const assert = require('assert');
const splitValues = require('../util/splitValue');

describe('generating split value expressions', () => {
  it('null case', () => {
    const expression = splitValues.tryGetSplitValueExpression('');
    assert.equal(expression.length, 0);
  });
  it('basic expression type: any', () => {
    const expression = splitValues.tryGetSplitValueExpression('*');
    assert(expression.length, 1);
    assert(expression[0].type, 'any');
  });
  it('basic expression type: digit', () => {
    const expression = splitValues.tryGetSplitValueExpression('4');
    assert.equal(expression.length, 1);
    assert.equal(expression[0].type, 'digit');
  });
  it('basic expression type: range', () => {
    const expression = splitValues.tryGetSplitValueExpression('2-5');
    assert.equal(expression.length, 1);
    assert.equal(expression[0].type, 'range');
    assert.equal(expression[0].lowIndex, 2);
    assert.equal(expression[0].highIndex, 5);
  });
  it('basic expression type: comma delimited: range', () => {
    const expression = splitValues.tryGetSplitValueExpression('1-3,2-4');
    assert.equal(expression.length, 2);
    assert.equal(expression[0].type, 'range');
    assert.equal(expression[0].lowIndex, 1);
    assert.equal(expression[0].highIndex, 3);
    assert.equal(expression[1].type, 'range');
    assert.equal(expression[1].lowIndex, 2);
    assert.equal(expression[1].highIndex, 4);
  });
  it('mixed expression type: digit and range', () => {
    const expression = splitValues.tryGetSplitValueExpression('1, 3-5, 3,4');
    assert.equal(expression.length,4);
    assert.equal(expression[0].type, 'digit');
    assert.equal(expression[0].value, 1);
    assert.equal(expression[1].type, 'range');
    assert.equal(expression[1].lowIndex, 3);
    assert.equal(expression[1].highIndex, 5);
    assert.equal(expression[2].type, 'digit');
    assert.equal(expression[2].value, 3);
    assert.equal(expression[3].type, 'digit');
    assert.equal(expression[3].value, 4);
  });
  it('mixed expression type: digit, range, and any', () => {
    const expression = splitValues.tryGetSplitValueExpression(' 1, 3-5, 3,4, *');
    assert.equal(expression.length,5);
    assert.equal(expression[0].type, 'digit');
    assert.equal(expression[0].value, 1);
    assert.equal(expression[1].type, 'range');
    assert.equal(expression[1].lowIndex, 3);
    assert.equal(expression[1].highIndex, 5);
    assert.equal(expression[2].type, 'digit');
    assert.equal(expression[2].value, 3);
    assert.equal(expression[3].type, 'digit');
    assert.equal(expression[3].value, 4);
    assert.equal(expression[4].type, 'any');
  });
});

describe('converting split value expressions to strings', () => {
  it('null case', () => {
    const expression = splitValues.tryGetSplitValueExpression('');
    const string = splitValues.convertSplitValueExpressionToString(expression);
    assert.equal(string, '');
  });
  it('basic expression type: any', () => {
    const expression = splitValues.tryGetSplitValueExpression('*');
    const string = splitValues.convertSplitValueExpressionToString(expression);
    assert.equal(string, '*');
  });
  it('basic expression type: digit', () => {
    const expression = splitValues.tryGetSplitValueExpression('3');
    const string = splitValues.convertSplitValueExpressionToString(expression);
    assert.equal(string, '3');
  });
  it('basic expression type: range', () => {
    const expression = splitValues.tryGetSplitValueExpression('3-5');
    const string = splitValues.convertSplitValueExpressionToString(expression);
    assert.equal(string, '3-5');
  });
  it('basic expression type: comma delimited: range', () => {
    const expression = splitValues.tryGetSplitValueExpression('1-5,2-3');
    const string = splitValues.convertSplitValueExpressionToString(expression);
    assert.equal(string, '1-5,2-3');
  });
  it('mixed expression type: comma delimited: digit, range, any', () => {
    const expression = splitValues.tryGetSplitValueExpression('1-5,2-3,*');
    const string = splitValues.convertSplitValueExpressionToString(expression);
    assert.equal(string, '1-5,2-3,*');
  });
});

describe('expression optimization', () => {
  it ('null case', () => {
    const optimizedString = splitValues.optimize('');
    assert.equal(optimizedString, '');
  });
  it('digits - repeated digits', () => {
    const optimizedString = splitValues.optimize('2,2,2,2');
    assert.equal(optimizedString, '2');
  });
  it('digit - repeated digits, seperated by different digit', () => {
    const optimizedString = splitValues.optimize('2, 5, 2,2,2');
    assert.equal(optimizedString, '2,5');
  });
  it('digit - merging to range', () => {
    const optimizedString = splitValues.optimize('1,3,2');
    assert.equal(optimizedString, '1-3');
  });
  it('digit - multiple repeated digits', () => {
    const optimizedString = splitValues.optimize('2, 5, 2, 8, 5, 5, 5, 2, 5, 12, 12, 2, 2,12');
    assert.equal(optimizedString, '2,5,8,12');
  });
  it('ranges/digits - combining digits into range - range before digit - low edge', () => {
    const optimizedString = splitValues.optimize('2-5,2');
    assert.equal(optimizedString, '2-5');
  });
  it('ranges/digits - combining digits into range - range before digit - high edge', () => {
    const optimizedString = splitValues.optimize('2-5,5');
    assert.equal(optimizedString, '2-5');
  });
  it('ranges/digits - combining digits into range - range after digit', () => {
    const optimizedString = splitValues.optimize('2,2-5');
    assert.equal(optimizedString, '2-5');
  });
  it('ranges/digits - digits optimized into mutliple ranges', () => {
    const optimizedString = splitValues.optimize('1-3,3,2,1,5,5,5,5,6,7,6,5-7');
    assert.equal(optimizedString, '1-3,5-7');
  });
  it('any -- converts any expression with any in it to any', () => {
    const optimizedString = splitValues.optimize('1-3,4,3,2,1,5,5,5,5,6,7,6,4-7,*');
    assert.equal(optimizedString,'*');
  });
  it('digits/ranges -- combines consecutive digits into one range', () => {
    const optimizedString = splitValues.optimize('1,2,3,4,5,6');
    assert.equal(optimizedString,'1-6');
  });
  it('ranges -- combines redundant ranges', () => {
    const optimizedString = splitValues.optimize('1-3,5-6,1-3,5-6');
    assert.equal(optimizedString,'1-3,5-6');
  });
  it('ranges -- combined ranges created from digits', () => {
    const optimizedString = splitValues.optimize('1,2,1-2,1,2');
    assert.equal(optimizedString,'1-2');
  });
  it('ranges --combines digits that form ranges into new range', () => {
    const optimizedString = splitValues.optimize('1-3,4');
    assert.equal(optimizedString,'1-4');
  });
  it('ranges -- combined two adjacent ranges into bigger range', () => {
    const optimizedString = splitValues.optimize('1-3,3-6');
    assert.equal(optimizedString,'1-6');
  });
  it('complex optimization', () => {
    const optimizedString = splitValues.optimize('1-3,6,4,2,3-5,7-10');
    assert.equal(optimizedString,'1-10');
  });
  it('another complex optimization', () => {
    const optimizedString = splitValues.optimize('7-10, 1,3,6,4,2,3-5');
    assert.equal(optimizedString,'1-10');
  });
  it('yet another complex optimization', () => {
    const optimizedString = splitValues.optimize('1,2,5-6,3,9,12,1-3');
    assert.equal(optimizedString,'1-3,5-6,9,12');
  });
  it('even yet another complex optimization', () => {
    const optimizedString = splitValues.optimize('1,2,5-6,3,4,9,12,1-3');
    assert.equal(optimizedString,'1-6,9,12');
  });
  it('complex with any', () => {
    const optimizedString = splitValues.optimize('1,2,5-6,3,4,*, 9,12,1-3');
    assert.equal(optimizedString,'*');
  });
});

describe('adding to string expressions', () => {
  it('adding any index to any is still any', () => {
    const string = splitValues.addToStringExpression('*', 3);
    assert.equal(string,'*');
  });
  it('adding single digit to another single digit', () => {
    const string = splitValues.addToStringExpression('1', 3);
    assert.equal(string,'1,3');
  });

  it('adding single digit 1 up creates range', () => {
    const string = splitValues.addToStringExpression('1', 2);
    assert.equal(string,'1-2');
  });
  it('filling in a range', () => {
    const string = splitValues.addToStringExpression('1,3', 2);
    assert.equal(string,'1-3');
  });
});

describe('removing from string expressions', () => {
  it('removing from single digit', () => {
    const string = splitValues.removeToStringExpression('3',3);
    assert.equal(string,'');
  });
  it('removing from single repeated digit', () => {
    const string = splitValues.removeToStringExpression('7-9,5,3,3,3,3',3);
    assert.equal(string,'7-9,5');
  });
  it('removing from a range', () => {
    const string = splitValues.removeToStringExpression('3,3-5',3);
    assert.equal(string,'4-5');
  });
  it('removing from all', () => {
    const string = splitValues.removeToStringExpression('*',3);
    assert.equal(string,'0-2,4-255');
  });
  it('complex removing from all and other unoptimized expression', () => {
    const string = splitValues.removeToStringExpression('*,*,*,1-5,2-5',9);
    assert.equal(string,'0-8,10-255');
  });

});