import fs = require('fs');
import {Lexer}   from "../AstroCompiler/AstroLexer"
import {Parser}  from "../AstroCompiler/AstroParser"
import {Utility} from "../AstroCompiler/AstroUtility"

// paths relative to root folder, that's where npm script test starts from.
let fileName1 = 'Tests/test1.ast';
let fileName2 = 'Tests/test2.ast';
let fileName3 = 'Tests/test3.ast';
let fileName4 = 'Tests/test4.ast';
let fileNameP = 'Tests/parser_test1.ast';

fs.readFile(fileNameP, function (err, data) {
    if (err) { return console.error(err); }
    let tokens = new Lexer().lex(data.toString());
    Utility.printTokens(tokens);
    let asts = new Parser().parse(tokens);
    // Utility.printAsts(asts);
});
