/* eslint-disable no-template-curly-in-string */
const Lexer = require('./lexer');
const {
  Parser,
  prefixAtom,
  postfixAtom,
  prePostfixAtom,
  keywordOperator,
  infixExpression,
  spreadExpression,
  range,
  commandNotationArgument,
  commandNotation,
  primitiveExpression,
  simpleExpression,
  tupleExpression,
  dotNotationLine,
  dotNotationBlock,
  subExpression,
  expression,
  subExpressionNoBlock,
  expressionNoBlock,
  subExpressionSecondInline,
  expressionSecondInline,
} = require('./parser');
const { print, createTest } = require('../../utils');

let lexer = null;
let parser = null;
let result = null;
const test = createTest();

print('============== PREFIXATOM ==============');
lexer = new Lexer('*+ 5_200');
parser = new Parser(lexer.lex().tokens);
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
parser = new Parser(lexer.lex().tokens);
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
parser = new Parser(lexer.lex().tokens);
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
parser = new Parser(lexer.lex().tokens);
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
parser = new Parser(lexer.lex().tokens);
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
parser = new Parser(lexer.lex().tokens);
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
parser = new Parser(lexer.lex().tokens);
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

lexer = new Lexer('[1, 2]');
parser = new Parser(lexer.lex().tokens);
result = prePostfixAtom(parser);
test(
  String.raw`[1, 2]`,
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
);

print('============== KEYWORDOPERATOR ==============');
lexer = new Lexer('isnot');
parser = new Parser(lexer.lex().tokens);
result = keywordOperator(parser);
test(
  String.raw`isnot--------->FAIL`,
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
        kind: 'keywordoperator',
        value: null,
      },
    },
  },
);

lexer = new Lexer('not in');
parser = new Parser(lexer.lex().tokens);
result = keywordOperator(parser);
test(
  String.raw`not in`,
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
      column: 6,
    },
    result: {
      success: true,
      ast: {
        kind: 'keywordoperator',
        value: 'notin',
      },
    },
  },
);

lexer = new Lexer('is not');
parser = new Parser(lexer.lex().tokens);
result = keywordOperator(parser);
test(
  String.raw`is not`,
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
      column: 6,
    },
    result: {
      success: true,
      ast: {
        kind: 'keywordoperator',
        value: 'isnot',
      },
    },
  },
);

lexer = new Lexer('mod');
parser = new Parser(lexer.lex().tokens);
result = keywordOperator(parser);
test(
  String.raw`mod`,
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
      column: 3,
    },
    result: {
      success: true,
      ast: {
        kind: 'keywordoperator',
        value: 'mod',
      },
    },
  },
);


print('============== INFIXEXPRESSION ==============');
lexer = new Lexer('1.+ 2');
parser = new Parser(lexer.lex().tokens);
result = infixExpression(parser);
test(
  String.raw`1.+ 2--------->FAIL`,
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
        kind: 'infixexpression',
        expressions: [],
        operators: [],
      },
    },
  },
);

lexer = new Lexer('1in2');
parser = new Parser(lexer.lex().tokens);
result = infixExpression(parser);
test(
  String.raw`1in2--------->FAIL`,
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
        kind: 'infixexpression',
        expressions: [],
        operators: [],
      },
    },
  },
);

