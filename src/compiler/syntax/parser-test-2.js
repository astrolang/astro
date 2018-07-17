/* eslint-disable no-template-curly-in-string */
const Lexer = require('./lexer');
const {
  Parser,
  nextCodeLine,
  dedentOrEoiEnd,
  comma,
  listArguments,
  listArgumentsMultiple,
  listLiteral,
  dictArgument,
  dictArguments,
  dictLiteral,
  tupleArguments,
  tupleLiteral,
  symbolLiteral,
  // comprehensionHead,
  // generatorComprehension,
  // listComprehension,
  // dictComprehension,
  // comprehension,
  literal,
  callArguments,
  callPostfix,
  dotNotationPostfix,
  cascadeNotationArguments,
  cascadeNotationPostfix,
  cascadeNotationPrefix,
  indexArgument,
  indexArguments,
  indexPostfix,
  extendedNotation,
  ternaryOperator,
  coefficientExpression,
  returnExpression,
  yieldExpression,
  raiseExpression,
  continueExpression,
  breakExpression,
  fallthroughExpression,
  controlPrimitive,
  subAtomPostfix,
} = require('./parser');
const { print, createTest } = require('../../utils');

let lexer = null;
let parser = null;
let result = null;
const test = createTest();

print('============== NEXTCODELINE ==============');
lexer = new Lexer('    \r\n# hello\n#- world -#\n');
parser = new Parser(lexer.lex());
result = nextCodeLine(parser);
test(
  String.raw`    \r\n# hello\n#- world -#\n`,
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

lexer = new Lexer('    \r\n# hello\n#- world -#');
parser = new Parser(lexer.lex());
result = nextCodeLine(parser);
test(
  String.raw`    \r\n# hello\n#- world -#`,
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

lexer = new Lexer('    \r\n# hello\n#- world -#\n');
parser = new Parser(lexer.lex());
result = dedentOrEoiEnd(parser);
test(
  String.raw`    \r\n# hello\n#- world -#\n`,
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

lexer = new Lexer('    \r\n    # hello\n    #- world -#\nend');
parser = new Parser(lexer.lex());
parser.lastIndentCount = 1;
result = dedentOrEoiEnd(parser);
test(
  String.raw`    \r\n    # hello\n    #- world -#\nend`,
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

lexer = new Lexer('[1, 2]\n[3, 4]');
parser = new Parser(lexer.lex());
result = listArgumentsMultiple(parser);
test(
  String.raw`[1, 2]\n[3, 4]`,
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
      column: 13,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
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
            ],
          },
          {
            kind: 'listliteral',
            transposed: false,
            expressions: [
              {
                kind: 'integerdecimalliteral',
                value: '3',
              },
              {
                kind: 'integerdecimalliteral',
                value: '4',
              },
            ],
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

lexer = new Lexer('[\n    1, 2, 3,\n    4, 5, 6\n]');
parser = new Parser(lexer.lex());
result = listLiteral(parser);
test(
  String.raw`[\n    1, 2, 3,\n    4, 5, 6\n]`,
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
      column: 28,
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

print('============== DICTARGUMENT ==============');
lexer = new Lexer('0: 56');
parser = new Parser(lexer.lex());
result = dictArgument(parser);
test(
  String.raw`0: 56--------->FAIL`,
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
        key: null,
        value: null,
      },
    },
  },
);

lexer = new Lexer('0: \n    56\n,');
parser = new Parser(lexer.lex());
result = dictArgument(parser);
test(
  String.raw`0: \n    56\n,--------->FAIL`,
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
        key: null,
        value: null,
      },
    },
  },
);

lexer = new Lexer('0o5566: 0x5Ap-4,');
parser = new Parser(lexer.lex());
result = dictArgument(parser);
test(
  String.raw`0o5566: 0x5Ap-4,`,
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
      column: 15,
    },
    result: {
      success: true,
      ast: {
        key: {
          kind: 'integeroctalliteral',
          value: '5566',
        },
        value: {
          kind: 'floathexadecimalliteral',
          value: '5Ap-4',
        },
      },
    },
  },
);

lexer = new Lexer('0b110_110 : 89 }');
parser = new Parser(lexer.lex());
result = dictArgument(parser);
test(
  String.raw`0b110_110 : 89 }`,
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
      column: 14,
    },
    result: {
      success: true,
      ast: {
        key: {
          kind: 'integerbinaryliteral',
          value: '110110',
        },
        value: {
          kind: 'integerdecimalliteral',
          value: '89',
        },
      },
    },
  },
);

lexer = new Lexer('name\n}');
parser = new Parser(lexer.lex());
parser.lastIndentCount = 1;
result = dictArgument(parser);
test(
  String.raw`name\n}`,
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
      column: 4,
    },
    result: {
      success: true,
      ast: {
        key: {
          kind: 'identifier',
          value: 'name',
        },
        value: {
          kind: 'identifier',
          value: 'name',
        },
      },
    },
  },
);

lexer = new Lexer('0: \n    3:56, id\nend');
parser = new Parser(lexer.lex());
result = dictArgument(parser);
test(
  String.raw`0: \n    3:56, id\nend`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 8,
      column: 17,
    },
    result: {
      success: true,
      ast: {
        key: {
          kind: 'integerdecimalliteral',
          value: '0',
        },
        value: {
          kind: 'dictliteral',
          expressions: [
            {
              key: {
                kind: 'integerdecimalliteral',
                value: '3',
              },
              value: {
                kind: 'integerdecimalliteral',
                value: '56',
              },
            },
            {
              key: {
                kind: 'identifier',
                value: 'id',
              },
              value: {
                kind: 'identifier',
                value: 'id',
              },
            },
          ],
        },
      },
    },
  },
);

