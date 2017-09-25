// 25/09/17
const peg = require("pegjs");
const fs  = require("fs");

let print = (s) => console.log(s);

const grammar = fs.readFileSync("./astro.pegjs", "utf8");

const parser  = peg.generate(grammar);
print("== Parser Tree Generated Successfully! ==");

const code    = fs.readFileSync("./code.ast", "utf8");
parser.parse(code);
print("== Code Parsed Successfully! ==");

