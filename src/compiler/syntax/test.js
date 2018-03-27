/* eslint-disable no-underscore-dangle, max-len */
const { print } = require('../utils');
const Parser = require('./parser');

print('========= ARBITRARYTOKEN =========');

print(String.raw` var>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser(' var').parseToken('var')); // fail

print(String.raw`funobj>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('funobj').parseToken('fun')); // mid

print(String.raw`let`);
print(new Parser('let').parseToken('let'));

print(String.raw`var`);
print(new Parser('var').parseToken('var'));

print(String.raw`name`);
print(new Parser('name').parseToken('name'));

print('========= EOI =========');

print(String.raw` 56>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser(' 56').parseEoi()); // fail

print(String.raw``);
print(new Parser('').parseEoi());

print('========= INTEGERBINARYLITERAL =========');

print(String.raw`01_01>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('01_01').parseIntegerBinaryLiteral()); // fail

print(String.raw`0b2_01>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0b2_01').parseIntegerBinaryLiteral()); // fail

print(String.raw`0b1_087>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0b1_087').parseIntegerBinaryLiteral()); // mid

print(String.raw`0b0__11>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0b0__11').parseIntegerBinaryLiteral()); // mid

print(String.raw`0b10011`);
print(new Parser('0b10011').parseIntegerBinaryLiteral());

print(String.raw`0b10_011_001`);
print(new Parser('0b10_011_001').parseIntegerBinaryLiteral());

print('========= INTEGEROCTALLITERAL =========');

print(String.raw`05_45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('05_45').parseIntegerOctalLiteral()); // fail

print(String.raw`0o8_45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0o8_45').parseIntegerOctalLiteral()); // fail

print(String.raw`0o1_087>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0o1_087').parseIntegerOctalLiteral()); // mid

print(String.raw`0o5__45>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0o5__45').parseIntegerOctalLiteral()); // mid

print(String.raw`0o5459`);
print(new Parser('0o5459').parseIntegerOctalLiteral());

print(String.raw`0o5_45_06`);
print(new Parser('0o5_45_06').parseIntegerOctalLiteral());

print('========= INTEGERHEXADECIMALLITERAL =========');

print(String.raw`0F_F6>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0F_F6').parseIntegerHexadecimalLiteral()); // fail

print(String.raw`0xG_FF>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0xG_FF').parseIntegerHexadecimalLiteral()); // fail

print(String.raw`0x1_9FG>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0x1_9FG').parseIntegerHexadecimalLiteral()); // mid

print(String.raw`0xf__FFE>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0xf__FFE').parseIntegerHexadecimalLiteral()); // mid

print(String.raw`0xffe5`);
print(new Parser('0xffe5').parseIntegerHexadecimalLiteral());

print(String.raw`0x5f_ee_0561`);
print(new Parser('0x5f_ee_0561').parseIntegerHexadecimalLiteral());

print('========= INTEGERDECIMALLITERAL =========');

print(String.raw`5__45>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('5__45').parseIntegerDecimalLiteral()); // mid

print(String.raw`05459`);
print(new Parser('05459').parseIntegerDecimalLiteral());

print(String.raw`5_45`);
print(new Parser('5_45').parseIntegerDecimalLiteral());

print(String.raw`5_45_09`);
print(new Parser('5_45_09').parseIntegerDecimalLiteral());

print('========= INTEGERLITERAL =========');

print(String.raw`0b_FF>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0b_FF').parseIntegerLiteral()); // mid

print(String.raw`0F_F6>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0F_F6').parseIntegerLiteral()); // mid

print(String.raw`0x1_9FG>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0x1_9FG').parseIntegerLiteral()); // mid

print(String.raw`0b1__1011>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0b1__1011').parseIntegerLiteral()); // mid

print(String.raw`0x1`);
print(new Parser('0x1').parseIntegerLiteral());

print(String.raw`0xffe5`);
print(new Parser('0xffe5').parseIntegerLiteral());

print(String.raw`0o56_77_074_667`);
print(new Parser('0o56_77_074_667').parseIntegerLiteral());

print(String.raw`056_77_074_667`);
print(new Parser('056_77_074_667').parseIntegerLiteral());

print('========= FLOATBINARYLITERAL =========');

print(String.raw`01_01.01>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('01_01.01').parseFloatBinaryLiteral()); // fail

print(String.raw`0b2e5_01>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0b2e5_01').parseFloatBinaryLiteral()); // fail

print(String.raw`0b1e1_087>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0b1e1_087').parseFloatBinaryLiteral()); // mid

print(String.raw`0b0.101__11>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0b0.101__11').parseFloatBinaryLiteral()); // mid

print(String.raw`0b1_10.01_110e-1_00`);
print(new Parser('0b1_10.01_110e-1_00').parseFloatBinaryLiteral());

print(String.raw`0b10_01e+1_001`);
print(new Parser('0b10_01e+1_001').parseFloatBinaryLiteral());

print('========= FLOATOCTALLITERAL =========');

print(String.raw`05_45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('05_45').parseFloatOctalLiteral()); // fail

print(String.raw`0o8_45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0o8_45').parseFloatOctalLiteral()); // fail

print(String.raw`0o5__.33_45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0o5__.33_45').parseFloatOctalLiteral()); // fail

print(String.raw`0o1.7_0e487>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0o1.7_0e487').parseFloatOctalLiteral()); // mid

print(String.raw`0o5.7__e33_45>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0o5.7__e33_45').parseFloatOctalLiteral()); // mid

print(String.raw`0o54_33.59`);
print(new Parser('0o54_33.59').parseFloatOctalLiteral());

print(String.raw`0o5_45_0e+2_6`);
print(new Parser('0o5_45_0e+2_6').parseFloatOctalLiteral());

print('========= FLOATHEXADECIMALLITERAL =========');

print(String.raw`0F_F6>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0E_F6').parseFloatHexadecimalLiteral()); // fail

print(String.raw`0xG_FF>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0xG_FF').parseFloatHexadecimalLiteral()); // fail

print(String.raw`0x5__.33_45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0x5__.33_45').parseFloatOctalLiteral()); // fail

print(String.raw`0x1_23f.1_9FHG>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0x1_23f.1_9FHG').parseFloatHexadecimalLiteral()); // mid

print(String.raw`0xf.e5__FFE>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0xf.e5__FFE').parseFloatHexadecimalLiteral()); // mid

print(String.raw`0xff.01p-5A`);
print(new Parser('0xff.01p-5A').parseFloatHexadecimalLiteral());

print(String.raw`0x5f_ee.29_00p1_0561`);
print(new Parser('0x5f_ee.29_00p1_0561').parseFloatHexadecimalLiteral());

print('========= FLOATDECIMALLITERAL =========');

print(String.raw`5__45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('5__45').parseFloatDecimalLiteral()); // fail

print(String.raw`05_67.5e+400.45>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('05_67.5e+400.45').parseFloatDecimalLiteral()); // mid

print(String.raw`.59e-11`);
print(new Parser('.59e-11').parseFloatDecimalLiteral());

print(String.raw`054.59`);
print(new Parser('054.59').parseFloatDecimalLiteral());

print(String.raw`5_4.0_33e-5_99`);
print(new Parser('5_4.0_33e-5_99').parseFloatDecimalLiteral());

print(String.raw`5_45_0.9`);
print(new Parser('5_45_0.9').parseFloatDecimalLiteral());

print(String.raw`5_45_0e9`);
print(new Parser('5_45_0e9').parseFloatDecimalLiteral());

print('========= FLOATLITERAL =========');

print(String.raw`ff.56_FF>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('ff.56_FF').parseFloatLiteral()); // fail

print(String.raw`0x1ffe-2_9FG>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0x1ffe-2_9FG').parseFloatLiteral()); // fail

print(String.raw`0b1__1011>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0b1__1011').parseFloatLiteral()); // fail

print(String.raw`0b0.11_FF>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0b0.11_FF').parseFloatLiteral()); // mid

print(String.raw`02.2eF_F6>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('02.2eF_F6').parseFloatLiteral()); // mid

print(String.raw`0x10.56_p5`);
print(new Parser('0x10.56_p5').parseFloatLiteral());

print(String.raw`0b1_10.01_110e-1_00`);
print(new Parser('0b1_10.01_110e-1_00').parseFloatBinaryLiteral());

print(String.raw`0xffep5`);
print(new Parser('0xffep5').parseFloatLiteral());

print(String.raw`0o56_77_0.74_66e7`);
print(new Parser('0o56_77_0.74_66e7').parseFloatLiteral());

print(String.raw`056_77_0.74_667`);
print(new Parser('056_77_0.74_667').parseFloatLiteral());

print(String.raw`.200`);
print(new Parser('.200').parseFloatLiteral());

print('========= NUMERICLITERAL =========');

print(String.raw`ff.56_FF>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('ff.56_FF').parseNumericLiteral()); // fail

print(String.raw`.59e+11`);
print(new Parser('.59e+11').parseNumericLiteral());

print(String.raw`054.59`);
print(new Parser('054.59').parseNumericLiteral());

print(String.raw`0x5f_ee.29_00p1_0561`);
print(new Parser('0x5f_ee.29_00p1_0561').parseNumericLiteral());

print(String.raw`0o54_33.59`);
print(new Parser('0o54_33.59').parseNumericLiteral());

print(String.raw`0o5_45_06`);
print(new Parser('0o5_45_06').parseNumericLiteral());

print(String.raw`0x5`);
print(new Parser('0x5').parseNumericLiteral());

print(String.raw`0b10_011_001`);
print(new Parser('0b10_011_001').parseNumericLiteral());

print('========= COEFFICIENTEXPRESSION =========');

print(String.raw`0x55f>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0x55f').parseCoefficientExpression()); // fail

print(String.raw`0x55.afj>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0x55.afj').parseCoefficientExpression()); // fail

print(String.raw`0b01>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0b01').parseCoefficientExpression()); // fail

print(String.raw`02.455f_name2+>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('02.455f_name2+').parseCoefficientExpression()); // mid

print(String.raw`0b01_1e11e`);
print(new Parser('0b01_1e11e').parseCoefficientExpression());

print(String.raw`02.2e002e`);
print(new Parser('02.2e002e').parseCoefficientExpression());

print(String.raw`0b1__1011`);
print(new Parser('0b1__1011').parseCoefficientExpression());

print(String.raw`0o775o`);
print(new Parser('0o775o').parseCoefficientExpression());

print('========= BOOLEANLITERAL =========');

print(String.raw`0true>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0true').parseBooleanLiteral()); // fail

print(String.raw`_false>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('_false').parseBooleanLiteral()); // mid

print(String.raw`truename>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('truename').parseBooleanLiteral()); // mid

print(String.raw`false20>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('false20').parseBooleanLiteral()); // mid

print(String.raw`true`);
print(new Parser('true').parseBooleanLiteral());

print(String.raw`false`);
print(new Parser('false').parseBooleanLiteral());

print('========= NONAME =========');

print(String.raw`0true>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('0true').parseNoName()); // fail

print(String.raw`_false>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('_false').parseNoName()); // mid

print(String.raw`_`);
print(new Parser('_').parseNoName());

print('========= IDENTIFIER =========');

print(String.raw` name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser(' name').parseIdentifier()); // fail

print('>>>>>>>>>>>>>>>>>>>>>>>>FAIL'); // fail
print(new Parser('').parseIdentifier()); // fail

print(String.raw`99name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('99name').parseIdentifier()); // fail

print(String.raw`if>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('if').parseIdentifier()); // fail

print(String.raw`for>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('for').parseIdentifier()); // fail

print(String.raw`name__55 nom>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('name__55  nom').parseIdentifier()); // mid

print(String.raw`_na99_me_`);
print(new Parser('_na99_me_').parseIdentifier());

print(String.raw`elsea`);
print(new Parser('elsea').parseIdentifier());

print('========= OPERATOR =========');

print(String.raw`//-+>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser("//-+").parseOperator()); // fail

print(String.raw`>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser("").parseOperator()); // fail

print(String.raw`-+/re/>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("-+/re/").parseOperator()); // mid

print(String.raw`-+//++>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("-+//++").parseOperator()); // mid

print(String.raw`-+`);
print(new Parser("-+").parseOperator());

print(String.raw`/-+`);
print(new Parser("/-+").parseOperator());

print(String.raw`-+/`);
print(new Parser("-+/").parseOperator());

print(String.raw`+++`);
print(new Parser('+++').parseOperator());

print(String.raw`++/`);
print(new Parser('++/').parseOperator());

print(String.raw`++**&**/de/`);
print(new Parser('++**&**/de/').parseOperator());

print(String.raw`++**&**/+=`);
print(new Parser('++**&**/+=').parseOperator());

print(String.raw`++**&**/+=`);
print(new Parser('++**&**/+=').parseOperator());

print('========= CHARSNONEWLINEORSINGLEQUOTE =========');

print(String.raw`>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('').parseCharsNoNewlineOrSingleQuote()); // fail

print(String.raw`'>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser("'").parseCharsNoNewlineOrSingleQuote()); // fail

print(String.raw`nam:e2*9s)!@'@34>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("nam:e2*9s)!@'@34").parseCharsNoNewlineOrSingleQuote()); // mid

print(String.raw`nam:e2*9s)!@\n6%a>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@\n6%a').parseCharsNoNewlineOrSingleQuote()); // mid

print(String.raw`25fse?w&$32"67`);
print(new Parser('25fse?w&$32"67').parseCharsNoNewlineOrSingleQuote());

print('========= CHARSNONEWLINEORDOUBLEQUOTE =========');

print(String.raw`>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('').parseCharsNoNewlineOrDoubleQuote()); // fail

print(String.raw`">>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('"').parseCharsNoNewlineOrDoubleQuote()); // fail

print(String.raw`nam:e2*9s)!@"@34>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@"@34').parseCharsNoNewlineOrDoubleQuote()); // mid

print(String.raw`nam:e2*9s)!@\n6%a>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@\n6%a').parseCharsNoNewlineOrDoubleQuote()); // mid

print(String.raw`25fse?w&$32'67`);
print(new Parser("25fse?w&$32'67").parseCharsNoNewlineOrDoubleQuote());

print('========= CHARSNONEWLINEORTRIPLESINGLEQUOTE =========');

print(String.raw`>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('').parseCharsNoNewlineOrTripleSingleQuote()); // fail

print(String.raw`'''>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser("'''").parseCharsNoNewlineOrTripleSingleQuote()); // fail

print(String.raw`nam:e2*9s)!@'''@34>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("nam:e2*9s)!@'''@34").parseCharsNoNewlineOrTripleSingleQuote()); // mid

print(String.raw`nam:e2*9s)!@\n6%a>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@\n6%a').parseCharsNoNewlineOrTripleSingleQuote()); // mid

print(String.raw`25fse?w&$32"""67`);
print(new Parser('25fse?w&$32"""67').parseCharsNoNewlineOrTripleSingleQuote());

print('========= CHARSNONEWLINEORTRIPLEDOUBLEQUOTE =========');

print(String.raw`>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('').parseCharsNoNewlineOrTripleDoubleQuote()); // fail

print(String.raw`""">>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('"""').parseCharsNoNewlineOrTripleDoubleQuote()); // fail

print(String.raw`nam:e2*9s)!@"""@34>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@"""@34').parseCharsNoNewlineOrTripleDoubleQuote()); // mid

print(String.raw`nam:e2*9s)!@\n6%a>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@\n6%a').parseCharsNoNewlineOrTripleDoubleQuote()); // mid

print(String.raw`25fse?w&$32'''67`);
print(new Parser("25fse?w&$32'''67").parseCharsNoNewlineOrTripleDoubleQuote());

print('========= CHARSNOHASHEQUAL =========');

print(String.raw`>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('').parseCharsNoHashEqual()); // fail

print(String.raw`=#>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('=#').parseCharsNoHashEqual()); // fail

print(String.raw`#=>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('#=').parseCharsNoHashEqual()); // fail

print(String.raw`nam:e2*9s)!@=#@34>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@=#@34').parseCharsNoHashEqual()); // mid

print(String.raw`nam:e2*9s)!@#=@34>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@#=@34').parseCharsNoHashEqual()); // mid

print(String.raw`nam:e2*9s)!@\n6%a`);
print(new Parser('nam:e2*9s)!@\n6%a').parseCharsNoHashEqual());

print(String.raw`25fse?w&$32#67`);
print(new Parser('25fse?w&$32#67').parseCharsNoHashEqual());

print(String.raw`25fse?w&$32# =67`);
print(new Parser('25fse?w&$32# =67').parseCharsNoHashEqual());

print('========= CHARSNONEWLINE =========');

print(String.raw`>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('').parseCharsNoNewline()); // fail

print(String.raw`\n>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('\n').parseCharsNoNewline()); // fail

print(String.raw`nam:e2*9s)!@\n6%a>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@\n6%a').parseCharsNoNewline()); // mid

print(String.raw`25fse?w&$32#\r67`);
print(new Parser('25fse?w&$32#\r67').parseCharsNoNewline());

print('========= CHARSNONEWLINEORFORWARDSLASH =========');

print(String.raw`>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('').parseCharsNoNewlineOrForwardSlash()); // fail

print(String.raw`/>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('/').parseCharsNoNewlineOrForwardSlash()); // fail

print(String.raw`nam:e2*9s)!@/@34>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@/@34').parseCharsNoNewlineOrForwardSlash()); // mid

print(String.raw`nam:e2*9s)!@\n6%a>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('nam:e2*9s)!@\n6%a').parseCharsNoNewlineOrForwardSlash()); // mid

print(String.raw`25fse?w&$3267`);
print(new Parser('25fse?w&$3267').parseCharsNoNewlineOrForwardSlash());

print('========= INDENT =========');

print(String.raw`     •>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('     •').parseIndent()); // fail

print(String.raw`    •`);
print(new Parser('    *').parseIndent());

print('========= SAMEDENT =========');

print(String.raw`    •>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('    •').parseSamedent());

print(String.raw`•`);
print(new Parser('•').parseSamedent());

print('========= DEDENT =========');

print(String.raw`    •>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('    •').parseDedent()); // fail

print(String.raw`•`);
print((() => {
  const parser = new Parser('•');
  parser.lastIndentCount = 1; // Increase indent count.
  return parser.parseDedent();
})());

print('========= NEWLINE =========');

print(String.raw`\t\n>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('\t\n').parseNewline()); // fail

print(String.raw`\r\n`);
print(new Parser('\r\n').parseNewline());

print(String.raw`\n`);
print(new Parser('\n').parseNewline());

print('========= NEXTLINE =========');

print(String.raw`\t\n>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('\t\n').parseNextLine()); // fail

print(String.raw`\n\n    \n        >>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print((() => { // mid
  const parser = new Parser('\n\n    \n        ');
  parser.parseNextLine();
  print(parser.lastPosition);
  parser.lastPosition = -1;
  return parser.parseNextLine();
})());

print(String.raw`\r\n`);
print(new Parser('\r\n').parseNextLine());

print(String.raw`\n`);
print(new Parser('\n').parseNextLine());

print(String.raw`\n   \r\n`);
print(new Parser('\n   \r\n').parseNextLine());

print('========= SINGLELINECOMMENT =========');

print(String.raw`#hello world 99 @v !?\t66\n`);
print(new Parser('#hello world 99 @v !?\t66\n').parseSingleLineComment());

print(String.raw`#hello world 99 @v !?\t66`);
print(new Parser('#hello world 99 @v !?\t66').parseSingleLineComment());

print('========= MULTILINECOMMENT =========');

print(String.raw`#=hello world 99>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('#=hello world 99').parseMultiLineComment()); // fail

print(String.raw`#=hello world #= hi =# 99>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('#=hello world #= hi =# 99').parseMultiLineComment()); // fail

print(String.raw`#=hello world 99=#hello>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('#=hello world 99=#hello').parseMultiLineComment()); // fail

print(String.raw`#=hello world 99=#`);
print(new Parser('#=hello world 99=#').parseMultiLineComment());

print(String.raw`#=hello #=world 99=# @v m346 66j6h=#\n`);
print(new Parser('#=hello #=world 99=# @v m346 66j6h=#\n').parseMultiLineComment());

print(String.raw`#=hello #=world 99=# @v m346 66j6h=#     \n`);
print(new Parser('#=hello #=world 99=# @v m346 66j6h=#     \n').parseMultiLineComment());

print('========= COMMENT =========');

print(String.raw`#=hello world 99>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('#=hello world 99').parseComment()); // fail

print(String.raw`#hello world 99`);
print(new Parser('#hello world 99').parseComment());

print(String.raw`#=hello world 99=#`);
print(new Parser('#=hello world 99=#').parseComment());

print(String.raw`#=hello #=world 99=# @v m346 66j6h=#\n`);
print(new Parser('#=hello #=world 99=# @v m346 66j6h=#\n').parseComment());

print(String.raw`#=hello #=world 99=# @v m346 66j6h=#     \n`);
print(new Parser('#=hello #=world 99=# @v m346 66j6h=#     \n').parseComment());

print('========= NEXTCODELINE =========');

print(String.raw`#hello world 99>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('#hello world 99').parseNextCodeLine()); // fail

print(String.raw`\n#hello world 99`);
print(new Parser('\n#hello world 99').parseNextCodeLine());

print(String.raw`\n`);
print(new Parser('\n').parseNextCodeLine());

print(String.raw`\n#hello world 99\n  \r\n#99 world hello`);
print(new Parser('\n#hello world 99\n  \r\n#hello world 99').parseNextCodeLine());

print(String.raw`\n#=hello    \n#=world 99\n  \r\n=#99 world hello=#\n   \n`);
print(new Parser('\n#=hello    \n#=world 99\n  \r\n=#99 world hello=#\n   \n').parseNextCodeLine());

print('========= DEDENTOREOIEND =========');

print(String.raw`\n        •>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('\n        •');
  parser.lastIndentCount = 2; // Two indent levels.
  return parser.parseDedentOrEoiEnd();
})());

print(String.raw`    •>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('    •');
  parser.lastIndentCount = 2; // Two indent levels.
  return parser.parseDedentOrEoiEnd();
})());

print(String.raw`\n`);
print(new Parser('\n').parseDedentOrEoiEnd());

print(String.raw`\n#hello world`);
print(new Parser('\n#hello world').parseDedentOrEoiEnd());

print(String.raw`\n    •`);
print((() => {
  const parser = new Parser('\n    •');
  parser.lastIndentCount = 2; // Two indent levels.
  return parser.parseDedentOrEoiEnd();
})());

print('========= LINECONTINUATION =========');

print(String.raw`...>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('...').parseLineContinuation()); // fail

print(String.raw`...\n    •>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('...\n    •');
  parser.lastIndentCount = 2; // Two indent levels.
  return parser.parseLineContinuation();
})());

print(String.raw`...\n    •`);
print((() => {
  const parser = new Parser('...\n    •');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseLineContinuation();
})());

print(String.raw`...\n`);
print(new Parser('...\n').parseLineContinuation());

print(String.raw`... \r\n`);
print(new Parser('... \r\n').parseLineContinuation());

print('========= SPACES =========');

print(String.raw`>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('').parseSpaces()); // fail

print(String.raw`/>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('/').parseSpaces()); // fail

print(String.raw`\t   \t\n>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('\t   \t\n').parseSpaces()); // mid

print(String.raw` \t >>>>>>>>>>>>>>>>>>>>>>>>MID`);
print(new Parser(' \t ').parseSpaces());

print(String.raw` `);
print(new Parser(' ').parseSpaces());

print('========= _ =========');

print(String.raw`...>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('...').parse_()); // fail

print(String.raw`...\n    •>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('...\n    •');
  parser.lastIndentCount = 2; // Two indent levels.
  return parser.parse_();
})());

print(String.raw`...\n    •`);
print((() => {
  const parser = new Parser('...\n    •');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parse_();
})());

print(String.raw`\n  \n    •`);
print((() => {
  const parser = new Parser('\n    •');
  parser.lastIndentCount = 1; // One indent level.
  parser.ignoreNewline = true;
  return parser.parse_();
})());

print(String.raw`  \t \t`);
print(new Parser('  \t \t').parse_());

print(String.raw`\t    `);
print(new Parser('\t    ').parse_());

print('========= SINGLELINESTRINGLITERAL =========');

print(String.raw`">>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('"').parseSingleLineStringLiteral()); // fail

print(String.raw`'hello world'`);
print(new Parser("'hello world'").parseSingleLineStringLiteral());

print(String.raw`"hello world"`);
print(new Parser('"hello world"').parseSingleLineStringLiteral());

print(String.raw`''`);
print(new Parser("''").parseSingleLineStringLiteral());

print('========= MULTILINESTRINGLITERAL =========');

print(String.raw`'''>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser("'''").parseMultiLineStringLiteral()); // fail

print(String.raw`"""\n    hello world\n""">>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('"""\n    hello world\n"""');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseMultiLineStringLiteral();
})());

print(String.raw`"""hello\nworld\n    """>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('"""hello\nworld\n    """').parseMultiLineStringLiteral()); // fail

print(String.raw`"""\n    hello world\n        """>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('"""\n    hello world\n        """');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseMultiLineStringLiteral();
})());

print(String.raw`"""\n    hello world\n    """`);
print((() => {
  const parser = new Parser('"""\n    hello world\n    """');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseMultiLineStringLiteral();
})());

print(String.raw`'''hello\nworld'''`);
print(new Parser("'''hello\nworld'''").parseMultiLineStringLiteral());

print(String.raw`"""hello\nworld\n"""`);
print(new Parser('"""hello\nworld\n"""').parseMultiLineStringLiteral());

print(String.raw`""""""`);
print(new Parser('""""""').parseMultiLineStringLiteral());

print('========= STRINGLITERAL =========');

print(String.raw`'''>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("'''").parseStringLiteral()); // mid

print(String.raw`"""\n    hello world\n    """`);
print((() => {
  const parser = new Parser('"""\n    hello world\n    """');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseStringLiteral();
})());

print(String.raw`'''hello\nworld'''`);
print(new Parser("'''hello\nworld'''").parseStringLiteral());

print(String.raw`"hello world"`);
print(new Parser('"hello world"').parseStringLiteral());

print(String.raw`""`);
print(new Parser('""').parseStringLiteral());

print('========= REGEXLITERAL =========');

print(String.raw`/\\d+\n/>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('/\\d+\n/').parseRegexLiteral()); // fail

print(String.raw`/age / name />>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('/age / name /').parseRegexLiteral()); // mid

print(String.raw`/[0-9a-z]+\\d+/`);
print(new Parser('/[0-9a-z]+\\d+/').parseRegexLiteral());

print(String.raw`//`);
print(new Parser('//').parseRegexLiteral());

print('========= _COMMA =========');

print(String.raw`,`);
print(new Parser(',').parse_Comma());

print(String.raw`\t\t  ,`);
print(new Parser('\t\t  ,').parse_Comma());

print('========= LISTARGUMENTS =========');

print(String.raw`[1, 2],[3, 4]`);
print(new Parser('[1, 2],[3, 4]').parseListArguments());

print(String.raw`.1, 'string', /\\d+/, 5_000`);
print(new Parser(".1, 'string', /\\d+/, 5_000").parseListArguments());

print(String.raw`.1,['hi','hello'],'string',/\\d+/,5_000`);
print(new Parser(".1,['hi','hello'],'string',/\\d+/,5_000").parseListArguments());

print('========= LISTARGUMENTSMULTIPLE =========');

print(String.raw`[1, 2] [3, 4]>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('[1, 2] [3, 4]').parseListArgumentsMultiple()); // mid

print(String.raw`[1, 2]\n[3, 4],[5, 6]>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('[1, 2]\n[3, 4],[5, 6]').parseListArgumentsMultiple()); // mid

print(String.raw`[1, 2]\n[3, 4]`);
print(new Parser('[1, 2]\n[3, 4]').parseListArgumentsMultiple());

print(String.raw`1, 2; 3, 4`);
print(new Parser('1, 2; 3, 4').parseListArgumentsMultiple());

print(String.raw`.1,['hi','hello'],'string',/\\d+/,5_000`);
print(new Parser(".1,['hi','hello'],'string',/\\d+/,5_000").parseListArgumentsMultiple());

print('========= LISTLITERAL ========='); // TODO: Incomplete

print(String.raw`[]`);
print(new Parser('[]').parseListLiteral());

print(String.raw`[ 20, /hello/\n,45,"hi"]`);
print(new Parser('[ 20, /hello/\n,45,"hi"]').parseListLiteral());

print(String.raw`[[1, 2]\n[3, 4]]`);
print(new Parser('[[1, 2]\n[3, 4]]').parseListLiteral());

print(String.raw`[\n    [1, 2]\n    [3, 4]\n]`);
print(new Parser('[\n    [1, 2]\n    [3, 4]\n]').parseListLiteral());

print(String.raw`[1, 2; 3, 4]`);
print(new Parser('[1, 2; 3, 4]').parseListLiteral());

print(String.raw`[.1,['hi','hello'],'string',/\\d+/,5_000,]`);
print(new Parser("[.1,['hi','hello'],'string',/\\d+/,5_000,]").parseListLiteral());

print('========= OBJECTARGUMENT =========');

print(String.raw`"name": "john"\n•>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('"name": "john"\n•').parseObjectArgument()); // fail

print(String.raw`age: 50,`);
print(new Parser('age: 50,').parseObjectArgument());

print(String.raw`value: 1_000e24,`);
print(new Parser('value: 1_000e24,').parseObjectArgument());

print(String.raw`value: {\n    price: 1_000e24\n}\n•`);
print(new Parser('value: {\n    price: 1_000e24\n}\n•').parseObjectArgument());

print('========= OBJECTARGUMENTS =========');

print(String.raw`sage: "Damien", 50, name: "Tosin">>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('sage: "Damien", 50, name: "Tosin"').parseObjectArguments()); // mid

print(String.raw`sage: "Damien", name:  {\n    nom :"Tosin",  \n}>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid (no eoi lookup)
print(new Parser('sage: "Damien", name:  {\n    nom :"Tosin",  \n}').parseObjectArguments()); // mid

print(String.raw`sage: "Damien", name: { \n    /nom/ :"Tosin",  \n}\nboom : /2ery/, jaw: 45>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('sage: "Damien", name: { \n    /nom/ :"Tosin",  \n}\nboom : /2ery/, jaw: 45').parseObjectArguments()); // mid

print(String.raw`age: 50, name: "Tosin",`);
print(new Parser('age: 50, name: "Tosin",').parseObjectArguments());

print(String.raw`age: 50,`);
print(new Parser('age: 50,').parseObjectArguments());

print(String.raw`age: 50, name: { nom :"Tosin" }, boom : /2ery/,`);
print(new Parser('age: 50, name: { nom :"Tosin" }, boom : /2ery/,').parseObjectArguments());

print(String.raw`age: 50, name: {\n    nom :"Tosin"\n}, boom : /2ery/, jaw: 45,`);
print(new Parser('age: 50, name: {\n    nom :"Tosin"\n}, boom : /2ery/, jaw: 45,').parseObjectArguments());

print(String.raw`age: 50, name:  \n    nom :"Tosin",  \nboom : /2ery/, jaw: 45,`);
print(new Parser('age: 50, name:  \n    nom :"Tosin",  \nboom : /2ery/, jaw: 45,').parseObjectArguments());

print(String.raw`age: 50\nname: /nom/\nview: /2ery/,`);
print(new Parser('age: 50\nname: /nom/\nview: /2ery/,').parseObjectArguments());

print('========= OBJECTBLOCK =========');

print(String.raw`\n        age: 50, name: "Tosin"\n•>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('\n        age: 50, name: "Tosin"\n•');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseObjectBlock();
})());

print(String.raw`\n        age: 50, name: "Tosin"\n    •`);
print((() => {
  const parser = new Parser('\n        age: 50, name: "Tosin"\n    •');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseObjectBlock();
})());

print(String.raw`\n    name : "john" , price : "500"\n`);
print(new Parser('\n    name : "john" , price : "500"\n').parseObjectBlock());

print(String.raw`\n    value: 1_000e24, game, price: 34, reg: sunny\n`);
print(new Parser('\n    value: 1_000e24, game, price: 34, reg: sunny\n').parseObjectBlock());

print('========= OBJECTLITERAL =========');

print(String.raw`{\n        age: 50, name: "Tosin"\n}>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('{\n        age: 50, name: "Tosin"\n}');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseObjectLiteral();
})());

print(String.raw`{\n        age: 50, name: "Tosin"\n    }`);
print((() => {
  const parser = new Parser('{\n        age: 50, name: "Tosin"\n    }');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseObjectLiteral();
})());

print(String.raw`{\n    name : {\n        johnage: 20\n    }, price : "500",\n}`);
print(new Parser('{\n    name : {\n        johnage: 20\n    }, price : "500",\n}').parseObjectLiteral());

print(String.raw`{\n    name : "john" , price : "500",\n}`);
print(new Parser('{\n    name : "john" , price : "500",\n}').parseObjectLiteral());

print(String.raw`{\n    value: 1_000e24  \n    game  \n    hello: {\n        a: 10\n    }, reg: sunny\n}`);
print(new Parser('{\n    value: 1_000e24  \n    game  \n    hello: {\n        a: 10\n    }, reg: sunny\n}').parseObjectLiteral());

print('========= DICTARGUMENT =========');

print(String.raw`age: 50,`);
print(new Parser('age: 50,').parseDictArgument());

// print(String.raw`(age): 30`);
// print(new Parser('(age): 30').parseDictArgument());

// print(String.raw`2 + 1: 2 + 1`);
// print(new Parser('2 + 1: 2 + 1').parseDictArgument());

print(String.raw`/name/ : "john"\n•`);
print(new Parser('/name/ : "john"\n•').parseDictArgument());

print(String.raw`"value": 1_000e24,`);
print(new Parser('"value": 1_000e24,').parseDictArgument());

print(String.raw`"value": {\n    [.1, 2, 3]: 1_000e24\n}\n•`);
print(new Parser('"value": {\n    [.1, 2, 3]: 1_000e24\n}\n•').parseDictArgument());

print('========= DICTARGUMENTS =========');

print(String.raw`sage: age, 50, name: "Tosin">>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('sage: age, 50, name: "Tosin"').parseDictArguments()); // mid

print(String.raw`age: 50, name:  {\n    /nom/ :"Tosin",  \n}>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid (no eoi lookup)
print(new Parser('age: 50, name:  {\n    /nom/ :"Tosin",  \n}').parseDictArguments()); // mid

print(String.raw`age: 50, name: { \n    /nom/ :"Tosin",  \n}\nboom : /2ery/, "jaw": 45>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('age: 50, name: { \n    /nom/ :"Tosin",  \n}\nboom : /2ery/, "jaw": 45').parseDictArguments()); // mid

print(String.raw`age: 50, name: "Tosin",`);
print(new Parser('age: 50, name: "Tosin",').parseDictArguments());

print(String.raw`age: 50,`);
print(new Parser('age: 50,').parseDictArguments());

print(String.raw`age: 50, name: { /nom/ :"Tosin" }, boom : /2ery/,`);
print(new Parser('age: 50, name: { /nom/ :"Tosin" }, boom : /2ery/,').parseDictArguments());

print(String.raw`age: 50, name: {\n    /nom/ :"Tosin"\n}, boom : /2ery/, "jaw": 45,`);
print(new Parser('age: 50, name: {\n    /nom/ :"Tosin"\n}, boom : /2ery/, "jaw": 45,').parseDictArguments());

print(String.raw`age: 50, name:  \n    /nom/ :"Tosin",  \nboom : /2ery/, "jaw": 45,`);
print(new Parser('age: 50, name:  \n    /nom/ :"Tosin",  \nboom : /2ery/, "jaw": 45,').parseDictArguments());

print(String.raw`age: 50\nname: /nom/\nview: /2ery/,`);
print(new Parser('age: 50\nname: /nom/\nview: /2ery/,').parseDictArguments());

// print(String.raw`(age): 30, age: 50, name: "Tosin"`);
// print(new Parser('(age): 30, age: 50, name: "Tosin"').parseDictArguments());

// print(String.raw`2 + 1: 2 + 1, (age): 30, 2_000e56 / 5 + 67 : 45 / 65 - 77`);
// print(new Parser('2 + 1: 2 + 1, (age): 30, 2_000e56 / 5 + 67 : 45 / 65 - 77').parseDictArguments());

print('========= DICTLITERAL =========');

print(String.raw`@{\n        age: 50, name: "Tosin"\n}>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('@{\n        age: 50, name: "Tosin"\n}');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseDictLiteral();
})());

print(String.raw`@{\n        age: 50, name: "Tosin"\n    }`);
print((() => {
  const parser = new Parser('@{\n        age: 50, name: "Tosin"\n    }');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseDictLiteral();
})());

print(String.raw`@{\n    /name/ : {\n        john: 20\n    }, 500 : "500",\n}`);
print(new Parser('@{\n    /name/ : {\n        john: 20\n    }, 500 : "500",\n}').parseDictLiteral());

print(String.raw`@{\n    /name/ : "john" , 500 : "500",\n}`);
print(new Parser('@{\n    /name/ : "john" , 500 : "500",\n}').parseDictLiteral());

print(String.raw`@{\n    "value": 1_000e24  \n    game  \n    hello: {\n        a: 10\n    }, /reg/: sunny\n}`);
print(new Parser('@{\n    "value": 1_000e24  \n    game  \n    hello: {\n        a: 10\n    }, /reg/: sunny\n}').parseDictLiteral());

print('========= SETARGUMENTS =========');

print(String.raw`name, age, 45, /45/`);
print(new Parser('name, age, 45, /45/').parseSetArguments());

print(String.raw`"Hi", 1, .2, 0o23e56, /regex/`);
print(new Parser('"Hi", 1, .2, 0o23e56, /regex/').parseSetArguments());

print(String.raw`"Hi", 1, .2, 0o23e56, /regex/,`);
print(new Parser('"Hi", 1, .2, 0o23e56, /regex/,').parseSetArguments());

print(String.raw`"Hi"`);
print(new Parser('"Hi"').parseSetArguments());

print('========= SETLITERAL =========');

print(String.raw`%{\n        50_230, "Tosin"\n    }>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('%{\n        50_230, "Tosin"\n    }');
  parser.lastIndentCount = 2; // Two indent level.
  return parser.parseSetLiteral();
})());

print(String.raw`%{\n        50_230, "Tosin"\n    }`);
print((() => {
  const parser = new Parser('%{\n        50_230, "Tosin"\n    }');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseSetLiteral();
})());

print(String.raw`%{\n    (\n        "john", name, 20\n    ), "500", /regex/, \n}`);
print(new Parser('%{\n    (\n        "john", name, 20\n    ), "500", /regex/, \n}').parseSetLiteral());

print(String.raw`%{"Hi", 1, .2,\n0o23e56, /regex/}`);
print(new Parser('%{"Hi", 1, .2,\n0o23e56, /regex/}').parseSetLiteral());

print(String.raw`%{ name, age, 45, /45/ }`);
print(new Parser('%{ name, age, 45, /45/ }').parseSetLiteral());

print('========= TUPLEARGUMENTS =========');

print(String.raw`"Hi">>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('"Hi"').parseTupleArguments()); // fail

print(String.raw`"Hi", 1, .2, 0o23e56, /regex/`);
print(new Parser('"Hi", 1, .2, 0o23e56, /regex/').parseTupleArguments());

print(String.raw`"Hi", 1, .2, 0o23e56, /regex/,`);
print(new Parser('"Hi", 1, .2, 0o23e56, /regex/,').parseTupleArguments());

print(String.raw`"Hi",`);
print(new Parser('"Hi",').parseTupleArguments());

print('========= TUPLELITERAL =========');

print(String.raw`(\n        50_230, "Tosin"\n)>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('(\n        50_230, "Tosin"\n)');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseTupleLiteral();
})());

print(String.raw`("Hi")>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('("Hi")').parseTupleLiteral()); // fail

print(String.raw`(\n        50_230, "Tosin"\n    )`);
print((() => {
  const parser = new Parser('(\n        50_230, "Tosin"\n    )');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseTupleLiteral();
})());

print(String.raw`(\n    (\n        "john", name, 20\n    ), "500", /regex/, \n)`);
print(new Parser('(\n    (\n        "john", name, 20\n    ), "500", /regex/, \n)').parseTupleLiteral());

print(String.raw`("Hi", 1, .2, 0o23e56, /regex/)`);
print(new Parser('("Hi", 1, .2, 0o23e56, /regex/)').parseTupleLiteral());

print(String.raw`("Hi", 1, .2, 0o23e56, /regex/,)`);
print(new Parser('("Hi", 1, .2, 0o23e56, /regex/,)').parseTupleLiteral());

print(String.raw`("Hi",)`);
print(new Parser('("Hi",)').parseTupleLiteral());

print(String.raw`()`);
print(new Parser('()').parseTupleLiteral());

print('========= NAMEDTUPLEARGUMENTS =========');

print(String.raw`"greet": "Hi">>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('"greet": "Hi"').parseNamedTupleArguments()); // fail

print(String.raw`greet:"Hi",index:1,cost:.2,total:0o23e56,pattern:/regex/,`);
print(new Parser('greet:"Hi",index:1,cost:.2,total:0o23e56,pattern:/regex/,').parseNamedTupleArguments());

print(String.raw`greet:"Hi",index:1,cost:.2,total:0o23e56,pattern:/regex/,`);
print(new Parser('greet:"Hi",index:1,cost:.2,total:0o23e56,pattern:/regex/,').parseNamedTupleArguments());

print(String.raw`greet: "Hi",`);
print(new Parser('greet: "Hi",').parseNamedTupleArguments());

print(String.raw`greet :"Hi"`);
print(new Parser('greet :"Hi"').parseNamedTupleArguments());

print('========= NAMEDTUPLELITERAL =========');

print(String.raw`(\n        price: 50_230, name: "Tosin"\n)>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('(\n        price: 50_230, name: "Tosin"\n)');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseNamedTupleLiteral();
})());

print(String.raw`()>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('()').parseNamedTupleLiteral()); // fail

print(String.raw`(\n        price: 50_230, name: "Tosin"\n    )`);
print((() => {
  const parser = new Parser('(\n        price: 50_230, name: "Tosin"\n    )');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseNamedTupleLiteral();
})());

print(String.raw`(\n    tup: (\n        name: "john", age :20\n    ), label:"500", pattern  :/regex/, \n)`);
print(new Parser('(\n    tup: (\n        name: "john", age :20\n    ), label:"500", pattern  :/regex/, \n)').parseNamedTupleLiteral());

print(String.raw`(greet:"Hi",index:1,cost:.2,total:0o23e56,pattern:/regex/,)`);
print(new Parser('(greet:"Hi",index:1,cost:.2,total:0o23e56,pattern:/regex/,)').parseNamedTupleLiteral());

print(String.raw`(greet:"Hi",index:1,cost:.2,\ntotal:0o23e56,pattern:/regex/,)`);
print(new Parser('(greet:"Hi",index:1,cost:.2,\ntotal:0o23e56,pattern:/regex/,)').parseNamedTupleLiteral());

print(String.raw`(greet: "Hi",)`);
print(new Parser('(greet: "Hi",)').parseNamedTupleLiteral());

print(String.raw`(:)`);
print(new Parser('(:)').parseNamedTupleLiteral());

print('========= SYMBOLLITERAL ========='); // TODO: Tests Incomplete

print(String.raw`$()>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('$()').parseSymbolLiteral()); // fail

print(String.raw`$( 2_0056 )`);
print(new Parser('$( 2_0056 )').parseSymbolLiteral());

print('========= LISTCOMPREHENSION ========='); // TODO: Tests Incomplete

print('========= DICTCOMPREHENSION ========='); // TODO: Tests Incomplete

print('========= COMPREHENSION ========='); // TODO: Tests Incomplete

print('========= LITERAL ========='); // TODO: Tests Incomplete

print(String.raw`true`);
print(new Parser('true').parseLiteral());

print(String.raw`false`);
print(new Parser('false').parseLiteral());

print(String.raw`5_4.0_33e-5_99`);
print(new Parser('5_4.0_33e-5_99').parseLiteral());

print(String.raw`0xff.01p-5A`);
print(new Parser('0xff.01p-5A').parseLiteral());

print(String.raw`0o5_45_0e+2_6`);
print(new Parser('0o5_45_0e+2_6').parseLiteral());

print(String.raw`0x5`);
print(new Parser('0x5').parseLiteral());

print(String.raw`'''hello\nworld'''`);
print(new Parser("'''hello\nworld'''").parseLiteral());

print(String.raw`""`);
print(new Parser('""').parseLiteral());

print(String.raw`'''hello\nworld'''`);
print(new Parser("'''hello\nworld'''").parseLiteral());

print(String.raw`/[0-9a-z]+\\d+/`);
print(new Parser('/[0-9a-z]+\\d+/').parseLiteral());

print(String.raw`[1, 2; 3, 4]`);
print(new Parser('[1, 2; 3, 4]').parseLiteral());

print(String.raw`[.1,['hi','hello'],'string',/\\d+/,5_000,]`);
print(new Parser("[.1,['hi','hello'],'string',/\\d+/,5_000,]").parseLiteral());

print(String.raw`[]`);
print(new Parser('[]').parseLiteral());

print(String.raw`{\n    /name/ : "john" , 500 : "500",\n}`);
print(new Parser('{\n    /name/ : "john" , 500 : "500",\n}').parseLiteral());

print(String.raw`{\n    "value": 1_000e24  \n    game  \n    hello: {\n        a: 10\n    }, /reg/: sunny\n}`);
print(new Parser('{\n    "value": 1_000e24  \n    game  \n    hello: {\n        a: 10\n    }, /reg/: sunny\n}').parseLiteral());

print(String.raw`%{ name, age, 45, /45/ }`);
print(new Parser('%{ name, age, 45, /45/ }').parseLiteral());

print(String.raw`("Hi", 1, .2, 0o23e56, /regex/)`);
print(new Parser('("Hi", 1, .2, 0o23e56, /regex/)').parseLiteral());

print(String.raw`("Hi", 1, .2, 0o23e56, /regex/,)`);
print(new Parser('("Hi", 1, .2, 0o23e56, /regex/,)').parseLiteral());

print(String.raw`()`);
print(new Parser('()').parseLiteral());

print(String.raw`(greet: "Hi",)`);
print(new Parser('(greet: "Hi",)').parseLiteral());

print(String.raw`(:)`);
print(new Parser('(:)').parseLiteral());

print(String.raw`(\n    tup: (\n        name: "john", age :20\n    ), label:"500", pattern  :/regex/, \n)`);
print(new Parser('(\n    tup: (\n        name: "john", age :20\n    ), label:"500", pattern  :/regex/, \n)').parseLiteral());

print(String.raw`$( 2_0056 )`);
print(new Parser('$( 2_0056 )').parseLiteral());

print('========= CALLARGUMENTS =========');

print(String.raw`"greet": "Hi">>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('"greet": "Hi"').parseCallArguments()); // mid

print(String.raw`greet:"Hi", 1,cost:.2,total:0o23e56 , /regex/,`);
print(new Parser('greet:"Hi", 1,cost:.2,total:0o23e56 , /regex/,').parseCallArguments());

print(String.raw`total:0o23e56,pattern:/regex/,`);
print(new Parser('total:0o23e56,pattern:/regex/,').parseCallArguments());

print(String.raw`"Hi",`);
print(new Parser('"Hi",').parseCallArguments());

print(String.raw`greet :"Hi"`);
print(new Parser('greet :"Hi"').parseCallArguments());

print('========= CALLPOSTFIX =========');

print(String.raw`(\n        price: 50_230, name: "Tosin"\n)>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('(\n        price: 50_230, name: "Tosin"\n)');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseCallPostfix();
})());

print(String.raw`(:)>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('(:)').parseCallPostfix()); // fail

print(String.raw`. (²)>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('. (²)').parseCallPostfix()); // fail

print(String.raw`.(+)`);
print(new Parser('.(+)').parseCallPostfix());

print(String.raw`  ! .(²)`);
print(new Parser('  ! .(²)').parseCallPostfix());

print(String.raw`()`);
print(new Parser('()').parseCallPostfix());

print(String.raw`(\n        price: 50_230, name: "Tosin"\n    )`);
print((() => {
  const parser = new Parser('(\n        price: 50_230, name: "Tosin"\n    )');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseCallPostfix();
})());

print(String.raw`  (\n    (\n        name: "john", age :20\n    ), label:"500", pattern  :/regex/, \n)`);
print(new Parser('  (\n    (\n        name: "john", age :20\n    ), label:"500", pattern  :/regex/, \n)').parseCallPostfix());

print(String.raw`  (greet ,index:1, .2,total:0o23e56,pattern:/regex/,)`);
print(new Parser('  (greet ,index:1, .2,total:0o23e56,pattern:/regex/,)').parseCallPostfix());

print(String.raw`  (greet:"Hi",index:1 ,cost:.2,\n0o23e56,pattern:/regex/,)`);
print(new Parser('  (greet:"Hi",index:1 ,cost:.2,\n0o23e56,pattern:/regex/,)').parseCallPostfix());

print(String.raw`(greet: "Hi",)`);
print(new Parser('(greet: "Hi",)').parseCallPostfix());

print(String.raw`! ()`);
print(new Parser('! ()').parseCallPostfix());

print(String.raw`()`);
print(new Parser('()').parseCallPostfix());

print('========= DOTNOTATIONPOSTFIX =========');

print(String.raw`. name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('. name').parseDotNotationPostfix()); // fail

print(String.raw`.address45`);
print(new Parser('.address45').parseDotNotationPostfix());

print(String.raw`  .address45`);
print(new Parser('  .address45').parseDotNotationPostfix());

print('========= CASCADENOTATIONARGUMENT =========');

print(String.raw`[2, 3]`);
print(new Parser('[2, 3]').parseCascadeNotationArgument());

print(String.raw`.(2, 3..67)`);
print(new Parser('.(2, 3..67)').parseCascadeNotationArgument());

print(String.raw`!(hello, /\d{2}/).nom`);
print(new Parser('!(hello, /\d{2}/).nom').parseCascadeNotationArgument());

print(String.raw`john?.foo()`);
print(new Parser('john?.foo()').parseCascadeNotationArgument());

print('========= CASCADENOTATIONARGUMENTS =========');

print(String.raw`[2, 3:67]+name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('[2, 3:67]+name').parseCascadeNotationArguments()); // fail

print(String.raw`[2, 3], ({nom, name})`);
print(new Parser('[2, 3], ({nom, name})').parseCascadeNotationArguments());

print(String.raw`[2, 3:67] + name / age - game`);
print(new Parser('[2, 3:67] + name / age - game').parseCascadeNotationArguments());

print('========= CASCADENOTATIONPOSTFIX =========');

print(String.raw`.{[2, 3], ({nom, name})}`);
print(new Parser('.{[2, 3], ({nom, name})}').parseCascadeNotationPostfix());

print(String.raw`.{ [2, 3:67] + name / age - game }`);
print(new Parser('.{ [2, 3:67] + name / age - game }').parseCascadeNotationPostfix());

print('========= INDEXARGUMENT =========');

print(String.raw` : >>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser(" : ").parseIndexArgument()); // fail

print(String.raw`45:name:'hi'`);
print(new Parser("45:name:'hi'").parseIndexArgument());

// print(String.raw`-1:'hi'`);
// print(new Parser("-1:'hi'").parseIndexArgument());

print(String.raw`:name:'hi'`);
print(new Parser(":name:'hi'").parseIndexArgument());

print(String.raw`:`);
print(new Parser(":").parseIndexArgument());

print(String.raw`::`);
print(new Parser("::").parseIndexArgument());

print(String.raw`'name'`);
print(new Parser("'name'").parseIndexArgument());

print('========= INDEXARGUMENT =========');

print(String.raw`greet:"Hi":56, 1,5:.2,total:0o23e56 , /regex/`);
print(new Parser('greet:"Hi":56, 1,5:.2,total:0o23e56 , /regex/').parseIndexArguments());

print(String.raw`0x56ffe, :`);
print(new Parser('0x56ffe, :').parseIndexArguments());

print(String.raw`"Hi"`);
print(new Parser('"Hi"').parseIndexArguments());

// print(String.raw`:-1,45`);
// print(new Parser(":-1,45").parseIndexArguments());

print(String.raw`:1,45`);
print(new Parser(":1,45").parseIndexArguments());

print('========= INDEXPOSTFIX =========');

print(String.raw`[ greet:"Hi":56, 1,5:.2,total:0o23e56 , /regex/ ]`);
print(new Parser('[ greet:"Hi":56, 1,5:.2,total:0o23e56 , /regex/ ]').parseIndexPostfix());

print(String.raw` [0x56ffe,\n:]`);
print(new Parser(' [0x56ffe,\n:]').parseIndexPostfix());

print(String.raw`[\n    "Hi"\n]`);
print(new Parser('[\n    "Hi"\n]').parseIndexPostfix());

// print(String.raw`[:-1,45]`);
// print(new Parser("[:-1,45]").parseIndexPostfix());

print(String.raw`[:1,45]`);
print(new Parser("[:1,45]").parseIndexPostfix());

print(String.raw`[::]`);
print(new Parser("[::]").parseIndexPostfix());

print('========= TERNARYOPERATOR =========');

print(String.raw`(45) ? name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser("(45) ? name").parseTernaryOperator()); // fail

print(String.raw`(name) ? age : cost`);
print(new Parser("(name) ? age : cost").parseTernaryOperator());

print(String.raw`(  /hello/  )?age:cost`);
print(new Parser("(  /hello/  )?age:cost").parseTernaryOperator());

print(String.raw`(/hello/ == regex)?age:cost`);
print(new Parser("(/hello/ == regex)?age:cost").parseTernaryOperator());

print('========= CONTROLKEYWORD =========');

print(String.raw`return`);
print(new Parser('return').parseControlKeyword());

print(String.raw`break`);
print(new Parser('break').parseControlKeyword());

print(String.raw`spill`);
print(new Parser('spill').parseControlKeyword());

print(String.raw`continue`);
print(new Parser('continue').parseControlKeyword());

print('========= RETURN =========');

print(String.raw`returnjohn>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("returnjohn").parseReturn()); // mid

print(String.raw`return yield john>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("return yield john").parseReturn()); // mid

print(String.raw`return(john)>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("return(john)").parseReturn()); // mid

print(String.raw`return+john>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("return+john").parseReturn()); // mid

print(String.raw`return 0b100e56`);
print(new Parser("return 0b100e56").parseReturn());

print(String.raw`return john`);
print(new Parser("return john").parseReturn());

print(String.raw`return`);
print(new Parser("return").parseReturn());

print(String.raw`return john + /regex/`);
print(new Parser("return john + /regex/").parseReturn());

print(String.raw`return john,/regex/`);
print(new Parser("return john,/regex/").parseReturn());

print('========= YIELD =========');

print(String.raw`yieldjohn>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("yieldjohn").parseYield()); // mid

print(String.raw`yield from>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("yield from").parseYield()); // mid

print(String.raw`yield return name>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("yield return name").parseYield()); // mid

print(String.raw`yield(john)>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("yield(john)").parseYield()); // mid

print(String.raw`yield+john>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("yield+john").parseYield()); // mid

print(String.raw`yield john`);
print(new Parser("yield john").parseYield());

print(String.raw`yield from 45`);
print(new Parser("yield from 45").parseYield());

print(String.raw`yield john + /regex/`);
print(new Parser("yield john + /regex/").parseYield());

print(String.raw`yield john,/regex/`);
print(new Parser("yield john,/regex/").parseYield());

print('========= RAISE =========');

print(String.raw`raisejohn>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("raisejohn").parseRaise()); // mid

print(String.raw`raise break john>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("raise break john").parseRaise()); // mid

print(String.raw`raise(john)>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("raise(john)").parseRaise()); // mid

print(String.raw`raise+john>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("raise+john").parseRaise()); // mid

print(String.raw`raise john`);
print(new Parser("raise john").parseRaise());

print(String.raw`raise 0b100e56`);
print(new Parser("raise 0b100e56").parseRaise());

print(String.raw`raise john + /regex/`);
print(new Parser("raise john + /regex/").parseRaise());

print(String.raw`raise john,/regex/`);
print(new Parser("raise john,/regex/").parseRaise());

print('========= CONTINUE =========');

print(String.raw`continue @john`);
print(new Parser("continue @john").parseContinue());

print(String.raw`continue`);
print(new Parser("continue").parseContinue());

print('========= BREAK =========');

print(String.raw`break break john>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("break break john").parseBreak()); // mid

print(String.raw`break @john`);
print(new Parser("break @john").parseBreak());

print(String.raw`break`);
print(new Parser("break").parseBreak());

print(String.raw`break name`);
print(new Parser("break name").parseBreak());

print(String.raw`break name @name`);
print(new Parser("break name @name").parseBreak());

print('========= SPILL =========');

print(String.raw`spill @john`);
print(new Parser("spill @john").parseSpill());

print(String.raw`spill`);
print(new Parser("spill").parseSpill());

print(String.raw`spill name`);
print(new Parser("spill name").parseSpill());

print(String.raw`spill name @name`);
print(new Parser("spill name @name").parseSpill());

print('========= CONTROLPRIMITIVE =========');

print(String.raw`spill john`);
print(new Parser("spill john").parseControlPrimitive());

print(String.raw`break name @name`);
print(new Parser("break name @name").parseControlPrimitive());

print(String.raw`raise 0b100e56`);
print(new Parser("raise 0b100e56").parseControlPrimitive());

print(String.raw`yield from 45`);
print(new Parser("yield from 45").parseControlPrimitive());

print(String.raw`return 0b100e56`);
print(new Parser("return 0b100e56").parseControlPrimitive());

print('========= SUBATOMPOSTFIX =========');

print(String.raw` 'hello world'`);
print(new Parser(" 'hello world'").parseSubAtomPostfix());

print(String.raw`  (greet:"Hi",index:1 ,cost:.2,\n0o23e56,pattern:/regex/,)`);
print(new Parser('  (greet:"Hi",index:1 ,cost:.2,\n0o23e56,pattern:/regex/,)').parseSubAtomPostfix());

print(String.raw`[\n    "Hi"\n]`);
print(new Parser('[\n    "Hi"\n]').parseSubAtomPostfix());

print(String.raw`~address45`);
print(new Parser('~address45').parseSubAtomPostfix());

print(String.raw`[:1,45]`);
print(new Parser("[:1,45]").parseSubAtomPostfix());

print('========= SUBATOM =========');

print(String.raw`~45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('~45').parseSubAtom()); // fail

print(String.raw`~ address45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('~ address45').parseSubAtom()); // fail

print(String.raw`( /reggie/\n) regex>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('( /reggie/\n) regex').parseSubAtom()); // mid

print(String.raw`~address45`);
print(new Parser('~address45').parseSubAtom());

print(String.raw`[1,"Hello", 45]`);
print(new Parser('[1,"Hello", 45]').parseSubAtom());

print(String.raw`( /reggie/ )`);
print(new Parser('( /reggie/ )').parseSubAtom());

print(String.raw`( /reggie/\n)regex`);
print(new Parser('( /reggie/\n)regex').parseSubAtom());

print(String.raw`( \n    (name : $name)\n)`);
print(new Parser('( \n    (name : $name)\n)').parseSubAtom());

print(String.raw`complex45_name`);
print(new Parser('complex45_name').parseSubAtom());

print(String.raw`3.0f`);
print(new Parser('3.0f').parseSubAtom());

print(String.raw`(name,)`);
print(new Parser("(name,)").parseSubAtom());

print('========= ATOM =========');

print(String.raw`print?('hello')`);
print(new Parser("print?('hello')").parseAtom());

print(String.raw`print('hello')`);
print(new Parser("print('hello')").parseAtom());

print(String.raw`print('hello')?`);
print(new Parser("print('hello')?").parseAtom());

print(String.raw`print!.name('hello')`);
print(new Parser("print!.name('hello')?").parseAtom());

print(String.raw`print!.name?.nom('hello')`);
print(new Parser("print!.name?.nom('hello')?").parseAtom());

print(String.raw`print[0]('hello')`);
print(new Parser("print[0]('hello')").parseAtom());

print(String.raw`print[0]?('hello')`);
print(new Parser("print[0]?('hello')").parseAtom());

print(String.raw`++ (-, 45, "level")`);
print(new Parser('++ (-, 45, "level")').parseAtom());

print(String.raw`@{name, age:/regex/}`);
print(new Parser('@{name, age:/regex/}').parseAtom());

print(String.raw`[1, 2, 3]`);
print(new Parser('[1, 2, 3]').parseAtom());

print(String.raw`50.name`);
print(new Parser('50.name').parseAtom());

print(String.raw`0x566.fe`);
print(new Parser('0x566.fe').parseAtom());

print(String.raw`0x566.fe.name`);
print(new Parser('0x566.fe.name').parseAtom());

print(String.raw`0x566.name`);
print(new Parser('0x566.name').parseAtom());

print(String.raw`john.foo?!()`);
print(new Parser('john.foo?!()').parseAtom());

print(String.raw`john.foo? ()`);
print(new Parser('john.foo? ()').parseAtom());

print(String.raw`++ ()`);
print(new Parser("++ ()").parseAtom());

print(String.raw`5.(+)`);
print(new Parser('5.(+)').parseAtom());

print(String.raw`john.{ [2, 3:67] + name / age - game }.nom`);
print(new Parser('john.{ [2, 3:67] + name / age - game }.nom').parseAtom());

print(String.raw`name ? ! .(²)`);
print(new Parser('name ? ! .(²)').parseAtom());

print('========= PREFIXATOM =========');

print(String.raw`/regex/>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('/regex/').parsePrefixAtom()); // fail

print(String.raw`+ 45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('+ 45').parsePrefixAtom()); // fail

print(String.raw`+ ->>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('+ -').parsePrefixAtom()); // fail

print(String.raw`+45`);
print(new Parser('+45').parsePrefixAtom());

print(String.raw`-+@{name, age:/regex/}`);
print(new Parser('-+@{name, age:/regex/}').parsePrefixAtom());

print('========= POSTFIXATOM =========');

print(String.raw`45 +>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('45 +').parsePostfixAtom()); // fail

print(String.raw`+ ->>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('+ -').parsePostfixAtom()); // fail

print(String.raw`45+`);
print(new Parser('45+').parsePostfixAtom());

print(String.raw`@{name, age:/regex/}*`);
print(new Parser('@{name, age:/regex/}*').parsePostfixAtom());

print(String.raw`5.+`);
print(new Parser('5.+').parsePostfixAtom());

print(String.raw`name.²`);
print(new Parser('name.²').parsePostfixAtom());

print('========= PREPOSTFIXATOM =========');

print(String.raw`+ 45>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('+ 45').parsePrepostfixAtom()); // fail

print(String.raw`+ ->>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('+ -').parsePrepostfixAtom()); // fail

print(String.raw`45+`);
print(new Parser('45+').parsePrepostfixAtom());

print(String.raw`&@{name, age:/regex/}`);
print(new Parser('&@{name, age:/regex/}').parsePrepostfixAtom());

print(String.raw`[234, /regex/]`);
print(new Parser('[234, /regex/]').parsePrepostfixAtom());

print(String.raw`[234.0, /regex/]`);
print(new Parser('[234.0, /regex/]').parsePrepostfixAtom());

print(String.raw`/regex/`);
print(new Parser('/regex/').parsePrepostfixAtom());

print(String.raw`[234.0, /regex/.age, {x, y}]`);
print(new Parser('[234.0, /regex/.age, {x, y}]').parsePrepostfixAtom());

print(String.raw`*-+[234.0, /regex/.age, {x, y}]`);
print(new Parser('*-+[234.0, /regex/.age, {x, y}]').parsePrepostfixAtom());

print('========= KEYWORDOPERATOR =========');

print(String.raw`mod56>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('mod56').parseKeywordOperator()); // fail

print(String.raw`is notmod>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('is notmod').parseKeywordOperator()); // fail

print(String.raw`not in`);
print(new Parser('not in').parseKeywordOperator());

print(String.raw`is not`);
print(new Parser('is not').parseKeywordOperator());

print(String.raw`mod`);
print(new Parser('mod').parseKeywordOperator());

print(String.raw`in`);
print(new Parser('in').parseKeywordOperator());

print(String.raw`is`);
print(new Parser('is').parseKeywordOperator());

print('========= INFIXEXPRESSION =========');

// >>> UNEXPECTED BEHVIOR
print(String.raw`john.nom%%{ name, age, 45, /45/ }`);
print(new Parser('john.nom%%{ name, age, 45, /45/ }').parseInfixExpression());
// <<< UNEXPECTED BEHAVIOR

print(String.raw`67+ 6 * 'hello'>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("67+ 6 * 'hello'").parseInfixExpression()); // mid

print(String.raw`3 .in m>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("3 .in m").parseInfixExpression()); // mid

print(String.raw`x in y`);
print(new Parser('x in y').parseInfixExpression());

print(String.raw`x + y`);
print(new Parser('x + y').parseInfixExpression());

print(String.raw`x is not y`);
print(new Parser('x is not y').parseInfixExpression());

print(String.raw`m.+m`);
print(new Parser('m.+m').parseInfixExpression());

print(String.raw`3.+m`);
print(new Parser("3.+m").parseInfixExpression());

print(String.raw`3 .+ m`);
print(new Parser("3 .+ m").parseInfixExpression());

print(String.raw`67 + 6 * 'hello'`);
print(new Parser("67 + 6 * 'hello'").parseInfixExpression());

print(String.raw`4 + 6 * 567 - name`);
print(new Parser('4 + 6 * 567 - name').parseInfixExpression());

print(String.raw`4 + 6/567 - {age: 4_500}`);
print(new Parser('4 + 6/567 - {age: 4_500}').parseInfixExpression());

print(String.raw`y in array`);
print(new Parser('y in array').parseInfixExpression());

print('========= SPREADEXPRESSION =========');

print(String.raw`....5>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('....5').parseSpreadExpression()); // fail

print(String.raw`...[1, 2]`);
print(new Parser('...[1, 2]').parseSpreadExpression());

print(String.raw`...(4, 5)`);
print(new Parser('...(4, 5)').parseSpreadExpression());

print('========= RANGE =========');

print(String.raw`45..>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser("45..").parseRange()); // fail

print(String.raw`2..6`);
print(new Parser('2..6').parseRange());

print(String.raw`45..name..'hi'`);
print(new Parser("45..name..'hi'").parseRange());

print(String.raw`-1..'hi'`);
print(new Parser("-1..'hi'").parseRange());

print(String.raw`1-..'hi'`);
print(new Parser("1-..'hi'").parseRange());

print(String.raw`1-..'hi'+/d/`);
print(new Parser("1-..'hi'+/d/").parseRange());

print(String.raw`..name..'hi'`);
print(new Parser("..name..'hi'").parseRange());

print('========= COMMANDNOTATIONREST =========');

print(String.raw`foo>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('foo').parseCommandNotationRest()); // fail

print(String.raw` [1, 2, 3]>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser(' [1, 2, 3]').parseCommandNotationRest()); // fail

print(String.raw` 2_0056`);
print(new Parser(' 2_0056').parseCommandNotationRest());

print(String.raw` $symbol`);
print(new Parser('  $symbol').parseCommandNotationRest());

print(String.raw` 'hello world'`);
print(new Parser(" 'hello world'").parseCommandNotationRest());

print(String.raw` foo`);
print(new Parser(' foo').parseCommandNotationRest());

print(String.raw`  1..20`);
print(new Parser('  1..20').parseCommandNotationRest());

print(String.raw`  foo 25`);
print(new Parser('  foo 25').parseCommandNotationRest());

print(String.raw`  'hi' + 25`);
print(new Parser("  'hi' +  25").parseCommandNotationRest());

// print(String.raw`|name| => 25`);
// print(new Parser('|name| => 25').parseCommandNotationRest());

print('========= COMMANDNOTATION =========');

print(String.raw`++ 456>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser("++ 456").parseCommandNotation()); // fail

print(String.raw`name age where same>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('name age where same').parseCommandNotation()); // mid

print(String.raw`name age`);
print(new Parser('name age').parseCommandNotation());

print(String.raw`push! 456`);
print(new Parser('push! 456').parseCommandNotation());

print(String.raw`push?! 456`);
print(new Parser('push?! 456').parseCommandNotation());

print('========= SIMPLEEXPRESSION =========');

print(String.raw`1-..'hi'+/d/`);
print(new Parser("1-..'hi'+/d/").parseSimpleExpression());

print(String.raw`'hi'+/d/`);
print(new Parser("'hi'+/d/").parseSimpleExpression());

print(String.raw`(name == 'john') ? 4 + (name,) : [1, 2]`);
print(new Parser("(name == 'john') ? 4 + (name,) : [1, 2]").parseSimpleExpression());

print(String.raw`4 + (name,)`);
print(new Parser("4 + (name,)").parseSimpleExpression());

print(String.raw`name + (name,)`);
print(new Parser("name + (name,)").parseInfixExpression());

print('========= TULEEXPRESSION =========');

print(String.raw`1-..'hi'+/d/, 5++7`);
print(new Parser("1-..'hi'+/d/, 5++7").parseTupleExpression());

print(String.raw`'hi'+/d/`);
print(new Parser("'hi'+/d/").parseTupleExpression());

print(String.raw`(name == 'john') ? 4 + (name,) : [1, 2], name + james`);
print(new Parser("(name == 'john') ? 4 + (name,) : [1, 2], name + james").parseTupleExpression());

print(String.raw`4 + (name,),`);
print(new Parser('4 + (name,),').parseTupleExpression());

print('========= DOTNOTATIONLINE =========');

print(String.raw`.nom()?.john`);
print(new Parser('.nom()?.john').parseDotNotationLine());

print(String.raw`.play[34].nom(+, -)?`);
print(new Parser('.play[34].nom(+, -)?').parseDotNotationLine());

print('========= DOTNOTATIONBLOCK =========');

print(String.raw`james.peter?\n    .nom()?.john\n    .dame()\nfoo`);
print(new Parser('james.peter?\n    .nom()?.john\n    .dame()\nfoo').parseDotNotationBlock());

print(String.raw`james.peter?\n    .nom()?.john\n    .dame()`);
print(new Parser('james.peter?\n    .nom()?.john\n    .dame()').parseDotNotationBlock());

print(String.raw`peter()\n    .nom()?.john\n    .dame()`);
print(new Parser('peter()\n    .nom()?.john\n    .dame()').parseDotNotationBlock());

print('========= SUBEXPRESSION =========');

print(String.raw`james.peter?\n    .nom()?.john\n    .dame()\nfoo`);
print(new Parser('james.peter?\n    .nom()?.john\n    .dame()\nfoo').parseSubExpression());

print(String.raw`5 .+ name`);
print(new Parser('5 .+ name').parseSubExpression());

print(String.raw`/reggie/, %{54,89}`);
print(new Parser('/reggie/, %{54,89}').parseSubExpression());

print(String.raw`0xfff3445p-23`);
print(new Parser('0xfff3445p-23').parseSubExpression());

print(String.raw`return 56`);
print(new Parser('return 56').parseSubExpression());

print('========= EXPRESSION =========');

print(String.raw`print "hello"; print "world"`);
print(new Parser('print "hello"; print "world"').parseExpression());

print(String.raw`5 .+ name`);
print(new Parser('5 .+ name').parseExpression());

print(String.raw`/reggie/; %{54,89}`);
print(new Parser('/reggie/; %{54,89}').parseExpression());

print(String.raw`0xfff3445p-23; return 56`);
print(new Parser('0xfff3445p-23; return 56').parseExpression());

print(String.raw`print "hello"`);
print(new Parser('print "hello"').parseExpression());

print(String.raw`print bar in x`);
print(new Parser('print bar in x').parseExpression());

print('========= SUBEXPRESSIONOBLOCK =========');

// print(String.raw`if name == "John": print name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('if name == "John": print name').parseSubExpressionNoBlock()); // fail

// print(String.raw`if name == "John": print name else: print agename>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('if name == "John": print name else: print age').parseSubExpressionNoBlock()); // fail

print(String.raw`james.peter?\n    .nom()?.john\n    .dame()\nfoo>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('james.peter?\n    .nom()?.john\n    .dame()\nfoo').parseSubExpressionNoBlock()); // mid

print(String.raw`return /reggie/, %{54,89}`);
print(new Parser('return /reggie/, %{54,89}').parseSubExpressionNoBlock());

print('========= EXPRESSIONNOBLOCK =========');

// print(String.raw`if name == "John": print name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('if name == "John": print name').parseExpressionNoBlock()); // fail

// print(String.raw`if name == "John": print name else: print agename>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('if name == "John": print name else: print age').parseExpressionNoBlock()); // fail

print(String.raw`james.peter?\n    .nom()?.john\n    .dame()\nfoo>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('james.peter?\n    .nom()?.john\n    .dame()\nfoo').parseExpressionNoBlock()); // mid

print(String.raw`return /reggie/, %{54,89}`);
print(new Parser('return /reggie/, %{54,89}').parseExpressionNoBlock());

print('========= SUBEXPRESSIONSECONDINLINE =========');

// print(String.raw`if name == "John": if x == y: print name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('if name == "John": if x == y: print name').parseSubExpressionSecondInline()); // fail

// print(String.raw`if name == "John": print name`);
// print(new Parser('if name == "John": print name').parseSubExpressionSecondInline());

// print(String.raw`if name == "John": print name else: print age`);
// print(new Parser('if name == "John": print name else: print age').parseSubExpressionSecondInline());

// print(String.raw`if name == "John":\n    print name`);
// print(new Parser('if name == "John":\n    print name').parseSubExpressionSecondInline());

print(String.raw`james.peter?\n    .nom()?.john\n    .dame()\nfoo`);
print(new Parser('james.peter?\n    .nom()?.john\n    .dame()\nfoo').parseSubExpressionSecondInline());

print(String.raw`/reggie/, %{54,89}`);
print(new Parser('/reggie/, %{54,89}').parseSubExpressionSecondInline());

print('========= EXPRESSIONSECONDINLINE =========');

// print(String.raw`if name == "John": if x == y: print name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('if name == "John": if x == y: print name').parseExpressionSecondInline()); // fail

// print(String.raw`if name == "John": print name`);
// print(new Parser('if name == "John": print name').parseExpressionSecondInline());

// print(String.raw`if name == "John": print name else: print age`);
// print(new Parser('if name == "John": print name else: print age').parseExpressionSecondInline());

// print(String.raw`if name == "John":\n    print name`);
// print(new Parser('if name == "John":\n    print name').parseExpressionSecondInline());

print(String.raw`james.peter?\n    .nom()?.john\n    .dame()\nfoo`);
print(new Parser('james.peter?\n    .nom()?.john\n    .dame()\nfoo').parseExpressionSecondInline());

print(String.raw`/reggie/, %{54,89}`);
print(new Parser('/reggie/, %{54,89}').parseExpressionSecondInline());

print('========= BLOCK =========');

print(String.raw`\n    5 .+ name\n    2 + name; age = 89\n    print "hello"`);
print(new Parser('\n    5 .+ name\n    2 + name; age = 89\n    print "hello"').parseBlock());

print(String.raw`\n    print "hello"; print.("world")\n    _\n`);
print(new Parser('\n    print "hello"; print.("world")\n    _\n').parseBlock());

print('========= LHSNAME =========');

print(String.raw`...john`);
print(new Parser('...john').parseLhsName());

print(String.raw`_`);
print(new Parser('_').parseLhsName());

print(String.raw`john`);
print(new Parser('john').parseLhsName());

print(String.raw`...`);
print(new Parser('...').parseLhsName());

print('========= LHSARGUMENTS =========');

print(String.raw`peter,_,...john`);
print(new Parser('peter,_,...john').parseLhsArguments());

print(String.raw`_, ..., peter`);
print(new Parser('_, ..., peter').parseLhsArguments());

print(String.raw`...,...peter,_`);
print(new Parser('...,...peter,_').parseLhsArguments());

print(String.raw`...peter`);
print(new Parser('...peter').parseLhsArguments());

print(String.raw`...`);
print(new Parser('...').parseLhsArguments());

print('========= LHSPATTERN =========');

print(String.raw`[peter,_,...john]`);
print(new Parser('[peter,_,...john]').parseLhsPattern());

print(String.raw`(_, ..., peter)`);
print(new Parser('(_, ..., peter)').parseLhsPattern());

print(String.raw`_, ..., peter`);
print(new Parser('_, ..., peter').parseLhsPattern());

print(String.raw`{ _, peter,_,...john }`);
print(new Parser('{ _, peter,_,...john }').parseLhsPattern());

print(String.raw`_`);
print(new Parser('_').parseLhsPattern());

print(String.raw`james`);
print(new Parser('james').parseLhsPattern());

print(String.raw`...james`);
print(new Parser('...james').parseLhsPattern());

print('========= GUARD =========');

print(String.raw`where x == y>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('where x == y').parseGuard()); // fail

print(String.raw` where x == y`);
print(new Parser(' where x == y').parseGuard());

print(String.raw` where name > 45`);
print(new Parser(' where name > 45').parseGuard());

print('========= IFHEADDECLARATION =========');

print(String.raw`let name, peter =500>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('let name, peter =500').parseIfHeadDeclaration()); // fail

print(String.raw`let name, peter = 5, 6`);
print(new Parser('let name, peter = 5, 6').parseIfHeadDeclaration());

print(String.raw`var some_person=[1, 2]?`);
print(new Parser('var some_person=[1, 2]?').parseIfHeadDeclaration());

print('========= IFHEAD =========');

print(String.raw`let name, peter =500>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('let name, peter =500').parseIfHead()); // fail

print(String.raw`let name, peter = 5, 6 where name == 7`);
print(new Parser('let name, peter = 5, 6 where name == 7').parseIfHead());

print(String.raw`var some_person=[1, 2]?`);
print(new Parser('var some_person=[1, 2]?').parseIfHead());

print('========= ELIFEXPRESSION =========');

// print(String.raw`elif name.age <= 500: if foo(): bar() else: print name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('elif name.age <= 500: if foo(): bar() else: print name').parseElifExpression()); // fail

// print(String.raw`elif name.age <= 500: if foo():\n    print name`);
// print(new Parser('elif name.age <= 500: if foo():\n    print name').parseElifExpression());

print(String.raw`elif name.age <= 500: print name\n`);
print(new Parser('elif name.age <= 500: print name\n').parseElifExpression());

print(String.raw`elif name.age <= 500:\n    print name\n    return "hello"`);
print(new Parser('elif name.age <= 500:\n    print name\n    return "hello"').parseElifExpression());

print('========= ELSEEXPRESSION =========');

// print(String.raw`else name.age <= 500: if foo(): bar() else: print name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('else name.age <= 500: if foo(): bar() else: print name').parseElifExpression()); // fail

// print(String.raw`else: if foo():\n    print name`);
// print(new Parser('else: if foo():\n    print name').parseElseExpression());

print(String.raw`else : print name`);
print(new Parser('else : print name').parseElseExpression());

print(String.raw`else:\n    print name\n    return "hello"`);
print(new Parser('else:\n    print name\n    return "hello"').parseElseExpression());

print('========= ELSEEXPRESSIONSECONDINLINE =========');

// print(String.raw`else : if foo(): print name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('else : if foo(): print name').parseElseExpressionSecondInline()); // fail

// print(String.raw`else: if foo():\n    print name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('else: if foo():\n    print name').parseElseExpressionSecondInline()); // fail

print(String.raw`else:\n    print name\n    return "hello">>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('else:\n    print name\n    return "hello"').parseElseExpressionSecondInline()); // fail

print(String.raw`else : print name`);
print(new Parser('else : print name').parseElseExpressionSecondInline());

print('========= IFEXPRESSION =========');

// print(String.raw`if foo(): if x > 4 : if foo(): print name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('if foo(): if x > 4 : if foo(): print name').parseIfExpression()); // fail

// print(String.raw`if x > n:\n    print name else:\n    return "hello">>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('if x > n:\n    print name else:\n    return "hello"').parseIfExpression()); // fail

print(String.raw`if x > n: print name else: return "hello"`);
print(new Parser('if x > n: print name else: return "hello"').parseIfExpression());

print(String.raw`if x > n: print name else:\n    return "hello"`);
print(new Parser('if x > n: print name else:\n    return "hello"').parseIfExpression());

print(String.raw`if x > n:\n    print name\nelse:\n    return "hello"`);
print(new Parser('if x > n:\n    print name\nelse:\n    return "hello"').parseIfExpression());

print(String.raw`if let a = b:\n    print name\nelse: return "hello"`);
print(new Parser('if let a = b:\n    print name\nelse: return "hello"').parseIfExpression());

print(String.raw`if x > y where hello():\n    bar()\nelif let a = b where hi(): foo()\nelse: bar()`);
print(new Parser('if x > y where hello():\n    bar()\nelif let a = b where hi(): foo()\nelse: bar()').parseIfExpression());

print(String.raw`if x > n where foo(): bar(x) \nelif foo(): \n    yield name\nelif let a = b: print(name)\nelse:\n    return "hello"`);
print(new Parser('if x > n where foo(): bar(x) \nelif foo(): \n    yield name\nelif let a = b: print(name)\nelse:\n    return "hello"').parseIfExpression());

print('========= IFEXPRESSIONSECONDINLINE =========');

// print(String.raw`if foo(): if foo(): print name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
// print(new Parser('if foo(): if foo(): print name').parseIfExpression()); // fail

print(String.raw`if x > n: print name else: return "hello">>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('if x > n: print name else: return "hello"').parseIfExpressionSecondInline()); // mid

print(String.raw`if let x = foo():\n    print name`);
print(new Parser('if let x = foo():\n    print name').parseIfExpressionSecondInline());



// // print('========= SUBJECTHEAD =========');

// // print(String.raw`let name, peter`);
// // print(new Parser('let name, peter').parseSubjectHead());

// // print(String.raw`var some_person`);
// // print(new Parser('var some_person').parseSubjectHead());
