const { print } = require('../utils');

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
  
  or() {
    const { func } = this;
    // Chain new function with existing function.
    this.func = s => func(s).or();
    return this;
  }
}

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
    this.startPos = -1;
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
      // Check if the end of input string has been reached.
      if (this.lastPos === string.length - 1) this.exhausted = true;
      return true;
    }
    return false;
  }

  // Call appropriate functions depending on whether `this.failed` is true.
  callFunctions(successFunc, failFunc, doFunc) {
    if (!this.failed) { // Token match isn't a failure.
      let output = null;
      // Calling `successFunc` or `this.successFunc` if they exist.
      if (successFunc) output = successFunc(this);
      else if (this.successFunc) output = this.successFunc(this);
      this.successOutput.push(output);
    } else { // Token match failed.
      let output = null;
      // Calling `failFunc` or `this.failFunc` if they exist.
      if (failFunc) output = failFunc(this);
      else if (this.failFunc) output = this.failFunc(this);
      this.failedOutput.push(output);
    }
    let output = null;
    // Calling `doFunc` or `this.doFunc` if they exist.
    if (doFunc) output = doFunc(this);
    else if (this.doFunc) output = this.doFunc(this);
    this.doOutput.push(output);
  }

  // Where `test` is a Func, `test` function is called.
  // Where `test` is a string, `test` is matched against `this.string` starting from `lastPos + 1`.
  one(test, successFunc, failFunc, doFunc) {
    const { done, failed } = this;
    if (done || failed) return this;
    if (test instanceof Func) { // If `test` is a Func, i.e. a subrule.
      // Grab existing rules, exhausted, positions and outputs.
      const {
        rules, 
        startPos, 
        lastPos, 
        successOutput, 
        failedOutput, 
        doOutput,
        exhausted,
      } = this; 
      this.rules = []; // Then erase rules before passing to function.
      // Make current token position the starting point of subrule, so that if the subrule has alternative rules
      // and if one fails, matching is restartad from that point.
      this.startPos = lastPos;
      // Give outputs in `this` clones so operations on them don't affect original outputs.
      this.successOutput = Object.assign([], successOutput);
      this.failedOutput = Object.assign([], failedOutput);
      this.doOutput = Object.assign([], doOutput);
      // Call the function with modified this.
      const result = test.func(this, successFunc, failFunc, doFunc);
      rules.push(`(${result.rules.join(' ')})`); // Join the subset rules and add to existing rules.
      result.rules = rules; // Now pass the new modified rules back.
      print('... ' + this.startPos);
      result.startPos = startPos; // And set the start position to original start position.
      // Ensure last position is reverted if subrule fails.
      // For example, if subrule, `one('ab').one('cd')`, fails at `one('cd')`, but last position is not reverted.
      // `one('ab')` will remain consumed even though the subrule failed.
      if (result.failed) {
        result.lastPos = lastPos;
        // Also the outputs need to be reverted. 
        this.successOutput = successOutput;
        this.failedOutput = failedOutput;
        this.doOutput = doOutput;
        // If exhausted is true, it needs to be set to false back.
        this.exhausted = exhausted;
        // And call the functions again to signify a single fail call.
        this.callFunctions(successFunc, failFunc, doFunc);
      }
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
      this.callFunctions(successFunc, failFunc, doFunc);
      return this;
    }
    throw TypeError('Expected type of first argument to be String|Function!');
  }

  or() {
    const { failed, exhausted } = this;
    if (failed || !exhausted) { // If previous rules failed or input string not exhausted.
      // // Set failed to true for callFunctions.
      // this.failed = true;
      // this.callFunctions();
      // Reset failed and exhausted in preparation for next rule.
      this.failed = false;
      this.exhausted = false;
      // Revert last position also.
      this.lastPos = this.startPos;
    } else if (!failed && exhausted) { // If input string has been exhausted and nothing failed, we are good.
      this.done = true;
    }
    this.rules.push('|'); // Add current '|' to rules.
    return this;
  }

  // Where `test` is a Func, `test` function is called.
  // Where `test` is a string, `test` is matched against `this.string` starting from `lastPos + 1`.
  many(test, successFunc, failFunc, doFunc) {
    const { done, failed  } = this;
    if (done || failed) return this;

    // Keep existing rule list.
    const { rules } = this;
    this.rules = []; // Set new rules to emoty array.

    let matchCount = 0;
    while (!this.one(test, successFunc, failFunc, doFunc).failed && !this.exhausted) {
      matchCount += 1;
    }

    if (matchCount > 0) {
      this.matchedToken = test; // Set current matched token to `test`.
      this.failed = false; // Parsing didn't fail.
      // There will be a final failed match, the result will be in failedOutput and doOutput. Remove that.
      this.failedOutput.pop();
      this.doOutput.pop();
    } else {
      this.matchedToken = null; // Set current matched token to null.
      this.failed = true; // Parsing failed.
    }

    // Push new subrule in existing rule list.
    rules.push(`${this.rules[0]}+`);
    this.rules = rules;

    return this;
  }
}

// Create ...
const use = (string, successFunc, failFunc, doFunc) =>
  new Parser(string, successFunc, failFunc, doFunc);

// Create ...
const one = (test, successFunc, failFunc, doFunc) =>
  new Func(s => s.one(test, successFunc, failFunc, doFunc));

// Create ...
const many = (test, successFunc, failFunc, doFunc) =>
  new Func(s => s.many(test, successFunc, failFunc, doFunc));

// Create ...
const opt = (test, successFunc, failFunc, doFunc) =>
  new Func(s => s.opt(test, successFunc, failFunc, doFunc));

// Create ...
const optmany = (test, successFunc, failFunc, doFunc) =>
  new Func(s => s.optmany(test, successFunc, failFunc, doFunc));

module.exports = {
  use,
  one,
  many,
  opt,
  optmany,
};

// TEST
/* eslint-disable no-param-reassign */
const show = (s) => {
  print(s.testToken + " " + s.lastPos);
  return s.testToken;
};

const idShow = (m) => {
  return (s) => {
    print(m + ": " + s.testToken + " " + s.lastPos);
    return s.testToken;
  }
};

const showRule = (s) => {
  print(s.rules);
  return s.testToken;
};

const signal = (s) => {
  print("I'm here");
  return s.testToken
};

const cleanSuccessUp = (s) => {
  s.successOutput = [];
  print(s.testToken + " " + s.lastPos);
  return s.testToken;
};

/* eslint-disable newline-per-chained-call, max-len */
const result =
//  use('helloboomx', show, null, show).one(one('hella').or().one('hello').one('bmx')).or().one('helloboomx'); 
//  use('helloboomx', show, show, show).one(one('hella').or().one('helloboomx')); 
//  use(code, show, show, show).one('hello').one('hello').one('hello').one(one('boom').or().one('boom').one('ma', signal, signal)).or().one('hellohellohelloboommaboom');
  use('hellohellohelloboommaboom', idShow('succ'), idShow('fail'), idShow('do')).one('hello').many('hello').many(one('boom').or().one('boom').one('ma')).or().one('hellohellohelloboommaboom');

// use('hellobabebadoo', show, show, show).one(one('hello', null, null, cleanSuccessUp).one('babe')).one('badoo').one('yes').or().one('hellobabebado').or().one('hellobabe').one('badoo');
// const result = use('helloÙ').eatToken('hello');
// const result = use('helloÙ').eatToken('helloÙ');

print(result);
print(result.rules.join(' '));