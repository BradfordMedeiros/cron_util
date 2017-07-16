const assert = require('assert');
const splitValues = require('../util/splitValue');

describe('generating split value expressions', () => {
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
});

describe('converting split value expressions to strings', () => {
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
});
