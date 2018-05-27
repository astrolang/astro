/* eslint-disable no-param-reassign, no-constant-condition */

/**
 * A Custom Packrat Parser Combinator for Astro extended-PEG grammar.
 *
 * NOTES ON SPECIAL RULES:
 * `IGNORE_NEWLINES` is needed in brackets where the first element isn't indented, it is
 * used to signal that the elements of the bracket are to be parsed as being on a single line.
 */
class Parser {
  constructor(tokens) {
    // Lexed token list.
    this.tokens = tokens;
    // Parser state information.
    this.tokenPosition = -1;
    this.lastParseData = null;
    this.lastIndentCount = 0;
    this.column = 0;
    this.line = 1;
    this.ignoreNewline = false;
    // Caching.
    this.cache = {};
  }

  /**
   * Reverts the state of the lexer object using arguments provided.
   * @param{Number} tokenPosition.
   * @param{Number} lastIndentCount.
   * @param{Number} column.
   * @param{Number} line.
   * @param{Number} ignoreNewline.
   */
  revert(tokenPosition, lastIndentCount, column, line, ignoreNewline) {
    this.tokenPosition = tokenPosition;
    this.lastIndentCount = lastIndentCount;
    this.column = column;
    this.line = line;
    this.ignoreNewline = ignoreNewline;
  }


  /**
   * Checks if parser has reached last token.
   * @return{Boolean} result.
   */
  lastReached() {
    if (this.tokenPosition + 1 >= this.tokens.length) {
      return true;
    }
    return false;
  }

  /**
   * Updates parser positional information.
   * @param{Number} tokenPosition - token position to get update from.
   */
  updateState(tokenPosition) {
    this.tokenPosition += 1;
    this.column = this.tokens[tokenPosition].stopColumn;
    this.line = this.tokens[tokenPosition].stopLine;
  }

  /**
   * Compares the next token with argument string.
   * @param{String} str.
   * @return{{ success: Boolean, token: String }} result.
   */
  eatToken(str) {
    const { tokenPosition } = this;
    let result = { success: false, token: null };

    if (!this.lastReached() && this.tokens[tokenPosition + 1].token === str) {
      result = { success: true, token: str };
      // Update parser positional information.
      this.updateState(tokenPosition + 1);
    }

    return result;
  }

  /**
   * Parses string and function arguments passed to it.
   * @param{...*} args - string and rules/intermediate functions to parse.
   * @return{{ success: Boolean, asts: Array }} result
   */
  parse(...args) {
    // Get state before parsing.
    const {
      tokenPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    const result = { success: true, asts: [] };

    // Parse each argument.
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];

      // Function.
      if (typeof (arg) === 'function') {
        // Check if rule has already been cached for that position.
        // This will apply to rules only, since intermediates, parse, opt, etc. won't be cached.
        if (this.cache[this.tokenPosition] && this.cache[this.tokenPosition][arg.name]) {
          const parseResult = this.cache[this.tokenPosition][arg.name];
          result.asts.push(parseResult.ast);

          // If cached rule result shows failed attempt.
          if (!parseResult.success) {
            result.success = false;
            break;

          // Otherwise skip forward
          } else {
            this.tokenPosition = this.cache[this.tokenPosition].skip;
          }

        // If rule isn't already cached or if it is not a rule but an intermediate.
        } else {
          // Run the function.
          const parseResult = arg(this);

          // Rules, alts and opt return "ast" key, parse, more and ooptmore return "asts" key.
          result.asts.push(parseResult.ast || parseResult.asts);

          // Parsing failed.
          if (!parseResult.success) {
            result.success = false;
            break;
          }
        }

      // String.
      } else if (typeof (arg) === 'string') {
        // Compare token.
        const parseResult = this.eatToken(arg);
        result.asts.push(parseResult.token);

        // Parsing failed.
        if (!parseResult.success) {
          result.success = false;
          break;
        }

      // None of the above.
      } else throw new TypeError('Got the wrong argument type');
    }

    // Update lastParseData.
    this.lastParseData = result;

    // Revert state if parsing wasn't successful.
    if (!result.success) {
      this.revert(tokenPosition, lastIndentCount, column, line, ignoreNewline);
    }