lexer = new Lexer('1+2+ 3');
parser = new Parser(lexer.lex().tokens);
result = infixExpression(parser);
test(
  String.raw`1+2+ 3--------->MID`,
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
      column: 4,
    },
    result: {
      success: true,
      ast: {
        kind: 'infixexpression',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '1',
          },
          {
            kind: 'postfixatom',
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
            expression: {
              kind: 'integerdecimalliteral',
              value: '2',
            },
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

lexer = new Lexer('1+2 +3');
parser = new Parser(lexer.lex().tokens);
result = infixExpression(parser);
test(
  String.raw`1+2 +3--------->MID`,
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
      column: 3,
    },
    result: {
      success: true,
      ast: {
        kind: 'infixexpression',
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


lexer = new Lexer('1 - d+ in b');
parser = new Parser(lexer.lex().tokens);
result = infixExpression(parser);
test(
  String.raw`1 - d+ in b`,
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
      column: 11,
    },
    result: {
      success: true,
      ast: {
        kind: 'infixexpression',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '1',
          },
          {
            kind: 'postfixatom',
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
            expression: {
              kind: 'identifier',
              value: 'd',
            },
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
              value: '-',
            },
          },
          {
            vectorized: false,
            operator: {
              kind: 'keywordoperator',
              value: 'in',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('+1 - d*');
parser = new Parser(lexer.lex().tokens);
result = infixExpression(parser);
test(
  String.raw`+1 - d*`,
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
      ast: {
        kind: 'infixexpression',
        expressions: [
          {
            kind: 'prefixatom',
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
            expression: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
          },
          {
            kind: 'postfixatom',
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '*',
            },
            expression: {
              kind: 'identifier',
              value: 'd',
            },
          },
        ],
        operators: [
          {
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '-',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('1 mod +2');
parser = new Parser(lexer.lex().tokens);
result = infixExpression(parser);
test(
  String.raw`1 mod +2`,
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
      column: 8,
    },
    result: {
      success: true,
      ast: {
        kind: 'infixexpression',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '1',
          },
          {
            kind: 'prefixatom',
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '+',
            },
            expression: {
              kind: 'integerdecimalliteral',
              value: '2',
            },
          },
        ],
        operators: [
          {
            vectorized: false,
            operator: {
              kind: 'keywordoperator',
              value: 'mod',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('1 .+ 2');
parser = new Parser(lexer.lex().tokens);
result = infixExpression(parser);
test(
  String.raw`1 .+ 2`,
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
      column: 6,
    },
    result: {
      success: true,
      ast: {
        kind: 'infixexpression',
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
        operators: [
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

lexer = new Lexer('a .+ b.+c');
parser = new Parser(lexer.lex().tokens);
result = infixExpression(parser);
test(
  String.raw`a .+ b.+c`,
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
        kind: 'infixexpression',
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
            vectorized: true,
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

lexer = new Lexer('a+b + 3');
parser = new Parser(lexer.lex().tokens);
result = infixExpression(parser);
test(
  String.raw`a+b + 3`,
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
      ast: {
        kind: 'infixexpression',
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
            kind: 'integerdecimalliteral',
            value: '3',
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

print('============== SPREADEXPRESSION ==============');
lexer = new Lexer('... name');
parser = new Parser(lexer.lex().tokens);
result = spreadExpression(parser);
test(
  String.raw`... name--------->FAIL`,
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
        kind: 'spreadexpression',
        expression: null,
      },
    },
  },
);

lexer = new Lexer('...name');
parser = new Parser(lexer.lex().tokens);
result = spreadExpression(parser);
test(
  String.raw`...name`,
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
        kind: 'spreadexpression',
        expression: {
          kind: 'identifier',
          value: 'name',
        },
      },
    },
  },
);

lexer = new Lexer('...(1)');
parser = new Parser(lexer.lex().tokens);
result = spreadExpression(parser);
test(
  String.raw`...(1)`,
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
      column: 6,
    },
    result: {
      success: true,
      ast: {
        kind: 'spreadexpression',
        expression: {
          kind: 'integerdecimalliteral',
          value: '1',
        },
      },
    },
  },
);

print('============== RANGE ==============');
lexer = new Lexer('1.. 10');
parser = new Parser(lexer.lex().tokens);
result = range(parser);
test(
  String.raw`1.. 10--------->FAIL`,
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
        kind: 'range',
        begin: null,
        step: null,
        end: null,
      },
    },
  },
);

lexer = new Lexer('12..name..(2)');
parser = new Parser(lexer.lex().tokens);
result = range(parser);
test(
  String.raw`12..name..(2)`,
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
      column: 13,
    },
    result: {
      success: true,
      ast: {
        kind: 'range',
        begin: {
          kind: 'integerdecimalliteral',
          value: '12',
        },
        step: {
          kind: 'identifier',
          value: 'name',
        },
        end: {
          kind: 'integerdecimalliteral',
          value: '2',
        },
      },
    },
  },
);

lexer = new Lexer('12..5_000');
parser = new Parser(lexer.lex().tokens);
result = range(parser);
test(
  String.raw`12..5_000`,
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
      column: 9,
    },
    result: {
      success: true,
      ast: {
        kind: 'range',
        begin: {
          kind: 'integerdecimalliteral',
          value: '12',
        },
        step: null,
        end: {
          kind: 'integerdecimalliteral',
          value: '5000',
        },
      },
    },
  },
);

lexer = new Lexer('a..name');
parser = new Parser(lexer.lex().tokens);
result = range(parser);
test(
  String.raw`a..name`,
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
        kind: 'range',
        begin: {
          kind: 'identifier',
          value: 'a',
        },
        step: null,
        end: {
          kind: 'identifier',
          value: 'name',
        },
      },
    },
  },
);

