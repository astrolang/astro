const Lexer = require('./lexer');
const {
  Parser,
  parse,
  alt,
  more,
  optmore,
  opt,
  and,
  not,
  eoi,
  identifier,
  operator,
  punctuator,
  integerOctalLiteral,
  integerHexadecimalLiteral,
  integerDecimalLiteral,
  floatDecimalLiteral,
  singleLineStringLiteral,
  integerLiteral,
  floatLiteral,
  numericLiteral,
  stringLiteral,
  coefficientExpression,
  comment,
  indent,
  samedent,
  dedent,
  spaces,
  noSpace,
  nextline,
  lineContinuation,
  _,
} = require('./parser');
const { print, createTest } = require('../../utils');

let lexer = null;
let parser = null;
let result = null;
const test = createTest();

print('============== EATTOKEN ==============');
lexer = new Lexer('hello world');
parser = new Parser(lexer.lex());
result = parser.eatToken('world');
test(
  String.raw`hello world--------->FAIL`,
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
      success: false,
      token: null,
    },
  },
);

lexer = new Lexer('hello world');
parser = new Parser(lexer.lex());
result = parser.eatToken('hello');
result = parser.eatToken('world');
result = parser.eatToken('world');
test(
  String.raw`hello world--------->FAIL`,
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
      tokenPosition: 1,
      line: 1,
      column: 11,
    },
    result: {
      success: false,
      token: null,
    },
  },
);

lexer = new Lexer('hello world');
parser = new Parser(lexer.lex());
result = parser.eatToken('hello');
test(
  String.raw`hello world`,
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
      column: 5,
    },
    result: {
      success: true,
      token: 'hello',
    },
  },
);

lexer = new Lexer('hello world');
parser = new Parser(lexer.lex());
result = parser.eatToken('hello');
result = parser.eatToken('world');
test(
  String.raw`hello world`,
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
      tokenPosition: 1,
      line: 1,
      column: 11,
    },
    result: {
      success: true,
      token: 'world',
    },
  },
);

print('============== EATTOKENSTART ==============');
lexer = new Lexer('helliworld');
parser = new Parser(lexer.lex());
result = parser.eatTokenStart('hello');
test(
  String.raw`hello world--------->FAIL`,
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
      success: false,
      token: null,
    },
  },
);

lexer = new Lexer('hellonamaste');
parser = new Parser(lexer.lex());
result = parser.eatTokenStart('hello');
test(
  String.raw`hellonamaste`,
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
      column: 12,
    },
    result: {
      success: true,
      token: 'hello',
    },
  },
);

lexer = new Lexer('hello');
parser = new Parser(lexer.lex());
result = parser.eatTokenStart('hello');
test(
  String.raw`hello`,
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
      column: 5,
    },
    result: {
      success: true,
      token: 'hello',
    },
  },
);

print('============== PARSER.PARSE ==============');
lexer = new Lexer('hello world');
parser = new Parser(lexer.lex());
result = parser.parse('hello', 'world', 'hello');
test(
  String.raw`hello world--------->FAIL`,
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
      success: false,
      ast: [
        'hello',
        'world',
      ],
    },
  },
);

lexer = new Lexer('hello world');
parser = new Parser(lexer.lex());
result = parser.parse('hello', 'world');
test(
  String.raw`hello world`,
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
      tokenPosition: 1,
      line: 1,
      column: 11,
    },
    result: {
      success: true,
      ast: [
        'hello',
        'world',
      ],
    },
  },
);

lexer = new Lexer('hello hello');
parser = new Parser(lexer.lex());
result = parser.parse('hello');
test(
  String.raw`hello hello`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: [
        'hello',
      ],
    },
  },
);

print('============== LEXED FUNCTIONS ==============');
lexer = new Lexer('5.034 hello 0.56');
parser = new Parser(lexer.lex());
result = parser.parse(floatDecimalLiteral);
result = parser.parse('hello');
result = parser.parse(floatDecimalLiteral);
test(
  String.raw`5.034 hello 0.56`,
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
      tokenPosition: 2,
      line: 1,
      column: 16,
    },
    result: {
      success: true,
      ast: [
        {
          kind: 'floatdecimalliteral',
          value: '0.56',
        },
      ],
    },
  },
);

