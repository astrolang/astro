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

print(String.raw`name__55 nom>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('name__55  nom').parseIdentifier()); // mid

print(String.raw`_na99_me_`);
print(new Parser('_na99_me_').parseIdentifier());

print('========= OPERATOR =========');

print(' -*=>>>>>>>>>>>>>>>>>>>>>>>>FAIL'); // fail
print(new Parser(' -*=').parseOperator()); // fail

print(String.raw`)++>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser(')++').parseOperator()); // fail

print(String.raw`%^&_nom>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('%^&_nom').parseOperator()); // mid

print(String.raw`=`);
print(new Parser('=').parseOperator());

print(String.raw`++/-`);
print(new Parser('++/-').parseOperator());

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

print('========= NAMESEPARATOR =========');

print(String.raw`name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('name').parseNameSeparator()); // fail

print(String.raw`556>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('556').parseNameSeparator()); // fail

print(String.raw` games`);
print(new Parser(' games').parseNameSeparator());

print(String.raw`+age`);
print(new Parser('+age').parseNameSeparator());

print(String.raw`(556`);
print(new Parser('(556').parseNameSeparator());

print(String.raw`.name`);
print(new Parser('.name').parseNameSeparator());

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

print(String.raw`@ {\n        age: 50, name: "Tosin"\n    }`);
print((() => {
  const parser = new Parser('@ {\n        age: 50, name: "Tosin"\n    }');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseDictLiteral();
})());

print(String.raw`@ {\n    /name/ : {\n        john: 20\n    }, 500 : "500",\n}`);
print(new Parser('@ {\n    /name/ : {\n        john: 20\n    }, 500 : "500",\n}').parseDictLiteral());

print(String.raw`@{\n    /name/ : "john" , 500 : "500",\n}`);
print(new Parser('@{\n    /name/ : "john" , 500 : "500",\n}').parseDictLiteral());

print(String.raw`@{\n    "value": 1_000e24  \n    game  \n    hello: {\n        a: 10\n    }, /reg/: sunny\n}`);
print(new Parser('@{\n    "value": 1_000e24  \n    game  \n    hello: {\n        a: 10\n    }, /reg/: sunny\n}').parseDictLiteral());


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

print('========= COMMANDNOTATIONPOSTFIX =========');

print(String.raw`foo>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('foo').parseCommandNotationPostfix()); // fail

print(String.raw` [1, 2, 3]>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser(' [1, 2, 3]').parseCommandNotationPostfix()); // fail

print(String.raw` 2_0056`);
print(new Parser(' 2_0056').parseCommandNotationPostfix());

print(String.raw` $symbol`);
print(new Parser('  $symbol').parseCommandNotationPostfix());

print(String.raw` 'hello world'`);
print(new Parser(" 'hello world'").parseCommandNotationPostfix());

print(String.raw` foo`);
print(new Parser(' foo').parseCommandNotationPostfix());

// print(String.raw`  1..20`);
// print(new Parser('  1..20').parseCommandNotationPostfix());

// print(String.raw`  foo 25`);
// print(new Parser('  foo 25').parseCommandNotationPostfix());

// print(String.raw`  'hi' + 25`);
// print(new Parser("  'hi' +  25").parseCommandNotationPostfix());

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

print('========= DOTNOTATIONPOSTFIX =========');

print(String.raw`. name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('. name').parseDotNotationPostfix()); // fail

print(String.raw`.address45`);
print(new Parser('.address45').parseDotNotationPostfix());

print(String.raw`  .address45`);
print(new Parser('  .address45').parseDotNotationPostfix());

print(String.raw`.$commons`);
print(new Parser('.$commons').parseDotNotationPostfix());

print('========= CASCADINGNOTATIONPOSTFIX =========');

print(String.raw`~ name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('~ name').parseCascadingNotationPostfix()); // fail

print(String.raw`~address45`);
print(new Parser('~address45').parseCascadingNotationPostfix());

print(String.raw`  ~address45`);
print(new Parser('  ~address45').parseCascadingNotationPostfix());

print(String.raw`~$commons`);
print(new Parser('~$commons').parseCascadingNotationPostfix());

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

print('========= RANGE =========');

print(String.raw` .. >>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser(" .. ").parseRange()); // fail

print(String.raw`45..name..'hi'`);
print(new Parser("45..name..'hi'").parseRange());

// print(String.raw`-1..'hi'`);
// print(new Parser("-1..'hi'").parseRange());

print(String.raw`..name..'hi'`);
print(new Parser("..name..'hi'").parseRange());

print(String.raw`45..`);
print(new Parser("45..").parseRange());

print(String.raw`..45..`);
print(new Parser("..45..").parseRange());

print('========= TERNARYOPERATOR =========');

print(String.raw`(45) ? name>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser("(45) ? name").parseTernaryOperator()); // fail

print(String.raw`(name) ? age : cost`);
print(new Parser("(name) ? age : cost").parseTernaryOperator());

print(String.raw`(  /hello/  )?age:cost`);
print(new Parser("(  /hello/  )?age:cost").parseTernaryOperator());

// print(String.raw`(/hello/ == regex)?age:cost`);
// print(new Parser("(/hello/ == regex)?age:cost").parseTernaryOperator());