lexer = new Lexer('20 .. 50..1');
parser = new Parser(lexer.lex().tokens);
result = range(parser);
test(
  String.raw`20 .. 50..1`,
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
      column: 11,
    },
    result: {
      success: true,
      ast: {
        kind: 'range',
        begin: {
          kind: 'integerdecimalliteral',
          value: '20',
        },
        step: {
          kind: 'integerdecimalliteral',
          value: '50',
        },
        end: {
          kind: 'integerdecimalliteral',
          value: '1',
        },
      },
    },
  },
);

lexer = new Lexer('1 .. -2 .. 55');
parser = new Parser(lexer.lex().tokens);
result = range(parser);
test(
  String.raw`1 .. -2 .. 55`,
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
      column: 13,
    },
    result: {
      success: true,
      ast: {
        kind: 'range',
        begin: {
          kind: 'integerdecimalliteral',
          value: '1',
        },
        step: {
          kind: 'prefixatom',
          vectorized: false,
          operator: {
            kind: 'operator',
            value: '-',
          },
          expression: {
            kind: 'integerdecimalliteral',
            value: '2',
          },
        },
        end: {
          kind: 'integerdecimalliteral',
          value: '55',
        },
      },
    },
  },
);

print('============== COMMANDNOTATIONARGUMENT ==============');
lexer = new Lexer(' [1, 2]');
parser = new Parser(lexer.lex().tokens);
result = commandNotationArgument(parser);
test(
  String.raw` [1, 2]--------->FAIL`,
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
        kind: 'commandnotationargument',
        argument: null,
      },
    },
  },
);

lexer = new Lexer('2_000');
parser = new Parser(lexer.lex().tokens);
result = commandNotationArgument(parser);
test(
  String.raw`2_000--------->FAIL`,
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
        kind: 'commandnotationargument',
        argument: null,
      },
    },
  },
);

lexer = new Lexer(' 2_000');
parser = new Parser(lexer.lex().tokens);
result = commandNotationArgument(parser);
test(
  String.raw` 2_000`,
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
        kind: 'commandnotationargument',
        argument: {
          kind: 'integerdecimalliteral',
          value: '2000',
        },
      },
    },
  },
);

lexer = new Lexer(' /hello/.meta');
parser = new Parser(lexer.lex().tokens);
result = commandNotationArgument(parser);
test(
  String.raw` /hello/.meta`,
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
      column: 13,
    },
    result: {
      success: true,
      ast: {
        kind: 'commandnotationargument',
        argument: {
          kind: 'dot',
          expression: {
            kind: 'regexliteral',
            value: 'hello',
          },
          name: {
            kind: 'identifier',
            value: 'meta',
          },
        },
      },
    },
  },
);

lexer = new Lexer(' ${ 2 }.meta');
parser = new Parser(lexer.lex().tokens);
result = commandNotationArgument(parser);
test(
  ' ${ 2 }.meta',
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
      column: 12,
    },
    result: {
      success: true,
      ast: {
        kind: 'commandnotationargument',
        argument: {
          kind: 'dot',
          expression: {
            kind: 'symbolliteral',
            expression: {
              kind: 'integerdecimalliteral',
              value: '2',
            },
          },
          name: {
            kind: 'identifier',
            value: 'meta',
          },
        },
      },
    },
  },
);