lexer = new Lexer('5.034 . 0o5667 "hello" 58');
parser = new Parser(lexer.lex());
result = parser.parse(
  floatDecimalLiteral,
  punctuator,
  integerOctalLiteral,
  singleLineStringLiteral,
  integerDecimalLiteral,
);
test(
  String.raw`5.034 . 0o5667 "hello" 58`,
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
      column: 25,
    },
    result: {
      success: true,
      ast: [
        {
          kind: 'floatdecimalliteral',
          value: '5.034',
        },
        {
          kind: 'punctuator',
          value: '.',
        },
        {
          kind: 'integeroctalliteral',
          value: '5667',
        },
        {
          kind: 'singlelinestringliteral',
          value: 'hello',
        },
        {
          kind: 'integerdecimalliteral',
          value: '58',
        },
      ],
    },
  },
);

print('============== CACHING =============='); // TODO: Needs a more complex example.
const start1 = process.hrtime();
lexer = new Lexer('5.034 hello 0.567 world');
parser = new Parser(lexer.lex());
// Failed Attempt
result = parser.parse(floatDecimalLiteral, 'hello', floatDecimalLiteral, 'xxxxx');
// Reset parser cache
parser.cache = {};
// Successful Attempt
result = parser.parse(floatDecimalLiteral, 'hello', floatDecimalLiteral, 'world');
const diff1 = process.hrtime(start1)[1] * 1e-6;
// The `* 1e-6` converts the nanosecond to millisecond
print('Without Caching: ', diff1, 'ms');

const start2 = process.hrtime();
lexer = new Lexer('5.034 hello 0.567 world');
parser = new Parser(lexer.lex());
// Failed Attempt
result = parser.parse(floatDecimalLiteral, 'hello', floatDecimalLiteral, 'xxxxx');
// Successful Attempt
result = parser.parse(floatDecimalLiteral, 'hello', floatDecimalLiteral, 'world');
// The `* 1e-6` converts the nanosecond to millisecond
const diff2 = process.hrtime(start2)[1] * 1e-6;
print('With Caching: ', diff2, 'ms');

lexer = new Lexer('5.034 hello 0.567 world');
parser = new Parser(lexer.lex());
result = parser.parse(floatDecimalLiteral, 'hello', floatDecimalLiteral, 'xxxxx');
result = parser.parse(floatDecimalLiteral, 'hello', floatDecimalLiteral, 'world');
test(
  String.raw`5.034 hello 0.567 world`,
  parser.cache,
  {
    1: {
      floatdecimalliteral: {
        success: true,
        ast: {
          kind: 'floatdecimalliteral',
          value: '0.567',
        },
        skip: 1,
      },
    },
    '-1': {
      floatdecimalliteral: {
        success: true,
        ast: {
          kind: 'floatdecimalliteral',
          value: '5.034',
        },
        skip: 1,
      },
    },
  },
);

print('============== PARSE ==============');
lexer = new Lexer('++-- world');
parser = new Parser(lexer.lex());
result = parse(operator, 'world')(parser);
test(
  String.raw`++-- world`,
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
      tokenPosition: 1,
      line: 1,
      column: 10,
    },
    result: {
      success: true,
      ast: [
        {
          kind: 'operator',
          value: '++--',
        },
        'world',
      ],
    },
  },
);

lexer = new Lexer('hello hello');
parser = new Parser(lexer.lex());
result = parse('hello')(parser);
test(
  String.raw`hello hello`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: [
        'hello',
      ],
    },
  },
);

print('============== ALT ==============');
lexer = new Lexer('++--');
parser = new Parser(lexer.lex());
result = alt(operator, 'world')(parser);
test(
  String.raw`++--`,
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
      column: 4,
    },
    result: {
      success: true,
      ast: {
        alternative: 1,
        ast: {
          kind: 'operator',
          value: '++--',
        },
      },
    },
  },
);

