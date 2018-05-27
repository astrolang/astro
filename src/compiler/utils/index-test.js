const { equal, print, createTest } = require('../utils');

const test = createTest();

print('============== EQUAL ==============');
test(
  "equal({ a: 'hello', b: null }, { a: 'hello', b: null })",
  equal({ a: 'hello', b: null }, { a: 'hello', b: null }),
  true,
);

test(
  "equal(['hello', 50], ['hello', 50])",
  equal(['hello', 50], ['hello', 50]),
  true,
);

test(
  "equal(['hello', { a: 50, b: null }], ['hello', { a: 50, b: null }])",
  equal(['hello', { a: 50, b: null }], ['hello', { a: 50, b: null }]),
  true,
);

test(
  'equal(null, null)',
  equal(null, null),
  true,
);

test(
  'equal(null, undefined)',
  equal(null, undefined),
  false,
);

test(
  'equal(undefined, undefined)',
  equal(undefined, undefined),
  true,
);

test(
  'equal(null, {})',
  equal(null, {}),
  false,
);

test(
  'equal(50, 50)',
  equal(50, 50),
  true,
);

test(
  "equal('50', 50)",
  equal('50', 50),
  false,
);

test(
  "equal('50', '50')",
  equal('50', '50'),
  true,
);


print('============== TEST RESULTS ==============');

// Print details of test.
test();

