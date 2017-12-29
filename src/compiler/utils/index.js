/* eslint-disable no-console */
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

// Checks if both the object and its properties are not undefined or null,
// if they are not, it returns the property, otherwise it returns null.
// PEGjs returns null for unmatched rule or terminal.
const safeAccess = (obj, ...prop) => {
  let temp = null;
  if (obj === null || obj === undefined) return null;
  // eslint-disable-next-line no-restricted-syntax
  for (const p of prop) {
    if (obj[p] === null || obj[p] === undefined) return null;
    temp = obj[p];
  }
  return temp;
};

// Removes null or undefined values from an array.
const removeNulls = a => a.filter(x => x != null);

// Strips '_' in a string.
const removeUnderscores = s => s.replace(/_/g, '');

// Stringifies an array and cleans up the resulting commas.
// PEGjs tokenizer output can be an array containing tokens, nulls and empty arrays.
const stringify = a => a.toString().replace(/,/g, '').trim();

// Creates a new array from a and b, where a is a scalar and b is an array
// and where b can be undefined.
const join = (a, b) => {
  if (b !== null && b.length !== 0) return [a, ...b];
  return [a];
};


module.exports = {
  print,
  safeAccess,
  removeNulls,
  removeUnderscores,
  stringify,
  join,
};