print('============== COMMANDNOTATION ==============');
lexer = new Lexer('foo /  hello/.bar()');
parser = new Parser(lexer.lex().tokens);
result = commandNotation(parser);
test(
  String.raw`foo /  hello/.bar()`,
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
      column: 19,
    },
    result: {
      success: true,
      ast: {
        kind: 'call',
        expression: {
          kind: 'identifier',
          value: 'foo',
        },
        mutative: false,
        vectorized: false,
        arguments: [
          {
            key: null,
            value: {
              kind: 'call',
              expression: {
                kind: 'dot',
                expression: {
                  kind: 'regexliteral',
                  value: '  hello',
                },
                name: {
                  kind: 'identifier',
                  value: 'bar',
                },
              },
              mutative: false,
              vectorized: false,
              arguments: [],
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('$id! 0b1001.01.bar()');
parser = new Parser(lexer.lex().tokens);
result = commandNotation(parser);
test(
  String.raw`$id! 0b1001.01.bar()`,
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
      column: 20,
    },
    result: {
      success: true,
      ast: {
        kind: 'call',
        expression: {
          kind: 'symbolliteral',
          expression: {
            kind: 'identifier',
            value: 'id',
          },
        },
        mutative: true,
        vectorized: false,
        arguments: [
          {
            key: null,
            value: {
              kind: 'call',
              expression: {
                kind: 'dot',
                expression: {
                  kind: 'floatbinaryliteral',
                  value: '1001.01',
                },
                name: {
                  kind: 'identifier',
                  value: 'bar',
                },
              },
              mutative: false,
              vectorized: false,
              arguments: [],
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('foo! x + 0x55');
parser = new Parser(lexer.lex().tokens);
result = commandNotation(parser);
test(
  String.raw`foo! x + y`,
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
      column: 13,
    },
    result: {
      success: true,
      ast: {
        kind: 'call',
        expression: {
          kind: 'identifier',
          value: 'foo',
        },
        mutative: true,
        vectorized: false,
        arguments: [
          {
            key: null,
            value: {
              kind: 'infixexpression',
              expressions: [
                {
                  kind: 'identifier',
                  value: 'x',
                },
                {
                  kind: 'integerhexadecimalliteral',
                  value: '55',
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
        ],
      },
    },
  },
);

print('============== PRIMITIVEEXPRESSION ==============');
lexer = new Lexer('...0xFFEEFF.FFp-3');
parser = new Parser(lexer.lex().tokens);
result = primitiveExpression(parser);
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
      tokenPosition: 3,
      column: 17,
    },
    result: {
      success: true,
      ast: {
        kind: 'spreadexpression',
        expression: {
          kind: 'floathexadecimalliteral',
          value: 'FFEEFF.FFp-3',
        },
      },
    },
  },
);

lexer = new Lexer('1 .. -2 .. 55');
parser = new Parser(lexer.lex().tokens);
result = primitiveExpression(parser);
test(
  String.raw`1 .. -2 .. 55`,
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
      column: 13,
    },
    result: {
      success: true,
      ast: {
        kind: 'range',
        begin: {
          kind: 'integerdecimalliteral',
          value: '1',
        },
        step: {
          kind: 'prefixatom',
          vectorized: false,
          operator: {
            kind: 'operator',
            value: '-',
          },
          expression: {
            kind: 'integerdecimalliteral',
            value: '2',
          },
        },
        end: {
          kind: 'integerdecimalliteral',
          value: '55',
        },
      },
    },
  },
);


lexer = new Lexer('500 / 2');
parser = new Parser(lexer.lex().tokens);
result = primitiveExpression(parser);
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
      tokenPosition: 2,
      column: 7,
    },
    result: {
      success: true,
      ast: {
        kind: 'infixexpression',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '500',
          },
          {
            kind: 'integerdecimalliteral',
            value: '2',
          },
        ],
        operators: [
          {
            vectorized: false,
            operator: {
              kind: 'operator',
              value: '/',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('foo! bar');
parser = new Parser(lexer.lex().tokens);
result = primitiveExpression(parser);
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
      tokenPosition: 2,
      column: 8,
    },
    result: {
      success: true,
      ast: {
        kind: 'call',
        expression: {
          kind: 'identifier',
          value: 'foo',
        },
        mutative: true,
        vectorized: false,
        arguments: [
          {
            key: null,
            value: {
              kind: 'identifier',
              value: 'bar',
            },
          },
        ],
      },
    },
  },
);

print('============== SIMPLEEXPRESSION ==============');
lexer = new Lexer('...0xFFEEFF.FFp-3');
parser = new Parser(lexer.lex().tokens);
result = simpleExpression(parser);
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
      tokenPosition: 3,
      column: 17,
    },
    result: {
      success: true,
      ast: {
        kind: 'spreadexpression',
        expression: {
          kind: 'floathexadecimalliteral',
          value: 'FFEEFF.FFp-3',
        },
      },
    },
  },
);

lexer = new Lexer('(2) ? 4 || 7');
parser = new Parser(lexer.lex().tokens);
result = simpleExpression(parser);
test(
  String.raw`(2) ? 4 || 7`,
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
      column: 12,
    },
    result: {
      success: true,
      ast: {
        kind: 'ternaryoperator',
        condition: {
          kind: 'integerdecimalliteral',
          value: '2',
        },
        truebody: {
          kind: 'integerdecimalliteral',
          value: '4',
        },
        falsebody: {
          kind: 'integerdecimalliteral',
          value: '7',
        },
      },
    },
  },
);

print('============== TUPLEEXPRESSION ==============');
lexer = new Lexer('1 + 2,');
parser = new Parser(lexer.lex().tokens);
result = tupleExpression(parser);
test(
  String.raw`1 + 2,--------->MID`,
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
        kind: 'infixexpression',
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

lexer = new Lexer('1 + 2, \n(2) ? 4 || 5_000');
parser = new Parser(lexer.lex().tokens);
result = tupleExpression(parser);
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
      tokenPosition: 11,
      column: 24,
    },
    result: {
      success: true,
      ast: {
        kind: 'tupleexpression',
        expressions: [
          {
            kind: 'infixexpression',
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
          {
            kind: 'ternaryoperator',
            condition: {
              kind: 'integerdecimalliteral',
              value: '2',
            },
            truebody: {
              kind: 'integerdecimalliteral',
              value: '4',
            },
            falsebody: {
              kind: 'integerdecimalliteral',
              value: '5000',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('1..2, ...3');
parser = new Parser(lexer.lex().tokens);
result = tupleExpression(parser);
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
      tokenPosition: 8,
      column: 10,
    },
    result: {
      success: true,
      ast: {
        kind: 'tupleexpression',
        expressions: [
          {
            kind: 'range',
            begin: {
              kind: 'integerdecimalliteral',
              value: '1',
            },
            step: null,
            end: {
              kind: 'integerdecimalliteral',
              value: '2',
            },
          },
          {
            kind: 'spreadexpression',
            expression: {
              kind: 'integerdecimalliteral',
              value: '3',
            },
          },
        ],
      },
    },
  },
);

lexer = new Lexer('0o711');
parser = new Parser(lexer.lex().tokens);
result = tupleExpression(parser);
test(
  String.raw`0o711`,
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
        kind: 'integeroctalliteral',
        value: '711',
      },
    },
  },
);

print('============== DOTNOTATIONLINE ==============');
lexer = new Lexer('.age()');
parser = new Parser(lexer.lex().tokens);
result = dotNotationLine(parser);
test(
  String.raw`.age()`,
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
      column: 6,
    },
    result: {
      success: true,
      ast: {
        postfixes: [
          {
            kind: 'dot',
            expression: null,
            name: {
              kind: 'identifier',
              value: 'age',
            },
          },
          {
            kind: 'call',
            expression: null,
            mutative: false,
            vectorized: false,
            arguments: [],
          },
        ],
      },
    },
  },
);