print('============== DICTARGUMENTS ==============');
lexer = new Lexer('0x45:\n    56 : 2\n,56');
parser = new Parser(lexer.lex());
result = dictArguments(parser);
test(
  String.raw`0x45:\n    56 : 2\n,56--------->FAIL`,
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
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = dictArguments(parser);
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
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('0x5:1, 0xE: 56, id,');
parser = new Parser(lexer.lex());
result = dictArguments(parser);
test(
  String.raw`0x5:1, 0xE: 56, id,`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 9,
      column: 19,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: {
              kind: 'integerhexadecimalliteral',
              value: '5',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
          {
            key: {
              kind: 'integerhexadecimalliteral',
              value: 'E',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'id',
            },
            value: {
              kind: 'identifier',
              value: 'id',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('0b1.1101: 78,  \n0x45: 66,');
parser = new Parser(lexer.lex());
result = dictArguments(parser);
test(
  String.raw`0b1.1101: 78,  \n0x45: 66 }`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 8,
      column: 25,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: {
              kind: 'floatbinaryliteral',
              value: '1.1101',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '78',
            },
          },
          {
            key: {
              kind: 'integerhexadecimalliteral',
              value: '45',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '66',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('0b1.1101: 78,  \n1:\n    0x45 : 6\n56 : 2}');
parser = new Parser(lexer.lex());
result = dictArguments(parser);
test(
  String.raw`0b1.1101: 78,  \n1:\n    0x45 : 6\n56 : 2}`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 14,
      column: 38,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: {
              kind: 'floatbinaryliteral',
              value: '1.1101',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '78',
            },
          },
          {
            key: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
            value: {
              kind: 'dictliteral',
              expressions: [
                {
                  key: {
                    kind: 'integerhexadecimalliteral',
                    value: '45',
                  },
                  value: {
                    kind: 'integerdecimalliteral',
                    value: '6',
                  },
                },
              ],
            },
          },
          {
            key: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '2',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('1:\n    2:\n        3: 0x5.5,\n        id\n    4: 1\n5: 2_000,');
parser = new Parser(lexer.lex());
result = dictArguments(parser);
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
      tokenPosition: 20,
      column: 57,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
            value: {
              kind: 'dictliteral',
              expressions: [
                {
                  key: {
                    kind: 'integerdecimalliteral',
                    value: '2',
                  },
                  value: {
                    kind: 'dictliteral',
                    expressions: [
                      {
                        key: {
                          kind: 'integerdecimalliteral',
                          value: '3',
                        },
                        value: {
                          kind: 'floathexadecimalliteral',
                          value: '5.5',
                        },
                      },
                      {
                        key: {
                          kind: 'identifier',
                          value: 'id',
                        },
                        value: {
                          kind: 'identifier',
                          value: 'id',
                        },
                      },
                    ],
                  },
                },
                {
                  key: {
                    kind: 'integerdecimalliteral',
                    value: '4',
                  },
                  value: {
                    kind: 'integerdecimalliteral',
                    value: '1',
                  },
                },
              ],
            },
          },
          {
            key: {
              kind: 'integerdecimalliteral',
              value: '5',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '2000',
            },
          },
        ],
      },
    },
  },
);

print('============== DICTLITERAL ==============');
lexer = new Lexer('{]');
parser = new Parser(lexer.lex());
result = dictLiteral(parser);
test(
  String.raw`{]--------->FAIL`,
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
        kind: 'dictliteral',
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('{   }');
parser = new Parser(lexer.lex());
result = dictLiteral(parser);
test(
  String.raw`{   }`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: {
        kind: 'dictliteral',
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('{ 3: 0x5.5, id, \n2_000: 1 }');
parser = new Parser(lexer.lex());
result = dictLiteral(parser);
test(
  String.raw`{ 3: 0x5.5, id, \n2_000: 1 }`,
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
      column: 27,
    },
    result: {
      success: true,
      ast: {
        kind: 'dictliteral',
        expressions: [
          {
            key: {
              kind: 'integerdecimalliteral',
              value: '3',
            },
            value: {
              kind: 'floathexadecimalliteral',
              value: '5.5',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'id',
            },
            value: {
              kind: 'identifier',
              value: 'id',
            },
          },
          {
            key: {
              kind: 'integerdecimalliteral',
              value: '2000',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('{ \n    3:\n        2: 0x5.5, id\n    2_000: 1, \n}');
parser = new Parser(lexer.lex());
result = dictLiteral(parser);
test(
  String.raw`{ \n    3:\n        2: 0x5.5, id\n    2_000: 1, \n}`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 16,
      column: 47,
    },
    result: {
      success: true,
      ast: {
        kind: 'dictliteral',
        expressions: [
          {
            key: {
              kind: 'integerdecimalliteral',
              value: '3',
            },
            value: {
              kind: 'dictliteral',
              expressions: [
                {
                  key: {
                    kind: 'integerdecimalliteral',
                    value: '2',
                  },
                  value: {
                    kind: 'floathexadecimalliteral',
                    value: '5.5',
                  },
                },
                {
                  key: {
                    kind: 'identifier',
                    value: 'id',
                  },
                  value: {
                    kind: 'identifier',
                    value: 'id',
                  },
                },
              ],
            },
          },
          {
            key: {
              kind: 'integerdecimalliteral',
              value: '2000',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('{ name, 0b11_01.001:\n    age\n0o77:7,}');
parser = new Parser(lexer.lex());
result = dictLiteral(parser);
test(
  String.raw`{ name, 0b11_01.001:\n    age\n0o77:7,}`,
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
      column: 37,
    },
    result: {
      success: true,
      ast: {
        kind: 'dictliteral',
        expressions: [
          {
            key: {
              kind: 'identifier',
              value: 'name',
            },
            value: {
              kind: 'identifier',
              value: 'name',
            },
          },
          {
            key: {
              kind: 'floatbinaryliteral',
              value: '1101.001',
            },
            value: {
              kind: 'dictliteral',
              expressions: [
                {
                  key: {
                    kind: 'identifier',
                    value: 'age',
                  },
                  value: {
                    kind: 'identifier',
                    value: 'age',
                  },
                },
              ],
            },
          },
          {
            key: {
              kind: 'integeroctalliteral',
              value: '77',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '7',
            },
          },
        ],
      },
    },
  },
);

print('============== TUPLEARGUMENTS ==============');
lexer = new Lexer('56');
parser = new Parser(lexer.lex());
result = tupleArguments(parser);
test(
  String.raw`56--------->FAIL`,
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
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = tupleArguments(parser);
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
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('56, 23:5');
parser = new Parser(lexer.lex());
result = tupleArguments(parser);
test(
  String.raw`56, 23:5--------->MID`,
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
      column: 6,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '23',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('num:1, total_500 :34, 56');
parser = new Parser(lexer.lex());
result = tupleArguments(parser);
test(
  String.raw`num:1, total_500 :34, 56`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 8,
      column: 24,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: {
              kind: 'identifier',
              value: 'num',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'total_500',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '34',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('56 ,');
parser = new Parser(lexer.lex());
result = tupleArguments(parser);
test(
  String.raw`56 ,`,
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
      column: 4,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('num:1, \n0b1_001, total_500 :34, 56');
parser = new Parser(lexer.lex());
result = tupleArguments(parser);
test(
  String.raw`num:1, \n0b1_001, total_500 :34, 56`,
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
      column: 34,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: {
              kind: 'identifier',
              value: 'num',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerbinaryliteral',
              value: '1001',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'total_500',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '34',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
        ],
      },
    },
  },
);

print('============== TUPLELITERAL ==============');
lexer = new Lexer('(]');
parser = new Parser(lexer.lex());
result = tupleLiteral(parser);
test(
  String.raw`(]--------->FAIL`,
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
        kind: 'tupleliteral',
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('(   )');
parser = new Parser(lexer.lex());
result = tupleLiteral(parser);
test(
  String.raw`(   )`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: {
        kind: 'tupleliteral',
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('( a: 0x5.5, 23, \nb: 1 )');
parser = new Parser(lexer.lex());
result = tupleLiteral(parser);
test(
  String.raw`( a: 0x5.5, 23, \nb: 1 )`,
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
      column: 23,
    },
    result: {
      success: true,
      ast: {
        kind: 'tupleliteral',
        expressions: [
          {
            key: {
              kind: 'identifier',
              value: 'a',
            },
            value: {
              kind: 'floathexadecimalliteral',
              value: '5.5',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '23',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'b',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
        ],
      },
    },
  },
);

print('============== SYMBOLLITERAL ==============');
lexer = new Lexer('${}');
parser = new Parser(lexer.lex());
result = symbolLiteral(parser);
test(
  '${}--------->FAIL',
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
        kind: 'symbolliteral',
        expression: {},
      },
    },
  },
);


lexer = new Lexer('$ {.357}');
parser = new Parser(lexer.lex());
result = symbolLiteral(parser);
test(
  '$ {.357}--------->FAIL',
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
        kind: 'symbolliteral',
        expression: {},
      },
    },
  },
);


lexer = new Lexer('$ identifier');
parser = new Parser(lexer.lex());
result = symbolLiteral(parser);
test(
  '$ identifier--------->FAIL',
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
        kind: 'symbolliteral',
        expression: {},
      },
    },
  },
);


lexer = new Lexer('${.357}');
parser = new Parser(lexer.lex());
result = symbolLiteral(parser);
test(
  '${.357}',
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
      column: 7,
    },
    result: {
      success: true,
      ast: {
        kind: 'symbolliteral',
        expression: {
          kind: 'floatdecimalliteral',
          value: '0.357',
        },
      },
    },
  },
);

lexer = new Lexer('$complex_456_name');
parser = new Parser(lexer.lex());
result = symbolLiteral(parser);
test(
  String.raw`$complex_456_name`,
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
      column: 17,
    },
    result: {
      success: true,
      ast: {
        kind: 'symbolliteral',
        expression: {
          kind: 'identifier',
          value: 'complex_456_name',
        },
      },
    },
  },
);

print('============== TUPLELITERAL ==============');
lexer = new Lexer('(]');
parser = new Parser(lexer.lex());
result = tupleLiteral(parser);
test(
  String.raw`(]--------->FAIL`,
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
        kind: 'tupleliteral',
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('(   )');
parser = new Parser(lexer.lex());
result = tupleLiteral(parser);
test(
  String.raw`(   )`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: {
        kind: 'tupleliteral',
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('( a: 0x5.5, 23, \nb: 1 )');
parser = new Parser(lexer.lex());
result = tupleLiteral(parser);
test(
  String.raw`( a: 0x5.5, 23, \nb: 1 )`,
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
      column: 23,
    },
    result: {
      success: true,
      ast: {
        kind: 'tupleliteral',
        expressions: [
          {
            key: {
              kind: 'identifier',
              value: 'a',
            },
            value: {
              kind: 'floathexadecimalliteral',
              value: '5.5',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '23',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'b',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
        ],
      },
    },
  },
);

print('============== LITERAL ==============');
lexer = new Lexer('0x55.01pE3');
parser = new Parser(lexer.lex());
result = literal(parser);
test(
  '0x55.01pE3',
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
      column: 10,
    },
    result: {
      success: true,
      ast: {
        kind: 'floathexadecimalliteral',
        value: '55.01pE3',
      },
    },
  },
);


lexer = new Lexer('${.357}');
parser = new Parser(lexer.lex());
result = literal(parser);
test(
  '${.357}',
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
      column: 7,
    },
    result: {
      success: true,
      ast: {
        kind: 'symbolliteral',
        expression: {
          kind: 'floatdecimalliteral',
          value: '0.357',
        },
      },
    },
  },
);

lexer = new Lexer('[1, 2; 3, 4]');
parser = new Parser(lexer.lex());
result = literal(parser);
test(
  String.raw`[1, 2; 3, 4]`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 8,
      column: 12,
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
            ],
          },
          {
            kind: 'listliteral',
            expressions: [
              {
                kind: 'integerdecimalliteral',
                value: '3',
              },
              {
                kind: 'integerdecimalliteral',
                value: '4',
              },
            ],
          },
        ],
      },
    },
  },
);

