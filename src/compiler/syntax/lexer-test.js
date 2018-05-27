const Lexer = require('./lexer');
const { print, createTest } = require('../utils');

let lexer = null;
let result = null;
const test = createTest();

print('============== EATTOKEN ==============');
lexer = new Lexer('hello world');
result = lexer.eatToken('hello');
test(
  String.raw`hello world--------->MID`,
  result,
  {
    token: 'hello',
    kind: 'eatToken',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

lexer = new Lexer('..');
result = lexer.eatToken('..');
test(
  String.raw`..`,
  result,
  {
    token: '..',
    kind: 'eatToken',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 2,
  },
);

print('============== SPACES ==============');
lexer = new Lexer('');
result = lexer.spaces();
test(
  String.raw`--------->FAIL`,
  result,
  null,
);

lexer = new Lexer(' \t\t  ');
result = lexer.spaces();
test(
  String.raw` \t\t  `,
  result,
  {
    token: '',
    kind: 'spaces',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

print('============== NEWLINE ==============');
lexer = new Lexer('\r');
result = lexer.newline();
test(
  String.raw`\r--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('\n');
result = lexer.newline();
test(
  String.raw`\n`,
  result,
  {
    token: '',
    kind: 'newline',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 1,
  },
);

lexer = new Lexer('\r\n');
result = lexer.newline();
test(
  String.raw`\r\n`,
  result,
  {
    token: '',
    kind: 'newline',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 2,
  },
);

print('============== NONAME ==============');
lexer = new Lexer('_');
result = lexer.noName();
test(
  String.raw`_`,
  result,
  {
    token: '_',
    kind: 'noname',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 1,
  },
);

print('============== IDENTIFIER ==============');
lexer = new Lexer('678name');
result = lexer.identifier();
test(
  String.raw`678name--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('some_name678');
result = lexer.identifier();
test(
  String.raw`some_name678`,
  result,
  {
    token: 'some_name678',
    kind: 'identifier',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 12,
  },
);

lexer = new Lexer('where');
result = lexer.identifier();
test(
  String.raw`where`,
  result,
  {
    token: 'where',
    kind: 'keyword',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

lexer = new Lexer('else');
result = lexer.identifier();
test(
  String.raw`else`,
  result,
  {
    token: 'else',
    kind: 'keyword',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('elseif');
result = lexer.identifier();
test(
  String.raw`elseif`,
  result,
  {
    token: 'elseif',
    kind: 'identifier',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 6,
  },
);

lexer = new Lexer('true');
result = lexer.identifier();
test(
  String.raw`true`,
  result,
  {
    token: 'true',
    kind: 'booleanliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('false');
result = lexer.identifier();
test(
  String.raw`false`,
  result,
  {
    token: 'false',
    kind: 'booleanliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

print('============== OPERATOR ==============');
lexer = new Lexer('=//');
result = lexer.operator();
test(
  String.raw`=//--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('+');
result = lexer.operator();
test(
  String.raw`+`,
  result,
  {
    token: '+',
    kind: 'operator',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 1,
  },
);

lexer = new Lexer('/-/');
result = lexer.operator();
test(
  String.raw`/-/`,
  result,
  {
    token: '/-/',
    kind: 'operator',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('//');
result = lexer.operator();
test(
  String.raw`//`,
  result,
  {
    token: '//',
    kind: 'operator',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 2,
  },
);

print('============== PUNCTUATOR ==============');
lexer = new Lexer('..');
result = lexer.punctuator();
test(
  String.raw`..--------->MID`,
  result,
  {
    token: '.',
    kind: 'punctuator',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 1,
  },
);

lexer = new Lexer('~');
result = lexer.punctuator();
test(
  String.raw`~`,
  result,
  {
    token: '~',
    kind: 'punctuator',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 1,
  },
);

print('============== INTEGERBINARYLITERAL ==============');
lexer = new Lexer('0b201');
result = lexer.integerBinaryLiteral();
test(
  String.raw`0b201--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('0b0__');
result = lexer.integerBinaryLiteral();
test(
  String.raw`0b0__--------->MID`,
  result,
  {
    token: '0',
    kind: 'integerbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('0b0__1');
result = lexer.integerBinaryLiteral();
test(
  String.raw`0b0__1--------->MID`,
  result,
  {
    token: '0',
    kind: 'integerbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('0b1001');
result = lexer.integerBinaryLiteral();
test(
  String.raw`0b1001`,
  result,
  {
    token: '1001',
    kind: 'integerbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 6,
  },
);

lexer = new Lexer('0b1011_1000_1110');
result = lexer.integerBinaryLiteral();
test(
  String.raw`0b1011_1000_1110`,
  result,
  {
    token: '101110001110',
    kind: 'integerbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);

print('============== INTEGEROCTALLITERAL ==============');
lexer = new Lexer('0o856');
result = lexer.integerOctalLiteral();
test(
  String.raw`0o856--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('0o7__');
result = lexer.integerOctalLiteral();
test(
  String.raw`0o7__--------->MID`,
  result,
  {
    token: '7',
    kind: 'integeroctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('0o7__6');
result = lexer.integerOctalLiteral();
test(
  String.raw`0o7__6--------->MID`,
  result,
  {
    token: '7',
    kind: 'integeroctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('0o5667');
result = lexer.integerOctalLiteral();
test(
  String.raw`0o5667`,
  result,
  {
    token: '5667',
    kind: 'integeroctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 6,
  },
);

lexer = new Lexer('0o6655_1466');
result = lexer.integerOctalLiteral();
test(
  String.raw`0o6655_1466`,
  result,
  {
    token: '66551466',
    kind: 'integeroctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 11,
  },
);

print('============== INTEGERHEXADECIMALLITERAL ==============');
lexer = new Lexer('0xgffe');
result = lexer.integerHexadecimalLiteral();
test(
  String.raw`0xgffe--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('0xff__');
result = lexer.integerHexadecimalLiteral();
test(
  String.raw`0xff__--------->MID`,
  result,
  {
    token: 'ff',
    kind: 'integerhexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('0xab__6');
result = lexer.integerHexadecimalLiteral();
test(
  String.raw`0xab__6--------->MID`,
  result,
  {
    token: 'ab',
    kind: 'integerhexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('0x56fe');
result = lexer.integerHexadecimalLiteral();
test(
  String.raw`0x56fe`,
  result,
  {
    token: '56fe',
    kind: 'integerhexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 6,
  },
);

lexer = new Lexer('0x6C_5F_14_e6');
result = lexer.integerHexadecimalLiteral();
test(
  String.raw`0x6C_5F_14_e6`,
  result,
  {
    token: '6C5F14e6',
    kind: 'integerhexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 13,
  },
);

print('============== INTEGERDECIMALLITERAL ==============');
lexer = new Lexer('a345');
result = lexer.integerDecimalLiteral();
test(
  String.raw`a345--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('34_5ab');
result = lexer.integerDecimalLiteral();
test(
  String.raw`34_5ab--------->MID`,
  result,
  {
    token: '345',
    kind: 'integerdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('9_0__6');
result = lexer.integerDecimalLiteral();
test(
  String.raw`9_0__6--------->MID`,
  result,
  {
    token: '90',
    kind: 'integerdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 3,
  },
);

lexer = new Lexer('5_200');
result = lexer.integerDecimalLiteral();
test(
  String.raw`5_200`,
  result,
  {
    token: '5200',
    kind: 'integerdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

lexer = new Lexer('1_245_000');
result = lexer.integerDecimalLiteral();
test(
  String.raw`1_245_000`,
  result,
  {
    token: '1245000',
    kind: 'integerdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 9,
  },
);

print('============== FLOATBINARYLITERAL ==============');
lexer = new Lexer('0b1001_1101');
result = lexer.floatBinaryLiteral();
test(
  String.raw`0b1001_1101--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('0b1001_1110.110151001');
result = lexer.floatBinaryLiteral();
test(
  String.raw`0b1001_1110.110151001--------->MID`,
  result,
  {
    token: '10011110.1101',
    kind: 'floatbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);

lexer = new Lexer('0b1001_1110.1101__1001');
result = lexer.floatBinaryLiteral();
test(
  String.raw`0b1001_1110.1101__1001--------->MID`,
  result,
  {
    token: '10011110.1101',
    kind: 'floatbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);

lexer = new Lexer('0b1101_1001.1001');
result = lexer.floatBinaryLiteral();
test(
  String.raw`0b1101_1001.1001`,
  result,
  {
    token: '11011001.1001',
    kind: 'floatbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);

lexer = new Lexer('0b1101_1001_1111e1001');
result = lexer.floatBinaryLiteral();
test(
  String.raw`0b1101_1001_1111e1001`,
  result,
  {
    token: '110110011111e1001',
    kind: 'floatbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 21,
  },
);

lexer = new Lexer('0b11_01.11_00e10_01');
result = lexer.floatBinaryLiteral();
test(
  String.raw`0b11_01.11_00e10_01`,
  result,
  {
    token: '1101.1100e1001',
    kind: 'floatbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 19,
  },
);

lexer = new Lexer('0b11_01.11_00e+10_01');
result = lexer.floatBinaryLiteral();
test(
  String.raw`0b11_01.11_00e+10_01`,
  result,
  {
    token: '1101.1100e+1001',
    kind: 'floatbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 20,
  },
);

lexer = new Lexer('0b11_01e-10_01');
result = lexer.floatBinaryLiteral();
test(
  String.raw`0b11_01e-10_01`,
  result,
  {
    token: '1101e-1001',
    kind: 'floatbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 14,
  },
);

print('============== FLOATOCTALLITERAL ==============');
lexer = new Lexer('0o7756_5461');
result = lexer.floatOctalLiteral();
test(
  String.raw`0o7756_5461--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('0o7756_5461.533281231');
result = lexer.floatOctalLiteral();
test(
  String.raw`0o7756_5461.533281231--------->MID`,
  result,
  {
    token: '77565461.5332',
    kind: 'floatoctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);

lexer = new Lexer('0o1234_5670.0234__2170');
result = lexer.floatOctalLiteral();
test(
  String.raw`0o1234_5670.0234__2170--------->MID`,
  result,
  {
    token: '12345670.0234',
    kind: 'floatoctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);

lexer = new Lexer('0o1233_4455.7654');
result = lexer.floatOctalLiteral();
test(
  String.raw`0o1233_4455.7654`,
  result,
  {
    token: '12334455.7654',
    kind: 'floatoctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);


lexer = new Lexer('0o7560_1034_0023e1771');
result = lexer.floatOctalLiteral();
test(
  String.raw`0o7560_1034_0023e1771`,
  result,
  {
    token: '756010340023e1771',
    kind: 'floatoctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 21,
  },
);

lexer = new Lexer('0o34_66.24_00e70_01');
result = lexer.floatOctalLiteral();
test(
  String.raw`0o34_66.24_00e70_01`,
  result,
  {
    token: '3466.2400e7001',
    kind: 'floatoctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 19,
  },
);

lexer = new Lexer('0o75_34.11_00e+17_71');
result = lexer.floatOctalLiteral();
test(
  String.raw`0o75_34.11_00e+17_71`,
  result,
  {
    token: '7534.1100e+1771',
    kind: 'floatoctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 20,
  },
);

lexer = new Lexer('0o57_01e-32_01');
result = lexer.floatOctalLiteral();
test(
  String.raw`0o57_01e-32_01`,
  result,
  {
    token: '5701e-3201',
    kind: 'floatoctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 14,
  },
);

print('============== FLOATHEXADECIMALLITERAL ==============');
lexer = new Lexer('0x7ae6_54Ff');
result = lexer.floatHexadecimalLiteral();
test(
  String.raw`0x7ae6_54Ff--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('0x43fE_1AcB.ff45g12B1');
result = lexer.floatHexadecimalLiteral();
test(
  String.raw`0x43fE_1AcB.ff45g12B1--------->MID`,
  result,
  {
    token: '43fE1AcB.ff45',
    kind: 'floathexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);

lexer = new Lexer('0x1ff4_56E0.02a4__21A0');
result = lexer.floatHexadecimalLiteral();
test(
  String.raw`0x1ff4_56E0.02a4__21A0--------->MID`,
  result,
  {
    token: '1ff456E0.02a4',
    kind: 'floathexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);

lexer = new Lexer('0xff3A_44Ab.7fE4');
result = lexer.floatHexadecimalLiteral();
test(
  String.raw`0xff3A_44Ab.7fE4`,
  result,
  {
    token: 'ff3A44Ab.7fE4',
    kind: 'floathexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);


lexer = new Lexer('0x7fCc_1fE3_0fE3paB71');
result = lexer.floatHexadecimalLiteral();
test(
  String.raw`0x7fCc_1fE3_0fE3paB71`,
  result,
  {
    token: '7fCc1fE30fE3paB71',
    kind: 'floathexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 21,
  },
);

lexer = new Lexer('0xfF_aB.eF_03p7A_e1');
result = lexer.floatHexadecimalLiteral();
test(
  String.raw`0xfF_aB.eF_03p7A_e1`,
  result,
  {
    token: 'fFaB.eF03p7Ae1',
    kind: 'floathexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 19,
  },
);

lexer = new Lexer('0x7f_3B.1c_0Cp+17_71');
result = lexer.floatHexadecimalLiteral();
test(
  String.raw`0x7f_3B.1c_0Cp+17_71`,
  result,
  {
    token: '7f3B.1c0Cp+1771',
    kind: 'floathexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 20,
  },
);

lexer = new Lexer('0x5f_EEp-32_A1');
result = lexer.floatHexadecimalLiteral();
test(
  String.raw`0x5f_EEp-32_A1`,
  result,
  {
    token: '5fEEp-32A1',
    kind: 'floathexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 14,
  },
);

print('============== FLOATDECIMALLITERAL ==============');
lexer = new Lexer('7236_5490');
result = lexer.floatDecimalLiteral();
test(
  String.raw`7236_5490--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('4391_1523.5545g1810');
result = lexer.floatDecimalLiteral();
test(
  String.raw`4391_1523.5545g1810--------->MID`,
  result,
  {
    token: '43911523.5545',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 14,
  },
);

lexer = new Lexer('1674_5630.0254__2170');
result = lexer.floatDecimalLiteral();
test(
  String.raw`1674_5630.0254__2170--------->MID`,
  result,
  {
    token: '16745630.0254',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 14,
  },
);

lexer = new Lexer('.7923');
result = lexer.floatDecimalLiteral();
test(
  String.raw`.7923`,
  result,
  {
    token: '0.7923',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);


lexer = new Lexer('.5679_3349e5590');
result = lexer.floatDecimalLiteral();
test(
  String.raw`.5679_3349e5590`,
  result,
  {
    token: '0.56793349e5590',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 15,
  },
);


lexer = new Lexer('.3451e-5078');
result = lexer.floatDecimalLiteral();
test(
  String.raw`.3451e-5078`,
  result,
  {
    token: '0.3451e-5078',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 11,
  },
);


lexer = new Lexer('7507_1091_1773e4211');
result = lexer.floatDecimalLiteral();
test(
  String.raw`7507_1091_1773e4211`,
  result,
  {
    token: '750710911773e4211',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 19,
  },
);

lexer = new Lexer('98_62.55_03e6779');
result = lexer.floatDecimalLiteral();
test(
  String.raw`98_62.55_03e6779`,
  result,
  {
    token: '9862.5503e6779',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 16,
  },
);

lexer = new Lexer('43_36.11_12e+17_71');
result = lexer.floatDecimalLiteral();
test(
  String.raw`43_36.11_12e+17_71`,
  result,
  {
    token: '4336.1112e+1771',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 18,
  },
);

lexer = new Lexer('50_45e-32_51');
result = lexer.floatDecimalLiteral();
test(
  String.raw`50_45e-32_51`,
  result,
  {
    token: '5045e-3251',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 12,
  },
);

print('============== FLOATNOMANTISSA ==============');
lexer = new Lexer('5045.+');
result = lexer.floatLiteralNoMantissa();
test(
  String.raw`5045.+--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('6_100./');
result = lexer.floatLiteralNoMantissa();
test(
  String.raw`6_100./--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('6_100.a');
result = lexer.floatLiteralNoMantissa();
test(
  String.raw`6_100.a--------->MID`,
  result,
  {
    token: '6100.0',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 6,
  },
);

lexer = new Lexer('5490.');
result = lexer.floatLiteralNoMantissa();
test(
  String.raw`5490.`,
  result,
  {
    token: '5490.0',
    kind: 'floatdecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 5,
  },
);

lexer = new Lexer('0b1001.');
result = lexer.floatLiteralNoMantissa();
test(
  String.raw`0b1001.`,
  result,
  {
    token: '1001.0',
    kind: 'floatbinaryliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 7,
  },
);

lexer = new Lexer('0o17_750.');
result = lexer.floatLiteralNoMantissa();
test(
  String.raw`0o17_750.`,
  result,
  {
    token: '17750.0',
    kind: 'floatoctalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 9,
  },
);

lexer = new Lexer('0x5_6a9_fF3.');
result = lexer.floatLiteralNoMantissa();
test(
  String.raw`0x5_6a9_fF3.`,
  result,
  {
    token: '56a9fF3.0',
    kind: 'floathexadecimalliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 12,
  },
);

print('============== SINGLELINESTRINGLITERAL ==============');
lexer = new Lexer("'hello\"");
result = lexer.singleLineStringLiteral();
test(
  String.raw`'hello"--------->FAIL`,
  result,
  null,
);

lexer = new Lexer("'");
result = lexer.singleLineStringLiteral();
test(
  String.raw`'--------->FAIL`,
  result,
  null,
);

lexer = new Lexer("'\n'");
result = lexer.singleLineStringLiteral();
test(
  String.raw`'\n'--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('"hello\'');
result = lexer.singleLineStringLiteral();
test(
  String.raw`"hello\'--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('"');
result = lexer.singleLineStringLiteral();
test(
  String.raw`"--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('"\n"');
result = lexer.singleLineStringLiteral();
test(
  String.raw`"\n"--------->FAIL`,
  result,
  null,
);

lexer = new Lexer("'hello world'");
result = lexer.singleLineStringLiteral();
test(
  String.raw`'hello world'`,
  result,
  {
    token: 'hello world',
    kind: 'singlelinestringliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 13,
  },
);

lexer = new Lexer("''");
result = lexer.singleLineStringLiteral();
test(
  String.raw`''`,
  result,
  {
    token: '',
    kind: 'singlelinestringliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 2,
  },
);

lexer = new Lexer('"Wanna eat Π 😂😍😘"');
result = lexer.singleLineStringLiteral();
test(
  String.raw`"Wanna eat Π 😂😍😘"`,
  result,
  {
    token: 'Wanna eat Π 😂😍😘',
    kind: 'singlelinestringliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 20,
  },
);

lexer = new Lexer('""');
result = lexer.singleLineStringLiteral();
test(
  String.raw`""`,
  result,
  {
    token: '',
    kind: 'singlelinestringliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 2,
  },
);

print('============== MULTILINESTRINGLITERAL ==============');
lexer = new Lexer("'''");
result = lexer.multiLineStringLiteral();
test(
  String.raw`'''--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('"""');
result = lexer.multiLineStringLiteral();
test(
  String.raw`"""--------->FAIL`,
  result,
  null,
);

lexer = new Lexer("'''name");
result = lexer.multiLineStringLiteral();
test(
  String.raw`'''name--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('"""name');
result = lexer.multiLineStringLiteral();
test(
  String.raw`"""name--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('\'\'\'name"""');
result = lexer.multiLineStringLiteral();
test(
  String.raw`'''name"""--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('"""name\'\'\'');
result = lexer.multiLineStringLiteral();
test(
  String.raw`"""name'''--------->FAIL`,
  result,
  null,
);

lexer = new Lexer("'''return \n{ 1, 2, 3 }'''");
result = lexer.multiLineStringLiteral();
test(
  String.raw`'''return \n{ 1, 2, 3 }'''`,
  result,
  {
    token: 'return \n{ 1, 2, 3 }',
    kind: 'multilinestringliteral',
    indentations: [],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 25,
  },
);

lexer = new Lexer("'''return \r\n{ 1, 2, 3 }'''");
result = lexer.multiLineStringLiteral();
test(
  String.raw`'''return \r\n{ 1, 2, 3 }'''`,
  result,
  {
    token: 'return \r\n{ 1, 2, 3 }',
    kind: 'multilinestringliteral',
    indentations: [],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 26,
  },
);

lexer = new Lexer("'''return \n{ 1, \n    2, \n        3 }\n    '''");
result = lexer.multiLineStringLiteral();
test(
  String.raw`'''return \n{ 1, \n    2, \n        3 }\n    '''`,
  result,
  {
    token: 'return \n{ 1, \n    2, \n        3 }\n    ',
    kind: 'multilinestringliteral',
    indentations: [4, 8, 4],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 44,
  },
);


lexer = new Lexer('"""return \n{ 1, 2, 3 }"""');
result = lexer.multiLineStringLiteral();
test(
  String.raw`"""return \n{ 1, 2, 3 }"""`,
  result,
  {
    token: 'return \n{ 1, 2, 3 }',
    kind: 'multilinestringliteral',
    indentations: [],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 25,
  },
);

lexer = new Lexer('"""return \r\n{ 1, 2, 3 }"""');
result = lexer.multiLineStringLiteral();
test(
  String.raw`"""return \r\n{ 1, 2, 3 }"""`,
  result,
  {
    token: 'return \r\n{ 1, 2, 3 }',
    kind: 'multilinestringliteral',
    indentations: [],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 26,
  },
);

lexer = new Lexer('"""return \n{ 1, \n    2, \n        3 }\n    """');
result = lexer.multiLineStringLiteral();
test(
  String.raw`"""return \n{ 1, \n    2, \n        3 }\n    """`,
  result,
  {
    token: 'return \n{ 1, \n    2, \n        3 }\n    ',
    kind: 'multilinestringliteral',
    indentations: [4, 8, 4],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 44,
  },
);

print('============== REGEXLITERAL ==============');
lexer = new Lexer('//');
result = lexer.regexLiteral();
test(
  String.raw`//--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('//hello\nworld//');
result = lexer.regexLiteral();
test(
  String.raw`//hello\nworld//--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('//hello\\\\');
result = lexer.regexLiteral();
test(
  String.raw`//hello\\--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('////');
result = lexer.regexLiteral();
test(
  String.raw`////`,
  result,
  {
    token: '',
    kind: 'regexliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('//Wanna (eat){3} Π*//');
result = lexer.regexLiteral();
test(
  String.raw`//Wanna (eat){3} Π*//`,
  result,
  {
    token: 'Wanna (eat){3} Π*',
    kind: 'regexliteral',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 21,
  },
);

print('============== SINGLELINECOMMENT ==============');
lexer = new Lexer('# Hello World\nHi World');
result = lexer.singleLineComment();
test(
  String.raw`# Hello World\nHi World--------->MID`,
  result,
  {
    token: ' Hello World',
    kind: 'singlelinecomment',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 13,
  },
);

lexer = new Lexer('#');
result = lexer.singleLineComment();
test(
  String.raw`#`,
  result,
  {
    token: '',
    kind: 'singlelinecomment',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 1,
  },
);

lexer = new Lexer('# Wanna eat Π?');
result = lexer.singleLineComment();
test(
  String.raw`# Wanna eat Π?`,
  result,
  {
    token: ' Wanna eat Π?',
    kind: 'singlelinecomment',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 14,
  },
);

lexer = new Lexer('#: Int, Str -> Int');
result = lexer.singleLineComment();
test(
  String.raw`#: Int, Str -> Int`,
  result,
  {
    token: ': Int, Str -> Int',
    kind: 'singlelinecomment',
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 18,
  },
);

print('============== INNERMULTILINECOMMENT ==============');
lexer = new Lexer('#=');
result = lexer.innerMultiLineComment();
test(
  String.raw`#--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('#= name');
result = lexer.innerMultiLineComment();
test(
  String.raw`#= name--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('#= outer\n#= inner =# #');
result = lexer.innerMultiLineComment();
test(
  String.raw`#= outer\n#= inner =# #--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('#==#');
result = lexer.innerMultiLineComment();
test(
  String.raw`#==#`,
  result,
  {
    token: '#==#',
    kind: 'innermultilinecomment',
    indentations: [],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('#= hello # world =#');
result = lexer.innerMultiLineComment();
test(
  String.raw`#= hello # world =#`,
  result,
  {
    token: '#= hello # world =#',
    kind: 'innermultilinecomment',
    indentations: [],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 19,
  },
);

lexer = new Lexer('#= hello #= inner hello =# world =#');
result = lexer.innerMultiLineComment();
test(
  String.raw`#= hello #= inner hello =# world =#`,
  result,
  {
    token: '#= hello #= inner hello =# world =#',
    kind: 'innermultilinecomment',
    indentations: [],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 35,
  },
);

lexer = new Lexer('#= hello \n    #= inner hello \r\n #= \n   another nest =#        =# world =#');
result = lexer.innerMultiLineComment();
test(
  String.raw`#= hello \n    #= inner hello \r\n #= \n   another nest =#        =# world =#`,
  result,
  {
    token: '#= hello \n    #= inner hello \r\n #= \n   another nest =#        =# world =#',
    kind: 'innermultilinecomment',
    indentations: [4, 1, 3],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 73,
  },
);

print('============== MULTILINECOMMENT ==============');
lexer = new Lexer('#=');
result = lexer.multiLineComment();
test(
  String.raw`#--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('#= name');
result = lexer.multiLineComment();
test(
  String.raw`#= name--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('#= name =# hello');
result = lexer.multiLineComment();
test(
  String.raw`#= name =# hello--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('#= outer\n#= inner =# #');
result = lexer.multiLineComment();
test(
  String.raw`#= outer\n#= inner =# #--------->FAIL`,
  result,
  null,
);

lexer = new Lexer('#==#');
result = lexer.multiLineComment();
test(
  String.raw`#==#`,
  result,
  {
    token: '',
    kind: 'multilinecomment',
    indentations: [],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 4,
  },
);

lexer = new Lexer('#= hello # world =#');
result = lexer.multiLineComment();
test(
  String.raw`#= hello # world =#`,
  result,
  {
    token: ' hello # world ',
    kind: 'multilinecomment',
    indentations: [],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 19,
  },
);

lexer = new Lexer('#= hello #= inner hello =# world =#');
result = lexer.multiLineComment();
test(
  String.raw`#= hello #= inner hello =# world =#`,
  result,
  {
    token: ' hello #= inner hello =# world ',
    kind: 'multilinecomment',
    indentations: [],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 35,
  },
);

lexer = new Lexer('#= hello \n    #= inner hello \r\n #= \n   another nest =#        =# world =#');
result = lexer.multiLineComment();
test(
  String.raw`#= hello \n    #= inner hello \r\n #= \n   another nest =#        =# world =#`,
  result,
  {
    token: ' hello \n    #= inner hello \r\n #= \n   another nest =#        =# world ',
    kind: 'multilinecomment',
    indentations: [4, 1, 3],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 73,
  },
);

lexer = new Lexer('#= hello #=\n   inner hello\n =# world =#   \r\n');
result = lexer.multiLineComment();
test(
  String.raw`#= hello #=\n   inner hello\n =# world =#   \r\n`,
  result,
  {
    token: ' hello #=\n   inner hello\n =# world ',
    kind: 'multilinecomment',
    indentations: [3, 1],
    startLine: 1,
    stopLine: 1,
    startColumn: 0,
    stopColumn: 42,
  },
);

print('============== LEX ==============');
lexer = new Lexer("45 46. .56 0x5F.0p+F 'hello' \"world\"");
result = lexer.lex();
test(
  String.raw`45 46. .56 0x5F.e+F 'hello' "world"`,
  result,
  [
    {
      token: '45',
      kind: 'integerdecimalliteral',
      startLine: 1,
      stopLine: 1,
      startColumn: 0,
      stopColumn: 2,
    },
    {
      token: '46.0',
      kind: 'floatdecimalliteral',
      startLine: 1,
      stopLine: 1,
      startColumn: 3,
      stopColumn: 6,
    },
    {
      token: '0.56',
      kind: 'floatdecimalliteral',
      startLine: 1,
      stopLine: 1,
      startColumn: 7,
      stopColumn: 10,
    },
    {
      token: '5F.0p+F',
      kind: 'floathexadecimalliteral',
      startLine: 1,
      stopLine: 1,
      startColumn: 11,
      stopColumn: 20,
    },
    {
      token: 'hello',
      kind: 'singlelinestringliteral',
      startLine: 1,
      stopLine: 1,
      startColumn: 21,
      stopColumn: 28,
    },
    {
      token: 'world',
      kind: 'singlelinestringliteral',
      startLine: 1,
      stopLine: 1,
      startColumn: 29,
      stopColumn: 36,
    },
  ],
);

lexer = new Lexer('hello 45');
result = lexer.lex();
test(
  String.raw`hello 45`,
  result,
  [
    {
      token: 'hello',
      kind: 'identifier',
      startLine: 1,
      stopLine: 1,
      startColumn: 0,
      stopColumn: 5,
    },
    {
      token: '45',
      kind: 'integerdecimalliteral',
      startLine: 1,
      stopLine: 1,
      startColumn: 6,
      stopColumn: 8,
    },
  ],
);

lexer = new Lexer('hello \n 45 \r\n');
result = lexer.lex();
test(
  String.raw`hello \n 45 \r\n`,
  result,
  [
    {
      token: 'hello',
      kind: 'identifier',
      startLine: 1,
      stopLine: 1,
      startColumn: 0,
      stopColumn: 5,
    },
    {
      token: '',
      kind: 'newline',
      startLine: 1,
      stopLine: 1,
      startColumn: 6,
      stopColumn: 7,
    },
    {
      token: '45',
      kind: 'integerdecimalliteral',
      startLine: 1,
      stopLine: 1,
      startColumn: 8,
      stopColumn: 10,
    },
    {
      token: '',
      kind: 'newline',
      startLine: 1,
      stopLine: 1,
      startColumn: 11,
      stopColumn: 13,
    },
  ],
);

module.exports = test;
