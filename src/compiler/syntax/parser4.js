/**
 * This compiler uses a recursive descent parser with no lexing phase.
 * There is no lexing phase because the language is whitespace sensitive.
 */
class Parser {
  constructor(code) {
    // State
    this.code = code;
    this.lastPosition = -1;
    // Characters
    this.digits = '0123456789';
    this.digitsBin = '01';
    this.digitsOct = '01234567';
    this.digitsHex = '0123456789ABCDEFabcdef';
    this.alphabets = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Unicode?
    this.spaces = ' \t'; // Unicode?
    this.operators = '+-*/\\^%!><=÷×≠≈¹²³√'; // Unicode?
    this.identifierMid = `${this.alphabets}${this.digits}_`;
  }

  eatToken(length) {
    const { lastPosition, code } = this;
    if (lastPosition + length < code.length) {
      const oldPosition = lastPosition;
      this.lastPosition += length;
      return code.slice(oldPosition, lastPosition + 1);
    }
    return null;
  }

  eatChar() {
    const { lastPosition, code } = this;
    if (lastPosition + 1 < code.length) {
      this.lastPosition += 1;
      return code.charAt(this.lastPosition);
    }
    return null;
  }

  peekChar() {
    const { lastPosition, code } = this;
    if (lastPosition + 1 < code.length) {
      return code.charAt(this.lastPosition);
    }
    return null;
  }

  stepBack(length) { this.lastPosition -= length || 1; }

  // [a-zA-Z][a-zA-Z_0-9]+
  parseIdentifier() {
    const { peekChar } = this;
    // Normal identifier.
    let token = [];
    if (alphabets.indexOf(peekChar()) > -1) {
      token.push();
    } else throw Error('ParseError: Expected an identifier!');
    // Operator identifier.
  }

  parseSpaces() {
  }

  parseInteger() {
  }

}

const p = Parser('name').parseIdentifier();


module.exports = Parser;
