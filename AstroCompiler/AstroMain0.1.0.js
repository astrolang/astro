"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var AstroLexer0_1_0_1 = require("./AstroLexer0.1.0");
var AstroParser0_1_0_1 = require("./AstroParser0.1.0");
var AstroUtility0_1_0_1 = require("./AstroUtility0.1.0");
var fileName1 = './test1.ast';
var fileName2 = './test2.ast';
var fileName3 = './test3.ast';
var fileName4 = './test4.ast';
fs.readFile(fileName4, function (err, data) {
    if (err) {
        return console.error(err);
    }
    var tokens = new AstroLexer0_1_0_1.Lexer().lex(data.toString());
    AstroUtility0_1_0_1.Utility.printTokens(tokens);
    var asts = new AstroParser0_1_0_1.Parser().parse(tokens);
    // Utility.printAsts(asts);
});
//# sourceMappingURL=AstroMain0.1.0.js.map