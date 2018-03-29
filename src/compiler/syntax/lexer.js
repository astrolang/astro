// eslint-disable-next-line no-unused-vars
const { print } = require('../utils');

/**
 * The Lexer.
 * result = [{ token, kind, line, column }]
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

  // spacechar =
  //   | [ \t] // Unicode?
  // spaces =
  //   | space+
  spaces() {
    const token = '';
    const kind = 'spaces';
    const { line, column } = this;
    let spaceCount = 0;

    // Check if subsequent chars in input code are valid space character.
    while (this.spaceChar.indexOf(this.peekChar()) > -1) {
      this.eatChar();
      spaceCount += 1;
    }

    // Check if lexing failed.
    if (spaceCount === 0) return null;
    return {
      token, kind, line, column,
    };
  }

  // noname =
  //   | '_'
  noName() {
    let token = '';
    const kind = 'noname';
    const { line, column } = this;

    // Check if next char in input code is a '_' character.
    if (this.peekChar() === '_') {
      token += this.eatChar();
    }

    // Check if lexing failed.
    if (token === '') return null;
    return {
      token, kind, line, column,
    };
  }

  // identifierbeginchar =
  //   | [a-zA-Z_] // Unicode?
  // identifierendchar =
  //   | identifierbeginchar
  //   | digit
  // identifier =
  //   | identifierbeginchar identifierendchar* // Contains keyword check
  //   { kind, name } :: identifier
  //   { kind, name } :: keyword
  identifier() {
    let token = '';
    const kind = 'identifier';
    const { line, column } = this;

    // Check if next char in input code is a valid identifier start character.
    if (this.identifierBeginChar.indexOf(this.peekChar()) > -1) {
      token += this.eatChar();
      // Check if subsequent chars are valid identifier character as well.
      while (this.identifierEndChar.indexOf(this.peekChar()) > -1) {
        token += this.eatChar();
      }
    }

    // Check if lexing failed.
    if (token === '') return null;

    // Check if lexed identifier is a keyword.
    if (this.keywords.indexOf(token) > -1) {
      return {
        token, kind: 'keyword', line, column,
      };
    }
    return {
      token, kind, line, column,
    };
  }

  // operatorchar =
  //   | [+\-*/\\^%!><=÷×≠≈¹²³√] // Unicode?

  // operator =
  //   | operatorchar+
  //   { kind, name }

  // punctuatorchar =
  //   | [(){}[\],.~] // TDO: Incomplete

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
  //   { kind, value }

  // integeroctalliteral  =
  //   | '0o' digitoctal ('_'? digitoctal)*
  //   { kind, value }

  // integerhexadecimalliteral  =
  //   | '0x' digithexadecimal ('_'? digithexadecimal)*
  //   { kind, value }

  // integerdecimalliteral  =
  //   | digitdecimal ('_'? digitdecimal)*
  //   { kind, value }

  // floatbinaryliteral  =
  //   | '0b' digitbinary ('_'? digitbinary)* '.' digitbinary ('_'? digitbinary)* ('e' [-+]? digitbinary ('_'? digitbinary)*)?
  //   | '0b' digitbinary ('_'? digitbinary)* 'e' [-+]? digitbinary ('_'? digitbinary)*
  //   { kind, value }

  // floatoctalliteral  =
  //   | '0o' digitoctal ('_'? digitoctal)* '.' digitoctal ('_'? digitoctal)* ('e' [-+]? digitoctal ('_'? digitoctal)*)?
  //   | '0o' digitoctal ('_'? digitoctal)* 'e' [-+]? digitoctal ('_'? digitoctal)*
  //   { kind, value }

  // floathexadecimalliteral  =
  //   | '0x' digithexadecimal ('_'? digithexadecimal)* '.' digithexadecimal ('_'? digithexadecimal)* ('p' [-+]? digithexadecimal ('_'? digithexadecimal)*)?
  //   | '0x' digithexadecimal ('_'? digithexadecimal)* 'p' [-+]? digithexadecimal ('_'? digithexadecimal)*
  //   { kind, value }

  // floatdecimalliteral  =
  //   | (digitdecimal ('_'? digitdecimal)*)? '.' digitdecimal ('_'? digitdecimal)* ('e' [-+]? digitdecimal ('_'? digitdecimal)*)?
  //   | digitdecimal ('_'? digitdecimal)* 'e' [-+]? digitdecimal ('_'? digitdecimal)*
  //   { kind, value }

  // singlequotestringchars =
  //   | (!(newline | "'") .)+ // TODO
  //   { token }

  // doublequotestringchars =
  //   | (!(newline | '"') .)+ // TODO
  //   { token }

  // singlelinestringliteral =
  //   | "'" singlequotestringchars? "'"
  //   | '"' doublequotestringchars? '"'
  //   { kind, token }

  // triplesinglequotestringchars =
  //   | (!(newline | "'''") .)+ // TODO
  //   { token }

  // tripledoublequotestringchars =
  //   | (!(newline | '"""') .)+ // TODO
  //   { token }

  // multilinestringliteral =
  //   | "'''" triplesinglequotestringchars? (nextline samedent triplesinglequotestringchars?)* "'''"
  //   | '"""' tripledoublequotestringchars? (nextline samedent tripledoublequotestringchars?)* '"""'
  //   { kind, token }

  // regexchars =
  //   | (!(newline | '/') .)+ // TODO
  //   { token }

  // regexliteral =
  //   | '/' regexchars? '/'
  //   { kind, token }

  // booleanliteral =
  //   | 'true'
  //   | 'false'
  //   { kind, value }

  // singlelinecommentchars =
  //   | (!(newline) .)+ // TODO
  //   { token }

  // singlelinecomment =
  //   | "#" singlelinecommentchars? &(newline | eoi)
  //   { kind, token }

  // multilinecommentchars =
  //   | (!('#=' | '=#') .)+ // TODO
  //   { token }

  // innermultilinecomment =
  //   | "#=" multilinecommentchars? (innermultilinecomment multilinecommentchars?)* '=#'
  //   { kind, token }

  // multilinecomment =
  //   | "#=" multilinecommentchars? (innermultilinecomment multilinecommentchars?)* '=#' _? &(newline | eoi)
  //   { kind, token }


  lex() {
  }
}

module.exports = Lexer;