lexer = new Lexer('++**');
parser = new Parser(lexer.lex());
result = alt('hello', parse(operator))(parser);
test(
  String.raw`++**`,
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
      column: 4,
    },
    result: {
      success: true,
      ast: {
        alternative: 2,
        ast: [
          {
            kind: 'operator',
            value: '++**',
          },
        ],
      },
    },
  },
);

lexer = new Lexer('hello');
parser = new Parser(lexer.lex());
result = alt(operator, 'hello')(parser);
test(
  String.raw`hello`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: {
        alternative: 2,
        ast: 'hello',
      },
    },
  },
);

print('============== MORE ==============');
lexer = new Lexer('none world world none');
parser = new Parser(lexer.lex());
result = more('world')(parser);
test(
  String.raw`none world world none--------->FAIL`,
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
      success: false,
      ast: [],
    },
  },
);

lexer = new Lexer('world   world   world none');
parser = new Parser(lexer.lex());
result = more('world')(parser);
test(
  String.raw`world   world   world none`,
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
      tokenPosition: 2,
      line: 1,
      column: 21,
    },
    result: {
      success: true,
      ast: [
        'world',
        'world',
        'world',
      ],
    },
  },
);

print('============== OPTMORE ==============');
lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = optmore('world')(parser);
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
      ast: [],
    },
  },
);

lexer = new Lexer('world   world   world none');
parser = new Parser(lexer.lex());
result = optmore('world')(parser);
test(
  String.raw`world   world   world none`,
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
      tokenPosition: 2,
      line: 1,
      column: 21,
    },
    result: {
      success: true,
      ast: [
        'world',
        'world',
        'world',
      ],
    },
  },
);

print('============== OPT ==============');
lexer = new Lexer('world   world   world   world  none');
parser = new Parser(lexer.lex());
result = opt('world')(parser);
test(
  String.raw`world   world   world   world  none`,
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
      column: 5,
    },
    result: {
      success: true,
      ast: ['world'],
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = opt('world')(parser);
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
      ast: [],
    },
  },
);

print('============== AND ==============');
lexer = new Lexer('678');
parser = new Parser(lexer.lex());
result = and(identifier)(parser);
test(
  String.raw`678--------->FAIL`,
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
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = and(identifier)(parser);
test(
  String.raw`--------->FAIL`,
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
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('0x45abcdef79');
parser = new Parser(lexer.lex());
result = and(integerHexadecimalLiteral)(parser);
test(
  String.raw`0x45abcdef79`,
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
      directive: true,
    },
  },
);

lexer = new Lexer('character');
parser = new Parser(lexer.lex());
result = and('§ch')(parser);
test(
  String.raw`character`,
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
      directive: true,
    },
  },
);

// print('============== NOT ==============');
lexer = new Lexer('0x45abcdef79');
parser = new Parser(lexer.lex());
result = not(integerHexadecimalLiteral)(parser);
test(
  String.raw`0x45abcdef79--------->FAIL`,
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
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('678');
parser = new Parser(lexer.lex());
result = not(identifier)(parser);
test(
  String.raw`678`,
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
      directive: true,
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = not(identifier)(parser);
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
      directive: true,
    },
  },
);

print('============== EOI ==============');
lexer = new Lexer('678');
parser = new Parser(lexer.lex());
result = eoi(parser);
test(
  String.raw`678--------->FAIL`,
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
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = eoi(parser);
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
      directive: true,
    },
  },
);

print('============== INTEGERLITERAL ==============');
lexer = new Lexer('a99');
parser = new Parser(lexer.lex());
result = integerLiteral(parser);
test(
  String.raw`a99--------->FAIL`,
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
      success: false,
      ast: {
        kind: 'integerliteral',
      },
    },
  },
);

lexer = new Lexer('678');
parser = new Parser(lexer.lex());
result = integerLiteral(parser);
test(
  String.raw`678`,
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
      column: 3,
    },
    result: {
      success: true,
      ast: {
        kind: 'integerdecimalliteral',
        value: '678',
      },
    },
  },
);