lexer = new Lexer('.age()[1:2]');
parser = new Parser(lexer.lex().tokens);
result = dotNotationLine(parser);
test(
  String.raw`.age()[1:2]`,
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
      column: 11,
    },
    result: {
      success: true,
      ast: {
        postfixes: [
          {
            kind: 'dot',
            expression: null,
            name: {
              kind: 'identifier',
              value: 'age',
            },
          },
          {
            kind: 'call',
            expression: null,
            mutative: false,
            vectorized: false,
            arguments: [],
          },
          {
            kind: 'index',
            arguments: [
              {
                begin: {
                  kind: 'integerdecimalliteral',
                  value: '1',
                },
                step: null,
                end: {
                  kind: 'integerdecimalliteral',
                  value: '2',
                },
              },
            ],
          },
        ],
      },
    },
  },
);

print('============== DOTNOTATIONBLOCK ==============');
lexer = new Lexer('[1]\n    .name.{ a + b }\n    .end');
parser = new Parser(lexer.lex().tokens);
result = dotNotationBlock(parser);
test(
  String.raw`[1]\n    .name.{ a + b }\n    .end--------->FAIL`,
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
        kind: 'dotnotationblock',
      },
    },
  },
);

lexer = new Lexer('[1]\n    .name.{ a + b }\n.end');
parser = new Parser(lexer.lex().tokens);
result = dotNotationBlock(parser);
test(
  String.raw`[1]\n    .name.{ a + b }\n.end`,
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
        kind: 'cascade',
        leftExpression: {
          kind: 'dot',
          expression: {
            kind: 'listliteral',
            transposed: false,
            expressions: [
              {
                kind: 'integerdecimalliteral',
                value: '1',
              },
            ],
          },
          name: {
            kind: 'identifier',
            value: 'name',
          },
        },
        rightExpression: null,
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

lexer = new Lexer('[1]\n    .name()\n    .age.{ a + b }\n');
parser = new Parser(lexer.lex().tokens);
result = dotNotationBlock(parser);
test(
  String.raw`[1]\n    .name()\n    .age.{ a + b }\n`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 17,
      column: 35,
    },
    result: {
      success: true,
      ast: {
        kind: 'cascade',
        leftExpression: {
          kind: 'dot',
          expression: {
            kind: 'call',
            expression: {
              kind: 'dot',
              expression: {
                kind: 'listliteral',
                transposed: false,
                expressions: [
                  {
                    kind: 'integerdecimalliteral',
                    value: '1',
                  },
                ],
              },
              name: {
                kind: 'identifier',
                value: 'name',
              },
            },
            mutative: false,
            vectorized: false,
            arguments: [],
          },
          name: {
            kind: 'identifier',
            value: 'age',
          },
        },
        rightExpression: null,
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

print('============== SUBEXPRESSION ==============');
lexer = new Lexer('[1]\n    .name(2).{ a + b }');
parser = new Parser(lexer.lex().tokens);
result = subExpression(parser);
test(
  String.raw`[1]\n    .name(2).{ a + b }`,
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
      column: 26,
    },
    result: {
      success: true,
      ast: {
        kind: 'cascade',
        leftExpression: {
          kind: 'call',
          expression: {
            kind: 'dot',
            expression: {
              kind: 'listliteral',
              transposed: false,
              expressions: [
                {
                  kind: 'integerdecimalliteral',
                  value: '1',
                },
              ],
            },
            name: {
              kind: 'identifier',
              value: 'name',
            },
          },
          mutative: false,
          vectorized: false,
          arguments: [
            {
              key: null,
              value: {
                kind: 'integerdecimalliteral',
                value: '2',
              },
            },
          ],
        },
        rightExpression: null,
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

lexer = new Lexer('return 45_000');
parser = new Parser(lexer.lex().tokens);
result = subExpression(parser);
test(
  String.raw`return 45_000`,
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
          kind: 'integerdecimalliteral',
          value: '45000',
        },
      },
    },
  },
);

lexer = new Lexer('5, [3, 1]');
parser = new Parser(lexer.lex().tokens);
result = subExpression(parser);
test(
  String.raw`5, [3, 1]`,
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
        kind: 'tupleexpression',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '5',
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
                value: '1',
              },
            ],
          },
        ],
      },
    },
  },
);

