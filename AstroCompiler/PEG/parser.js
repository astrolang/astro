// 25/09/17
const peg = require("pegjs");
const path = require("path");
const fs  = require("fs");

// using print function for convenience
function print(...s) { (s[0] instanceof Array || typeof s[0] === 'object' ) ? console.log(JSON.stringify(s[0], null, 2)) : console.log(...s);  }

// read astro grammar file
const grammar = fs.readFileSync(path.join(__dirname, "./astro.pegjs"), "utf8");

try {
  // generate paser from grammar
  const parser = peg.generate(grammar);
  
  print("== Parser Generated Successfully! ==");

  // read sample code file
  const code = fs.readFileSync(path.join(__dirname, "./tempshort.ast"), "utf8");
    
  // parse sample code
  try {
    const result = parser.parse(code);
    print("== Code Parsed Successfully! ==");
    print(result);
  }
  catch (err) {
    print(`Error!: ${err.message}`);
    print(err.location);
  }
}
catch (err) {
  print(`Error!: ${err.message}`);
  print(err.location);
}