lexer = new Lexer('{ 2:1, id, 3:4 }');
parser = new Parser(lexer.lex());
result = literal(parser);
test(
  String.raw`{ 2:1, id, 3:4 }`,
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
        kind: 'dictliteral',
        expressions: [
          {
            key: {
              kind: 'integerdecimalliteral',
              value: '2',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'id',
            },
            value: {
              kind: 'identifier',
              value: 'id',
            },
          },
          {
            key: {
              kind: 'integerdecimalliteral',
              value: '3',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '4',
            },
          },
        ],
      },
    },
  },
);

print('============== CALLARGUMENTS ==============');
lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = callArguments(parser);
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
        expressions: [],
      },
    },
  },
);

lexer = new Lexer('56, 23:5');
parser = new Parser(lexer.lex());
result = callArguments(parser);
test(
  String.raw`56, 23:5--------->MID`,
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
      column: 6,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '23',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('num:1, total_500 :34, 56');
parser = new Parser(lexer.lex());
result = callArguments(parser);
test(
  String.raw`num:1, total_500 :34, 56`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 8,
      column: 24,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: {
              kind: 'identifier',
              value: 'num',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'total_500',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '34',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('56');
parser = new Parser(lexer.lex());
result = callArguments(parser);
test(
  String.raw`56`,
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
      column: 2,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('num:1, \n0b1_001, total_500 :34, 56');
parser = new Parser(lexer.lex());
result = callArguments(parser);
test(
  String.raw`num:1, \n0b1_001, total_500 :34, 56`,
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
      column: 34,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            key: {
              kind: 'identifier',
              value: 'num',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerbinaryliteral',
              value: '1001',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'total_500',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '34',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
        ],
      },
    },
  },
);

print('============== CALLPOSTFIX ==============');
lexer = new Lexer('(]');
parser = new Parser(lexer.lex());
result = callPostfix(parser);
test(
  String.raw`(]--------->FAIL`,
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
        kind: 'callpostfix',
        expression: null,
        mutative: false,
        vectorized: false,
        arguments: [],
      },
    },
  },
);

