const { print } = require('../utils');

/**
 * Notes on parser.
 * - This compiler uses a recursive descent parser with no lexing phase.
 * - There is no lexing phase because the language is whitespace sensitive.
 * - Each parse function reverts its state when its unable to parse successfully.
 * - Inner IIFEs are used to make handling parsing failure within a parse function
 * clear and understandable.
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

  // Check if there is a next char and return it.
  peekChar() {
    // Checking if end of input has not yet been reached
    if (this.lastPosition + 1 < this.code.length) {
      return this.code.charAt(this.lastPosition + 1);
    }
    return null;
  }

  // Reset properties.
  reset(lastPosition, lastParseData, column, line) {
    this.lastPosition = lastPosition;
    this.lastParseData = lastParseData || this.lastParseData;
    this.column = column;
    this.line = line;
  }

  // Try if a set of parse functions will parse successfully.
  tryTo(...parseFunctions) {
    // Keeping original state.
    const {
      lastPosition, column, line, lastParseData,
    } = this;

    let index = 0;
    let parseData = { success: false, data: null };

    // Run each parsefunction one after the other.
    while (index < parseFunctions.length && this[`${parseFunctions[index]}`].success) {
      index += 1;
    }

    // Check if all parseFunctions parsed successfully.
    if (index === parseFunctions.length) {
      // Update parseData.
      parseData = { success: true, data: null };
      return parseData;
    }

    // Revert state, lastParseData included.
    this.reset(lastPosition, lastParseData, column, line);

    return parseData;
  }


  // Parse input string.
  parseToken(str) {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    let parseData = { success: false, data: null };

    // Check if input string matches the subsequent chars in code.
    if (str === this.code.slice(this.lastPosition + 1, this.lastPosition + str.length + 1)) {
      // Update lastPosition.
      this.lastPosition += str.length;

      // Update parseData.
      parseData = { success: true, data: str };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, column, line);

    return parseData;
  }

  // identifier= = [a-zA-Z][a-zA-Z_0-9]*
  parseIdentifier() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const token = [];
    let parseData = { success: false, data: null };

    // Consume the first character. [a-zA-Z]
    if (this.identifierBegin.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());
      // Consume remaining part of identifier. [a-zA-Z_0-9]*
      while (this.identifierMid.indexOf(this.peekChar()) > -1) {
        token.push(this.eatChar());
      }

      // Update parseData.
      parseData = { success: true, data: token.join('') };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, column, line);

    return parseData;
  }

  // operator = [+-*/\\^%!><=÷×≠≈¹²³√]+
  parseOperator() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const token = [];
    let parseData = { success: false, data: null };

    // Consume operator chars. [+-*/\\^%!><=÷×≠≈¹²³√]+
    while (this.operators.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());
    }

    // Check if it was able to consume at least an operator.
    if (token.length > 0) {
      // Update parseData.
      parseData = { success: true, data: token.join('') };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, column, line);

    return parseData;
  }

  // integer = [0-9]+
  parseInteger() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const token = [];
    let parseData = { success: false, data: null };

    // Consume digits. [0-9]+
    while (this.digits.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());
    }

    // Check if it was able to consume at least a digit.
    if (token.length > 0) {
      // Update parseData.
      parseData = { success: true, data: token.join('') };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, column, line);

    return parseData;
  }

  // expression = integer | identifier
  parseExpression() {
    if (this.parseInteger().success) {
      return this.lastParseData;
    } else if (this.parseIdentifier().success) {
      return this.lastParseData;
    }
    return { success: false, data: null };
  }

  // spaces = [ \t]+
  parseSpaces() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    let count = 0;
    let parseData = { success: false, data: null };

    // Consume spaces. [ \t]+
    while (this.spaces.indexOf(this.peekChar()) > -1) {
      this.eatChar();
      count += 1;
    }

    // Check if it was able to consume at least one whitespace.
    if (count > 0) {
      // Update parseData.
      parseData = { success: true, data: null };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, column, line);

    return parseData;
  }

  // subjectdeclaration =
  //   | ('let'/'var') _ identifier (_ '=' _ expression | '=' !(operator) expression)
  parseSubjectDeclaration() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    let mutability;
    let identifier;
    let expression;
    let parseData = { success: false, data: null };

    (() => {
      // Consume ('let'/'var').
      if (!this.parseToken('let').success && !this.parseToken('var').success) return null;
      mutability = this.lastParseData.data;

      // Consume _.
      if (!this.parseSpaces().success) return null;

      // Consume identifier.
      if (!this.parseIdentifier().success) return null;
      identifier = this.lastParseData.data;

      // Alternate parsing. _ '=' _ expression | '=' !(operator) expression
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. _ '=' _ expression
      (() => {
        // Consume _.
        if (!this.parseSpaces().success) return;

        // Consume '='.
        if (!this.parseToken('=').success) return;

        // Consume _.
        if (!this.parseSpaces().success) return;

        // Consume expression.
        if (!this.parseExpression().success) return;
        expression = this.lastParseData.data;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '=' !(operator) expression
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.column, state.line);

        (() => {
          // Consume '='.
          if (!this.parseToken('=').success) return;

          // Make sure next token isn't an operator.
          if (this.tryTo('parseOperator').success) return;

          // Consume expression.
          if (!this.parseExpression().success) return;
          expression = this.lastParseData.data;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, data: [mutability, identifier, expression] };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, column, line);

    return parseData;
  }

  // functiondeclaration =
  //   | 'fun' _ identifier _? '(' _? ')' (_ '=' _ expression | '=' !(operator) expression)
  parseFunctionDeclaration() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    let identifier;
    let expression;
    let parseData = { success: false, data: null };

    (() => {
      // Consume ('fun').
      if (!this.parseToken('fun').success) return null;

      // Consume _.
      if (!this.parseSpaces().success) return null;

      // Consume identifier.
      if (!this.parseIdentifier().success) return null;
      identifier = this.lastParseData.data;

      // Consume _?.
      this.parseSpaces();

      // Consume '('.
      if (!this.parseToken('(').success) return null;

      // Consume _?.
      this.parseSpaces();

      // Consume ')'.
      if (!this.parseToken(')').success) return null;

      // Alternate parsing. _ '=' _ expression | '=' !(operator) expression
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. _ '=' _ expression
      (() => {
        // Consume _.
        if (!this.parseSpaces().success) return;

        // Consume '='.
        if (!this.parseToken('=').success) return;

        // Consume _.
        if (!this.parseSpaces().success) return;

        // Consume expression.
        if (!this.parseExpression().success) return;
        expression = this.lastParseData.data;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '=' !(operator) expression
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.column, state.line);

        (() => {
          // Consume '='.
          if (!this.parseToken('=').success) return;

          // Make sure next token isn't an operator.
          if (this.tryTo('parseOperator').success) return;

          // Consume expression.
          if (!this.parseExpression().success) return;
          expression = this.lastParseData.data;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, data: [identifier, expression] };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, column, line);

    return parseData;
  }
}

module.exports = Parser;