    return result;
  }

  /**
   * Stores result of parse in cache if it does not already exist.
   * @param{String} kind - name of rule.
   * @param{Number} tokenPosition - start position of rule.
   * @param{{ success: Boolean, ast: Object, skip: Number }} result - result of parse.
   */
  cacheRule(kind, tokenPosition, result) {
    // If that tokenPosition doesn't already exist in the cache.
    if (!this.cache[tokenPosition]) {
      this.cache[tokenPosition] = {};
      this.cache[tokenPosition][kind] = {
        success: result.success, ast: result.ast, skip: this.tokenPosition - tokenPosition,
      };
    // If tokenPosition exists in the cache, but the rule doesn't exist for the position.
    } else if (!this.cache[tokenPosition][kind]) {
      this.cache[tokenPosition][kind] = {
        success: result.success, ast: result.ast, skip: this.tokenPosition - tokenPosition,
      };
    }
  }
}

const parseTerminalRule = (parser, kind) => {
  const { tokenPosition } = parser;
  let result = { success: false, kind, ast: null };

  if (!parser.lastReached() && parser.tokens[tokenPosition + 1].kind === kind) {
    result = { success: true, ast: { kind, value: parser.tokens[tokenPosition + 1].token } };
    // Update parser positional information.
    parser.updateState(tokenPosition + 1);
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, result);

  return result;
};

const parseNonTerminalRule = (parser, kind, f, modifier) => {
  const { tokenPosition } = parser;
  let result = { success: false, kind, ast: null };
  let parseResult;

  // Apply modifier function on parse result if it exists.
  if (modifier) {
    parseResult = modifier(f(parser));
  } else {
    parseResult = f(parser);
  }

  // If parse successful.
  if (parseResult.success) {
    // Grab needed asts, etc.
    result = { success: true, ast: { kind, ast: (parseResult.ast || parseResult.asts) } };
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, result);

  return result;
};

const identifier = parser => parseTerminalRule(parser, 'identifier');
const operator = parser => parseTerminalRule(parser, 'operator');
const punctuator = parser => parseTerminalRule(parser, 'punctuator');
const integerBinaryLiteral = parser => parseTerminalRule(parser, 'integerbinaryliteral');
const integerOctalLiteral = parser => parseTerminalRule(parser, 'integeroctalliteral');
const integerHexadecimalLiteral = parser => parseTerminalRule(parser, 'integerhexadecimalliteral');
const integerDecimalLiteral = parser => parseTerminalRule(parser, 'integerdecimalliteral');
const floatBinaryLiteral = parser => parseTerminalRule(parser, 'floatbinaryliteral');
const floatOctalLiteral = parser => parseTerminalRule(parser, 'floatoctalliteral');
const floatHexadecimalLiteral = parser => parseTerminalRule(parser, 'floathexadecimalliteral');
const floatDecimalLiteral = parser => parseTerminalRule(parser, 'floatdecimalliteral');
const floatLiteralNoMantissa = parser => parseTerminalRule(parser, 'floatLiteralnomantissa');
const singleLineStringLiteral = parser => parseTerminalRule(parser, 'singlelinestringliteral');
// TODO: multiLineStringLiteral parsing
const regexLiteral = parser => parseTerminalRule(parser, 'regexliteral');
const singleLineComment = parser => parseTerminalRule(parser, 'singlelinecomment');
// TODO: multiLineComment parsing

/**
 * Redirects to parser.parse.
 * @param{...*} args - string and rules/intermediate functions to parse.
 * @return{{ success: Boolean, asts: Array }} result
 */
const parse = (...args) => parser => parser.parse(...args);

/**
 * Tries all alternatives parse functions, it returns successful if any
 * of the alternatives parse successfully.
 * @param{...*} fns - parse functions.
 * @return{{ success: Boolean, alternative: Number, ast: Object }} result
 */
