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

print(String.raw`0b0.11_FF>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0b0.11_FF').parseFloatLiteral()); // mid

print(String.raw`02.2eF_F6>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('02.2eF_F6').parseFloatLiteral()); // mid

print(String.raw`0x1ffe-2_9FG>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0x1ffe-2_9FG').parseFloatLiteral()); // mid

print(String.raw`0b1__1011>>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser('0b1__1011').parseFloatLiteral()); // mid

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

print('========= _ =========');

print(String.raw`...>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('...').parseSpaces()); // fail

print(String.raw`...\n    •>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('...\n    •');
  parser.lastIndentCount = 2; // Two indent levels.
  return parser.parseSpaces();
})());

print(String.raw`...\n    •`);
print((() => {
  const parser = new Parser('...\n    •');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseSpaces();
})());

print(String.raw`  \t \t`);
print(new Parser('  \t \t').parseSpaces());

print(String.raw`\t    `);
print(new Parser('\t    ').parseSpaces());

print('========= SINGLELINESTRING =========');

print(String.raw`">>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('"').parseSingleLineString()); // fail

print(String.raw`'hello world'`);
print(new Parser("'hello world'").parseSingleLineString());

print(String.raw`"hello world"`);
print(new Parser('"hello world"').parseSingleLineString());

print(String.raw`''`);
print(new Parser("''").parseSingleLineString());

print('========= MULTILINESTRING =========');

print(String.raw`'''>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser("'''").parseMultiLineString()); // fail

print(String.raw`"""\n    hello world\n""">>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('"""\n    hello world\n"""');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseMultiLineString();
})());

print(String.raw`"""hello\nworld\n    """>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print(new Parser('"""hello\nworld\n    """').parseMultiLineString()); // fail

print(String.raw`"""\n    hello world\n        """>>>>>>>>>>>>>>>>>>>>>>>>FAIL`); // fail
print((() => { // fail
  const parser = new Parser('"""\n    hello world\n        """');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseMultiLineString();
})());

print(String.raw`"""\n    hello world\n    """`);
print((() => {
  const parser = new Parser('"""\n    hello world\n    """');
  parser.lastIndentCount = 1; // One indent level.
  return parser.parseMultiLineString();
})());

print(String.raw`'''hello\nworld'''`);
print(new Parser("'''hello\nworld'''").parseMultiLineString());

print(String.raw`"""hello\nworld\n"""`);
print(new Parser('"""hello\nworld\n"""').parseMultiLineString());

print(String.raw`""""""`);
print(new Parser('""""""').parseMultiLineString());

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
print(new Parser("/\\d+\n/").parseRegexLiteral()); // fail

print(String.raw`/age / name />>>>>>>>>>>>>>>>>>>>>>>>MID`); // mid
print(new Parser("/age / name /").parseRegexLiteral()); // mid

print(String.raw`/[0-9a-z]+\\d+/`);
print(new Parser("/[0-9a-z]+\\d+/").parseRegexLiteral());

print(String.raw`//`);
print(new Parser('//').parseRegexLiteral());

print('========= ENDCOMMA =========');

print(String.raw`,`);
print(new Parser(",").parseEndComma());

print(String.raw`\t\t  ,`);
print(new Parser('\t\t  ,').parseEndComma());

