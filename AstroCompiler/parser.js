"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// PARSER.TS
// 02/05/17
var Astro = (function () {
    function Astro() {
        this.charPointer = -1;
        this.decDigits = "0123456789";
        this.binDigits = "01";
        this.octDigits = "01234567";
        this.hexDigits = "0123456789ABCDEF";
        this.characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.operators = "=+-*\\^&|><!";
        this.punctuators = ".,;:()[]{}_`";
        this.keywords = [
            'var', 'let', 'type', 'fun', 'enum', 'obj',
            'ref', 'iso', 'val', 'acq',
            'if', 'elif', 'else', 'redo', 'while', 'for', 'in', 'block', 'loop',
            'break', 'spill', 'continue', 'yield', 'return',
            'catch', 'try', 'raise'
            //...
        ];
    }
    Astro.prototype.lex = function (code) {
        var _this = this;
        console.log("ENTRY\n-----\n");
        if (code == null || code.length < 1) {
            console.log("Code not present!");
            return;
        }
        this.chars = code.split('');
        var tokens = new Array();
        var char = this.eatChar();
        var firstIndentCount = 0;
        var indentCount = 0;
        var prevIndentCount = 0;
        var usesSpaceIndent = null;
        var _loop_1 = function () {
            // eoi (end of input)
            if (char == null) {
                console.log(char + ": {EOI}");
                // save token
                tokens.push(new Token(null, TokenType.eoi));
                return "break";
            }
            else if (this_1.characters.indexOf(char) > -1) {
                var str = '';
                do {
                    str += char;
                    char = this_1.eatChar();
                } // [a-zA-Z0-9_]+
                 while (char != null && (this_1.characters.indexOf(char) > -1 || this_1.decDigits.indexOf(char) > -1 || char == '_'));
                // if underscore is the last letter in the identifier, vomit it back
                if (str.slice(-1) == '_') {
                    str = str.slice(0, -1);
                    char = this_1.vomitChar();
                }
                // save token
                // check if token is a keyword
                if (this_1.keywords.indexOf(str) > -1) {
                    tokens.push(new Token(str, TokenType.keyword));
                    console.log(str + ": {KEYWORD}");
                }
                else if (str == "true" || str == "false") {
                    tokens.push(new Token(str, TokenType.boolean));
                    console.log(str + ": {BOOLEAN}");
                }
                else {
                    tokens.push(new Token(str, TokenType.identifier));
                    console.log(str + ": {IDENTIFIER}");
                }
            }
            else if (this_1.decDigits.indexOf(char) > -1) {
                var numberType_1 = "dec";
                var str_1 = char;
                char = this_1.eatChar();
                // lexing the exponent
                var subExponent_1 = function () {
                    if (numberType_1 == "hex") {
                        if (char == "p") {
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    else {
                        if (char == "e") {
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    if (char == '-' || char == '+') {
                        subSign_1();
                    }
                    else if (_this.decDigits.indexOf(char) > -1 || char == '_') {
                        subNumberPostExponent_1();
                    }
                };
                // lexing the number after the first digit
                var subNumberPostInitial = function () {
                    if (numberType_1 == "bin") {
                        while (_this.binDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    else if (numberType_1 == "oct") {
                        while (_this.octDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    else if (numberType_1 == "hex") {
                        while (_this.hexDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    else {
                        while (_this.decDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    if (char == ".") {
                        subDecimal_1();
                    }
                    else if (char == "e" || char == "p") {
                        subExponent_1();
                    }
                    else if (_this.characters.indexOf(char) > -1 || char == '_') {
                        subLetter_1();
                    }
                };
                // lexing the number after the decimal point 
                var subNumberPostDecimal_1 = function () {
                    if (numberType_1 == "bin") {
                        while (_this.binDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    else if (numberType_1 == "oct") {
                        while (_this.octDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    else if (numberType_1 == "hex") {
                        while (_this.hexDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    else {
                        while (_this.decDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    if (char == "e" || char == "p") {
                        subExponent_1();
                    }
                    else if (_this.characters.indexOf(char) > -1 || char == '_') {
                        subLetter_1();
                    }
                };
                // lexing the number after the exponent mark 
                var subNumberPostExponent_1 = function () {
                    if (numberType_1 == "bin") {
                        while (_this.binDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    else if (numberType_1 == "oct") {
                        while (_this.octDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    else if (numberType_1 == "hex") {
                        while (_this.hexDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    else {
                        while (_this.decDigits.indexOf(char) > -1 || char == '_') {
                            if (char == "_") {
                                char = _this.eatChar();
                                continue;
                            } // ignore the underscores
                            str_1 += char;
                            char = _this.eatChar();
                        }
                    }
                    if (_this.characters.indexOf(char) > -1 || char == '_') {
                        subLetter_1();
                    }
                };
                // lexing the letters at the end of the number
                var subLetter_1 = function () {
                    while (_this.characters.indexOf(char) > -1 || char == '_') {
                        str_1 += char;
                        char = _this.eatChar();
                    }
                };
                // lexing the decimal point
                var subDecimal_1 = function () {
                    if (char == ".") {
                        str_1 += char;
                        char = _this.eatChar();
                    }
                    if (_this.decDigits.indexOf(char) > -1 || char == '_') {
                        subNumberPostDecimal_1();
                    }
                };
                // lexing the sign mark after the exponent mark
                var subSign_1 = function () {
                    if (char == '-' || char == '+') {
                        str_1 += char;
                        char = _this.eatChar();
                    }
                    if (_this.decDigits.indexOf(char) > -1 || char == '_') {
                        subNumberPostExponent_1();
                    }
                };
                // start point
                if (this_1.prevChar() == '0') {
                    // binary
                    if (char == 'b' || char == 'B')
                        numberType_1 = "bin";
                    else if (char == 'o' || char == 'O')
                        numberType_1 = "dec";
                    else if (char == 'x' || char == 'X')
                        numberType_1 = "hex";
                    str_1 += char;
                    char = this_1.eatChar();
                }
                subNumberPostInitial();
                // if underscore is the last letter in the number literal, vomit it back
                if (str_1.slice(-1) == '_') {
                    str_1 = str_1.slice(0, -1);
                    char = this_1.vomitChar();
                }
                tokens.push(new Token(str_1, TokenType.number));
                console.log(str_1 + ": {NUMBER}");
            }
            else if (this_1.operators.indexOf(char) > -1) {
                tokens.push(new Token(char, TokenType.operator));
                console.log(char + ": {OPERATOR}");
                char = this_1.eatChar();
                // check for no-space after operator
                if (char != " " && char != "\t") {
                    tokens.push(new Token("", TokenType.ns));
                    console.log("[ns]: {NOSPACE}");
                }
            }
            else if (this_1.punctuators.indexOf(char) > -1) {
                tokens.push(new Token(char, TokenType.punctuator));
                console.log(char + ": {PUNCTUATOR}");
                char = this_1.eatChar();
                // check for no-space after punctuator
                if (char != " " && char != "\t") {
                    tokens.push(new Token("", TokenType.ns));
                    console.log("[ns]: {NOSPACE}");
                }
            }
            else if (char == "\n" || char == "\r") {
                do {
                    char = this_1.eatChar();
                } while (char == "\n" || char == "\r");
                // checking for a possible dedent
                if (char != " " && char != "\t") {
                    var indentFactor = prevIndentCount / firstIndentCount;
                    // if previous indent has an indentation 
                    if (prevIndentCount >= 1) {
                        for (var i = 0; i < indentFactor; i++) {
                            tokens.push(new Token("", TokenType.dedent));
                            console.log("<< DEDENT **");
                        }
                        // now prevIndent has no indent at all
                        prevIndentCount = 0;
                    }
                    else {
                        tokens.push(new Token("", TokenType.newline));
                        console.log("\"\\n\"" + ": {NEWLINE}");
                    }
                }
                // if preceded by spaces or tabs, there is a possible indentation information
                // the newline is ignored
            }
            else if (char == " ") {
                // if there is a preceding newline, then this could be an indent
                if (this_1.prevChar() == "\n" || this_1.prevChar() == "\r") {
                    do {
                        indentCount += 1;
                        char = this_1.eatChar();
                    } while (char == " ");
                    // pass indentCount to another variable, so that u can st it back to zero
                    // there are some early returns, throws, continues etec everywhere. you dont 
                    // want to forget setting it back to zero.
                    var indentSize = indentCount;
                    indentCount = 0;
                    // if the space indent is followed by a tab
                    if (char == "\t") {
                        var offset = 0;
                        var char2 = void 0;
                        while (true) {
                            char2 = this_1.peekChar(++offset);
                            // if all the spaces are followed by newline
                            if (char2 == "\n") {
                                char = this_1.eatChar(offset);
                                return "continue-lexLoop";
                            }
                            else if (char2 == " " || char2 == "\t") {
                                continue;
                            }
                            else if (char2 == null) {
                                tokens.push(new Token(null, TokenType.eoi));
                                return "break-lexLoop";
                            }
                            else {
                                throw new Error("Error 1: Can't mix tabs with spaces for indents!");
                            }
                        }
                    }
                    else if (char == "\n" || char == "\r") {
                        return "continue-lexLoop";
                    }
                    else if (char == null) {
                        console.log(char + ": {EOI}");
                        tokens.push(new Token(null, TokenType.eoi));
                        return "break-lexLoop";
                    }
                    // now we know we've got an indentation, let's see if it's the firstIndent, an indent or a dedent
                    // is the first indent
                    if (usesSpaceIndent == null) {
                        usesSpaceIndent = true;
                        firstIndentCount = indentSize;
                        prevIndentCount = firstIndentCount;
                        tokens.push(new Token("", TokenType.indent));
                        console.log(">> FIRST INDENT **");
                    }
                    else {
                        if (!usesSpaceIndent) {
                            throw new Error("Error 4: Cannot mix tab and space indentations!");
                        }
                        if (indentSize % firstIndentCount == 0) {
                            var indentFactor = indentSize / firstIndentCount;
                            var prevIndentFactor = prevIndentCount / firstIndentCount;
                            var indentDiff = indentFactor - prevIndentFactor;
                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;
                            // register a newline if there is no indent or dedent
                            if (indentDiff == 0) {
                                tokens.push(new Token("", TokenType.newline));
                                console.log("\"\\n\"" + ": {NEWLINE}");
                                return "continue-lexLoop";
                            }
                            if (indentDiff > 1) {
                                throw new Error("Error 3: Indentation mismatch, indentation is too much!");
                            }
                            // indent
                            if (indentDiff == 1) {
                                tokens.push(new Token("", TokenType.indent));
                                console.log(">> INDENT **");
                            }
                            else {
                                for (var i = 0; i < (0 - indentDiff); i++) {
                                    tokens.push(new Token("", TokenType.dedent));
                                    console.log("<< DEDENT **");
                                }
                            }
                        }
                        else {
                            throw new Error("Error 2: Indentation mismatch!");
                        }
                    }
                    console.log(">> SPACE INDENT COUNT: " + indentSize);
                }
                else {
                    do {
                        char = this_1.eatChar();
                    } while (char == " " || char == "\t");
                    // console.log("[ ]" + ": {SPACE}"); 
                }
            }
            else if (char == "\t") {
                // if there is a preceding newline, then this could be an indent
                if (this_1.prevChar() == "\n" || this_1.prevChar() == "\r") {
                    do {
                        indentCount += 1;
                        char = this_1.eatChar();
                    } while (char == "\t");
                    // pass indentCount to another variable, so that u can st it back to zero
                    // there are some early returns, throws, continues etec everywhere. you dont 
                    // want to forget setting it back to zero.
                    var indentSize = indentCount;
                    indentCount = 0;
                    // if the tab indent is followed by a space
                    if (char == " ") {
                        var offset = 0;
                        var char2 = void 0;
                        while (true) {
                            char2 = this_1.peekChar(++offset);
                            // if all the spaces are followed by newline
                            if (char2 == "\n") {
                                char = this_1.eatChar(offset);
                                return "continue-lexLoop";
                            }
                            else if (char2 == " " || char2 == "\t") {
                                continue;
                            }
                            else if (char2 == null) {
                                tokens.push(new Token(null, TokenType.eoi));
                                return "break-lexLoop";
                            }
                            else {
                                throw new Error("Error 1: Can't mix tabs with spaces for indents!");
                            }
                        }
                    }
                    else if (char == "\n" || char == "\r") {
                        return "continue-lexLoop";
                    }
                    else if (char == null) {
                        console.log(char + ": {EOI}");
                        tokens.push(new Token(null, TokenType.eoi));
                        return "break-lexLoop";
                    }
                    // now we know we've got an indentation, let's see if it's the firstIndent, an indent or a dedent
                    // is the first indent
                    if (usesSpaceIndent == null) {
                        usesSpaceIndent = false;
                        firstIndentCount = indentSize;
                        prevIndentCount = firstIndentCount;
                        tokens.push(new Token("", TokenType.indent));
                        console.log(">> FIRST INDENT **");
                    }
                    else {
                        if (usesSpaceIndent) {
                            throw new Error("Error 4: Cannot mix tab and space indentations!");
                        }
                        if (indentSize % firstIndentCount == 0) {
                            var indentFactor = indentSize / firstIndentCount;
                            var prevIndentFactor = prevIndentCount / firstIndentCount;
                            var indentDiff = indentFactor - prevIndentFactor;
                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;
                            // register a newline if there is no indent or dedent
                            if (indentDiff == 0) {
                                tokens.push(new Token("", TokenType.newline));
                                console.log("\"\\n\"" + ": {NEWLINE}");
                                return "continue-lexLoop";
                            }
                            if (indentDiff > 1) {
                                throw new Error("Error 3: Indentation mismatch, indentation is too much!");
                            }
                            // indent
                            if (indentDiff == 1) {
                                tokens.push(new Token("", TokenType.indent));
                                console.log(">> INDENT **");
                            }
                            else {
                                for (var i = 0; i < (0 - indentDiff); i++) {
                                    tokens.push(new Token("", TokenType.dedent));
                                    console.log("<< DEDENT **");
                                }
                            }
                        }
                        else {
                            throw new Error("Error 2: Indentation mismatch!");
                        }
                    }
                    console.log(">> TAB INDENT COUNT: " + indentSize);
                }
                else {
                    do {
                        char = this_1.eatChar();
                    } while (char == " " || char == "\t");
                    // console.log("[ ]" + ": {TAB}"); 
                }
            }
            else if (char == "'") {
                var str = "";
                // discard the opening quote
                char = this_1.eatChar();
                while (char != "'") {
                    str += char;
                    char = this_1.eatChar();
                }
                // discard the closing quote
                this_1.eatChar();
                // cache the next character
                char = this_1.eatChar();
                tokens.push(new Token(str, TokenType.string));
                console.log(str + " : {STRING}");
            }
            else if (char == "\"") {
                var str = "";
                // discard the opening quote
                char = this_1.eatChar();
                while (char != "\"") {
                    str += char;
                    char = this_1.eatChar();
                }
                // discard the closing quote
                this_1.eatChar();
                // cache the next character
                char = this_1.eatChar();
                tokens.push(new Token(str, TokenType.string));
                console.log(str + " : {STRING}");
            }
            else if (char == "#" && this_1.peekChar() != "=") {
                var str = "";
                // discard the "#"
                char = this_1.eatChar();
                while (char != "\n" && char != "\r") {
                    str += char;
                    char = this_1.eatChar();
                }
                tokens.push(new Token(str, TokenType.comment));
                console.log(str + " : {COMMENT}");
            }
            else if (char == "#" && this_1.peekChar() == "=") {
                var nestCount = 0;
                var str = "";
                // discard the '#'
                this_1.eatChar();
                // discard the '='
                char = this_1.eatChar();
                while (true) {
                    // check for closing mark
                    if (char == "=" && this_1.peekChar() == "#") {
                        // if outside all nesting
                        if (nestCount == 0) {
                            // save comment string 
                            tokens.push(new Token(str, TokenType.comment));
                            console.log(str + " : {COMMENT}");
                            // discard the '='
                            this_1.eatChar();
                            // discard the '#'
                            char = this_1.eatChar();
                            break;
                        }
                        else {
                            nestCount -= 1;
                        }
                    }
                    else if (char == "#" && this_1.peekChar() == "=") {
                        nestCount += 1;
                    }
                    else if (char == null) {
                        // save comment string
                        tokens.push(new Token(str, TokenType.comment));
                        console.log(str + " : {COMMENT}");
                        // save EOI token
                        tokens.push(new Token(null, TokenType.eoi));
                        break;
                    }
                    str += char;
                    char = this_1.eatChar();
                }
            }
            else {
                throw new Error("Error 5: character not recognized!");
            }
        };
        var this_1 = this;
        lexLoop: while (true) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
            switch (state_1) {
                case "break-lexLoop": break lexLoop;
                case "continue-lexLoop": continue lexLoop;
            }
        }
        console.log("\n----\nEXIT");
        return tokens;
    };
    Astro.prototype.eatChar = function (offset) {
        if (offset === void 0) { offset = 1; }
        this.charPointer += offset;
        if (this.charPointer < this.chars.length)
            return this.chars[this.charPointer];
        return null;
    };
    Astro.prototype.vomitChar = function (offset) {
        if (offset === void 0) { offset = 1; }
        this.charPointer -= offset;
        if (this.charPointer < this.chars.length)
            return this.chars[this.charPointer];
        return null;
    };
    Astro.prototype.peekChar = function (offset) {
        if (offset === void 0) { offset = 1; }
        var peekPointer = this.charPointer + offset;
        if (peekPointer < this.chars.length)
            return this.chars[peekPointer];
        return null;
    };
    Astro.prototype.prevChar = function () {
        var peekPointer = this.charPointer - 1;
        if (peekPointer < this.chars.length)
            return this.chars[peekPointer];
        return null;
    };
    Astro.prototype.parse = function (tokens) {
        return new Ast();
    };
    return Astro;
}());
// Asts
var Ast = (function () {
    function Ast() {
    }
    return Ast;
}());
var ExprAst = (function (_super) {
    __extends(ExprAst, _super);
    function ExprAst(ref) {
        var _this = _super.call(this) || this;
        _this.ref = ref;
        return _this;
    }
    return ExprAst;
}(Ast));
var BinaryAst = (function (_super) {
    __extends(BinaryAst, _super);
    function BinaryAst(lhs, op, rhs, ref) {
        var _this = _super.call(this, ref) || this;
        _this.op = op;
        _this.lhs = lhs;
        _this.rhs = rhs;
        return _this;
    }
    return BinaryAst;
}(ExprAst));
var NameAst = (function (_super) {
    __extends(NameAst, _super);
    function NameAst(name, ref) {
        var _this = _super.call(this, ref) || this;
        _this.name = name;
        return _this;
    }
    return NameAst;
}(ExprAst));
var BooleanAst = (function (_super) {
    __extends(BooleanAst, _super);
    function BooleanAst(bool, ref) {
        var _this = _super.call(this, ref) || this;
        _this.bool = bool;
        return _this;
    }
    return BooleanAst;
}(ExprAst));
var FunctionCallAst = (function (_super) {
    __extends(FunctionCallAst, _super);
    function FunctionCallAst(name, args, ref) {
        var _this = _super.call(this, ref) || this;
        _this.name = name;
        _this.args = args;
        return _this;
    }
    return FunctionCallAst;
}(ExprAst));
var FunctionDefAst = (function (_super) {
    __extends(FunctionDefAst, _super);
    function FunctionDefAst(name, params, body, access) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.params = params;
        _this.body = body;
        _this.access = access;
        return _this;
    }
    return FunctionDefAst;
}(Ast));
var SubjectDefAst = (function (_super) {
    __extends(SubjectDefAst, _super);
    function SubjectDefAst(name, access) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.access = access;
        return _this;
    }
    return SubjectDefAst;
}(Ast));
var VariableDefAst = (function (_super) {
    __extends(VariableDefAst, _super);
    function VariableDefAst(name, access) {
        return _super.call(this, name, access) || this;
    }
    return VariableDefAst;
}(SubjectDefAst));
var ConstantDefAst = (function (_super) {
    __extends(ConstantDefAst, _super);
    function ConstantDefAst(name, access) {
        return _super.call(this, name, access) || this;
    }
    return ConstantDefAst;
}(SubjectDefAst));
var StringAst = (function (_super) {
    __extends(StringAst, _super);
    function StringAst(str, ref) {
        var _this = _super.call(this, ref) || this;
        _this.str = str;
        return _this;
    }
    return StringAst;
}(ExprAst));
// ...
var Utility = (function () {
    function Utility() {
    }
    Utility.printTokens = function (tokens) {
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            console.log(token.str + " => " + Utility.printTokenType(token.type));
        }
    };
    Utility.printTokenType = function (tokenType) {
        switch (tokenType) {
            case TokenType.identifier: return 'Identifier';
            case TokenType.number: return 'number';
            case TokenType.boolean: return 'boolean';
            case TokenType.string: return 'string';
            case TokenType.comment: return 'comment';
            case TokenType.keyword: return 'keyword';
            case TokenType.operator: return 'operator';
            case TokenType.punctuator: return 'punctuator';
            case TokenType.newline: return 'newline';
            case TokenType.indent: return 'indent';
            case TokenType.dedent: return 'dedent';
            case TokenType.eoi: return 'eoi';
            case TokenType.ns: return 'ns';
        }
    };
    return Utility;
}());
var Token = (function () {
    function Token(str, type) {
        this.str = str;
        this.type = type;
    }
    return Token;
}());
// Enums 
var TokenType;
(function (TokenType) {
    TokenType[TokenType["identifier"] = 0] = "identifier";
    TokenType[TokenType["number"] = 1] = "number";
    TokenType[TokenType["boolean"] = 2] = "boolean";
    TokenType[TokenType["string"] = 3] = "string";
    TokenType[TokenType["comment"] = 4] = "comment";
    TokenType[TokenType["keyword"] = 5] = "keyword";
    TokenType[TokenType["operator"] = 6] = "operator";
    TokenType[TokenType["punctuator"] = 7] = "punctuator";
    TokenType[TokenType["newline"] = 8] = "newline";
    TokenType[TokenType["indent"] = 9] = "indent";
    TokenType[TokenType["dedent"] = 10] = "dedent";
    TokenType[TokenType["eoi"] = 11] = "eoi";
    TokenType[TokenType["ns"] = 12] = "ns";
})(TokenType || (TokenType = {}));
var RefType;
(function (RefType) {
    RefType[RefType["ref"] = 0] = "ref";
    RefType[RefType["val"] = 1] = "val";
    RefType[RefType["iso"] = 2] = "iso";
    RefType[RefType["acq"] = 3] = "acq";
})(RefType || (RefType = {}));
var AccessType;
(function (AccessType) {
    AccessType[AccessType["public"] = 0] = "public";
    AccessType[AccessType["private"] = 1] = "private";
})(AccessType || (AccessType = {}));
var fs = require("fs");
var fileName1 = './test.ast';
var fileName2 = './test2.ast';
fs.readFile(fileName1, function (err, data) {
    if (err) {
        return console.error(err);
    }
    var astro = new Astro();
    var tokens = astro.lex(data.toString()); // lex the file 
    Utility.printTokens(tokens);
});
//# sourceMappingURL=parser.js.map