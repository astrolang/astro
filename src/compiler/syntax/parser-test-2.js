const Lexer = require('./lexer');
const {
  Parser,
  nextCodeLine,
} = require('./parser');
const { print, createTest } = require('../utils');

let lexer = null;
let parser = null;
let result = null;
const test = createTest();

print('============== NEXTCODELINE ==============');
// lexer = new Lexer('#= hello world');
// parser = new Parser(lexer.lex());
// result = nextCodeLine(parser);
// test(
//   String.raw`#= hello world--------->FAIL`,
//   {
//     parser: {
//       tokenPosition: parser.tokenPosition,
//       line: parser.line,
//       column: parser.column,
//     },
//     result,
//   },
//   {
//     parser: {
//       tokenPosition: -1,
//       line: 1,
//       column: 0,
//     },
//     result: {
//       success: false,
//       ast: {
//         kind: 'comment',
//       },
//     },
//   },
// );

lexer = new Lexer('    \r\n# hello\n#= world =#\n');
parser = new Parser(lexer.lex());
result = nextCodeLine(parser);
test(
  String.raw`    \r\n# hello\n#= world =#\n`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 0,
      line: 1,
      column: 18,
    },
    result: {
      success: true,
      ast: {
        kind: 'nextcodeline',
        value: ' hello \r\n 78f ',
      },
    },
  },
);

lexer = new Lexer('    \r\n# hello\n#= world =#');
parser = new Parser(lexer.lex());
result = nextCodeLine(parser);
test(
  String.raw`    \r\n# hello\n#= world =#`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 0,
      line: 1,
      column: 18,
    },
    result: {
      success: true,
      ast: {
        kind: 'nextcodeline',
        value: ' hello \r\n 78f ',
      },
    },
  },
);
