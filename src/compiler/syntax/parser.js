/* eslint-disable no-loop-func, no-constant-condition, max-len, no-underscore-dangle, camelcase */
// eslint-disable-next-line no-unused-vars
const { print } = require('../utils');

/**
 * MAINTENANCE NOTES
 * - Code resuse is crucial. There is a lot of duplication in this source file and for good reasons. Clarity and performance.
 * - You should check `src/boilerplate/parser-boilerplate.js` for reusable code templates.
 *
 * IMPLEMENTATION NOTES
 * - This compiler uses a recursive descent parser with no lexing phase.
 * - There is no lexing phase because the language is whitespace sensitive.
 * - Each parse function reverts its state when its unable to parse successfully.
 * - Inner IIFEs are used to make handling parsing failure within a parse function clear.
 * - Functions with productions like `(samedent {comment} nextline)*` which have state in the middle
 * need to revert their state if an iteration fails. Productions with state at the end
 * are not affected by this `('_' {digitdecimal})*`.
 * - States to always consider when writing new rules.
 *  * `lastIndentCount` and `ignoreNewline` for rules with indentation.
 *  * stateful variables holding values associated with the rule.
 */
class Parser {
  constructor(code) {
    // Input code
    this.code = code;
    // Parser information
    this.lastPosition = -1;
    this.lastParseData = null;
    this.lastIndentCount = 0;
    this.column = 0;
    this.line = 1;
    this.ruleStarts = []; // start position of an expression. [{ line, column }].
    this.ignoreNewline = false;
    // Characters
    this.digitBinary = '01';
    this.digitOctal = '01234567';
    this.digitDecimal = '0123456789';
    this.digitHexadecimal = '0123456789ABCDEFabcdef';
    this.identifierBeginChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'; // Unicode?
    this.identifierEndChar = `${this.identifierBeginChar}${this.digitDecimal}`;
    this.operatorChar = '+-*/\\^%&|!><=÷×≠≈¹²³√'; // Unicode?
    this.pathNameChar = `${this.identifierEndChar}-`; // Unicode?
    this.space = ' \t'; // Unicode?
  }

  // Increment number line count.
  incrementLineCount() {
    this.line += 1;
    this.column = 0; // Reset column number.
  }

  // Add positon to ruleStarts.
  addRuleStart(ruleName) {
    this.ruleStarts.push({ ruleName, line: this.line, column: this.column });
  }

  // Consume next char, which also means updating lastPosition.
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
  // Used in top-level expression only.
  reset(lastPosition, lastParseData, lastIndentCount, column, line, popRuleStarts) {
    this.lastPosition = lastPosition;
    this.lastParseData = lastParseData !== null ? lastParseData : this.lastParseData;
    this.lastIndentCount = lastIndentCount !== null ? lastIndentCount : this.lastIndentCount;
    this.column = column;
    this.line = line;
    if (popRuleStarts === true) this.ruleStarts.pop();
  }

  // Try if a set of parse functions will parse successfully.
  tryTo(...parseFunctions) { // TODO: single parseFunction param
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
    this.reset(lastPosition, lastParseData, null, column, line);

    return parseData;
  }