lexer = new Lexer('0b11_0011');
parser = new Parser(lexer.lex());
result = integerLiteral(parser);
test(
  String.raw`0b11_0011`,
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
      column: 9,
    },
    result: {
      success: true,
      ast: {
        kind: 'integerbinaryliteral',
        value: '110011',
      },
    },
  },
);

lexer = new Lexer('0x_ff_0e11');
parser = new Parser(lexer.lex());
result = integerLiteral(parser);
test(
  String.raw`0x_ff_0e11`,
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
      column: 10,
    },
    result: {
      success: true,
      ast: {
        kind: 'integerhexadecimalliteral',
        value: 'ff0e11',
      },
    },
  },
);

lexer = new Lexer('0o_776_122');
parser = new Parser(lexer.lex());
result = integerLiteral(parser);
test(
  String.raw`0o_776_122`,
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
      column: 10,
    },
    result: {
      success: true,
      ast: {
        kind: 'integeroctalliteral',
        value: '776122',
      },
    },
  },
);

print('============== FLOATLITERAL ==============');
lexer = new Lexer('a99');
parser = new Parser(lexer.lex());
result = floatLiteral(parser);
test(
  String.raw`a99--------->FAIL`,
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
      success: false,
      ast: {
        kind: 'floatliteral',
      },
    },
  },
);

lexer = new Lexer('.678');
parser = new Parser(lexer.lex());
result = floatLiteral(parser);
test(
  String.raw`.678`,
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
      column: 4,
    },
    result: {
      success: true,
      ast: {
        kind: 'floatdecimalliteral',
        value: '0.678',
      },
    },
  },
);

lexer = new Lexer('0b11_0011e-11_01');
parser = new Parser(lexer.lex());
result = floatLiteral(parser);
test(
  String.raw`0b11_0011e-11_01`,
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
      column: 16,
    },
    result: {
      success: true,
      ast: {
        kind: 'floatbinaryliteral',
        value: '110011e-1101',
      },
    },
  },
);

lexer = new Lexer('0x_ff.6_0e11');
parser = new Parser(lexer.lex());
result = floatLiteral(parser);
test(
  String.raw`0x_ff.6_0e11`,
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
      column: 12,
    },
    result: {
      success: true,
      ast: {
        kind: 'floathexadecimalliteral',
        value: 'ff.60e11',
      },
    },
  },
);

lexer = new Lexer('0o_77.6_122');
parser = new Parser(lexer.lex());
result = floatLiteral(parser);
test(
  String.raw`0o_77.6_122`,
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
      column: 11,
    },
    result: {
      success: true,
      ast: {
        kind: 'floatoctalliteral',
        value: '77.6122',
      },
    },
  },
);

print('============== NUMERICLITERAL ==============');
lexer = new Lexer('_99');
parser = new Parser(lexer.lex());
result = numericLiteral(parser);
test(
  String.raw`_99--------->FAIL`,
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
      success: false,
      ast: {
        kind: 'numericliteral',
      },
    },
  },
);

lexer = new Lexer('0x_ff.6_0e11');
parser = new Parser(lexer.lex());
result = numericLiteral(parser);
test(
  String.raw`0x_ff.6_0e11`,
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
      column: 12,
    },
    result: {
      success: true,
      ast: {
        kind: 'floathexadecimalliteral',
        value: 'ff.60e11',
      },
    },
  },
);

lexer = new Lexer('0x_ff_0e11');
parser = new Parser(lexer.lex());
result = numericLiteral(parser);
test(
  String.raw`0x_ff_0e11`,
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
      column: 10,
    },
    result: {
      success: true,
      ast: {
        kind: 'integerhexadecimalliteral',
        value: 'ff0e11',
      },
    },
  },
);

print('============== STRINGLITERAL ==============');
lexer = new Lexer("'");
parser = new Parser(lexer.lex());
result = stringLiteral(parser);
test(
  String.raw`'--------->FAIL`,
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
      success: false,
      ast: {
        kind: 'stringliteral',
      },
    },
  },
);

