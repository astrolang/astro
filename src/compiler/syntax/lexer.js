// eslint-disable-next-line no-unused-vars
const { print } = require('../utils');

/**
 * The Lexer.
 * result = [{ token, kind, line, column }]
 * TODO:
 *  * Add backtracking into lexer functions without using IIFE.
 *  * lastPosition, column, line
 */
class Lexer {
  constructor(code) {
    // Input code.
    this.code = code;
    // Location information.
    this.lastPosition = -1;
    this.column = 0;
    this.line = 1;
    // Characters.
    this.spaceChar = ' \t';
    this.digitBinary = '01';
    this.digitOctal = '01234567';
    this.digitDecimal = '0123456789';
    this.digitHexadecimal = '0123456789ABCDEFabcdef';
    this.identifierBeginChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'; // Unicode?
    this.identifierEndChar = `${this.identifierBeginChar}${this.digitDecimal}`;
    this.operatorChar = '+-*/\\^%&|!><=÷×≠≈¹²³√'; // Unicode?
    this.importNameChar = `${this.identifierEndChar}-`; // Unicode?
    this.keywords = [
      'import', 'export', 'let', 'var', 'const', 'fun', 'type', 'abst', 'async',
      'ref', 'val', 'iso', 'acq', 'if', 'elif', 'else', 'while', 'for', 'try',
      'except', 'ensure', 'defer', 'loop', 'end', 'spill', 'return', 'raise', 'break',
      'continue', 'yield', 'from', 'await', 'where', 'at', 'is', 'not', 'in', 'as',
      'mod', 'typeof', 'new', 'super',
    ];
  }

  // Consume next char, which also means updating lastPosition.
  // TODO: This needs to work properly with Unicode.
  eatChar() {
    // I use peek-before-consume strategy, so I don't need to do checks here
    // because it will already be done when `peek` is called.
    this.lastPosition += 1;
    this.column += 1;
    return this.code.charAt(this.lastPosition);
  }

  // Check if there is a next char and return it.
  peekChar() {
    // Check if end of input has not yet been reached.
    if (this.lastPosition + 1 < this.code.length) {
      return this.code.charAt(this.lastPosition + 1);
    }
    return null;
  }

  // Reverts the state of the lexer object using arguments provided.
  revert(lastPosition, column, line) {
    this.lastPosition = lastPosition;
    this.column = column;
    this.line = line;
  }