const alt = (...args) => (parser) => {
  // Get state before parsing.
  const {
    tokenPosition, lastIndentCount, column, line, ignoreNewline,
  } = parser;

  const result = { success: false, alternative: -1, ast: {} };

  // Parse each argument.
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    // Function.
    if (typeof (arg) === 'function') {
      // Check if rule has already been cached for that position.
      // This will apply to rules only, since intermediates, parse, opt, etc. won't be cached.
      if (parser.cache[parser.tokenPosition] && parser.cache[parser.tokenPosition][arg.name]) {
        const parseResult = parser.cache[parser.tokenPosition][arg.name];

        // If cached rule result shows success.
        if (parseResult.success) {
          result.success = true;
          result.alternative = i + 1;
          result.ast = parseResult.ast;
          break;

        // Otherwise skip forward
        } else {
          parser.tokenPosition = parser.cache[parser.tokenPosition].skip;
        }

      // If rule isn't already cached or if it is not a rule but an intermediate.
      } else {
        // Run the function.
        const parseResult = arg(parser);

        // Parsing succeed.
        if (parseResult.success) {
          result.success = true;
          result.alternative = i + 1;
          // Rules, alts and opt return "ast" key, parse, more and ooptmore return "asts" key.
          result.ast = parseResult.ast || parseResult.asts;
          break;
        }
      }

    // String.
    } else if (typeof (arg) === 'string') {
      // Compare token.
      const parseResult = parser.eatToken(arg);

      // Parsing succeed.
      if (parseResult.success) {
        result.success = true;
        result.alternative = i + 1;
        result.ast = parseResult.token;
        break;
      }

    // None of the above.
    } else throw new TypeError('Got the wrong argument type');
  }

  // Update lastParseData.
  parser.lastParseData = result;

  // Revert state if parsing wasn't successful.
  if (!result.success) {
    parser.revert(tokenPosition, lastIndentCount, column, line, ignoreNewline);
  }

  return result;
};

const more = arg => (parser) => {
  const result = { success: false, asts: [] };

  // Parse each argument.
  while (true) {
    // Get state before parsing.
    const {
      tokenPosition, lastIndentCount, column, line, ignoreNewline,
    } = parser;

    // Function.
    if (typeof (arg) === 'function') {
      // Check if rule has already been cached for that position.
      // This will apply to rules only, since intermediates, parse, opt, etc. won't be cached.
      if (parser.cache[parser.tokenPosition] && parser.cache[parser.tokenPosition][arg.name]) {
        const parseResult = parser.cache[parser.tokenPosition][arg.name];

        // If cached rule result shows failed attempt.
        if (!parseResult.success) {
          parser.revert(tokenPosition, lastIndentCount, column, line, ignoreNewline);
          break;

        // Otherwise skip forward
        } else {
          result.success = true;
          result.asts.push(parseResult.ast);
          parser.tokenPosition = parser.cache[parser.tokenPosition].skip;
        }

      // If rule isn't already cached or if it is not a rule but an intermediate.
      } else {
        // Run the function.
        const parseResult = arg(parser);

        // Parsing failed.
        if (!parseResult.success) {
          parser.revert(tokenPosition, lastIndentCount, column, line, ignoreNewline);
          break;
        } else {
          result.success = true;
          // Rules, alts and opt return "ast" key, parse, more and ooptmore return "asts" key.
          result.asts.push(parseResult.ast || parseResult.asts);
        }
      }

    // String.
    } else if (typeof (arg) === 'string') {
      // Compare token.
      const parseResult = parser.eatToken(arg);

      // Parsing failed.
      if (!parseResult.success) {
        parser.revert(tokenPosition, lastIndentCount, column, line, ignoreNewline);
        break;
      } else {
        result.success = true;
        result.asts.push(parseResult.token);
      }

    // None of the above.
    } else throw new TypeError('Got the wrong argument type');
  }

  // Update lastParseData.
  parser.lastParseData = result;

  return result;
};

const optmore = arg => parser => ({ success: true, asts: (more(arg)(parser)).ast });

const opt = arg => parser => ({ success: true, ast: (parse(arg)(parser)).asts[0] });

const and = 0;
const not = 0;

module.exports = {
  Parser,
  parseNonTerminalRule,
  parse,
  alt,
  optmore,
  more,
  opt,
  and,
  not,
  identifier,
  operator,
  punctuator,
  integerBinaryLiteral,
  integerOctalLiteral,
  integerHexadecimalLiteral,
  integerDecimalLiteral,
  floatBinaryLiteral,
  floatOctalLiteral,
  floatHexadecimalLiteral,
  floatDecimalLiteral,
  floatLiteralNoMantissa,
  singleLineStringLiteral,
  // multiLineStringLiteral,
  regexLiteral,
  singleLineComment,
  // multiLineComment,
};
