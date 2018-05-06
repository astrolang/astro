/* eslint-disable max-len, no-constant-condition */
// eslint-disable-next-line no-unused-vars
const { print } = require('../utils');

/**
 * The Lexer.
 * result = [{ token, kind, line, column }]
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
    this.operatorChar = '+-*/\\^%&|!><=÷×≠≈¹²³√'; // Unicode?
    this.importNameChar = `${this.identifierEndChar}-`; // Unicode?
    this.keywords = [
      'import', 'export', 'let', 'var', 'const', 'fun', 'type', 'abst', 'async',
      'ref', 'val', 'iso', 'acq', 'if', 'elif', 'else', 'while', 'for', 'try',
      'except', 'ensure', 'defer', 'loop', 'end', 'spill', 'return', 'raise', 'break',
      'continue', 'yield', 'from', 'await', 'where', 'at', 'is', 'not', 'in', 'as',
      'mod', 'typeof', 'new', 'super',
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

  // Consume string specified if it matches the subsequent chars in code.
  // NOTE: Should not be passed strings with newlines. It won't update line count.
  eatToken(str) {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'eatToken';
    const startLine = line;
    const startColumn = column;
    const { length } = str;

    // Check if input string matches the subsequent chars in code.
    if (str === this.code.slice(this.lastPosition + 1, this.lastPosition + length + 1)) {
      // Update lastPosition and column.
      this.lastPosition += length;
      this.column += length;

      // update token.
      token = str;
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
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
    const startLine = line;
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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // noname =
  //   | '_'
  noName() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'noname';
    const startLine = line;
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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // identifierbeginchar =
  //   | [a-zA-Z_] // Unicode?
  // identifierendchar =
  //   | identifierbeginchar
  //   | digit
  // identifier =
  //   | identifierbeginchar identifierendchar* // Contains keyword check
  //   { token, kind, startLine, stopLine, startColumn, stopColumn } :: identifier
  //   { token, kind, startLine, stopLine, startColumn, stopColumn } :: keyword
  //   { token, kind, startLine, stopLine, startColumn, stopColumn } :: booleanliteral
  identifier() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'identifier';
    const startLine = line;
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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    // Check if lexed identifier is a boolean literal.
    if (token === 'true' || token === 'false') {
      return {
        token, kind: 'booleanliteral', startLine, stopLine, startColumn, stopColumn,
      };
    // Otherwise check if lexed identifier is a keyword.
    } else if (this.keywords.indexOf(token) > -1) {
      return {
        token, kind: 'keyword', startLine, stopLine, startColumn, stopColumn,
      };
    }

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // operatorchar =
  //   | [+\-*/\\^%!><=÷×≠≈¹²³√] // Unicode?
  // operator =
  //   | operatorchar+
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  operator() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'operator';
    const startLine = line;
    const startColumn = column;

    // Check if subsequent chars in input code are valid operator character.
    while (this.operatorChar.indexOf(this.peekChar()) > -1) {
      token += this.eatChar();
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // punctuator =
  //   | [(){}[\],.~] // TODO: Incomplete
  punctuator() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'punctuator';
    const startLine = line;
    const startColumn = column;

    // Check if subsequent chars in input code are valid operator character.
    if ('(){}[],.~;'.indexOf(this.peekChar()) > -1) {
      token += this.eatChar();
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
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
  //   | '0b' digitbinary ('_'? digitbinary)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  integerBinaryLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'integerbinaryliteral';
    const startLine = line;
    const startColumn = column;

    // Consume '0b'.
    if (this.eatToken('0b')) {
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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // integeroctalliteral =
  //   | '0o' digitoctal ('_'? digitoctal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  integerOctalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'integeroctalliteral';
    const startLine = line;
    const startColumn = column;

    // Consume '0o'.
    if (this.eatToken('0o')) {
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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // integerhexadecimalliteral =
  //   | '0x' digithexadecimal ('_'? digithexadecimal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  integerHexadecimalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'integerhexadecimalliteral';
    const startLine = line;
    const startColumn = column;

    // Consume '0x'.
    if (this.eatToken('0x')) {
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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // integerdecimalliteral =
  //   | digitdecimal ('_'? digitdecimal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  integerDecimalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'integerdecimalliteral';
    const startLine = line;
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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // floatbinaryliteral =
  //   | '0b' digitbinary ('_'? digitbinary)* '.' digitbinary ('_'? digitbinary)* ('e' [-+]? digitbinary ('_'? digitbinary)*)?
  //   | '0b' digitbinary ('_'? digitbinary)* 'e' [-+]? digitbinary ('_'? digitbinary)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  floatBinaryLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'floatbinaryliteral';
    const startLine = line;
    const startColumn = column;

    // Consume integerpart: ('0b' digitbinary) ('_'? digitbinary)*.
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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // floatoctalliteral =
  //   | '0o' digitoctal ('_'? digitoctal)* '.' digitoctal ('_'? digitoctal)* ('e' [-+]? digitoctal ('_'? digitoctal)*)?
  //   | '0o' digitoctal ('_'? digitoctal)* 'e' [-+]? digitoctal ('_'? digitoctal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  floatOctalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'floatoctalliteral';
    const startLine = line;
    const startColumn = column;

    // Consume integerpart: ('0o' digitoctal) ('_'? digitoctal)*.
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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // floathexadecimalliteral =
  //   | '0x' digithexadecimal ('_'? digithexadecimal)* '.' digithexadecimal ('_'? digithexadecimal)* ('p' [-+]? digithexadecimal ('_'? digithexadecimal)*)?
  //   | '0x' digithexadecimal ('_'? digithexadecimal)* 'p' [-+]? digithexadecimal ('_'? digithexadecimal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  floatHexadecimalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'floathexadecimalliteral';
    const startLine = line;
    const startColumn = column;

    // Consume integerpart: ('0x' digithexadecimal) ('_'? digithexadecimal)*.
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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // floatdecimalliteral =
  //   | (digitdecimal ('_'? digitdecimal)*)? '.' digitdecimal ('_'? digitdecimal)* ('e' [-+]? digitdecimal ('_'? digitdecimal)*)?
  //   | digitdecimal ('_'? digitdecimal)* 'e' [-+]? digitdecimal ('_'? digitdecimal)*
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  floatDecimalLiteral() {
    const { lastPosition, column, line } = this;
    let token = '';
    const kind = 'floatdecimalliteral';
    const startLine = line;
    const startColumn = column;

    // Consume integerpart: digitdecimal ('_'? digitdecimal)*.
    const integerPart = this.integerDecimalLiteral();
    if (integerPart) {
      token += integerPart.token;
    }

    // Consume '.'.
    if (this.peekChar() === '.') {
      if (!integerPart) token += '0';

      token += this.eatChar();

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

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // floatLiteralnomantissa =
  //   | (integerbinaryliteral | integeroctalliteral | integerhexadecimalliteral | integerdecimalliteral) '.' !(operator)
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  floatLiteralNoMantissa() {
    const { lastPosition, column, line } = this;
    let token = '';
    let kind = '';
    const startLine = line;
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

        // Check !(operator).
        if (this.operator()) { token = ''; }
      } else {
        token = '';
      }
    }

    // Check if lexing failed.
    if (token === '') {
      this.revert(lastPosition, column, line);
      return null;
    }

    // Add stop line and column.
    const stopLine = this.line;
    const stopColumn = this.column;

    return {
      token, kind, startLine, stopLine, startColumn, stopColumn,
    };
  }

  // doublequotestringchars =
  //   | (!(newline | '"') .)+ // TODO
  // singlequotestringchars =
  //   | (!(newline | "'") .)+ // TODO
  // singlelinestringliteral =
  //   | "'" singlequotestringchars? "'"
  //   | '"' doublequotestringchars? '"'
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // triplesinglequotestringchars =
  //   | (!(newline | "'''") .)+ // TODO
  // tripledoublequotestringchars =
  //   | (!(newline | '"""') .)+ // TODO
  // multilinestringliteral =
  //   | "'''" triplesinglequotestringchars? (nextline samedent triplesinglequotestringchars?)* "'''"
  //   | '"""' tripledoublequotestringchars? (nextline samedent tripledoublequotestringchars?)* '"""'
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // regexchars =
  //   | (!(newline | '/') .)+ // TODO
  // regexliteral =
  //   | '/' regexchars? '/'
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // booleanliteral =
  //   | 'true'
  //   | 'false'
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // singlelinecommentchars =
  //   | (!(newline) .)+ // TODO
  //   { token }

  // singlelinecomment =
  //   | "#" singlelinecommentchars? &(newline | eoi)
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // multilinecommentchars =
  //   | (!('#=' | '=#') .)+ // TODO
  //   { token }

  // innermultilinecomment =
  //   | "#=" multilinecommentchars? (innermultilinecomment multilinecommentchars?)* '=#'
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }

  // multilinecomment =
  //   | "#=" multilinecommentchars? (innermultilinecomment multilinecommentchars?)* '=#' _? &(newline | eoi)
  //   { token, kind, startLine, stopLine, startColumn, stopColumn }
  static lex() {
    // ...
    print('test')
  }
}

module.exports = Lexer;
