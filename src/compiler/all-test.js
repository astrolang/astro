const { showTestInfo } = require('./utils');
const indexTest = require('./utils/index-test');
const lexerTest = require('./syntax/lexer-test');
const parserTest = require('./syntax/parser-test');

showTestInfo(indexTest, lexerTest, parserTest);
