/* eslint-disable no-param-reassign, no-constant-condition, max-len,
no-underscore-dangle, no-use-before-define */
// eslint-disable-next-line no-unused-vars
const { print } = require('../../utils');

/**
 * ### A Custom Packrat Parser Combinator for Astro extended-PEG grammar.
 *
 * #### NOTE:
 * * Directive rules don't return meaningful ast result.
 *   When caching them make sure `isDirective` argument is set to true
 * * Some directive rules do not return an ast and they don't consume tokens. This means even if the
 *   rule fails, it won't advance tokenPosition. So rules like `more(spaces)` will be recursive.
 * * Rules like indent and dedent change certain parser state (i.e. lastIndentCount), ensure that
 *   when using their cached value you update the parser's lastIndentCount.
 * #### TODO:
 * * Parse multilinestring properly
 * * Comments to be removed from parser and lexer. Should be done separately
 * * Handle block end punctuators
 * * Handle macros
 * * Remove line attribute
 * * Remove comments saving
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
    // Caching.
    this.cache = {};
  }

  /**
   * Reverts the state of the lexer object using arguments provided.
   * @param{Number} tokenPosition.
   * @param{Number} lastIndentCount.
   * @param{Number} column.
   * @param{Number} line.
   */
  revert(tokenPosition, lastIndentCount, column, line) {
    this.tokenPosition = tokenPosition;
    this.lastIndentCount = lastIndentCount;
    this.column = column;
    this.line = line;
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
      tokenPosition, lastIndentCount, column, line,
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
      this.revert(tokenPosition, lastIndentCount, column, line);
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

// ************************ GET ****************************
// eslint-disable-next-line no-unused-vars
const get = fn => (parser) => {
  const res = fn(parser);
  print(`get ${fn.name} - ${parser.column} ---> `);
  print(res);
  return res;
};
// ************************ GET ****************************

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
const noName = parser => parseTerminalRule(parser, 'noname');
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
    tokenPosition, lastIndentCount, column, line,
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
    parser.revert(tokenPosition, lastIndentCount, column, line);
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
    tokenPosition, lastIndentCount, column, line,
  } = parser;

  // Parse tokens.
  const parseResult = { success: parse(...arg)(parser).success, directive: true };

  // Revert parser state.
  parser.revert(tokenPosition, lastIndentCount, column, line);

  return parseResult;
};

const not = (...arg) => (parser) => {
  // Get state before parsing.
  const {
    tokenPosition, lastIndentCount, column, line,
  } = parser;

  // Parse tokens.
  const parseResult = { success: !parse(...arg)(parser).success, directive: true };

  // Revert parser state.
  parser.revert(tokenPosition, lastIndentCount, column, line);

  return parseResult;
};

const eoi = (parser) => {
  // Get state before parsing.
  const {
    tokenPosition, lastIndentCount, column, line,
  } = parser;

  // Parse tokens.
  const parseResult = { success: parser.lastReached(), directive: true };

  // Revert parser state.
  parser.revert(tokenPosition, lastIndentCount, column, line);

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

// >>>>> DIRECTIVES >>>>>

// indent =
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

// samedent =
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

// dedent =
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

// nextcodeline =
//   | (spaces? newline)+
const nextCodeLine = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'nextcodeline';
  const result = { success: false, directive: true };
  const parseResult = parse(more(opt(spaces), newline))(parser);

  if (parseResult.success) {
    result.success = true;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, true);

  return result;
};

// linecontinuation =
//   | spaces? '.' nospace '.' nospace '.' spaces? nextcodeline samedent
const lineContinuation = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'linecontinuation';
  const result = { success: false, directive: true };
  const parseResult = parse(
    opt(spaces),
    '.', noSpace, '.', noSpace, '.',
    opt(spaces),
    nextCodeLine,
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

// dedentoreoiend =
//   | nextcodeline dedent
//   | nextcodeline? _? eoi
const dedentOrEoiEnd = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'dedentoreoiend';
  const result = { success: false, directive: true };
  const parseResult = alt(
    parse(nextCodeLine, dedent),
    parse(opt(nextCodeLine), opt(_), eoi),
  )(parser);

  if (parseResult.success) {
    result.success = true;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, true);

  return result;
};

