const Lexer = require('./lexer');
const {
  Parser,
  nextCodeLine,
  dedentOrEoiEnd,
} = require('./parser');
const { print, createTest } = require('../utils');

let lexer = null;
let parser = null;
let result = null;
const test = createTest();

print('============== NEXTCODELINE ==============');
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
      tokenPosition: 4,
      line: 1,
      column: 26,
    },
    result: {
      success: true,
      ast: {
        kind: 'nextcodeline',
        comments: [
          {
            kind: 'singlelinecomment',
            value: ' hello',
          },
          {
            kind: 'multilinecomment',
            value: ' world ',
          },
        ],
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
      tokenPosition: 3,
      line: 1,
      column: 25,
    },
    result: {
      success: true,
      ast: {
        kind: 'nextcodeline',
        comments: [
          {
            kind: 'singlelinecomment',
            value: ' hello',
          },
          {
            kind: 'multilinecomment',
            value: ' world ',
          },
        ],
      },
    },
  },
);

print('============== DEDENTOREOIEND ==============');
lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = dedentOrEoiEnd(parser);
test(
  String.raw``,
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
      tokenPosition: -1,
      line: 1,
      column: 0,
    },
    result: {
      success: true,
      ast: {
        kind: 'dedentoreoiend',
        comments: [],
      },
    },
  },
);

lexer = new Lexer('    \r\n# hello\n#= world =#\n');
parser = new Parser(lexer.lex());
result = dedentOrEoiEnd(parser);
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
      tokenPosition: 4,
      line: 1,
      column: 26,
    },
    result: {
      success: true,
      ast: {
        kind: 'dedentoreoiend',
        comments: [
          {
            kind: 'singlelinecomment',
            value: ' hello',
          },
          {
            kind: 'multilinecomment',
            value: ' world ',
          },
        ],
      },
    },
  },
);

lexer = new Lexer('    \r\n    # hello\n    #= world =#\nend');
parser = new Parser(lexer.lex());
parser.lastIndentCount = 1;
result = dedentOrEoiEnd(parser);
test(
  String.raw`    \r\n    # hello\n    #= world =#\nend`,
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
      tokenPosition: 4,
      line: 1,
      column: 34,
    },
    result: {
      success: true,
      ast: {
        kind: 'dedentoreoiend',
        comments: [
          {
            kind: 'singlelinecomment',
            value: ' hello',
          },
          {
            kind: 'multilinecomment',
            value: ' world ',
          },
        ],
      },
    },
  },
);

test();

module.exports = test;
