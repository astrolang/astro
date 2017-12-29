// Example
// import { ... } from 'parser'
// one('a').or(
// one('b').one('c').or(
// more('de')))
//
// one = 1
// opt = ?
// optx = *
// more = +

// import { peek, stepBack } from 'tokenizer'
// class ParserDetail {
//   startPos = 0;
//   done = false;
//   failed = false;
//   currPos = 0;
//   code = code;
// }
const { print } = require('../utils');


// String | Function | RegExp
class Parser {
  constructor(payload) {
    this.payload = payload;
  }

  peek(offset) {
    const { code, curPos } = this.payload;
    if (curPos + offset + 1 > code.length) {
      return { success: false, value: null };
    }
    return { success: true, value: code.slice(curPos + 1, curPos + offset + 1) };
  }

  updatePos(offset) { this.payload.curPos += offset; }

  stepBack(offset) { this.payload.curPos -= offset; }

  // If `a` is a string, it checks if appears `a` in `code` after the current position
  // and consumes it. `a` must appear after current position.
  _(test, successFunc, failFunc) {
    const offset = test.length;
    let token = null;

    const peek = this.peek(offset);
    if (peek.success && peek.value === test) {
      token = peek.value;
      const output = successFunc instanceof Function ? successFunc(this.payload) : null;
      if (output) this.payload.output.push(output);
      this.updatePos(offset);
      return this;
    }
    const output = failFunc instanceof Function ? failFunc(this.payload, token) : null;
    if (output) this.payload.output.push(output);
    return this;
  }

  // If `a` is a string, it checks if a sequence `a` appears in `code` after the current position
  // and consumes it. `a` must appear at least once to pass
  more(test, successFunc, failFunc) {
    const offset = test.length;
    const tokens = [];
    let count = 0;

    let peek = this.peek(offset);
    while (peek.success && peek.value === test) {
      tokens.push(peek.value);
      this.updatePos(offset);
      count += 1;
      peek = this.peek(offset);
    }

    if (count > 0) {
      const output = successFunc instanceof Function ? successFunc(this.payload, tokens) : null;
      if (output) this.payload.output.push(output);
      return this;
    }

    const output = failFunc instanceof Function ? failFunc(this.payload, tokens) : null;
    if (output) this.payload.output.push(output);
    return this;
  }

  // If `a` is a string, it checks if `a` appears in `code` after the current position
  // and consumes it.It passes irrespective of `a` appearing
  opt(test, func) {
    const offset = test.length;
    let token = null;

    const peek = this.peek(offset);
    if (peek.success && peek.value === test) {
      token = peek.value;
      this.updatePos(offset);
    }

    const output = func instanceof Function ? func(this.payload, token) : null;
    if (output) this.payload.output.append(output);
    return this;
  }

  // If `a` is a string, it checks if a sequence `a` appears in `code` after the current position
  // and consumes it. It passes irrespective of `a` appearing
  optmore(test, func) {
    const offset = test.length;
    const tokens = [];

    let peek = this.peek(offset);
    while (peek.success && peek.value === test) {
      tokens.append(peek.value);
      this.updatePos(offset);
      peek = this.peek(offset);
    }

    const output = func instanceof Function ? func(this.payload, tokens) : null;
    if (output) this.payload.output.append(output);
    return this;
  }

  eoi(successFunc, failFunc) {
    if (this.payload.curPos + 1 >= this.payload.code.length) {
      const output = successFunc instanceof Function ? successFunc(this.payload, null) : null;
      if (output) this.payload.output.append(output);
      return this;
    }

    const output = failFunc instanceof Function ? failFunc(this.payload, null) : null;
    if (output) this.payload.output.append(output);
    return this;
  }

  exec(func) {
    const output = func(this.payload) || null;
    if (output) this.payload.output.append(output);
  }

  or(rule) {
    rule(this.payload);
  }
}

const use = (code, curPos, startPos, output) => {
  const payload = {
    code,
    curPos: curPos || -1,
    startPos: startPos || 0,
    failed: false,
    output: output || [],
  };
  return new Parser(payload);
};

/* eslint-disable newline-per-chained-call */
const p = (payload, token) => { payload.output.push(token); };

let result = use('abbb')._('a', p)._('bb', p).opt('b', p).eoi();
print(result);

result = use('abbbb')._('a').more('bb').eoi();
print(result);

module.exports = Parser;
