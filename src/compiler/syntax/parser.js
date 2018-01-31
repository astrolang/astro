/* eslint-disable no-constant-condition */
// eslint-disable-next-line no-unused-vars
const { print } = require('../utils');

/**
 * Notes on parser.
 * - This compiler uses a recursive descent parser with no lexing phase.
 * - There is no lexing phase because the language is whitespace sensitive.
 * - Each parse function reverts its state when its unable to parse successfully.
 * - Inner IIFEs are used to make handling parsing failure within a parse function clear.
 */
class Parser {
  constructor(code) {
    this.code = code;
    // Parser
    this.lastPosition = -1;
    this.lastParseData = null;
    // Indentation
    this.lastIndentCount = 0;
    // Information
    this.column = 0;
    this.line = 1;
    this.ruleStarts = [];
    // Characters
    this.digitBinary = '01';
    this.digitOctal = '01234567';
    this.digitDecimal = '0123456789';
    this.digitHexadecimal = '0123456789ABCDEFabcdef';
    this.noName = '_';
    this.identifierBeginChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'; // Unicode?
    this.identifierEndChar = `${this.identifierBeginChar}${this.digitDecimal}`;
    this.operators = '+-*/\\^%!><=÷×≠≈¹²³√'; // Unicode?
    this.pathNameChar = `${this.identifierEndChar}-`; // Unicode?
    this.space = ' \t'; // Unicode?
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
    // Checking if end of input has not yet been reached.
    if (this.lastPosition + 1 < this.code.length) {
      return this.code.charAt(this.lastPosition + 1);
    }
    return null;
  }

  // Reset properties.
  reset(lastPosition, lastParseData, lastIndentCount, column, line, popRuleStarts) {
    this.lastPosition = lastPosition;
    this.lastParseData = lastParseData !== null ? lastParseData : this.lastParseData;
    this.lastIndentCount = lastIndentCount !== null ? lastIndentCount : this.lastIndentCount;
    this.column = column;
    this.line = line;
    if (popRuleStarts === true) this.ruleStarts.pop();
  }

  // Try if a set of parse functions will parse successfully.
  tryTo(...parseFunctions) {
    // Keeping original state.
    const {
      lastPosition, column, line, lastParseData,
    } = this;

    let index = 0;
    let parseData = { success: false, message: null, ast: null };

    // Run each parsefunction one after the other.
    while (index < parseFunctions.length && this[`${parseFunctions[index]}`].success) {
      index += 1;
    }

    // Check if all parseFunctions parsed successfully.
    if (index === parseFunctions.length) {
      // Update parseData.
      parseData = { success: true, message: null, ast: null };
      return parseData;
    }

    // Revert state, lastParseData included.
    this.reset(lastPosition, lastParseData, null, column, line, true);

    return parseData;
  }