  // Parse input string.
  // { token }
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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // eoi =
  //   | !.
  parseEoi() {
    // No state to reset.
    const type = 'eoi';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    // Check last position in code has been reached code.
    if (this.lastPosition + 1 === this.code.length) {
      // Update parseData.
      parseData = { success: true, message: null, ast: null };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, but no state to revert.
    return parseData;
  }

  // integerbinaryliteral  =
  //   | '0b' digitbinary ('_'? digitbinary)*
  parseIntegerBinaryLiteral() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'integerbinaryliteral';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume '0b'.
      if (!this.parseToken('0b').success) return null;
      token.push('0b');

      // Consume digitbinary.
      if (this.digitBinary.indexOf(this.peekChar()) < 0) return null;
      token.push(this.eatChar());

      // Optional-multiple parsing. ('_'? digitbinary)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume '_'?.
          this.parseToken('_');

          // Consume digitbinary.
          if (this.digitBinary.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

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
      parseData = { success: true, message: null, ast: { type, value: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // integeroctalliteral  =
  //   | '0o' digitoctal ('_'? digitoctal)*
  parseIntegerOctalLiteral() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'integeroctalliteral';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume '0o'.
      if (!this.parseToken('0o').success) return null;
      token.push('0o');

      // Consume digitoctal.
      if (this.digitOctal.indexOf(this.peekChar()) < 0) return null;
      token.push(this.eatChar());

      // Optional-multiple parsing. ('_'? digitoctal)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume '_'?.
          this.parseToken('_');

          // Consume digitoctal.
          if (this.digitOctal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

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
      parseData = { success: true, message: null, ast: { type, value: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // integerhexadecimalliteral  =
  //   | '0x' digithexadecimal ('_'? digithexadecimal)*
  parseIntegerHexadecimalLiteral() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'integerhexadecimalliteral';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume '0x'.
      if (!this.parseToken('0x').success) return null;
      token.push('0x');

      // Consume digithexadecimal.
      if (this.digitHexadecimal.indexOf(this.peekChar()) < 0) return null;
      token.push(this.eatChar());

      // Optional-multiple parsing. ('_'? digithexadecimal)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume '_'?.
          this.parseToken('_');

          // Consume digithexadecimal.
          if (this.digitHexadecimal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

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
      parseData = { success: true, message: null, ast: { type, value: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // integerdecimalliteral  =
  //   | digitdecimal ('_'? digitdecimal)*
  parseIntegerDecimalLiteral() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'integerdecimalliteral';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume digitDecimal.
      if (this.digitDecimal.indexOf(this.peekChar()) < 0) return null;
      token.push(this.eatChar());

      // Optional-multiple parsing. ('_'? digitdecimal)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume '_'?.
          this.parseToken('_');

          // Consume digitdecimal.
          if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

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
      parseData = { success: true, message: null, ast: { type, value: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // integerliteral =
  //   | integerbinaryliteral
  //   | integeroctalliteral
  //   | integerhexadecimalliteral
  //   | integerdecimalliteral
  parseIntegerLiteral() {
    const type = 'integerliteral';

    if (this.parseIntegerBinaryLiteral().success) {
      return this.lastParseData;
    } else if (this.parseIntegerOctalLiteral().success) {
      return this.lastParseData;
    } else if (this.parseIntegerHexadecimalLiteral().success) {
      return this.lastParseData;
    } else if (this.parseIntegerDecimalLiteral().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // floatbinaryliteral  =
  //   | '0b' digitbinary ('_'? digitbinary)* '.' digitbinary ('_'? digitbinary)* ('e' [-+]? digitbinary ('_'? digitbinary)*)?
  //   | '0b' digitbinary ('_'? digitbinary)* 'e' [-+]? digitbinary ('_'? digitbinary)*
  parseFloatBinaryLiteral() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'floatbinaryliteral';
    let token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume '0b'.
      if (!this.parseToken('0b').success) return null;
      token.push('0b');

      // Consume digitbinary.
      if (this.digitBinary.indexOf(this.peekChar()) < 0) return null;
      token.push(this.eatChar());

      // Optional-multiple parsing. ('_'? digitbinary)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume '_'?.
          this.parseToken('_');

          // Consume digitbinary.
          if (this.digitBinary.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // Alternate parsing.
      // | '.' digitbinary ('_'? digitbinary)* ('e' [-+]? digitbinary ('_'? digitbinary)*)?
      // | 'e' [-+]? digitbinary ('_'? digitbinary)*
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { token: [...token] };

      // [1]. '.' digitbinary ('_'? digitbinary)* ('e' [-+]? digitbinary ('_'? digitbinary)*)?
      (() => {
        // Consume '.'.
        if (!this.parseToken('.').success) return;
        token.push('.');

        // Consume digitbinary.
        if (this.digitBinary.indexOf(this.peekChar()) < 0) return;
        token.push(this.eatChar());

        // Optional-multiple parsing. ('_'? digitbinary)*
        while (true) {
          let parseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume '_'?.
            this.parseToken('_');

            // Consume digitbinary.
            if (this.digitBinary.indexOf(this.peekChar()) < 0) return;
            token.push(this.eatChar());

            parseSuccessful = true;
          })();

          // If parsing the above fails, revert state to what it was before that parsing began.
          // And break out of the loop.
          if (!parseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            break;
          }
        }

        // Optional parsing. ('e' [-+]? digitbinary ('_'? digitbinary)*)?
        let optionalParseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume 'e'.
          if (!this.parseToken('e').success) return;
          token.push('e');

          // Consume [-+]?.
          if (this.parseToken('-').success || this.parseToken('+').success) {
            token.push(this.lastParseData.ast.token);
          }

          // Consume digitbinary.
          if (this.digitBinary.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          // Optional-multiple parsing. ('_'? digitbinary)*
          while (true) {
            let parseSuccessful = false;
            const state3 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Consume '_'?.
              this.parseToken('_');

              // Consume digitbinary.
              if (this.digitBinary.indexOf(this.peekChar()) < 0) return;
              token.push(this.eatChar());

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state3.lastPosition, null, null, state3.column, state3.line);
              break;
            }
          }

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
        }

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. 'e' [-+]? digitbinary ('_'? digitbinary)*
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ token } = otherState);

        (() => {
          // Consume 'e'.
          if (!this.parseToken('e').success) return;
          token.push('e');

          // Consume [-+]?.
          if (this.parseToken('-').success || this.parseToken('+').success) {
            token.push(this.lastParseData.ast.token);
          }

          // Consume digitbinary.
          if (this.digitBinary.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          // Optional-multiple parsing. ('_'? digitbinary)*
          while (true) {
            let parseSuccessful = false;
            const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };

            (() => {
              // Consume '_'?.
              this.parseToken('_');

              // Consume digitbinary.
              if (this.digitBinary.indexOf(this.peekChar()) < 0) return;
              token.push(this.eatChar());

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state2.lastPosition, null, null, state2.column, state2.line);
              break;
            }
          }

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, value: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // floatoctalliteral  =
  //   | '0o' digitoctal ('_'? digitoctal)* '.' digitoctal ('_'? digitoctal)* ('e' [-+]? digitoctal ('_'? digitoctal)*)?
  //   | '0o' digitoctal ('_'? digitoctal)* 'e' [-+]? digitoctal ('_'? digitoctal)*
  parseFloatOctalLiteral() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'floatoctalliteral';
    let token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume '0o'.
      if (!this.parseToken('0o').success) return null;
      token.push('0o');

      // Consume digitoctal.
      if (this.digitOctal.indexOf(this.peekChar()) < 0) return null;
      token.push(this.eatChar());

      // Optional-multiple parsing. ('_'? digitoctal)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume '_'?.
          this.parseToken('_');

          // Consume digitoctal.
          if (this.digitOctal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // Alternate parsing.
      // | '.' digitoctal ('_'? digitoctal)* ('e' [-+]? digitoctal ('_'? digitoctal)*)?
      // | 'e' [-+]? digitoctal ('_'? digitoctal)*
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { token: [...token] };

      // [1]. '.' digitoctal ('_'? digitoctal)* ('e' [-+]? digitoctal ('_'? digitoctal)*)?
      (() => {
        // Consume '.'.
        if (!this.parseToken('.').success) return;
        token.push('.');

        // Consume digitoctal.
        if (this.digitOctal.indexOf(this.peekChar()) < 0) return;
        token.push(this.eatChar());

        // Optional-multiple parsing. ('_'? digitoctal)*
        while (true) {
          let parseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume '_'?.
            this.parseToken('_');

            // Consume digitoctal.
            if (this.digitOctal.indexOf(this.peekChar()) < 0) return;
            token.push(this.eatChar());

            parseSuccessful = true;
          })();

          // If parsing the above fails, revert state to what it was before that parsing began.
          // And break out of the loop.
          if (!parseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            break;
          }
        }

        // Optional parsing. ('e' [-+]? digitoctal ('_'? digitoctal)*)?
        let optionalParseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume 'e'.
          if (!this.parseToken('e').success) return;
          token.push('e');

          // Consume [-+]?.
          if (this.parseToken('-').success || this.parseToken('+').success) {
            token.push(this.lastParseData.ast.token);
          }

          // Consume digitoctal.
          if (this.digitOctal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          // Optional-multiple parsing. ('_'? digitoctal)*
          while (true) {
            let parseSuccessful = false;
            const state3 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Consume '_'?.
              this.parseToken('_');

              // Consume digitoctal.
              if (this.digitOctal.indexOf(this.peekChar()) < 0) return;
              token.push(this.eatChar());

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state3.lastPosition, null, null, state3.column, state3.line);
              break;
            }
          }

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
        }

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. 'e' [-+]? digitoctal ('_'? digitoctal)*
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ token } = otherState);

        (() => {
          // Consume 'e'.
          if (!this.parseToken('e').success) return;
          token.push('e');

          // Consume [-+]?.
          if (this.parseToken('-').success || this.parseToken('+').success) {
            token.push(this.lastParseData.ast.token);
          }

          // Consume digitoctal.
          if (this.digitOctal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          // Optional-multiple parsing. ('_'? digitoctal)*
          while (true) {
            let parseSuccessful = false;
            const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Consume '_'?.
              this.parseToken('_');

              // Consume digit0ctal.
              if (this.digitOctal.indexOf(this.peekChar()) < 0) return;
              token.push(this.eatChar());

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state2.lastPosition, null, null, state2.column, state2.line);
              break;
            }
          }

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, value: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // floathexadecimalliteral  =
  //   | '0x' digithexadecimal ('_'? digithexadecimal)* '.' digithexadecimal ('_'? digithexadecimal)* ('p' [-+]? digithexadecimal ('_'? digithexadecimal)*)?
  //   | '0x' digithexadecimal ('_'? digithexadecimal)* 'p' [-+]? digithexadecimal ('_'? digithexadecimal)*
  parseFloatHexadecimalLiteral() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'floathexadecimalliteral';
    let token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume '0x'.
      if (!this.parseToken('0x').success) return null;
      token.push('0x');

      // Consume digithexadecimal.
      if (this.digitHexadecimal.indexOf(this.peekChar()) < 0) return null;
      token.push(this.eatChar());

      // Optional-multiple parsing. ('_'? digithexadecimal)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume '_'?.
          this.parseToken('_');

          // Consume digithexadecimal.
          if (this.digitHexadecimal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // Alternate parsing.
      // | '.' digithexadecimal ('_'? digithexadecimal)* ('p' [-+]? digithexadecimal ('_'? digithexadecimal)*)?
      // | 'p' [-+]? digithexadecimal ('_'? digithexadecimal)*
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { token: [...token] };

      // [1]. '.' digithexadecimal ('_'? digithexadecimal)* ('p' [-+]? digithexadecimal ('_'? digithexadecimal)*)?
      (() => {
        // Consume '.'.
        if (!this.parseToken('.').success) return;
        token.push('.');

        // Consume digithexadecimal.
        if (this.digitHexadecimal.indexOf(this.peekChar()) < 0) return;
        token.push(this.eatChar());

        // Optional-multiple parsing. ('_'? digithexadecimal)*
        while (true) {
          let parseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume '_'?.
            this.parseToken('_');

            // Consume digithexadecimal.
            if (this.digitHexadecimal.indexOf(this.peekChar()) < 0) return;
            token.push(this.eatChar());

            parseSuccessful = true;
          })();

          // If parsing the above fails, revert state to what it was before that parsing began.
          // And break out of the loop.
          if (!parseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            break;
          }
        }

        // Optional parsing. ('p' [-+]? digithexadecimal ('_'? digithexadecimal)*)?
        let optionalParseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume 'p'.
          if (!this.parseToken('p').success) return;
          token.push('p');

          // Consume [-+]?.
          if (this.parseToken('-').success || this.parseToken('+').success) {
            token.push(this.lastParseData.ast.token);
          }

          // Consume digithexadecimal.
          if (this.digitHexadecimal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          // Optional-multiple parsing. ('_'? digithexadecimal)*
          while (true) {
            let parseSuccessful = false;
            const state3 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Consume '_'?.
              this.parseToken('_');

              // Consume digithexadecimal.
              if (this.digitHexadecimal.indexOf(this.peekChar()) < 0) return;
              token.push(this.eatChar());

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state3.lastPosition, null, null, state3.column, state3.line);
              break;
            }
          }

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
        }

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. 'p' [-+]? digithexadecimal ('_'? digithexadecimal)*
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ token } = otherState);

        (() => {
          // Consume 'p'.
          if (!this.parseToken('p').success) return;
          token.push('p');

          // Consume [-+]?.
          if (this.parseToken('-').success || this.parseToken('+').success) {
            token.push(this.lastParseData.ast.token);
          }

          // Consume digithexadecimal.
          if (this.digitHexadecimal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          // Optional-multiple parsing. ('_'? digithexadecimal)*
          while (true) {
            let parseSuccessful = false;
            const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Consume '_'?.
              this.parseToken('_');

              // Consume digit0ctal.
              if (this.digitHexadecimal.indexOf(this.peekChar()) < 0) return;
              token.push(this.eatChar());

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state2.lastPosition, null, null, state2.column, state2.line);
              break;
            }
          }

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, value: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // floatdecimalliteral  =
  //   | (digitdecimal ('_'? digitdecimal)*)? '.' digitdecimal ('_'? digitdecimal)* ('e' [-+]? digitdecimal ('_'? digitdecimal)*)?
  //   | digitdecimal ('_'? digitdecimal)* 'e' [-+]? digitdecimal ('_'? digitdecimal)*
  parseFloatDecimalLiteral() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'floatdecimalliteral';
    let token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | (digitdecimal ('_'? digitdecimal)*)? '.' digitdecimal ('_'? digitdecimal)* ('e' [-+]? digitdecimal ('_'? digitdecimal)*)?
      // | digitdecimal ('_'? digitdecimal)* 'e' [-+]? digitdecimal ('_'? digitdecimal)*
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { token: [...token] };

      // [1]. (digitdecimal ('_'? digitdecimal)*)? '.' digitdecimal ('_'? digitdecimal)* ('e' [-+]? digitdecimal ('_'? digitdecimal)*)?
      (() => {
        // Optional parsing. (digitdecimal ('_'? digitdecimal)*)?
        let optionalParseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume digitdecimal.
          if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          // Optional-multiple parsing. ('_'? digitdecimal)*
          while (true) {
            let parseSuccessful = false;
            const state3 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Consume '_'?.
              this.parseToken('_');

              // Consume digitdecimal.
              if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
              token.push(this.eatChar());

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state3.lastPosition, null, null, state3.column, state3.line);
              break;
            }
          }

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
        }

        // Consume '.'.
        if (!this.parseToken('.').success) return;
        if (token.length === 0) token.push('0');
        token.push('.');

        // Consume digitdecimal.
        if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
        token.push(this.eatChar());

        // Optional-multiple parsing. ('_'? digitdecimal)*
        while (true) {
          let parseSuccessful = false;
          const state3 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume '_'?.
            this.parseToken('_');

            // Consume digitdecimal.
            if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
            token.push(this.eatChar());

            parseSuccessful = true;
          })();

          // If parsing the above fails, revert state to what it was before that parsing began.
          // And break out of the loop.
          if (!parseSuccessful) {
            this.reset(state3.lastPosition, null, null, state3.column, state3.line);
            break;
          }
        }

        // Optional parsing. ('e' [-+]? digitdecimal ('_'? digitdecimal)*)?
        let optionalParseSuccessful2 = false;
        const state3 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume 'e'.
          if (!this.parseToken('e').success) return;
          token.push('e');

          // Consume [-+]?.
          if (this.parseToken('-').success || this.parseToken('+').success) {
            token.push(this.lastParseData.ast.token);
          }

          // Consume digitdecimal.
          if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          // Optional-multiple parsing. ('_'? digitdecimal)*
          while (true) {
            let parseSuccessful = false;
            const state4 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Consume '_'?.
              this.parseToken('_');

              // Consume digitdecimal.
              if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
              token.push(this.eatChar());

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state4.lastPosition, null, null, state4.column, state4.line);
              break;
            }
          }

          // This optional was parsed successfully.
          optionalParseSuccessful2 = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful2) {
          this.reset(state3.lastPosition, null, null, state3.column, state3.line);
        }

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. digitdecimal ('_'? digitdecimal)* 'e' [-+]? digitdecimal ('_'? digitdecimal)*
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ token } = otherState);

        (() => {
          // Consume digitdecimal.
          if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          // Optional-multiple parsing. ('_'? digitdecimal)*
          while (true) {
            let parseSuccessful = false;
            const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Consume '_'?.
              this.parseToken('_');

              // Consume digit0ctal.
              if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
              token.push(this.eatChar());

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state2.lastPosition, null, null, state2.column, state2.line);
              break;
            }
          }

          // Consume 'e'.
          if (!this.parseToken('e').success) return;
          token.push('e');

          // Consume [-+]?.
          if (this.parseToken('-').success || this.parseToken('+').success) {
            token.push(this.lastParseData.ast.token);
          }

          // Consume digitdecimal.
          if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
          token.push(this.eatChar());

          // Optional-multiple parsing. ('_'? digitdecimal)*
          while (true) {
            let parseSuccessful = false;
            const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Consume '_'?.
              this.parseToken('_');

              // Consume digit0ctal.
              if (this.digitDecimal.indexOf(this.peekChar()) < 0) return;
              token.push(this.eatChar());

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state2.lastPosition, null, null, state2.column, state2.line);
              break;
            }
          }

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, value: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // floatliteral =
  //   | floatbinaryliteral
  //   | floatoctalliteral
  //   | floathexadecimalliteral
  //   | floatdecimalliteral
  parseFloatLiteral() {
    const type = 'floatliteral';

    if (this.parseFloatBinaryLiteral().success) {
      return this.lastParseData;
    } else if (this.parseFloatOctalLiteral().success) {
      return this.lastParseData;
    } else if (this.parseFloatHexadecimalLiteral().success) {
      return this.lastParseData;
    } else if (this.parseFloatDecimalLiteral().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // numericliteral =
  //   | integerliteral
  //   | floatliteral
  parseNumericLiteral() {
    const type = 'numericliteral';

    if (this.parseFloatLiteral().success) {
      return this.lastParseData;
    } else if (this.parseIntegerLiteral().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // coefficientexpression =
  //   | floatbinaryliteral identifier
  //   | floatoctalliteral identifier
  //   | floatdecimalliteral identifier
  //   | integerbinaryliteral identifier
  //   | integeroctalliteral identifier
  //   | !('0b' | '0o' | '0x') integerdecimalliteral identifier
  //   { type, coefficient, identifier }
  parseCoefficientExpression() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'coefficientexpression';
    let coefficient = null;
    let identifier = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | floatbinaryliteral identifier
      // | floatoctalliteral identifier
      // | floatdecimalliteral identifier
      // | integerbinaryliteral identifier
      // | integeroctalliteral identifier
      // | !('0b' | '0o' | '0x') integerdecimalliteral identifier
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { coefficient, identifier };

      // [1]. floatbinaryliteral identifier
      (() => {
        // Consume floatbinaryliteral.
        if (!this.parseFloatBinaryLiteral().success) return;
        coefficient = this.lastParseData.ast;

        // Consume identifier.
        if (!this.parseIdentifier().success) return;
        identifier = this.lastParseData.ast;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. floatoctalliteral identifier
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ coefficient, identifier } = otherState);

        (() => {
          // Consume floatoctalliteral.
          if (!this.parseFloatOctalLiteral().success) return;
          coefficient = this.lastParseData.ast;

          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          identifier = this.lastParseData.ast;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. floatdecimalliteral identifier
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ coefficient, identifier } = otherState);

        (() => {
          // Consume floatdecimalliteral.
          if (!this.parseFloatDecimalLiteral().success) return;
          coefficient = this.lastParseData.ast;

          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          identifier = this.lastParseData.ast;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [4]. integerbinaryliteral identifier
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ coefficient, identifier } = otherState);

        (() => {
          // Consume integerbinaryliteral.
          if (!this.parseIntegerBinaryLiteral().success) return;
          coefficient = this.lastParseData.ast;

          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          identifier = this.lastParseData.ast;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [5]. integeroctalliteral identifier
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ coefficient, identifier } = otherState);

        (() => {
          // Consume integeroctalliteral.
          if (!this.parseIntegerOctalLiteral().success) return;
          coefficient = this.lastParseData.ast;

          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          identifier = this.lastParseData.ast;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [6]. !('0b' | '0o' | '0x') integerdecimalliteral identifier
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ coefficient, identifier } = otherState);

        (() => {
          // Check !('0b' | '0o' | '0x').
          if (this.parseToken('0b').success || this.parseToken('0o').success || this.parseToken('0x').success) return;

          // Consume integerdecimalliteral.
          if (!this.parseIntegerDecimalLiteral().success) return;
          coefficient = this.lastParseData.ast;

          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          identifier = this.lastParseData.ast;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, coefficient, identifier } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // noname =
  //   | '_'
  parseNoName() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'noname';
    let name;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume newline.
      if (!this.parseToken('_').success) return null;
      name = this.lastParseData.ast.token;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, name } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // identifier =
  //   | identifierbeginchar identifierendchar*
  parseIdentifier() { // TODO
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'identifier';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    // Consume the first character. identifierbeginchar
    if (this.identifierBeginChar.indexOf(this.peekChar()) > -1) {
      token.push(this.eatChar());

      // Consume remaining part of identifier. identifierendchar*
      while (this.identifierEndChar.indexOf(this.peekChar()) > -1) {
        token.push(this.eatChar());
      }

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, name: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
    }

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // operator =
  //   | (!(regexliteral) operatorchar)+ // Must not consume regexliteral
  parseOperator() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'operator';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    // Consume (!(regexliteral) operatorchar)+.
    while (this.operatorChar.indexOf(this.peekChar()) > -1) {
      // Check !(regexliteral).
      if (this.peekChar() === '/') {
        let lookAheadParseSuccessful = false;
        const state = { lastPosition: this.lastPosition, column: this.column, line: this.line };
        (() => {
          // Consume regexliteral.
          if (!this.parseRegexLiteral('.').success) return;

          // This lookahead was parsed successfully.
          lookAheadParseSuccessful = true;
        })();

        // Reset state since it's just a lookahead not meant to be consumed.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        // lookahead parsing should not be successful for a negative lookahead.
        if (lookAheadParseSuccessful) break;
      }

      // Consume operatorchar.
      token.push(this.eatChar());
    }

    // Check if it was able to consume at least an operator.
    if (token.length > 0) {
      // Update parseData.
      parseData = { success: true, message: null, ast: { type, name: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // charsnonewlineorsinglequote =
  //   | (!(newline | "'") .)+
  parseCharsNoNewlineOrSingleQuote() { // TODO
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'charsnonewlineorsinglequote';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // One-multiple parsing. (!(newline | "'") .)+
      let loopCount = 0;
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check !(newline | "'") .
          if (this.parseNewline().success || this.parseToken("'").success) return;

          // Consume ..
          if (!this.peekChar()) return;
          token.push(this.eatChar());

          parseSuccessful = true;

          // Parsing successful, increment loop count.
          loopCount += 1;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // At least one iteration of the above must be parsed successfully.
      if (loopCount < 1) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { token: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // charsnonewlineordoublequote =
  //   | (!(newline | '"') .)+ // TODO
  parseCharsNoNewlineOrDoubleQuote() { // TODO
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'charsnonewlineordoublequote';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // One-multiple parsing. (!(newline | '"') .)+
      let loopCount = 0;
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check !(newline | '"').
          if (this.parseNewline().success || this.parseToken('"').success) return;

          // Consume ..
          if (!this.peekChar()) return;
          token.push(this.eatChar());

          parseSuccessful = true;

          // Parsing successful, increment loop count.
          loopCount += 1;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // At least one iteration of the above must be parsed successfully.
      if (loopCount < 1) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { token: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // charsnonewlineortriplesinglequote =
  //   | (!(newline | "'''") .)+ // TODO
  parseCharsNoNewlineOrTripleSingleQuote() { // TODO
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'charsnonewlineortriplesinglequote';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // One-multiple parsing. (!(newline | "'''") .)+
      let loopCount = 0;
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check !(newline | "'''").
          if (this.parseNewline().success || this.parseToken("'''").success) return;

          // Consume ..
          if (!this.peekChar()) return;
          token.push(this.eatChar());

          parseSuccessful = true;

          // Parsing successful, increment loop count.
          loopCount += 1;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // At least one iteration of the above must be parsed successfully.
      if (loopCount < 1) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { token: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // charsnonewlineortripledoubequote =
  //   | (!(newline | '"""') .)+ // TODO
  parseCharsNoNewlineOrTripleDoubleQuote() { // TODO
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'charsnonewlineortripledoubequote';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // One-multiple parsing. (!(newline | '"""') .)+
      let loopCount = 0;
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check !(newline | '"""').
          if (this.parseNewline().success || this.parseToken('"""').success) return;

          // Consume ..
          if (!this.peekChar()) return;
          token.push(this.eatChar());

          parseSuccessful = true;

          // Parsing successful, increment loop count.
          loopCount += 1;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // At least one iteration of the above must be parsed successfully.
      if (loopCount < 1) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { token: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // charsnohashequal =
  //   | (!('#=' | '=#') .)+ // TODO
  parseCharsNoHashEqual() { // TODO
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'charsnohashequal';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // One-multiple parsing. (!('=#') .)+
      let loopCount = 0;
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check !('=#').
          if (this.parseToken('#=').success || this.parseToken('=#').success) return;

          // Consume ..
          if (!this.peekChar()) return;
          token.push(this.eatChar());

          parseSuccessful = true;

          // Parsing successful, increment loop count.
          loopCount += 1;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // At least one iteration of the above must be parsed successfully.
      if (loopCount < 1) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { token: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // charsnonewline =
  //   | (!(newline) .)+ // TODO
  parseCharsNoNewline() { // TODO
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'charsnonewline';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // One-multiple parsing. (!(newline) .)+
      let loopCount = 0;
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check !(newline).
          if (this.parseNewline().success) return;

          // Consume ..
          if (!this.peekChar()) return;
          token.push(this.eatChar());

          parseSuccessful = true;

          // Parsing successful, increment loop count.
          loopCount += 1;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // At least one iteration of the above must be parsed successfully.
      if (loopCount < 1) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { token: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // charsnonewlineorforwardslash =
  //   | (!(newline | '/') .)+ // TODO
  parseCharsNoNewlineOrForwardSlash() { // TODO
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'charsnonewlineorforwardslash';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // One-multiple parsing. (!(newline | '/') .)+
      let loopCount = 0;
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check !(newline | '/' ).
          if (this.parseNewline().success || this.parseToken('/').success) return;

          // Consume ..
          if (!this.peekChar()) return;
          token.push(this.eatChar());

          parseSuccessful = true;

          // Parsing successful, increment loop count.
          loopCount += 1;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // At least one iteration of the above must be parsed successfully.
      if (loopCount < 1) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { token: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // nameseparator =
  //   | !(identifier | numericliteral) _?
  parseNameSeparator() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'nameseparator';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume !(identifier | numericliteral).
      if (this.parseIdentifier().success || this.parseNumericLiteral().success) return;

      // Consume _?.
      this.parse_().success;

      // Update parseData.
      parseData = { success: true, message: null, ast: null };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // indent =
  //   | ' '+
  parseIndent() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'indent';
    let indentCount = 0;
    let spaceCount = 0;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // samedent =
  //   | ' '+ | ''
  parseSamedent() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'samedent';
    let indentCount = 0;
    let spaceCount = 0;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // dedent =
  //   | ' '+
  parseDedent() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'dedent';
    let indentCount = 0;
    let spaceCount = 0;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // newline =
  //   | '\r'? '\n'.
  parseNewline() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'newline';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // nextline =
  //   | newline (_? newline)*.
  parseNextLine() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'nextline';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume newline.
      if (!this.parseNewline().success) return null;

      // Optional-multiple parsing. (_? newline)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume _?.
          this.parse_();

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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // singlelinecomment =
  //   | "#" charsnonewline? &(newline | eoi)
  parseSingleLineComment() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'singlelinecomment';
    let token = '';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume '#'.
      if (!this.parseToken('#').success) return null;

      // Consume charsnonewline?.
      if (this.parseCharsNoNewline()) ({ token } = this.lastParseData.ast);

      // Check &(newline | eoi).
      const state = { lastPosition: this.lastPosition, column: this.column, line: this.line };
      if (!this.parseNewline().success && !this.parseEoi().success) return null;
      this.reset(state.lastPosition, null, null, state.column, state.line);

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, token } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // innermultilinecomment =
  //   | "#=" charsnohashequal? (innermultilinecomment charsnohashequal?)* '=#'
  parseInnerMultiLineComment() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'innermultilinecomment';
    let tokens = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume '#='.
      if (!this.parseToken('#=').success) return null;

      // Consume charsnohashequal?.
      if (this.parseCharsNoHashEqual()) tokens.push(this.lastParseData.ast.token);

      // Optional-multiple parsing. (multilinecomment charsnohashequal?)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        const otherState = { tokens: [...tokens] };
        (() => {
          // Consume innermultilinecomment.
          if (!this.parseInnerMultiLineComment().success) return;
          tokens.push(this.lastParseData.ast.token);

          // Consume charsnohashequal?.
          if (this.parseCharsNoHashEqual()) tokens.push(this.lastParseData.ast.token);

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          ({ tokens } = otherState);
          break;
        }
      }

      // Consume '=#'.
      if (!this.parseToken('=#').success) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { token: tokens.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // multilinecomment =
  //   | "#=" charsnohashequal? (innermultilinecomment charsnohashequal?)* '=#' _? &(newline | eoi)
  parseMultiLineComment() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'multilinecomment';
    let tokens = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume '#='.
      if (!this.parseToken('#=').success) return null;

      // Consume charsnohashequal?.
      if (this.parseCharsNoHashEqual()) tokens.push(this.lastParseData.ast.token);

      // Optional-multiple parsing. (multilinecomment charsnohashequal?)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        const otherState = { tokens: [...tokens] };
        (() => {
          // Consume innermultilinecomment.
          if (!this.parseInnerMultiLineComment().success) return;
          tokens.push(this.lastParseData.ast.token);

          // Consume charsnohashequal?.
          if (this.parseCharsNoHashEqual()) tokens.push(this.lastParseData.ast.token);

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          ({ tokens } = otherState);
          break;
        }
      }

      // Consume '=#'.
      if (!this.parseToken('=#').success) return null;

      // Consume _?.
      this.parse_();

      // Check &(newline | eoi).
      const state = { lastPosition: this.lastPosition, column: this.column, line: this.line };
      if (!this.parseNewline().success && !this.parseEoi().success) return null;
      this.reset(state.lastPosition, null, null, state.column, state.line);

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, token: tokens.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // comment =
  //   | multilinecomment
  //   | !('#=') singlelinecomment
  parseComment() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'comment';
    let comment = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | multilinecomment
      // | !('#=') singlelinecomment
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. multilinecomment
      (() => {
        // Consume multilinecomment.
        if (!this.parseMultiLineComment().success) return;
        comment = this.lastParseData.ast;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [6]. !('#=') singlelinecomment
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Check !('#=').
          if (this.parseToken('#=').success) return;

          // Consume singlelinecomment.
          if (!this.parseSingleLineComment().success) return;
          comment = this.lastParseData.ast;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: comment };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // nextcodeline =
  //   | space* nextline (samedent comment (nextline | &eoi))*
  parseNextCodeLine() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'nextcodeline';
    let comments = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume space*.
      while (this.space.indexOf(this.peekChar()) > -1) {
        this.eatChar();
      }

      // Consume nextline.
      if (!this.parseNextLine().success) return null;

      // Optional-multiple parsing. (samedent comment (nextline | &eoi))*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        const otherState = { comments: [...comments] };
        (() => {
          // Consume samedent.
          if (!this.parseSamedent().success) return;

          // Consume comment.
          if (!this.parseComment().success) return;
          comments.push(this.lastParseData.ast);

          // Consume (nextline | &eoi).
          if (!this.parseNextLine().success && !this.parseEoi().success) return;

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          ({ comments } = otherState);
          break;
        }
      }

      // Update parseData.
      parseData = { success: true, message: null, ast: { comments } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // dedentoreoiend =
  //   | nextcodeline dedent
  //   | nextcodeline? _? &eoi
  parseDedentOrEoiEnd() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'dedentoreoiend';
    let comments = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | nextcodeline dedent
      // | nextcodeline? _? &eoi
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. nextcodeline dedent
      (() => {
        // Consume nextcodeline.
        if (!this.parseNextCodeLine().success) return;
        comments = this.lastParseData.ast;

        // Consume dedent.
        if (!this.parseDedent().success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. nextcodeline? _? &eoi
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Consume nextcodeline?.
          if (this.parseNextCodeLine().success) comments = this.lastParseData.ast;

          // Consume _?.
          this.parse_();

          // Consume &eoi.
          if (!this.parseEoi().success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: comments };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // linecontinuation =
  //   | space* '...' space* nextline samedent
  parseLineContinuation() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'linecontinuation';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume space*.
      while (this.space.indexOf(this.peekChar()) > -1) {
        this.eatChar();
      }

      // Consume '...'.
      if (!this.parseToken('...').success) return null;

      // Consume space*.
      while (this.space.indexOf(this.peekChar()) > -1) {
        this.eatChar();
      }

      // Consume nextline.
      if (!this.parseNextLine().success) return null;

      // Consume samedent.
      if (!this.parseSamedent().success) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: null };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // spaces =
  //   | space+
  parseSpaces() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'spaces';
    const parseData = { success: false, message: { type, parser: this }, ast: null };

    // Consume space+.
    let count = 0;

    while (this.space.indexOf(this.peekChar()) > -1) {
      this.eatChar();
      count += 1;
    }

    // Check if it was able to consume at least one whitespace.
    if (count > 0) return { success: true, message: null, ast: null };

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // _ =
  //   | linecontinuation
  //   | &{ignorenewline} nextcodeline samedent
  //   | space+ // Can eat others cake
  parse_() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = '_';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | linecontinuation
      // | &{ignorenewline} nextcodeline samedent
      // | space+ // Can eat others cake
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. linecontinuation
      (() => {
        // linecontinuation.
        if (!this.parseLineContinuation().success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. &{ignorenewline} nextcodeline samedent
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Check &{ignorenewline}.
          if (!this.ignoreNewline) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume samedent.
          if (!this.parseSamedent().success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. space+
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Consume space+.
          let count = 0;

          while (this.space.indexOf(this.peekChar()) > -1) {
            this.eatChar();
            count += 1;
          }

          // Check if it was able to consume at least one whitespace.
          if (count < 1) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: null };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // booleanliteral =
  //   | 'true'
  //   | 'false'
  parseBooleanLiteral() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'booleanliteral';
    let value = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume 'true' | 'false'.
      if (!this.parseToken('true').success && !this.parseToken('false').success) return null;
      value = this.lastParseData.ast.token;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, value } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // singlelinestringliteral =
  //   | "'" charsnonewlineorsinglequote? "'"
  //   | '"' charsnonewlineordoublequote? '"'
  parseSingleLineStringLiteral() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'singlelinestringliteral';
    let tokens = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | "'" charsnonewlineorsinglequote? "'"
      // | '"' charsnonewlineordoublequote? '"'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { tokens: [...tokens] };

      // [1]. "'" charsnonewlineorsinglequote? "'"
      (() => {
        // Consume "'".
        if (!this.parseToken("'").success) return;

        // Consume charsnonewlineorsinglequote?.
        if (this.parseCharsNoNewlineOrSingleQuote().success) tokens.push(this.lastParseData.ast.token);

        // Consume "'".
        if (!this.parseToken("'").success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '"' charsnonewlineordoublequote? '"'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ tokens } = otherState);

        (() => {
          // Consume '"'.
          if (!this.parseToken('"').success) return;

          // Consume charsnonewlineordoublequote?.
          if (this.parseCharsNoNewlineOrDoubleQuote().success) tokens.push(this.lastParseData.ast.token);

          // Consume '"'.
          if (!this.parseToken('"').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, token: tokens.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // multilinestringliteral =
  //   | "'''" charsnonewlineortriplesinglequote? (nextline samedent charsnonewlineortriplesinglequote?)* "'''"
  //   | '"""' charsnonewlineortripledoublequote? (nextline samedent charsnonewlineortripledoublequote?)* '"""'
  parseMultiLineStringLiteral() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'multilinestringliteral';
    let tokens = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | "'''" charsnonewlineortriplesinglequote? (nextline samedent charsnonewlineortriplesinglequote?)* "'''"
      // | '"""' charsnonewlineortripledoublequote? (nextline samedent charsnonewlineortripledoublequote?)* '"""'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { tokens: [...tokens] };

      // [1]. "'''" charsnonewlineortriplesinglequote? (nextline samedent charsnonewlineortriplesinglequote?)* "'''"
      (() => {
        // Consume "'''".
        if (!this.parseToken("'''").success) return;

        // Consume charsnonewlineortriplesinglequote?.
        if (this.parseCharsNoNewlineOrTripleSingleQuote().success) tokens.push(this.lastParseData.ast.token);

        // Optional-multiple parsing. (nextline samedent charsnonewlineortriplesinglequote?)*
        while (true) {
          let parseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume nextline.
            if (!this.parseNewline().success) return;

            // Consume samedent.
            if (!this.parseSamedent().success) return;

            // Consume charsnonewlineortriplesinglequote?.
            if (this.parseCharsNoNewlineOrTripleSingleQuote().success) tokens.push(this.lastParseData.ast.token);

            parseSuccessful = true;
          })();

          // If parsing the above fails, revert state to what it was before that parsing began.
          // And break out of the loop.
          if (!parseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            break;
          }
        }

        // Consume "'''".
        if (!this.parseToken("'''").success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '"""' charsnonewlineortripledoublequote? (nextline samedent charsnonewlineortripledoublequote?)* '"""'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ tokens } = otherState);

        (() => {
          // Consume '"""'.
          if (!this.parseToken('"""').success) return;

          // Consume charsnonewlineortripledoublequote?.
          if (this.parseCharsNoNewlineOrTripleDoubleQuote().success) tokens.push(this.lastParseData.ast.token);

          // Optional-multiple parsing. (nextline samedent charsnonewlineortripledoublequote?)*
          while (true) {
            let parseSuccessful = false;
            const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Consume nextline.
              if (!this.parseNewline().success) return;

              // Consume samedent.
              if (!this.parseSamedent().success) return;

              // Consume charsnonewlineortripledoublequote?.
              if (this.parseCharsNoNewlineOrTripleDoubleQuote().success) tokens.push(this.lastParseData.ast.token);

              parseSuccessful = true;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state2.lastPosition, null, null, state2.column, state2.line);
              break;
            }
          }

          // Consume '"""'.
          if (!this.parseToken('"""').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, token: tokens.join('\n') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // stringliteral =
  //   | multilinestringliteral
  //   | singlelinestringliteral
  parseStringLiteral() {
    const type = 'stringliteral';

    if (this.parseMultiLineStringLiteral().success) {
      return this.lastParseData;
    } else if (this.parseSingleLineStringLiteral().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // regexliteral =
  //   | '/' charsnonewlineorforwardslash? '/'
  parseRegexLiteral() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'regexliteral';
    let token = '';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume '/'.
      if (!this.parseToken('/').success) return null;

      // Consume charsnonewlineorforwardslash?.
      if (this.parseCharsNoNewlineOrForwardSlash().success) ({ token } = this.lastParseData.ast);

      // Consume '/'.
      if (!this.parseToken('/').success) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, token } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // _comma =
  //   | _? ','
  parse_Comma() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'endcomma';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume _?.
      this.parse_();

      // Consume ','.
      if (!this.parseToken(',').success) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: null };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // listarguments =
  //   | primitiveexpression (_comma _? primitiveexpression)* _comma?
  //   { expressions }
  parseListArguments() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'listarguments';
    const expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume primitiveexpression.
      if (!this.parsePrimitiveExpression().success) return null;
      expressions.push(this.lastParseData.ast);

      // Optional-multiple parsing. (_comma _? primitiveexpression)*
      while (true) {
        let parseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check _comma.
          if (!this.parse_Comma().success) return;

          // Check _?.
          this.parse_();

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          expressions.push(this.lastParseData.ast);

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          break;
        }
      }

      // Check _comma?.
      this.parse_Comma();

      // Update parseData.
      parseData = { success: true, message: null, ast: { expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // listargumentsmultiple =
  //   | listliteral (nextcodeline samedent listliteral)+
  //   | listarguments (_? ';' _? listarguments)+ (_? ';')?
  //   | listarguments (_? ';')?
  //   { expressions }
  parseListArgumentsMultiple() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'listargumentsmultiple';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | listliteral (nextcodeline samedent listliteral)+
      // | listarguments (_? ';' _? listarguments)+ (_? ';')?
      // | listarguments (_? ';')?
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { expressions: [...expressions] };

      // [1]. listliteral (nextcodeline samedent listliteral)+
      (() => {
        // Consume listliteral.
        if (!this.parseListLiteral().success) return;
        expressions.push(this.lastParseData.ast);

        // One-multiple parsing. (nextcodeline samedent listliteral)+
        let loopCount = 0;
        while (true) {
          let parseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume nextcodeline.
            if (!this.parseNextCodeLine().success) return;

            // Consume samedent.
            if (!this.parseSamedent().success) return;

            // Check listliteral.
            if (!this.parseListLiteral().success) return;
            expressions.push(this.lastParseData.ast);

            parseSuccessful = true;

            // Parsing successful, increment loop count.
            loopCount += 1;
          })();

          // If parsing the above fails, revert state to what it was before that parsing began.
          // And break out of the loop.
          if (!parseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            break;
          }
        }

        // At least one iteration of the above must be parsed successfully.
        if (loopCount < 1) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. listarguments (_? ';' _? listarguments)+ (_? ';')?
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ expressions } = otherState);

        (() => {
          // Consume listarguments.
          if (!this.parseListArguments().success) return;
          expressions.push({
            type: 'listliteral',
            expressions: this.lastParseData.ast.expressions,
          });

          // One-multiple parsing. (_? ';' _? listarguments)+
          let loopCount = 0;
          while (true) {
            let parseSuccessful = false;
            const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
            (() => {
              // Check _?.
              this.parse_();

              // Consume ';'.
              if (!this.parseToken(';').success) return;

              // Check _?.
              this.parse_();

              // Consume listarguments.
              if (!this.parseListArguments().success) return;
              expressions.push({
                type: 'listliteral',
                expressions: this.lastParseData.ast.expressions,
              });

              parseSuccessful = true;

              // Parsing successful, increment loop count.
              loopCount += 1;
            })();

            // If parsing the above fails, revert state to what it was before that parsing began.
            // And break out of the loop.
            if (!parseSuccessful) {
              this.reset(state2.lastPosition, null, null, state2.column, state2.line);
              break;
            }
          }

          // At least one iteration of the above must be parsed successfully.
          if (loopCount < 1) return;

          // Optional parsing. (_? ';')?
          let optionalParseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Check _?.
            this.parse_();

            // Consume ';'.
            if (!this.parseToken(';').success) return;

            // This optional was parsed successfully.
            optionalParseSuccessful = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          }

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. listarguments  (_? ';')?
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ expressions } = otherState);

        (() => {
          // Consume listarguments.
          if (!this.parseListArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Optional parsing. (_? ';')?
          let optionalParseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Check _?.
            this.parse_();

            // Consume ';'.
            if (!this.parseToken(';').success) return;

            // This optional was parsed successfully.
            optionalParseSuccessful = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          }

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // listliteral =
  //   | '[' _? ']' // ignorenewline
  //   | '[' spaces? listargumentsmultiple _? ']' // ignorenewline
  //   | '[' nextcodeline indent listargumentsmultiple nextcodeline dedent ']'
  //   { type, expressions }
  parseListLiteral() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'listliteral';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '[' _? ']' // ignorenewline
      // | '[' spaces? listargumentsmultiple _? ']' // ignorenewline
      // | '[' nextcodeline indent listargumentsmultiple nextcodeline dedent ']'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { expressions: [...expressions] };

      // [1]. '[' _? ']' // ignorenewline
      (() => {
        // Consume '['.
        if (!this.parseToken('[').success) return;

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume _?.
        this.parse_();

        // Consume ']'.
        if (!this.parseToken(']').success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '[' spaces? listargumentsmultiple _? ']' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '['.
          if (!this.parseToken('[').success) return;

          // Consume spaces?.
          this.parseSpaces();

          // Ignore newline from this point
          this.ignoreNewline = true;

          // Consume listargumentsmultiple.
          if (!this.parseListArgumentsMultiple().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume _?
          this.parse_();

          // Consume ']'.
          if (!this.parseToken(']').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. '[' nextcodeline indent listargumentsmultiple nextcodeline dedent ']'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '['.
          if (!this.parseToken('[').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume listargumentsmultiple.
          if (!this.parseListArgumentsMultiple().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume ']'.
          if (!this.parseToken(']').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // objectargument =
  //   | identifier _? ':' _? objectblock &(primitiveexpression | '}')
  //   | identifier _? ':' _? primitiveexpression &(_comma | nextcodeline _? | _? '}')
  //   | identifier &(_comma | nextcodeline _? | _? '}')
  //   { key, value }
  parseObjectArgument() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'objectargument';
    let key = null;
    let value = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | identifier _? ':' _? objectblock &(primitiveexpression | '}')
      // | identifier _? ':' _? primitiveexpression &(_comma | nextcodeline _? | _? '}')
      // | identifier &(_comma | nextcodeline _? | _? '}')
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { key, value };

      // [1]. identifier _? ':' _? objectblock &(primitiveexpression | '}')
      (() => {
        // Consume identifier.
        if (!this.parseIdentifier().success) return;
        key = this.lastParseData.ast.name;

        // Consume _?.
        this.parse_();

        // Consume ':'.
        if (!this.parseToken(':').success) return;

        // Consume _?.
        this.parse_();

        // Consume objectblock.
        if (!this.parseObjectBlock().success) return;
        value = this.lastParseData.ast;

        // Check &(primitiveexpression | '}').
        const state2 = { lastPosition: this.lastPosition, column: this.column, line: this.line };
        if (!this.parsePrimitiveExpression().success && !this.parseToken('}').success) return;
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. identifier _? ':' _? primitiveexpression &(_comma | nextcodeline _? | _? '}')
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ key, value } = otherState);

        (() => {
          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          key = this.lastParseData.ast.name;

          // Consume _?.
          this.parse_();

          // Consume ':'.
          if (!this.parseToken(':').success) return;

          // Consume _?.
          this.parse_();

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          value = this.lastParseData.ast;

          // Check &(_comma | nextcodeline _? | _? '}').
          const state2 = { lastPosition: this.lastPosition, column: this.column, line: this.line };
          // Alternate parsing.
          // | _comma
          // | nextcodeline _?
          // | _? '}'
          let alternativeParseSuccessful2 = false;

          // [1]. _comma
          (() => {
            // Consume _comma.
            if (!this.parse_Comma().success) return;

            // This alternative was parsed successfully.
            alternativeParseSuccessful2 = true;
          })();

          // [2]. nextcodeline _?
          if (!alternativeParseSuccessful2) {
            // Revert state to what it was before alternative parsing started.
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            (() => {
              // Consume nextcodeline.
              if (!this.parseNextCodeLine().success) return;

              // Consume _?.
              this.parse_();

              // This alternative was parsed successfully.
              alternativeParseSuccessful2 = true;
            })();
          }

          // [3]. _? '}'
          if (!alternativeParseSuccessful2) {
            // Revert state to what it was before alternative parsing started.
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            (() => {
              // Consume _?.
              this.parse_();

              // Consume '}'.
              if (!this.parseToken('}').success) return;

              // This alternative was parsed successfully.
              alternativeParseSuccessful2 = true;
            })();
          }

          // Check if any of the alternatives was parsed successfully
          if (!alternativeParseSuccessful2) return;

          // Revert state to what it was before alternative parsing started.
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. identifier &(_comma | nextcodeline _? | _? '}')
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ key, value } = otherState);

        (() => {
          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          key = this.lastParseData.ast.name;
          value = this.lastParseData.ast;

          // Check &(_comma | nextcodeline _? | _? '}').
          const state2 = { lastPosition: this.lastPosition, column: this.column, line: this.line };
          // Alternate parsing.
          // | _comma
          // | nextcodeline _?
          // | _? '}'
          let alternativeParseSuccessful2 = false;

          // [1]. _comma
          (() => {
            // Consume _comma.
            if (!this.parse_Comma().success) return;

            // This alternative was parsed successfully.
            alternativeParseSuccessful2 = true;
          })();

          // [2]. nextcodeline _?
          if (!alternativeParseSuccessful2) {
            // Revert state to what it was before alternative parsing started.
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            (() => {
              // Consume nextcodeline.
              if (!this.parseNextCodeLine().success) return;

              // Consume _?.
              this.parse_();

              // This alternative was parsed successfully.
              alternativeParseSuccessful2 = true;
            })();
          }

          // [3]. _? '}'
          if (!alternativeParseSuccessful2) {
            // Revert state to what it was before alternative parsing started.
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            (() => {
              // Consume _?.
              this.parse_();

              // Consume '}'.
              if (!this.parseToken('}').success) return;

              // This alternative was parsed successfully.
              alternativeParseSuccessful2 = true;
            })();
          }

          // Check if any of the alternatives was parsed successfully
          if (!alternativeParseSuccessful2) return;

          // Revert state to what it was before alternative parsing started.
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { key, value } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // objectarguments =
  //   | objectargument ((_comma _? | nextcodeline samedent)? objectargument)* _comma?
  //   { expressions: [{ key, value }] }
  parseObjectArguments() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'objectarguments';
    const expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume objectargument.
      if (!this.parseObjectArgument().success) return null;
      expressions.push(this.lastParseData.ast);

      // Optional-multiple parsing. ((_comma _? | nextcodeline samedent)? dictargument)*
      while (true) {
        let parseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Optional parsing. (_comma _? | nextcodeline samedent)?
          let optionalParseSuccessful3 = false;
          const state5 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Alternate parsing.
            // | _comma _?
            // | nextcodeline samedent
            let alternativeParseSuccessful = false;

            // Save state before alternative parsing.
            const state6 = { lastPosition: this.lastPosition, line: this.line, column: this.column };

            // [1]. _comma _?
            (() => {
              // Check _comma.
              if (!this.parse_Comma().success) return;

              // Check _?.
              this.parse_();

              // This alternative was parsed successfully.
              alternativeParseSuccessful = true;
            })();

            // [2]. nextcodeline samedent
            if (!alternativeParseSuccessful) {
              // Revert state to what it was before alternative parsing started.
              this.reset(state6.lastPosition, null, null, state6.column, state6.line);
              (() => {
                // Consume nextcodeline.
                if (!this.parseNextCodeLine().success) return;

                // Consume samedent.
                if (!this.parseSamedent().success) return;

                // This alternative was parsed successfully.
                alternativeParseSuccessful = true;
              })();
            }

            // Check if any of the alternatives was parsed successfully
            if (!alternativeParseSuccessful) return;

            // This optional was parsed successfully.
            optionalParseSuccessful3 = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful3) {
            this.reset(state5.lastPosition, null, null, state5.column, state5.line);
          }

          // Consume objectargument.
          if (!this.parseObjectArgument().success) return;
          expressions.push(this.lastParseData.ast);

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          break;
        }
      }

      // Check _comma.
      this.parse_Comma();

      // Update parseData.
      parseData = { success: true, message: null, ast: { expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // objectblock =
  //   | nextcodeline indent objectarguments nextcodeline dedent
  //   { type, expressions: [{ key, value }] }
  parseObjectBlock() {
    // Keep original state.
    const {
      lastPosition, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'objectliteral';
    let expressions = [];
    let parseData = { success: false, message: { type: 'objectblock', parser: this }, ast: null };

    (() => {
      // Consume nextcodeline.
      if (!this.parseNextCodeLine().success) return null;

      // Consume indent.
      if (!this.parseIndent().success) return null;

      // Consume objectarguments.
      if (!this.parseObjectArguments().success) return null;
      ({ expressions } = this.lastParseData.ast);

      // Consume nextcodeline.
      if (!this.parseNextCodeLine().success) return null;

      // Consume dedent.
      if (!this.parseDedent().success) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // objectliteral =
  //   | '{' _? '}' // ignorenewline
  //   | '{' spaces? objectarguments _? '}' // ignorenewline
  //   | '{' nextcodeline indent objectarguments nextcodeline dedent '}'
  //   { type, expressions: [{ key, value }] }
  parseObjectLiteral() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'objectliteral';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '{' _? '}' // ignorenewline
      // | '{' spaces? dictarguments _? '}' // ignorenewline
      // | '{' nextcodeline indent dictarguments nextcodeline dedent '}'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { expressions: [...expressions] };

      // [1]. '{' _? '}' // ignorenewline
      (() => {
        // Consume '{'.
        if (!this.parseToken('{').success) return;

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume _?.
        this.parse_();

        // Consume '}'.
        if (!this.parseToken('}').success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '{' spaces? objectarguments _? '}' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '{'.
          if (!this.parseToken('{').success) return;

          // Consume spaces?.
          this.parseSpaces();

          // Ignore newline from this point
          this.ignoreNewline = true;

          // Consume objectarguments.
          if (!this.parseObjectArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume _?
          this.parse_();

          // Consume '}'.
          if (!this.parseToken('}').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. '{' nextcodeline indent objectarguments nextcodeline dedent '}'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '{'.
          if (!this.parseToken('{').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume objectarguments.
          if (!this.parseObjectArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume '}'.
          if (!this.parseToken('}').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // dictargument =
  //   | primitiveexpression _? ':' _? objectblock &(primitiveexpression | '}')
  //   | primitiveexpression _? ':' _? (subdictliteral | primitiveexpression) &(_comma | nextcodeline _? | _? '}')
  //   | identifier &(_comma | nextcodeline _? | _? '}')
  //   { key, value }
  parseDictArgument() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'dictargument';
    let key = null;
    let value = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | primitiveexpression _? ':' _? objectblock &(primitiveexpression | '}')
      // | primitiveexpression _? ':' _? primitiveexpression &(_comma | nextcodeline _? | _? '}')
      // | identifier &(_comma | nextcodeline _? | _? '}')
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { key, value };

      // [1]. primitiveexpression _? ':' _? objectblock &(primitiveexpression | '}')
      (() => {
        // Consume primitiveexpression.
        if (!this.parsePrimitiveExpression().success) return;
        key = this.lastParseData.ast;

        // Consume _?.
        this.parse_();

        // Consume ':'.
        if (!this.parseToken(':').success) return;

        // Consume _?.
        this.parse_();

        // Consume objectblock.
        if (!this.parseObjectBlock().success) return;
        value = this.lastParseData.ast;

        // Check &(primitiveexpression | '}').
        const state2 = { lastPosition: this.lastPosition, column: this.column, line: this.line };
        if (!this.parsePrimitiveExpression().success && !this.parseToken('}').success) return;
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. primitiveexpression _? ':' _? primitiveexpression &(_comma | nextcodeline _? | _? '}')
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ key, value } = otherState);

        (() => {
          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          key = this.lastParseData.ast;

          // Consume _?.
          this.parse_();

          // Consume ':'.
          if (!this.parseToken(':').success) return;

          // Consume _?.
          this.parse_();

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          value = this.lastParseData.ast;

          // Check &(_comma | nextcodeline _? | _? '}').
          const state2 = { lastPosition: this.lastPosition, column: this.column, line: this.line };
          // Alternate parsing.
          // | _comma
          // | nextcodeline _?
          // | _? '}'
          let alternativeParseSuccessful2 = false;

          // [1]. _comma
          (() => {
            // Consume _comma.
            if (!this.parse_Comma().success) return;

            // This alternative was parsed successfully.
            alternativeParseSuccessful2 = true;
          })();

          // [2]. nextcodeline _?
          if (!alternativeParseSuccessful2) {
            // Revert state to what it was before alternative parsing started.
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            (() => {
              // Consume nextcodeline.
              if (!this.parseNextCodeLine().success) return;

              // Consume _?.
              this.parse_();

              // This alternative was parsed successfully.
              alternativeParseSuccessful2 = true;
            })();
          }

          // [3]. _? '}'
          if (!alternativeParseSuccessful2) {
            // Revert state to what it was before alternative parsing started.
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            (() => {
              // Consume _?.
              this.parse_();

              // Consume '}'.
              if (!this.parseToken('}').success) return;

              // This alternative was parsed successfully.
              alternativeParseSuccessful2 = true;
            })();
          }

          // Check if any of the alternatives was parsed successfully
          if (!alternativeParseSuccessful2) return;

          // Revert state to what it was before alternative parsing started.
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. identifier &(_comma | nextcodeline _? | _? '}')
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ key, value } = otherState);

        (() => {
          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          key = this.lastParseData.ast;
          value = this.lastParseData.ast;

          // Check &(_comma | nextcodeline _? | _? '}').
          const state2 = { lastPosition: this.lastPosition, column: this.column, line: this.line };
          // Alternate parsing.
          // | _comma
          // | nextcodeline _?
          // | _? '}'
          let alternativeParseSuccessful2 = false;

          // [1]. _comma
          (() => {
            // Consume _comma.
            if (!this.parse_Comma().success) return;

            // This alternative was parsed successfully.
            alternativeParseSuccessful2 = true;
          })();

          // [2]. nextcodeline _?
          if (!alternativeParseSuccessful2) {
            // Revert state to what it was before alternative parsing started.
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            (() => {
              // Consume nextcodeline.
              if (!this.parseNextCodeLine().success) return;

              // Consume _?.
              this.parse_();

              // This alternative was parsed successfully.
              alternativeParseSuccessful2 = true;
            })();
          }

          // [3]. _? '}'
          if (!alternativeParseSuccessful2) {
            // Revert state to what it was before alternative parsing started.
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            (() => {
              // Consume _?.
              this.parse_();

              // Consume '}'.
              if (!this.parseToken('}').success) return;

              // This alternative was parsed successfully.
              alternativeParseSuccessful2 = true;
            })();
          }

          // Check if any of the alternatives was parsed successfully
          if (!alternativeParseSuccessful2) return;

          // Revert state to what it was before alternative parsing started.
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { key, value } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // dictarguments =
  //   | dictargument ((_comma _? | nextcodeline samedent)? dictargument)* _comma?
  //   { expressions: [{ key, value }] }
  parseDictArguments() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'dictarguments';
    const expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume dictargument.
      if (!this.parseDictArgument().success) return null;
      expressions.push(this.lastParseData.ast);

      // Optional-multiple parsing. ((_comma _? | nextcodeline samedent)? dictargument)*
      while (true) {
        let parseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Optional parsing. (_comma _? | nextcodeline samedent)?
          let optionalParseSuccessful3 = false;
          const state5 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Alternate parsing.
            // | _comma _?
            // | nextcodeline samedent
            let alternativeParseSuccessful = false;

            // Save state before alternative parsing.
            const state6 = { lastPosition: this.lastPosition, line: this.line, column: this.column };

            // [1]. _comma _?
            (() => {
              // Check _comma.
              if (!this.parse_Comma().success) return;

              // Check _?.
              this.parse_();

              // This alternative was parsed successfully.
              alternativeParseSuccessful = true;
            })();

            // [2]. nextcodeline samedent
            if (!alternativeParseSuccessful) {
              // Revert state to what it was before alternative parsing started.
              this.reset(state6.lastPosition, null, null, state6.column, state6.line);
              (() => {
                // Consume nextcodeline.
                if (!this.parseNextCodeLine().success) return;

                // Consume samedent.
                if (!this.parseSamedent().success) return;

                // This alternative was parsed successfully.
                alternativeParseSuccessful = true;
              })();
            }

            // Check if any of the alternatives was parsed successfully
            if (!alternativeParseSuccessful) return;

            // This optional was parsed successfully.
            optionalParseSuccessful3 = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful3) {
            this.reset(state5.lastPosition, null, null, state5.column, state5.line);
          }

          // Consume dictargument.
          if (!this.parseDictArgument().success) return;
          expressions.push(this.lastParseData.ast);

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          break;
        }
      }

      // Check _comma.
      this.parse_Comma();

      // Update parseData.
      parseData = { success: true, message: null, ast: { expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // dictliteral =
  //   | '@' '{' _? '}' // ignorenewline
  //   | '@' '{' spaces? dictarguments _? '}' // ignorenewline
  //   | '@' '{' nextcodeline indent dictarguments nextcodeline dedent '}'
  //   { type, expressions: [{ key, value }] }
  parseDictLiteral() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'dictliteral';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '@' '{' _? '}' // ignorenewline
      // | '@' '{' spaces? dictarguments _? '}' // ignorenewline
      // | '@' '{' nextcodeline indent dictarguments nextcodeline dedent '}'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { expressions: [...expressions] };

      // [1]. '@' '{' _? '}' // ignorenewline
      (() => {
        // Consume '@'.
        if (!this.parseToken('@').success) return;

        // Consume '{'.
        if (!this.parseToken('{').success) return;

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume _?.
        this.parse_();

        // Consume '}'.
        if (!this.parseToken('}').success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '@' '{' spaces? dictarguments _? '}' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '@'.
          if (!this.parseToken('@').success) return;

          // Consume '{'.
          if (!this.parseToken('{').success) return;

          // Consume spaces?.
          this.parseSpaces();

          // Ignore newline from this point
          this.ignoreNewline = true;

          // Consume dictarguments.
          if (!this.parseDictArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume _?
          this.parse_();

          // Consume '}'.
          if (!this.parseToken('}').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. '@' '{' nextcodeline indent dictarguments nextcodeline dedent '}'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '@'.
          if (!this.parseToken('@').success) return;

          // Consume '{'.
          if (!this.parseToken('{').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume dictarguments.
          if (!this.parseDictArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume '}'.
          if (!this.parseToken('}').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // setarguments =
  //   | primitiveexpression (_comma _? primitiveexpression)* _comma?
  //   { expressions }
  parseSetArguments() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'setarguments';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume primitiveexpression.
      if (!this.parsePrimitiveExpression().success) return;
      expressions.push(this.lastParseData.ast);

      // Optional-multiple parsing. (_comma _? primitiveexpression)*
      while (true) {
        let parseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume comma.
          if (!this.parse_Comma().success) return;

          // Consume _?.
          this.parse_();

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          expressions.push(this.lastParseData.ast);

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          break;
        }
      }

      // Consume _comma?.
      this.parse_Comma();

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // setliteral =
  //   | '%' '{' _? '}' // ignorenewline
  //   | '%' '{' spaces? setarguments _? '}' // ignorenewline
  //   | '%' '{' nextcodeline indent setarguments nextcodeline dedent '}'
  //   { type, expressions }
  parseSetLiteral() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'setliteral';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '%' '{' _? '}' // ignorenewline
      // | '%' '{' spaces? setarguments _? '}' // ignorenewline
      // | '%' '{' nextcodeline indent setarguments nextcodeline dedent '}'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { expressions: [...expressions] };

      // [1]. '%' '{' _? '}' // ignorenewline
      (() => {
        // Consume '%'.
        if (!this.parseToken('%').success) return;

        // Consume '{'.
        if (!this.parseToken('{').success) return;

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume _?.
        this.parse_();

        // Consume '}'.
        if (!this.parseToken('}').success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '%' '{' spaces? setarguments _? '}' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '%'.
          if (!this.parseToken('%').success) return;

          // Consume '{'.
          if (!this.parseToken('{').success) return;

          // Consume spaces?.
          this.parseSpaces();

          // Ignore newline from this point
          this.ignoreNewline = true;

          // Consume tuplearguments.
          if (!this.parseTupleArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume _?
          this.parse_();

          // Consume '}'.
          if (!this.parseToken('}').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. '%' '{' nextcodeline indent setarguments nextcodeline dedent '}'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '%'.
          if (!this.parseToken('%').success) return;

          // Consume '{'.
          if (!this.parseToken('{').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume tuplearguments.
          if (!this.parseTupleArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume '}'.
          if (!this.parseToken('}').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // tuplearguments =
  //   | primitiveexpression (_comma _? primitiveexpression)+ _comma?
  //   | primitiveexpression _comma
  //   { expressions }
  parseTupleArguments() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'tuplearguments';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | primitiveexpression (_comma _? primitiveexpression)+ _comma?
      // | primitiveexpression _comma
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { expressions: [...expressions] };

      // [1]. primitiveexpression (_comma _? primitiveexpression)+ _comma?
      (() => {
        // Consume primitiveexpression.
        if (!this.parsePrimitiveExpression().success) return;
        expressions.push(this.lastParseData.ast);

        // One-multiple parsing. (_comma _? primitiveexpression)+
        let loopCount = 0;
        while (true) {
          let parseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume comma.
            if (!this.parse_Comma().success) return;

            // Consume _?.
            this.parse_();

            // Consume primitiveexpression.
            if (!this.parsePrimitiveExpression().success) return;
            expressions.push(this.lastParseData.ast);

            parseSuccessful = true;

            // Parsing successful, increment loop count.
            loopCount += 1;
          })();

          // If parsing the above fails, revert state to what it was before that parsing began.
          // And break out of the loop.
          if (!parseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            break;
          }
        }

        // At least one iteration of the above must be parsed successfully.
        if (loopCount < 1) return;

        // Consume _comma?.
        this.parse_Comma();

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. primitiveexpression _comma
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ expressions } = otherState);

        (() => {
          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          expressions.push(this.lastParseData.ast);

          // Consume comma.
          if (!this.parse_Comma().success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // tupleliteral =
  //   | '(' _? ')' // ignorenewline
  //   | '(' spaces? tuplearguments _? ')' // ignorenewline
  //   | '(' nextcodeline indent tuplearguments nextcodeline dedent ')'
  //   { type, expressions }
  parseTupleLiteral() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'tupleliteral';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '(' _? ')' // ignorenewline
      // | '(' spaces? tuplearguments _? ')' // ignorenewline
      // | '(' nextcodeline indent tuplearguments nextcodeline dedent ')'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { expressions: [...expressions] };

      // [1]. '(' _? ')' // ignorenewline
      (() => {
        // Consume '('.
        if (!this.parseToken('(').success) return;

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume _?.
        this.parse_();

        // Consume ')'.
        if (!this.parseToken(')').success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '(' spaces? tuplearguments _? ')' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume spaces?.
          this.parseSpaces();

          // Ignore newline from this point
          this.ignoreNewline = true;

          // Consume tuplearguments.
          if (!this.parseTupleArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume _?
          this.parse_();

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. '(' nextcodeline indent tuplearguments nextcodeline dedent ')'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume tuplearguments.
          if (!this.parseTupleArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // namedtuplearguments =
  //   | identifier _? ':' _? primitiveexpression (_comma _? identifier _? ':' _? primitiveexpression)* _comma?
  //   { expressions: [{ key, value }] }
  parseNamedTupleArguments() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'namedtuplearguments';
    const expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      let key = null;
      let value = null;

      // Consume identifier.
      if (!this.parseIdentifier().success) return null;
      key = this.lastParseData.ast.name;

      // Consume _?.
      this.parse_();

      // Consume ':'.
      if (!this.parseToken(':').success) return null;

      // Consume _?.
      this.parse_();

      // Consume primitiveexpression.
      if (!this.parsePrimitiveExpression().success) return null;
      value = this.lastParseData.ast;

      expressions.push({ key, value });

      // Optional-multiple parsing. (_comma _? identifier _? ':' _? primitiveexpression)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume comma.
          if (!this.parse_Comma().success) return;

          // Consume _?.
          this.parse_();

          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          key = this.lastParseData.ast.name;

          // Consume _?.
          this.parse_();

          // Consume ':'.
          if (!this.parseToken(':').success) return;

          // Consume _?.
          this.parse_();

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          value = this.lastParseData.ast;

          expressions.push({ key, value });

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // Consume _comma?.
      this.parse_Comma();

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // namedtupleliteral =
  //   | '(' _? ':' _?  ')' // ignorenewline
  //   | '(' spaces? namedtuplearguments _? ')' // ignorenewline
  //   | '(' nextcodeline indent namedtuplearguments nextcodeline dedent ')'
  //   { type, expressions: [{ key, value }] }
  parseNamedTupleLiteral() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'namedtupleliteral';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '(' _? ':' _?  ')'  // ignorenewline
      // | '(' spaces? namedtuplearguments _? ')' // ignorenewline
      // | '(' nextcodeline indent namedtuplearguments nextcodeline dedent ')'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { expressions: [...expressions] };

      // [1]. '(' _? ':' _?  ')'  // ignorenewline
      (() => {
        // Consume '('.
        if (!this.parseToken('(').success) return;

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume _?.
        this.parse_();

        // Consume ':'.
        if (!this.parseToken(':').success) return;

        // Consume _?.
        this.parse_();

        // Consume ')'.
        if (!this.parseToken(')').success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '(' spaces? namedtuplearguments _? ')' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume spaces?.
          this.parseSpaces();

          // Ignore newline from this point
          this.ignoreNewline = true;

          // Consume namedtuplearguments.
          if (!this.parseNamedTupleArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume _?
          this.parse_();

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. '(' nextcodeline indent namedtuplearguments nextcodeline dedent ')'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume namedtuplearguments.
          if (!this.parseNamedTupleArguments().success) return;
          ({ expressions } = this.lastParseData.ast);

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // symbolliteral =
  //   | '$' identifier
  //   | '$' '(' _? expression _? ')' // ignorenewline
  //   | '$' '(' block ')'
  //   { type, expression }
  parseSymbolLiteral() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'symbolliteral';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '$' identifier
      // | '$' '(' spaces? expression _? ')' // ignorenewline
      // | '$' '(' block ')'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { expressions: [...expressions] };

      // [1]. '$' identifier
      (() => {
        // Consume '$'.
        if (!this.parseToken('$').success) return;

        // Consume identifier.
        if (!this.parseIdentifier().success) return;
        expressions.push(this.lastParseData.ast);

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '$' '(' spaces? expression _? ')' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '$'.
          if (!this.parseToken('$').success) return;

          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume spaces?.
          this.parseSpaces();

          // Ignore newline from this point
          this.ignoreNewline = true;

          // Consume expression.
          if (!this.parseExpression().success) return;
          expressions.push(this.lastParseData.ast);

          // Consume _?
          this.parse_();

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. '$' '(' block ')'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '$'.
          if (!this.parseToken('$').success) return;

          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume expression.
          if (!this.parseExpression().success) return;
          expressions.push(this.lastParseData.ast);

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // listcomprehension =
  //   | '[' _? primitiveexpression _? '|' _? forhead (_? ';' _? forhead)* (_ 'where' _ primitiveexpression)? _? ']' // ignorenewline
  //   { type, expression, iterators:[{ lhs, rhs}], guard }
  parseListComprehension() { // TODO: Unimplemented
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'listcomprehension';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '$' identifier
      // | '$' '(' spaces? expression _? ')' // ignorenewline
      // | '$' '(' block ')'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { expressions: [...expressions] };

      // [1]. '$' identifier
      (() => {
        // Consume '$'.
        if (!this.parseToken('$').success) return;

        // Consume identifier.
        if (!this.parseIdentifier().success) return;
        expressions.push(this.lastParseData.ast);

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '$' '(' spaces? expression _? ')' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '$'.
          if (!this.parseToken('$').success) return;

          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume spaces?.
          this.parseSpaces();

          // Ignore newline from this point
          this.ignoreNewline = true;

          // Consume expression.
          if (!this.parseExpression().success) return;
          expressions.push(this.lastParseData.ast);

          // Consume _?
          this.parse_();

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. '$' '(' block ')'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '$'.
          if (!this.parseToken('$').success) return;

          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume expression.
          if (!this.parseExpression().success) return;
          expressions.push(this.lastParseData.ast);

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // dictcomprehension =
  //   | '{' _? (primitiveexpression _? ':' _? primitiveexpression | identifier) _? '|' _? forhead (_? ';' _? forhead)* (_ 'where' _ primitiveexpression)? _? '}' // ignorenewline
  //   { type, key, value, iterators:[{ lhs, rhs}], guard }
  parseDictComprehension() { // TODO: Unimplemented
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'dictcomprehension';
    let expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '$' identifier
      // | '$' '(' spaces? expression _? ')' // ignorenewline
      // | '$' '(' block ')'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { expressions: [...expressions] };

      // [1]. '$' identifier
      (() => {
        // Consume '$'.
        if (!this.parseToken('$').success) return;

        // Consume identifier.
        if (!this.parseIdentifier().success) return;
        expressions.push(this.lastParseData.ast);

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '$' '(' spaces? expression _? ')' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '$'.
          if (!this.parseToken('$').success) return;

          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume spaces?.
          this.parseSpaces();

          // Ignore newline from this point
          this.ignoreNewline = true;

          // Consume expression.
          if (!this.parseExpression().success) return;
          expressions.push(this.lastParseData.ast);

          // Consume _?
          this.parse_();

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. '$' '(' block ')'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '$'.
          if (!this.parseToken('$').success) return;

          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume expression.
          if (!this.parseExpression().success) return;
          expressions.push(this.lastParseData.ast);

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // comprehension =
  //   | listcomprehension
  //   | dictcomprehension
  parseComprehension() { // TODO: incorrect implementation
    const type = 'comprehension';

    if (this.parseListComprehension().success) {
      return this.lastParseData;
    } else if (this.parseDictComprehension().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // literal =
  //   | numericliteral
  //   | booleanliteral
  //   | stringliteral
  //   | regexliteral
  //   | listliteral
  //   | objectliteral
  //   | dictliteral
  //   | setliteral
  //   | tupleliteral
  //   | namedtupleliteral
  //   | symbolliteral
  //   | comprehension
  parseLiteral() {
    const type = 'literal';

    if (this.parseNumericLiteral().success) {
      return this.lastParseData;
    } else if (this.parseBooleanLiteral().success) {
      return this.lastParseData;
    } else if (this.parseStringLiteral().success) {
      return this.lastParseData;
    } else if (this.parseRegexLiteral().success) {
      return this.lastParseData;
    } else if (this.parseListLiteral().success) {
      return this.lastParseData;
    } else if (this.parseObjectLiteral().success) {
      return this.lastParseData;
    } else if (this.parseDictLiteral().success) {
      return this.lastParseData;
    } else if (this.parseSetLiteral().success) {
      return this.lastParseData;
    } else if (this.parseTupleLiteral().success) {
      return this.lastParseData;
    } else if (this.parseNamedTupleLiteral().success) {
      return this.lastParseData;
    } else if (this.parseSymbolLiteral().success) {
      return this.lastParseData;
    } else if (this.parseComprehension().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // callarguments =
  //   | (identifier _? ':' _?)? primitiveexpression (_comma _? (identifier _? ':' _?)? primitiveexpression)* _comma?
  //   { expressions: [{ key, value }] }
  parseCallArguments() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'callarguments';
    const expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      let key = null;
      let value = null;

      // Optional parsing. (identifier _? ':' _?)?
      let optionalParseSuccessful = false;
      const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Consume identifier.
        if (!this.parseIdentifier().success) return;
        key = this.lastParseData.ast.name;

        // Consume _?.
        this.parse_();

        // Consume ':'.
        if (!this.parseToken(':').success) return;

        // Consume _?.
        this.parse_();

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);
        key = null;
      }

      // Consume primitiveexpression.
      if (!this.parsePrimitiveExpression().success) return null;
      value = this.lastParseData.ast;

      expressions.push({ key, value });

      // Optional-multiple parsing. (_comma _? (identifier _? ':' _?)? primitiveexpression)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume comma.
          if (!this.parse_Comma().success) return;

          // Consume _?.
          this.parse_();

          // Optional parsing. (identifier _? ':' _?)?
          let optionalParseSuccessful2 = false;
          const state3 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume identifier.
            if (!this.parseIdentifier().success) return;
            key = this.lastParseData.ast.name;

            // Consume _?.
            this.parse_();

            // Consume ':'.
            if (!this.parseToken(':').success) return;

            // Consume _?.
            this.parse_();

            // This optional was parsed successfully.
            optionalParseSuccessful2 = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful2) {
            this.reset(state3.lastPosition, null, null, state3.column, state3.line);
            key = null;
          }

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          value = this.lastParseData.ast;

          expressions.push({ key, value });

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      // Consume _comma?.
      this.parse_Comma();

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // callpostfix =
  //   | spaces? ('!' spaces?)? '.'? (' _? ')' // ignorenewline
  //   | spaces? ('!' spaces?)? '.'? '(' spaces? callarguments _? ')' // ignorenewline
  //   | spaces? ('!' spaces?)? '.'? '(' nextcodeline indent callarguments nextcodeline dedent ')'
  //   { type, expression, mutative, vectorized, arguments: [{ key, value }] }
  parseCallPostfix() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'call';
    const expression = null;
    let mutative = false;
    let vectorized = false;
    let args = [];
    let parseData = { success: false, message: { type: 'callpostfix', parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | spaces? ('!' spaces?)? '.'? '(' _? ')' // ignorenewline
      // | spaces? ('!' spaces?)? '.'? '(' spaces? callarguments _? ')' // ignorenewline
      // | spaces? ('!' spaces?)? '.'? '(' nextcodeline indent callarguments nextcodeline dedent ')'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { args: [...args] };

      // [1]. spaces? ('!' spaces?)? '.'? '(' _? ')' // ignorenewline
      (() => {
        // Consume spaces?.
        this.parseSpaces();

        // Optional parsing. ('!' spaces?)?
        let optionalParseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume '!'.
          if (!this.parseToken('!').success) return;
          mutative = true;

          // Consume spaces?.
          this.parseSpaces();

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
        }

        // Consume '.'?.
        if (this.parseToken('.').success) vectorized = true;


        // Consume '('.
        if (!this.parseToken('(').success) return;

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume _?.
        this.parse_();

        // Consume ')'.
        if (!this.parseToken(')').success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. spaces? ('!' spaces?)? '.'? '(' spaces? callarguments _? ')' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ args } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume spaces?.
          this.parseSpaces();

          // Optional parsing. ('!' spaces?)?
          let optionalParseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume '!'.
            if (!this.parseToken('!').success) return;
            mutative = true;

            // Consume spaces?.
            this.parseSpaces();

            // This optional was parsed successfully.
            optionalParseSuccessful = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          }

          // Consume '.'?.
          if (this.parseToken('.').success) vectorized = true;

          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume spaces?.
          this.parseSpaces();

          // Ignore newline from this point
          this.ignoreNewline = true;

          // Consume callarguments.
          if (!this.parseCallArguments().success) return;
          args = this.lastParseData.ast.expressions;

          // Consume _?
          this.parse_();

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. spaces? ('!' spaces?)? '.'? '(' nextcodeline indent callarguments nextcodeline dedent ')'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ args } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume spaces?.
          this.parseSpaces();

          // Optional parsing. ('!' spaces?)?
          let optionalParseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume '!'.
            if (!this.parseToken('!').success) return;
            mutative = true;

            // Consume spaces?.
            this.parseSpaces();

            // This optional was parsed successfully.
            optionalParseSuccessful = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          }

          // Consume '.'?.
          if (this.parseToken('.').success) vectorized = true;

          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume callarguments.
          if (!this.parseCallArguments().success) return;
          args = this.lastParseData.ast.expressions;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expression, mutative, vectorized, arguments: args } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // dotnotationpostfix =
  //   | spaces? '.' identifier
  //   { type, expression, field }
  parseDotNotationPostfix() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'dotnotation';
    const expression = null;
    let name = null;
    let parseData = { success: false, message: { type: 'dotnotationpostfix', parser: this }, ast: null };

    (() => {
      // Consume spaces?.
      this.parseSpaces();

      // Consume '.'.
      if (!this.parseToken('.').success) return;

      // Consume identifier.
      if (!this.parseIdentifier().success) return;
      ({ name }  = this.lastParseData.ast);

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expression, field: name } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // cascadenotationargument =
  //   | (callpostfix | indexpostfix | identifier) (spaces? '?')? (subatompostfix (spaces? '?')?)*
  parseCascadeNotationArgument() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'cascadenotationargument';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      let expression = null;
      let nil = null;

      // Alternate parsing.
      // | callpostfix
      // | indexpostfix
      // | '$' indexpostfix
      // | '$'? identifier
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { expression };

      // [1]. callpostfix
      (() => {
        // Consume callpostfix.
        if (!this.parseCallPostfix().success) return;
        expression = this.lastParseData.ast;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. indexpostfix
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ expression } = otherState);

        (() => {
          // Consume indexpostfix.
          if (!this.parseIndexPostfix().success) return;
          expression = this.lastParseData.ast;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. identifier
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ expression } = otherState);

        (() => {
          let name = null;

          // Consume identifier.
          if (!this.parseIdentifier().success) return;
          ({ name }  = this.lastParseData.ast);

          expression = { type: 'dotnotation', expression: null, field: name };

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Optional parsing. (spaces? '?')?
      let optionalParseSuccessful = false;
      const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Consume spaces?.
        this.parseSpaces();

        // Consume '?'.
        if (!this.parseToken('?').success) return;
        expression = { type: 'nillable', expression };

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);
      }

      // Optional-multiple parsing. (subatompostfix [!?]?)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume subatompostfix.
          if (!this.parseSubAtomPostfix().success) return;
          const oldExpression = expression;
          expression = this.lastParseData.ast;

          expression.expression = oldExpression;

          // Optional parsing. (spaces? '?')?
          let optionalParseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume spaces?.
            this.parseSpaces();

            // Consume '?'.
            if (!this.parseToken('?').success) return;
            expression = { type: 'nillable', expression };

            // This optional was parsed successfully.
            optionalParseSuccessful = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          }

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      parseData = { success: true, message: null, ast: expression };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // cascadenotationarguments =
  //   | cascadenotationargument (_comma _? cascadenotationargument)+ _comma?
  //   | cascadenotationargument _ ('.'? operator | keywordoperator) _ (cascadenotationarguments | cascadenotationargument)
  parseCascadeNotationArguments() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'cascadenotationarguments';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | cascadenotationargument (_comma _? cascadenotationargument)+ _comma?
      // | cascadenotationargument _ ('.'? operator | keywordoperator) _ (cascadenotationarguments | cascadenotationargument)
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. cascadenotationargument (_comma _? cascadenotationargument)+ _comma?
      (() => {
        let expressions = [];

        // Consume cascadenotationargument.
        if (!this.parseCascadeNotationArgument().success) return;
        expressions.push(this.lastParseData.ast);

        // One-multiple parsing. (_comma _? cascadenotationargument)+
        let loopCount = 0;
        while (true) {
          let parseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume comma.
            if (!this.parse_Comma().success) return;

            // Consume _?.
            this.parse_();

            // Consume cascadenotationargument.
            if (!this.parseCascadeNotationArgument().success) return;
            expressions.push(this.lastParseData.ast);

            parseSuccessful = true;

            // Parsing successful, increment loop count.
            loopCount += 1;
          })();

          // If parsing the above fails, revert state to what it was before that parsing began.
          // And break out of the loop.
          if (!parseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            break;
          }
        }

        // At least one iteration of the above must be parsed successfully.
        if (loopCount < 1) return;

        // Consume _comma?.
        this.parse_Comma();

        // Update parseData.
        parseData = { success: true, message: null, ast: { type: 'opentuple', expressions } };

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. cascadenotationargument _ ('.'? operator | keywordoperator) _ (cascadenotationarguments | cascadenotationargument)
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          let vectorized = false;
          let expressions = [];
          let operators = [];
          let rest = null;

          // Consume cascadenotationargument.
          if (!this.parseCascadeNotationArgument().success) return;
          expressions.push(this.lastParseData.ast);

          // Consume _.
          if (!this.parse_().success) return;

          // Alternate parsing.
          // | '.'? operator
          // | keywordoperator
          let alternativeParseSuccessful2 = false;

          // Save state before alternative parsing.
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          const otherState = { operators: [], expressions: [] };

          // [1]. operator
          (() => {
            // Consume '.'?.
            if (this.parseToken('.').success) vectorized = true;

            // Consume operator.
            if (!this.parseOperator().success) return;
            operators.push(this.lastParseData.ast);

            // This alternative was parsed successfully.
            alternativeParseSuccessful2 = true;
          })();

          // [2]. keywordoperator
          if (!alternativeParseSuccessful2) {
            // Revert state to what it was before alternative parsing started.
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            ({ operators, expressions } = otherState);

            (() => {
              // Consume keywordoperator.
              if (!this.parseKeywordOperator().success) return;
              operators.push(this.lastParseData.ast);

              // This alternative was parsed successfully.
              alternativeParseSuccessful2 = true;
            })();
          }

          // Check if any of the alternatives was parsed successfully
          if (!alternativeParseSuccessful2) return null;

          // Consume _.
          if (!this.parse_().success) return;

          // Consume (cascadenotationarguments | cascadenotationargument).
          if (!this.parseCascadeNotationArguments().success && !this.parseCascadeNotationArgument().success) return;
          rest = this.lastParseData.ast;

          // Merging values from `expressions` and `operators` from `cascadenotationarguments` with the ones in current ast.
          if (rest.type === 'infixexpression') {
            expressions = [...expressions, ...rest.expressions];
            operators = [...operators, ...rest.operators];
          } else {
            expressions.push(rest);
          }

          // Update parseData.
          parseData = { success: true, message: null, ast: { type: 'infixexpression', vectorized, expressions, operators } };

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;
      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // cascadenotationpostfix = // Unfurl
  //   | spaces? '.' '{' spaces? cascadenotationarguments _? '}' // ignorenewline
  //   | spaces? '.' '{' nextcodeline indent cascadenotationarguments nextcodeline dedent '}'
  //   { type, expression, cascadeaccess }
  parseCascadeNotationPostfix() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'cascadenotation';
    let expression = null;
    let cascadeaccess = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | spaces? '.' '{' spaces? cascadenotationarguments _? '}' // ignorenewline
      // | spaces? '.' '{' nextcodeline indent cascadenotationarguments nextcodeline dedent '}'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { cascadeaccess };

      // [1]. spaces? '.' '{' spaces? cascadenotationarguments _? '}' // ignorenewline
      (() => {
        // Consume spaces?.
        this.parseSpaces();

        // Consume '.'.
        if (!this.parseToken('.').success) return;

        // Consume '{'.
        if (!this.parseToken('{').success) return;

        // Consume spaces?.
        this.parseSpaces();

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume cascadenotationarguments.
        if (!this.parseCascadeNotationArguments().success) return;
        cascadeaccess = this.lastParseData.ast;

        // Consume _?
        this.parse_();

        // Consume '}'.
        if (!this.parseToken('}').success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. spaces? '.' '{' nextcodeline indent cascadenotationarguments nextcodeline dedent '}'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expression } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume spaces?.
          this.parseSpaces();

          // Consume '.'.
          if (!this.parseToken('.').success) return;

          // Consume '{'.
          if (!this.parseToken('{').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume cascadenotationarguments.
          if (!this.parseCascadeNotationArguments().success) return;
          cascadeaccess = this.lastParseData.ast;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume '}'.
          if (!this.parseToken('}').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expression, cascadeaccess } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // indexargument =
  //   | primitiveexpression _? ':' (_? primitiveexpression? _? ':')? (_? primitiveexpression)?
  //   | primitiveexpression
  //   { index, begin, step, end }
  parseIndexArgument() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'indexargument';
    let index = null;
    let begin = null;
    let step = null;
    let end = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | primitiveexpression _? ':' (_? primitiveexpression? _? ':')? (_? primitiveexpression)?
      // | primitiveexpression
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { index, begin, step, end };

      // [1]. (primitiveexpression _?)? ':' (_? primitiveexpression? _? ':')? _? primitiveexpression?
      (() => {
        // Optional parsing. (primitiveexpression _?)?
        let optionalParseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        const otherState = { begin };
        (() => {
          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          begin = this.lastParseData.ast;

          // Consume _?.
          this.parse_();

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          ({ begin } = otherState);
        }

        // Consume ':'.
        if (!this.parseToken(':').success) return;

        // Optional parsing. (_? primitiveexpression? _? ':')?
        let optionalParseSuccessful2 = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        const otherState2 = { step };
        (() => {
          // Consume _?.
          this.parse_();

          // Consume primitiveexpression?.
          if (this.parsePrimitiveExpression().success) step = this.lastParseData.ast;

          // Consume _?.
          this.parse_();

          // Consume ':'.
          if (!this.parseToken(':').success) return;

          // This optional was parsed successfully.
          optionalParseSuccessful2 = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful2) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          ({ step } = otherState2);
        }

        // Consume _?.
        this.parse_();

        // Consume primitiveexpression?.
        if (this.parsePrimitiveExpression().success) end = this.lastParseData.ast;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. primitiveexpression
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ index, begin, step, end } = otherState);
        this.ignoreNewline = false;

        (() => {

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          index = this.lastParseData.ast;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { index, begin, step, end } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // indexarguments =
  //   | indexargument (_comma _? indexargument)* _comma?
  //   { expressions: [{ index, begin, step, end }] }
  parseIndexArguments() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'indexarguments';
    const expressions = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume indexargument.
      if (!this.parseIndexArgument().success) return null;
      expressions.push(this.lastParseData.ast);

      // Optional-multiple parsing. (_comma _? indexargument)*
      while (true) {
        let parseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check _comma.
          if (!this.parse_Comma().success) return;

          // Check _?.
          this.parse_();

          // Consume indexargument.
          if (!this.parseIndexArgument().success) return;
          expressions.push(this.lastParseData.ast);

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          break;
        }
      }

      // Check _comma?.
      this.parse_Comma();

      // Update parseData.
      parseData = { success: true, message: null, ast: { expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // indexpostfix =
  //   | spaces? '[' spaces? indexarguments _? ']' // ignorenewline
  //   | spaces? '[' nextcodeline indent indexarguments nextcodeline dedent ']'
  //   { type, expression, arguments: [{ key, value }] }
  parseIndexPostfix() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'index';
    let expression = null;
    let args = [];
    let parseData = { success: false, message: { type: 'indexpostfix', parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | spaces? '[' spaces? indexarguments _? ']' // ignorenewline
      // | spaces? '[' nextcodeline indent indexarguments nextcodeline dedent ']'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { args: [...args] };

      // [1]. spaces? '[' spaces? indexarguments _? ']' // ignorenewline
      (() => {
        // Consume spaces?.
        this.parseSpaces();

        // Consume '['.
        if (!this.parseToken('[').success) return;

        // Consume spaces?.
        this.parseSpaces();

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume indexarguments.
        if (!this.parseIndexArguments().success) return;
        args = this.lastParseData.ast.expressions;

        // Consume _?
        this.parse_();

        // Consume ']'.
        if (!this.parseToken(']').success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. spaces? '[' nextcodeline indent indexarguments nextcodeline dedent ']'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ args } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume spaces?.
          this.parseSpaces();

          // Consume '['.
          if (!this.parseToken('[').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume indexarguments.
          if (!this.parseListArguments().success) return;
          args = this.lastParseData.ast.expressions;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume ']'.
          if (!this.parseToken(']').success) return;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expression, arguments: args } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

// ----------------------------------------

  // ternaryoperator =
  //   | '(' spaces? primitiveexpression _? ')' _? '?' _? primitiveexpression _? ':' _? primitiveexpression  // ignorenewline
  //   | '(' nextcodeline indent primitiveexpression nextcodeline dedent ')' _? '?' _? primitiveexpression _? ':' _? primitiveexpression
  //   { type, condition, truebody, falsebody }
  parseTernaryOperator() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'ternaryoperator';
    let condition = null;
    let truebody = null;
    let falsebody = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '(' spaces? primitiveexpression _? ')' _? '?' _? primitiveexpression _? ':' _? primitiveexpression  // ignorenewline
      // | '(' nextcodeline indent primitiveexpression nextcodeline dedent ')' _? '?' _? primitiveexpression _? ':' _? primitiveexpression
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { condition, truebody, falsebody };

      // [1]. '(' spaces? primitiveexpression _? ')' _? '?' _? primitiveexpression _? ':' _? primitiveexpression  // ignorenewline
      (() => {
        // Consume '('.
        if (!this.parseToken('(').success) return;

        // Consume spaces?.
        this.parseSpaces();

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume primitiveexpression.
        if (!this.parsePrimitiveExpression().success) return;
        condition = this.lastParseData.ast;

        // Consume _?
        this.parse_();

        // Consume ')'.
        if (!this.parseToken(')').success) return;

        // Consume _?
        this.parse_();

        // Consume '?'.
        if (!this.parseToken('?').success) return;

        // Consume _?
        this.parse_();

        // Consume primitiveexpression.
        if (!this.parsePrimitiveExpression().success) return;
        truebody = this.lastParseData.ast;

        // Consume _?
        this.parse_();

        // Consume ':'.
        if (!this.parseToken(':').success) return;

        // Consume _?
        this.parse_();

        // Consume primitiveexpression.
        if (!this.parsePrimitiveExpression().success) return;
        falsebody = this.lastParseData.ast;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '(' nextcodeline indent primitiveexpression nextcodeline dedent ')' _? '?' _? primitiveexpression _? ':' _? primitiveexpression
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ condition, truebody, falsebody } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          condition = this.lastParseData.ast;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // Consume _?
          this.parse_();

          // Consume '?'.
          if (!this.parseToken('?').success) return;

          // Consume _?
          this.parse_();

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          truebody = this.lastParseData.ast;

          // Consume _?
          this.parse_();

          // Consume ':'.
          if (!this.parseToken(':').success) return;

          // Consume _?
          this.parse_();

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          falsebody = this.lastParseData.ast;

          // Consume primitiveexpression.
          if (!this.parsePrimitiveExpression().success) return;
          falsebody = this.lastParseData.ast;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, condition, truebody, falsebody } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // return =
  //   | 'return' (nameseparator expressionnocontrolptimitive)?
  //   { type, expression }
  parseReturn() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'return';
    let expression = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Check 'return'.
      if (!this.parseToken('return').success) return;

      // Optional parsing. (nameseparator expressionnocontrolptimitive)?
      let optionalParseSuccessful = false;
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Consume nameseparator.
        if (!this.parseNameSeparator().success) return;

        // Consume expressionnocontrolptimitive.
        if (!this.parseExpressionNoControlPrimitive().success) return;
        expression = this.lastParseData.ast;

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state.lastPosition, null, null, state.column, state.line);
      }

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expression } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // yield =
  //   | 'yield' ((_ 'from')? nameseparator expressionnocontrolptimitive)?
  //   { type, expression, redirect }
  parseYield() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'yield';
    let expression = null;
    let redirect = false;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Check 'yield'.
      if (!this.parseToken('yield').success) return;

      // Optional parsing. (nameseparator expressionnocontrolptimitive)?
      let optionalParseSuccessful = false;
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Optional parsing. (_ 'from')?
        let optionalParseSuccessful2 = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume _.
          if (!this.parse_().success) return;

          // Consume 'from'.
          if (!this.parseToken('from').success) return;
          redirect = true;

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful2) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
        }

        // Consume nameseparator.
        if (!this.parseNameSeparator().success) return;

        // Consume expressionnocontrolptimitive.
        if (!this.parseExpressionNoControlPrimitive().success) return;
        expression = this.lastParseData.ast;

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state.lastPosition, null, null, state.column, state.line);
      }


      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expression, redirect } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // raise =
  //   | 'raise' (nameseparator expressionnocontrolptimitive)?
  //   { type, expression }
  parseRaise() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'raise';
    let expression = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Check 'raise'.
      if (!this.parseToken('raise').success) return;

      // Optional parsing. (nameseparator expressionnocontrolptimitive)?
      let optionalParseSuccessful = false;
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Consume nameseparator.
        if (!this.parseNameSeparator().success) return;

        // Consume expressionnocontrolptimitive.
        if (!this.parseExpressionNoControlPrimitive().success) return;
        expression = this.lastParseData.ast;

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state.lastPosition, null, null, state.column, state.line);
      }

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expression } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // continue =
  //   | 'continue' (_? '@' identifier)?
  //   { type, label }
  parseContinue() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'continue';
    let label = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Check 'continue'.
      if (!this.parseToken('continue').success) return;

      // Optional parsing. (_? '@' identifier)?
      let optionalParseSuccessful = false;
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Check _?.
        this.parse_();

        // Check '@'.
        if (!this.parseToken('@').success) return;

        // Consume identifier.
        if (!this.parseIdentifier().success) return;
        label = this.lastParseData.ast.name;

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state.lastPosition, null, null, state.column, state.line);
      }

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, label } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // break =
  //   | 'break' (nameseparator expressionnocontrolptimitive)?  (_? '@' identifier)?
  //   { type, expression, label }
  parseBreak() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'break';
    let expression = null;
    let label = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Check 'break'.
      if (!this.parseToken('break').success) return;

      // Optional parsing. (nameseparator expressionnocontrolptimitive)?
      let optionalParseSuccessful = false;
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Consume nameseparator.
        if (!this.parseNameSeparator().success) return;

        // Consume expressionnocontrolptimitive.
        if (!this.parseExpressionNoControlPrimitive().success) return;
        expression = this.lastParseData.ast;

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state.lastPosition, null, null, state.column, state.line);
      }

      // Optional parsing. (_? '@' identifier)?
      let optionalParseSuccessful2 = false;
      const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Check _?.
        this.parse_();

        // Check '@'.
        if (!this.parseToken('@').success) return;

        // Consume identifier.
        if (!this.parseIdentifier().success) return;
        label = this.lastParseData.ast.name;

        // This optional was parsed successfully.
        optionalParseSuccessful2 = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful2) {
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);
      }

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expression, label } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // spill =
  //   | 'spill' (_? '@' identifier)?
  //   { type, label }
  parseSpill() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'spill';
    let label = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Check 'spill'.
      if (!this.parseToken('spill').success) return;

      // Optional parsing. (_? '@' identifier)?
      let optionalParseSuccessful = false;
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Check _?.
        this.parse_();

        // Check '@'.
        if (!this.parseToken('@').success) return;

        // Consume identifier.
        if (!this.parseIdentifier().success) return;
        label = this.lastParseData.ast.name;

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state.lastPosition, null, null, state.column, state.line);
      }

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, label } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // controlprimitive =
  //   | return
  //   | yield
  //   | continue
  //   | break
  //   | raise
  //   | spill
  parseControlPrimitive() {
    const type = 'controlprimitive';

    if (this.parseReturn().success) {
      return this.lastParseData;
    } else if (this.parseYield().success) {
      return this.lastParseData;
    } else if (this.parseContinue().success) {
      return this.lastParseData;
    } else if (this.parseBreak().success) {
      return this.lastParseData;
    } else if (this.parseRaise().success) {
      return this.lastParseData;
    } else if (this.parseSpill().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // subatompostfix =
  //   | callpostfix
  //   | dotnotationpostfix
  //   | cascadenotationpostfix
  //   | indexpostfix
  parseSubAtomPostfix() {
    const type = 'subatompostfix';

    if (this.parseCallPostfix().success) {
      return this.lastParseData;
    } else if (this.parseDotNotationPostfix().success) {
      return this.lastParseData;
    } else if (this.parseCascadeNotationPostfix().success) {
      return this.lastParseData;
    } else if (this.parseIndexPostfix().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // subatom =
  //   | '(' spaces? tupleexpression _? ')' identifier? // ignorenewline
  //   | '(' nextcodeline indent tupleexpression nextcodeline dedent ')' identifier?
  //   | coefficientexpression
  //   | literal
  //   | noname
  //   | identifier
  //   | operator
  parseSubAtom() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'subatom';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | '(' spaces? simpleexpression _? ')' identifier? // ignorenewline
      // | '(' nextcodeline indent simpleexpression nextcodeline dedent ')' identifier?
      // | coefficientexpression
      // | literal
      // | noname
      // | identifier
      // | operator
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };

      // [1]. '(' spaces? simpleexpression _? ')' identifier? // ignorenewline
      (() => {
        let expression = null;
        let identifier = null;

        // Consume '('.
        if (!this.parseToken('(').success) return;

        // Consume spaces?.
        this.parseSpaces();

        // Ignore newline from this point
        this.ignoreNewline = true;

        // Consume simpleexpression.
        if (!this.parseSimpleExpression().success) return;
        expression = this.lastParseData.ast;

        // Consume _?
        this.parse_();

        // Consume ')'.
        if (!this.parseToken(')').success) return;

        // Consume identifier?
        if (this.parseIdentifier().success) identifier = this.lastParseData.ast;

        // Update parseData.
        parseData = { success: true, message: null, ast: { type: 'parens', expression } };

        if (identifier) {
          parseData = { success: true, message: null, ast: { type: 'coefficientexpression', coefficient: expression, identifier } };
        }

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. '(' nextcodeline indent simpleexpression nextcodeline dedent ')' identifier?
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        this.ignoreNewline = false;

        let expression = null;
        let identifier = null;

        (() => {
          // Consume '('.
          if (!this.parseToken('(').success) return;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume indent.
          if (!this.parseIndent().success) return;

          // Consume simpleexpression.
          if (!this.parseSimpleExpression().success) return;
          expression = this.lastParseData.ast;

          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume dedent.
          if (!this.parseDedent().success) return;

          // Consume ')'.
          if (!this.parseToken(')').success) return;

          // Consume identifier?
          if (this.parseIdentifier().success) identifier = this.lastParseData.ast;

          // Update parseData.
          parseData = { success: true, message: null, ast: { type: 'parens', expression } };

          if (identifier) {
            parseData = { success: true, message: null, ast: { type: 'coefficientexpression', coefficient: expression, identifier } };
          }

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Parsing remaining alternatives.
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);

        // Let's assume one of these will parse successfully first.
        alternativeParseSuccessful = true;

        if (this.parseCoefficientExpression().success) {
          parseData = this.lastParseData;
        } else if (this.parseLiteral().success) {
          parseData = this.lastParseData;
        } else if (this.parseNoName().success) {
          parseData = this.lastParseData;
        } else if (this.parseIdentifier().success) {
          parseData = this.lastParseData;
        } else if (this.parseOperator().success) {
          parseData = this.lastParseData;
        } else {
          // Set `alternativeParseSuccessful` back to false since none of the above parsed successfully.
          alternativeParseSuccessful = false;
        }
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // atom =
  //   | subatom (spaces? '?')? (subatompostfix (spaces? '?')?)*
  //   { type, expression }
  parseAtom() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'atom';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      let expression = null;
      let nil = null;

      // Consume subatom.
      if (!this.parseSubAtom().success) return;
      expression = this.lastParseData.ast;

      // Optional parsing. (spaces? '?')?
      let optionalParseSuccessful = false;
      const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Consume spaces?.
        this.parseSpaces();

        // Consume '?'.
        if (!this.parseToken('?').success) return;
        expression = { type: 'nillable', expression };

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);
      }

      // Optional-multiple parsing. (subatompostfix [!?]?)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume subatompostfix.
          if (!this.parseSubAtomPostfix().success) return;
          const oldExpression = expression;
          expression = this.lastParseData.ast;

          // Make old expression part of new ast.
          expression.expression = oldExpression;

          // Optional parsing. (spaces? '?')?
          let optionalParseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume spaces?.
            this.parseSpaces();

            // Consume '?'.
            if (!this.parseToken('?').success) return;
            expression = { type: 'nillable', expression };

            // This optional was parsed successfully.
            optionalParseSuccessful = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          }

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      parseData = { success: true, message: null, ast: expression };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // prefixatom =
  //   | operator atom
  //   { type, operator, expression }
  parsePrefixAtom() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'prefixatom';
    let operator = null;
    let expression = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume operator.
      if (!this.parseOperator().success) return null;
      operator = this.lastParseData.ast;

      // Consume atom.
      if (!this.parseAtom().success) return null;
      expression = this.lastParseData.ast;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, operator, expression } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // postfixatom =
  //   | atom '.'? operator
  //   { type, expression, operator }
  parsePostfixAtom() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'postfixatom';
    let vectorized = false;
    let expression = null;
    let operator = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume atom.
      if (!this.parseAtom().success) return null;
      expression = this.lastParseData.ast;

      // Consume '.'?.
      if (this.parseToken('.').success) vectorized = true;

      // Consume operator.
      if (!this.parseOperator().success) return null;
      operator = this.lastParseData.ast;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, vectorized, expression, operator } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // prepostfixatom =
  //   | prefixatom
  //   | postfixatom
  //   | atom
  parsePrepostfixAtom() {
    const type = 'prepostfixatom';

    if (this.parsePrefixAtom().success) {
      return this.lastParseData;
    } else if (this.parsePostfixAtom().success) {
      return this.lastParseData;
    } else if (this.parseAtom().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // keywordoperator =
  //   | 'is' _ 'not'
  //   | 'in'
  //   | 'not' _ 'in'
  //   | 'mod'
  //   | 'is'
  //   { type, name }
  parseKeywordOperator() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'keywordoperator';
    let name = false;
    let args = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | 'is' _ 'not'
      // | 'in'
      // | 'not' _ in'
      // | 'mod'
      // | 'is'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. 'is' _ 'not'
      (() => {
        // Consume 'is'.
        if (!this.parseToken('is').success) return;
        name = this.lastParseData.ast.token;

        // Consume _.
        if (!this.parse_().success) return;

        // Consume 'not'.
        if (!this.parseToken('not').success) return;
        name = name + ' ' + this.lastParseData.ast.token;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. 'in'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Consume 'in'.
          if (!this.parseToken('in').success) return;
          name = this.lastParseData.ast.token;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. 'not' _ 'in'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Consume 'not'.
          if (!this.parseToken('not').success) return;
          name = this.lastParseData.ast.token;

          // Consume _.
          if (!this.parse_().success) return;

          // Consume 'in'.
          if (!this.parseToken('in').success) return;
          name = name + ' ' + this.lastParseData.ast.token;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [4]. 'is'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Consume 'is'.
          if (!this.parseToken('is').success) return;
          name = this.lastParseData.ast.token;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [5]. 'mod'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Consume 'mod'.
          if (!this.parseToken('mod').success) return;
          name = this.lastParseData.ast.token;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Check !(identfier|numericliteral).
      if (this.parseIdentifier().success || this.parseNumericLiteral().success) return null;

      parseData = { success: true, message: null, ast: { type, name } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // infixexpression =
  //   | (prefixatom | atom) '.'? operator infixexpression
  //   | prepostfixatom _ ('.'? operator | keywordoperator) _ infixexpression
  //   | prepostfixatom
  //   { type, vectorized, expressions, operators }
  parseInfixExpression() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'infixexpression';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | (prefixatom | atom) operator infixexpression
      // | prepostfixatom _ (operator | keywordoperator) _ infixexpression
      // | prepostfixatom
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. (prefixatom | atom) operator infixexpression
      (() => {
        let vectorized = false;
        let expressions = [];
        let operators = [];
        let rest = null;

        // Consume (prefixatom | atom).
        if (!this.parsePrefixAtom().success && !this.parseAtom().success) return;
        expressions.push(this.lastParseData.ast);

        // Consume '.'?.
        if (this.parseToken('.').success) vectorized = true;

        // Consume operator.
        if (!this.parseOperator().success) return;
        operators.push(this.lastParseData.ast);

        // Consume infixexpression.
        if (!this.parseInfixExpression().success) return;
        rest = this.lastParseData.ast;

        // Merging values from `expressions` and `operators` from `infixexpression` with the ones in current ast.
        if (rest.type === type) {
          expressions = [...expressions, ...rest.expressions];
          operators = [...operators, ...rest.operators];
        } else {
          expressions.push(rest);
        }

        // Update parseData.
        parseData = { success: true, message: null, ast: { type, vectorized, expressions, operators } };

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. prepostfixatom _ (operator | keywordoperator) _ infixexpression
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          let vectorized = false;
          let expressions = [];
          let operators = [];
          let rest = null;

          // Consume prepostfixatom.
          if (!this.parsePrepostfixAtom().success) return;
          expressions.push(this.lastParseData.ast);

          // Consume _.
          if (!this.parse_().success) return;

          // Alternate parsing.
          // | '.'? operator
          // | keywordoperator
          let alternativeParseSuccessful2 = false;

          // Save state before alternative parsing.
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          const otherState = { operators: [], expressions: [] };

          // [1]. operator
          (() => {
            // Consume '.'?.
            if (this.parseToken('.').success) vectorized = true;

            // Consume operator.
            if (!this.parseOperator().success) return;
            operators.push(this.lastParseData.ast);

            // This alternative was parsed successfully.
            alternativeParseSuccessful2 = true;
          })();

          // [2]. keywordoperator
          if (!alternativeParseSuccessful2) {
            // Revert state to what it was before alternative parsing started.
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
            ({ operators, expressions } = otherState);

            (() => {
              // Consume keywordoperator.
              if (!this.parseKeywordOperator().success) return;
              operators.push(this.lastParseData.ast);

              // This alternative was parsed successfully.
              alternativeParseSuccessful2 = true;
            })();
          }

          // Check if any of the alternatives was parsed successfully
          if (!alternativeParseSuccessful2) return null;

          // Consume _.
          if (!this.parse_().success) return;

          // Consume infixexpression.
          if (!this.parseInfixExpression().success) return;
          rest = this.lastParseData.ast;

          // Merging values from `expressions` and `operators` from `infixexpression` with the ones in current ast.
          if (rest.type === type) {
            expressions = [...expressions, ...rest.expressions];
            operators = [...operators, ...rest.operators];
          } else {
            expressions.push(rest);
          }

          // Update parseData.
          parseData = { success: true, message: null, ast: { type, vectorized, expressions, operators } };

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // [3]. prepostfixatom
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Consume prepostfixatom.
          if (!this.parsePrepostfixAtom().success) return null;

          // Update parseData.
          parseData = this.lastParseData;

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;
      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

// ----------------------------------------

  // range =
  //   | (infixexpression _?)? '..' (_? infixexpression _? '..')? _? infixexpression
  //   { type, begin, step, end }
  parseRange() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'range';
    let begin = null;
    let step = null;
    let end = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Optional parsing. (infixexpression _?)?
      let optionalParseSuccessful = false;
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { begin };
      (() => {
        // Consume infixexpression.
        if (!this.parseInfixExpression().success) return;
        begin = this.lastParseData.ast;

        // Consume _?.
        this.parse_();

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ begin } = otherState);
      }

      // Consume '..'.
      if (!this.parseToken('..').success) return;

      // Optional parsing. (_? infixexpression _? '..')?
      let optionalParseSuccessful2 = false;
      const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState2 = { step };
      (() => {
        // Consume _?.
        this.parse_();

        // Consume infixexpression.
        if (!this.parseInfixExpression().success) return;
        step = this.lastParseData.ast;

        // Consume _?.
        this.parse_();

        // Consume '..'.
        if (!this.parseToken('..').success) return;

        // This optional was parsed successfully.
        optionalParseSuccessful2 = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful2) {
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);
        ({ step } = otherState2);
      }

      // Consume _?.
      this.parse_();

      // Consume infixexpression.
      if (!this.parseInfixExpression().success) return;
      end = this.lastParseData.ast;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, begin, step, end } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // commandnotationrest =
  //   | spaces &(identifier | stringliteral | numericliteral | range | symbolliteral) primitiveexpression
  //   | spaces? lambdaexpression
  //   { arguments: [{ key, value }] }
  parseCommandNotationRest() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'commandnotationpostfix';
    const args = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | spaces &(identifier | stringliteral | numericliteral | range | symbolliteral) primitiveexpression
      // | spaces? lambdaexpression
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. spaces &(identifier | stringliteral | numericliteral | lambdaexpression | range | symbolliteral) primitiveexpression
      (() => {
        // Consume spaces.
        if (!this.parseSpaces().success) return null;

        // Check &(identifier | stringliteral | numericliteral | lambdaexpression | range | symbolliteral).
        const state = { lastPosition: this.lastPosition, column: this.column, line: this.line };
        if (
          !this.parseIdentifier().success &&
          !this.parseStringLiteral().success &&
          !this.parseNumericLiteral().success &&
          !this.parseRange().success &&
          !this.parseSymbolLiteral().success
        ) return null;
        this.reset(state.lastPosition, null, null, state.column, state.line);

        // Consume primitiveexpression.
        if (!this.parsePrimitiveExpression().success) return null;
        args.push({ key: null, value: this.lastParseData.ast });

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. spaces? lambdaexpression
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // TO BE REMOVED
          return;

          // Consume spaces?.
          this.parseSpaces();

          // Consume lambdaexpression.
          if (!this.parseLambdaExpression().success) return;
          args.push(this.lastParseData.ast);

          // This alternative was parsed successfully.
          alternativeParseSuccessful = true;
        })();
      }

      // Check if any of the alternatives was parsed successfully
      if (!alternativeParseSuccessful) return null;

      // Update parseData.
      parseData = { success: true, message: null, ast: { arguments: args } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, lastIndentCount, column, line);

    return parseData;
  }

  // commandnotation =
  //   | !(operator) atom (spaces? '?')? (spaces? '!')? commandnotationrest
  parseCommandNotation() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'call';
    let expression = null;
    let mutative = false;
    let args = [];
    let parseData = { success: false, message: { type: 'commandnotation', parser: this }, ast: null };

    (() => {
      // Check !(operator).
      if (this.parseOperator().success) return;

      // Consume atom.
      if (!this.parseAtom().success) return;
      expression = this.lastParseData.ast;

      // Optional parsing. (spaces? '?')?
      let optionalParseSuccessful = false;
      const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Consume spaces?.
        this.parseSpaces();

        // Consume '?'.
        if (!this.parseToken('?').success) return;
        expression = { type: 'nillable', expression };

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);
      }

      // Optional parsing. (spaces? '!')?
      let optionalParseSuccessful3 = false;
      const state3 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Consume spaces?.
        this.parseSpaces();

        // Consume '!'.
        if (!this.parseToken('!').success) return;
        mutative = true;

        // This optional was parsed successfully.
        optionalParseSuccessful3 = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful3) {
        this.reset(state3.lastPosition, null, null, state3.column, state3.line);
      }

      // Consume commandnotationrest.
      if (!this.parseCommandNotationRest().success) return;
      args = this.lastParseData.ast.arguments;

      parseData = { success: true, message: null, ast: { type, expression, mutative, arguments: args } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // primitiveexpression =
  //   | range
  //   | infixexpression
  //   | commandnotation
  parsePrimitiveExpression() {
    const type = 'primitiveexpression';

    if (this.parseRange().success) {
      return this.lastParseData;
    } else if (this.parseInfixExpression().success) {
      return this.lastParseData;
    } else if (this.parseCommandNotation().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // simpleexpression =
  //   | primitiveexpression
  //   | ternaryoperator
  parseSimpleExpression() {
    const type = 'simpleexpression';

    if (this.parseTernaryOperator().success) {
      return this.lastParseData;
    } else if (this.parsePrimitiveExpression().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // tupleexpression =
  //   | simpleexpression (_comma _? simpleexpression)* _comma?
  //   { type, expressions }
  parseTupleExpression() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'opentuple';
    const expressions = [];
    let parseData = { success: false, message: { type: 'tupleexpression', parser: this }, ast: null };

    (() => {
      // Consume simpleexpression.
      if (!this.parseSimpleExpression().success) return null;
      expressions.push(this.lastParseData.ast);

      // Optional-multiple parsing. (_comma _? simpleexpression)*
      while (true) {
        let parseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check _comma.
          if (!this.parse_Comma().success) return;

          // Check _?.
          this.parse_();

          // Consume simpleexpression.
          if (!this.parseSimpleExpression().success) return;
          expressions.push(this.lastParseData.ast);

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          break;
        }
      }

      // Check _comma?.
      this.parse_Comma();

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expressions } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // dotnotationline =
  //   | dotnotationpostfix (spaces? '?')? (subatompostfix (spaces? '?')?)*
  parseDotNotationLine() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'dotnotationline';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      let expression = null;
      let nil = null;

      // Consume dotnotationpostfix.
      if (!this.parseDotNotationPostfix().success) return;
      expression = this.lastParseData.ast;

      // Optional parsing. (spaces? '?')?
      let optionalParseSuccessful = false;
      const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      (() => {
        // Consume spaces?.
        this.parseSpaces();

        // Consume '?'.
        if (!this.parseToken('?').success) return;
        expression = { type: 'nillable', expression };

        // This optional was parsed successfully.
        optionalParseSuccessful = true;
      })();

      // If parsing the above optional fails, revert state to what it was before that parsing began.
      if (!optionalParseSuccessful) {
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);
      }

      // Optional-multiple parsing. (subatompostfix [!?]?)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume subatompostfix.
          if (!this.parseSubAtomPostfix().success) return;
          const oldExpression = expression;
          expression = this.lastParseData.ast;

          // Make old expression part of new ast.
          expression.expression = oldExpression;

          // Optional parsing. (spaces? '?')?
          let optionalParseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume spaces?.
            this.parseSpaces();

            // Consume '?'.
            if (!this.parseToken('?').success) return;
            expression = { type: 'nillable', expression };

            // This optional was parsed successfully.
            optionalParseSuccessful = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful) {
            this.reset(state2.lastPosition, null, null, state2.column, state2.line);
          }

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }

      parseData = { success: true, message: null, ast: expression };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // dotnotationblock =
  //   | simpleexpression nextcodeline indent dotnotationline (nextcodeline samedent dotnotationline)* (nextcodeline dedent | eoi)
  //   { type, expression, lines }
  parseDotNotationBlock() {
     // Keep original state.
     const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'dotnotationblock';
    let expression = null;
    let lines = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume simpleexpression.
      if (!this.parseSimpleExpression().success) return;
      expression = this.lastParseData.ast;

      // Consume nextcodeline.
      if (!this.parseNextCodeLine().success) return;

      // Consume indent.
      if (!this.parseIndent().success) return;

      // Consume dotnotationline.
      if (!this.parseDotNotationLine().success) return;
      lines.push(this.lastParseData.ast);

      // Optional-multiple parsing. (nextcodeline samedent dotnotationline)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume nextcodeline.
          if (!this.parseNextCodeLine().success) return;

          // Consume samedent.
          if (!this.parseSamedent().success) return;

          // Consume dotnotationline.
          if (!this.parseDotNotationLine().success) return;
          lines.push(this.lastParseData.ast);

          parseSuccessful = true;
        })();

        // If parsing the above fails, revert state to what it was before that parsing began.
        // And break out of the loop.
        if (!parseSuccessful) {
          this.reset(state.lastPosition, null, null, state.column, state.line);
          break;
        }
      }
      
      // Consume (nextcodeline dedent | eoi).
      if (this.parseNextCodeLine().success) {
        if (this.parseDedent().success) {}
        else return;
      } else if (this.parseEoi().success) {}
      else return;

      // Update parseData.
      parseData = { success: true, message: null, ast: { type, expression, lines } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    })();

    // Reset ignorenewline back to original state.
    this.ignoreNewline = ignoreNewline;

    // Check if above parsing is successful.
    if (parseData.success) return parseData;

    // Parsing failed, so revert state.
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

// ----------------------------------------

  // expression =
  //   | subexpression (_? ';' _? expression)* (_? ';')?
  parseExpression() { // TODO: incorrect implementation
    const type = 'expression';

    if (this.parseInfixExpression().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // lambdaexpression =
  //   | '|' _? functionparameters _comma? _? '|' _? '=>' _? expressiononeinlinenest
  //   | '|' _? functionparameters _comma? _? '|' _? '=>' block
  parseLambdaExpression() { // TODO: incorrect implementation
    const type = 'expression';

    if (this.parseInfixExpression().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // expressionnocontrolptimitive =
  //   | subexpressionnocontrolptimitive (_? ';' _? expressionnocontrolptimitive)* (_? ';')?
  parseExpressionNoControlPrimitive() { // TODO: incorrect implementation
    const type = 'expression';

    if (this.parseInfixExpression().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // block =
  //   | nextcodeline indent expression (nextcodeline samedent expression)* dedentoreoiend
  parseBlock() { // TODO: incorrect implementation
    const type = 'block';

    if (this.parseInfixExpression().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // names =
  //   | identifier (_? ',' _? identifier)*
  parseNames() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'names';
    const identifiers = [];
    let parseData = {
      success: false, message: { type, parser: this }, ast: null,
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
          this.parse_();

          // Consume ','.
          if (!this.parseToken(',').success) return;

          // Consume _?.
          this.parse_();

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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }
}

module.exports = Parser;

