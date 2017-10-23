// 25/09/17
const peg = require("pegjs");
const fs  = require("fs");

// using print function for convenience
function print(...s) { (s[0] instanceof Array) ? console.log(JSON.stringify(s[0],(k, v)=>v===undefined?null:v,2)) : console.log(...s);  }

// read astro grammar file
const grammar = fs.readFileSync("./astro.pegjs", "utf8");

// generate paser from grammar
const parser = peg.generate(grammar);
print("== Parser Generated Successfully! ==");

// read sample code file
const code = fs.readFileSync("./tempshort.ast", "utf8");

// parse sample code
try {
  const result = parser.parse(code);
  print("== Code Parsed Successfully! ==");
  // print(`result: { \n${result}\n}`);
  print(result);
}
catch (err) {
  print(`Error!: ${err.message}`);
  print(err.location);
}

