"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 02/05/17
var AstroUtility0_1_0_1 = require("./AstroUtility0.1.0");
var Lexer = (function () {
    function Lexer() {
        this.charPointer = -1;
        this.decDigits = "0123456789";
        this.binDigits = "01";
        this.octDigits = "01234567";
        this.hexDigits = "0123456789ABCDEF";
        this.characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.operators = "=+-/*\\^&|><!";
        this.punctuators = ".,;:()[]{}_`~";
        this.keywords = [
            'var', 'let', 'type', 'fun', 'abst', 'obj', 'rxn',
            'ref', 'iso', 'val', 'acq', 'const', 'new',
            'import', 'export', 'as', 'src', 'at',
            'if', 'elif', 'else', 'redo', 'while', 'for', 'in', 'do', 'loop', 'use',
            'break', 'spill', 'continue', 'yield', 'delegate', 'return', 'raise', 'pass', 'await',
            'catch', 'try', 'ensure', 'defer'
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
                tokens.push(new AstroUtility0_1_0_1.Token(null, AstroUtility0_1_0_1.TokenType.eoi, null, this_1.line));
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
                    tokens.push(new AstroUtility0_1_0_1.Token(str, AstroUtility0_1_0_1.TokenType.keyword, col, this_1.line));
                }
                else if (str == "true" || str == "false") {
                    tokens.push(new AstroUtility0_1_0_1.Token(str, AstroUtility0_1_0_1.TokenType.boolean, col, this_1.line));
                }
                else {
                    tokens.push(new AstroUtility0_1_0_1.Token(str, AstroUtility0_1_0_1.TokenType.name, col, this_1.line));
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
                tokens.push(new AstroUtility0_1_0_1.Token(str_1, AstroUtility0_1_0_1.TokenType.number, col, this_1.line));
            }
            else if (this_1.operators.indexOf(char) > -1) {
                // check for no-space before punctuator
                var prevChar = this_1.prevChar();
                if (prevChar != " " && prevChar != "\t") {
                    // check if last registered token is not a no-space to prevent duplicates
                    if (tokens[tokens.length - 1].type != AstroUtility0_1_0_1.TokenType.ns)
                        tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.ns, this_1.col, this_1.line));
                }
                tokens.push(new AstroUtility0_1_0_1.Token(char, AstroUtility0_1_0_1.TokenType.operator, this_1.col, this_1.line));
                char = this_1.eatChar(); // eat punctuator
                // check for no-space after operator
                if (char != " " && char != "\t") {
                    tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.ns, this_1.col, this_1.line));
                }
            }
            else if (this_1.punctuators.indexOf(char) > -1) {
                // check for no-space before punctuator
                var prevChar = this_1.prevChar();
                if (prevChar != " " && prevChar != "\t") {
                    // check if last registered token is not a no-space to prevent duplicates
                    if (tokens[tokens.length - 1].type != AstroUtility0_1_0_1.TokenType.ns)
                        tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.ns, this_1.col, this_1.line));
                }
                tokens.push(new AstroUtility0_1_0_1.Token(char, AstroUtility0_1_0_1.TokenType.punctuator, this_1.col, this_1.line));
                char = this_1.eatChar(); // eat punctuator
                // check for no-space after punctuator
                if (char != " " && char != "\t") {
                    tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.ns, this_1.col, this_1.line));
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
                            tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.dedent, this_1.col - 1, this_1.line));
                        }
                        // now prevIndent has no indent at all
                        prevIndentCount = 0;
                    }
                    else {
                        tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.newline, null, this_1.line));
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
                                tokens.push(new AstroUtility0_1_0_1.Token(null, AstroUtility0_1_0_1.TokenType.eoi, null, this_1.line));
                                return "break-lexLoop";
                            }
                            else {
                                throw new Error("Lex Error:" + tokens[tokens.length - 1].line + ":" + tokens[tokens.length - 1].line + ": Can't mix tabs with spaces for indents!");
                            }
                        }
                    }
                    else if (char == "\n" || char == "\r") {
                        return "continue-lexLoop";
                    }
                    else if (char == null) {
                        tokens.push(new AstroUtility0_1_0_1.Token(null, AstroUtility0_1_0_1.TokenType.eoi, null, this_1.line));
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
                        tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.indent, this_1.col - 1, this_1.line));
                    }
                    else {
                        if (!usesSpaceIndent) {
                            throw new Error("Lex Error:" + tokens[tokens.length - 1].line + ":" + tokens[tokens.length - 1].line + ": Cannot mix tab and space indentations!");
                        }
                        if (indentSize % firstIndentCount == 0) {
                            var indentFactor = indentSize / firstIndentCount;
                            var prevIndentFactor = prevIndentCount / firstIndentCount;
                            var indentDiff = indentFactor - prevIndentFactor;
                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;
                            // register a newline if there is no indent or dedent difference
                            if (indentDiff == 0) {
                                tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.newline, null, this_1.line));
                                return "continue-lexLoop";
                            }
                            if (indentDiff > 1) {
                                throw new Error("Lex Error:" + tokens[tokens.length - 1].line + ":" + tokens[tokens.length - 1].line + ": Indentation mismatch, indentation is too much!");
                            }
                            // indent
                            if (indentDiff == 1) {
                                tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.indent, this_1.col - 1, this_1.line));
                            }
                            else {
                                for (var i = 0; i < (0 - indentDiff); i++) {
                                    tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.dedent, this_1.col - 1, this_1.line));
                                }
                            }
                        }
                        else {
                            throw new Error("Lex Error:" + tokens[tokens.length - 1].line + ":" + tokens[tokens.length - 1].line + ": Indentation mismatch!");
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
                                tokens.push(new AstroUtility0_1_0_1.Token(null, AstroUtility0_1_0_1.TokenType.eoi, null, this_1.line));
                                return "break-lexLoop";
                            }
                            else {
                                throw new Error("Lex Error:" + tokens[tokens.length - 1].line + ":" + tokens[tokens.length - 1].line + ": Can't mix tabs with spaces for indents!");
                            }
                        }
                    }
                    else if (char == "\n" || char == "\r") {
                        return "continue-lexLoop";
                    }
                    else if (char == null) {
                        tokens.push(new AstroUtility0_1_0_1.Token(null, AstroUtility0_1_0_1.TokenType.eoi, null, this_1.line));
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
                        tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.indent, this_1.col - 1, this_1.line));
                    }
                    else {
                        if (usesSpaceIndent) {
                            throw new Error("Lex Error:" + tokens[tokens.length - 1].line + ":" + tokens[tokens.length - 1].line + ": Cannot mix tab and space indentations!");
                        }
                        if (indentSize % firstIndentCount == 0) {
                            var indentFactor = indentSize / firstIndentCount;
                            var prevIndentFactor = prevIndentCount / firstIndentCount;
                            var indentDiff = indentFactor - prevIndentFactor;
                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;
                            // register a newline if there is no indent or dedent
                            if (indentDiff == 0) {
                                tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.newline, null, this_1.line));
                                return "continue-lexLoop";
                            }
                            if (indentDiff > 1) {
                                throw new Error("Lex Error:" + tokens[tokens.length - 1].line + ":" + tokens[tokens.length - 1].line + ": Indentation mismatch, indentation is too much!");
                            }
                            // indent
                            if (indentDiff == 1) {
                                tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.indent, this_1.col - 1, this_1.line));
                            }
                            else {
                                for (var i = 0; i < (0 - indentDiff); i++) {
                                    tokens.push(new AstroUtility0_1_0_1.Token("", AstroUtility0_1_0_1.TokenType.dedent, this_1.col - 1, this_1.line));
                                }
                            }
                        }
                        else {
                            throw new Error("Lex Error:" + tokens[tokens.length - 1].line + ":" + tokens[tokens.length - 1].line + ": Indentation mismatch!");
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
                tokens.push(new AstroUtility0_1_0_1.Token(str, AstroUtility0_1_0_1.TokenType.string, col, this_1.line));
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
                tokens.push(new AstroUtility0_1_0_1.Token(str, AstroUtility0_1_0_1.TokenType.string, col, this_1.line));
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
                tokens.push(new AstroUtility0_1_0_1.Token(str, AstroUtility0_1_0_1.TokenType.comment, col, this_1.line));
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
                            tokens.push(new AstroUtility0_1_0_1.Token(str, AstroUtility0_1_0_1.TokenType.comment, col, this_1.line));
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
                        tokens.push(new AstroUtility0_1_0_1.Token(str, AstroUtility0_1_0_1.TokenType.comment, col, this_1.line));
                        // save EOI token
                        tokens.push(new AstroUtility0_1_0_1.Token(null, AstroUtility0_1_0_1.TokenType.eoi, null, this_1.line));
                        break;
                    }
                    str += char;
                    char = this_1.eatChar();
                }
            }
            else {
                throw new Error("Lex Error:" + tokens[tokens.length - 1].line + ":" + tokens[tokens.length - 1].line + ": Character not recognized!");
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
    // UTILITIES //
    // DEV NOTE: offset should only be used when there is guarantee newlines won't be skipped
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
    // DEV NOTE: offset should only be used when there is guarantee newlines won't be skipped
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
    // peeks at the char in the provided offset
    Lexer.prototype.peekChar = function (offset) {
        if (offset === void 0) { offset = 1; }
        var peekPointer = this.charPointer + offset;
        if (peekPointer < this.chars.length)
            return this.chars[peekPointer];
        return null;
    };
    // returns the previous char without decrementing the char pointer
    Lexer.prototype.prevChar = function () {
        var peekPointer = this.charPointer - 1;
        if (peekPointer < this.chars.length)
            return this.chars[peekPointer];
        return null;
    };
    return Lexer;
}());
exports.Lexer = Lexer;
//# sourceMappingURL=AstroLexer0.1.0.js.map