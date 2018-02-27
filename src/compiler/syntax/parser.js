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

  // integehexadecimalliteral  =
  //   | '0x' digithexadecimal ('_'? digithexadecimal)*
  parseIntegerHexadecimalLiteral() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'integehexadecimalliteral';
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
  parseCoefficientExpression() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'coefficientexpression';
    let number = null;
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
      const otherState = { number, identifier };

      // [1]. floatbinaryliteral identifier
      (() => {
        // Consume floatbinaryliteral.
        if (!this.parseFloatBinaryLiteral().success) return;
        number = this.lastParseData.ast;

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
        ({ number, identifier } = otherState);

        (() => {
          // Consume floatoctalliteral.
          if (!this.parseFloatOctalLiteral().success) return;
          number = this.lastParseData.ast;

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
        ({ number, identifier } = otherState);

        (() => {
          // Consume floatdecimalliteral.
          if (!this.parseFloatDecimalLiteral().success) return;
          number = this.lastParseData.ast;

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
        ({ number, identifier } = otherState);

        (() => {
          // Consume integerbinaryliteral.
          if (!this.parseIntegerBinaryLiteral().success) return;
          number = this.lastParseData.ast;

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
        ({ number, identifier } = otherState);

        (() => {
          // Consume integeroctalliteral.
          if (!this.parseIntegerOctalLiteral().success) return;
          number = this.lastParseData.ast;

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
        ({ number, identifier } = otherState);

        (() => {
          // Check !('0b' | '0o' | '0x').
          if (this.parseToken('0b').success || this.parseToken('0o').success || this.parseToken('0x').success) return;

          // Consume integerdecimalliteral.
          if (!this.parseIntegerDecimalLiteral().success) return;
          number = this.lastParseData.ast;

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
      parseData = { success: true, message: null, ast: { type, number, identifier } };

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
  //   | operatorchar+
  parseOperator() {
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'operator';
    const token = [];
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    // Consume operatorchar+.
    while (this.operatorChar.indexOf(this.peekChar()) > -1) {
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
  //   | !(identifier | numericliteral)
  //   | _
  parseNameSeparator() {
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'nameseparator';
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | !(identifier | numericliteral)
      // | _
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };

      // [1]. !(identifier | numericliteral)
      (() => {
        // Consume !(identifier | numericliteral).
        if (this.parseIdentifier().success || this.parseNumericLiteral().success) return;

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. _
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);

        (() => {
          // Consume _.
          if (!this.parse_().success) return;

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
  //   | infixexpression (_comma _? infixexpression)* _comma?
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
      // Consume infixexpression.
      if (!this.parseInfixExpression().success) return null;
      expressions.push(this.lastParseData.ast);

      // Optional-multiple parsing. (_comma _? infixexpression)*
      while (true) {
        let parseSuccessful = false;
        const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Check _comma.
          if (!this.parse_Comma().success) return;

          // Check _?.
          this.parse_();

          // Consume infixexpression.
          if (!this.parseInfixExpression().success) return;
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
  //   | identifier _? ':' _? objectblock &(infixexpression | '}')
  //   | identifier _? ':' _? infixexpression &(_comma | nextcodeline _? | _? '}')
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
      // | identifier _? ':' _? objectblock &(infixexpression | '}')
      // | identifier _? ':' _? infixexpression &(_comma | nextcodeline _? | _? '}')
      // | identifier &(_comma | nextcodeline _? | _? '}')
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { key, value };

      // [1]. identifier _? ':' _? objectblock &(infixexpression | '}')
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

        // Check &(infixexpression | '}').
        const state2 = { lastPosition: this.lastPosition, column: this.column, line: this.line };
        if (!this.parseInfixExpression().success && !this.parseToken('}').success) return;
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. identifier _? ':' _? infixexpression &(_comma | nextcodeline _? | _? '}')
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

          // Consume infixexpression.
          if (!this.parseInfixExpression().success) return;
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
  //   | infixexpression _? ':' _? objectblock &(infixexpression | '}')
  //   | infixexpression _? ':' _? (subdictliteral | infixexpression) &(_comma | nextcodeline _? | _? '}')
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
      // | infixexpression _? ':' _? objectblock &(infixexpression | '}')
      // | infixexpression _? ':' _? infixexpression &(_comma | nextcodeline _? | _? '}')
      // | identifier &(_comma | nextcodeline _? | _? '}')
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { key, value };

      // [1]. infixexpression _? ':' _? objectblock &(infixexpression | '}')
      (() => {
        // Consume infixexpression.
        if (!this.parseInfixExpression().success) return;
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

        // Check &(infixexpression | '}').
        const state2 = { lastPosition: this.lastPosition, column: this.column, line: this.line };
        if (!this.parseInfixExpression().success && !this.parseToken('}').success) return;
        this.reset(state2.lastPosition, null, null, state2.column, state2.line);

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. infixexpression _? ':' _? infixexpression &(_comma | nextcodeline _? | _? '}')
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ key, value } = otherState);

        (() => {
          // Consume infixexpression.
          if (!this.parseInfixExpression().success) return;
          key = this.lastParseData.ast;

          // Consume _?.
          this.parse_();

          // Consume ':'.
          if (!this.parseToken(':').success) return;

          // Consume _?.
          this.parse_();

          // Consume infixexpression.
          if (!this.parseInfixExpression().success) return;
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
  //   | '@' spaces? '{' _? '}' // ignorenewline
  //   | '@' spaces? '{' spaces? dictarguments _? '}' // ignorenewline
  //   | '@' spaces? '{' nextcodeline indent dictarguments nextcodeline dedent '}'
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
      // | '@' spaces? '{' _? '}' // ignorenewline
      // | '@' spaces? '{' spaces? dictarguments _? '}' // ignorenewline
      // | '@' spaces? '{' nextcodeline indent dictarguments nextcodeline dedent '}'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { expressions: [...expressions] };

      // [1]. '@' spaces? '{' _? '}' // ignorenewline
      (() => {
        // Consume '@'.
        if (!this.parseToken('@').success) return;

        // Consume spaces?.
        this.parseSpaces();

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

      // [2]. '@' spaces? '{' spaces? dictarguments _? '}' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '@'.
          if (!this.parseToken('@').success) return;

          // Consume spaces?.
          this.parseSpaces();

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

      // [3]. '@' spaces? '{' nextcodeline indent dictarguments nextcodeline dedent '}'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ expressions } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume '@'.
          if (!this.parseToken('@').success) return;

          // Consume spaces?.
          this.parseSpaces();

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

  // tuplearguments =
  //   | infixexpression (_comma _? infixexpression)+ _comma?
  //   | infixexpression _comma
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
      // | infixexpression (_comma _? infixexpression)+ _comma?
      // | infixexpression _comma
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
      const otherState = { expressions: [...expressions] };

      // [1]. infixexpression (_comma _? infixexpression)+ _comma?
      (() => {
        // Consume infixexpression.
        if (!this.parseInfixExpression().success) return;
        expressions.push(this.lastParseData.ast);

        // One-multiple parsing. (_comma _? infixexpression)+
        let loopCount = 0;
        while (true) {
          let parseSuccessful = false;
          const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
          (() => {
            // Consume comma.
            if (!this.parse_Comma().success) return;

            // Consume _?.
            this.parse_();

            // Consume infixexpression.
            if (!this.parseInfixExpression().success) return;
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

      // [2]. infixexpression _comma
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        ({ expressions } = otherState);

        (() => {
          // Consume infixexpression.
          if (!this.parseInfixExpression().success) return;
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
  //   | identifier _? ':' _? infixexpression (_comma _? identifier _? ':' _? infixexpression)* _comma?
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

      // Consume infixexpression.
      if (!this.parseInfixExpression().success) return null;
      value = this.lastParseData.ast;

      expressions.push({ key, value });

      // Optional-multiple parsing. (_comma _? identifier _? ':' _? infixexpression)*
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

          // Consume infixexpression.
          if (!this.parseInfixExpression().success) return;
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
  //   | '[' _? infixexpression _? '|' _? forhead (_? ';' _? forhead)* (_ 'where' _ infixexpression)? _? ']' // ignorenewline
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
  //   | '{' _? (infixexpression _? ':' _? infixexpression | identifier) _? '|' _? forhead (_? ';' _? forhead)* (_ 'where' _ infixexpression)? _? '}' // ignorenewline
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
  //   | tupleliteral
  //   | namedtupleliteral
  //   | symbolliteral
  //   | comprehension
  parseLiteral() { // TODO: incorrect implementation
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

  // commandnotationpostfix =
  //   | spaces &(range | symbolliteral | stringliteral | numericliteral | identifier) infixexpression
  //   { type, expression, arguments: [{ key, value }] }
  parseCommandNotationPostfix() { // TODO: Unimplemented
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'functioncall';
    const expression = null;
    const args = [];
    let parseData = { success: false, message: { type: 'commandnotationpostfix', parser: this }, ast: null };

    (() => {
      // Consume spaces.
      if (!this.parseSpaces().success) return null;

      // Check &(range | symbolliteral | stringliteral | numericliteral | identifier).
      const state = { lastPosition: this.lastPosition, column: this.column, line: this.line };
      if (
        !this.parseRange().success &&
        !this.parseSymbolLiteral().success &&
        !this.parseStringLiteral().success &&
        !this.parseNumericLiteral().success &&
        !this.parseIdentifier().success
      ) return null;
      this.reset(state.lastPosition, null, null, state.column, state.line);

      // Consume infixexpression.
      if (!this.parseInfixExpression().success) return null;
      args.push({ key: null, value: this.lastParseData.ast });

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

  // callarguments =
  //   | (identifier _? ':' _?)? infixexpression (_comma _? (identifier _? ':' _?)? infixexpression)* _comma?
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

      // Consume infixexpression.
      if (!this.parseInfixExpression().success) return null;
      value = this.lastParseData.ast;

      expressions.push({ key, value });

      // Optional-multiple parsing. (_comma _? (identifier _? ':' _?)? infixexpression)*
      while (true) {
        let parseSuccessful = false;
        const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
        (() => {
          // Consume comma.
          if (!this.parse_Comma().success) return;

          // Consume _?.
          this.parse_();

          // Optional parsing. (identifier _? ':' _?)?
          let optionalParseSuccessful = false;
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
            optionalParseSuccessful = true;
          })();

          // If parsing the above optional fails, revert state to what it was before that parsing began.
          if (!optionalParseSuccessful) {
            this.reset(state3.lastPosition, null, null, state3.column, state3.line);
            key = null;
          }

          // Consume infixexpression.
          if (!this.parseInfixExpression().success) return;
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
  //   | spaces? '(' _? ')' // ignorenewline
  //   | spaces? '(' spaces? callarguments _? ')' // ignorenewline
  //   | spaces? '(' nextcodeline indent callarguments nextcodeline dedent ')'
  //   { type, expression, arguments: [{ key, value }] }
  parseCallPostfix() {
    // Keep original state.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Ignore ignorenewline from outer scope, this rule may contain indentation.
    this.ignoreNewline = false;

    const type = 'functioncall';
    let expression = null;
    let args = [];
    let parseData = { success: false, message: { type: 'callpostfix', parser: this }, ast: null };

    (() => {
      // Alternate parsing.
      // | spaces? '(' _? ')' // ignorenewline
      // | spaces? '(' spaces? callarguments _? ')' // ignorenewline
      // | spaces? '(' nextcodeline indent callarguments nextcodeline dedent ')'
      let alternativeParseSuccessful = false;

      // Save state before alternative parsing.
      const state = {
        lastPosition: this.lastPosition, lastIndentCount: this.lastIndentCount, line: this.line, column: this.column,
      };
      const otherState = { args: [...args] };

      // [1]. spaces? '(' _? ')' // ignorenewline
      (() => {
        // Consume spaces?.
        this.parseSpaces();

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

      // [2]. spaces? '(' spaces? callarguments _? ')' // ignorenewline
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ args } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume spaces?.
          this.parseSpaces();

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

      // [3]. spaces? '(' nextcodeline indent callarguments nextcodeline dedent ')'
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, state.lastIndentCount, state.column, state.line);
        ({ args } = otherState);
        this.ignoreNewline = false;

        (() => {
          // Consume spaces?.
          this.parseSpaces();

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

  // range =
  //   | infixexpression _? '..' (_? infixexpression _? '..')? (_? infixexpression)?
  //   | '..' (_? infixexpression _? '..')? _? infixexpression
  //   { type, begin, step, end }
  parseRange() { // TODO: incorrect implementation
    const type = 'range';

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

  // infixexpression =
  //   | range
  //   | prefixatom operator infixexpressionrest+
  //   | atom operator infixexpressionrest+
  //   | prepostfixatom _ operator _ infixexpressionrest+
  parseInfixExpression() { // TODO: incorrect implementation
    const type = 'infixexpression';

    if (this.parseIdentifier().success) {
      return this.lastParseData;
    } else if (this.parseLiteral().success) {
      return this.lastParseData;
    }

    // Parsing failed.
    return { success: false, message: { type, parser: this }, ast: null };
  }

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