lexer = new Lexer('! ()');
parser = new Parser(lexer.lex());
result = callPostfix(parser);
test(
  String.raw`! ()--------->FAIL`,
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
        kind: 'callpostfix',
        expression: null,
        mutative: false,
        vectorized: false,
        arguments: [],
      },
    },
  },
);

lexer = new Lexer('. (2)');
parser = new Parser(lexer.lex());
result = callPostfix(parser);
test(
  String.raw`. (2)--------->FAIL`,
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
        kind: 'callpostfix',
        expression: null,
        mutative: false,
        vectorized: false,
        arguments: [],
      },
    },
  },
);

lexer = new Lexer('.!(5, 6)');
parser = new Parser(lexer.lex());
result = callPostfix(parser);
test(
  String.raw`.!(5, 6)--------->FAIL`,
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
        kind: 'callpostfix',
        expression: null,
        mutative: false,
        vectorized: false,
        arguments: [],
      },
    },
  },
);

lexer = new Lexer('(   )');
parser = new Parser(lexer.lex());
result = callPostfix(parser);
test(
  String.raw`(   )`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: {
        kind: 'callpostfix',
        expression: null,
        mutative: false,
        vectorized: false,
        arguments: [],
      },
    },
  },
);

lexer = new Lexer('!.(   )');
parser = new Parser(lexer.lex());
result = callPostfix(parser);
test(
  String.raw`!.(   )`,
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
      column: 7,
    },
    result: {
      success: true,
      ast: {
        kind: 'callpostfix',
        expression: null,
        mutative: true,
        vectorized: true,
        arguments: [],
      },
    },
  },
);

lexer = new Lexer('( a: 0x5.5, 23, \nb: 1 )');
parser = new Parser(lexer.lex());
result = callPostfix(parser);
test(
  String.raw`( a: 0x5.5, 23, \nb: 1 )`,
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
      column: 23,
    },
    result: {
      success: true,
      ast: {
        kind: 'callpostfix',
        expression: null,
        mutative: false,
        vectorized: false,
        arguments: [
          {
            key: {
              kind: 'identifier',
              value: 'a',
            },
            value: {
              kind: 'floathexadecimalliteral',
              value: '5.5',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '23',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'b',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('!( a: 0x5.5, 23, \nb: 1 )');
parser = new Parser(lexer.lex());
result = callPostfix(parser);
test(
  String.raw`!( a: 0x5.5, 23, \nb: 1 )`,
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
      column: 24,
    },
    result: {
      success: true,
      ast: {
        kind: 'callpostfix',
        expression: null,
        mutative: true,
        vectorized: false,
        arguments: [
          {
            key: {
              kind: 'identifier',
              value: 'a',
            },
            value: {
              kind: 'floathexadecimalliteral',
              value: '5.5',
            },
          },
          {
            key: null,
            value: {
              kind: 'integerdecimalliteral',
              value: '23',
            },
          },
          {
            key: {
              kind: 'identifier',
              value: 'b',
            },
            value: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('.(a: 0x5.5, )');
parser = new Parser(lexer.lex());
result = callPostfix(parser);
test(
  String.raw`.(a: 0x5.5, )`,
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
      column: 13,
    },
    result: {
      success: true,
      ast: {
        kind: 'callpostfix',
        expression: null,
        mutative: false,
        vectorized: true,
        arguments: [
          {
            key: {
              kind: 'identifier',
              value: 'a',
            },
            value: {
              kind: 'floathexadecimalliteral',
              value: '5.5',
            },
          },
        ],
      },
    },
  },
);

print('============== DOTNOTATIONPOSTFIX ==============');
lexer = new Lexer('. name');
parser = new Parser(lexer.lex());
result = dotNotationPostfix(parser);
test(
  String.raw`. name--------->FAIL`,
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
        kind: 'dotnotationpostfix',
        expression: null,
        name: null,
      },
    },
  },
);

lexer = new Lexer('.name');
parser = new Parser(lexer.lex());
result = dotNotationPostfix(parser);
test(
  String.raw`.name`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: {
        kind: 'dotnotationpostfix',
        expression: null,
        name: {
          kind: 'identifier',
          value: 'name',
        },
      },
    },
  },
);

print('============== CASCADENOTATIONARGUMENTS ==============');
lexer = new Lexer('a . + b');
parser = new Parser(lexer.lex());
result = cascadeNotationArguments(parser);
test(
  String.raw`a . + b--------->FAIL`,
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
        expressions: [],
        operators: [],
      },
    },
  },
);

lexer = new Lexer('a.+ b');
parser = new Parser(lexer.lex());
result = cascadeNotationArguments(parser);
test(
  String.raw`a.+ b--------->FAIL`,
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
        expressions: [],
        operators: [],
      },
    },
  },
);

lexer = new Lexer('a + b+ c');
parser = new Parser(lexer.lex());
result = cascadeNotationArguments(parser);
test(
  String.raw`a + b+ c--------->MID`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            kind: 'identifier',
            value: 'a',
          },
          {
            kind: 'identifier',
            value: 'b',
          },
        ],
        operators: [
          {
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('a + b .+ c');
parser = new Parser(lexer.lex());
result = cascadeNotationArguments(parser);
test(
  String.raw`a + b .+ c`,
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
      column: 10,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            kind: 'identifier',
            value: 'a',
          },
          {
            kind: 'identifier',
            value: 'b',
          },
          {
            kind: 'identifier',
            value: 'c',
          },
        ],
        operators: [
          {
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
          {
            vectorized: true,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('a + b.+c');
parser = new Parser(lexer.lex());
result = cascadeNotationArguments(parser);
test(
  String.raw`a + b.+c`,
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
        expressions: [
          {
            kind: 'identifier',
            value: 'a',
          },
          {
            kind: 'identifier',
            value: 'b',
          },
          {
            kind: 'identifier',
            value: 'c',
          },
        ],
        operators: [
          {
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
          {
            vectorized: true,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('a+b.+c * d');
parser = new Parser(lexer.lex());
result = cascadeNotationArguments(parser);
test(
  String.raw`a+b.+c * d`,
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
        expressions: [
          {
            kind: 'identifier',
            value: 'a',
          },
          {
            kind: 'identifier',
            value: 'b',
          },
          {
            kind: 'identifier',
            value: 'c',
          },
          {
            kind: 'identifier',
            value: 'd',
          },
        ],
        operators: [
          {
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
          {
            vectorized: true,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
          {
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '*',
            },
          },
        ],
      },
    },
  },
);

print('============== CASCADENOTATIONPOSTFIX ==============');
lexer = new Lexer('.{a . + b}');
parser = new Parser(lexer.lex());
result = cascadeNotationPostfix(parser);
test(
  String.raw`.{a . + b}--------->FAIL`,
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
        kind: 'cascadenotationpostfix',
        leftexpression: null,
        rightexpression: null,
        expressions: [],
        operators: [],
      },
    },
  },
);

lexer = new Lexer('. {a .+ b}');
parser = new Parser(lexer.lex());
result = cascadeNotationPostfix(parser);
test(
  String.raw`. {a .+ b}--------->FAIL`,
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
        kind: 'cascadenotationpostfix',
        leftexpression: null,
        rightexpression: null,
        expressions: [],
        operators: [],
      },
    },
  },
);

