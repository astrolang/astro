const Lexer = require('./lexer');
const {
  Parser,
  nextCodeLine,
  dedentOrEoiEnd,
  comma,
  listArguments,
  listArgumentsMultiple,
  listLiteral,
} = require('./parser');
const { print, createTest } = require('../../utils');

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
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 4,
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
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 3,
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
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
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
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 4,
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
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 4,
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

result = print('============== COMMA ==============');
lexer = new Lexer('    ,');
parser = new Parser(lexer.lex());
result = comma(parser);
test(
  String.raw`    ,`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 0,
      column: 5,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer('... \r\n,');
parser = new Parser(lexer.lex());
result = comma(parser);
test(
  String.raw`... \r\n,`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 4,
      column: 7,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer(',  ');
parser = new Parser(lexer.lex());
result = comma(parser);
test(
  String.raw`,  `,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 0,
      column: 1,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer('  ,   \nworld');
parser = new Parser(lexer.lex());
result = comma(parser);
test(
  String.raw`'  ,   \nworld`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 1,
      column: 7,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

print('============== LISTARGUMENTS ==============');
lexer = new Lexer(', 1, 2, 3');
parser = new Parser(lexer.lex());
result = listArguments(parser);
test(
  String.raw`, 1, 2, 3--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      column: 0,
    },
    result: {
      success: false,
      ast: {
        kind: 'listarguments',
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('1, 2, 3,');
parser = new Parser(lexer.lex());
result = listArguments(parser);
test(
  String.raw`1, 2, 3,`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 5,
      column: 8,
    },
    result: {
      success: true,
      ast: {
        kind: 'listarguments',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '1',
          },
          {
            kind: 'integerdecimalliteral',
            value: '2',
          },
          {
            kind: 'integerdecimalliteral',
            value: '3',
          },
        ],
      },
    },
  },
);

lexer = new Lexer('1, 2, \r\n3, 4, 5, 6,\n   \n7');
parser = new Parser(lexer.lex());
result = listArguments(parser);
test(
  String.raw`1, 2, \r\n3, 4, 5, 6,\n   \n7`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 15,
      column: 25,
    },
    result: {
      success: true,
      ast: {
        kind: 'listarguments',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '1',
          },
          {
            kind: 'integerdecimalliteral',
            value: '2',
          },
          {
            kind: 'integerdecimalliteral',
            value: '3',
          },
          {
            kind: 'integerdecimalliteral',
            value: '4',
          },
          {
            kind: 'integerdecimalliteral',
            value: '5',
          },
          {
            kind: 'integerdecimalliteral',
            value: '6',
          },
          {
            kind: 'integerdecimalliteral',
            value: '7',
          },
        ],
      },
    },
  },
);

print('============== LISTARGUMENTSMULTIPLE ==============');
lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = listArgumentsMultiple(parser);
test(
  String.raw`--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      column: 0,
    },
    result: {
      success: false,
      ast: {
        kind: 'listargumentsmultiple',
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('3, 2, 1; , 1, 2, 3');
parser = new Parser(lexer.lex());
result = listArgumentsMultiple(parser);
test(
  String.raw`3, 2, 1; , 1, 2, 3--------->MID`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 5,
      column: 8,
    },
    result: {
      success: true,
      ast: {
        kind: 'listargumentsmultiple',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '3',
          },
          {
            kind: 'integerdecimalliteral',
            value: '2',
          },
          {
            kind: 'integerdecimalliteral',
            value: '1',
          },
        ],
      },
    },
  },
);

lexer = new Lexer('500\n600');
parser = new Parser(lexer.lex());
result = listArgumentsMultiple(parser);
test(
  String.raw`500\n600`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 2,
      column: 7,
    },
    result: {
      success: true,
      ast: {
        kind: 'listargumentsmultiple',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '500',
          },
          {
            kind: 'integerdecimalliteral',
            value: '600',
          },
        ],
      },
    },
  },
);

lexer = new Lexer('1, 2, 3,\n4, 5, 6');
parser = new Parser(lexer.lex());
result = listArgumentsMultiple(parser);
test(
  String.raw`1, 2, 3,\n4, 5, 6`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 11,
      column: 16,
    },
    result: {
      success: true,
      ast: {
        kind: 'listargumentsmultiple',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '1',
          },
          {
            kind: 'integerdecimalliteral',
            value: '2',
          },
          {
            kind: 'integerdecimalliteral',
            value: '3',
          },
          {
            kind: 'integerdecimalliteral',
            value: '4',
          },
          {
            kind: 'integerdecimalliteral',
            value: '5',
          },
          {
            kind: 'integerdecimalliteral',
            value: '6',
          },
        ],
      },
    },
  },
);


