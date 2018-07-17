/* eslint-disable no-param-reassign, no-constant-condition, max-len,
no-underscore-dangle, no-use-before-define */
// eslint-disable-next-line no-unused-vars
const { print } = require('../../utils');

/**
 * A Custom Packrat Parser Combinator for Astro extended-PEG grammar.
 *
 * NOTE:
 * * Directive rules don't return meaningful ast result.
 * * Some directive rules do not return an ast and they don't consume tokens. This means even if the
 *   rule fails, it won't advance tokenPosition. So rules like `more(spaces)` will be recursive.
 * * Rules like indent and dedent change certain parser state (i.e. lastIndentCount), ensure that
 *   when using their cached value you update the parser's lastIndentCount.
 * TODO:
 * * Parse multilinestring properly
 * * Remove ignoreNewline
 * * Comments to be removed from parser and lexer. Should be done separately
 * * Handle block end punctuators
 * * Handle macros
 * * Remove line attribute
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
   * Checks if parser has already reached last token.
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
  updateState(skip = 1) {
    // If skip is zero, then no change occured.
    if (skip > 0) {
      this.tokenPosition += skip;
      this.column = this.tokens[this.tokenPosition].stopColumn;
      this.line = this.tokens[this.tokenPosition].stopLine;
    }
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
      this.updateState();
    }

    return result;
  }

  /**
   * Compares the starting characters or the entire token with argument string.
   * @param{String} str.
   * @return{{ success: Boolean, token: String }} result.
   */
  eatTokenStart(str) {
    const { tokenPosition } = this;
    let result = { success: false, token: null };

    if (!this.lastReached() && this.tokens[tokenPosition + 1].token.startsWith(str)) {
      result = { success: true, token: str };
      // Update parser positional information.
      this.updateState();
    }

    return result;
  }

  /**
   * Parses string and function arguments passed to it.
   * @param{...*} args - string and rules/intermediate functions to parse.
   * @return{{ success: Boolean, ast: Array }} result
   */
  parse(...args) {
    // Get state before parsing.
    const {
      tokenPosition, lastIndentCount, column, line, ignoreNewline,
    } = this;

    const result = { success: true, ast: [] };

    // Parse each argument.
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];

      // Function.
      if (typeof (arg) === 'function') {
        const argName = arg.name.toLowerCase();
        // Check if rule has already been cached for that position.
        // This will apply to rules only, since intermediates, parse, opt, etc. won't be cached.
        if (this.cache[this.tokenPosition] && this.cache[this.tokenPosition][argName]) {
          const parseResult = this.cache[this.tokenPosition][argName];

          // If cached rule result shows failed attempt.
          if (!parseResult.success) {
            result.success = false;
            break;

          // Otherwise skip forward.
          } else {
            if (!parseResult.directive) {
              result.ast.push(parseResult.ast);
            }

            // If the rule indent or dedent, update parser.lastIndentCount.
            if (argName === 'dedent' || argName === 'indent') {
              this.lastIndentCount = parseResult.indentCount;
            }

            this.updateState(this.cache[this.tokenPosition][argName].skip);
          }

        // If rule isn't already cached or if it is not a rule but an intermediate.
        } else {
          // Run the function.
          const parseResult = arg(this);

          // Parsing fails.
          if (!parseResult.success) {
            result.success = false;
            break;

          // Parsing succeeds.
          } else if (!parseResult.directive) {
            // Rules, alts and opt return "ast" key, parse, more and ooptmore return "ast" key.
            result.ast.push(parseResult.ast);
          }
        }

      // String.
      } else if (typeof (arg) === 'string') {
        let parseResult = null;

        if (arg[0] === '§') {
          // Compare start of token.
          parseResult = this.eatTokenStart(arg.slice(1));
        } else {
          // Compare token.
          parseResult = this.eatToken(arg);
        }

        // Parsing failed.
        if (!parseResult.success) {
          result.success = false;
          break;
        } else {
          result.ast.push(parseResult.token);
        }

      // None of the above.
      } else throw new TypeError('Got the wrong argument type');
    }

    // Revert state if parsing wasn't successful.
    if (!result.success) {
      result.ast = [];
      this.revert(tokenPosition, lastIndentCount, column, line, ignoreNewline);
    }

    return result;
  }

  /**
   * Stores result of parse in cache if it does not already exist.
   * Also stores result in lastParseData for error recovery purpose.
   * @param{String} kind - name of rule.
   * @param{Number} tokenPosition - start position of rule.
   * @param{{ success: Boolean, ast: Object, skip: Number }} result - result of parse.
   * @param{Boolean} isDirective - true for rules that don't return meaningful ast results.
   */
  cacheRule(kind, tokenPosition, parseResult, result, isDirective) {
    // If that tokenPosition doesn't already exist in the cache.
    if (!this.cache[tokenPosition]) {
      this.cache[tokenPosition] = {};
      this.cache[tokenPosition][kind] = {
        success: result.success,
        ast: result.ast,
        skip: this.tokenPosition - tokenPosition,
        indentCount: result.indentCount,
      };
      // Check if it is a directive
      if (isDirective) {
        this.cache[tokenPosition][kind].directive = true;
      }
    // If tokenPosition exists in the cache, but the rule doesn't exist for the position.
    } else if (!this.cache[tokenPosition][kind]) {
      this.cache[tokenPosition][kind] = {
        success: result.success,
        ast: result.ast,
        skip: this.tokenPosition - tokenPosition,
        indentCount: result.indentCount,
      };
      // Check if it is a directive
      if (isDirective) {
        this.cache[tokenPosition][kind].directive = true;
      }
    }

    // Also save necessary in lastParseData
    this.lastParseData = {
      kind, tokenPosition, parseResult, result,
    };
  }
}

