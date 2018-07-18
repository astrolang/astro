/* eslint-disable no-template-curly-in-string */
const Lexer = require('./lexer');
const {
  Parser,
  prefixAtom,
  postfixAtom,
  prePostfixAtom,
  // infixExpression,
} = require('./parser');
const { print, createTest } = require('../../utils');

let lexer = null;
let parser = null;
let result = null;
const test = createTest();

print('============== PREFIXATOM ==============');
lexer = new Lexer('*+ 5_200');
parser = new Parser(lexer.lex());
result = prefixAtom(parser);
test(
  String.raw`*+ 5_200`,
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
        kind: 'prefixatom',
        vectorized: false,
        operator: null,
        expression: null,
      },
    },
  },
);

lexer = new Lexer('*+5_200');
parser = new Parser(lexer.lex());
result = prefixAtom(parser);
test(
  String.raw`*+5_200`,
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
        kind: 'prefixatom',
        vectorized: false,
        operator: {
          kind: 'operator',
          value: '*+',
        },
        expression: {
          kind: 'integerdecimalliteral',
          value: '5200',
        },
      },
    },
  },
);

print('============== POSTFIXATOM ==============');
lexer = new Lexer('5_200 *+');
parser = new Parser(lexer.lex());
result = postfixAtom(parser);
test(
  String.raw`5_200 *+`,
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
        kind: 'postfixatom',
        vectorized: false,
        operator: null,
        expression: null,
      },
    },
  },
);

lexer = new Lexer('5_200+*');
parser = new Parser(lexer.lex());
result = postfixAtom(parser);
test(
  String.raw`5_200+*`,
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
        kind: 'postfixatom',
        vectorized: false,
        operator: {
          kind: 'operator',
          value: '+*',
        },
        expression: {
          kind: 'integerdecimalliteral',
          value: '5200',
        },
      },
    },
  },
);

lexer = new Lexer('[1, 2].+*');
parser = new Parser(lexer.lex());
result = postfixAtom(parser);
test(
  String.raw`[1, 2].+*`,
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
      column: 9,
    },
    result: {
      success: true,
      ast: {
        kind: 'postfixatom',
        vectorized: true,
        operator: {
          kind: 'operator',
          value: '+*',
        },
        expression: {
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
      },
    },
  },
);

print('============== PREPOSTFIXATOM ==============');
lexer = new Lexer('-=5_200');
parser = new Parser(lexer.lex());
result = prePostfixAtom(parser);
test(
  String.raw`-=5_200`,
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
        kind: 'prefixatom',
        vectorized: false,
        operator: {
          kind: 'operator',
          value: '-=',
        },
        expression: {
          kind: 'integerdecimalliteral',
          value: '5200',
        },
      },
    },
  },
);

lexer = new Lexer('[1, 2].+*');
parser = new Parser(lexer.lex());
result = prePostfixAtom(parser);
test(
  String.raw`[1, 2].+*`,
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
      column: 9,
    },
    result: {
      success: true,
      ast: {
        kind: 'postfixatom',
        vectorized: true,
        operator: {
          kind: 'operator',
          value: '+*',
        },
        expression: {
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
      },
    },
  },
);

test();

module.exports = test;