lexer = new Lexer('1, 2, 3; 4, 5, 6');
parser = new Parser(lexer.lex());
result = listArgumentsMultiple(parser);
test(
  String.raw`1, 2, 3; 4, 5, 6`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 10,
      column: 16,
    },
    result: {
      success: true,
      ast: {
        kind: 'listargumentsmultiple',
        expressions: [
          {
            kind: 'listliteral',
            expressions: [
              {
                kind: 'integerdecimalliteral',
                value: '1',
              },
              {
                kind: 'integerdecimalliteral',
                value: '2',
              },
              {
                kind: 'integerdecimalliteral',
                value: '3',
              },
            ],
          },
          {
            kind: 'listliteral',
            expressions: {
              kind: 'listarguments',
              expressions: [
                {
                  kind: 'integerdecimalliteral',
                  value: '4',
                },
                {
                  kind: 'integerdecimalliteral',
                  value: '5',
                },
                {
                  kind: 'integerdecimalliteral',
                  value: '6',
                },
              ],
            },
          },
        ],
      },
    },
  },
);

print('============== LISTLITERAL ==============');
lexer = new Lexer('[}');
parser = new Parser(lexer.lex());
result = listLiteral(parser);
test(
  String.raw`[}--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      column: 0,
    },
    result: {
      success: false,
      ast: {
        kind: 'listliteral',
        transposed: false,
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('[3, 2, 1; , 1, 2, 3]');
parser = new Parser(lexer.lex());
result = listLiteral(parser);
test(
  String.raw`[3, 2, 1; , 1, 2, 3]--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      column: 0,
    },
    result: {
      success: false,
      ast: {
        kind: 'listliteral',
        transposed: false,
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('[50, 62,  \n56, 7,]\'');
parser = new Parser(lexer.lex());
result = listLiteral(parser);
test(
  String.raw`[50, 62,  \n56, 7]'`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 11,
      column: 19,
    },
    result: {
      success: true,
      ast: {
        kind: 'listliteral',
        transposed: true,
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '50',
          },
          {
            kind: 'integerdecimalliteral',
            value: '62',
          },
          {
            kind: 'integerdecimalliteral',
            value: '56',
          },
          {
            kind: 'integerdecimalliteral',
            value: '7',
          },
        ],
      },
    },
  },
);

lexer = new Lexer('[1, 2, 3,]');
parser = new Parser(lexer.lex());
result = listLiteral(parser);
test(
  String.raw`[1, 2, 3,]`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 7,
      column: 10,
    },
    result: {
      success: true,
      ast: {
        kind: 'listliteral',
        transposed: false,
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '1',
          },
          {
            kind: 'integerdecimalliteral',
            value: '2',
          },
          {
            kind: 'integerdecimalliteral',
            value: '3',
          },
        ],
      },
    },
  },
);

lexer = new Lexer('[1, 2, 3; 4, 5, 6]');
parser = new Parser(lexer.lex());
result = listLiteral(parser);
test(
  String.raw`[1, 2, 3; 4, 5, 6]`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 12,
      column: 18,
    },
    result: {
      success: true,
      ast: {
        kind: 'listliteral',
        transposed: false,
        expressions: [
          {
            kind: 'listliteral',
            expressions: [
              {
                kind: 'integerdecimalliteral',
                value: '1',
              },
              {
                kind: 'integerdecimalliteral',
                value: '2',
              },
              {
                kind: 'integerdecimalliteral',
                value: '3',
              },
            ],
          },
          {
            kind: 'listliteral',
            expressions: {
              kind: 'listarguments',
              expressions: [
                {
                  kind: 'integerdecimalliteral',
                  value: '4',
                },
                {
                  kind: 'integerdecimalliteral',
                  value: '5',
                },
                {
                  kind: 'integerdecimalliteral',
                  value: '6',
                },
              ],
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('[]');
parser = new Parser(lexer.lex());
result = listLiteral(parser);
test(
  String.raw`[]`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 1,
      column: 2,
    },
    result: {
      success: true,
      ast: {
        kind: 'listliteral',
        transposed: false,
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('[1., .2,]\'');
parser = new Parser(lexer.lex());
result = listLiteral(parser);
test(
  String.raw`[1., .2,]'`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 6,
      column: 10,
    },
    result: {
      success: true,
      ast: {
        kind: 'listliteral',
        transposed: true,
        expressions: [
          {
            kind: 'floatdecimalliteral',
            value: '1.0',
          },
          {
            kind: 'floatdecimalliteral',
            value: '0.2',
          },
        ],
      },
    },
  },
);

test();

module.exports = test;
