const { print } = require('../utils');

class Parser {
  constructor(string, successFunc, failFunc, doFunc) {
    this.string = string;
    this.successFunc = successFunc;
    this.failFunc = failFunc;
    this.doFunc = doFunc;
    this.lastPos = -1;
    this.lastRule = '';
    this.testToken = null;
    this.matchedToken = null;
    this.startPos = 0;
    this.failed = false;
    this.done = false;
    this.exhausted = false;
    this.successOutput = [];
    this.failedOutput = [];
    this.doOutput = [];
  }
  
  // Starting from `this.lastPos + 1`, matches `token` against subsequent chars in `this.string`.
  eatToken(token) {
    const count = token.length;
    const { string, lastPos } = this;
    // Check if `token` equals content in string starting from `lastPos + 1`.
    if (string.slice(lastPos + 1, lastPos + count + 1) === token) {
      this.lastPos = lastPos + count; // Update last position.
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
    
    this.lastRule = `'${test}'`;  // Set `lastRule` to current rule.
    
    if (test instanceof Func) { // If test is of Func type.
      return test.func(this, successFunc, failFunc, doFunc); // Call the function.
    } else if (typeof (test) === 'string') { // If test is a string.
      
      this.testToken = test; // Set current test token.
      if (this.eatToken(test)) { // Token matches.
        this.matchedToken = test; // Set current matched token to `test`.
      } else { // Token doesn't match.
        this.matchedToken = null; // Set current matched token to null.
        this.failed = true; // Parser failed.
      }
      // Call necessary functions. Relies on result of previous token match.
      this.callFunctions(this, successFunc, failFunc, doFunc);
 
    } else {
      throw TypeError('Expected type of first argument to be String|Function!')
    }

    return this;
  }
  
  // Where `test` is a function, `test` is called. 
  // Where `test` is a string, `test` is matched against `this.string` starting from `lastPos + 1`.
  many(test, successFunc, failFunc, doFunc) {
    const { done, failed, one } = this;
    if (done || failed) return this;
  
    let matchCount = 0;  
    while (!one(test, successFunc, failFunc, doFunc).failed) {
    
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
const show = s => { print(s.testToken); return s.testToken; };
const showRule = s => { print(`>>> ${s.lastRule}`); return s.testToken; };
const cleanUp = s => { s.successOutput = []; print(s.testToken); return s.testToken; };

const result = use('hellobabebadoo', null, null, showRule).one(one('hello').one('babe').one('badoo').one('x'));
// const result = use('helloÙ').eatToken('hello');
// const result = use('helloÙ').eatToken('helloÙ');
print(result);