const parseTerminalRule = (parser, kind) => {
  const { tokenPosition } = parser;
  let result = { success: false, ast: { kind } };

  if (!parser.lastReached() && parser.tokens[tokenPosition + 1].kind === kind) {
    result = { success: true, ast: { kind, value: parser.tokens[tokenPosition + 1].token } };
    // Update parser positional information.
    parser.updateState();
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, result, result);

  return result;
};

const newline = parser => parseTerminalRule(parser, 'newline');
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
// TODO: Proper multiLineStringLiteral parsing
const multiLineStringLiteral = parser => parseTerminalRule(parser, 'multilinestringliteral');
const booleanLiteral = parser => parseTerminalRule(parser, 'booleanliteral');
const regexLiteral = parser => parseTerminalRule(parser, 'regexliteral');
const singleLineComment = parser => parseTerminalRule(parser, 'singlelinecomment');
// TODO: Proper multiLineComment parsing. Mutilinecomment should also be inilineable
const multiLineComment = parser => parseTerminalRule(parser, 'multilinecomment');

/**
 * Redirects to parser.parse.
 * @param{...*} args - string and rules/intermediate functions to parse.
 * @return{{ success: Boolean, ast: Array }} result
 */
const parse = (...args) => parser => parser.parse(...args);

/**
 * Tries all alternatives parse functions, it returns successful if any
 * of the alternatives parse successfully.
 * @param{...*} args - string and rules/intermediate functions to parse.
 * @return{ { success: Boolean, ast: { alternative: Boolean, ast: Object } } } result
 */
const alt = (...args) => (parser) => {
  // Get state before parsing.
  const {
    tokenPosition, lastIndentCount, column, line, ignoreNewline,
  } = parser;

  const result = { success: false, ast: { alternative: 0, ast: {} } };

  // Parse each argument.
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    // Function.
    if (typeof (arg) === 'function') {
      const argName = arg.name.toLowerCase();
      // Check if rule has already been cached for that position.
      // This will apply to rules only, since intermediates, parse, opt, etc. won't be cached.
      if (parser.cache[parser.tokenPosition] && parser.cache[parser.tokenPosition][argName]) {
        const parseResult = parser.cache[parser.tokenPosition][argName];

        // If cached rule result shows success.
        if (parseResult.success) {
          // Move the parser forward.
          parser.updateState(parser.cache[parser.tokenPosition][argName].skip);
          result.success = true;
          result.ast.alternative = i + 1;

          if (!parseResult.directive) {
            result.ast.ast = parseResult.ast;
          }

          // If the rule indent or dedent, update parser.lastIndentCount.
          if (argName === 'dedent' || argName === 'indent') {
            parser.lastIndentCount = parseResult.indentCount;
          }

          break;
        }
      // If rule isn't already cached or if it is not a rule but an intermediate.
      } else {
        // Run the function.
        const parseResult = arg(parser);

        // Parsing succeeds.
        if (parseResult.success) {
          result.success = true;
          result.ast.alternative = i + 1;

          // If the parser function is not a directive like `and`, `not`, etc.
          if (!parseResult.directive) {
            // Rules, alts and opt return "ast" key, parse, more and ooptmore return "ast" key.
            result.ast.ast = parseResult.ast;
          }

          break;
        }
      }

    // String.
    } else if (typeof (arg) === 'string') {
      let parseResult = null;

      if (arg[0] === '§') {
        // Compare start of token.
        parseResult = parser.eatTokenStart(arg.slice(1));
      } else {
        // Compare token.
        parseResult = parser.eatToken(arg);
      }

      // Parsing succeeds.
      if (parseResult.success) {
        result.success = true;
        result.ast.alternative = i + 1;

        result.ast.ast = parseResult.token;

        break;
      }

    // None of the above.
    } else {
      throw new TypeError('Got the wrong argument type');
    }
  }

  // Revert state if parsing wasn't successful.
  if (!result.success) {
    parser.revert(tokenPosition, lastIndentCount, column, line, ignoreNewline);
  }

  return result;
};

// CAUTION: Some directive rules don't consume tokens, so they don't advance tokenPosition and if
// not careful you may end up with an infinite loop if you do sth like more(spaces)
const more = (...arg) => (parser) => {
  const result = { success: false, ast: [] };

  while (true) {
    const parseResult = parse(...arg)(parser);

    // Parsing failed.
    if (!parseResult.success) {
      break;
    } else {
      result.success = true;
      if (!parseResult.directive) {
        // Check if parseResult contains just a string.
        if (parseResult.ast.length === 1 && typeof (parseResult.ast[0]) === 'string') {
          result.ast.push(parseResult.ast[0]);
        } else {
          result.ast.push(parseResult.ast);
        }
      }
    }
  }

  return result;
};

// CAUTION: Some directive rules don't consume tokens, so they don't advance tokenPosition and if
// not careful you may end up with an infinite loop if you do sth like optmore(spaces)
const optmore = (...arg) => parser => ({ success: true, ast: more(...arg)(parser).ast });

const opt = (...arg) => parser => ({ success: true, ast: parse(...arg)(parser).ast });

const and = (...arg) => (parser) => {
  // Get state before parsing.
  const {
    tokenPosition, lastIndentCount, column, line, ignoreNewline,
  } = parser;

  // Parse tokens.
  const parseResult = { success: parse(...arg)(parser).success, directive: true };

  // Revert parser state.
  parser.revert(tokenPosition, lastIndentCount, column, line, ignoreNewline);

  return parseResult;
};

