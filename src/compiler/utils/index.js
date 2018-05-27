/* eslint-disable no-console */
// Refactored, custom version of fast-deep-equal
const equal = (a, b) => {
  const { isArray } = Array;
  const keyList = Object.keys;
  const hasProp = Object.prototype.hasOwnProperty;

  if (a == null || b == null) return a === b;

  if (typeof a === 'object' && typeof b === 'object') {
    // Array
    if (isArray(a) && isArray(b)) {
      const { length } = a;
      if (length !== b.length) return false;
      for (let i = 0; i < length; i += 1) if (!equal(a[i], b[i])) return false;
      return true;
    }

    // Object
    const keys = keyList(a);
    const { length } = keys;

    if (length !== keyList(b).length) return false;

    // Key Check.
    for (let i = 0; i < length; i += 1) {
      if (!hasProp.call(b, keys[i])) {
        return false;
      }
    }

    // Value Check.
    for (let i = 0; i < length; i += 1) {
      const key = keys[i];
      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  return a === b;
};

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
  const start = process.hrtime();
  let elapsed = 0;
  let testCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  let failedTests = [];

  // This lambda contains the actual test.
  const lambda = (message, gotten, expected) => {
    // If no arguments are passed, return information about test calls of this particular lambda.
    if (message === undefined && (gotten === undefined || expected === undefined)) {
      print('Number of Total Tests: ', testCount);
      print('Number of Passed Tests: ', passedCount);
      print('Number of Failed Tests: ', failedCount);
      print('Time taken: ', elapsed, 'ms');
      return { testCount, passedCount, failedCount, elapsed, failedTests };
    }

    if (message === 0) {
      return { testCount, passedCount, failedCount, elapsed, failedTests };
    }

    // `gotten` must be strictly deep-equal to `expected`.
    if (equal(gotten, expected)) {
      print('Test: ', message, '\nTest passed!', '\nExp: ', gotten, '\n');
      // Increment test count state
      testCount += 1;
      passedCount += 1;
      elapsed = process.hrtime(start)[1] * 1e-6;
      return { testCount, passedCount, failedCount, elapsed, failedTests };
    }

    // Otherwise test failed.
    print('Test: ', message, '\nTest failed!', '\nExp: ', expected, '\nGot: ', gotten, '\n');
    // Increment test count state
    failedTests.push({ message, expected, gotten });
    testCount += 1;
    failedCount += 1;
    elapsed = process.hrtime(start)[1] * 1e-6;
    return { testCount, passedCount, failedCount, elapsed, failedTests };
  };

  // The function returns the lambda.
  return lambda;
};

const showTestInfo = (...args) => {
  let testCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  let failedTests = [];
  let elapsed = 0;

  for (let arg of args) {
    let result = arg(0);
    testCount += result.testCount;
    passedCount += result.passedCount;
    failedCount += result.failedCount;
    failedTests.push(...result.failedTests);
    elapsed += result.elapsed;
  }

  if (failedCount > 0) {
    print("******** FAILED TESTS ********")
    for (let failed of failedTests) {
      print('Test: ', failed.message, '\nTest failed!', '\nExp: ', failed.expected, '\nGot: ', failed.gotten, '\n');
    }
  }

  print('Number of Total Tests: ', testCount);
  print('Number of Passed Tests: ', passedCount);
  print('Number of Failed Tests: ', failedCount);
  print('Time taken: ', elapsed, 'ms');

  if (failedCount > 0) process.exit(1);
}

module.exports = {
  print,
  equal,
  createTest,
  showTestInfo,
};