lexer = new Lexer('0o711');
parser = new Parser(lexer.lex().tokens);
result = subExpression(parser);
test(
  String.raw`0o711`,
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
        kind: 'integeroctalliteral',
        value: '711',
      },
    },
  },
);

print('============== EXPRESSION ==============');
lexer = new Lexer('[1].name(2).{ a + b } ; 500 ;');
parser = new Parser(lexer.lex().tokens);
result = expression(parser);
test(
  String.raw`[1].name(2).{ a + b } ; 500 ;`,
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
      column: 29,
    },
    result: {
      success: true,
      ast: {
        kind: 'expression',
        expressions: [
          {
            kind: 'cascade',
            leftExpression: {
              kind: 'call',
              expression: {
                kind: 'dot',
                expression: {
                  kind: 'listliteral',
                  transposed: false,
                  expressions: [
                    {
                      kind: 'integerdecimalliteral',
                      value: '1',
                    },
                  ],
                },
                name: {
                  kind: 'identifier',
                  value: 'name',
                },
              },
              mutative: false,
              vectorized: false,
              arguments: [
                {
                  key: null,
                  value: {
                    kind: 'integerdecimalliteral',
                    value: '2',
                  },
                },
              ],
            },
            rightExpression: null,
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
          {
            kind: 'integerdecimalliteral',
            value: '500',
          },
        ],
      },
    },
  },
);

lexer = new Lexer('return 45_000; break 200 @name ; fallthrough');
parser = new Parser(lexer.lex().tokens);
result = expression(parser);
test(
  String.raw`return 45_000; break 200 @name ; fallthrough`,
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
      column: 44,
    },
    result: {
      success: true,
      ast: {
        kind: 'expression',
        expressions: [
          {
            kind: 'returnexpression',
            expression: {
              kind: 'integerdecimalliteral',
              value: '45000',
            },
          },
          {
            kind: 'breakexpression',
            label: {
              kind: 'identifier',
              value: 'name',
            },
            expression: {
              kind: 'integerdecimalliteral',
              value: '200',
            },
          },
          {
            kind: 'fallthroughexpression',
            label: null,
          },
        ],
      },
    },
  },
);