const not = (...arg) => (parser) => {
  // Get state before parsing.
  const {
    tokenPosition, lastIndentCount, column, line, ignoreNewline,
  } = parser;

  // Parse tokens.
  const parseResult = { success: !parse(...arg)(parser).success, directive: true };

  // Revert parser state.
  parser.revert(tokenPosition, lastIndentCount, column, line, ignoreNewline);

  return parseResult;
};

const eoi = (parser) => {
  // Get state before parsing.
  const {
    tokenPosition, lastIndentCount, column, line, ignoreNewline,
  } = parser;

  // Parse tokens.
  const parseResult = { success: parser.lastReached(), directive: true };

  // Revert parser state.
  parser.revert(tokenPosition, lastIndentCount, column, line, ignoreNewline);

  return parseResult;
};

/* ---------------  ASTRO PARSE FUNCTIONS ---------------------- */

// integerliteral =
//   | integerbinaryliteral
//   | integeroctalliteral
//   | integerhexadecimalliteral
//   | integerdecimalliteral // Can eat others cake
//   { kind, value }
const integerLiteral = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'integerliteral';
  const result = { success: false, ast: { kind } };
  const parseResult = alt(
    integerBinaryLiteral,
    integerOctalLiteral,
    integerHexadecimalLiteral,
    integerDecimalLiteral,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// floatliteral =
//   | floatliteralnomantissa
//   | floatbinaryliteral
//   | floatoctalliteral
//   | floathexadecimalliteral
//   | floatdecimalliteral // Can eat others cake
//   { kind, value }
const floatLiteral = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'floatliteral';
  const result = { success: false, ast: { kind } };

  const parseResult = alt(
    floatLiteralNoMantissa,
    floatBinaryLiteral,
    floatOctalLiteral,
    floatHexadecimalLiteral,
    floatDecimalLiteral,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// numericliteral =
//   | floatliteral
//   | integerliteral  // Can eat others cake
//   { kind, value }
const numericLiteral = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'numericliteral';
  const result = { success: false, ast: { kind } };
  const parseResult = alt(
    floatLiteral,
    integerLiteral,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// stringliteral =
//   | multilinestringliteral
//   | singlelinestringliteral // Can eat others cake
//   { kind, value }
const stringLiteral = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'stringliteral';
  const result = { success: false, ast: { kind } };
  const parseResult = alt(
    multiLineStringLiteral,
    singleLineStringLiteral,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// comment =
//   | multilinecomment
//   | singlelinecomment // Accepts others failed cake. Rectified with predicate.
//   { kind, value }
const comment = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'comment';
  const result = { success: false, ast: { kind } };
  const parseResult = alt(
    multiLineComment,
    singleLineComment,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// >>>>> DIRECTIVES >>>>>

// indent = // TODO. adding !space <- Dunno what this is about. May remove
//   | ' '+
const indent = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'indent';
  const result = { success: false, indentCount: parser.lastIndentCount, directive: true };
  let indentCount = 0;

  let diff = 0;

  // If at the end of token list.
  if (parser.lastReached()) {
  // If at the beginning of token list.
  } else if (tokenPosition === -1) {
    diff = parser.tokens[tokenPosition + 1].startColumn;
  // If in the middle of token list.
  } else {
    const spaceStart = parser.tokens[tokenPosition].stopColumn;
    const spaceEnd = parser.tokens[tokenPosition + 1].startColumn;
    diff = spaceEnd - spaceStart;
  }

  indentCount = diff / 4;

  if (indentCount === parser.lastIndentCount + 1) {
    result.success = true;
    parser.lastIndentCount += 1;
    result.indentCount = parser.lastIndentCount;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, result, result, true);

  return result;
};

// samedent = // TODO. adding !space <- Dunno what this is about. May remove
//   | ' '+
//   | ''
const samedent = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'samedent';
  const result = { success: false, directive: true };
  let indentCount = 0;

  let diff = 0;

  // If at the end of token list.
  if (parser.lastReached()) {
  // If at the beginning of token list.
  } else if (tokenPosition === -1) {
    diff = parser.tokens[tokenPosition + 1].startColumn;
  // If in the middle of token list.
  } else {
    const spaceStart = parser.tokens[tokenPosition].stopColumn;
    const spaceEnd = parser.tokens[tokenPosition + 1].startColumn;
    diff = spaceEnd - spaceStart;
  }

  indentCount = diff / 4;

  if (indentCount === parser.lastIndentCount) {
    result.success = true;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, result, result, true);

  return result;
};

// dedent = // TODO. adding !space <- Dunno what this is about. May remove
//   | ' '+
//   | ''
const dedent = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'dedent';
  const result = { success: false, indentCount: parser.lastIndentCount, directive: true };
  let indentCount = 0;
  let diff = 0;

  // If at the end of token list.
  if (parser.lastReached()) {
  // If at the beginning of token list.
  } else if (tokenPosition === -1) {
    diff = parser.tokens[tokenPosition + 1].startColumn;
  // If in the middle of token list.
  } else {
    const spaceStart = parser.tokens[tokenPosition].stopColumn;
    const spaceEnd = parser.tokens[tokenPosition + 1].startColumn;
    diff = spaceEnd - spaceStart;
  }

  indentCount = diff / 4;

  // NOTE: I did not account for multiple dedents here.
  // if x == y:
  //     if y == z:
  //         print(greeting)
  // <-1 <-2
  // Condition should probably be (indentCount < parser.lastIndentCount)
  if (indentCount === parser.lastIndentCount - 1) {
    result.success = true;
    parser.lastIndentCount -= 1;
    result.indentCount = parser.lastIndentCount;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, result, result, true);

  return result;
};

// spaces =
//   | space+
const spaces = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'spaces';
  const result = { success: false, directive: true };

  let diff = 0;

  // If at the end of token list.
  if (parser.lastReached()) {
  // If at the beginning of token list.
  } else if (tokenPosition === -1) {
    diff = parser.tokens[tokenPosition + 1].startColumn;
  // If in the middle of token list.
  } else {
    const spaceStart = parser.tokens[tokenPosition].stopColumn;
    const spaceEnd = parser.tokens[tokenPosition + 1].startColumn;
    diff = spaceEnd - spaceStart;
  }

  if (diff > 0) {
    result.success = true;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, result, result, true);

  return result;
};

// nospace =
//   | !spaces
const noSpace = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'nospace';
  const result = { success: false, directive: true };

  let diff = 0;

  // If at the end of token list.
  if (parser.lastReached()) {
  // If at the beginning of token list.
  } else if (tokenPosition === -1) {
    diff = parser.tokens[tokenPosition + 1].startColumn;
  // If in the middle of token list.
  } else {
    const spaceStart = parser.tokens[tokenPosition].stopColumn;
    const spaceEnd = parser.tokens[tokenPosition + 1].startColumn;
    diff = spaceEnd - spaceStart;
  }

  if (diff <= 0) {
    result.success = true;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, result, result, true);

  return result;
};