// comma =
//   | _? ',' _? (nextcodeline samedent)?
const comma = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'comma';
  const result = { success: false, directive: true };
  const parseResult = parse(
    opt(_),
    ',',
    opt(_),
    opt(nextCodeLine, samedent),
  )(parser);

  if (parseResult.success) {
    result.success = true;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, true);

  return result;
};

// <<<<< DIRECTIVES <<<<<

// listarguments =
//   | simpleexpression (comma simpleexpression)* comma?
//   { expressions }
// TODO: Refactor: Change numericliteral to simpleexpression and write tests for it.
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
        result.ast.expressions.push(parseResult.ast.ast[1][i][0]);
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
      result.ast.expressions = parseResult.ast.ast[1].expressions;
      if (parseResult.ast.ast[3].length > 0) result.ast.transposed = true;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// dictargument =
//   | simpleexpression _? ':' nextcodeline indent dictarguments nextcodeline dedent !comma
//   | simpleexpression _? ':' _? simpleexpression &(comma | _? '}' | nextcodeline dedent)
//   | identifier &(comma | _? '}' | nextcodeline dedent)
//   { key, value }
// TODO: Refactor: Change numericliteral to simpleexpression and write tests for it.
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
      result.ast.value = { kind: 'dictliteral', expressions: parseResult.ast.ast[4].expressions };

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
      result.ast.expressions = parseResult.ast.ast[1].expressions;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// tuplearguments =
//   | (identifier _? ':' _?)? simpleexpression (comma (identifier _? ':' _?)? simpleexpression)+ comma?
//   | simpleexpression comma
//   { expressions }
// TODO: Refactor: Change numericliteral to simpleexpression and write tests for it.
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
      result.ast.expressions = parseResult.ast.ast[1].expressions;
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
//   | lhspattern _ 'in' _ simpleexpression

// generatorcomprehension =
//   | '(' _? simpleexpression _? '|' _? comprehensionhead (_? ',' _? comprehensionhead)* (_ 'where' _ simpleexpression)?  _? ')'
//   { kind, expression, iterators:[{ lhs, rhs}], guard }

// listcomprehension =
//   | '[' _? simpleexpression _? '|' _? comprehensionhead (_? ',' _? comprehensionhead)* (_ 'where' _ simpleexpression)? _? ']'
//   { kind, expression, iterators:[{ lhs, rhs}], guard }