lexer = new Lexer('.{a + b} .name');
parser = new Parser(lexer.lex());
result = cascadeNotationPostfix(parser);
test(
  String.raw`.{a + b} .name--------->MID`,
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
        kind: 'cascadenotationpostfix',
        leftexpression: null,
        rightexpression: null,
        expressions: [
          {
            kind: 'identifier',
            value: 'a',
          },
          {
            kind: 'identifier',
            value: 'b',
          },
        ],
        operators: [
          {
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('.{ a + b.+c }.comp13x_n4m3');
parser = new Parser(lexer.lex());
result = cascadeNotationPostfix(parser);
test(
  String.raw`.{ a + b.+c }.comp13x_n4m3`,
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
      column: 26,
    },
    result: {
      success: true,
      ast: {
        kind: 'cascadenotationpostfix',
        leftexpression: null,
        rightexpression: {
          kind: 'identifier',
          value: 'comp13x_n4m3',
        },
        expressions: [
          {
            kind: 'identifier',
            value: 'a',
          },
          {
            kind: 'identifier',
            value: 'b',
          },
          {
            kind: 'identifier',
            value: 'c',
          },
        ],
        operators: [
          {
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
          {
            vectorized: true,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
        ],
      },
    },
  },
);

print('============== CASCADENOTATIONPREFIX ==============');
lexer = new Lexer('.{a .+ b}.name');
parser = new Parser(lexer.lex());
result = cascadeNotationPrefix(parser);
test(
  String.raw`.{a .+ b}.name--------->FAIL`,
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
        kind: 'cascadenotationprefix',
        leftexpression: null,
        rightexpression: null,
        expressions: [],
        operators: [],
      },
    },
  },
);

lexer = new Lexer('{a .+ b}');
parser = new Parser(lexer.lex());
result = cascadeNotationPrefix(parser);
test(
  String.raw`{a .+ b}--------->FAIL`,
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
        kind: 'cascadenotationprefix',
        leftexpression: null,
        rightexpression: null,
        expressions: [],
        operators: [],
      },
    },
  },
);

lexer = new Lexer('{a + b} .name');
parser = new Parser(lexer.lex());
result = cascadeNotationPrefix(parser);
test(
  String.raw`{a + b} .name--------->FAIL`,
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
        kind: 'cascadenotationprefix',
        leftexpression: null,
        rightexpression: null,
        expressions: [],
        operators: [],
      },
    },
  },
);

lexer = new Lexer('{ a + b.+c }.comp13x_n4m3');
parser = new Parser(lexer.lex());
result = cascadeNotationPrefix(parser);
test(
  String.raw`{ a + b.+c }.comp13x_n4m3`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 9,
      column: 25,
    },
    result: {
      success: true,
      ast: {
        kind: 'cascadenotationprefix',
        leftexpression: null,
        rightexpression: {
          kind: 'identifier',
          value: 'comp13x_n4m3',
        },
        expressions: [
          {
            kind: 'identifier',
            value: 'a',
          },
          {
            kind: 'identifier',
            value: 'b',
          },
          {
            kind: 'identifier',
            value: 'c',
          },
        ],
        operators: [
          {
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
          {
            vectorized: true,
            operator: {
              kind: 'operator',
              value: '+',
            },
          },
        ],
      },
    },
  },
);

print('============== INDEXARGUMENT ==============');
lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = indexArgument(parser);
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
        begin: null,
        step: null,
        end: null,
      },
    },
  },
);

lexer = new Lexer('56:2:1');
parser = new Parser(lexer.lex());
result = indexArgument(parser);
test(
  String.raw`56:2:1`,
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
      column: 6,
    },
    result: {
      success: true,
      ast: {
        begin: {
          kind: 'integerdecimalliteral',
          value: '56',
        },
        step: {
          kind: 'integerdecimalliteral',
          value: '2',
        },
        end: {
          kind: 'integerdecimalliteral',
          value: '1',
        },
      },
    },
  },
);

lexer = new Lexer('::');
parser = new Parser(lexer.lex());
result = indexArgument(parser);
test(
  String.raw`::`,
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
        begin: null,
        step: null,
        end: null,
      },
    },
  },
);

lexer = new Lexer(':');
parser = new Parser(lexer.lex());
result = indexArgument(parser);
test(
  String.raw`:`,
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
      ast: {
        begin: null,
        step: null,
        end: null,
      },
    },
  },
);

lexer = new Lexer(': : 1');
parser = new Parser(lexer.lex());
result = indexArgument(parser);
test(
  String.raw`: : 1`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: {
        begin: null,
        step: null,
        end: {
          kind: 'integerdecimalliteral',
          value: '1',
        },
      },
    },
  },
);

lexer = new Lexer('0o77_1774');
parser = new Parser(lexer.lex());
result = indexArgument(parser);
test(
  String.raw`0o77_1774`,
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
      column: 9,
    },
    result: {
      success: true,
      ast: {
        index: {
          kind: 'integeroctalliteral',
          value: '771774',
        },
      },
    },
  },
);

lexer = new Lexer('56::1');
parser = new Parser(lexer.lex());
result = indexArgument(parser);
test(
  String.raw`56::1`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: {
        begin: {
          kind: 'integerdecimalliteral',
          value: '56',
        },
        step: null,
        end: {
          kind: 'integerdecimalliteral',
          value: '1',
        },
      },
    },
  },
);

lexer = new Lexer('56:1');
parser = new Parser(lexer.lex());
result = indexArgument(parser);
test(
  String.raw`56:1`,
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
      column: 4,
    },
    result: {
      success: true,
      ast: {
        begin: {
          kind: 'integerdecimalliteral',
          value: '56',
        },
        step: null,
        end: {
          kind: 'integerdecimalliteral',
          value: '1',
        },
      },
    },
  },
);