// nextline =
//   | newline (spaces? newline)*
const nextline = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'nextline';
  const result = { success: false, directive: true };
  const parseResult = parse(
    newline,
    optmore(opt(spaces), newline),
  )(parser);

  if (parseResult.success) {
    result.success = true;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, true);

  return result;
};

// NOTE: I deliberately made `linecontinuation` not use nextcodeline. Comments shouldn't be
// captured between '...' and a newline. For example, the following doesn't make too much sense.
// ```astro
// let x = 5 + ...
// #: Integer
// (4 * 5)
// ```
// linecontinuation =
//   | spaces? '.' '.' '.' spaces? nextline samedent
// TODO: Change nextline to nextcodeline and write tests for it.
const lineContinuation = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'linecontinuation';
  const result = { success: false, directive: true };
  const parseResult = parse(
    opt(spaces),
    '.', '.', '.',
    opt(spaces),
    nextline,
    samedent,
  )(parser);

  if (parseResult.success) {
    result.success = true;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, true);

  return result;
};

// _ =
//   | linecontinuation
//   | spaces // Can eat others cake
// TODO: Fix tests.
// TODO: Add inline multiline comment
const _ = (parser) => {
  const { tokenPosition } = parser;
  const kind = '_';
  const result = { success: false, directive: true };
  const parseResult = alt(
    lineContinuation,
    spaces,
  )(parser);

  if (parseResult.success) {
    result.success = true;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, true);

  return result;
};

// <<<<< DIRECTIVES <<<<<

