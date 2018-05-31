const Lexer = require('./lexer');
const {
  Parser,
  parseNonTerminalRule,
  parse,
  alt,
  more,
  optmore,
  opt,
  and,
  not,
  identifier,
  operator,
  punctuator,
  // integerBinaryLiteral,
  integerOctalLiteral,
  integerHexadecimalLiteral,
  integerDecimalLiteral,
  // floatBinaryLiteral,
  // floatOctalLiteral,
  // floatHexadecimalLiteral,
  floatDecimalLiteral,
  // floatLiteralNoMantissa,
  singleLineStringLiteral,
  // multiLineStringLiteral,
  // regexLiteral,
  // singleLineComment,
  // multiLineComment,
} = require('./parser');
const { print, createTest } = require('../utils');

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
      asts: [
        'hello',
        'world',
        null,
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
      asts: [
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
      asts: [
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
      asts: [
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
      asts: [
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
const ruleParse1 = p => parseNonTerminalRule(p, 'ruleParse1', parse(operator, 'world'));
result = ruleParse1(parser);
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
      ast: {
        kind: 'ruleParse1',
        ast: [
          {
            kind: 'operator',
            value: '++--',
          },
          'world',
        ],
      },
    },
  },
);

lexer = new Lexer('hello hello');
parser = new Parser(lexer.lex());
const ruleParse2 = p => parseNonTerminalRule(p, 'ruleParse2', parse('hello'));
result = ruleParse2(parser);
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
      ast: {
        kind: 'ruleParse2',
        ast: [
          'hello',
        ],
      },
    },
  },
);

print('============== ALT ==============');
lexer = new Lexer('++--');
parser = new Parser(lexer.lex());
const ruleAlt1 = p => parseNonTerminalRule(p, 'ruleAlt1', alt(operator, 'world'));
result = ruleAlt1(parser);
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
        kind: 'ruleAlt1',
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
const ruleAlt2 = p => parseNonTerminalRule(p, 'ruleAlt2', alt(parse(operator), 'hello'));
result = ruleAlt2(parser);
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
      column: 4,
    },
    result: {
      success: true,
      ast: {
        kind: 'ruleAlt2',
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
const ruleAlt3 = p => parseNonTerminalRule(p, 'ruleAlt3', alt(operator, 'hello'));
result = ruleAlt3(parser);
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
        kind: 'ruleAlt3',
        ast: 'hello',
      },
    },
  },
);

print('============== MORE ==============');
lexer = new Lexer('none world world none');
parser = new Parser(lexer.lex());
const ruleMore1 = p => parseNonTerminalRule(p, 'ruleMore1', more('world'));
result = ruleMore1(parser);
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
      kind: 'ruleMore1',
      ast: null,
    },
  },
);

lexer = new Lexer('world   world   world none');
parser = new Parser(lexer.lex());
const ruleMore2 = p => parseNonTerminalRule(p, 'ruleMore2', more('world'));
result = ruleMore2(parser);
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
      ast: {
        kind: 'ruleMore2',
        ast: [
          'world',
          'world',
          'world',
        ],
      },
    },
  },
);

print('============== OPTMORE ==============');
lexer = new Lexer('');
parser = new Parser(lexer.lex());
const ruleOptMore1 = p => parseNonTerminalRule(p, 'ruleOptMore1', optmore('world'));
result = ruleOptMore1(parser);
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
        kind: 'ruleOptMore1',
        ast: [],
      },
    },
  },
);

lexer = new Lexer('world   world   world none');
parser = new Parser(lexer.lex());
const ruleOptMore2 = p => parseNonTerminalRule(p, 'ruleOptMore2', optmore('world'));
result = ruleOptMore2(parser);
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
      ast: {
        kind: 'ruleOptMore2',
        ast: [
          'world',
          'world',
          'world',
        ],
      },
    },
  },
);

print('============== OPT ==============');
lexer = new Lexer('');
parser = new Parser(lexer.lex());
const ruleOpt1 = p => parseNonTerminalRule(p, 'ruleOpt1', opt('world'));
result = ruleOpt1(parser);
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
        kind: 'ruleOpt1',
        ast: null,
      },
    },
  },
);

lexer = new Lexer('world   world   world   world  none');
parser = new Parser(lexer.lex());
const ruleOpt2 = p => parseNonTerminalRule(p, 'ruleOpt2', opt('world'));
result = ruleOpt2(parser);
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
      ast: {
        kind: 'ruleOpt2',
        ast: 'world',
      },
    },
  },
);

print('============== AND ==============');
lexer = new Lexer('0x45abcdef79');
parser = new Parser(lexer.lex());
const ruleAnd1 = p => parseNonTerminalRule(p, 'ruleAnd1', and(integerHexadecimalLiteral));
result = ruleAnd1(parser);
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
      ast: {
        kind: 'ruleAnd1',
        ast: null,
      },
    },
  },
);

lexer = new Lexer('678');
parser = new Parser(lexer.lex());
const ruleAnd2 = p => parseNonTerminalRule(p, 'ruleAnd2', and(identifier));
result = ruleAnd2(parser);
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
      success: false,
      kind: 'ruleAnd2',
      ast: null,
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
const ruleAnd3 = p => parseNonTerminalRule(p, 'ruleAnd3', and(identifier));
result = ruleAnd3(parser);
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
      success: false,
      kind: 'ruleAnd3',
      ast: null,
    },
  },
);

print('============== NOT ==============');
lexer = new Lexer('0x45abcdef79');
parser = new Parser(lexer.lex());
const ruleNot1 = p => parseNonTerminalRule(p, 'ruleNot1', not(integerHexadecimalLiteral));
result = ruleNot1(parser);
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
      success: false,
      kind: 'ruleNot1',
      ast: null,
    },
  },
);

lexer = new Lexer('678');
parser = new Parser(lexer.lex());
const ruleNot2 = p => parseNonTerminalRule(p, 'ruleNot2', not(identifier));
result = ruleNot2(parser);
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
      ast: {
        kind: 'ruleNot2',
        ast: null,
      },
    },
  },
);

lexer = new Lexer('');
parser = new Parser(lexer.lex());
const ruleNot3 = p => parseNonTerminalRule(p, 'ruleNot3', not(identifier));
result = ruleNot3(parser);
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
        kind: 'ruleNot3',
        ast: null,
      },
    },
  },
);

test();

module.exports = test;

