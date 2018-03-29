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
    line: 1,
    column: 0,
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
    line: 1,
    column: 0,
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
    line: 1,
    column: 0,
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
    line: 1,
    column: 0,
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
    line: 1,
    column: 0,
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
    line: 1,
    column: 0,
  },
);

// Print details of test.
test();