lexer = new Lexer('"ẹjọ 😆 hello"');
parser = new Parser(lexer.lex());
result = stringLiteral(parser);
test(
  String.raw`"ẹjọ 😆 hello"`,
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
      column: 14,
    },
    result: {
      success: true,
      ast: {
        kind: 'singlelinestringliteral',
        value: 'ẹjọ 😆 hello',
      },
    },
  },
);

lexer = new Lexer("'this is america'");
parser = new Parser(lexer.lex());
result = stringLiteral(parser);
test(
  String.raw`'this is america'`,
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
      column: 17,
    },
    result: {
      success: true,
      ast: {
        kind: 'singlelinestringliteral',
        value: 'this is america',
      },
    },
  },
);

lexer = new Lexer('"""this \n  is america"""');
parser = new Parser(lexer.lex());
result = stringLiteral(parser);
test(
  String.raw`"""this \n  is america"""`,
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
      column: 24,
    },
    result: {
      success: true,
      ast: {
        kind: 'multilinestringliteral',
        value: 'this \n  is america',
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
      line: parser.line,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 1,
      line: 1,
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
      line: parser.line,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 1,
      line: 1,
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
      line: parser.line,
      column: parser.column,
    },
    result,
  },
  {
    parser: {
      tokenPosition: 1,
      line: 1,
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

print('============== COMMENT ==============');
lexer = new Lexer('#= hello world');
parser = new Parser(lexer.lex());
result = comment(parser);
test(
  String.raw`#= hello world--------->FAIL`,
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
      success: false,
      ast: {
        kind: 'comment',
      },
    },
  },
);

lexer = new Lexer('# 78.f hello');
parser = new Parser(lexer.lex());
result = comment(parser);
test(
  String.raw`# 78.f hello--------->FAIL`,
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
      column: 12,
    },
    result: {
      success: true,
      ast: {
        kind: 'singlelinecomment',
        value: ' 78.f hello',
      },
    },
  },
);

lexer = new Lexer('#= hello \r\n 78f =#');
parser = new Parser(lexer.lex());
result = comment(parser);
test(
  String.raw`'#= hello \r\n 78f =#`,
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
        kind: 'multilinecomment',
        value: ' hello \r\n 78f ',
      },
    },
  },
);

