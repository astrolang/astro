/* eslint-disable max-len, no-constant-condition */
// eslint-disable-next-line no-unused-vars
const { print } = require('../../utils');

/**
 * ### The simple lexer.
 *
 * ##### NOTES:
 * * Lex functions return [{ token, kind, line, column }]
 *
 * ##### TODO:
 * * Fix unicode issues
 * * Remove line, startLine and startLine attributes
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
    this.operatorChar = "+'-*/\\^%&|!><=÷×≠≈¹²³√?~"; // Unicode?
    this.punctuatorChar = '(){}[],.;:@$'; // Unicode?
    this.importNameChar = `${this.identifierEndChar}-`; // Unicode?
    this.keywords = [
      'import', 'export', 'let', 'var', 'const', 'fun', 'type', 'async',
      'ref', 'iso', 'if', 'elif', 'else', 'while', 'for', 'try',
      'except', 'ensure', 'defer', 'loop', 'end', 'match', 'fallthrough', 'return', 'raise', 'break',
      'continue', 'yield', 'from', 'await', 'where', 'is', 'not', 'in', 'as',
      'mod', 'typeof', 'super',
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

  // Check if specified token is next token in code.
  peekToken(str) {
    const { length } = str;

    // Check if input string matches the subsequent chars in code.
    if (str === this.code.slice(this.lastPosition + 1, this.lastPosition + length + 1)) {
      return true;
    }

    return false;
  }

  // Check if lexer has reached last position.
  lastReached() {
    if (this.lastPosition + 1 >= this.code.length) {
      return true;
    }
    return false;
  }

  // Consume string specified if it matches the subsequent chars in code.
  // NOTE: Should not be passed strings with newlines. It won't update line count.
  eatToken(str) {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'eatToken';
    const startColumn = column;
    const { length } = str;

    // Check if input string matches the subsequent chars in code.
    if (str === this.code.slice(this.lastPosition + 1, this.lastPosition + length + 1)) {
      // Update lastPosition and column.
      this.lastPosition += length;
      this.column += length;

      // Update token.
      token = str;
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.

    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // Reverts the state of the lexer object using arguments provided.
  revert(lastPosition, column, line) {
    this.lastPosition = lastPosition;
    this.column = column;
    this.line = line;
  }

  // spacechar =
  //   | [ \t] // Unicode?
  // spaces =
  //   | space+
  spaces() {
    const { lastPosition, column, line } = this;
    const token = '';
    const kind = 'spaces';
    const startColumn = column;
    let spaceCount = 0;

    // Check if subsequent chars in input code are valid space character.
    while (this.spaceChar.indexOf(this.peekChar()) > -1) {
      this.eatChar();
      spaceCount += 1;
    }

    // Check if lexing failed.
    if (spaceCount === 0) {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // newline =
  //   | '\r'? '\n'
  newline() {
    const { column } = this;
    const token = '';
    const kind = 'newline';
    const startColumn = column;

    if (this.code[this.lastPosition + 1] === '\n') {
      this.lastPosition += 1;
      this.column += 1;
    } else if (this.code[this.lastPosition + 1] === '\r' && this.code[this.lastPosition + 2] === '\n') {
      this.lastPosition += 2;
      this.column += 2;
    } else {
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // noname =
  //   | '_'
  noName() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'noname';
    const startColumn = column;

    // Check if next char in input code is a '_' character.
    if (this.peekChar() === '_') {
      token += this.eatChar();
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // identifierbeginchar =
  //   | [a-zA-Z_] // Unicode?
  // identifierendchar =
  //   | identifierbeginchar
  //   | digit
  // identifier =
  //   | identifierbeginchar identifierendchar* // Contains keyword check
  //   { token, kind, startColumn, stopColumn } :: identifier
  //   { token, kind, startColumn, stopColumn } :: keyword
  //   { token, kind, startColumn, stopColumn } :: booleanliteral
  identifier() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'identifier';
    const startColumn = column;

    // Check if next char in input code is a valid identifier start character.
    if (this.identifierBeginChar.indexOf(this.peekChar()) > -1) {
      token += this.eatChar();
      // Check if subsequent chars are valid identifier character as well.
      while (this.identifierEndChar.indexOf(this.peekChar()) > -1) {
        token += this.eatChar();
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    // Check if lexed identifier is a boolean literal.
    if (token === 'true' || token === 'false') {
      return {
        token, kind: 'booleanliteral', startColumn, stopColumn,
      };
    // Otherwise check if lexed identifier is a keyword.
    } else if (this.keywords.indexOf(token) > -1) {
      return {
        token, kind: 'keyword', startColumn, stopColumn,
      };
    }

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // operatorchar =
  //   | [+\-*/\\^%!><=÷×≠≈¹²³√] // Unicode?
  // operator =
  //   | operatorchar+
  //   { token, kind, startColumn, stopColumn }
  operator() {
    let { lastPosition, column, line } = this;
    let token = '';
    const kind = 'operator';
    const startColumn = column;

    // Check if subsequent chars in input code are valid operator character.
    while (this.operatorChar.indexOf(this.peekChar()) > -1) {
      token += this.eatChar();

      // NOTE: Only these infix operators with '//' in them are allowed: a // b, a //= b
      // Other operator names with '//' in them are invalid: a +// b, a //+ b
      ({ lastPosition, column, line } = this);
      if (this.eatToken('//') || this.eatToken('//=')) {
        this.revert(lastPosition, column, line);
        break;
      }
    }

    // Check for special operators like "::".
    if (token === '') {
      if (this.peekToken('::') || this.peekToken('<:') || this.peekToken('<:')) {
        token += this.eatChar();
        token += this.eatChar();
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // punctuator =
  //   | [(){}[\],.~] // TODO: Incomplete
  punctuator() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'punctuator';
    const startColumn = column;

    // Check if subsequent chars in input code are valid operator character.
    if (this.punctuatorChar.indexOf(this.peekChar()) > -1) {
      token += this.eatChar();
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // digitbinary =
  //   | [0-1]
  // digitoctal =
  //   | [0-7]
  // digitdecimal =
  //   | [0-9]
  // digithexadecimal =
  //   | [0-9a-fA-F]
  // integerbinaryliteral =
  //   | '0b' '_'? digitbinary ('_'? digitbinary)*
  //   { token, kind, startColumn, stopColumn }
  integerBinaryLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'integerbinaryliteral';
    const startColumn = column;

    // Consume '0b'.
    if (this.eatToken('0b')) {
      // Consume '_'?.
      if (this.peekChar() === '_') this.eatChar();

      // Consume digitbinary.
      if (this.digitBinary.indexOf(this.peekChar()) > -1) {
        token += this.eatChar();

        // Consume ('_'? digitbinary)*.
        while (true) {
          const char = this.peekChar();

          // Try consume '_' digitbinary.
          if (char === '_') {
            // Consume '_'.
            this.eatChar();

            // If '_' is consumed, a digitbinary must follow.
            if (this.digitBinary.indexOf(this.peekChar()) > -1) {
              token += this.eatChar();
            // Otherwise spit out '_' and break.
            } else {
              this.lastPosition -= 1;
              this.column -= 1;
              break;
            }

          // Otherwise consume digitbinary.
          } else if (this.digitBinary.indexOf(char) > -1) {
            token += this.eatChar();
          } else break;
        }
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // integeroctalliteral =
  //   | '0o' '_'? digitoctal ('_'? digitoctal)*
  //   { token, kind, startColumn, stopColumn }
  integerOctalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'integeroctalliteral';
    const startColumn = column;

    // Consume '0o'.
    if (this.eatToken('0o')) {
      // Consume '_'?.
      if (this.peekChar() === '_') this.eatChar();

      // Consume digitoctal.
      if (this.digitOctal.indexOf(this.peekChar()) > -1) {
        token += this.eatChar();

        // Consume ('_'? digitoctal)*.
        while (true) {
          const char = this.peekChar();

          // Try consume '_' digitoctal.
          if (char === '_') {
            // Consume '_'.
            this.eatChar();

            // If '_' is consumed, a digitoctal must follow.
            if (this.digitOctal.indexOf(this.peekChar()) > -1) {
              token += this.eatChar();
            // Otherwise spit out '_' and break.
            } else {
              this.lastPosition -= 1;
              this.column -= 1;
              break;
            }

          // Otherwise consume digitoctal.
          } else if (this.digitOctal.indexOf(char) > -1) {
            token += this.eatChar();
          } else break;
        }
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // integerhexadecimalliteral =
  //   | '0x' '_'? digithexadecimal ('_'? digithexadecimal)*
  //   { token, kind, startColumn, stopColumn }
  integerHexadecimalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'integerhexadecimalliteral';
    const startColumn = column;

    // Consume '0x'.
    if (this.eatToken('0x')) {
      // Consume '_'?.
      if (this.peekChar() === '_') this.eatChar();

      // Consume digithexadecimal.
      if (this.digitHexadecimal.indexOf(this.peekChar()) > -1) {
        token += this.eatChar();

        // Consume ('_'? digithexadecimal)*.
        while (true) {
          const char = this.peekChar();

          // Try consume '_' digithexadecimal.
          if (char === '_') {
            // Consume '_'.
            this.eatChar();

            // If '_' is consumed, a digithexadecimal must follow.
            if (this.digitHexadecimal.indexOf(this.peekChar()) > -1) {
              token += this.eatChar();
            // Otherwise spit out '_' and break.
            } else {
              this.lastPosition -= 1;
              this.column -= 1;
              break;
            }

          // Otherwise consume digithexadecimal.
          } else if (this.digitHexadecimal.indexOf(char) > -1) {
            token += this.eatChar();
          } else break;
        }
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // integerdecimalliteral =
  //   | digitdecimal ('_'? digitdecimal)*
  //   { token, kind, startColumn, stopColumn }
  integerDecimalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'integerdecimalliteral';
    const startColumn = column;

    // Consume digitdecimal.
    if (this.digitDecimal.indexOf(this.peekChar()) > -1) {
      token += this.eatChar();

      // Consume ('_'? digitdecimal)*.
      while (true) {
        const char = this.peekChar();

        // Try consume '_' digitdecimal.
        if (char === '_') {
          // Consume '_'.
          this.eatChar();

          // If '_' is consumed, a digitdecimal must follow.
          if (this.digitDecimal.indexOf(this.peekChar()) > -1) {
            token += this.eatChar();
          // Otherwise spit out '_' and break.
          } else {
            this.lastPosition -= 1;
            this.column -= 1;
            break;
          }

        // Otherwise consume digitdecimal.
        } else if (this.digitDecimal.indexOf(char) > -1) {
          token += this.eatChar();
        } else break;
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // floatbinaryliteral =
  //   | '0b' '_'? digitbinary ('_'? digitbinary)* '.' digitbinary ('_'? digitbinary)* ('e' [-+]? digitbinary ('_'? digitbinary)*)?
  //   | '0b' '_'? digitbinary ('_'? digitbinary)* 'e' [-+]? digitbinary ('_'? digitbinary)*
  //   { token, kind, startColumn, stopColumn }
  floatBinaryLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'floatbinaryliteral';
    const startColumn = column;

    // Consume integerpart: ('0b' '_'? digitbinary) ('_'? digitbinary)*.
    const integerPart = this.integerBinaryLiteral();
    if (integerPart) {
      token += integerPart.token;

      // Consume '.'.
      if (this.peekChar() === '.') {
        token += this.eatChar();

        // Consume digitbinary.
        if (this.digitBinary.indexOf(this.peekChar()) > -1) {
          token += this.eatChar();

          // Consume ('_'? digitbinary)*.
          while (true) {
            const char1 = this.peekChar();

            // Try consume '_' digitbinary.
            if (char1 === '_') {
              // Consume '_'.
              this.eatChar();

              // If '_' is consumed, a digitbinary must follow.
              if (this.digitBinary.indexOf(this.peekChar()) > -1) {
                token += this.eatChar();
              // Otherwise spit out '_' and break.
              } else {
                this.lastPosition -= 1;
                this.column -= 1;
                break;
              }

            // Otherwise consume digitbinary.
            } else if (this.digitBinary.indexOf(char1) > -1) {
              token += this.eatChar();
            } else break;
          }

          // Consume ('e' [-+]? digitbinary ('_'? digitbinary)*)?
          if (this.peekChar() === 'e') {
            token += this.eatChar();

            const sign = this.peekChar();
            if (sign === '-' || sign === '+') {
              token += this.eatChar();
            }

            // Consume digitbinary.
            if (this.digitBinary.indexOf(this.peekChar()) > -1) {
              token += this.eatChar();

              // Consume ('_'? digitbinary)*.
              while (true) {
                const char2 = this.peekChar();

                // Try consume '_' digitbinary.
                if (char2 === '_') {
                  // Consume '_'.
                  this.eatChar();

                  // If '_' is consumed, a digitbinary must follow.
                  if (this.digitBinary.indexOf(this.peekChar()) > -1) {
                    token += this.eatChar();
                  // Otherwise spit out '_' and break.
                  } else {
                    this.lastPosition -= 1;
                    this.column -= 1;
                    break;
                  }

                // Otherwise consume digitbinary.
                } else if (this.digitBinary.indexOf(char2) > -1) {
                  token += this.eatChar();
                } else break;
              }

            // Failed if can't consume digitbinary.
            } else {
              token = '';
            }
          }

        // Failed if can't consume digitbinary.
        } else {
          token = '';
        }

      // Otherwise consume 'e'.
      } else if (this.peekChar() === 'e') {
        token += this.eatChar();

        const sign = this.peekChar();
        if (sign === '-' || sign === '+') {
          token += this.eatChar();
        }

        // Consume digitbinary.
        if (this.digitBinary.indexOf(this.peekChar()) > -1) {
          token += this.eatChar();

          // Consume ('_'? digitbinary)*.
          while (true) {
            const char1 = this.peekChar();

            // Try consume '_' digitbinary.
            if (char1 === '_') {
              // Consume '_'.
              this.eatChar();

              // If '_' is consumed, a digitbinary must follow.
              if (this.digitBinary.indexOf(this.peekChar()) > -1) {
                token += this.eatChar();
              // Otherwise spit out '_' and break.
              } else {
                this.lastPosition -= 1;
                this.column -= 1;
                break;
              }

            // Otherwise consume digitbinary.
            } else if (this.digitBinary.indexOf(char1) > -1) {
              token += this.eatChar();
            } else break;
          }

        // Failed if can't consume digitbinary.
        } else {
          token = '';
        }
      // Can't consume '.' or 'e'.
      } else {
        token = '';
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // floatoctalliteral =
  //   | '0o' '_'? digitoctal ('_'? digitoctal)* '.' digitoctal ('_'? digitoctal)* ('e' [-+]? digitoctal ('_'? digitoctal)*)?
  //   | '0o' '_'? digitoctal ('_'? digitoctal)* 'e' [-+]? digitoctal ('_'? digitoctal)*
  //   { token, kind, startColumn, stopColumn }
  floatOctalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'floatoctalliteral';
    const startColumn = column;

    // Consume integerpart: ('0o' '_'? digitoctal) ('_'? digitoctal)*.
    const integerPart = this.integerOctalLiteral();
    if (integerPart) {
      token += integerPart.token;

      // Consume '.'.
      if (this.peekChar() === '.') {
        token += this.eatChar();

        // Consume digitoctal.
        if (this.digitOctal.indexOf(this.peekChar()) > -1) {
          token += this.eatChar();

          // Consume ('_'? digitoctal)*.
          while (true) {
            const char1 = this.peekChar();

            // Try consume '_' digitoctal.
            if (char1 === '_') {
              // Consume '_'.
              this.eatChar();

              // If '_' is consumed, a digitoctal must follow.
              if (this.digitOctal.indexOf(this.peekChar()) > -1) {
                token += this.eatChar();
              // Otherwise spit out '_' and break.
              } else {
                this.lastPosition -= 1;
                this.column -= 1;
                break;
              }

            // Otherwise consume digitoctal.
            } else if (this.digitOctal.indexOf(char1) > -1) {
              token += this.eatChar();
            } else break;
          }

          // Consume ('e' [-+]? digitoctal ('_'? digitoctal)*)?
          if (this.peekChar() === 'e') {
            token += this.eatChar();

            const sign = this.peekChar();
            if (sign === '-' || sign === '+') {
              token += this.eatChar();
            }

            // Consume digitoctal.
            if (this.digitOctal.indexOf(this.peekChar()) > -1) {
              token += this.eatChar();

              // Consume ('_'? digitoctal)*.
              while (true) {
                const char2 = this.peekChar();

                // Try consume '_' digitoctal.
                if (char2 === '_') {
                  // Consume '_'.
                  this.eatChar();

                  // If '_' is consumed, a digitoctal must follow.
                  if (this.digitOctal.indexOf(this.peekChar()) > -1) {
                    token += this.eatChar();
                  // Otherwise spit out '_' and break.
                  } else {
                    this.lastPosition -= 1;
                    this.column -= 1;
                    break;
                  }

                // Otherwise consume digitoctal.
                } else if (this.digitOctal.indexOf(char2) > -1) {
                  token += this.eatChar();
                } else break;
              }

            // Failed if can't consume digitoctal.
            } else {
              token = '';
            }
          }

        // Failed if can't consume digitoctal.
        } else {
          token = '';
        }

      // Otherwise consume 'e'.
      } else if (this.peekChar() === 'e') {
        token += this.eatChar();

        const sign = this.peekChar();
        if (sign === '-' || sign === '+') {
          token += this.eatChar();
        }

        // Consume digitoctal.
        if (this.digitOctal.indexOf(this.peekChar()) > -1) {
          token += this.eatChar();

          // Consume ('_'? digitoctal)*.
          while (true) {
            const char1 = this.peekChar();

            // Try consume '_' digitoctal.
            if (char1 === '_') {
              // Consume '_'.
              this.eatChar();

              // If '_' is consumed, a digitoctal must follow.
              if (this.digitOctal.indexOf(this.peekChar()) > -1) {
                token += this.eatChar();
              // Otherwise spit out '_' and break.
              } else {
                this.lastPosition -= 1;
                this.column -= 1;
                break;
              }

            // Otherwise consume digitoctal.
            } else if (this.digitOctal.indexOf(char1) > -1) {
              token += this.eatChar();
            } else break;
          }

        // Failed if can't consume digitoctal.
        } else {
          token = '';
        }
      // Can't consume '.' or 'e'.
      } else {
        token = '';
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // floathexadecimalliteral =
  //   | '0x' '_'? digithexadecimal ('_'? digithexadecimal)* '.' digithexadecimal ('_'? digithexadecimal)* ('p' [-+]? digithexadecimal ('_'? digithexadecimal)*)?
  //   | '0x' '_'? digithexadecimal ('_'? digithexadecimal)* 'p' [-+]? digithexadecimal ('_'? digithexadecimal)*
  //   { token, kind, startColumn, stopColumn }
  floatHexadecimalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'floathexadecimalliteral';
    const startColumn = column;

    // Consume integerpart: ('0x' '_'? digithexadecimal) ('_'? digithexadecimal)*.
    const integerPart = this.integerHexadecimalLiteral();

    if (integerPart) {
      token += integerPart.token;

      // Consume '.'.
      if (this.peekChar() === '.') {
        token += this.eatChar();

        // Consume digithexadecimal.
        if (this.digitHexadecimal.indexOf(this.peekChar()) > -1) {
          token += this.eatChar();

          // Consume ('_'? digithexadecimal)*.
          while (true) {
            const char1 = this.peekChar();

            // Try consume '_' digithexadecimal.
            if (char1 === '_') {
              // Consume '_'.
              this.eatChar();

              // If '_' is consumed, a digithexadecimal must follow.
              if (this.digitHexadecimal.indexOf(this.peekChar()) > -1) {
                token += this.eatChar();
              // Otherwise spit out '_' and break.
              } else {
                this.lastPosition -= 1;
                this.column -= 1;
                break;
              }

            // Otherwise consume digithexadecimal.
            } else if (this.digitHexadecimal.indexOf(char1) > -1) {
              token += this.eatChar();
            } else break;
          }

          // Consume ('p' [-+]? digithexadecimal ('_'? digithexadecimal)*)?
          if (this.peekChar() === 'p') {
            token += this.eatChar();

            const sign = this.peekChar();
            if (sign === '-' || sign === '+') {
              token += this.eatChar();
            }

            // Consume digithexadecimal.
            if (this.digitHexadecimal.indexOf(this.peekChar()) > -1) {
              token += this.eatChar();

              // Consume ('_'? digithexadecimal)*.
              while (true) {
                const char2 = this.peekChar();

                // Try consume '_' digithexadecimal.
                if (char2 === '_') {
                  // Consume '_'.
                  this.eatChar();

                  // If '_' is consumed, a digithexadecimal must follow.
                  if (this.digitHexadecimal.indexOf(this.peekChar()) > -1) {
                    token += this.eatChar();
                  // Otherwise spit out '_' and break.
                  } else {
                    this.lastPosition -= 1;
                    this.column -= 1;
                    break;
                  }

                // Otherwise consume digithexadecimal.
                } else if (this.digitHexadecimal.indexOf(char2) > -1) {
                  token += this.eatChar();
                } else break;
              }

            // Failed if can't consume digithexadecimal.
            } else {
              token = '';
            }
          }

        // Failed if can't consume digithexadecimal.
        } else {
          token = '';
        }

      // Otherwise consume 'p'.
      } else if (this.peekChar() === 'p') {
        token += this.eatChar();

        const sign = this.peekChar();
        if (sign === '-' || sign === '+') {
          token += this.eatChar();
        }

        // Consume digithexadecimal.
        if (this.digitHexadecimal.indexOf(this.peekChar()) > -1) {
          token += this.eatChar();

          // Consume ('_'? digithexadecimal)*.
          while (true) {
            const char1 = this.peekChar();

            // Try consume '_' digithexadecimal.
            if (char1 === '_') {
              // Consume '_'.
              this.eatChar();

              // If '_' is consumed, a digithexadecimal must follow.
              if (this.digitHexadecimal.indexOf(this.peekChar()) > -1) {
                token += this.eatChar();
              // Otherwise spit out '_' and break.
              } else {
                this.lastPosition -= 1;
                this.column -= 1;
                break;
              }

            // Otherwise consume digithexadecimal.
            } else if (this.digitHexadecimal.indexOf(char1) > -1) {
              token += this.eatChar();
            } else break;
          }

        // Failed if can't consume digithexadecimal.
        } else {
          token = '';
        }
      // Can't consume '.' or 'e'.
      } else {
        token = '';
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // floatdecimalliteral =
  //   | (digitdecimal ('_'? digitdecimal)*)? '.' digitdecimal ('_'? digitdecimal)* ('e' [-+]? digitdecimal ('_'? digitdecimal)*)?
  //   | digitdecimal ('_'? digitdecimal)* 'e' [-+]? digitdecimal ('_'? digitdecimal)*
  //   { token, kind, startColumn, stopColumn }
  floatDecimalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'floatdecimalliteral';
    const startColumn = column;

    // Consume integerpart: digitdecimal ('_'? digitdecimal)*.
    const integerPart = this.integerDecimalLiteral();
    if (integerPart) {
      token += integerPart.token;
    }

    // Consume  [^.]  '.'.
    if (this.peekChar() === '.') {
      if (!integerPart) token += '0';

      token += this.eatChar();

      // Check for [^.] '.'.
      // A preceding '.' means that this is not a float literal but an integer in a range literal.
      // Ex. a..1000.
      let precedingDot = false;
      if (this.lastPosition > 0 && this.code[this.lastPosition - 1] === '.') {
        precedingDot = true;
      }

      // Consume digitdecimal.
      if (this.digitDecimal.indexOf(this.peekChar()) > -1 && !precedingDot) {
        token += this.eatChar();

        // Consume ('_'? digitdecimal)*.
        while (true) {
          const char1 = this.peekChar();

          // Try consume '_' digitdecimal.
          if (char1 === '_') {
            // Consume '_'.
            this.eatChar();

            // If '_' is consumed, a digitdecimal must follow.
            if (this.digitDecimal.indexOf(this.peekChar()) > -1) {
              token += this.eatChar();
            // Otherwise spit out '_' and break.
            } else {
              this.lastPosition -= 1;
              this.column -= 1;
              break;
            }

          // Otherwise consume digitdecimal.
          } else if (this.digitDecimal.indexOf(char1) > -1) {
            token += this.eatChar();
          } else break;
        }

        // Consume ('e' [-+]? digitdecimal ('_'? digitdecimal)*)?
        if (this.peekChar() === 'e') {
          token += this.eatChar();

          const sign = this.peekChar();
          if (sign === '-' || sign === '+') {
            token += this.eatChar();
          }

          // Consume digitdecimal.
          if (this.digitDecimal.indexOf(this.peekChar()) > -1) {
            token += this.eatChar();

            // Consume ('_'? digitdecimal)*.
            while (true) {
              const char2 = this.peekChar();

              // Try consume '_' digitdecimal.
              if (char2 === '_') {
                // Consume '_'.
                this.eatChar();

                // If '_' is consumed, a digitdecimal must follow.
                if (this.digitDecimal.indexOf(this.peekChar()) > -1) {
                  token += this.eatChar();
                // Otherwise spit out '_' and break.
                } else {
                  this.lastPosition -= 1;
                  this.column -= 1;
                  break;
                }

              // Otherwise consume digitdecimal.
              } else if (this.digitDecimal.indexOf(char2) > -1) {
                token += this.eatChar();
              } else break;
            }

          // Failed if can't consume digitdecimal.
          } else {
            token = '';
          }
        }

      // Failed if can't consume digitdecimal.
      } else {
        token = '';
      }

    // Otherwise consume 'e'.
    } else if (this.peekChar() === 'e') {
      token += this.eatChar();

      const sign = this.peekChar();
      if (sign === '-' || sign === '+') {
        token += this.eatChar();
      }

      // Consume digitdecimal.
      if (this.digitDecimal.indexOf(this.peekChar()) > -1) {
        token += this.eatChar();

        // Consume ('_'? digitdecimal)*.
        while (true) {
          const char1 = this.peekChar();

          // Try consume '_' digitdecimal.
          if (char1 === '_') {
            // Consume '_'.
            this.eatChar();

            // If '_' is consumed, a digitdecimal must follow.
            if (this.digitDecimal.indexOf(this.peekChar()) > -1) {
              token += this.eatChar();
            // Otherwise spit out '_' and break.
            } else {
              this.lastPosition -= 1;
              this.column -= 1;
              break;
            }

          // Otherwise consume digitdecimal.
          } else if (this.digitDecimal.indexOf(char1) > -1) {
            token += this.eatChar();
          } else break;
        }

      // Failed if can't consume digitdecimal.
      } else {
        token = '';
      }
    // Can't consume '.' or 'e'.
    } else {
      token = '';
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // floatLiteralnomantissa =
  //   | (integerbinaryliteral | integeroctalliteral | integerhexadecimalliteral | integerdecimalliteral) '.' !(operator | identifier | '.')
  //   { token, kind, startColumn, stopColumn }
  floatLiteralNoMantissa() {
    const { lastPosition, column, line } = this;
    let token = '';
    let kind = '';
    const startColumn = column;

    // Consume (integerbinaryliteral | integeroctalliteral | integerhexadecimalliteral | integerdecimalliteral).
    const integerPart = this.integerBinaryLiteral() || this.integerOctalLiteral() || this.integerHexadecimalLiteral() || this.integerDecimalLiteral();
    if (integerPart) {
      token += integerPart.token;
      kind = `float${integerPart.kind.slice(7)}`;

      // Consume '.'.
      if (this.peekChar() === '.') {
        this.eatChar();
        token += '.0';

        // Check !(operator | identifier | '.').
        // A follow-up '.' means that this is not a float literal but an integer in a range literal.
        // Ex. 1..length.
        if (this.operator() || this.identifier() || this.peekChar() === '.') { token = ''; }
      } else {
        token = '';
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // doublequotestringchars =
  //   | (!(newline | '"') .)+ // TODO
  // singlequotestringchars =
  //   | (!(newline | "'") .)+ // TODO
  // singlelinestringliteral =
  //   | "'" singlequotestringchars? "'"
  //   | '"' doublequotestringchars? '"'
  //   { token, kind, startColumn, stopColumn }
  singleLineStringLiteral() {
    const { lastPosition, column, line } = this;
    let token = null;
    const kind = 'singlelinestringliteral';
    const startColumn = column;

    // Consume "'".
    if (this.peekChar() === "'") {
      this.eatChar();
      token = ''; // Make token a string.

      // Consume (singlequotestringchars: (!(newline | "'") .)+)?.
      while (
        this.peekChar() !== '\n' &&
        this.peekChar() !== '\r' &&
        this.peekChar() !== "'" &&
        this.peekChar() !== null
      ) {
        token += this.eatChar();
      }

      // Consume "'".
      if (this.peekChar() === "'") {
        this.eatChar();
      } else { token = null; }

    // Consume '"'.
    } else if (this.peekChar() === '"') {
      this.eatChar();
      token = ''; // Make token a string.

      // Consume (doublequotestringchars: (!(newline | '"') .)+)?.
      while (
        this.peekChar() !== '\n' &&
        this.peekChar() !== '\r' &&
        this.peekChar() !== '"' &&
        this.peekChar() !== null
      ) {
        token += this.eatChar();
      }

      // Consume '"'.
      if (this.peekChar() === '"') {
        this.eatChar();
      } else { token = null; }
    }

    // Check if lexing failed.
    if (token === null) {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // triplesinglequotestringchars =
  //   | (!"'''" .)+ // TODO
  // tripledoublequotestringchars =
  //   | (!'"""' .)+ // TODO
  // multilinestringliteral =
  //   | "'''" triplesinglequotestringchars? "'''"
  //   | '"""' tripledoublequotestringchars? '"""'
  //   { token, kind, indentations, startColumn, stopColumn }
  // NOTE: Saves space-count of indentations in the string. These indentations are later checked at the
  // parsing stage to see if each is greater or equal to the indentation of the line of the opening quote.
  multiLineStringLiteral() {
    const { lastPosition, column, line } = this;
    let token = null;
    const kind = 'multilinestringliteral';
    const indentations = [];
    const startColumn = column;

    // Consume "'''".
    if (this.eatToken("'''")) {
      token = ''; // Make token a string.

      // Consume (singlequotestringchars: (!"'''" .)+)?.
      let triplequote = this.eatToken("'''");
      while (true) {
        if (this.lastReached()) break;
        if (triplequote) break;

        const char = this.eatChar();
        token += char;

        // Check for indentation.
        if (char === '\n') {
          let position = this.lastPosition + 1;
          let spaceCount = 0;

          while (this.code[position] === ' ') {
            spaceCount += 1;
            position += 1;
          }

          if (spaceCount > 0) indentations.push(spaceCount);
        }

        triplequote = this.eatToken("'''");
      }

      // Check if "'''" was consumed.
      if (!triplequote) token = null;

    // Consume '"""'.
    } else if (this.eatToken('"""')) {
      token = ''; // Make token a string.

      // Consume (singlequotestringchars: (!'"""' .)+)?.
      let triplequote = this.eatToken('"""');
      while (true) {
        if (this.lastReached()) break;
        if (triplequote) break;

        const char = this.eatChar();
        token += char;

        // Check for indentation.
        if (char === '\n') {
          let position = this.lastPosition + 1;
          let spaceCount = 0;

          while (this.code[position] === ' ') {
            spaceCount += 1;
            position += 1;
          }

          if (spaceCount > 0) indentations.push(spaceCount);
        }

        triplequote = this.eatToken('"""');
      }

      // Check if '"""' was consumed.
      if (!triplequote) token = null;
    }

    // Check if lexing failed.
    if (token === null) {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, indentations, startColumn, stopColumn,
    };
  }

  // regexchars =
  //   | (!(newline | '/') .)+ // TODO
  // regexliteral =
  //   | '/' regexchars? '/'
  //   { token, kind, startColumn, stopColumn }
  // NOTE: /regex/ (?!(\s*[\{\[\(a-zA-Z0-9@$])|{operatorChar})
  regexLiteral() {
    const { lastPosition, column, line } = this;
    let token = null;
    const kind = 'regexliteral';
    const startColumn = column;

    if (this.peekChar() === '/') {
      // Consume "/".
      this.eatChar();
      token = ''; // Make token a string.

      // Consume (singlequotestringchars: (!(newline | "/") .)+)?.
      while (!this.lastReached() && this.peekChar() !== '/' && this.peekChar() !== '\n' && this.peekChar() !== '\r') {
        token += this.eatChar();
      }

      // Consume "/".
      if (this.peekChar() !== '/') {
        token = null;
      } else {
        this.eatChar();
      }

      // Check (?!(\s*[\{\[\(a-zA-Z0-9@$])|{operatorChar})
      if (!this.lastReached()) {
        const lastPos = this.lastPosition;
        const col = this.column;
        const ln = this.line;
        // !operatorChar
        if (this.operatorChar.indexOf(this.peekChar()) > -1) {
          token = null;
        // !(identifierBeginChar | '{' | '[' | '(' | '@' | '$')
        } else {
          this.spaces();
          if (this.identifierEndChar.indexOf(this.peekChar()) > -1 || '{[(@$'.indexOf(this.peekChar()) > -1) {
            token = null;
          }
        }

        this.revert(lastPos, col, ln);
      }
    }

    // Check if lexing failed.
    if (token === null) {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // singlelinecommentchars =
  //   | (!(newline | eoi) .)+ // TODO
  // singlelinecomment =
  //   | "#" !('=') singlelinecommentchars? &(newline | eoi)
  //   { token, kind, startColumn, stopColumn }
  singleLineComment() {
    const { lastPosition, column, line } = this;
    let token = null;
    const kind = 'singlelinecomment';
    const startColumn = column;

    // Consume "#".
    if (this.peekChar() === '#') {
      this.eatChar();
      token = ''; // Make token a string.

      // Check !('=').
      if (this.peekChar() === '-') {
        token = null;
      } else {
        // Consume (singlelinecommentchars: (!(newline | eoi) .)+)?.
        while (
          this.peekChar() !== '\n' &&
          this.peekChar() !== '\r' &&
          this.peekChar() !== null
        ) {
          token += this.eatChar();
        }
      }
    }

    // Check if lexing failed.
    if (token === null) {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // multilinecommentchars =
  //   | (!('#-' | '-#') .)+ // TODO
  // innermultilinecomment =
  //   | "#-" multilinecommentchars? (innermultilinecomment multilinecommentchars?)* '-#'
  //   { token, kind, startColumn, stopColumn }
  innerMultiLineComment() {
    const { lastPosition, column, line } = this;
    let token = null;
    const kind = 'innermultilinecomment';

    const startColumn = column;

    // Consume "#-".
    if (this.eatToken('#-')) {
      token = ''; // Make token a string.

      // Consume (multilinecommentchars: (!('#-' | '-#') .)+)?.
      let closeTag = this.eatToken('-#');
      while (true) {
        if (this.lastReached()) break;
        if (closeTag) break;


        const openTag = this.eatToken('#-');

        // Check innermultilinecomment?.
        if (openTag) {
          // Vomit eaten openTag.
          this.revert(this.lastPosition - 2, this.column - 2, line);
          const lexedInnerMultiLineComment = this.innerMultiLineComment();
          if (lexedInnerMultiLineComment) {
            // Don't save token
          } else {
            token = null;
            break;
          }
        } else {
          // Don't save token
          this.eatChar();
        }

        closeTag = this.eatToken('-#');
      }

      // Check if '-#' was consumed.
      if (!closeTag) token = null;
    }

    // Check if lexing failed.
    if (token === null) {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  // multilinecomment =
  //   | "#-" multilinecommentchars? (innermultilinecomment multilinecommentchars?)* '-#'
  //   { token, kind, startColumn, stopColumn }
  multiLineComment() {
    const { lastPosition, column, line } = this;
    let token = null;
    const kind = 'multilinecomment';
    const startColumn = column;

    // Consume "#-".
    if (this.eatToken('#-')) {
      token = ''; // Make token a string.

      // Consume (multilinecommentchars: (!('#-' | '-#') .)+)?.
      let closeTag = this.eatToken('-#');
      while (true) {
        if (this.lastReached()) break;
        if (closeTag) break;

        const openTag = this.eatToken('#-');

        // Check innermultilinecomment?.
        if (openTag) {
          // Vomit eaten openTag.
          this.revert(this.lastPosition - 2, this.column - 2, line);
          const lexedInnerMultiLineComment = this.innerMultiLineComment();
          if (lexedInnerMultiLineComment) {
            // Don't save token
          } else {
            token = null;
            break;
          }
        } else {
          // Don't save token
          this.eatChar();
        }

        closeTag = this.eatToken('-#');
      }

      // Check if '-#' was not consumed.
      if (!closeTag) token = null;
    }

    // Check if lexing failed.
    if (token === null) {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop column.
    const stopColumn = this.column;

    return {
      token, kind, startColumn, stopColumn,
    };
  }

  /**
   * TODO: Need a stream version of this.
   */
  lex() {
    const tokens = [];
    while (!this.lastReached()) {
      const token =
        this.spaces() ||
        this.newline() ||
        this.noName() ||
        this.identifier() ||
        this.floatBinaryLiteral() ||
        this.floatOctalLiteral() ||
        this.floatHexadecimalLiteral() ||
        this.floatDecimalLiteral() ||
        this.floatLiteralNoMantissa() ||
        this.integerBinaryLiteral() ||
        this.integerOctalLiteral() ||
        this.integerHexadecimalLiteral() ||
        this.integerDecimalLiteral() ||
        this.multiLineStringLiteral() ||
        this.singleLineStringLiteral() ||
        this.regexLiteral() ||
        this.multiLineComment() ||
        this.singleLineComment() ||
        this.operator() ||
        this.punctuator();

      if (token) {
        // Ignore spaces and comments
        if (token.kind !== 'spaces' && token.kind !== 'singlelinecomment' && token.kind !== 'multilinecomment') {
          tokens.push(token);
        }
      // TODO: Enclosures should be much more clever. `"abc` expects a closing `"`
      } else {
        return { error: { line: this.line, column: this.column }, tokens };
      }
    }

    return { error: null, tokens };
  }
}

module.exports = Lexer;
