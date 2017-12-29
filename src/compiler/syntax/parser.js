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
// const { print } = require('../../utils');

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
  one(test, successFunc, failFunc) {
    const offset = test.length;
    const peek = this.peek(offset);
    if (peek.success && peek.value === test) {
      const output = successFunc instanceof Function ? successFunc(this.payload) : null;
      if (output) this.payload.output.append(output);
      this.updatePos(offset);
      return this;
    }
    const output = failFunc instanceof Function ? failFunc(this.payload) : null;
    if (output) this.payload.output.append(output);
    return this;
  }

  // If `a` is a string, it checks if a sequence `a` appears in `code` after the current position
  // and consumes it. `a` must appear at least once to pass
  more(test, successFunc, failFunc) {
    const offset = test.length;
    let count = 0;

    let peek = this.peek(offset);
    while (peek.success && peek.value === test) {
      this.updatePos(offset);
      count += 1;
      peek = this.peek(offset);
    }

    if (count > 0) {
      const output = successFunc instanceof Function ? successFunc(this.payload) : null;
      if (output) this.payload.output.append(output);
      return this;
    }
    const output = failFunc instanceof Function ? failFunc(this.payload) : null;
    if (output) this.payload.output.append(output);
    return this;
  }

  // If `a` is a string, it checks if `a` appears in `code` after the current position
  // and consumes it.It passes irrespective of `a` appearing
  opt(test, func) {
    const offset = test.length;
    const peek = this.peek(offset);
    if (peek.success && peek.value === test) {
      this.updatePos(offset);
    }
    const output = func instanceof Function ? func(this.payload) : null;
    if (output) this.payload.output.append(output);
    return this;
  }

  // If `a` is a string, it checks if a sequence `a` appears in `code` after the current position
  // and consumes it. It passes irrespective of `a` appearing
  optmore(test, func) {
    const offset = test.length;
    let peek = this.peek(offset);
    while (peek.success && peek.value === test) {
      this.updatePos(offset);
      peek = this.peek(offset);
    }
    const output =  func instanceof Function ? func(this.payload) : null;
    if (output) this.payload.output.append(output);
    return this;
  }

  eoi(successFunc, failFunc) {
    if (this.payload.curPos + 1 >= this.payload.code.length) {
      const output = successFunc instanceof Function ? successFunc(this.payload) : null;
      if (output) this.payload.output.append(output);
      return this;
    }
    const output = failFunc instanceof Function ? failFunc(this.payload) : null;
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

const code = (c) => {
  const payload = {
    curPos: -1,
    startPos: 0,
    code: c,
    failed: false,
    output: {},
  };
  return new Parser(payload);
};

/* eslint-disable newline-per-chained-call */
code('abbb').one('a').one('bb').opt('b').eoi();
code('abbbb').one('a').more('bb').eoi();

module.exports = Parser;
