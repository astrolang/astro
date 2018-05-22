const Parser = require('./parser');
const { print, createTest } = require('../utils');

let parser = null;
let result = null;
const test = createTest();

print('============== XXXXX ==============');
parser = new Parser('hello world');
result = parser.eatToken('hello');
test(
  String.raw`hello world--------->MID`,
  result,
  null,
);

print('============== TEST RESULTS ==============');

// Print details of test.
test();