lexer = new Lexer('5:');
parser = new Parser(lexer.lex());
result = indexArgument(parser);
test(
  String.raw`5:`,
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
        begin: {
          kind: 'integerdecimalliteral',
          value: '5',
        },
        step: null,
        end: null,
      },
    },
  },
);

lexer = new Lexer(':5');
parser = new Parser(lexer.lex());
result = indexArgument(parser);
test(
  String.raw`:5`,
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
        begin: null,
        step: null,
        end: {
          kind: 'integerdecimalliteral',
          value: '5',
        },
      },
    },
  },
);

print('============== INDEXARGUMENTS ==============');
lexer = new Lexer('::1, 5: :34, 56');
parser = new Parser(lexer.lex());
result = indexArguments(parser);
test(
  String.raw`::1, 5: :34, 56`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 9,
      column: 15,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            begin: null,
            step: null,
            end: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
          {
            begin: {
              kind: 'integerdecimalliteral',
              value: '5',
            },
            step: null,
            end: {
              kind: 'integerdecimalliteral',
              value: '34',
            },
          },
          {
            index: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer(':, 56 , : : , :5:  ,');
parser = new Parser(lexer.lex());
result = indexArguments(parser);
test(
  String.raw`:, 56 , : : , :5:  ,`,
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
      column: 20,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            begin: null,
            step: null,
            end: null,
          },
          {
            index: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
          {
            begin: null,
            step: null,
            end: null,
          },
          {
            begin: null,
            step: {
              kind: 'integerdecimalliteral',
              value: '5',
            },
            end: null,
          },
        ],
      },
    },
  },
);

lexer = new Lexer('56 ,');
parser = new Parser(lexer.lex());
result = indexArguments(parser);
test(
  String.raw`56 ,`,
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
      column: 4,
    },
    result: {
      success: true,
      ast: {
        expressions: [
          {
            index: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
        ],
      },
    },
  },
);

print('============== INDEXPOSTFIX ==============');
lexer = new Lexer('[::1, 5: :34, 56]');
parser = new Parser(lexer.lex());
result = indexPostfix(parser);
test(
  String.raw`[::1, 5: :34, 56]`,
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
      column: 17,
    },
    result: {
      success: true,
      ast: {
        kind: 'indexpostfix',
        arguments: [
          {
            begin: null,
            step: null,
            end: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
          {
            begin: {
              kind: 'integerdecimalliteral',
              value: '5',
            },
            step: null,
            end: {
              kind: 'integerdecimalliteral',
              value: '34',
            },
          },
          {
            index: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('[\n    :, 56 , : : , :5:  , \n]');
parser = new Parser(lexer.lex());
result = indexPostfix(parser);
test(
  String.raw`[\n    :, 56 , : : , :5:  , \n]`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 14,
      column: 29,
    },
    result: {
      success: true,
      ast: {
        kind: 'indexpostfix',
        arguments: [
          {
            begin: null,
            step: null,
            end: null,
          },
          {
            index: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
          {
            begin: null,
            step: null,
            end: null,
          },
          {
            begin: null,
            step: {
              kind: 'integerdecimalliteral',
              value: '5',
            },
            end: null,
          },
        ],
      },
    },
  },
);

lexer = new Lexer('[ 56 ,]');
parser = new Parser(lexer.lex());
result = indexPostfix(parser);
test(
  String.raw`[ 56 ,]`,
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
      column: 7,
    },
    result: {
      success: true,
      ast: {
        kind: 'indexpostfix',
        arguments: [
          {
            index: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
        ],
      },
    },
  },
);

print('============== EXTENDEDNOTATION ==============');
lexer = new Lexer(': [1:2]');
parser = new Parser(lexer.lex());
result = extendedNotation(parser);
test(
  String.raw`: [1:2]--------->FAIL`,
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
        kind: 'extendednotation',
        expression: null,
      },
    },
  },
);

lexer = new Lexer(':comp13x_n4m3');
parser = new Parser(lexer.lex());
result = extendedNotation(parser);
test(
  String.raw`:comp13x_n4m3`,
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
      column: 13,
    },
    result: {
      success: true,
      ast: {
        kind: 'extendednotation',
        expression: {
          kind: 'identifier',
          value: 'comp13x_n4m3',
        },
      },
    },
  },
);

lexer = new Lexer(':(name  :   2)');
parser = new Parser(lexer.lex());
result = extendedNotation(parser);
test(
  String.raw`:(name  :   2)`,
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
      column: 14,
    },
    result: {
      success: true,
      ast: {
        kind: 'extendednotation',
        expression: {
          kind: 'callpostfix',
          expression: null,
          mutative: false,
          vectorized: false,
          arguments: [
            {
              key: {
                kind: 'identifier',
                value: 'name',
              },
              value: {
                kind: 'integerdecimalliteral',
                value: '2',
              },
            },
          ],
        },
      },
    },
  },
);

lexer = new Lexer(':[:1, 5: :34, 56:]');
parser = new Parser(lexer.lex());
result = extendedNotation(parser);
test(
  String.raw`:[:1, 5: :34, 56:]`,
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
        kind: 'extendednotation',
        expression: {
          kind: 'indexpostfix',
          arguments: [
            {
              begin: null,
              step: null,
              end: {
                kind: 'integerdecimalliteral',
                value: '1',
              },
            },
            {
              begin: {
                kind: 'integerdecimalliteral',
                value: '5',
              },
              step: null,
              end: {
                kind: 'integerdecimalliteral',
                value: '34',
              },
            },
            {
              begin: {
                kind: 'integerdecimalliteral',
                value: '56',
              },
              step: null,
              end: null,
            },
          ],
        },
      },
    },
  },
);

print('============== TERNARYOPERATOR ==============');
lexer = new Lexer('(5_000)? 0b10.001 || 0x7_EFF8');
parser = new Parser(lexer.lex());
result = ternaryOperator(parser);
test(
  String.raw`(5_000)? 0b10.001 || 0x7_EFF8--------->FAIL`,
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
        kind: 'ternaryoperator',
        condition: null,
        truebody: null,
        falsebody: null,
      },
    },
  },
);

lexer = new Lexer('(5_000) ? 0b10.001 ||0x7_EFF8');
parser = new Parser(lexer.lex());
result = ternaryOperator(parser);
test(
  String.raw`(5_000)? 0b10.001 ||0x7_EFF8--------->FAIL`,
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
        kind: 'ternaryoperator',
        condition: null,
        truebody: null,
        falsebody: null,
      },
    },
  },
);

