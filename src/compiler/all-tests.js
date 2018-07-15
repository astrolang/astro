const { showTestInfo } = require('../utils');
const indexTest = require('../utils/index-test');
const lexerTest = require('./syntax/lexer-test');
const parserTest1 = require('./syntax/parser-test-1');
const parserTest2 = require('./syntax/parser-test-2');

showTestInfo(indexTest, lexerTest, parserTest1, parserTest2);
