const { print } = require('../utils');

/**
 * This compiler uses a recursive descent parser with no lexing phase.
 * There is no lexing phase because the language is whitespace sensitive.
 */
class Parser {
  constructor(code) {
    this.code = code;
    // Parser
    this.lastPosition = -1;
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
  
  incrementLineCount() {
    this.line += 1;
    this.column = 0; // Reset column number.
  }

  eatToken(length) {
    if (this.lastPosition + length < thiscode.length) {
      const oldPosition = this.lastPosition;
      this.lastPosition += length;
      return code.slice(oldPosition, this.lastPosition + 1);
    }
    return null;
  }

  eatChar() {
    // I use peek-before-consume strategy, so I don't need to do checks here
    // because its already done in `peek`.
    this.lastPosition += 1;
    this.column += 1;
    return this.code.charAt(this.lastPosition);
  }

  peekChar() {
    if (this.lastPosition + 1 < this.code.length) {
      return this.code.charAt(this.lastPosition + 1);
    }
    return null;
  }

  stepBack(length) { this.lastPosition -= length || 1; }

  // [a-zA-Z][a-zA-Z_0-9]*
  parseIdentifier() {
    let token = [];
    if (this.identifierBegin.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());
      while (this.identifierMid.indexOf(this.peekChar()) > -1) {
        token.push(this.eatChar());
      }
      return { success: true, data: token.join('') };
    }
    return { success: false, data: null };
  }
  
  parseExpression() {
    if (this.parseInteger().success) {}
  }
    
  // [ \t]
  parseWhitespaces() {
    let count = 0;
    while (this.spaces.indexOf(this.peekChar()) > -1) {
      this.eatChar();
      count += 1;
    }
    if (count < 1) {
      return { success: false, data: null };
    }
    return { success: true, data: null };
  }

  // [0-9]+
  parseInteger() {
    let token = [];
    while (this.digits.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());
    }
    if (token.length < 1) {
        return { success: false, data: null };
    }
    return { success: true, data: token.join('') };
  }
  
  // ('let'/'var') identifier '=' expression
  parseSubjectDeclaration() {
    
  }

}

module.exports = Parser;