lexer = new Lexer('(5_000) ? 0b10.001 || 0x7_EFF8');
parser = new Parser(lexer.lex());
result = ternaryOperator(parser);
test(
  String.raw`(5_000) ? 0b10.001 || 0x7_EFF8`,
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
      column: 30,
    },
    result: {
      success: true,
      ast: {
        kind: 'ternaryoperator',
        condition: {
          kind: 'integerdecimalliteral',
          value: '5000',
        },
        truebody: {
          kind: 'floatbinaryliteral',
          value: '10.001',
        },
        falsebody: {
          kind: 'integerhexadecimalliteral',
          value: '7EFF8',
        },
      },
    },
  },
);

lexer = new Lexer('(  \n    5_000\n) ? 0b10.001 || 0x7_EFF8');
parser = new Parser(lexer.lex());
result = ternaryOperator(parser);
test(
  String.raw`(  \n    5_000\n) ? 0b10.001 || 0x7_EFF8`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 8,
      column: 38,
    },
    result: {
      success: true,
      ast: {
        kind: 'ternaryoperator',
        condition: {
          kind: 'integerdecimalliteral',
          value: '5000',
        },
        truebody: {
          kind: 'floatbinaryliteral',
          value: '10.001',
        },
        falsebody: {
          kind: 'integerhexadecimalliteral',
          value: '7EFF8',
        },
      },
    },
  },
);

print('============== COEFFICIENTEXPRESSION ==============');
lexer = new Lexer('0x78ff');
parser = new Parser(lexer.lex());
result = coefficientExpression(parser);
test(
  String.raw`0x78ff--------->FAIL`,
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
        kind: 'coefficientexpression',
      },
    },
  },
);

lexer = new Lexer('78.f');
parser = new Parser(lexer.lex());
result = coefficientExpression(parser);
test(
  String.raw`78.f--------->FAIL`,
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
        kind: 'coefficientexpression',
      },
    },
  },
);

lexer = new Lexer('78f');
parser = new Parser(lexer.lex());
result = coefficientExpression(parser);
test(
  String.raw`78f`,
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
      column: 3,
    },
    result: {
      success: true,
      ast: {
        kind: 'coefficientexpression',
        coefficient: {
          kind: 'integerdecimalliteral',
          value: '78',
        },
        identifier: {
          kind: 'identifier',
          value: 'f',
        },
      },
    },
  },
);

lexer = new Lexer('.78f');
parser = new Parser(lexer.lex());
result = coefficientExpression(parser);
test(
  String.raw`.78f`,
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
      column: 4,
    },
    result: {
      success: true,
      ast: {
        kind: 'coefficientexpression',
        coefficient: {
          kind: 'floatdecimalliteral',
          value: '0.78',
        },
        identifier: {
          kind: 'identifier',
          value: 'f',
        },
      },
    },
  },
);

lexer = new Lexer('0o7.77f');
parser = new Parser(lexer.lex());
result = coefficientExpression(parser);
test(
  String.raw`0o7.77f`,
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
      ast: {
        kind: 'coefficientexpression',
        coefficient: {
          kind: 'floatoctalliteral',
          value: '7.77',
        },
        identifier: {
          kind: 'identifier',
          value: 'f',
        },
      },
    },
  },
);

print('============== RETURNEXPRESSION ==============');
lexer = new Lexer('return 0xb55f');
parser = new Parser(lexer.lex());
result = returnExpression(parser);
test(
  String.raw`return 0xb55f`,
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
      column: 13,
    },
    result: {
      success: true,
      ast: {
        kind: 'returnexpression',
        expression: {
          kind: 'integerhexadecimalliteral',
          value: 'b55f',
        },
      },
    },
  },
);

lexer = new Lexer('return');
parser = new Parser(lexer.lex());
result = returnExpression(parser);
test(
  String.raw`return`,
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
      column: 6,
    },
    result: {
      success: true,
      ast: {
        kind: 'returnexpression',
        expression: null,
      },
    },
  },
);

print('============== YIELDEXPRESSION ==============');
lexer = new Lexer('yield 0xb55f');
parser = new Parser(lexer.lex());
result = yieldExpression(parser);
test(
  String.raw`yield 0xb55f`,
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
      column: 12,
    },
    result: {
      success: true,
      ast: {
        kind: 'yieldexpression',
        redirect: false,
        expression: {
          kind: 'integerhexadecimalliteral',
          value: 'b55f',
        },
      },
    },
  },
);

lexer = new Lexer('yield from 0xb55f');
parser = new Parser(lexer.lex());
result = yieldExpression(parser);
test(
  String.raw`yield from 0xb55f`,
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
      column: 17,
    },
    result: {
      success: true,
      ast: {
        kind: 'yieldexpression',
        redirect: true,
        expression: {
          kind: 'integerhexadecimalliteral',
          value: 'b55f',
        },
      },
    },
  },
);

lexer = new Lexer('yield');
parser = new Parser(lexer.lex());
result = yieldExpression(parser);
test(
  String.raw`yield`,
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
      ast: {
        kind: 'yieldexpression',
        redirect: false,
        expression: null,
      },
    },
  },
);

print('============== RAISEEXPRESSION ==============');
lexer = new Lexer('raise 0xb55f');
parser = new Parser(lexer.lex());
result = raiseExpression(parser);
test(
  String.raw`raise 0xb55f`,
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
      column: 12,
    },
    result: {
      success: true,
      ast: {
        kind: 'raiseexpression',
        expression: {
          kind: 'integerhexadecimalliteral',
          value: 'b55f',
        },
      },
    },
  },
);

lexer = new Lexer('raise');
parser = new Parser(lexer.lex());
result = raiseExpression(parser);
test(
  String.raw`raise`,
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
      ast: {
        kind: 'raiseexpression',
        expression: null,
      },
    },
  },
);

print('============== CONTINUEEEXPRESSION ==============');
lexer = new Lexer('continue @ name');
parser = new Parser(lexer.lex());
result = continueExpression(parser);
test(
  String.raw`continue @ name--------->MID`,
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
      column: 8,
    },
    result: {
      success: true,
      ast: {
        kind: 'continueexpression',
        label: null,
      },
    },
  },
);

lexer = new Lexer('continue @name');
parser = new Parser(lexer.lex());
result = continueExpression(parser);
test(
  String.raw`continue @name`,
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
      column: 14,
    },
    result: {
      success: true,
      ast: {
        kind: 'continueexpression',
        label: {
          kind: 'identifier',
          value: 'name',
        },
      },
    },
  },
);

