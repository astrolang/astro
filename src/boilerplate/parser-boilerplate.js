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

// For rules with indent.
parseDictBlock() {
  // Keep original state.
  const {
    lastPosition, column, line, ignoreNewline,
  } = this;

  // Ignore ignorenewline from outer scope, this rule may contain indentation.
  this.ignoreNewline = false;

  const type = 'dictliteral';
  let expressions = [];
  let parseData = { success: false, message: { type, parser: this }, ast: null };

  (() => {
    // Consume nextcodeline.
    if (!this.parseNextCodeLine().success) return null;

    // Consume indent.
    if (!this.parseIndent().success) return null;

    // Update parseData.
    parseData = { success: true, message: null, ast: null };

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

//------------------------------------

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

//------------------------------------

// Optional-multiple parsing. (nextline samedent charsnonewlineortriplesinglequote?)*
while (true) {
  let parseSuccessful = false;
  const state = { lastPosition: this.lastPosition, line: this.line, column: this.column };
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
    this.reset(state.lastPosition, null, null, state.column, state.line);
    break;
  }
}

//------------------------------------

// Optional parsing. ('e' '.')?
let optionalParseSuccessful = false;
const state2 = { lastPosition: this.lastPosition, line: this.line, column: this.column };
(() => {
  // Consume 'e'.
  if (!this.parseToken('e').success) return;
  token.push('e');

  // Consume '.'.
  if (!this.parseToken('.').success) return;
  token.push('.');

  // This optional was parsed successfully.
  optionalParseSuccessful = true;
})();

// If parsing the above optional fails, revert state to what it was before that parsing began.
if (!optionalParseSuccessful) {
  this.reset(state2.lastPosition, null, null, state2.column, state2.line);
}


//------------------------------------

// Alternate parsing.
// | floatbinaryliteral identifier
// | floatoctalliteral identifier
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

// Check if any of the alternatives was parsed successfully
if (!alternativeParseSuccessful) return null;

//------------------------------------

// Check &(newline | eoi).
const state = { lastPosition: this.lastPosition, column: this.column, line: this.line };
if (!this.parseNewline().success && !this.parseNewline().success) return null;
this.reset(state.lastPosition, null, null, state.column, state.line);

//------------------------------------

// Check &(_comma | nextcodeline samedent).
const state2 = { lastPosition: this.lastPosition, column: this.column, line: this.line };
if (!this.parse_Comma().success) {
  if (!this.parseNextCodeLine().success) return;
  if (!this.parseSamedent().success) return;
}
this.reset(state2.lastPosition, null, null, state2.column, state2.line);
