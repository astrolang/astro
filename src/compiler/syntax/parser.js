/* eslint-disable no-constant-condition, max-len */
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
    this.ruleStarts = []; // start position of an expression. [{ line, column }].
    // Characters
    this.digitBinary = '01';
    this.digitOctal = '01234567';
    this.digitDecimal = '0123456789';
    this.digitHexadecimal = '0123456789ABCDEFabcdef';
    this.noName = '_';
    this.identifierBeginChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'; // Unicode?
    this.identifierEndChar = `${this.identifierBeginChar}${this.digitDecimal}`;
    this.operatorChar = '+-*/\\^%!><=÷×≠≈¹²³√'; // Unicode?
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
  // | !.
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
          this.reset(state.lastPosition, null, state.column, state.line);
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
          this.reset(state.lastPosition, null, state.column, state.line);
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
          this.reset(state.lastPosition, null, state.column, state.line);
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
          this.reset(state.lastPosition, null, state.column, state.line);
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
          this.reset(state.lastPosition, null, state.column, state.line);
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
            this.reset(state2.lastPosition, null, state2.column, state2.line);
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
              this.reset(state3.lastPosition, null, state3.column, state3.line);
              break;
            }
          }

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful) {
          this.reset(state2.lastPosition, null, state2.column, state2.line);
        }

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. 'e' [-+]? digitbinary ('_'? digitbinary)*
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        token = otherState.token;

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
              this.reset(state2.lastPosition, null, state2.column, state2.line);
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
          this.reset(state.lastPosition, null, state.column, state.line);
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
            this.reset(state2.lastPosition, null, state2.column, state2.line);
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
              this.reset(state3.lastPosition, null, state3.column, state3.line);
              break;
            }
          }

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful) {
          this.reset(state2.lastPosition, null, state2.column, state2.line);
        }

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. 'e' [-+]? digitoctal ('_'? digitoctal)*
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        token = otherState.token;

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
              this.reset(state2.lastPosition, null, state2.column, state2.line);
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
          this.reset(state.lastPosition, null, state.column, state.line);
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
            this.reset(state2.lastPosition, null, state2.column, state2.line);
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
              this.reset(state3.lastPosition, null, state3.column, state3.line);
              break;
            }
          }

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful) {
          this.reset(state2.lastPosition, null, state2.column, state2.line);
        }

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. 'p' [-+]? digithexadecimal ('_'? digithexadecimal)*
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        token = otherState.token;

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
              this.reset(state2.lastPosition, null, state2.column, state2.line);
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
              this.reset(state3.lastPosition, null, state3.column, state3.line);
              break;
            }
          }

          // This optional was parsed successfully.
          optionalParseSuccessful = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful) {
          this.reset(state2.lastPosition, null, state2.column, state2.line);
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
            this.reset(state3.lastPosition, null, state3.column, state3.line);
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
              this.reset(state4.lastPosition, null, state4.column, state4.line);
              break;
            }
          }

          // This optional was parsed successfully.
          optionalParseSuccessful2 = true;
        })();

        // If parsing the above optional fails, revert state to what it was before that parsing began.
        if (!optionalParseSuccessful2) {
          this.reset(state3.lastPosition, null, state3.column, state3.line);
        }

        // This alternative was parsed successfully.
        alternativeParseSuccessful = true;
      })();

      // [2]. digitdecimal ('_'? digitdecimal)* 'e' [-+]? digitdecimal ('_'? digitdecimal)*
      if (!alternativeParseSuccessful) {
        // Revert state to what it was before alternative parsing started.
        this.reset(state.lastPosition, null, null, state.column, state.line);
        token = otherState.token;

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
              this.reset(state2.lastPosition, null, state2.column, state2.line);
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
              this.reset(state2.lastPosition, null, state2.column, state2.line);
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
        number = otherState.number;
        identifier = otherState.identifier;

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
        number = otherState.number;
        identifier = otherState.identifier;

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
        number = otherState.number;
        identifier = otherState.identifier;

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
        number = otherState.number;
        identifier = otherState.identifier;

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
        number = otherState.number;
        identifier = otherState.identifier;

        (() => {
          // Check !('0b' | '0o' | '0x').
          if (this.parseToken('0b').success || this.parseToken('0o').success || this.parseToken('0x').success) return;
          // Step back two chars.
          this.lastPosition -= 2;

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
      parseData = { success: true, message: null, ast: { type: 'operator', name: token.join('') } };

      // Update lastParseData.
      this.lastParseData = parseData;
      return parseData;
    }

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
  //   | newline (_* newline)*.
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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // _ =
  //   | linecontinuation
  //   | space+
  parseSpaces() { // TODO
    // Keep original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'spaces';
    let count = 0;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // expression =
  //   | integerliteral
  //   | identifier
  parseExpression() { // TODO
    const type = 'expression';

    if (this.parseIntegerLiteral().success) {
      return this.lastParseData;
    } else if (this.parseIdentifier().success) {
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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // typedeclaration =
  //  | 'type' _ identifier _? '(' _? ')' (_? '<:' _? names)?
  //  | 'type' _ identifier (_? '<:' _? names)? _? ':' _? subjectdeclaration
  parseTypeDeclaration() { // TODO
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'typedeclaration';
    let identifier;
    let supertypes = [];
    let field = null;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

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
      const otherState = { supertypes: [...supertypes], field };

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
        supertypes = otherState.supertypes;
        field = otherState.field;
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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // functiondeclaration =
  //   | 'fun' _ identifier _? '(' _? ')' (_ '=' _ expression | '=' !(operator) expression)
  parseFunctionDeclaration() { // TODO
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'functiondeclarationn';
    let identifier;
    let expression;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

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
      const otherState = { expression };

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
        expression = otherState.expression;

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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }

  // subjectdeclaration =
  //   | ('let' | 'var') _ identifier (_ '=' _ expression | '=' !(operator) expression)
  parseSubjectDeclaration() { // TODO
    // Keeping original state.
    const {
      lastPosition, column, line,
    } = this;

    const type = 'subjectdeclaration';
    let mutability;
    let identifier;
    let expression;
    let parseData = { success: false, message: { type, parser: this }, ast: null };

    (() => {
      // Consume ('let' | 'var').
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
      const otherState = { expression };

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
        expression = otherState.expression;

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
    this.reset(lastPosition, null, null, column, line);

    return parseData;
  }
}

module.exports = Parser;
