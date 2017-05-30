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
var Lexer = (function () {
    function Lexer() {
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
        // debug helpers 
        this.col = 0;
        this.line = 1;
    }
    Lexer.prototype.lex = function (code) {
        var _this = this;
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
                // save token
                tokens.push(new Token(null, TokenType.eoi, null, this_1.line));
                return "break";
            }
            else if (this_1.characters.indexOf(char) > -1) {
                var str = '';
                var col = this_1.col;
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
                    tokens.push(new Token(str, TokenType.keyword, col, this_1.line));
                }
                else if (str == "true" || str == "false") {
                    tokens.push(new Token(str, TokenType.boolean, col, this_1.line));
                }
                else {
                    tokens.push(new Token(str, TokenType.identifier, col, this_1.line));
                }
            }
            else if (this_1.decDigits.indexOf(char) > -1) {
                var numberType_1 = "dec";
                var str_1 = char;
                var col = this_1.col;
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
                    // while(this.characters.indexOf(char)>-1 || char == '_'){
                    //     str += char; 
                    //     char = this.eatChar();
                    // }  
                    // if underscore is the last letter of previously lexed number, vomit it back
                    if (_this.prevChar() == "_") {
                        char = _this.vomitChar();
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
                tokens.push(new Token(str_1, TokenType.number, col, this_1.line));
            }
            else if (this_1.operators.indexOf(char) > -1) {
                // check for no-space before punctuator
                var prevChar = this_1.prevChar();
                if (prevChar != " " && prevChar != "\t") {
                    // check if last registered token is not a no-space to prevent duplicates
                    if (tokens[tokens.length - 1].type != TokenType.ns, this_1.col, this_1.line)
                        tokens.push(new Token("", TokenType.ns, this_1.col, this_1.line));
                }
                tokens.push(new Token(char, TokenType.operator, this_1.col, this_1.line));
                char = this_1.eatChar(); // eat punctuator
                // check for no-space after operator
                if (char != " " && char != "\t") {
                    tokens.push(new Token("", TokenType.ns, this_1.col, this_1.line));
                }
            }
            else if (this_1.punctuators.indexOf(char) > -1) {
                // check for no-space before punctuator
                var prevChar = this_1.prevChar();
                if (prevChar != " " && prevChar != "\t") {
                    // check if last registered token is not a no-space to prevent duplicates
                    if (tokens[tokens.length - 1].type != TokenType.ns)
                        tokens.push(new Token("", TokenType.ns, this_1.col, this_1.line));
                }
                tokens.push(new Token(char, TokenType.punctuator, this_1.col, this_1.line));
                char = this_1.eatChar(); // eat punctuator
                // check for no-space after punctuator
                if (char != " " && char != "\t") {
                    tokens.push(new Token("", TokenType.ns, this_1.col, this_1.line));
                }
            }
            else if (char == "\n" || char == "\r") {
                do {
                    char = this_1.eatChar();
                } while (char == "\n" || char == "\r");
                // there's a possibililty of dedent as long as newline is not immediately
                // followed by spaces, tab or a comment
                if (char != " " && char != "\t" && char != "#") {
                    var indentFactor = prevIndentCount / firstIndentCount;
                    // if previous indent has an indentation 
                    if (prevIndentCount >= 1) {
                        for (var i = 0; i < indentFactor; i++) {
                            tokens.push(new Token("", TokenType.dedent, this_1.col - 1, this_1.line));
                        }
                        // now prevIndent has no indent at all
                        prevIndentCount = 0;
                    }
                    else {
                        tokens.push(new Token("", TokenType.newline, null, this_1.line));
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
                                // offset should only be used when there is guarantee newlines won't be skipped
                                char = this_1.eatChar(offset);
                                return "continue-lexLoop";
                            }
                            else if (char2 == " " || char2 == "\t") {
                                continue;
                            }
                            else if (char2 == null) {
                                tokens.push(new Token(null, TokenType.eoi, null, this_1.line));
                                return "break-lexLoop";
                            }
                            else {
                                throw new Error("Lex Error: Can't mix tabs with spaces for indents!");
                            }
                        }
                    }
                    else if (char == "\n" || char == "\r") {
                        return "continue-lexLoop";
                    }
                    else if (char == null) {
                        tokens.push(new Token(null, TokenType.eoi, null, this_1.line));
                        return "break-lexLoop";
                    }
                    else if (char == "#") {
                        return "continue-lexLoop";
                    }
                    // now we know we've got an indentation, let's see if it's the firstIndent
                    if (usesSpaceIndent == null) {
                        usesSpaceIndent = true;
                        firstIndentCount = indentSize;
                        prevIndentCount = firstIndentCount;
                        tokens.push(new Token("", TokenType.indent, this_1.col - 1, this_1.line));
                    }
                    else {
                        if (!usesSpaceIndent) {
                            throw new Error("Lex Error: Cannot mix tab and space indentations!");
                        }
                        if (indentSize % firstIndentCount == 0) {
                            var indentFactor = indentSize / firstIndentCount;
                            var prevIndentFactor = prevIndentCount / firstIndentCount;
                            var indentDiff = indentFactor - prevIndentFactor;
                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;
                            // register a newline if there is no indent or dedent difference
                            if (indentDiff == 0) {
                                tokens.push(new Token("", TokenType.newline, null, this_1.line));
                                return "continue-lexLoop";
                            }
                            if (indentDiff > 1) {
                                throw new Error("Lex Error: Indentation mismatch, indentation is too much!");
                            }
                            // indent
                            if (indentDiff == 1) {
                                tokens.push(new Token("", TokenType.indent, this_1.col - 1, this_1.line));
                            }
                            else {
                                for (var i = 0; i < (0 - indentDiff); i++) {
                                    tokens.push(new Token("", TokenType.dedent, this_1.col - 1, this_1.line));
                                }
                            }
                        }
                        else {
                            throw new Error("Lex Error: Indentation mismatch!");
                        }
                    }
                }
                else {
                    do {
                        char = this_1.eatChar();
                    } while (char == " " || char == "\t");
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
                                // offset should only be used when there is guarantee newlines won't be skipped
                                char = this_1.eatChar(offset);
                                return "continue-lexLoop";
                            }
                            else if (char2 == " " || char2 == "\t") {
                                continue;
                            }
                            else if (char2 == null) {
                                tokens.push(new Token(null, TokenType.eoi, null, this_1.line));
                                return "break-lexLoop";
                            }
                            else {
                                throw new Error("Lex Error: Can't mix tabs with spaces for indents!");
                            }
                        }
                    }
                    else if (char == "\n" || char == "\r") {
                        return "continue-lexLoop";
                    }
                    else if (char == null) {
                        tokens.push(new Token(null, TokenType.eoi, null, this_1.line));
                        return "break-lexLoop";
                    }
                    else if (char == "#") {
                        return "continue-lexLoop";
                    }
                    // now we know we've got an indentation, let's see if it's the firstIndent
                    if (usesSpaceIndent == null) {
                        usesSpaceIndent = false;
                        firstIndentCount = indentSize;
                        prevIndentCount = firstIndentCount;
                        tokens.push(new Token("", TokenType.indent, this_1.col - 1, this_1.line));
                    }
                    else {
                        if (usesSpaceIndent) {
                            throw new Error("Lex Error: Cannot mix tab and space indentations!");
                        }
                        if (indentSize % firstIndentCount == 0) {
                            var indentFactor = indentSize / firstIndentCount;
                            var prevIndentFactor = prevIndentCount / firstIndentCount;
                            var indentDiff = indentFactor - prevIndentFactor;
                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;
                            // register a newline if there is no indent or dedent
                            if (indentDiff == 0) {
                                tokens.push(new Token("", TokenType.newline, null, this_1.line));
                                return "continue-lexLoop";
                            }
                            if (indentDiff > 1) {
                                throw new Error("Lex Error: Indentation mismatch, indentation is too much!");
                            }
                            // indent
                            if (indentDiff == 1) {
                                tokens.push(new Token("", TokenType.indent, this_1.col - 1, this_1.line));
                            }
                            else {
                                for (var i = 0; i < (0 - indentDiff); i++) {
                                    tokens.push(new Token("", TokenType.dedent, this_1.col - 1, this_1.line));
                                }
                            }
                        }
                        else {
                            throw new Error("Lex Error: Indentation mismatch!");
                        }
                    }
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
                var col = this_1.col;
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
                tokens.push(new Token(str, TokenType.string, col, this_1.line));
            }
            else if (char == "\"") {
                var str = "";
                var col = this_1.col;
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
                tokens.push(new Token(str, TokenType.string, col, this_1.line));
            }
            else if (char == "#" && this_1.peekChar() != "=") {
                var str = "";
                var col = this_1.col;
                // discard the "#"
                char = this_1.eatChar();
                while (char != "\n" && char != "\r") {
                    str += char;
                    char = this_1.eatChar();
                }
                tokens.push(new Token(str, TokenType.comment, col, this_1.line));
            }
            else if (char == "#" && this_1.peekChar() == "=") {
                var nestCount = 0;
                var str = "";
                var col = this_1.col;
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
                            tokens.push(new Token(str, TokenType.comment, col, this_1.line));
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
                        tokens.push(new Token(str, TokenType.comment, col, this_1.line));
                        // save EOI token
                        tokens.push(new Token(null, TokenType.eoi, null, this_1.line));
                        break;
                    }
                    str += char;
                    char = this_1.eatChar();
                }
            }
            else {
                throw new Error("Lex Error: Character not recognized!");
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
        return tokens;
    };
    // offset should only be used when there is guarantee newlines won't be skipped
    Lexer.prototype.eatChar = function (offset) {
        if (offset === void 0) { offset = 1; }
        this.charPointer += offset;
        if (this.charPointer < this.chars.length) {
            var char = this.chars[this.charPointer];
            // taking note column and line numbers
            if (char == "\n") {
                this.col = 0;
                this.line += 1;
            }
            else
                this.col += offset;
            return char;
        }
        return null;
    };
    // offset should only be used when there is guarantee newlines won't be skipped
    Lexer.prototype.vomitChar = function (offset) {
        if (offset === void 0) { offset = 1; }
        this.charPointer -= offset;
        if (this.charPointer < this.chars.length) {
            var char = this.chars[this.charPointer];
            // taking note column and line numbers
            if (char == "\n") {
                this.col = 0;
                this.line -= 1;
            }
            else
                this.col -= offset;
            return char;
        }
        return null;
    };
    Lexer.prototype.peekChar = function (offset) {
        if (offset === void 0) { offset = 1; }
        var peekPointer = this.charPointer + offset;
        if (peekPointer < this.chars.length)
            return this.chars[peekPointer];
        return null;
    };
    Lexer.prototype.prevChar = function () {
        var peekPointer = this.charPointer - 1;
        if (peekPointer < this.chars.length)
            return this.chars[peekPointer];
        return null;
    };
    return Lexer;
}());
var Parser = (function () {
    function Parser() {
        this.tokenPointer = -1;
    }
    Parser.prototype.parse = function (tokens) {
        this.tokens = tokens;
        return this.parseModule();
    };
    Parser.prototype.parseModule = function () {
        var token = this.eatToken();
        var asts = [];
        while (token != null) {
            if (token.str == "type") {
                var typeAsts = this.parseTypeDef();
                asts.push(typeAsts.type);
                asts.push(typeAsts.initializer);
            }
            else {
                token = this.eatToken(); // skip the token
            }
        }
        return asts;
    };
    Parser.prototype.parseImportDef = function () {
    };
    Parser.prototype.parseExportDef = function () {
    };
    Parser.prototype.parseSubjectDef = function () {
    };
    Parser.prototype.parseParam = function () {
        var subject = null;
        return subject;
    };
    // TODO: INCOMPLETE, initializer train
    Parser.prototype.parseTypeDef = function () {
        var _this = this;
        var type = new TypeDefAst(null, AccessType.public, null, null);
        var initializer = new FunctionDefAst(null, AccessType.public, null, null);
        var token = this.eatToken(); // eat "type"
        // parses type's body
        var subBody = function () {
            var fields = [];
            if (fields != null)
                (type.fields = fields);
        };
        var subParents = function () {
            token = _this.eatToken(); // eat "<"
            token = _this.eatToken(); // eat ":"
            var parents = [];
            do {
                if (token.type == TokenType.identifier) {
                    parents.push(token.str);
                    token = _this.eatToken(); // eat identifier
                }
                else
                    break;
            } while (token.str == ",");
            if (parents != null)
                (type.parents = parents);
        };
        // parses type's parameters
        var subParams = function () {
            // parses variable parameters 
            var subVariableParam = function () {
                var typeVarField = new VariableDefAst(null, null, null, AccessType.public);
                var initializerVarParam = new VariableDefAst(null, null, null, AccessType.private);
                token = _this.eatToken(); // eat "!"
                if (token.type != TokenType.identifier)
                    throw new Error("Parse Error: Expecting an identifier!");
                if (!_this.lastTokenIsNoSpace())
                    throw new Error("Parse Error: Spaces between \"!\" and parameter name not expected!");
                typeVarField.name = token.str;
                initializerVarParam.name = token.str;
                token = _this.eatToken(); // eat identifier 
                if (token.str == ".") {
                    if (!_this.lastTokenIsNoSpace())
                        throw new Error("Parse Error: Spaces between parameter name and \".\" not expected!");
                    initializerVarParam.name += ".";
                    token = _this.eatToken(); // eat the "." 
                    if (token.type == TokenType.identifier) {
                        if (!_this.lastTokenIsNoSpace())
                            throw new Error("Parse Error: Spaces between \".\" and optional local name not expected!");
                        typeVarField.name = token.str;
                        initializerVarParam.name += token.str;
                        token = _this.eatToken(); // eat the identifier 
                    }
                }
                return {
                    typeVarField: typeVarField,
                    initializerVarParam: initializerVarParam
                };
            };
            // parses constant parameters
            var subConstantParam = function () {
                var typeConstField = new VariableDefAst(null, null, null, AccessType.public);
                var initializerConstParam = new VariableDefAst(null, null, null, AccessType.private);
                token = _this.eatToken(); // eat "!"
                if (token.type != TokenType.identifier)
                    throw new Error("Parse Error: Expecting an identifier!");
                if (!_this.lastTokenIsNoSpace())
                    throw new Error("Parse Error: Spaces between \"!\" and parameter name not expected!");
                typeConstField.name = token.str;
                initializerConstParam.name = token.str;
                token = _this.eatToken(); // eat identifier 
                if (token.str == ".") {
                    if (!_this.lastTokenIsNoSpace())
                        throw new Error("Parse Error: Spaces between parameter name and \".\" not expected!");
                    initializerConstParam.name += ".";
                    token = _this.eatToken(); // eat the "." 
                    if (token.type == TokenType.identifier) {
                        if (!_this.lastTokenIsNoSpace())
                            throw new Error("Parse Error: Spaces between \".\" and optional local name not expected!");
                        typeConstField.name = token.str;
                        initializerConstParam.name += token.str;
                        token = _this.eatToken(); // eat the identifier 
                    }
                }
                return {
                    typeConstField: typeConstField,
                    initializerConstParam: initializerConstParam
                };
            };
            var newExpression = new NewAst(null, [], null, null); // for initializer's body
            if (token.str == "!") {
                var varTuple = subVariableParam();
                type.fields = [varTuple.typeVarField];
                initializer.params = [varTuple.initializerVarParam];
                newExpression.fieldMappings.push(varTuple.typeVarField.name);
            }
            else {
                var constTuple = subVariableParam();
                type.fields = [constTuple.typeVarField];
                initializer.params = [constTuple.initializerVarParam];
                newExpression.fieldMappings.push(constTuple.typeVarField.name);
            }
            while (token.str == ",") {
                token = _this.eatToken(); // eat ","
                if (token.str == "!") {
                    var varTuple = subVariableParam();
                    type.fields.push(varTuple.typeVarField);
                    initializer.params.push(varTuple.initializerVarParam);
                    newExpression.fieldMappings.push(varTuple.typeVarField.name);
                }
                else {
                    var constTuple = subVariableParam();
                    type.fields.push(constTuple.typeVarField);
                    initializer.params.push(constTuple.initializerVarParam);
                    newExpression.fieldMappings.push(constTuple.typeVarField.name);
                }
            }
            // since the type has parameters, add initializer's body here
            if (newExpression.fieldMappings != null)
                initializer.body = [newExpression];
        };
        if (token.type != TokenType.identifier)
            throw new Error("Parse Error: Expected a type name!");
        type.name = token.str;
        initializer.name = token.str;
        token = this.eatToken(); // eat identifier (type name)
        // check if identifier has a private access sigil "*" after it
        if (token.str == "*") {
            if (!this.lastTokenIsNoSpace())
                throw new Error("Parse Error: Spaces between type name and \"*\" not expected!");
            type.access = AccessType.private;
            initializer.access = AccessType.private;
            token = this.eatToken(); // eat sigil "*"
        }
        var hasNoParams = true;
        // now to parse the rest of type's syntax
        if (token.str == "!") {
            subParams();
            if (token.str == "<") {
                subParents();
            }
            hasNoParams = false;
        }
        else if (token.type == TokenType.identifier) {
            subParams();
            if (token.str == "<") {
                subParents();
            }
            hasNoParams = false;
        }
        else if (token.str == "<") {
            subParents();
            if (hasNoParams && token.str == ":") {
                subBody();
            }
            if (!hasNoParams)
                throw new Error("Parse Error: Types with parameters can't have body!");
        }
        else if (hasNoParams && token.str == ":") {
            subBody();
        }
        else if (token.type == TokenType.newline) {
        }
        else
            throw new Error("Parse Error: Invalid Syntax!");
        return { type: type, initializer: initializer };
    };
    Parser.prototype.parseEnumDef = function () { };
    Parser.prototype.parseFunctionDef = function () { };
    Parser.prototype.parseObjDef = function () { };
    Parser.prototype.parseFunctionCall = function () { };
    Parser.prototype.eatToken = function () {
        this.tokenPointer += 1;
        if (this.tokens[this.tokenPointer].type == TokenType.ns) {
            this.tokenPointer += 1;
        }
        if (this.tokenPointer < this.tokens.length)
            return this.tokens[this.tokenPointer];
        return null;
    };
    Parser.prototype.prevToken = function () {
        var peekPointer = this.tokenPointer - 1;
        if (this.tokens[peekPointer].type == TokenType.ns) {
            peekPointer -= 1;
        }
        if (this.tokenPointer < this.tokens.length)
            return this.tokens[peekPointer];
        return null;
    };
    Parser.prototype.lastTokenIsNoSpace = function () {
        var peekPointer = this.tokenPointer - 1;
        if (this.tokenPointer < this.tokens.length && this.tokens[peekPointer].type == TokenType.ns)
            return true;
        return false;
    };
    return Parser;
}());
// TODO: INCOMPLETE 
// Asts
var Ast = (function () {
    function Ast() {
    }
    return Ast;
}());
var ExprAst = (function (_super) {
    __extends(ExprAst, _super);
    function ExprAst(ref, type) {
        var _this = _super.call(this) || this;
        _this.ref = ref;
        _this.type = type;
        return _this;
    }
    return ExprAst;
}(Ast));
// Definition
var ImportAst = (function (_super) {
    __extends(ImportAst, _super);
    function ImportAst(moduleName, elements) {
        var _this = _super.call(this) || this;
        _this.moduleName = moduleName;
        _this.elements = elements;
        return _this;
    }
    return ImportAst;
}(Ast));
var ModuleDefAst = (function (_super) {
    __extends(ModuleDefAst, _super);
    function ModuleDefAst(name, body) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.body = body;
        return _this;
    }
    return ModuleDefAst;
}(Ast));
var FunctionDefAst = (function (_super) {
    __extends(FunctionDefAst, _super);
    function FunctionDefAst(name, access, params, body) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.params = params;
        _this.body = body;
        _this.access = access;
        return _this;
    }
    return FunctionDefAst;
}(Ast));
var BlockAst = (function (_super) {
    __extends(BlockAst, _super);
    function BlockAst(name, ref, type, body) {
        var _this = _super.call(this, ref, type) || this;
        _this.name = name;
        _this.body = body;
        return _this;
    }
    return BlockAst;
}(ExprAst));
var TypeDefAst = (function (_super) {
    __extends(TypeDefAst, _super);
    function TypeDefAst(name, access, fields, parents) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.fields = fields;
        _this.access = access;
        _this.parents = parents;
        return _this;
    }
    return TypeDefAst;
}(Ast));
var EnumDefAst = (function (_super) {
    __extends(EnumDefAst, _super);
    function EnumDefAst(name, access, types, fields) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.fields = fields;
        _this.types = types;
        _this.access = access;
        return _this;
    }
    return EnumDefAst;
}(Ast));
// Control // Expressions
var SubjectDefAst = (function (_super) {
    __extends(SubjectDefAst, _super);
    function SubjectDefAst(name, ref, type, access) {
        var _this = _super.call(this, ref, type) || this;
        _this.name = name;
        _this.access = access;
        return _this;
    }
    return SubjectDefAst;
}(ExprAst));
var VariableDefAst = (function (_super) {
    __extends(VariableDefAst, _super);
    function VariableDefAst(name, ref, type, access) {
        return _super.call(this, name, ref, type, access) || this;
    }
    return VariableDefAst;
}(SubjectDefAst));
var ConstantDefAst = (function (_super) {
    __extends(ConstantDefAst, _super);
    function ConstantDefAst(name, ref, type, access) {
        return _super.call(this, name, ref, type, access) || this;
    }
    return ConstantDefAst;
}(SubjectDefAst));
var PropertyDefAst = (function (_super) {
    __extends(PropertyDefAst, _super);
    function PropertyDefAst(name, access, setter, getter) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.access = access;
        _this.setter = setter;
        _this.getter = getter;
        return _this;
    }
    return PropertyDefAst;
}(Ast));
var TryAst = (function (_super) {
    __extends(TryAst, _super);
    function TryAst(body, catchBlock, ensure, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.body = body;
        _this.catchBlock = catchBlock;
        _this.ensure = ensure;
        return _this;
    }
    return TryAst;
}(ExprAst));
var CatchAst = (function (_super) {
    __extends(CatchAst, _super);
    function CatchAst(body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.body = body;
        return _this;
    }
    return CatchAst;
}(ExprAst));
var EnsureAst = (function (_super) {
    __extends(EnsureAst, _super);
    function EnsureAst(body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.body = body;
        return _this;
    }
    return EnsureAst;
}(ExprAst));
// Control
var WhileAst = (function (_super) {
    __extends(WhileAst, _super);
    function WhileAst(condition, body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.condition = condition;
        _this.body = body;
        return _this;
    }
    return WhileAst;
}(ExprAst));
var LoopAst = (function (_super) {
    __extends(LoopAst, _super);
    function LoopAst(body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.body = body;
        return _this;
    }
    return LoopAst;
}(ExprAst));
var IfAst = (function (_super) {
    __extends(IfAst, _super);
    function IfAst(condition, body, ref, type, elifs, elseExpr) {
        var _this = _super.call(this, ref, type) || this;
        _this.condition = condition;
        _this.body = body;
        _this.elifs = elifs;
        _this.elseExpr = elseExpr;
        return _this;
    }
    return IfAst;
}(ExprAst));
var ElifAst = (function (_super) {
    __extends(ElifAst, _super);
    function ElifAst(condition, body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.condition = condition;
        _this.body = body;
        return _this;
    }
    return ElifAst;
}(ExprAst));
var ForLoopAst = (function (_super) {
    __extends(ForLoopAst, _super);
    function ForLoopAst(iteration, body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.iteration = iteration;
        _this.body = body;
        return _this;
    }
    return ForLoopAst;
}(ExprAst));
// Expressions
// type signature is a string of comma seperated typeNames, 
// for function calls, the last typeName is the return type.
var NameAst = (function (_super) {
    __extends(NameAst, _super);
    function NameAst(name, ref, type, module) {
        var _this = _super.call(this, ref, type) || this;
        _this.name = name;
        _this.module = module;
        return _this;
    }
    return NameAst;
}(ExprAst));
var NewAst = (function (_super) {
    __extends(NewAst, _super);
    function NewAst(initializers, fieldMappings, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.initializers = initializers;
        _this.fieldMappings = fieldMappings;
        return _this;
    }
    return NewAst;
}(ExprAst));
var NothingAst = (function (_super) {
    __extends(NothingAst, _super);
    function NothingAst() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NothingAst;
}(ExprAst));
var Spill = (function (_super) {
    __extends(Spill, _super);
    function Spill() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Spill;
}(NothingAst));
var Break = (function (_super) {
    __extends(Break, _super);
    function Break(param, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.param = param;
        return _this;
    }
    return Break;
}(ExprAst));
var Continue = (function (_super) {
    __extends(Continue, _super);
    function Continue(param, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.param = param;
        return _this;
    }
    return Continue;
}(ExprAst));
var Return = (function (_super) {
    __extends(Return, _super);
    function Return(param, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.param = param;
        return _this;
    }
    return Return;
}(ExprAst));
var Yield = (function (_super) {
    __extends(Yield, _super);
    function Yield(param, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.param = param;
        return _this;
    }
    return Yield;
}(ExprAst));
var BooleanAst = (function (_super) {
    __extends(BooleanAst, _super);
    function BooleanAst(bool, ref) {
        var _this = _super.call(this, ref, "Bool") || this;
        _this.bool = bool;
        return _this;
    }
    return BooleanAst;
}(ExprAst));
var FunctionCallAst = (function (_super) {
    __extends(FunctionCallAst, _super);
    function FunctionCallAst(name, args, ref, type, module) {
        var _this = _super.call(this, ref, type) || this;
        _this.name = name;
        _this.args = args;
        _this.module = module;
        return _this;
    }
    return FunctionCallAst;
}(ExprAst));
var StringAst = (function (_super) {
    __extends(StringAst, _super);
    function StringAst(str, ref, custom) {
        var _this = _super.call(this, ref, "RawStr") || this;
        _this.str = str;
        _this.custom = custom;
        return _this;
    }
    return StringAst;
}(ExprAst));
var IntegerAst = (function (_super) {
    __extends(IntegerAst, _super);
    function IntegerAst(num, ref, custom) {
        var _this = _super.call(this, ref, "RawInt") || this;
        _this.num = num;
        _this.custom = custom;
        return _this;
    }
    return IntegerAst;
}(ExprAst));
var FloatAst = (function (_super) {
    __extends(FloatAst, _super);
    function FloatAst(num, ref, custom) {
        var _this = _super.call(this, ref, "RawFloat") || this;
        _this.num = num;
        _this.custom = custom;
        return _this;
    }
    return FloatAst;
}(ExprAst));
var AssignmentAst = (function (_super) {
    __extends(AssignmentAst, _super);
    function AssignmentAst(name, ref, type, rhs) {
        var _this = _super.call(this, ref, type) || this;
        _this.name = name;
        _this.rhs = rhs;
        return _this;
    }
    return AssignmentAst;
}(ExprAst));
var BinaryExprAst = (function (_super) {
    __extends(BinaryExprAst, _super);
    function BinaryExprAst(lhs, op, rhs, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.lhs = lhs;
        _this.op = op;
        _this.rhs = rhs;
        return _this;
    }
    return BinaryExprAst;
}(ExprAst));
var ListAst = (function (_super) {
    __extends(ListAst, _super);
    function ListAst(elements, ref, type, custom) {
        var _this = _super.call(this, ref, type) || this;
        _this.elements = elements;
        _this.custom = custom;
        return _this;
    }
    return ListAst;
}(ExprAst));
var TupleAst = (function (_super) {
    __extends(TupleAst, _super);
    function TupleAst(elements, ref, type, custom) {
        var _this = _super.call(this, ref, type) || this;
        _this.elements = elements;
        _this.custom = custom;
        return _this;
    }
    return TupleAst;
}(ExprAst));
var DictAst = (function (_super) {
    __extends(DictAst, _super);
    function DictAst(keys, values, ref, type, custom) {
        var _this = _super.call(this, ref, type) || this;
        _this.keys = keys;
        _this.values = values;
        _this.custom = custom;
        return _this;
    }
    return DictAst;
}(ExprAst));
// ...
var Utility = (function () {
    function Utility() {
    }
    Utility.printTokens = function (tokens) {
        console.log("ENTRY TOKEN\n------------\n");
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            console.log(token.str + " => type: " + Utility.printTokenType(token.type) + ", col: " + token.col + ", line: " + token.line);
        }
        console.log("\n-----------\nEXIT TOKEN");
    };
    Utility.printAsts = function (asts) {
        console.log("ENTRY AST\n---------\n");
        for (var _i = 0, asts_1 = asts; _i < asts_1.length; _i++) {
            var ast = asts_1[_i];
            console.log(Utility.printAst(ast));
        }
        console.log("\n--------\nEXIT AST");
    };
    // TODO: INCOMPLETE
    Utility.printAst = function (ast, indent) {
        var astTreeStr = "";
        var indentStr = "\n";
        if (indent != null) {
            for (var i = 0; i < indent + 1; i++)
                indentStr += "    ";
        }
        else
            indent = 0;
        if (ast instanceof TypeDefAst) {
            astTreeStr += indentStr + ("Type  " + ast.name); // name
            astTreeStr += indentStr + ("* Access: " + this.printAccessType(ast.access)); // access 
            astTreeStr += indentStr + "* Fields: "; // fields
            if (ast.fields != null)
                for (var _i = 0, _a = ast.fields; _i < _a.length; _i++) {
                    var field = _a[_i];
                    astTreeStr += this.printAst(field, indent);
                }
            else {
                astTreeStr += "\n    null";
            }
            astTreeStr += indentStr + "* Parents: "; // parents
            if (ast.parents != null)
                for (var _b = 0, _c = ast.parents; _b < _c.length; _b++) {
                    var parent_1 = _c[_b];
                    astTreeStr += "\n    " + parent_1;
                }
            else {
                astTreeStr += "\n    null";
            }
        }
        else if (ast instanceof VariableDefAst) {
            astTreeStr += indentStr + ("Var " + ast.name);
            astTreeStr += indentStr + ("* Ref: " + this.printRefType(ast.ref));
            astTreeStr += indentStr + ("* Type: " + ast.type);
            astTreeStr += indentStr + ("* Access: " + ast.access);
        }
        else if (ast instanceof ConstantDefAst) {
            astTreeStr += indentStr + ("Let " + ast.name);
            astTreeStr += indentStr + ("* Ref: " + this.printRefType(ast.ref));
            astTreeStr += indentStr + ("* Type: " + ast.type);
            astTreeStr += indentStr + ("* Access: " + ast.access);
        }
        else if (ast instanceof FunctionDefAst) {
            astTreeStr += indentStr + ("Fun " + ast.name);
            astTreeStr += indentStr + ("* Access: " + ast.access);
            astTreeStr += indentStr + "* Params: ";
            for (var _d = 0, _e = ast.params; _d < _e.length; _d++) {
                var param = _e[_d];
                astTreeStr += this.printAst(param, indent);
            }
            astTreeStr += indentStr + "* Body: ";
            for (var _f = 0, _g = ast.body; _f < _g.length; _f++) {
                var bodyElelement = _g[_f];
                astTreeStr += this.printAst(bodyElelement, indent);
            }
        }
        else {
            astTreeStr += indentStr + "Other";
        }
        return astTreeStr;
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
            case TokenType.newline: return 'NEWLINE';
            case TokenType.indent: return 'INDENT >>';
            case TokenType.dedent: return 'DEDENT <<';
            case TokenType.eoi: return 'EOI';
            case TokenType.ns: return 'NS';
            case null: return 'null';
        }
    };
    Utility.printAccessType = function (accessType) {
        switch (accessType) {
            case AccessType.private: return 'private';
            case AccessType.public: return 'public';
            case AccessType.readOnly: return 'readOnly';
            case null: return 'null';
        }
    };
    Utility.printRefType = function (refType) {
        switch (refType) {
            case RefType.val: return 'val';
            case RefType.ref: return 'ref';
            case RefType.iso: return 'iso';
            case RefType.acq: return 'acq';
            case null: return 'null';
        }
    };
    return Utility;
}());
var Token = (function () {
    function Token(str, type, col, line) {
        this.str = str;
        this.type = type;
        this.col = col;
        this.line = line;
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
    AccessType[AccessType["readOnly"] = 2] = "readOnly";
})(AccessType || (AccessType = {}));
var fs = require("fs");
var fileName1 = './test.ast';
var fileName2 = './test2.ast';
var fileName3 = './test3.ast';
fs.readFile(fileName3, function (err, data) {
    if (err) {
        return console.error(err);
    }
    var tokens = new Lexer().lex(data.toString());
    // let asts = new Parser().parse(tokens);
    Utility.printTokens(tokens);
    // Utility.printAsts(asts);
});
//# sourceMappingURL=parser.js.map