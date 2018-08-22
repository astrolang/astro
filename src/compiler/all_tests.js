const { showTestInfo } = require('../utils');
const indexTest = require('../utils/index_test');
const lexerTest = require('./syntax/lexer_test');
const parserTest1 = require('./syntax/parser_test_1');
const parserTest2 = require('./syntax/parser_test_2');
const parserTest3 = require('./syntax/parser_test_3');

showTestInfo(indexTest, lexerTest, parserTest1, parserTest2, parserTest3);