lexer = new Lexer('return 45_000\nbreak 200; 567\nfallthrough');
parser = new Parser(lexer.lex().tokens);
result = expression(parser);
test(
  String.raw`return 45_000\nbreak 200; 567\nfallthrough`,
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
      column: 40,
    },
    result: {
      success: true,
      ast: {
        kind: 'expression',
        expressions: [
          {
            kind: 'returnexpression',
            expression: {
              kind: 'integerdecimalliteral',
              value: '45000',
            },
          },
          {
            kind: 'breakexpression',
            label: null,
            expression: {
              kind: 'integerdecimalliteral',
              value: '200',
            },
          },
          {
            kind: 'integerdecimalliteral',
            value: '567',
          },
          {
            kind: 'fallthroughexpression',
            label: null,
          },
        ],
      },
    },
  },
);

print('============== SUBEXPRESSIONNOBLOCK ==============');
lexer = new Lexer('[1]\n    .name(2).{ a + b }');
parser = new Parser(lexer.lex().tokens);
result = subExpressionNoBlock(parser);
test(
  String.raw`[1]\n    .name(2).{ a + b }--------->FAIL`,
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
      column: 3,
    },
    result: {
      success: true,
      ast: {
        kind: 'listliteral',
        transposed: false,
        expressions: [{ kind: 'integerdecimalliteral', value: '1' }],
      },
    },
  },
);

lexer = new Lexer('5, [3, 1]');
parser = new Parser(lexer.lex().tokens);
result = subExpressionNoBlock(parser);
test(
  String.raw`5, [3, 1]`,
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
        kind: 'tupleexpression',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '5',
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
                value: '1',
              },
            ],
          },
        ],
      },
    },
  },
);

lexer = new Lexer('0o711');
parser = new Parser(lexer.lex().tokens);
result = subExpressionNoBlock(parser);
test(
  String.raw`0o711`,
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
        kind: 'integeroctalliteral',
        value: '711',
      },
    },
  },
);

print('============== EXPRESSIONNOBLOCK ==============');
lexer = new Lexer('[1].name(2).{ a + b } ; 500 ;');
parser = new Parser(lexer.lex().tokens);
result = expressionNoBlock(parser);
test(
  String.raw`[1].name(2).{ a + b } ; 500 ;`,
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
      column: 29,
    },
    result: {
      success: true,
      ast: {
        kind: 'expression',
        expressions: [
          {
            kind: 'cascade',
            leftExpression: {
              kind: 'call',
              expression: {
                kind: 'dot',
                expression: {
                  kind: 'listliteral',
                  transposed: false,
                  expressions: [
                    {
                      kind: 'integerdecimalliteral',
                      value: '1',
                    },
                  ],
                },
                name: {
                  kind: 'identifier',
                  value: 'name',
                },
              },
              mutative: false,
              vectorized: false,
              arguments: [
                {
                  key: null,
                  value: {
                    kind: 'integerdecimalliteral',
                    value: '2',
                  },
                },
              ],
            },
            rightExpression: null,
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
          {
            kind: 'integerdecimalliteral',
            value: '500',
          },
        ],
      },
    },
  },
);

lexer = new Lexer('return 45_000; break 200 @name ; fallthrough');
parser = new Parser(lexer.lex().tokens);
result = expressionNoBlock(parser);
test(
  String.raw`return 45_000; break 200 @name ; fallthrough`,
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
      column: 44,
    },
    result: {
      success: true,
      ast: {
        kind: 'expression',
        expressions: [
          {
            kind: 'returnexpression',
            expression: {
              kind: 'integerdecimalliteral',
              value: '45000',
            },
          },
          {
            kind: 'breakexpression',
            label: {
              kind: 'identifier',
              value: 'name',
            },
            expression: {
              kind: 'integerdecimalliteral',
              value: '200',
            },
          },
          {
            kind: 'fallthroughexpression',
            label: null,
          },
        ],
      },
    },
  },
);

lexer = new Lexer('return 45_000\nbreak 200; 567\nfallthrough');
parser = new Parser(lexer.lex().tokens);
result = expressionNoBlock(parser);
test(
  String.raw`return 45_000\nbreak 200; 567\nfallthrough`,
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
      column: 40,
    },
    result: {
      success: true,
      ast: {
        kind: 'expression',
        expressions: [
          {
            kind: 'returnexpression',
            expression: {
              kind: 'integerdecimalliteral',
              value: '45000',
            },
          },
          {
            kind: 'breakexpression',
            label: null,
            expression: {
              kind: 'integerdecimalliteral',
              value: '200',
            },
          },
          {
            kind: 'integerdecimalliteral',
            value: '567',
          },
          {
            kind: 'fallthroughexpression',
            label: null,
          },
        ],
      },
    },
  },
);

