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
  // primitiveExpression,
  // simpleExpression,
  // tupleExpression,
  // dotNotationLine,
  // dotNotationBlock,
  // subExpression,
  // expression,
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

lexer = new Lexer('[1, 2]');
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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

print('============== COMMANDNOTATIONARGUMENT ==============');
lexer = new Lexer(' [1, 2]');
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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
parser = new Parser(lexer.lex());
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

test();

module.exports = test;
