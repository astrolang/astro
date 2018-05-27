const indexTest = require('./utils/index-test');
const lexerTest = require('./syntax/lexer-test');
const parserTest = require('./syntax/parser-test');
const { showTestInfo } = require('./utils');

showTestInfo(indexTest, lexerTest, parserTest);