print('============== INDENT ==============');
lexer = new Lexer('');
parser = new Parser(lexer.lex());
parser.lastIndentCount += 1;
result = indent(parser);
test(
  String.raw`--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 1,
    },
    result: {
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('        print');
parser = new Parser(lexer.lex());
result = indent(parser);
test(
  String.raw`        print--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 0,
    },
    result: {
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('print');
parser = new Parser(lexer.lex());
result = indent(parser);
test(
  String.raw`print--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 0,
    },
    result: {
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('    print');
parser = new Parser(lexer.lex());
result = indent(parser);
test(
  String.raw`    print`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 1,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer('        print');
parser = new Parser(lexer.lex());
parser.lastIndentCount += 1;
result = indent(parser);
test(
  String.raw`         print`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 2,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

print('============== SAMEDENT ==============');
lexer = new Lexer('    print');
parser = new Parser(lexer.lex());
result = samedent(parser);
test(
  String.raw`    print--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 0,
    },
    result: {
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('        print');
parser = new Parser(lexer.lex());
parser.lastIndentCount += 1;
result = samedent(parser);
test(
  String.raw`        print--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 1,
    },
    result: {
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('    print');
parser = new Parser(lexer.lex());
parser.lastIndentCount += 1;
result = samedent(parser);
test(
  String.raw`    print`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 1,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer('print');
parser = new Parser(lexer.lex());
result = samedent(parser);
test(
  String.raw`print`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 0,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer('        print');
parser = new Parser(lexer.lex());
parser.lastIndentCount += 2;
result = samedent(parser);
test(
  String.raw`         print`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 2,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = samedent(parser);
test(
  String.raw``,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 0,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

print('============== DEDENT ==============');
lexer = new Lexer('    print');
parser = new Parser(lexer.lex());
parser.lastIndentCount += 1;
result = dedent(parser);
test(
  String.raw`    print--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 1,
    },
    result: {
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('        print');
parser = new Parser(lexer.lex());
result = dedent(parser);
test(
  String.raw`        print--------->FAIL`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 0,
    },
    result: {
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('print');
parser = new Parser(lexer.lex());
parser.lastIndentCount += 1;
result = dedent(parser);
test(
  String.raw`print`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 0,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer('    print');
parser = new Parser(lexer.lex());
parser.lastIndentCount += 2;
result = dedent(parser);
test(
  String.raw`    print`,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 1,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
parser.lastIndentCount += 1;
result = dedent(parser);
test(
  String.raw``,
  {
    parser: {
      tokenPosition: parser.tokenPosition,
      line: parser.line,
      column: parser.column,
      lastIndentCount: parser.lastIndentCount,
    },
    result,
  },
  {
    parser: {
      tokenPosition: -1,
      line: 1,
      column: 0,
      lastIndentCount: 0,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

print('============== SPACES ==============');
lexer = new Lexer('print');
parser = new Parser(lexer.lex());
result = spaces(parser);
test(
  String.raw`print--------->FAIL`,
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
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = spaces(parser);
test(
  String.raw`--------->FAIL`,
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
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('  print');
parser = new Parser(lexer.lex());
result = spaces(parser);
test(
  String.raw`  print`,
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
      directive: true,
    },
  },
);

lexer = new Lexer(' print');
parser = new Parser(lexer.lex());
result = spaces(parser);
test(
  String.raw` print`,
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
      directive: true,
    },
  },
);

print('============== NOSPACE ==============');
lexer = new Lexer('  print');
parser = new Parser(lexer.lex());
result = noSpace(parser);
test(
  String.raw`  print--------->FAIL`,
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
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer(' ');
parser = new Parser(lexer.lex());
result = noSpace(parser);
test(
  String.raw` `,
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
      directive: true,
    },
  },
);

lexer = new Lexer('print');
parser = new Parser(lexer.lex());
result = noSpace(parser);
test(
  String.raw`print`,
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
      directive: true,
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
result = noSpace(parser);
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
      directive: true,
    },
  },
);

print('============== NEXTLINE ==============');
lexer = new Lexer('\r');
parser = new Parser(lexer.lex());
result = nextline(parser);
test(
  String.raw`\r--------->FAIL`,
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
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('\r\n\n     \r\n \n');
parser = new Parser(lexer.lex());
result = nextline(parser);
test(
  String.raw`\r\n\n     \r\n \n`,
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
      column: 12,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer('\r\n  hello');
parser = new Parser(lexer.lex());
result = nextline(parser);
test(
  String.raw`\r\n  hello`,
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
      column: 2,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

print('============== LINECONTINUATION ==============');
lexer = new Lexer('  ...');
parser = new Parser(lexer.lex());
result = lineContinuation(parser);
test(
  String.raw`  ...`,
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
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('  ...     \r\n   \n');
parser = new Parser(lexer.lex());
result = lineContinuation(parser);
test(
  String.raw`  ...     \r\n   \n`,
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
      column: 16,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

lexer = new Lexer('... \nhello');
parser = new Parser(lexer.lex());
result = lineContinuation(parser);
test(
  String.raw`... \nhello`,
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
      column: 5,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

print('============== _ ==============');
lexer = new Lexer('\n\n   \r\n');
parser = new Parser(lexer.lex());
result = _(parser);
test(
  String.raw`\n\n   \r\n--------->FAIL`,
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
      success: false,
      directive: true,
    },
  },
);

lexer = new Lexer('    hello');
parser = new Parser(lexer.lex());
result = _(parser);
test(
  String.raw`    hello--------->MID`,
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
      directive: true,
    },
  },
);

lexer = new Lexer('... \r\nhello');
parser = new Parser(lexer.lex());
result = _(parser);
test(
  String.raw`... \r\nhello`,
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
      column: 6,
    },
    result: {
      success: true,
      directive: true,
    },
  },
);

test();

module.exports = test;

