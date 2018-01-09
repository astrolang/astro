const { print } = require('../utils');

class Parser {
  constructor(string, successFunc, failFunc, doFunc) {
    this.string = string;
    this.successFunc = successFunc;
    this.failFunc = failFunc;
    this.doFunc = doFunc;
    this.rules = [];
    this.testToken = null;
    this.matchedToken = null;
    this.successOutput = [];
    this.failedOutput = [];
    this.doOutput = [];
    // Important states
    this.lastPos = -1;
    this.startPos = 0;
    this.failed = false;
    this.done = false;
    this.exhausted = false;
  }

  // Starting from `this.lastPos + 1`, matches `token` against subsequent chars in input string.
  eatToken(token) {
    const count = token.length;
    const { string, lastPos } = this;
    // Check if `token` equals content in input string starting from `lastPos + 1`.
    if (string.slice(lastPos + 1, lastPos + count + 1) === token) {
      this.lastPos = lastPos + count; // Update last position.
      if (this.lastPos === string.length - 1) this.exhausted = true; // Check if the end of input string has been reached.
      return true;
    }
    return false;
  }

  // Call appropriate functions depending on whether `this.failed` is true.
  callFunctions(self, successFunc, failFunc, doFunc) {
    if (!self.failed) { // Token match isn't a failure.
      let output = null;
      // Calling `successFunc` or `this.successFunc` if they exist.
      if (successFunc) output = successFunc(self);
      else if (this.successFunc) output = this.successFunc(self);
      self.successOutput.push(output);
    } else { // Token match failed.
      let output = null;
      // Calling `failFunc` or `this.failFunc` if they exist.
      if (failFunc) output = failFunc(self);
      else if (this.failFunc) output = this.failFunc(self);
      self.failedOutput.push(output);
    }
    let output = null;
    // Calling `doFunc` or `this.doFunc` if they exist.
    if (doFunc) output = doFunc(self);
    else if (this.doFunc) output = this.doFunc(self);
    self.doOutput.push(output);
  }

  // Where `test` is a function, `test` is called.
  // Where `test` is a string, `test` is matched against `this.string` starting from `lastPos + 1`.
  one(test, successFunc, failFunc, doFunc) {
    const { done, failed } = this;
    if (done || failed) return this;
    if (test instanceof Func) { // If test is of Func type.
      const { rules, startPos, lastPos } = this; // Grab existing rules, startPos and lastPos.
      this.rules = []; // Then erase rules before passing to function.
      this.startPos = lastPos; // Make current token position the starting point of subrule.
      let result = test.func(this, successFunc, failFunc, doFunc); // Call the function with modified this.
      rules.push(`(${result.rules.join(' ')})`); // Join the subset rules and add to existing rules.
      result.rules = rules; // Now pass the new modified rules back.
      result.startPos = startPos; // And set the start position to original start position.
      return result;
    } else if (typeof (test) === 'string') { // If test is a string.
      this.testToken = test; // Set current test token.
      if (this.eatToken(test)) { // Token matches.
        this.matchedToken = test; // Set current matched token to `test`.
      } else { // Token doesn't match.
        this.matchedToken = null; // Set current matched token to null.
        this.failed = true; // Parser failed.
      }
      this.rules.push(`'${test}'`); // Add current rule to rules. 
      // Lastly, call necessary functions. Function to call depends on whether rule failed or not.
      this.callFunctions(this, successFunc, failFunc, doFunc);
      return this;
    }
    throw TypeError('Expected type of first argument to be String|Function!');
  }
  
  or() {
    const { done, failed, exhausted } = this;
    if (failed || !exhausted) { // If previous rules failed or input string not exhausted.
      // Reset failed and exhausted in preparation for next rulez.
      this.failed = false;
      this.exhausted = false;
      // Revert last position also.
      this.lastPos = this.startPos - 1;
    } else if (!failed && exhausted) { // 
      this.done = true;
    }
    return this;
  }

  // Where `test` is a function, `test` is called.
  // Where `test` is a string, `test` is matched against `this.string` starting from `lastPos + 1`.
  many(test, successFunc, failFunc, doFunc) {
    const { done, failed, one } = this;
    if (done || failed) return this;

    let matchCount = 0;
    while (!one(tmatchCountssFunc, failFunc, doFunc).failed) {

    }

    return this;
  }
}

class Func {
  constructor(func) {
    this.func = func;
  }

  one(test, successFunc, failFunc, doFunc) {
    const { func } = this;
    // Chain new function with existing function.
    this.func = s => func(s).one(test, successFunc, failFunc, doFunc);
    return this;
  }
}

// Create ...
const use = (string, successFunc, failFunc, doFunc) =>
  new Parser(string, successFunc, failFunc, doFunc);

// Create ...
const one = (test, successFunc, failFunc, doFunc) =>
  new Func(s => s.one(test, successFunc, failFunc, doFunc));

module.exports = {
  use,
  one,
}

// TEST
const show = (s) => {
  print(s.testToken);
  return s.testToken;
};
const cleanSuccessUp = (s) => {
  s.successOutput = [];
  print(s.testToken);
  return s.testToken;
};

const result = use('hellobabebadoo', show, show, show).one(one('hello', null, null, cleanSuccessUp).one('babe')).one('badoo').one('yes').or().one('hellobabebado').or().one('hellobabe').one('badoo');
// const result = use('helloÙ').eatToken('hello');
// const result = use('helloÙ').eatToken('helloÙ');
print(result);