lexer = new Lexer('continue');
parser = new Parser(lexer.lex());
result = continueExpression(parser);
test(
  String.raw`continue`,
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
      column: 8,
    },
    result: {
      success: true,
      ast: {
        kind: 'continueexpression',
        label: null,
      },
    },
  },
);

print('============== BREAKEXPRESSION ==============');
lexer = new Lexer('break @ name');
parser = new Parser(lexer.lex());
result = breakExpression(parser);
test(
  String.raw`break @ name--------->MID`,
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
      ast: {
        kind: 'breakexpression',
        label: null,
        expression: null,
      },
    },
  },
);

lexer = new Lexer('break 25 @name');
parser = new Parser(lexer.lex());
result = breakExpression(parser);
test(
  String.raw`break 25 @name`,
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
      column: 14,
    },
    result: {
      success: true,
      ast: {
        kind: 'breakexpression',
        label: {
          kind: 'identifier',
          value: 'name',
        },
        expression: {
          kind: 'integerdecimalliteral',
          value: '25',
        },
      },
    },
  },
);

lexer = new Lexer('break 25');
parser = new Parser(lexer.lex());
result = breakExpression(parser);
test(
  String.raw`break 25`,
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
      column: 8,
    },
    result: {
      success: true,
      ast: {
        kind: 'breakexpression',
        label: null,
        expression: {
          kind: 'integerdecimalliteral',
          value: '25',
        },
      },
    },
  },
);

lexer = new Lexer('break @name');
parser = new Parser(lexer.lex());
result = breakExpression(parser);
test(
  String.raw`break @name`,
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
      column: 11,
    },
    result: {
      success: true,
      ast: {
        kind: 'breakexpression',
        label: {
          kind: 'identifier',
          value: 'name',
        },
        expression: null,
      },
    },
  },
);

lexer = new Lexer('break');
parser = new Parser(lexer.lex());
result = breakExpression(parser);
test(
  String.raw`break`,
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
      ast: {
        kind: 'breakexpression',
        label: null,
        expression: null,
      },
    },
  },
);

print('============== CONTINUEEEXPRESSION ==============');
lexer = new Lexer('fallthrough @ name');
parser = new Parser(lexer.lex());
result = fallthroughExpression(parser);
test(
  String.raw`fallthrough @ name--------->MID`,
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
      column: 11,
    },
    result: {
      success: true,
      ast: {
        kind: 'fallthroughexpression',
        label: null,
      },
    },
  },
);

lexer = new Lexer('fallthrough @name');
parser = new Parser(lexer.lex());
result = fallthroughExpression(parser);
test(
  String.raw`fallthrough @name`,
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
      column: 17,
    },
    result: {
      success: true,
      ast: {
        kind: 'fallthroughexpression',
        label: {
          kind: 'identifier',
          value: 'name',
        },
      },
    },
  },
);

lexer = new Lexer('fallthrough');
parser = new Parser(lexer.lex());
result = fallthroughExpression(parser);
test(
  String.raw`fallthrough`,
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
      column: 11,
    },
    result: {
      success: true,
      ast: {
        kind: 'fallthroughexpression',
        label: null,
      },
    },
  },
);

print('============== CONTROLPRIMITIVE ==============');
lexer = new Lexer('fallthrough @ name');
parser = new Parser(lexer.lex());
result = controlPrimitive(parser);
test(
  String.raw`fallthrough @ name--------->MID`,
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
      column: 11,
    },
    result: {
      success: true,
      ast: {
        kind: 'fallthroughexpression',
        label: null,
      },
    },
  },
);

lexer = new Lexer('break 25 @name');
parser = new Parser(lexer.lex());
result = controlPrimitive(parser);
test(
  String.raw`break 25 @name`,
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
      column: 14,
    },
    result: {
      success: true,
      ast: {
        kind: 'breakexpression',
        label: {
          kind: 'identifier',
          value: 'name',
        },
        expression: {
          kind: 'integerdecimalliteral',
          value: '25',
        },
      },
    },
  },
);

lexer = new Lexer('continue @name');
parser = new Parser(lexer.lex());
result = controlPrimitive(parser);
test(
  String.raw`continue @name`,
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
      column: 14,
    },
    result: {
      success: true,
      ast: {
        kind: 'continueexpression',
        label: {
          kind: 'identifier',
          value: 'name',
        },
      },
    },
  },
);

lexer = new Lexer('yield from 0xb55f');
parser = new Parser(lexer.lex());
result = controlPrimitive(parser);
test(
  String.raw`yield from 0xb55f`,
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
      column: 17,
    },
    result: {
      success: true,
      ast: {
        kind: 'yieldexpression',
        redirect: true,
        expression: {
          kind: 'integerhexadecimalliteral',
          value: 'b55f',
        },
      },
    },
  },
);

print('============== SUBATOMPOSTFIX ==============');
lexer = new Lexer('[\n    :, 56 , : : , :5:  , \n]');
parser = new Parser(lexer.lex());
result = subAtomPostfix(parser);
test(
  String.raw`[\n    :, 56 , : : , :5:  , \n]`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 14,
      column: 29,
    },
    result: {
      success: true,
      ast: {
        kind: 'indexpostfix',
        arguments: [
          {
            begin: null,
            step: null,
            end: null,
          },
          {
            index: {
              kind: 'integerdecimalliteral',
              value: '56',
            },
          },
          {
            begin: null,
            step: null,
            end: null,
          },
          {
            begin: null,
            step: {
              kind: 'integerdecimalliteral',
              value: '5',
            },
            end: null,
          },
        ],
      },
    },
  },
);

lexer = new Lexer('.name');
parser = new Parser(lexer.lex());
result = subAtomPostfix(parser);
test(
  String.raw`.name`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: {
        kind: 'dotnotationpostfix',
        expression: null,
        name: {
          kind: 'identifier',
          value: 'name',
        },
      },
    },
  },
);

lexer = new Lexer('.(a: 0x5.5, )');
parser = new Parser(lexer.lex());
result = subAtomPostfix(parser);
test(
  String.raw`.(a: 0x5.5, )`,
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
      column: 13,
    },
    result: {
      success: true,
      ast: {
        kind: 'callpostfix',
        expression: null,
        mutative: false,
        vectorized: true,
        arguments: [
          {
            key: {
              kind: 'identifier',
              value: 'a',
            },
            value: {
              kind: 'floathexadecimalliteral',
              value: '5.5',
            },
          },
        ],
      },
    },
  },
);


test();

module.exports = test;
