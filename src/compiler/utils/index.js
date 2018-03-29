/* eslint-disable no-console */
const equal = require('deep-equal');

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
const createTest = () => {
  // States to be used by the lambda for count.
  let testCount = 0;
  let passedCount = 0;
  let failedCount = 0;

  // This lambda contains the actual test.
  const lambda = (message, gotten, expected) => {
    // If no arguments are passed, return information about test calls of this particular lambda.
    if (message === undefined || gotten === undefined || expected === undefined) {
      print('Number of Total Tests: ', testCount);
      print('Number of Passed Tests: ', passedCount);
      print('Number of Failed Tests: ', failedCount);
      return { testCount, passedCount, failedCount };
    }

    // `gotten` must be strictly deep-equal `expected`.
    if (equal(gotten, expected, { strict: true })) {
      print('Test: ', message, '\nTest passed!', '\nExp: ', gotten, '\n');
      // Increment test count state
      testCount += 1;
      passedCount += 1;
      return { testCount, passedCount, failedCount };
    }

    // Otherwise test failed.
    print('Test: ', message, '\nTest failed!', '\nExp: ', expected, '\nGot: ', gotten, '\n');
    // Increment test count state
    testCount += 1;
    failedCount += 1;
    return { testCount, passedCount, failedCount };
  };
  // The function returns the lambda.
  return lambda;
};

module.exports = {
  print,
  createTest,
};
