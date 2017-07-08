"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 05/07/17
var AstroUtility0_1_0_1 = require("./AstroUtility0.1.0");
var Parser = (function () {
    function Parser() {
        this.tokenPointer = -1;
        // operators 
        this.registeredInfixOps = {
            "|": [10, true], "&": [10, true],
            "in": [20, true],
            "+": [50, true], "-": [50, true],
            "*": [60, true], "/": [60, true],
            "^": [70, false],
        };
        this.registeredPrefixOps = ["+", "-", "++"];
        this.registeredPostfixOps = [];
        this.dot_op = ["!", "@", "."];
    }
    // start point of parser
    Parser.prototype.parse = function (tokens) {
        this.tokens = tokens;
        this.token = this.eatToken(); // start by eating the first token
        /* this.parseModule(); */
        /// TEST ///
        this.parserCheck(this.parseNsFloatLiteral());
        this.parserCheck(this.parseNL());
        this.parserCheck(this.parseNsIntLiteral());
        /// TEST ///
        return this.asts;
    };
    ///////////////////////////
    //////// LITERALS /////////
    ///////////////////////////
    Parser.prototype.parseNsIntLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.integer) {
            this.token = this.eatToken(); // consume INT
            // parse and consume NS 
            if (this.parseNS().success) {
                // parse and consume optional '_'
                if (this.parsePH().success) { }
                // parse and consume name
                if (this.parseName().success) {
                    return { success: true, lastPointerPos: null, parserName: null, problem: null };
                }
            }
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "ns_float_literal", problem: ""
        };
    };
    Parser.prototype.parseNsFloatLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.float) {
            this.token = this.eatToken(); // consume FLOAT
            // parse and consume NS 
            if (this.parseNS().success) {
                // parse and consume optional '_'
                if (this.parsePH().success) { }
                // parse and consume name
                if (this.parseName().success) {
                    return { success: true, lastPointerPos: null, parserName: null, problem: null };
                }
            }
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "ns_float_literal", problem: ""
        };
    };
    // parses a single compilation unit, the module 
    Parser.prototype.parseModule = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === "module") {
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "module", problem: ""
        };
    };
    ///////////////////////////
    ///////// NAMES ///////////
    ///////////////////////////
    Parser.prototype.parseName = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.name) {
            this.token = this.eatToken(); // consume name
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "name", problem: ""
        };
    };
    ///////////////////////////
    /// SPECIAL PUNCTUATORS ///
    ///////////////////////////
    Parser.prototype.parseCNL = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === ",") {
            this.token = this.eatToken(); // consume ','
            // parse and consume optional NL 
            if (this.parseNL().success) { }
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        }
        else if (this.parseNL().success) {
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "CNL", problem: ""
        };
    };
    Parser.prototype.parseNL = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.newline || this.token.str === ";") {
            this.token = this.eatToken(); // consume NEWLINE or ";"
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "NL", problem: ""
        };
    };
    Parser.prototype.parseIND = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.indent) {
            this.token = this.eatToken(); // consume INDENT
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "IND", problem: ""
        };
    };
    Parser.prototype.parseDED = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.dedent || this.token.type === AstroUtility0_1_0_1.TokenType.eoi) {
            this.token = this.eatToken(); // consume DEDENT | EOI
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        }
        else if (this.token.str === "\\") {
            this.token = this.eatToken();
            if (this.token.str === "\\" && this.parseNS().success) {
                this.token = this.eatToken(); // consume "\\" NS "\\"
                return { success: true, lastPointerPos: null, parserName: null, problem: null };
            }
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "DED", problem: ""
        };
    };
    Parser.prototype.parsePH = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === "_") {
            this.token = this.eatToken(); // consume "_"
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "PH", problem: ""
        };
    };
    Parser.prototype.parsePASS = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === "pass") {
            this.token = this.eatToken(); // consume "pass"
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "PASS", problem: ""
        };
    };
    // no-space tokens are generally ignored because they are superfluous and are hardly checked for
    // when incrementing or decrementing the token pointer
    // so this fuction checks if the previous token is a no-space token
    Parser.prototype.parseNS = function () {
        var peekPointer = this.tokenPointer - 1;
        if (this.tokenPointer < this.tokens.length && this.tokens[peekPointer].type === AstroUtility0_1_0_1.TokenType.ns)
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "NS", problem: ""
        };
    };
    // TESTERS //
    Parser.prototype.parserCheck = function (parser) {
        if (parser.success) {
            console.log("Parser successful!");
        }
        else {
            console.log("Parser failed! > initalPos: " + (this.tokenPointer + 1) + " lastPos: " + (parser.lastPointerPos + 1));
        }
    };
    // UTILITIES //
    // consumes the current token by incrementing the token pointer and returning the next token
    Parser.prototype.eatToken = function () {
        this.tokenPointer += 1;
        if (this.tokens[this.tokenPointer].type === AstroUtility0_1_0_1.TokenType.ns) {
            this.tokenPointer += 1;
        }
        if (this.tokenPointer < this.tokens.length)
            return this.tokens[this.tokenPointer];
        return null;
    };
    // returns the previous token without decrementing the token pointer
    Parser.prototype.prevToken = function () {
        var peekPointer = this.tokenPointer - 1;
        if (this.tokens[peekPointer].type === AstroUtility0_1_0_1.TokenType.ns) {
            peekPointer -= 1;
        }
        if (this.tokenPointer < this.tokens.length)
            return this.tokens[peekPointer];
        return null;
    };
    // BOILERPLATE 
    Parser.prototype.parseX = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === "...") {
            this.token = this.eatToken(); // consume 
            return { success: true, lastPointerPos: null, parserName: null, problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            parserName: "", problem: ""
        };
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=AstroParser0.1.0.js.map