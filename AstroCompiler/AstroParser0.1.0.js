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
        this.parserTest(this.parseNsSetLiteral());
        this.parserTest(this.parseNsDictLiteral());
        this.parserTest(this.parseNsFloatLiteral());
        this.parserTest(this.parseIND());
        this.parserTest(this.parseNsIntLiteral());
        this.parserTest(this.parseDED());
        this.parserTest(this.parsePASS());
        this.parserTest(this.parseDED());
        /// TEST ///
        return this.asts;
    };
    // parses a single compilation unit, the module 
    Parser.prototype.parseModule = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === "module") {
            return { success: true, lastPointerPos: null, name: "module", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            name: "module", problem: ""
        };
    };
    ///////////////////////////
    /////// EXPRESSION ////////
    ///////////////////////////
    Parser.prototype.parseParensExpr = function () {
        var initialPointerPos = this.tokenPointer;
        var success = false;
        var self = this;
        (function () {
            // [1] integer 
            if (self.parseIntLiteral().success) {
                success = true;
                return;
            }
            // [2] name 
            if (self.parseName().success) {
                success = true;
                return;
            }
        })();
        if (success)
            return { success: true, ast: null, lastPointerPos: null, name: "parens_expr", problem: null };
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "parens_expr", problem: ""
        };
    };
    ///////////////////////////
    //////// LITERALS /////////
    ///////////////////////////
    Parser.prototype.parseSetLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        var success = false; // to check if any of alternatives parsed successfully
        var self = this;
        // parse and consume →  '{' ':' '}' | '{' parens_expr (',' parens_expr)* '}' | '{' nested_set '}'
        (function () {
            if (self.parseString("{").success) {
                // [1] '{' '}'
                if (self.parseString("}").success) {
                    success = true;
                    return;
                }
                // [2] '{' parens_expr ( ',' parens_expr )* '}'
                var keyValue = void 0;
                while (true) {
                    keyValue = self.parseParensExpr(); // parse and consume → parens_expr
                    var comma = self.parseString(","); // parse and consume → ','
                    if (!keyValue.success || !comma.success)
                        break;
                }
                if (keyValue.success && self.parseString("}"))
                    success = true;
                return;
            }
            // [3] '{' nested_set '}'
            var nestedDict = this.parseNestedDict(); // parse and consume → nested_dict
            if (nestedDict.success && self.parseString("}")) {
                success = true;
                return;
            }
        })();
        // if any of the alternatives above parsed successfully
        if (success) {
            return { success: true, ast: null, lastPointerPos: null, name: "dict_literal", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "dict_literal", problem: ""
        };
    };
    Parser.prototype.parseNestedSet = function () {
        var initialPointerPos = this.tokenPointer;
        var self = this;
        var keyValue;
        var count = 0;
        while (true) {
            keyValue = self.parseSetLiteral(); // parse and consume → set_literal
            var cnl = self.parseCNL(); // parse and consume → CNL? 
            if (!keyValue.success)
                break;
            count += 1;
        }
        if (keyValue.success && count > 1) {
            return { success: true, ast: null, lastPointerPos: null, name: "nested_set", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "nested_set", problem: ""
        };
    };
    Parser.prototype.parseNsSetLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        // parse and consume → name NS '_' NS set_literal
        if (this.parseName().success &&
            this.parseNS().success &&
            this.parseString("_").success &&
            this.parseNS().success &&
            this.parseSetLiteral().success) {
            return { success: true, ast: null, lastPointerPos: null, name: "ns_set_literal", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "ns_set_literal", problem: ""
        };
    };
    Parser.prototype.parseDictLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        var success = false; // to check if any of alternatives parsed successfully
        var self = this;
        var parseKeyValue = function () {
            var key = self.parseDictKey(); // parse and consume → dict_key
            if (key.success && self.parseString(":").success) {
                var value = self.parseParensExpr(); // parse and consume → parens_expr
                if (value.success) {
                    return { success: true, ast: null, lastPointerPos: null, name: "dict_literal_key_value", problem: null };
                }
            }
            return { success: false, ast: null, lastPointerPos: null, name: "dict_literal_key_value", problem: null };
        };
        // parse and consume →  '{' ':' '}' | '{' dict_key ':' parens_expr (',' dict_key ':' parens_expr )* '}' | '{' nested_dict '}'
        (function () {
            if (self.parseString("{").success) {
                // [1] '{' ':' '}'
                if (self.parseString(":").success && self.parseString("}").success) {
                    success = true;
                    return;
                }
                // [2] '{' dict_key ':' parens_expr (',' dict_key ':' parens_expr )* '}'
                var keyValue = void 0;
                while (true) {
                    keyValue = parseKeyValue(); // parse and consume → dict_key ':' parens_expr
                    var comma = self.parseString(","); // parse and consume → ','
                    if (!keyValue.success || !comma.success)
                        break;
                }
                if (keyValue.success && self.parseString("}"))
                    success = true;
                return;
            }
            // [3] '{' nested_dict '}'
            var nestedDict = this.parseNestedDict(); // parse and consume → nested_dict
            if (nestedDict.success && self.parseString("}")) {
                success = true;
                return;
            }
        })();
        // if any of the alternatives above parsed successfully
        if (success) {
            return { success: true, ast: null, lastPointerPos: null, name: "dict_literal", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "dict_literal", problem: ""
        };
    };
    Parser.prototype.parseNestedDict = function () {
        var initialPointerPos = this.tokenPointer;
        var self = this;
        var parseKeyValue = function () {
            var key = self.parseDictKey(); // parse and consume → dict_key
            if (key.success && self.parseString(":").success) {
                var value = self.parseDictLiteral(); // parse and consume → dict_literal
                if (value.success) {
                    return { success: true, ast: null, lastPointerPos: null, name: "nested_dict_key_value", problem: null };
                }
            }
            return { success: false, ast: null, lastPointerPos: null, name: "nested_dict_key_value", problem: null };
        };
        var keyValue;
        var count = 0;
        while (true) {
            keyValue = parseKeyValue(); // parse and consume → dict_key ':' parens_expr
            var cnl = self.parseCNL(); // parse and consume → CNL?
            if (!keyValue.success)
                break;
            count += 1;
        }
        if (keyValue.success && count > 1) {
            return { success: true, ast: null, lastPointerPos: null, name: "dict_literal", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "dict_literal", problem: ""
        };
    };
    Parser.prototype.parseDictKey = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.parseString("$").success &&
            this.parseNS().success &&
            this.parseString("_").success) {
            return { success: true, ast: null, lastPointerPos: null, name: "dict_key", problem: null };
        }
        else {
            var parensExpr = this.parseParensExpr();
            if (parensExpr.success) {
                return { success: true, ast: null, lastPointerPos: null, name: "dict_key", problem: null };
            }
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, lastPointerPos: this.tokenPointer,
            name: "dict_key", problem: ""
        };
    };
    Parser.prototype.parseNsDictLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        // parse and consume → name NS '_' NS dict_literal
        if (this.parseName().success &&
            this.parseNS().success &&
            this.parseString("_").success &&
            this.parseNS().success &&
            this.parseDictLiteral().success) {
            return { success: true, ast: null, lastPointerPos: null, name: "ns_dict_literal", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "ns_dict_literal", problem: ""
        };
    };
    Parser.prototype.parseRegexLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.integer) {
            this.token = this.eatToken();
            return { success: true, ast: null, lastPointerPos: null, name: "regex_literal", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "regex_literal", problem: ""
        };
    };
    Parser.prototype.parseNsRegexLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.integer) {
            this.token = this.eatToken();
            return { success: true, ast: null, lastPointerPos: null, name: "ns_regex_literal", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "ns_regex_literal", problem: ""
        };
    };
    Parser.prototype.parseNsIntLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.integer) {
            this.token = this.eatToken(); // consume INT
            // parse and consume → NS 
            if (this.parseNS().success) {
                // parse and consume  → '_'?
                if (this.parsePH().success) { }
                // parse and consume → name
                if (this.parseName().success) {
                    return { success: true, ast: null, lastPointerPos: null, name: "ns_int_literal", problem: null };
                }
            }
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "ns_int_literal", problem: ""
        };
    };
    Parser.prototype.parseIntLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.integer) {
            this.token = this.eatToken(); // parse and consume → INT
            return { success: true, ast: null, lastPointerPos: null, name: "ns_int_literal", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "ns_int_literal", problem: ""
        };
    };
    Parser.prototype.parseNsFloatLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.float) {
            this.token = this.eatToken(); // consume → FLOAT
            // parse and consume → NS 
            if (this.parseNS().success) {
                // parse and consume optional → '_'
                if (this.parsePH().success) { }
                // parse and consume → name
                if (this.parseName().success) {
                    return { success: true, ast: null, lastPointerPos: null, name: "ns_float_literal", problem: null };
                }
            }
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "ns_float_literal", problem: ""
        };
    };
    Parser.prototype.parseFloatLiteral = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.float) {
            this.token = this.eatToken(); // parse and consume → FLOAT
            return { success: true, ast: null, lastPointerPos: null, name: "ns_float_literal", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "ns_float_literal", problem: ""
        };
    };
    ///////////////////////////
    ///////// NAMES ///////////
    ///////////////////////////
    Parser.prototype.parseName = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.name) {
            this.token = this.eatToken(); // parse and consume → name
            return { success: true, ast: null, lastPointerPos: null, name: "name", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "name", problem: ""
        };
    };
    ///////////////////////////
    /// SPECIAL PUNCTUATORS ///
    ///////////////////////////
    Parser.prototype.parseCNL = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === ",") {
            this.token = this.eatToken(); // consume → ','
            // parse and consume optional → NL 
            if (this.parseNL().success) { }
            return { success: true, ast: null, lastPointerPos: null, name: "CNL", problem: null };
        }
        else if (this.parseNL().success) {
            return { success: true, ast: null, lastPointerPos: null, name: "CNL", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "CNL", problem: ""
        };
    };
    Parser.prototype.parseNL = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.newline || this.token.str === ";") {
            this.token = this.eatToken(); // → consume NEWLINE or ";"
            return { success: true, ast: null, lastPointerPos: null, name: "NL", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "NL", problem: ""
        };
    };
    Parser.prototype.parseIND = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.indent) {
            this.token = this.eatToken(); // consume → INDENT
            return { success: true, ast: null, lastPointerPos: null, name: "IND", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "IND", problem: ""
        };
    };
    Parser.prototype.parseDED = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.type === AstroUtility0_1_0_1.TokenType.dedent || this.token.type === AstroUtility0_1_0_1.TokenType.eoi) {
            this.token = this.eatToken(); // consume → DEDENT | EOI
            return { success: true, ast: null, lastPointerPos: null, name: "DED", problem: null };
        }
        else if (this.token.str === "\\") {
            this.token = this.eatToken();
            if (this.token.str === "\\" && this.parseNS().success) {
                this.token = this.eatToken(); // consume → "\" NS "\"
                return { success: true, ast: null, lastPointerPos: null, name: "DED", problem: null };
            }
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "DED", problem: ""
        };
    };
    Parser.prototype.parsePH = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === "_") {
            this.token = this.eatToken(); // consume → "_"
            return { success: true, ast: null, lastPointerPos: null, name: "PH", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "PH", problem: ""
        };
    };
    Parser.prototype.parsePASS = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === "pass") {
            this.token = this.eatToken(); // consume → 'pass'
            return { success: true, ast: null, lastPointerPos: null, name: "PASS", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "PASS", problem: ""
        };
    };
    ///////////////////////////
    ///// SPECIAL VALUES //////
    ///////////////////////////
    // no-space tokens are generally ignored because they are superfluous and are hardly checked for
    // when incrementing or decrementing the token pointer
    // so this fuction checks if the previous token is a no-space token
    Parser.prototype.parseNS = function () {
        var peekPointer = this.tokenPointer - 1;
        if (this.tokenPointer < this.tokens.length && this.tokens[peekPointer].type === AstroUtility0_1_0_1.TokenType.ns)
            return { success: true, ast: null, lastPointerPos: null, name: "NS", problem: null };
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "NS", problem: ""
        };
    };
    ///////////////////////////
    //////// ARBITRARY ////////
    ///////////////////////////
    Parser.prototype.parseString = function (str) {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === str) {
            this.token = this.eatToken(); // parse and consume → str 
            return { success: true, ast: null, lastPointerPos: null, name: str, problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: str, problem: ""
        };
    };
    ///////////////////////////
    ///////// TESTERS /////////
    ///////////////////////////
    Parser.prototype.parserTest = function (parser) {
        if (parser.success) {
            console.log("Parser successful! [" + parser.name + "]");
        }
        else {
            console.log("Parser failed! > initalPos: " + (this.tokenPointer + 1) + " lastPos: " + (parser.lastPointerPos + 1) + " [" + parser.name + "]");
        }
    };
    ///////////////////////////
    //////// UTILITIES ////////
    ///////////////////////////
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
    ///////////////////////////
    /////// BOILERPLATE ///////
    /////////////////////////// 
    Parser.prototype.parseX = function () {
        var initialPointerPos = this.tokenPointer;
        if (this.token.str === "...") {
            this.token = this.eatToken(); // parse and consume → 
            return { success: true, ast: null, lastPointerPos: null, name: "", problem: null };
        }
        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos;
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer,
            name: "", problem: ""
        };
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=AstroParser0.1.0.js.map