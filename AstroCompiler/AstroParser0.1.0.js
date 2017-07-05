"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 05/07/17
var AstroUtility0_1_0_1 = require("./AstroUtility0.1.0");
var Parser = (function () {
    function Parser() {
        this.tokenPointer = -1;
        // SPECIAL PUNCTUATORS 
        this.PASS = new AstroUtility0_1_0_1.Token();
        this.PH = new AstroUtility0_1_0_1.Token();
        this.IND = new AstroUtility0_1_0_1.Token();
    }
    // start point of parser
    Parser.prototype.parse = function (tokens) {
        this.tokens = tokens;
        this.parseModule();
        return this.asts;
    };
    // parses a single compilation unit, the module 
    Parser.prototype.parseModule = function () {
    };
    // UTILITIES //
    // consumes the current token by incrementing the token pointer and returning the next token
    Parser.prototype.eatToken = function () {
        this.tokenPointer += 1;
        if (this.tokens[this.tokenPointer].type == AstroUtility0_1_0_1.TokenType.ns) {
            this.tokenPointer += 1;
        }
        if (this.tokenPointer < this.tokens.length)
            return this.tokens[this.tokenPointer];
        return null;
    };
    // returns the previous token without decrementing the token pointer
    Parser.prototype.prevToken = function () {
        var peekPointer = this.tokenPointer - 1;
        if (this.tokens[peekPointer].type == AstroUtility0_1_0_1.TokenType.ns) {
            peekPointer -= 1;
        }
        if (this.tokenPointer < this.tokens.length)
            return this.tokens[peekPointer];
        return null;
    };
    // no-space tokens are generally ignored because they are superfluous and are hardly checked for
    // when incrementing or decrementing the token pointer
    // so this fuction checks if the previous token is a no-space token
    Parser.prototype.parseNoSpace = function () {
        var peekPointer = this.tokenPointer - 1;
        if (this.tokenPointer < this.tokens.length && this.tokens[peekPointer].type == AstroUtility0_1_0_1.TokenType.ns)
            return true;
        return false;
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=AstroParser0.1.0.js.map