  // spacechar =
  //   | [ \t] // Unicode?
  // spaces =
  //   | space+
  spaces() {
    let { lastPosition, column, line } = this;
    const token = '';
    const kind = 'spaces';
    const startLine = line;
    const startColumn = column;
    let spaceCount = 0;

    // Check if subsequent chars in input code are valid space character.
    while (this.spaceChar.indexOf(this.peekChar()) > -1) {
      this.eatChar();
      spaceCount += 1;
    }

    // Check if lexing failed.
    if (spaceCount === 0) {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // noname =
  //   | '_'
  noName() {
    let { lastPosition, column, line } = this;
    let token = '';
    const kind = 'noname';
    const startLine = line;
    const startColumn = column;

    // Check if next char in input code is a '_' character.
    if (this.peekChar() === '_') {
      token += this.eatChar();
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // identifierbeginchar =
  //   | [a-zA-Z_] // Unicode?
  // identifierendchar =
  //   | identifierbeginchar
  //   | digit
  // identifier =
  //   | identifierbeginchar identifierendchar* // Contains keyword check
  //   { token, kind, startLine, stopLine, startColumn, stopColumn } :: identifier
  //   { token, kind, startLine, stopLine, startColumn, stopColumn } :: keyword
  identifier() {
    let { lastPosition, column, line } = this;
    let token = '';
    const kind = 'identifier';
    const startLine = line;
    const startColumn = column;

    // Check if next char in input code is a valid identifier start character.
    if (this.identifierBeginChar.indexOf(this.peekChar()) > -1) {
      token += this.eatChar();
      // Check if subsequent chars are valid identifier character as well.
      while (this.identifierEndChar.indexOf(this.peekChar()) > -1) {
        token += this.eatChar();
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    // Check if lexed identifier is a keyword.
    if (this.keywords.indexOf(token) > -1) {
      return {
        token, kind: 'keyword', startLine, stopLine, startColumn, stopColumn,
      };
    }

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // operatorchar =
  //   | [+\-*/\\^%!><=÷×≠≈¹²³√] // Unicode?
  // operator =
  //   | operatorchar+
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  operator() {
    let { lastPosition, column, line } = this;
    let token = '';
    const kind = 'operator';
    const startLine = line;
    const startColumn = column;

    // Check if subsequent chars in input code are valid operator character.
    while (this.operatorChar.indexOf(this.peekChar()) > -1) {
      token += this.eatChar();
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // punctuator =
  //   | [(){}[\],.~] // TODO: Incomplete
  punctuator() {
    let { lastPosition, column, line } = this;
    let token = '';
    const kind = 'punctuator';
    const startLine = line;
    const startColumn = column;

    // Check if subsequent chars in input code are valid operator character.
    if ('(){}[],.~;'.indexOf(this.peekChar()) > -1) {
      token += this.eatChar();
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // digitbinary =
  //   | [0-1]
  // digitoctal =
  //   | [0-7]
  // digitdecimal =
  //   | [0-9]
  // digithexadecimal =
  //   | [0-9a-fA-F]
  // integerbinaryliteral =
  //   | '0b' digitbinary ('_'? digitbinary)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // integeroctalliteral  =
  //   | '0o' digitoctal ('_'? digitoctal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // integerhexadecimalliteral  =
  //   | '0x' digithexadecimal ('_'? digithexadecimal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // integerdecimalliteral  =
  //   | digitdecimal ('_'? digitdecimal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // floatbinaryliteral  =
  //   | '0b' digitbinary ('_'? digitbinary)* '.' digitbinary ('_'? digitbinary)* ('e' [-+]? digitbinary ('_'? digitbinary)*)?
  //   | '0b' digitbinary ('_'? digitbinary)* 'e' [-+]? digitbinary ('_'? digitbinary)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // floatoctalliteral  =
  //   | '0o' digitoctal ('_'? digitoctal)* '.' digitoctal ('_'? digitoctal)* ('e' [-+]? digitoctal ('_'? digitoctal)*)?
  //   | '0o' digitoctal ('_'? digitoctal)* 'e' [-+]? digitoctal ('_'? digitoctal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // floathexadecimalliteral  =
  //   | '0x' digithexadecimal ('_'? digithexadecimal)* '.' digithexadecimal ('_'? digithexadecimal)* ('p' [-+]? digithexadecimal ('_'? digithexadecimal)*)?
  //   | '0x' digithexadecimal ('_'? digithexadecimal)* 'p' [-+]? digithexadecimal ('_'? digithexadecimal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // floatdecimalliteral  =
  //   | (digitdecimal ('_'? digitdecimal)*)? '.' digitdecimal ('_'? digitdecimal)* ('e' [-+]? digitdecimal ('_'? digitdecimal)*)?
  //   | digitdecimal ('_'? digitdecimal)* 'e' [-+]? digitdecimal ('_'? digitdecimal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // doublequotestringchars =
  //   | (!(newline | '"') .)+ // TODO
  // singlequotestringchars =
  //   | (!(newline | "'") .)+ // TODO
  // singlelinestringliteral =
  //   | "'" singlequotestringchars? "'"
  //   | '"' doublequotestringchars? '"'
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // triplesinglequotestringchars =
  //   | (!(newline | "'''") .)+ // TODO
  // tripledoublequotestringchars =
  //   | (!(newline | '"""') .)+ // TODO
  // multilinestringliteral =
  //   | "'''" triplesinglequotestringchars? (nextline samedent triplesinglequotestringchars?)* "'''"
  //   | '"""' tripledoublequotestringchars? (nextline samedent tripledoublequotestringchars?)* '"""'
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // regexchars =
  //   | (!(newline | '/') .)+ // TODO
  // regexliteral =
  //   | '/' regexchars? '/'
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // booleanliteral =
  //   | 'true'
  //   | 'false'
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // singlelinecommentchars =
  //   | (!(newline) .)+ // TODO
  //   { token }

  // singlelinecomment =
  //   | "#" singlelinecommentchars? &(newline | eoi)
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // multilinecommentchars =
  //   | (!('#=' | '=#') .)+ // TODO
  //   { token }

  // innermultilinecomment =
  //   | "#=" multilinecommentchars? (innermultilinecomment multilinecommentchars?)* '=#'
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // multilinecomment =
  //   | "#=" multilinecommentchars? (innermultilinecomment multilinecommentchars?)* '=#' _? &(newline | eoi)
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }


  lex() {
  }
}

module.exports = Lexer;
