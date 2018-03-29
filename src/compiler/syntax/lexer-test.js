const Lexer = require('./lexer');
const { print } = require('../utils');
const assert = require('assert');

// Test object.
let lexer = null;

print('============== SPACES ==============');
print(String.raw` \t\t  `);
lexer = new Lexer(' \t\t  ');
assert(lexer, {
  token: '',
  kind: 'spaces',
  line: 1,
  column: 0,
});
