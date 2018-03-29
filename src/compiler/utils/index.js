/* eslint-disable no-console */
const equal = require('fast-deep-equal');

// Stringifies and pretty prints all kinds of values including arrays and objects.
const print = (...s) => {
  if (s.length === 1) {
    if (typeof (s[0]) === 'string') {
      console.log(s[0]);
    } else if (s[0] instanceof Function) {
      console.log(s[0].toString());
    } else {
      console.log(JSON.stringify(s[0], null, 2));
    }
  } else {
    const result = s
      .map(e => (typeof (e) === 'string' ? e : JSON.stringify(e)))
      .join('');
    console.log(result);
  }
};

// This test function is written explicitly for testing the compiler only.
// TODO: Need strict equal implementation.
const test = (gotten, expected) => {
  if (equal(gotten, expected)) {
    print('Test passed!', '\nGot:      ', gotten, '\n');
    return;
  }
  print('Test failed!', '\nExpected: ', expected, '\nGot:      ', gotten, '\n');
};

module.exports = {
  print,
  test,
};
