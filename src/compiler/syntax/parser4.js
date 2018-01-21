const { print } = require('../utils');

/**
 * Notes on parser.
 * - This compiler uses a recursive descent parser with no lexing phase.
 * - There is no lexing phase because the language is whitespace sensitive.
 * - Each parse function reverts its state when its unable to parse successfully.
 * - Inner IIFEs are used to return to function scope if parsing fails.
 */
class Parser {
  constructor(code) {
    this.code = code;
    // Parser
    this.lastPosition = -1;
    this.lastParseData = null;
    // Information
    this.column = 0;
    this.line = 1;
    // Characters
    this.digits = '0123456789';
    this.digitsBin = '01';
    this.digitsOct = '01234567';
    this.digitsHex = '0123456789ABCDEFabcdef';
    this.alphabets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Unicode?
    this.spaces = ' \t'; // Unicode?
    this.operators = '+-*/\\^%!><=÷×≠≈¹²³√'; // Unicode?
    this.identifierBegin = `${this.alphabets}_`;
    this.identifierMid = `${this.alphabets}${this.digits}_`;
  }

  // Increment number line count.
  incrementLineCount() {
    this.line += 1;
    this.column = 0; // Reset column number.
  }

  // Consume next char.
  eatChar() {
    // I use peek-before-consume strategy, so I don't need to do checks here
    // because it will already be done when `peek` is called.
    this.lastPosition += 1;
    this.column += 1;
    return this.code.charAt(this.lastPosition);
  }

  // Return the next char.
  peekChar() {
    // Checking if end of input has not yet been reached
    if (this.lastPosition + 1 < this.code.length) {
      return this.code.charAt(this.lastPosition + 1);
    }
    return null;
  }

  // TO BE REMOVED
  // Check if input string comes next in code.
  peekToken(str) {
    // Check if input string matches the subsequent chars in code.
    if (str === this.code.slice(this.lastPosition + 1, this.lastPosition + str.length + 1)) {
      // parseData
      return { success: true, data: str };
    }
    return { success: false, data: null };
  }

  // [a-zA-Z][a-zA-Z_0-9]*
  parseIdentifier() {
    const token = [];

    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    // Consume the first character. [a-zA-Z]
    if (this.identifierBegin.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());
      // Consume remaining part of identifier. [a-zA-Z_0-9]*
      while (this.identifierMid.indexOf(this.peekChar()) > -1) {
        token.push(this.eatChar());
      }

      // parseData
      const parseData = { success: true, data: token.join('') };

      // Update lastParseData
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.lastPosition = lastPosition;
    this.column = column;
    this.line = line;

    return { success: false, data: null };
  }

  // Parse input string.
  parseToken(str) {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    // Check if input string matches the subsequent chars in code.
    if (str === this.code.slice(this.lastPosition + 1, this.lastPosition + str.length + 1)) {
      // Update lastPosition
      this.lastPosition += str.length;

      // parseData
      const parseData = { success: true, data: str };

      // Update lastParseData
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.lastPosition = lastPosition;
    this.column = column;
    this.line = line;

    return { success: false, data: null };
  }

  // Integer | Identifier
  parseExpression() {
    if (this.parseInteger().success) {
      return this.lastParseData;
    } else if (this.parseIdentifier().success) {
      return this.lastParseData;
    }
    return { success: false, data: null };
  }

  // [ \t]+
  parseWhitespaces() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    let count = 0;

    // Consume spaces. [ \t]+
    while (this.spaces.indexOf(this.peekChar()) > -1) {
      this.eatChar();
      count += 1;
    }

    // Check if it was able to consume at least one whitespace.
    if (count > 0) {
      // parseData
      const parseData = { success: true, data: null };

      // Update lastParseData
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.lastPosition = lastPosition;
    this.column = column;
    this.line = line;

    return { success: false, data: null };
  }

  // [0-9]+
  parseInteger() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const token = [];

    // Consume digits. [0-9]+
    while (this.digits.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());
    }

    // Check if it was able to consume at least a digit.
    if (token.length > 0) {
      // parseData
      const parseData = { success: true, data: token.join('') };

      // Update lastParseData
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.lastPosition = lastPosition;
    this.column = column;
    this.line = line;

    return { success: false, data: null };
  }

  // ('let'/'var') identifier '=' expression
  parseSubjectDeclaration() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    let mutability;

    // IIFE
    (() => {
      // Consume ('let'/'var')
      if (this.parseToken('let').success || this.parseToken('var').success) return;

      // Consume 
      if (!this.parseWhitespaces.success) return;
    })

    // Parsing failed, so revert state.
    this.lastPosition = lastPosition;
    this.column = column;
    this.line = line;

    return { success: false, data: null };
  }
}

module.exports = Parser;
