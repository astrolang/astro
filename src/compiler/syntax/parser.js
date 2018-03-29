const { print } = require('../utils');

/**
 * The Lexer.
 * identifier, keywords, binint, octint, decint, hexint, binfloat, octfloat, decfloat, hexfloat,
 * singlelinestr, multilinetestr, regex
 * singlelinecomment, multilinecomment, punctuator, operator, boolean
 * result = [{ token, kind, line, column }]
 */
class Lexer {
  constructor(code) {
    // Input code
    this.code = code;
    // Location information
    this.lastPosition = -1;
    this.column = 0;
    this.line = 1;
    // Characters.
    this.digitBinary = '01';
    this.digitOctal = '01234567';
    this.digitDecimal = '0123456789';
    this.digitHexadecimal = '0123456789ABCDEFabcdef';
    this.identifierBeginChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'; // Unicode?
    this.identifierEndChar = `${this.identifierBeginChar}${this.digitDecimal}`;
    this.operatorChar = '+-*/\\^%&|!><=÷×≠≈¹²³√'; // Unicode?
    this.importNameChar = `${this.identifierEndChar}-`; // Unicode?
    this.space = ' \t'; // Unicode?
  }

  lex() {
  }
}

/**
 * A Packrat Parser.
 */
class Parser {
  constructor(tokens) {
    // Lexed token list.
    this.tokens = tokens;
    // Parser information.
    this.lastPosition = -1;
    this.lastParseData = null;
    this.lastIndentCount = 0;
    this.column = 0;
    this.line = 1;
    this.ignoreNewline = false;
  }

  parse(...args) {
    let { } = this; // State before parsing.
    let result = [];
    // Parse each argument.
    for (let arg of args) {
      // Function.
      if (typeof(arg) === 'function') {
        let x = arg();
        if (x) { result.push(x) }
        else {
          result = null;
          break;
        }
      // String.
      } else if (typeof(arg) === 'string') {
        let x = token(arg);
        if (x) { result.push(x) }
        else {
          result = null;
          break;
        }
      // Object.
      } else if (typeof(arg) === 'object') {
        if (arg) { result.push(x) }
        else {
          result = null;
          break;
        }
      // None of the above.
      } else throw new Error('Got the wrong argument type');
    }
    // Check if parsing failed.
    if (result) { return result }
    else {
      this.revert({ });
      return null;
    }
  }
}