  // Parse input string.
  parseToken(str) {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    let parseData = { success: false, message: null, ast: null };

    // Check if input string matches the subsequent chars in code.
    if (str === this.code.slice(this.lastPosition + 1, this.lastPosition + str.length + 1)) {
      // Update lastPosition.
      this.lastPosition += str.length;

      // Update parseData.
      parseData = { success: true, message: null, ast: { token: str } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // newline = '\r'? '\n'.
  parseNewline() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    let parseData = { success: false, message: null, ast: null };

    (() => {
      // Consume '\r'?.
      this.parseToken('\r');

      // Consume '\n'.
      if (!this.parseToken('\n').success) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: null };

      // Update lastParseData.
      this.lastParseData = parseData;

      // Update line and column information.
      this.line += 1;
      this.column = 0;

      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // nextline = newline (_* newline)*.
  parseNextLine() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    let parseData = { success: false, message: null, ast: null };

    (() => {
      // Consume newline.
      if (!this.parseNewline().success) return null;

      // Optional-multiple parsing. (_? newline)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume _?.
          this.parseSpaces();

          // Consume newline.
          if (!this.parseNewline().success) return;

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // Update parseData.
      parseData = { success: true, message: null, ast: null };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // indent = ' '+
  parseIndent() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    let indentCount = 0;
    let spaceCount = 0;
    let parseData = { success: false, message: null, ast: null };

    // Parse subsequent spaces.
    while (this.parseToken(' ').success) {
      spaceCount += 1;
    }

    indentCount = spaceCount / 4;

    // Check if current indentation count is 1 indent more than previous indentation.
    if (indentCount === this.lastIndentCount + 1) {
      // Update lastIndentCount.
      this.lastIndentCount = indentCount;

      // Update parseData.
      parseData = { success: true, message: null, ast: { level: indentCount } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // samedent = ' '+ | ''
  parseSamedent() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    let indentCount = 0;
    let spaceCount = 0;
    let parseData = { success: false, message: null, ast: null };

    // Parse subsequent spaces.
    while (this.parseToken(' ').success) {
      spaceCount += 1;
    }

    indentCount = spaceCount / 4;
    // Check if current indentation count is the same as previous indentation.
    if (indentCount === this.lastIndentCount) {
      // Update parseData.
      parseData = { success: true, message: null, ast: { level: indentCount } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // dedent = ' '+
  parseDedent() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    let indentCount = 0;
    let spaceCount = 0;
    let parseData = { success: false, message: null, ast: null };

    // Parse subsequent spaces.
    while (this.parseToken(' ').success) {
      spaceCount += 1;
    }

    indentCount = spaceCount / 4;

    // Check if current indentation count is 1 indent less than previous indentation.
    if (indentCount === this.lastIndentCount - 1) {
      // Update lastIndentCount.
      this.lastIndentCount = indentCount;

      // Update parseData.
      parseData = { success: true, message: null, ast: { level: indentCount } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // identifier = identifierbeginchar identifierendchar*
  parseIdentifier() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const token = [];
    let parseData = { success: false, message: null, ast: null };

    // Consume the first character. [a-zA-Z]
    if (this.identifierBeginChar.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());
      // Consume remaining part of identifier. [a-zA-Z_0-9]*
      while (this.identifierEndChar.indexOf(this.peekChar()) > -1) {
        token.push(this.eatChar());
      }

      // Update parseData.
      parseData = { success: true, message: null, ast: { type: 'identifier', name: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // operator = operatorchar+
  parseOperator() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const token = [];
    let parseData = { success: false, message: null, ast: null };

    // Consume operator chars. [+-*/\\^%!><=÷×≠≈¹²³√]+
    while (this.operators.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());
    }

    // Check if it was able to consume at least an operator.
    if (token.length > 0) {
      // Update parseData.
      parseData = { success: true, message: null, ast: { type: 'operator', name: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // integerdecimalliteral  =
  //   | digitdecimal ('_'? digitdecimal)*
  parseIntegerDecimalLiteral() { // TODO
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const token = [];
    let parseData = { success: false, message: null, ast: null };

    // Consume digitDecimal. [0-9]+
    while (this.digitDecimal.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());
    }

    // Check if it was able to consume at least a digitDecimal.
    if (token.length > 0) {
      // Update parseData.
      parseData = { success: true, message: null, ast: { type: 'integer', value: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // names = identifier (_? ',' _? identifier)*
  parseNames() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const identifiers = [];
    let parseData = {
      success: false, message: null, ast: null,
    };

    (() => {
      // Consume identifier.
      if (!this.parseIdentifier().success) return null;
      identifiers.push(this.lastParseData.ast.name);

      // Optional-multiple parsing. (_? ',' _? identifier)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume _?.
          this.parseSpaces();

          // Consume ','.
          if (!this.parseToken(',').success) return;

          // Consume _?.
          this.parseSpaces();

          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          identifiers.push(this.lastParseData.ast.name);

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // Update parseData.
      parseData = { success: true, message: null, ast: { names: identifiers } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // expression = integer | identifier
  parseExpression() { // TODO
    if (this.parseIntegerDecimalLiteral().success) {
      return this.lastParseData;
    } else if (this.parseIdentifier().success) {
      return this.lastParseData;
    }
    return { success: false, data: null };
  }

  // _ =
  //   | linecontinuation
  //   | space+
  parseSpaces() { // TODO
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    let count = 0;
    let parseData = { success: false, message: null, ast: null };

    // Consume spaces. [ \t]+
    while (this.space.indexOf(this.peekChar()) > -1) {
      this.eatChar();
      count += 1;
    }

    // Check if it was able to consume at least one whitespace.
    if (count > 0) {
      // Update parseData.
      parseData = { success: true, message: null, ast: null };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

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
    let parseData = { success: false, message: null, ast: null };

    (() => {
      // Consume ('let'/'var').
      if (!this.parseToken('let').success && !this.parseToken('var').success) return null;
      mutability = this.lastParseData.ast.token;

      // Consume _.
      if (!this.parseSpaces().success) return null;

      // Consume identifier.
      if (!this.parseIdentifier().success) return null;
      identifier = this.lastParseData.ast.name;

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
        expression = this.lastParseData.ast;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '=' !(operator) expression
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Consume '='.
          if (!this.parseToken('=').success) return;

          // Make sure next token isn't an operator.
          if (this.tryTo('parseOperator').success) return;

          // Consume expression.
          if (!this.parseExpression().success) return;
          expression = this.lastParseData.ast;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { mutability, identifier, expression } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

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
    let parseData = { success: false, message: null, ast: null };

    (() => {
      // Consume ('fun').
      if (!this.parseToken('fun').success) return null;

      // Consume _.
      if (!this.parseSpaces().success) return null;

      // Consume identifier.
      if (!this.parseIdentifier().success) return null;
      identifier = this.lastParseData.ast.name;

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
        expression = this.lastParseData.ast;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '=' !(operator) expression
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

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
      parseData = { success: true, message: null, ast: { identifier, expression } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }

  // typedeclaration =
  //  | 'type' _ identifier _? '(' _? ')' (_? '<:' _? names)?
  //  | 'type' _ identifier (_? '<:' _? names)? _? ':' _? subjectdeclaration
  parseTypeDeclaration() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    let identifier;
    let supertypes = null;
    let field = null;
    let parseData = { success: false, message: null, ast: null };

    (() => {
      // Consume ('type').
      if (!this.parseToken('type').success) return null;

      // Consume _.
      if (!this.parseSpaces().success) return null;

      // Consume identifier.
      if (!this.parseIdentifier().success) return null;
      identifier = this.lastParseData.ast.name;

      // Alternate parsing.
      // | _? '(' _? ')' (_? '<:' _? names)?
      // | (_? '<:' _? names)? _? ':' _? subjectdeclaration
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. _? '(' _? ')' (_? '<:' _? names)?
      (() => {
        // Consume _?.
        this.parseSpaces();

        // Consume '('.
        if (!this.parseToken('(').success) return;

        // Consume _?.
        this.parseSpaces();

        // Consume ')'.
        if (!this.parseToken(')').success) return;

        // Optional parsing. (_? '<:' _? names)?
        let optionalParseSuccessful = false;
        const state1 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume _?.
          this.parseSpaces();

          // Consume '<:'.
          if (!this.parseToken('<:').success) return;

          // Consume _?.
          this.parseSpaces();

          // Consume names.
          if (!this.parseNames().success) return;
          supertypes = this.lastParseData.ast.names;

          optionalParseSuccessful = true;
        })();

        // If parsing optional fails, revert state to what it was before optional parsing started.
        if (!optionalParseSuccessful) {
          this.reset(state1.lastPosition, null, null, state1.column, state1.line);
        }

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. (_? '<:' _? names)? _? ':' _? subjectdeclaration
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        (() => {
          // Optional parsing. (_? '<:' _? names)?
          let optionalParseSuccessful = false;
          const state1 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume _?.
            this.parseSpaces();

            // Consume '<:'.
            if (!this.parseToken('<:').success) return;

            // Consume _?.
            this.parseSpaces();

            // Consume names.
            if (!this.parseNames().success) return;
            supertypes = this.lastParseData.ast.names;

            optionalParseSuccessful = true;
          })();

          // If parsing optional fails, revert state to what it was before optional parsing started.
          if (!optionalParseSuccessful) {
            this.reset(state1.lastPosition, null, null, state1.column, state1.line);
          }

          // Consume _?.
          this.parseSpaces();

          // Consume ':'.
          if (!this.parseToken(':').success) return;

          // Consume _?.
          this.parseSpaces();

          // Consume subjectdeclaration.
          if (!this.parseSubjectDeclaration().success) return;
          field = this.lastParseData.data;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { identifier, supertypes, field } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line, true);

    return parseData;
  }
}

module.exports = Parser;