// dictcomprehension =
//   | '{' _? (simpleexpression _? ':' _? simpleexpression | identifier) _? '|' _? comprehensionhead (_? ',' _? comprehensionhead)* (_ 'where' _ simpleexpression)? _? '}'
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
// TODO: Uncomment comprehesion.
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
//   | (identifier _? ':' _?)? simpleexpression (comma (identifier _? ':' _?)? simpleexpression)* comma?
//   { expressions: [{ key, value }] }
// TODO: Refactor: Change numericliteral to simpleexpression and write tests for it.
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
    result.ast.kind = 'call';

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
      result.ast.arguments = parseResult.ast.ast[3].expressions;
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
    result.ast.kind = 'dot';
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
        result.ast.operators.push({ vectorized, operator: ast[1].ast });
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
      leftExpression: null,
      rightExpression: null,
      expressions: [],
      operators: [],
    },
  };
  const parseResult = parse(
    noSpace, '.', noSpace, '{', opt(_), cascadeNotationArguments, opt(_), '}',
    opt(noSpace, '.', noSpace, and(identifier), atom),
  )(parser);

  if (parseResult.success) {
    result.success = true;
    result.ast.kind = 'cascade';

    result.ast.expressions = parseResult.ast[3].expressions;
    result.ast.operators = parseResult.ast[3].operators;
    if (parseResult.ast[6].length > 1) result.ast.rightExpression = parseResult.ast[6][1];
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
      leftExpression: null,
      rightExpression: null,
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
    result.ast.kind = 'cascade';

    result.ast.expressions = parseResult.ast[2].expressions;
    result.ast.operators = parseResult.ast[2].operators;
    result.ast.rightExpression = parseResult.ast[6];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// indexargument =
//   | (simpleexpression _?)? ':' (_? simpleexpression? _? ':')? _? simpleexpression?
//   | '::' _? simpleexpression? // To prevent prefixatom clash. `::1`
//   | atom _? '::' _? simpleexpression? // To prevent postfixatom and infixatom clash. `1::`
//   | simpleexpression _? '::' _? simpleexpression?
//   | simpleexpression
//   { begin, step, end } | { index }
// TODO: Refactor: Change numericliteral to simpleexpression and write tests for it.
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
    parse('::', opt(_), opt(simpleExpression)), // To prevent prefixatom clash. `::1`
    parse(atom, opt(_), '::', opt(_), opt(simpleExpression)), // To prevent postfixatom and infixatom clash. `1::`
    parse(simpleExpression, opt(_), '::', opt(_), opt(simpleExpression)),
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
      const { ast } = parseResult.ast;

      // Getting the end.
      if (ast[2].length > 0) result.ast.end = ast[2][0];
    // Alternative 3 passed.
    } else if (parseResult.ast.alternative === 3) {
      const { ast } = parseResult.ast;

      // Getting the begin.
      result.ast.begin = ast[0];

      // Getting the end.
      if (ast[4].length > 0) result.ast.end = ast[4][0];
    // Alternative 4 passed.
    } else if (parseResult.ast.alternative === 4) {
      const { ast } = parseResult.ast;

      // Getting the begin.
      result.ast.begin = ast[0];

      // Getting the end.
      if (ast[4].length > 0) result.ast.end = ast[4][0];
    // Alternative 5 passed.
    } else if (parseResult.ast.alternative === 5) {
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
//   { expressions: [{ begin, step, end } | { index }] }
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
    result.ast.kind = 'index';

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      result.ast.arguments = parseResult.ast.ast[2].expressions;
    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      result.ast.arguments = parseResult.ast.ast[1].expressions;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// extendednotation
//   | ':' nospace atom
//   | ':' callpostfix
//   | ':' indexpostfix
//   { kind, expression }
// TODO: Refactor: Change identifier to atom and write tests for it.
const extendedNotation = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'extendednotation';
  const result = { success: false, ast: { kind, expression: null } };
  const parseResult = alt(
    parse(':', noSpace, identifier),
    parse(':', callPostfix),
    parse(':', indexPostfix),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      result.ast.expression = parseResult.ast.ast[1];
    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      result.ast.expression = parseResult.ast.ast[1];
    // Alternative 3 passed.
    } else if (parseResult.ast.alternative === 3) {
      result.ast.expression = parseResult.ast.ast[1];
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// ternaryoperator =
//   | '(' _? simpleexpression _? ')' ('?' | _ '?' _) primitiveexpression ('||' | _ '||' _) primitiveexpression
//   | '(' nextcodeline indent simpleexpression nextcodeline dedent ')' ('?' | _ '?' _) primitiveexpression ('||' | _ '||' _) primitiveexpression
//   { kind, condition, truebody, falsebody }
// TODO: Refactor: Change numericliteral to simpleexpression and write tests for it.
// TODO: Refactor: Change numericliteral to primitiveexpression and write tests for it.
const ternaryOperator = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'ternaryoperator';
  const result = {
    success: false,
    ast: {
      kind, condition: null, truebody: null, falsebody: null,
    },
  };
  const parseResult = alt(
    parse(
      '(', opt(_), numericLiteral, opt(_), ')',
      alt(parse(noSpace, '?', noSpace), parse(_, '?', _)), numericLiteral,
      alt(parse(noSpace, '||', noSpace), parse(_, '||', _)), numericLiteral,
    ),
    parse(
      '(', nextCodeLine, indent, numericLiteral, nextCodeLine, dedent, ')',
      alt(parse(noSpace, '?', noSpace), parse(_, '?', _)), numericLiteral,
      alt(parse(noSpace, '||', noSpace), parse(_, '||', _)), numericLiteral,
    ),
  )(parser);

  if (parseResult.success) {
    result.success = true;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      result.ast.condition = parseResult.ast.ast[2];
      result.ast.truebody = parseResult.ast.ast[6];
      result.ast.falsebody = parseResult.ast.ast[8];
    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      result.ast.condition = parseResult.ast.ast[1];
      result.ast.truebody = parseResult.ast.ast[4];
      result.ast.falsebody = parseResult.ast.ast[6];
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result, false);

  return result;
};

// coefficientexpression = // Unfurl
//   | floatbinaryliteral nospace identifier
//   | floatoctalliteral nospace identifier
//   | floatdecimalliteral nospace identifier
//   | integerbinaryliteral nospace identifier
//   | integeroctalliteral nospace identifier
//   | !('§0b' | '§0o' | '§0x') integerdecimalliteral nospace identifier // Accepts others failed cake, e.g. will parse 0b01 as '0' and 'b01'. Rectified with predicate.
//   | '(' _? simpleexpression _? ')' nospace identifier
//   | '(' nextcodeline indent simpleexpression nextcodeline dedent ')' nospace identifier
//   { kind, coefficient, expression }
// TODO: Refactor: Implementation needs update.
// TODO: Refactor: Change numericliteral to simpleexpression and write tests for it.
// TODO: Add more tests with diverse expressions.
const coefficientExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'coefficientexpression';
  const result = { success: false, ast: { kind, coefficient: null, identifier: null } };
  const parseResult = alt(
    parse(floatBinaryLiteral, noSpace, identifier),
    parse(floatOctalLiteral, noSpace, identifier),
    parse(floatDecimalLiteral, noSpace, identifier),
    parse(integerBinaryLiteral, noSpace, identifier),
    parse(integerOctalLiteral, noSpace, identifier),
    parse(not(alt('§0b', '§0o', '§0x')), integerDecimalLiteral, noSpace, identifier),
    parse('(', opt(_), numericLiteral, opt(_), ')', noSpace, identifier),
    parse('(', nextCodeLine, indent, numericLiteral, nextCodeLine, dedent, ')', noSpace, identifier),
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    if (parseResult.ast.alternative === 7) {
      result.ast.coefficient = parseResult.ast.ast[2];
      result.ast.identifier = parseResult.ast.ast[5];
    } else if (parseResult.ast.alternative === 8) {
      result.ast.coefficient = parseResult.ast.ast[1];
      result.ast.identifier = parseResult.ast.ast[3];
    } else {
      result.ast.coefficient = parseResult.ast.ast[0];
      result.ast.identifier = parseResult.ast.ast[1];
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// returnexpression =
//   | 'return' (_ subexpression)?
//   { kind, expression }
// TODO: Refactor: Change numericliteral to subexpression and write tests for it.
const returnExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'returnexpression';
  const result = { success: false, ast: { kind, expression: null } };
  const parseResult = parse('return', opt(_, numericLiteral))(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    if (parseResult.ast[1].length > 0) result.ast.expression = parseResult.ast[1][0];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// yieldexpression =
//   | 'yield' ((_ 'from')? _ subexpression)?
//   { kind, expression, redirect }
// TODO: Refactor: Change numericliteral to subexpression and write tests for it.
const yieldExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'yieldexpression';
  const result = { success: false, ast: { kind, redirect: false, expression: null } };
  const parseResult = parse('yield', opt(opt(_, 'from'), _, numericLiteral))(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    if (parseResult.ast[1].length > 0) {
      result.ast.expression = parseResult.ast[1][1];
      result.ast.redirect = parseResult.ast[1][0].length > 0;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// raiseexpression =
//   | 'raise' (_ subexpression)?
//   { kind, expression }
// TODO: Refactor: Change numericliteral to subexpression and write tests for it.
const raiseExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'raiseexpression';
  const result = { success: false, ast: { kind, expression: null } };
  const parseResult = parse('raise', opt(_, numericLiteral))(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    if (parseResult.ast[1].length > 0) result.ast.expression = parseResult.ast[1][0];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// continueexpression =
//   | 'continue' (_ '@' nospace identifier)?
//   { kind, label }
const continueExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'continueexpression';
  const result = { success: false, ast: { kind, label: null } };
  const parseResult = parse('continue', opt(_, '@', noSpace, identifier))(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    if (parseResult.ast[1].length > 0) result.ast.label = parseResult.ast[1][1];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// breakexpression =
//   | 'break' (_ subexpression)?  (_ '@' nospace identifier)?
//   { kind, expression, label }
// TODO: Refactor: Change numericliteral to subexpression and write tests for it.
const breakExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'breakexpression';
  const result = { success: false, ast: { kind, label: null, expression: null } };
  const parseResult = parse('break', opt(_, numericLiteral), opt(_, '@', noSpace, identifier))(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    if (parseResult.ast[1].length > 0) result.ast.expression = parseResult.ast[1][0];
    if (parseResult.ast[2].length > 0) result.ast.label = parseResult.ast[2][1];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// fallthroughexpression =
//   | 'fallthrough' (_ '@' nospace identifier)?
//   { kind, label }
const fallthroughExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'fallthroughexpression';
  const result = { success: false, ast: { kind, label: null } };
  const parseResult = parse('fallthrough', opt(_, '@', noSpace, identifier))(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    if (parseResult.ast[1].length > 0) result.ast.label = parseResult.ast[1][1];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// controlprimitive =
//   | returnexpression
//   | yieldexpression
//   | continueexpression
//   | breakexpression
//   | raiseexpression
//   | fallthroughexpression
const controlPrimitive = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'controlprimitive';
  const result = { success: false, ast: { kind } };
  const parseResult = alt(
    returnExpression,
    yieldExpression,
    continueExpression,
    breakExpression,
    raiseExpression,
    fallthroughExpression,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// subatompostfix =
//   | callpostfix
//   | dotnotationpostfix
//   | indexpostfix
const subAtomPostfix = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'subatompostfix';
  const result = { success: false, ast: { kind } };
  const parseResult = alt(
    callPostfix,
    dotNotationPostfix,
    indexPostfix,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// subatom =
//   | coefficientexpression
//   | extendednotation
//   | '(' _? simpleexpression _? ')'
//   | '(' nextcodeline indent simpleexpression nextcodeline dedent ')'
//   | literal
//   | noname
//   | identifier
//   | operator
// TODO: Refactor: Change numericliteral to simpleexpression and write tests for it.
const subAtom = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'subatom';
  const result = { success: false, ast: { kind } };
  const parseResult = alt(
    coefficientExpression,
    extendedNotation,
    parse('(', opt(_), numericLiteral, opt(_), ')'),
    parse('(', nextCodeLine, indent, numericLiteral, nextCodeLine, dedent, ')'),
    literal,
    noName,
    identifier,
    operator,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;

    // Alternative 3 or 4 passed.
    if (parseResult.ast.alternative === 3) {
      result.ast = parseResult.ast.ast[2];
    } else if (parseResult.ast.alternative === 4) {
      result.ast = parseResult.ast.ast[1];
    } else {
      result.ast = parseResult.ast.ast;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// atom =
//   | subatom subatompostfix* cascadenotationpostfix? (nospace '?')?
//   | cascadenotationprefix
const atom = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'atom';
  const result = { success: false, ast: { kind } };
  const parseResult = alt(
    parse(subAtom, optmore(subAtomPostfix), opt(cascadeNotationPostfix), opt(noSpace, '?')),
    parse(cascadeNotationPrefix, opt(noSpace, '?')),
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      let expression = null;

      // Get the subatom.
      expression = parseResult.ast.ast[0];

      // Check for more subatompostfix.
      const morePostfix = parseResult.ast.ast[1];
      for (let i = 0; i < morePostfix.length; i += 1) {
        // Get the postfix.
        const postfix = morePostfix[i][0];

        // Add existing expression to the postfix.
        postfix.expression = expression;

        // Assign the updated postfix to expression.
        expression = postfix;
      }

      // Check for cascade postfix.
      const cascade = parseResult.ast.ast[2];
      if (cascade.length > 0) {
        // Add existing expression to the cascade.
        cascade[0].leftExpression = expression;

        // Assign the updated postfix to expression.
        expression = cascade[0];
      }

      // Check for nil operator.
      if (parseResult.ast.ast[3].length > 0) {
        result.ast = { kind: 'nillable', expression };
      } else {
        result.ast = expression;
      }
    // Alternative 2 passed.
    } else if (parseResult.ast.alternative === 2) {
      const expression = parseResult.ast.ast[0];

      // Check for nil operator.
      if (parseResult.ast.ast[1].length > 0) {
        result.ast = { kind: 'nillable', expression };
      } else {
        result.ast = expression;
      }
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// prefixatom =
//   | operator nospace atom
//   { kind, vectorized, operator, expression }
const prefixAtom = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'prefixatom';
  const result = {
    success: false,
    ast: {
      kind, vectorized: false, operator: null, expression: null,
    },
  };
  const parseResult = parse(operator, noSpace, atom)(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast.operator = parseResult.ast[0];
    result.ast.expression = parseResult.ast[1];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// postfixatom =
//   | atom nospace ('.' nospace)? operator
//   { kind, vectorized, operator, expression }
const postfixAtom = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'postfixatom';
  const result = {
    success: false,
    ast: {
      kind, vectorized: false, operator: null, expression: null,
    },
  };
  const parseResult = parse(atom, noSpace, opt('.', noSpace), operator)(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast.expression = parseResult.ast[0];
    if (parseResult.ast[1].length > 0) result.ast.vectorized = true;
    result.ast.operator = parseResult.ast[2];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// prepostfixatom =
//   | prefixatom
//   | postfixatom
//   | atom
const prePostfixAtom = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'prepostfixatom';
  const result = {
    success: false,
    ast: { kind },
  };
  const parseResult = alt(
    prefixAtom,
    postfixAtom,
    atom,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// keywordoperator =
//   | 'is' _ 'not'
//   | 'not' _ 'in'
//   | 'in'
//   | 'mod'
//   | 'is'
//   { kind, value }
const keywordOperator = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'keywordoperator';
  const result = {
    success: false,
    ast: { kind, value: null },
  };
  const parseResult = alt(
    parse('is', _, 'not'),
    parse('not', _, 'in'),
    'in',
    'mod',
    'is',
    'not',
    'and',
    'or',
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;

    if (parseResult.ast.alternative === 1 || parseResult.ast.alternative === 2) {
      const { ast } = parseResult.ast;
      result.ast.value = ast[0] + ast[1];
    } else {
      result.ast.value = parseResult.ast.ast;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// infixexpression =
//   | (prefixatom | atom) nospace ('.' nospace)? operator nospace (infixexpression | prepostfixatom)
//   | prepostfixatom _ (('.' nospace)? operator | keywordoperator) _ (infixexpression | prepostfixatom)
//   { kind, expressions, operators: [{ vectorized, operator }] }
const infixExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'infixexpression';
  const result = {
    success: false,
    ast: { kind, expressions: [], operators: [] },
  };
  const parseResult = alt(
    parse(
      alt(prefixAtom, atom), noSpace, opt('.', noSpace), operator, noSpace,
      alt(infixExpression, prePostfixAtom),
    ),
    parse(
      prePostfixAtom, _, alt(parse(opt('.', noSpace), operator), keywordOperator), _,
      alt(infixExpression, prePostfixAtom),
    ),
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;

    const { ast } = parseResult.ast;

    // Alternative 1 passed.
    if (parseResult.ast.alternative === 1) {
      // Save first expression
      result.ast.expressions.push(ast[0].ast);

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
        result.ast.expressions.push(ast[3].ast);
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
        result.ast.operators.push({ vectorized, operator: ast[1].ast });
      }

      // Saving other expressions and operators
      // Alternative 1 passed.
      if (ast[2].alternative === 1) {
        result.ast.expressions = result.ast.expressions.concat(ast[2].ast.expressions);
        result.ast.operators = result.ast.operators.concat(ast[2].ast.operators);
      // Alternative 2 passed.
      } else if (ast[2].alternative === 2) {
        result.ast.expressions.push(ast[2].ast);
      }
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// spreadexpression =
//   | '.' nospace '.' nospace '.' nospace atom
//   { kind, expression }
const spreadExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'spreadexpression';
  const result = {
    success: false,
    ast: {
      kind, expression: null,
    },
  };
  const parseResult = parse('.', noSpace, '.', noSpace, '.', noSpace, atom)(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast.expression = parseResult.ast[3];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// range =
//   | prepostfixatom (nospace '.' nospace '.' nospace | _ '.' nospace '.' _) (prepostfixatom (nospace '.' nospace '.' nospace | _ '.' nospace '.' _))? prepostfixatom
//   { kind, begin, step, end }
const range = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'range';
  const result = {
    success: false,
    ast: {
      kind, begin: null, step: null, end: null,
    },
  };
  const parseResult = parse(
    prePostfixAtom,
    alt(parse(noSpace, '.', noSpace, '.', noSpace), parse(_, '.', noSpace, '.', _)),
    opt(prePostfixAtom, alt(parse(noSpace, '.', noSpace, '.', noSpace), parse(_, '.', noSpace, '.', _))),
    prePostfixAtom,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast.begin = parseResult.ast[0];
    if (parseResult.ast[2].length > 0) result.ast.step = parseResult.ast[2][0];
    result.ast.end = parseResult.ast[3] || null;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// commandnotationargument =
//   | _
//     &(
//       comprehension |
//       lambdaexpression |
//       ternaryoperator |
//       range |
//       stringliteral |
//       identifier |
//       symbolliteral |
//       numericliteral |
//       regexliteral
//     )
//     simpleexpression
//   { argument }
// TODO: Refactor: Uncomment the commented out expressions and write tests for them.
const commandNotationArgument = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'commandnotationargument';
  const result = {
    success: false,
    ast: {
      kind, argument: null,
    },
  };
  const parseResult = parse(
    _,
    and(alt(
      // comprehension,
      // lambdaExpression,
      ternaryOperator,
      range,
      stringLiteral,
      identifier,
      symbolLiteral,
      numericLiteral,
      regexLiteral,
    )),
    simpleExpression,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast.argument = parseResult.ast[0];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// commandnotation =
//   | !(operator | numericliteral) atom (nopspace '!')? commandnotationargument
//   { kind, expression, mutative, vectorized, arguments: [{ key, value }] }
const commandNotation = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'commandnotationargument';
  const result = {
    success: false,
    ast: {
      kind, expression: null, mutative: false, vectorized: false, arguments: [],
    },
  };
  const parseResult = parse(
    not(alt(operator, numericLiteral)),
    atom,
    opt(noSpace, '!'),
    commandNotationArgument,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast.kind = 'call';
    result.ast.expression = parseResult.ast[0];
    result.ast.mutative = parseResult.ast[1].length > 0;
    result.ast.arguments = [{ key: null, value: parseResult.ast[2].argument }];
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// primitiveexpression =
//   | spreadexpression
//   | range
//   | lambdaexpression
//   | infixexpression
//   | commandnotation
//   | prepostfixatom
const primitiveExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'prepostfixatom';
  const result = {
    success: false,
    ast: { kind },
  };
  const parseResult = alt(
    spreadExpression,
    range,
    // lambdaExpression,
    infixExpression,
    commandNotation,
    prePostfixAtom,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// simpleexpression =
//   | ternaryoperator
//   | primitiveexpression
const simpleExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'simpleexpression';
  const result = {
    success: false,
    ast: { kind },
  };
  const parseResult = alt(
    ternaryOperator,
    primitiveExpression,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// tupleexpression =
//   | simpleexpression (comma simpleexpression)+
//   | simpleexpression
//   { kind, expressions } | simpleexpression.ast
const tupleExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'tupleexpression';
  const result = {
    success: false,
    ast: { kind, expressions: [] },
  };
  const parseResult = alt(
    parse(simpleExpression, more(comma, simpleExpression)),
    simpleExpression,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;

    if (parseResult.ast.alternative === 1) {
      const { ast } = parseResult.ast;

      // Get first simplexpression.
      result.ast.expressions.push(ast[0]);

      // Get the rest
      for (let i = 0; i < ast[1].length; i += 1) {
        result.ast.expressions.push(ast[1][i][0]);
      }
    } else {
      result.ast = parseResult.ast.ast;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// dotnotationline =
//   | '.' nospace identifier subatompostfix*
//   { postfixes }
const dotNotationLine = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'dotnotationline';
  const result = {
    success: false,
    ast: { postfixes: [] },
  };
  const parseResult = parse(
    '.', noSpace, identifier,
    optmore(subAtomPostfix),
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;

    // Get the first postfix.
    result.ast.postfixes.push({
      kind: 'dot',
      expression: null,
      name: parseResult.ast[1],
    });

    // Check for more subatompostfix.
    const morePostfix = parseResult.ast[2];
    for (let i = 0; i < morePostfix.length; i += 1) {
      // Get the postfix.
      result.ast.postfixes.push(morePostfix[i][0]);
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// dotnotationblock =
//   | atom nextcodeline indent dotnotationline (nextcodeline samedent dotnotationline)*  cascadenotationpostfix? (nospace '?')? dedentoreoiend
//   { kind, expression }
const dotNotationBlock = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'dotnotationblock';
  const result = { success: false, ast: { kind } };
  const parseResult = parse(
    atom, nextCodeLine, indent, dotNotationLine,
    optmore(nextCodeLine, samedent, dotNotationLine),
    opt(cascadeNotationPostfix), opt(noSpace, '?'),
    dedentOrEoiEnd,
  )(parser);

  // [0:{atom}, 1:{dot}, 2:[[0:{dot}], [], ..], 3:[], 4:[] ]
  // Function for merging expressions in dotnotationline
  const merge = (headExpression, postfixes) => {
    let expression = headExpression;

    // Check for more postfixes.
    for (let i = 0; i < postfixes.length; i += 1) {
      // Get the postfix
      const postfix = postfixes[i];

      // Add existing expression to the postfix.
      postfix.expression = expression;

      // Assign the updated postfix to expression.
      expression = postfix;
    }

    return expression;
  };

  if (parseResult.success) {
    result.success = parseResult.success;

    // Get head expression
    let expression = parseResult.ast[0];

    // Get first dotnotationline
    let line = parseResult.ast[1];
    expression = merge(expression, line.postfixes, line.cascade);

    // Get the other dotnotationline.
    for (let i = 0; i < parseResult.ast[2].length; i += 1) {
      line = parseResult.ast[2][i][0];
      expression = merge(expression, line.postfixes, line.cascade);
    }

    // Check for cascade postfix.
    const cascade = parseResult.ast[3];
    if (cascade.length > 0) {
      // Add existing expression to the cascade.
      cascade[0].leftExpression = expression;

      // Assign the updated postfix to expression.
      expression = cascade[0];
    }

    // Check for nil operator at the end.
    if (parseResult.ast[4].length > 0) {
      result.ast = { kind: 'nillable', expression };
    } else {
      result.ast = expression;
    }
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// subexpression =
//   | dotnotationblock
//   | declaration
//   | conditionalexpression
//   | controlprimitive
//   | tupleexpression
// TODO: Refactor: Uncomment the commented out expressions and write tests for them.
const subExpression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'subexpression';
  const result = {
    success: false,
    ast: { kind },
  };
  const parseResult = alt(
    dotNotationBlock,
    // declaration,
    // conditionalExpression,
    controlPrimitive,
    tupleExpression,
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;
    result.ast = parseResult.ast.ast;
  }

  // Cache parse result if not already cached.
  parser.cacheRule(kind, tokenPosition, parseResult, result);

  return result;
};

// expression =
//   | subexpression ((nextcodeline samedent | _? ';' _?) subexpression)* (nextcodeline samedent | _? ';')?
//   { kind, expressions }
const expression = (parser) => {
  const { tokenPosition } = parser;
  const kind = 'expression';
  const result = {
    success: false,
    ast: { kind, expressions: [] },
  };
  const parseResult = parse(
    subExpression,
    optmore(alt(parse(nextCodeLine, samedent), parse(opt(_), ';', opt(_))), subExpression),
    opt(alt(parse(nextCodeLine, samedent), parse(opt(_), ';'))),
  )(parser);

  if (parseResult.success) {
    result.success = parseResult.success;

    // Get first subexpresion.
    result.ast.expressions.push(parseResult.ast[0]);

    // Get remaining subexpressions
    for (let i = 0; i < parseResult.ast[1].length; i += 1) {
      result.ast.expressions.push(parseResult.ast[1][i][1]);
    }
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
  noName,
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
  integerLiteral,
  floatLiteral,
  numericLiteral,
  stringLiteral,
  indent,
  samedent,
  dedent,
  spaces,
  noSpace,
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
  extendedNotation,
  ternaryOperator,
  coefficientExpression,
  returnExpression,
  yieldExpression,
  raiseExpression,
  continueExpression,
  breakExpression,
  fallthroughExpression,
  controlPrimitive,
  subAtomPostfix,
  subAtom,
  atom,
  prefixAtom,
  postfixAtom,
  prePostfixAtom,
  keywordOperator,
  infixExpression,
  spreadExpression,
  range,
  commandNotationArgument,
  commandNotation,
  primitiveExpression,
  simpleExpression,
  tupleExpression,
  dotNotationLine,
  dotNotationBlock,
  subExpression,
  expression,
};
