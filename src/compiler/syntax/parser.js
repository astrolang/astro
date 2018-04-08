// eslint-disable-next-line no-unused-vars
const { print } = require('../utils');

/**
 * A Packrat Parser.
 */
class Parser {
  constructor(tokens) {
    // Lexed token list.
    this.tokens = tokens;
    // Parser state information.
    this.lastPosition = -1;
    this.lastParseData = null;
    this.lastIndentCount = 0;
    this.column = 0;
    this.line = 1;
    this.ignoreNewline = false;
  }

  // cached.pos.ruleName = { result: {...}, skipToPosition: 55 };
  // cached.pos.ruleName = undefined;

  // Reverts the state of the lexer object using arguments provided.
  revert(lastPosition, lastIndentCount, column, line, ignoreNewline) {
    this.lastPosition = lastPosition;
    this.lastIndentCount = lastIndentCount;
    this.column = column;
    this.line = line;
    this.ignoreNewline = ignoreNewline;
  }

  // ...
  parse(...args) {
    // Get state before parsing.
    const {
      lastPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    // Array where parsed data is stored.
    let result = [];

    // Parse each argument.
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];

      // Function.
      if (typeof (arg) === 'function') {
        const x = arg();
        if (x) {
          result.push(x);
        } else {
          result = null;
          break;
        }
      // String.
      } else if (typeof (arg) === 'string') {
        const x = this.nextToken();
        if (x && x.token === arg) {
          result.push(x);
        } else {
          result = null;
          break;
        }
      // Object.
      } else if (typeof (arg) === 'object') {
        if (arg) {
          result.push(arg);
        } else {
          result = null;
          break;
        }
      // None of the above.
      } else throw new Error('Got the wrong argument type');
    }
    // Check if parsing failed.
    if (result) return result;
    this.revert(lastPosition, lastIndentCount, column, line, ignoreNewline);
    return null;
  }
}

module.exports = Parser;