print('============== SUBEXPRESSIONSECONDINLINE ==============');
lexer = new Lexer('[1]\n    .name(2).{ a + b }');
parser = new Parser(lexer.lex().tokens);
result = subExpressionSecondInline(parser);
test(
  String.raw`[1]\n    .name(2).{ a + b }`,
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
      column: 26,
    },
    result: {
      success: true,
      ast: {
        kind: 'cascade',
        leftExpression: {
          kind: 'call',
          expression: {
            kind: 'dot',
            expression: {
              kind: 'listliteral',
              transposed: false,
              expressions: [
                {
                  kind: 'integerdecimalliteral',
                  value: '1',
                },
              ],
            },
            name: {
              kind: 'identifier',
              value: 'name',
            },
          },
          mutative: false,
          vectorized: false,
          arguments: [
            {
              key: null,
              value: {
                kind: 'integerdecimalliteral',
                value: '2',
              },
            },
          ],
        },
        rightExpression: null,
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

lexer = new Lexer('5, [3, 1]');
parser = new Parser(lexer.lex().tokens);
result = subExpressionSecondInline(parser);
test(
  String.raw`5, [3, 1]`,
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
        kind: 'tupleexpression',
        expressions: [
          {
            kind: 'integerdecimalliteral',
            value: '5',
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
                value: '1',
              },
            ],
          },
        ],
      },
    },
  },
);

lexer = new Lexer('0o711');
parser = new Parser(lexer.lex().tokens);
result = subExpressionSecondInline(parser);
test(
  String.raw`0o711`,
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
        kind: 'integeroctalliteral',
        value: '711',
      },
    },
  },
);

print('============== EXPRESSIONECONDINLINE ==============');
lexer = new Lexer('[1].name(2).{ a + b } ; 500 ;');
parser = new Parser(lexer.lex().tokens);
result = expressionSecondInline(parser);
test(
  String.raw`[1].name(2).{ a + b } ; 500 ;`,
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
      column: 29,
    },
    result: {
      success: true,
      ast: {
        kind: 'expression',
        expressions: [
          {
            kind: 'cascade',
            leftExpression: {
              kind: 'call',
              expression: {
                kind: 'dot',
                expression: {
                  kind: 'listliteral',
                  transposed: false,
                  expressions: [
                    {
                      kind: 'integerdecimalliteral',
                      value: '1',
                    },
                  ],
                },
                name: {
                  kind: 'identifier',
                  value: 'name',
                },
              },
              mutative: false,
              vectorized: false,
              arguments: [
                {
                  key: null,
                  value: {
                    kind: 'integerdecimalliteral',
                    value: '2',
                  },
                },
              ],
            },
            rightExpression: null,
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
          {
            kind: 'integerdecimalliteral',
            value: '500',
          },
        ],
      },
    },
  },
);

lexer = new Lexer('return 45_000; break 200 @name ; fallthrough');
parser = new Parser(lexer.lex().tokens);
result = expressionSecondInline(parser);
test(
  String.raw`return 45_000; break 200 @name ; fallthrough`,
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
      column: 44,
    },
    result: {
      success: true,
      ast: {
        kind: 'expression',
        expressions: [
          {
            kind: 'returnexpression',
            expression: {
              kind: 'integerdecimalliteral',
              value: '45000',
            },
          },
          {
            kind: 'breakexpression',
            label: {
              kind: 'identifier',
              value: 'name',
            },
            expression: {
              kind: 'integerdecimalliteral',
              value: '200',
            },
          },
          {
            kind: 'fallthroughexpression',
            label: null,
          },
        ],
      },
    },
  },
);

lexer = new Lexer('return 45_000\nbreak 200; 567\nfallthrough');
parser = new Parser(lexer.lex().tokens);
result = expressionSecondInline(parser);
test(
  String.raw`return 45_000\nbreak 200; 567\nfallthrough`,
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
      column: 40,
    },
    result: {
      success: true,
      ast: {
        kind: 'expression',
        expressions: [
          {
            kind: 'returnexpression',
            expression: {
              kind: 'integerdecimalliteral',
              value: '45000',
            },
          },
          {
            kind: 'breakexpression',
            label: null,
            expression: {
              kind: 'integerdecimalliteral',
              value: '200',
            },
          },
          {
            kind: 'integerdecimalliteral',
            value: '567',
          },
          {
            kind: 'fallthroughexpression',
            label: null,
          },
        ],
      },
    },
  },
);

test();

module.exports = test;