// nextcodeline =
//   | spaces? nextline (samedent comment (nextline | eoi))*
//   { kind, comments }
// TODO: Change spaces? to _? and write tests for it.
const nextCodeLine = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'nextcodeline';
  const result = { success: false, ast: { kind } };
  const parseResult = parse(
    opt(spaces),
    nextline,
    optmore(
      samedent,
      comment,
      alt(newline, eoi),
    ),
  )(parser);

  if (parseResult.success) {
    result.success = true;
    const comments = [];

    // Check if optmore returned a non-empty array
    if (parseResult.ast[1].length > 0) {
      const optmoreArr = parseResult.ast[1];
      for (let i = 0; i < optmoreArr.length; i += 1) {
        comments.push(optmoreArr[i][0]);
      }
    }

    result.ast = { kind, comments };
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// dedentoreoiend =
//   | nextcodeline dedent
//   | nextcodeline? _? eoi
//   { kind, comments }
const dedentOrEoiEnd = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'dedentoreoiend';
  const result = { success: false, ast: { kind, comments: [] } };
  const parseResult = alt(
    parse(nextCodeLine, dedent),
    parse(opt(nextCodeLine), opt(_), eoi),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    if (parseResult.ast.alternative === 1) {
      result.ast.comments = parseResult.ast.ast[0].comments;
    } else if (parseResult.ast.ast[0].length > 0) {
      result.ast.comments = parseResult.ast.ast[0][0].comments;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// comma =
//   | _? ',' _? (nextline samedent)?
// Change nextline to nextcodeline and write tests for it.
const comma = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'comma';
  const result = { success: false, directive: true };
  const parseResult = parse(
    opt(_),
    ',',
    opt(_),
    opt(nextline, samedent),
  )(parser);

  if (parseResult.success) {
    result.success = true;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, true);

  return result;
};

// listarguments =
//   | primitiveexpression (comma primitiveexpression)* comma?
//   { expressions }
// TODO: Refactor: Change numericliteral to primitiveexpression and write tests for it.
// TODO: Add more tests with diverse expressions.
const listArguments = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'listarguments';
  const result = { success: false, ast: { expressions: [] } };
  const parseResult = parse(
    numericLiteral,
    optmore(comma, numericLiteral),
    opt(comma),
  )(parser);

  if (parseResult.success) {
    result.success = true;
    result.ast.expressions.push(parseResult.ast[0]);

    for (let i = 0; i < parseResult.ast[1].length; i += 1) {
      result.ast.expressions.push(parseResult.ast[1][i][0]);
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// listargumentsmultiple =
//   | listliteral (nextcodeline samedent listliteral)+
//   | listarguments (_? ';' _? listarguments)* (_? ';' _?)?
//   { expressions }
// TODO: Add more tests with diverse expressions.
const listArgumentsMultiple = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'listargumentsmultiple';
  const result = { success: false, ast: { expressions: [] } };
  const parseResult = alt(
    parse(listLiteral, more(nextCodeLine, samedent, listLiteral)),
    parse(listArguments, optmore(opt(_), ';', opt(_), listArguments), opt(opt(_), ';', opt(_))),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      result.ast.expressions.push(parseResult.ast.ast[0]);

      for (let i = 0; i < parseResult.ast.ast[1].length; i += 1) {
        result.ast.expressions.push(parseResult.ast.ast[1][i][1]);
      }

    // Alternative 2 passed.
    } else {
      // Checking if there is more listarguments
      if (parseResult.ast.ast[1].length > 0) {
        result.ast.expressions.push({ kind: 'listliteral', expressions: parseResult.ast.ast[0].expressions });
      } else {
        result.ast.expressions = parseResult.ast.ast[0].expressions;
      }

      for (let i = 0; i < parseResult.ast.ast[1].length; i += 1) {
        result.ast.expressions.push({ kind: 'listliteral', expressions: parseResult.ast.ast[1][i][3].expressions });
      }
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// listliteral =
//   | '[' _? ']' '\''?
//   | '[' _? listargumentsmultiple _? ']' '\''?
//   | '[' nextcodeline indent listargumentsmultiple nextcodeline dedent ']' '\''?
//   { kind, transposed, expressions }
// TODO: Add more tests with diverse expressions.
const listLiteral = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'listliteral';
  const result = { success: false, ast: { kind, transposed: false, expressions: [] } };
  const parseResult = alt(
    parse('[', opt(_), ']', opt('\'')),
    parse('[', opt(_), listArgumentsMultiple, opt(_), ']', opt('\'')),
    parse('[', nextCodeLine, indent, listArgumentsMultiple, nextCodeLine, dedent, ']', opt('\'')),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      if (parseResult.ast.ast[3].length > 0) result.ast.transposed = true;

    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      result.ast.expressions = parseResult.ast.ast[2].expressions;
      if (parseResult.ast.ast[5].length > 0) result.ast.transposed = true;

    // Alternative 3 passed.
    } else {
      result.ast.expressions = parseResult.ast.ast[2].expressions;
      if (parseResult.ast.ast[5].length > 0) result.ast.transposed = true;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// dictargument =
//   | primitiveexpression _? ':' nextcodeline indent dictarguments nextcodeline dedent !comma
//   | primitiveexpression _? ':' _? primitiveexpression &(comma | _? '}' | nextcodeline dedent)
//   | identifier &(comma | _? '}' | nextcodeline dedent)
//   { key, value }
// TODO: Refactor: Change numericliteral to primitiveexpression and write tests for it.
// TODO: Add more tests with diverse expressions.
const dictArgument = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'dictargument';
  const result = { success: false, ast: { key: null, value: null } };
  const parseResult = alt(
    parse(numericLiteral, opt(_), ':', opt(_), nextCodeLine, indent, dictArguments, nextCodeLine, dedent, not(comma)),
    parse(numericLiteral, opt(_), ':', opt(_), numericLiteral, and(alt(
      parse(nextCodeLine, dedent),
      parse(opt(_), '}'),
      comma,
    ))),
    parse(identifier, and(alt(
      parse(nextCodeLine, dedent),
      parse(opt(_), '}'),
      comma,
    ))),
  )(parser);


  if (parseResult.success) {
    result.success = true;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      result.ast.key = parseResult.ast.ast[0];
      result.ast.value = { kind: 'dictliteral', expressions: parseResult.ast.ast[5].expressions };

    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      result.ast.key = parseResult.ast.ast[0];
      result.ast.value = parseResult.ast.ast[4];

    // Alternative 5 passed.
    } else {
      result.ast.key = parseResult.ast.ast[0];
      result.ast.value = parseResult.ast.ast[0];
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// dictarguments =
//   | dictargument (comma? dictargument)* comma?
//   { expressions: [{ key, value }] }
// TODO: Add more tests with diverse expressions.
const dictArguments = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'dictarguments';
  const result = { success: false, ast: { expressions: [] } };
  const parseResult = parse(
    dictArgument,
    optmore(opt(comma), dictArgument),
    opt(comma),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Push first argument.
    result.ast.expressions.push(parseResult.ast[0]);

    // Push remaining arguments if they exist.
    for (let i = 0; i < parseResult.ast[1].length; i += 1) {
      result.ast.expressions.push(parseResult.ast[1][i][1]);
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// dictliteral =
//   | '{' _? '}'
//   | '{' _? dictarguments _? '}'
//   | '{' nextcodeline indent dictarguments nextcodeline dedent '}'
//   { kind, expressions: [{ key, value }] }
// TODO: Add more tests with diverse expressions.
const dictLiteral = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'dictliteral';
  const result = { success: false, ast: { kind, expressions: [] } };
  const parseResult = alt(
    parse('{', opt(_), '}'),
    parse('{', opt(_), dictArguments, opt(_), '}'),
    parse('{', nextCodeLine, indent, dictArguments, nextCodeLine, dedent, '}'),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Alternative 2 passed.
    if (parseResult.ast.alternative === 2) {
      result.ast.expressions = parseResult.ast.ast[2].expressions;

    // Alternative 3 passed.
    } else if (parseResult.ast.alternative === 3) {
      result.ast.expressions = parseResult.ast.ast[2].expressions;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// tuplearguments =
//   | (identifier _? ':' _?)? primitiveexpression (comma (identifier _? ':' _?)? primitiveexpression)+ comma?
//   | primitiveexpression comma
//   { expressions }
// TODO: Refactor: Change numericliteral to primitiveexpression and write tests for it.
// TODO: Add more tests with diverse expressions.
const tupleArguments = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'tuplearguments';
  const result = { success: false, ast: { expressions: [] } };
  const parseResult = alt(
    parse(
      opt(identifier, opt(_), ':', opt(_)),
      numericLiteral,
      more(comma, opt(identifier, opt(_), ':', opt(_)), numericLiteral),
      opt(comma),
    ),
    parse(numericLiteral, comma),
  )(parser);

  if (parseResult.success) {
    result.success = true;
    let key = null;
    let value = null;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      // Get first key-value pair.
      key = parseResult.ast.ast[0][0] || null;
      value = parseResult.ast.ast[1];
      result.ast.expressions.push({ key, value });

      // If there are more, save them as well.
      for (let i = 0; i < parseResult.ast.ast[2].length; i += 1) {
        key = parseResult.ast.ast[2][i][0][0] || null;
        value = parseResult.ast.ast[2][i][1];
        result.ast.expressions.push({ key, value });
      }
    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      value = parseResult.ast.ast[0];
      result.ast.expressions.push({ key, value });
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// tupleliteral =
//   | '(' _? ')'
//   | '(' _? tuplearguments _? ')'
//   | '(' nextcodeline indent tuplearguments nextcodeline dedent ')'
//   { kind, expressions }
const tupleLiteral = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'tupleliteral';
  const result = { success: false, ast: { kind, expressions: [] } };
  const parseResult = alt(
    parse('(', opt(_), ')'),
    parse('(', opt(_), tupleArguments, opt(_), ')'),
    parse('(', nextCodeLine, indent, tupleArguments, nextCodeLine, dedent, ')'),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Alternative 2 passed.
    if (parseResult.ast.alternative === 2) {
      result.ast.expressions = parseResult.ast.ast[2].expressions;

    // Alternative 3 passed.
    } else if (parseResult.ast.alternative === 3) {
      result.ast.expressions = parseResult.ast.ast[2].expressions;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// symbolliteral =
//   | '$' nospace identifier
//   | '$' nospace '{' _? expression _? '}'
//   | '$' nospace '{' block '}'
//   { kind, expression }
// TODO: Refactor: Change numericliteral to expression and write tests for it.
// TODO: Refactor: Change numericliteral to block and write tests for it.
// TODO: Add more tests with diverse expressions.
const symbolLiteral = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'symbolliteral';
  const result = { success: false, ast: { kind, expression: {} } };
  const parseResult = alt(
    parse('$', noSpace, identifier),
    parse('$', noSpace, '{', opt(_), numericLiteral, opt(_), '}'),
    parse('$', noSpace, '{', numericLiteral, '}'),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      result.ast.expression = parseResult.ast.ast[1];

    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      result.ast.expression = parseResult.ast.ast[3];

    // Alternative 3 passed.
    } else if (parseResult.ast.alternative === 3) {
      result.ast.expression = parseResult.ast.ast[2];
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// comprehensionhead =
//   | lhspattern _ 'in' _ primitiveexpression

// generatorcomprehension =
//   | '(' _? primitiveexpression _? '|' _? comprehensionhead (_? ',' _? comprehensionhead)* (_ 'where' _ primitiveexpression)?  _? ')'
//   { kind, expression, iterators:[{ lhs, rhs}], guard }

// listcomprehension =
//   | '[' _? primitiveexpression _? '|' _? comprehensionhead (_? ',' _? comprehensionhead)* (_ 'where' _ primitiveexpression)? _? ']'
//   { kind, expression, iterators:[{ lhs, rhs}], guard }

// dictcomprehension =
//   | '{' _? (primitiveexpression _? ':' _? primitiveexpression | identifier) _? '|' _? comprehensionhead (_? ',' _? comprehensionhead)* (_ 'where' _ primitiveexpression)? _? '}'
//   { kind, key, value, iterators:[{ lhs, rhs}], guard }

// comprehension =
//   | generatorcomprehension
//   | listcomprehension
//   | dictcomprehension

// literal =
//   | numericliteral
//   | booleanliteral
//   | stringliteral
//   | regexliteral
//   | listliteral
//   | dictliteral
//   | tupleliteral
//   | symbolliteral
//   | comprehension
// TODO: Add more tests with diverse expressions.
const literal = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'literal';
  const result = { success: false, ast: { kind } };
  const parseResult = alt(
    numericLiteral,
    booleanLiteral,
    stringLiteral,
    regexLiteral,
    listLiteral,
    dictLiteral,
    tupleLiteral,
    symbolLiteral,
    // comprehension,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// callarguments =
//   | (identifier _? ':' _?)? primitiveexpression (comma (identifier _? ':' _?)? primitiveexpression)* comma?
//   { expressions: [{ key, value }] }
// TODO: Refactor: Change numericliteral to primitiveexpression and write tests for it.
const callArguments = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'callarguments';
  const result = { success: false, ast: { expressions: [] } };
  const parseResult = parse(
    opt(identifier, opt(_), ':', opt(_)),
    numericLiteral,
    optmore(comma, opt(identifier, opt(_), ':', opt(_)), numericLiteral),
    opt(comma),
  )(parser);

  if (parseResult.success) {
    result.success = true;
    let key = null;
    let value = null;

    // Get first key-value pair.
    key = parseResult.ast[0][0] || null;
    value = parseResult.ast[1];
    result.ast.expressions.push({ key, value });

    // If there are more, save them as well.
    for (let i = 0; i < parseResult.ast[2].length; i += 1) {
      key = parseResult.ast[2][i][0][0] || null;
      value = parseResult.ast[2][i][1];
      result.ast.expressions.push({ key, value });
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// callpostfix =
//   | nospace ('!' nospace)?  ('.' nospace)? '(' _? ')'
//   | nospace ('!' nospace)?  ('.' nospace)? '(' _? callarguments _? ')'
//   | nospace ('!' nospace)?  ('.' nospace)? '(' nextcodeline indent callarguments nextcodeline dedent ')'
//   { kind, expression, mutative, vectorized, arguments: [{ key, value }] }
const callPostfix = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'callpostfix';
  const result = {
    success: false,
    ast: {
      kind, expression: null, mutative: false, vectorized: false, arguments: [],
    },
  };
  const parseResult = alt(
    parse(noSpace, opt('!', noSpace), opt('.', noSpace), '(', opt(_), ')'),
    parse(noSpace, opt('!', noSpace), opt('.', noSpace), '(', opt(_), callArguments, opt(_), ')'),
    parse(noSpace, opt('!', noSpace), opt('.', noSpace), '(', nextCodeLine, indent, callArguments, nextCodeLine, dedent, ')'),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      if (parseResult.ast.ast[0].length > 0) result.ast.mutative = true;
      if (parseResult.ast.ast[1].length > 0) result.ast.vectorized = true;
    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      if (parseResult.ast.ast[0].length > 0) result.ast.mutative = true;
      if (parseResult.ast.ast[1].length > 0) result.ast.vectorized = true;
      result.ast.arguments = parseResult.ast.ast[4].expressions;
    // Alternative 3 passed.
    } else if (parseResult.ast.alternative === 3) {
      if (parseResult.ast.ast[0].length > 0) result.ast.mutative = true;
      if (parseResult.ast.ast[1].length > 0) result.ast.vectorized = true;
      result.ast.arguments = parseResult.ast.ast[4].expressions;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// dotnotationpostfix =
//   | nospace '.' nospace identifier
//   { kind, expression, name }
const dotNotationPostfix = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'dotnotationpostfix';
  const result = { success: false, ast: { kind, expression: null, name: null } };
  const parseResult = parse(noSpace, '.', noSpace, identifier)(parser);

  if (parseResult.success) {
    result.success = true;
    result.ast.name = parseResult.ast[1];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// cascadenotationarguments =
//   | &(identifier) atom nospace ('.' nospace)?  operator nospace (cascadenotationarguments | &(identifier) atom)
//   | &(identifier) atom _ (('.' nospace)?  operator | keywordoperator) _ (cascadenotationarguments | &(identifier) atom)
//   { expressions, operators }
// TODO: Refactor: Change identifier to atom and write tests for it.
// TODO: Refactor: Change operator to keywordoperator and write tests for it.
const cascadeNotationArguments = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'cascadeNotationArguments';
  const result = {
    success: false,
    ast: {
      expressions: [],
      operators: [],
    },
  };
  const parseResult = alt(
    parse(
      and(identifier), identifier, noSpace, opt('.', noSpace), operator, noSpace,
      alt(cascadeNotationArguments, parse(and(identifier), identifier)),
    ),
    parse(
      and(identifier), identifier, _, alt(parse(opt('.', noSpace), operator), operator), _,
      alt(cascadeNotationArguments, parse(and(identifier), identifier)),
    ),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    const { ast } = parseResult.ast;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      // Save first expression
      result.ast.expressions.push(ast[0]);

      // Save first operator
      const vectorized = ast[1].length > 0;
      result.ast.operators.push({ vectorized, operator: ast[2] });

      // Saving other expressions and operators
      // Alternative 1 passed.
      if (ast[3].alternative === 1) {
        result.ast.expressions = result.ast.expressions.concat(ast[3].ast.expressions);
        result.ast.operators = result.ast.operators.concat(ast[3].ast.operators);
      // Alternative 2 passed.
      } else if (ast[3].alternative === 2) {
        result.ast.expressions.push(ast[3].ast[0]);
      }
    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      // Save first expression
      result.ast.expressions.push(ast[0]);
      let vectorized = false;

      // Saving the first operator.
      // Alternative 1 passed.
      if (ast[1].alternative === 1) {
        vectorized = ast[1].ast[0].length > 0;
        result.ast.operators.push({ vectorized, operator: ast[1].ast[1] });
      // Alternative 2 passed.
      } else if (ast[1].alternative === 2) {
        result.ast.operators.push({ vectorized, operator: ast[1].ast[0] });
      }

      // Saving other expressions and operators
      // Alternative 1 passed.
      if (ast[2].alternative === 1) {
        result.ast.expressions = result.ast.expressions.concat(ast[2].ast.expressions);
        result.ast.operators = result.ast.operators.concat(ast[2].ast.operators);
      // Alternative 2 passed.
      } else if (ast[2].alternative === 2) {
        result.ast.expressions.push(ast[2].ast[0]);
      }
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// cascadenotationpostfix = // Unfurl
//   | nospace '.' nospace '{' _? cascadenotationarguments _? '}' (nospace '.' nospace &(identifier) atom)?
//   { kind, leftexpression, rightexpression, expressions, operators }
// TODO: Refactor: Change identifier to atom and write tests for it.
const cascadeNotationPostfix = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'cascadenotationpostfix';
  const result = {
    success: false,
    ast: {
      kind,
      leftexpression: null,
      rightexpression: null,
      expressions: [],
      operators: [],
    },
  };
  const parseResult = parse(
    noSpace, '.', noSpace, '{', opt(_), cascadeNotationArguments, opt(_), '}',
    opt(noSpace, '.', noSpace, and(identifier), identifier),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    result.ast.expressions = parseResult.ast[3].expressions;
    result.ast.operators = parseResult.ast[3].operators;
    if (parseResult.ast[6].length > 1) result.ast.rightexpression = parseResult.ast[6][1];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// cascadenotationprefix = // Unfurl
//   | '{' _? cascadenotationarguments _? '}' nospace '.' nospace &(identifier) atom
//   { kind, leftexpression, rightexpression, expressions, operators }
// TODO: Refactor: Change identifier to atom and write tests for it.
const cascadeNotationPrefix = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'cascadenotationprefix';
  const result = {
    success: false,
    ast: {
      kind,
      leftexpression: null,
      rightexpression: null,
      expressions: [],
      operators: [],
    },
  };
  const parseResult = parse(
    '{', opt(_), cascadeNotationArguments, opt(_), '}',
    noSpace, '.', noSpace, and(identifier), identifier,
  )(parser);

  if (parseResult.success) {
    result.success = true;

    result.ast.expressions = parseResult.ast[2].expressions;
    result.ast.operators = parseResult.ast[2].operators;
    result.ast.rightexpression = parseResult.ast[6];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// indexargument =
//   | (primitiveexpression _?)? ':' (_? primitiveexpression? _? ':')? _? primitiveexpression?
//   | primitiveexpression
//   { begin, step, end } | { index }
// TODO: Refactor: Change numericliteral to primitiveexpression and write tests for it.
const indexArgument = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'indexargument';
  const result = {
    success: false,
    ast: {
      begin: null,
      step: null,
      end: null,
    },
  };
  const parseResult = alt(
    parse(
      opt(numericLiteral, opt(_)), ':', opt(opt(_), opt(numericLiteral), opt(_), ':'),
      opt(opt(_), numericLiteral),
    ),
    numericLiteral,
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      const { ast } = parseResult.ast;

      // Getting the begin.
      if (ast[0].length > 0) result.ast.begin = ast[0][0];

      // Getting the step.
      if (ast[2].length > 0 && ast[2][1].length > 0) result.ast.step = ast[2][1][0];

      // Getting the end.
      if (ast[3].length > 0) result.ast.end = ast[3][1];
    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      // Getting the index.
      result.ast = { index: parseResult.ast.ast };
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// indexarguments =
//   | indexargument (comma indexargument)* comma?
//   { expressions: [ { begin, step, end } | { index }] }
const indexArguments = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'indexarguments';
  const result = { success: false, ast: { expressions: [] } };
  const parseResult = parse(
    indexArgument,
    optmore(comma, indexArgument),
    opt(comma),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Get first indexargument.
    result.ast.expressions.push(parseResult.ast[0]);

    // If there are more, save them as well.
    for (let i = 0; i < parseResult.ast[1].length; i += 1) {
      result.ast.expressions.push(parseResult.ast[1][i][0]);
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// indexpostfix =
//   | nospace '[' _? indexarguments _? ']'
//   | nospace '[' nextcodeline indent indexarguments nextcodeline dedent ']'
//   { kind, expression, arguments: [{ key, value }] }
const indexPostfix = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'indexpostfix';
  const result = { success: false, ast: { kind, arguments: [] } };
  const parseResult = alt(
    parse(noSpace, '[', opt(_), indexArguments, opt(_), ']'),
    parse(noSpace, '[', nextCodeLine, indent, indexArguments, nextCodeLine, dedent, ']'),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      result.ast.arguments = parseResult.ast.ast[2].expressions;
    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      result.ast.arguments = parseResult.ast.ast[2].expressions;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// coefficientexpression = // Unfurl
//   | floatbinaryliteral identifier
//   | floatoctalliteral identifier
//   | floatdecimalliteral identifier
//   | integerbinaryliteral identifier
//   | integeroctalliteral identifier
//   | !('§0b' | '§0o' | '§0x') integerdecimalliteral identifier // Accepts others failed cake, e.g. will parse 0b01 as '0' and 'b01'. Rectified with predicate.
//   | '(' _? simpleexpression _? ')' identifier
//   | '(' nextcodeline indent simpleexpression nextcodeline dedent ')' identifier
//   { kind, coefficient, expression }
// TODO: Refactor: Implementation needs update.
// TODO: Refactor: Change numericliteral to simpleexpression and write tests for it.
// TODO: Add more tests with diverse expressions.
const coefficientExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'coefficientexpression';
  const result = { success: false, ast: { kind } };
  const parseResult = alt(
    parse(floatBinaryLiteral, identifier),
    parse(floatOctalLiteral, identifier),
    parse(floatDecimalLiteral, identifier),
    parse(integerBinaryLiteral, identifier),
    parse(integerOctalLiteral, identifier),
    parse(not(alt('§0b', '§0o', '§0x')), integerDecimalLiteral, identifier),
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    const coefficient = parseResult.ast.ast[0];
    const ident = parseResult.ast.ast[1];
    result.ast = { kind, coefficient, identifier: ident };
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

module.exports = {
  Parser,
  parse,
  alt,
  optmore,
  more,
  opt,
  and,
  not,
  eoi,
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
  multiLineStringLiteral,
  booleanLiteral,
  regexLiteral,
  singleLineComment,
  multiLineComment,
  integerLiteral,
  floatLiteral,
  numericLiteral,
  stringLiteral,
  coefficientExpression,
  comment,
  indent,
  samedent,
  dedent,
  spaces,
  noSpace,
  nextline,
  lineContinuation,
  _,
  nextCodeLine,
  dedentOrEoiEnd,
  comma,
  listArguments,
  listArgumentsMultiple,
  listLiteral,
  dictArgument,
  dictArguments,
  dictLiteral,
  tupleArguments,
  tupleLiteral,
  symbolLiteral,
  // comprehensionHead,
  // generatorComprehension,
  // listComprehension,
  // dictComprehension,
  // comprehension,
  literal,
  callArguments,
  callPostfix,
  dotNotationPostfix,
  cascadeNotationArguments,
  cascadeNotationPostfix,
  cascadeNotationPrefix,
  indexArgument,
  indexArguments,
  indexPostfix,
  // extendedNotation,
  // ternaryOperator,
  // coefficientExpression,
  // returnExpression,
  // yieldExpression,
  // raiseExpression,
  // continueExpression,
  // breakExpression,
  // spillExpression,
  // controlPrimitive,
  // controlKeyword,
};
