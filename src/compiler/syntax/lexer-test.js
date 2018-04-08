const Lexer = require('./lexer');
const { print, createTest } = require('../utils');

// Test object.
let lexer = null;
let result = null;
const test = createTest();

print('============== SPACES ==============');
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


lexer = new Lexer('');
result = lexer.spaces();
test(
  String.raw``,
  result,
  null,
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

lexer = new Lexer('678name');
result = lexer.identifier();
test(
  String.raw`678name`,
  result,
  null,
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

lexer = new Lexer('..');
result = lexer.punctuator();
test(
  String.raw`..¡MID¡`,
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

print('============== TEST RESULTS ==============');

// Print details of test.
test();