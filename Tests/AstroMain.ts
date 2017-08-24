import fs = require('fs');
import {Lexer}   from "../AstroCompiler/AstroLexer"
import {Parser}  from "../AstroCompiler/AstroParser"
import {Utility} from "../AstroCompiler/AstroUtility"

let fileName1 = './test1.ast';
let fileName2 = './test2.ast';
let fileName3 = './test3.ast';
let fileName4 = './test4.ast';
let fileNameP = './parser_test1.ast';

fs.readFile(fileNameP, function (err, data) {
    if (err) { return console.error(err); }
    let tokens = new Lexer().lex(data.toString());
    Utility.printTokens(tokens);
    let asts = new Parser().parse(tokens);
    // Utility.printAsts(asts);
});
