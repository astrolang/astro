const Lexer = require('./lexer');
const { print, createTest } = require('../utils');

// Test object.
let lexer = null;
let result = null;
const test = createTest();

print('============== EATTOKEN ==============');
lexer = new Lexer('hello world');
result = lexer.eatToken('hello');
test(
  String.raw`hello world--------->MID`,
  result,
  {
    token: 'hello',
    kind: 'eatToken',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

lexer = new Lexer('..');
result = lexer.eatToken('..');
test(
  String.raw`..`,
  result,
  {
    token: '..',
    kind: 'eatToken',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 2,
  },
);

print('============== SPACES ==============');
lexer = new Lexer('');
result = lexer.spaces();
test(
  String.raw`--------->FAIL`,
  result,
  null,
);

lexer = new Lexer(' \t\t  ');
result = lexer.spaces();
test(
  String.raw` \t\t  `,
  result,
  {
    token: '',
    kind: 'spaces',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

print('============== NONAME ==============');
lexer = new Lexer('_');
result = lexer.noName();
test(
  String.raw`_`,
  result,
  {
    token: '_',
    kind: 'noname',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 1,
  },
);

print('============== IDENTIFIER ==============');
lexer = new Lexer('678name');
result = lexer.identifier();
test(
  String.raw`678name--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('some_name678');
result = lexer.identifier();
test(
  String.raw`some_name678`,
  result,
  {
    token: 'some_name678',
    kind: 'identifier',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 12,
  },
);

lexer = new Lexer('where');
result = lexer.identifier();
test(
  String.raw`where`,
  result,
  {
    token: 'where',
    kind: 'keyword',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

lexer = new Lexer('else');
result = lexer.identifier();
test(
  String.raw`else`,
  result,
  {
    token: 'else',
    kind: 'keyword',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('elseif');
result = lexer.identifier();
test(
  String.raw`elseif`,
  result,
  {
    token: 'elseif',
    kind: 'identifier',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 6,
  },
);

lexer = new Lexer('true');
result = lexer.identifier();
test(
  String.raw`true`,
  result,
  {
    token: 'true',
    kind: 'booleanliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('false');
result = lexer.identifier();
test(
  String.raw`false`,
  result,
  {
    token: 'false',
    kind: 'booleanliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

print('============== OPERATOR ==============');
lexer = new Lexer('+');
result = lexer.operator();
test(
  String.raw`+`,
  result,
  {
    token: '+',
    kind: 'operator',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 1,
  },
);

lexer = new Lexer('/-/');
result = lexer.operator();
test(
  String.raw`/-/`,
  result,
  {
    token: '/-/',
    kind: 'operator',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

print('============== PUNCTUATOR ==============');
lexer = new Lexer('..');
result = lexer.punctuator();
test(
  String.raw`..--------->MID`,
  result,
  {
    token: '.',
    kind: 'punctuator',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 1,
  },
);

lexer = new Lexer('~');
result = lexer.punctuator();
test(
  String.raw`~`,
  result,
  {
    token: '~',
    kind: 'punctuator',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 1,
  },
);

print('============== INTEGERBINARYLITERAL ==============');
lexer = new Lexer('0b201');
result = lexer.integerBinaryLiteral();
test(
  String.raw`0b201--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('0b0__');
result = lexer.integerBinaryLiteral();
test(
  String.raw`0b0__--------->MID`,
  result,
  {
    token: '0',
    kind: 'integerbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('0b0__1');
result = lexer.integerBinaryLiteral();
test(
  String.raw`0b0__1--------->MID`,
  result,
  {
    token: '0',
    kind: 'integerbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('0b1001');
result = lexer.integerBinaryLiteral();
test(
  String.raw`0b1001`,
  result,
  {
    token: '1001',
    kind: 'integerbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 6,
  },
);

lexer = new Lexer('0b1011_1000_1110');
result = lexer.integerBinaryLiteral();
test(
  String.raw`0b1011_1000_1110`,
  result,
  {
    token: '101110001110',
    kind: 'integerbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);

print('============== INTEGEROCTALLITERAL ==============');
lexer = new Lexer('0o856');
result = lexer.integerOctalLiteral();
test(
  String.raw`0o856--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('0o7__');
result = lexer.integerOctalLiteral();
test(
  String.raw`0o7__--------->MID`,
  result,
  {
    token: '7',
    kind: 'integeroctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('0o7__6');
result = lexer.integerOctalLiteral();
test(
  String.raw`0o7__6--------->MID`,
  result,
  {
    token: '7',
    kind: 'integeroctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('0o5667');
result = lexer.integerOctalLiteral();
test(
  String.raw`0o5667`,
  result,
  {
    token: '5667',
    kind: 'integeroctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 6,
  },
);

lexer = new Lexer('0o6655_1466');
result = lexer.integerOctalLiteral();
test(
  String.raw`0o6655_1466`,
  result,
  {
    token: '66551466',
    kind: 'integeroctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 11,
  },
);

print('============== INTEGERHEXADECIMALLITERAL ==============');
lexer = new Lexer('0xgffe');
result = lexer.integerHexadecimalLiteral();
test(
  String.raw`0xgffe--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('0xff__');
result = lexer.integerHexadecimalLiteral();
test(
  String.raw`0xff__--------->MID`,
  result,
  {
    token: 'ff',
    kind: 'integerhexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('0xab__6');
result = lexer.integerHexadecimalLiteral();
test(
  String.raw`0xab__6--------->MID`,
  result,
  {
    token: 'ab',
    kind: 'integerhexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('0x56fe');
result = lexer.integerHexadecimalLiteral();
test(
  String.raw`0x56fe`,
  result,
  {
    token: '56fe',
    kind: 'integerhexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 6,
  },
);

lexer = new Lexer('0x6C_5F_14_e6');
result = lexer.integerHexadecimalLiteral();
test(
  String.raw`0x6C_5F_14_e6`,
  result,
  {
    token: '6C5F14e6',
    kind: 'integerhexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 13,
  },
);

print('============== INTEGERDECIMALLITERAL ==============');
lexer = new Lexer('a345');
result = lexer.integerDecimalLiteral();
test(
  String.raw`a345--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('34_5ab');
result = lexer.integerDecimalLiteral();
test(
  String.raw`34_5ab--------->MID`,
  result,
  {
    token: '345',
    kind: 'integerdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('9_0__6');
result = lexer.integerDecimalLiteral();
test(
  String.raw`9_0__6--------->MID`,
  result,
  {
    token: '90',
    kind: 'integerdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('5_200');
result = lexer.integerDecimalLiteral();
test(
  String.raw`5_200`,
  result,
  {
    token: '5200',
    kind: 'integerdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

lexer = new Lexer('1_245_000');
result = lexer.integerDecimalLiteral();
test(
  String.raw`1_245_000`,
  result,
  {
    token: '1245000',
    kind: 'integerdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 9,
  },
);

print('============== TEST RESULTS ==============');

// Print details of test.
test();
