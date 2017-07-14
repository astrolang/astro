// 02/05/17
import {Token, TokenType} from "./AstroUtility0.1.0"

export class Lexer{
    chars: string[];
    charPointer = -1;
    decDigits = "0123456789";
    hexDigits = "0123456789ABCDEF";
    characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    operators = "=+-/*\\^&|><×";
    punctuators = ".,;:()[]{}_`~!@";
    keywords: string[] = [
        'var', 'let', 'type', 'fun', 'abst', 'obj', 'rxn',
        'ref', 'iso', 'val', 'acq', 'const', 'new',
        'import', 'export', 'except', 'as', 'src', 'at', 
        'if', 'elif', 'else', 'redo', 'while', 'for', 'in', 'do', 'loop', 'use',
        'break', 'spill', 'continue', 'yield', 'delegate', 'return', 'raise', 'pass', 'await',
        'catch', 'try', 'ensure', 'defer'
        //...
    ];

    // DEBUG HELPERS 
    col = 0;
    line = 1;

    public lex(code:string): Array<Token> {
        if(code === null || code.length < 1) { console.log("Code not present!"); return; }

        this.chars = code.split('');
        let tokens = new Array<Token>();
        let char = this.eatChar();

        let firstIndentCount = 0;
        let indentCount = 0;
        let prevIndentCount = 0;
        let usesSpaceIndent: boolean = null;

        lexLoop:
        while(true) {
            // eoi (end of input)
            if(char === null) { 
                // save token
                tokens.push(new Token(null, TokenType.eoi, this.line, null)); 
                break; 
            }
            // name // keyword // boolean
            else if(this.characters.indexOf(char)>-1) { 
                let str: string = '';
                let col = this.col;

                do{
                    str += char;
                    char = this.eatChar();
                } // [a-zA-Z0-9_]+
                while(char !== null && (this.characters.indexOf(char)>-1 || this.decDigits.indexOf(char)>-1 || char === '_'));
                
                // if underscore is the last letter in the identifier, vomit it back
                if(str.slice(-1) === '_'){
                    str = str.slice(0, -1);
                    char = this.vomitChar();
                }
                
                // save token
                // check if token is a keyword
                if(this.keywords.indexOf(str)>-1){ 
                    tokens.push(new Token(str, TokenType.keyword, this.line, col)); 
                }
                // check if token is a boolean value
                else if(str === "true" || str === "false"){
                    tokens.push(new Token(str, TokenType.boolean, this.line, col)); 
                }
                // if token is none of the above then its probably an identifier
                else { 
                    tokens.push(new Token(str, TokenType.name, this.line, col)); 
                }
            }
            // number // ns
            else if(this.decDigits.indexOf(char)>-1) { 

                let numberType = "dec";
                let isInteger = true;
                let str = char;
                let col = this.col;
                let hasNs = false; // no-space 

                // lexing the exponent
                let subExponent = () => { 
                    if(numberType === "hex") {
                        if(char === "p"){ // [p]
                            isInteger = false;
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else { // [e]
                        if(char === "e") {
                            isInteger = false;
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    // if the exponent mark is followed by negative or positive sign 
                    if(char === '-' || char === '+') {
                        subSign();
                    }
                    // if the exponent mark is followed by number 
                    else if(this.decDigits.indexOf(char)>-1) {
                        subNumberPostExponent();
                    }
                    // otherwise, the exponent mark cannot end a number.
                    else {
                        throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: A number literal can't end with a 'e' or 'p'!`);
                    }
                }
                // lexing the number after the first digit
                let subNumberPostInitial = () => { // (?<[0-9])[0-9_]+
                    if(numberType === "bin"){
                        while(this.decDigits.indexOf(char)>-1 || char === '_') {
                            // if digit is a non-binary digit, then raise an error
                            if(char === "2" || char === "3" || char === "4" || char === "5" || char === "6" || char === "7" ||  char === "8" || char === "9") {
                                throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: A binary literal can't contain non-binary digits!`);
                            }
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType === "oct"){
                        while(this.decDigits.indexOf(char)>-1 || char === '_') {
                            // if digit is a non-octal digit, then raise an error
                            if(char === "8" || char === "9"){
                                throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: An octal literal can't contain non-octal digits!`);
                            }
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType === "hex") {
                        while(this.hexDigits.indexOf(char)>-1 || char === '_') {
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else {
                        while(this.decDigits.indexOf(char)>-1 || char === '_') {
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    if(char === ".") { subDecimal(); }
                    else if(char === "e" || char === "p") { subExponent(); }
                    else if(this.characters.indexOf(char)>-1) { subLetter(); }
                }
                // lexing the number after the decimal point 
                let subNumberPostDecimal = () => { // (?<\.)[0-9_]+
                    if(numberType === "bin"){
                        while(this.decDigits.indexOf(char)>-1 || char === '_') {
                            // if digit is a non-binary digit, then raise an error
                            if(char === "2" || char === "3" || char === "4" || char === "5" || char === "6" || char === "7" ||  char === "8" || char === "9") {
                                throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: A binary literal can't contain non-binary digits!`);
                            }
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType === "oct"){
                        while(this.decDigits.indexOf(char)>-1 || char === '_') {
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType === "hex"){
                        while(this.hexDigits.indexOf(char)>-1 || char === '_') {
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else{
                        while(this.decDigits.indexOf(char)>-1 || char === '_') {
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    if(char === "e" || char === "p"){
                        subExponent();
                    }
                    else if(this.characters.indexOf(char)>-1 || char === '_') {
                        subLetter();
                    }
                }
                // lexing the number after the exponent mark 
                let subNumberPostExponent = () => { // (?<[e][+-]?)[0-9_]+
                    if(numberType === "bin"){
                        while(this.decDigits.indexOf(char)>-1 || char === '_') {
                            // if digit is a non-binary digit, then raise an error
                            if(char === "2" || char === "3" || char === "4" || char === "5" || char === "6" || char === "7" ||  char === "8" || char === "9") {
                                throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: A binary literal can't contain non-binary digits!`);
                            }
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType === "oct") {
                        while(this.decDigits.indexOf(char)>-1 || char === '_') {
                            // if digit is a non-octal digit, then raise an error
                            if(char === "8" || char === "9"){
                                throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: An octal literal can't contain non-octal digits!`);
                            }
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType === "hex") {
                        while(this.hexDigits.indexOf(char)>-1 || char === '_') {
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else {
                        while(this.decDigits.indexOf(char)>-1 || char === '_') {
                            if(char === "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    if(this.characters.indexOf(char)>-1 || char === '_') {
                        subLetter();
                    }
                }
                // lexing the letters at the end of the number
                let subLetter = () => { // [a-zA-Z_]+
                    // if underscore is the last letter of previously lexed number, vomit it back
                    if(this.prevChar() === "_"){
                        char = this.vomitChar();
                    }
                    // DEV NOTE: if a letter follows the number directly, then no-space is registered, 
                    // otherwise the no-space won't be caught
                    else if(this.characters.indexOf(char)>-1) { // register no-space
                        hasNs = true;
                    }
                }
                // lexing the decimal point
                let subDecimal = () => { // [.]
                    if(char === ".") {
                        str += char; 
                        char = this.eatChar();
                    }
                    // if the dot is followed by a number
                    if(this.decDigits.indexOf(char)>-1) {
                        isInteger = false;
                        subNumberPostDecimal();
                    } 
                    // this is a dot operator, vomit
                    else { 
                        str = str.slice(0, -1);
                        char = this.vomitChar();
                    }
                }
                // lexing the sign mark after the exponent mark
                let subSign = () => { // [+-]
                    if(char === '-' || char === '+') {
                        str += char; 
                        char = this.eatChar();
                    }
                    // if the sign is followed by number 
                    if(this.decDigits.indexOf(char)>-1) {
                        subNumberPostExponent();
                    }
                    // otherwise, the sign is seen as an infix plus/minus
                    else {
                        throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: A number literal can't end with a 'e' or 'p'!`);
                    }
                }

                // START POINT //
                char = this.eatChar(); // consume first digit
                if(this.prevChar() === '0') { // check if previously eatenChar is '0'
                    // binary
                    if(char === 'b') numberType = "bin";
                    // octal
                    else if(char === 'o') numberType = "oct";
                    // hexadecimal
                    else if(char === 'x') numberType = "hex";

                    str += char;
                    char = this.eatChar();
                }
                subNumberPostInitial();
                // START POINT //

                // if underscore is the last letter in the number literal, vomit it back
                if(str.slice(-1) === '_') {
                    str = str.slice(0, -1);
                    char = this.vomitChar();
                }
                 // save the number as integer or float
                if(isInteger) { tokens.push(new Token(str, TokenType.integer, this.line, col)); } 
                else { tokens.push(new Token(str, TokenType.float, this.line, col)); }

                // DEV NOTE: if a letter follows the number directly, then no-space is registered, 
                // otherwise the no-space won't be caught
                if(hasNs) tokens.push(new Token("", TokenType.ns, this.line, this.col)); 
            }
            // operator // ns
            else if(this.operators.indexOf(char)>-1) { 
                // check for no-space before punctuator
                let prevChar = this.prevChar();
                if( prevChar !== " " && prevChar !== "\t"){
                    // check if last registered token is not a no-space to prevent duplicates
                    if(tokens.length !== 0 && tokens[tokens.length - 1].type !== TokenType.ns)
                    tokens.push(new Token("", TokenType.ns, this.line, this.col)); 
                }

                tokens.push(new Token(char, TokenType.operator, this.line, this.col)); 
                char = this.eatChar(); // eat punctuator

                // check for no-space after operator
                if(char !== " " && char !==  "\t"){
                    tokens.push(new Token("", TokenType.ns, this.line, this.col)); 
                }
            }
            // punctuator // ns
            else if(this.punctuators.indexOf(char)>-1) { 
                // check for no-space before punctuator
                let prevChar = this.prevChar();
                if( prevChar !== " " && prevChar !== "\t"){
                    // check if last registered token is not a no-space to prevent duplicates
                    if(tokens.length !== 0 && tokens[tokens.length - 1].type !== TokenType.ns)
                    tokens.push(new Token("", TokenType.ns, this.line, this.col)); 
                }

                tokens.push(new Token(char, TokenType.punctuator, this.line, this.col)); 
                char = this.eatChar(); // eat punctuator

                // check for no-space after punctuator
                if(char !== " " && char !== "\t"){
                    tokens.push(new Token("", TokenType.ns, this.line, this.col)); 
                }
            }
            // newline // dedent
            else if(char === "\n" || char === "\r"){

                do{ char = this.eatChar(); }
                while(char === "\n" || char === "\r");

                // DEV NOTE: there's a possibililty of dedent as long as newline is not immediately
                // followed by a space, a tab, a comment or a dedent punctuator (\\)
                if(char !== " " && char !== "\t" && char !== "#" && (char !== "\\" && this.peekChar() !== "\\")){
                    let indentFactor: number = prevIndentCount / firstIndentCount;
                    // if previous indent has an indentation 
                    if(prevIndentCount >= 1){
                        for(let i = 0; i < indentFactor; i++) {
                            tokens.push(new Token("", TokenType.dedent, this.line, this.col - 1));
                        }
                        // now prevIndent has no indent at all
                        prevIndentCount = 0;
                    }
                    else{
                        tokens.push(new Token("", TokenType.newline, this.line, null));
                    }
                }
                // DEV NOTE: if preceded by spaces or tabs, there is a possible indentation information
                // the newline is ignored
            }
            // space // indent // dedent // newline
            else if(char === " "){ 
                // if there is a preceding newline, then this could be an indent
                if(this.prevChar() === "\n" || this.prevChar() === "\r"){
                    do{  
                        indentCount += 1;
                        char = this.eatChar(); 
                    }
                    while(char === " ");

                    // DEV NOTE: pass indentCount to another variable, so that u can set it back to zero
                    // there are some early returns, throws, continues etc everywhere. you dont 
                    // want to forget setting it back to zero.
                    let indentSize = indentCount;
                    indentCount = 0;

                    // if the space indent is followed by a tab
                    if(char === "\t"){ 
                        let offset: number = 0; 
                        let char2: string;
                        while(true){
                            char2 = this.peekChar(++offset);
                            // if all the spaces are followed by newline
                            if(char2 === "\n"){
                                // DEV NOTE: offset should only be used when there is guarantee newlines won't be skipped
                                char = this.eatChar(offset);
                                continue lexLoop;
                            }
                            else if(char2 === " " || char2 === "\t"){
                                continue;
                            }
                            // if all the spaces are followed by EOI
                            else if(char2 === null){
                                continue lexLoop; 
                            }
                            else{
                                throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Can't mix tabs with spaces for indents!`);
                            }
                        }
                    }
                    // if it's followed by a newline, ignore indent
                    else if(char === "\n" || char === "\r"){ continue lexLoop; }
                    // if it's followed by EOI, ignore indent
                    else if(char === null){ continue lexLoop; }
                    // if it's followed by a comment character, ignore indent
                    else if(char === "#"){ continue lexLoop; }

                    // now we know we've got an indentation, let's see if it's the firstIndent
                    if(usesSpaceIndent === null) { 
                        usesSpaceIndent = true;
                        firstIndentCount = indentSize;
                        prevIndentCount = firstIndentCount;
                        tokens.push(new Token("", TokenType.indent, this.line, this.col - 1)); 
                    }
                    // not the first indent
                    else{ 
                        if(!usesSpaceIndent){ throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Cannot mix tab and space indentations!`); }
                        if(indentSize%firstIndentCount === 0){

                            let indentFactor = indentSize/firstIndentCount;
                            let prevIndentFactor = prevIndentCount/firstIndentCount;
                            let indentDiff = indentFactor - prevIndentFactor;

                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;

                            // register a newline if there is no indent or dedent difference
                            if(indentDiff === 0){
                                tokens.push(new Token("", TokenType.newline, this.line, null)); 
                                continue lexLoop;
                            }
                            if(indentDiff > 1){ 
                                throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Indentation mismatch, indentation is too much!`);
                            }
                            // indent
                            if(indentDiff === 1){
                                tokens.push(new Token("", TokenType.indent, this.line, this.col - 1)); 
                            }
                            // dedent
                            else{
                                for(let i = 0; i < (0-indentDiff); i++) {
                                    tokens.push(new Token("", TokenType.dedent, this.line, this.col - 1));
                                }
                            }
                        }
                        else{
                            throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Indentation mismatch!`)
                        }
                    }
                }
                // if the space is the first character in the file
                else if(this.charPointer === 0){ 
                    throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Astro code can't start with an identation!`)
                }
                // not an indent, ignore spaces
                else{ 
                    do { char = this.eatChar(); }
                    while(char === " " || char === "\t");
                }
            }
            // DEV NOTE: tab and space section can be merged
            // tab // indent // dedent // newline 
            else if(char === "\t"){ 
                // if there is a preceding newline, then this could be an indent
                if(this.prevChar() === "\n" || this.prevChar() === "\r"){
                    do{  
                        indentCount += 1;
                        char = this.eatChar(); 
                    }
                    while(char === "\t");

                    // DEV NOTE: pass indentCount to another variable, so that u can set it back to zero
                    // there are some early returns, throws, continues etc everywhere. you dont 
                    // want to forget setting it back to zero.
                    let indentSize = indentCount;
                    indentCount = 0;

                    // if the tab indent is followed by a space
                    if(char === " "){ 
                        let offset: number = 0; 
                        let char2: string;
                        while(true){
                            char2 = this.peekChar(++offset);
                            // if all the spaces are followed by newline
                            if(char2 === "\n"){
                                // DEV NOTE: offset should only be used when there is guarantee newlines won't be skipped
                                char = this.eatChar(offset);
                                continue lexLoop;
                            }
                            else if(char2 === " " || char2 === "\t"){
                                continue;
                            }
                            // if all the spaces are followed by EOI
                            else if(char2 === null){ continue lexLoop; }
                            else{
                                throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Can't mix tabs with spaces for indents!`);
                            }
                        }
                    }
                    // if it's followed by a newline, ignore indent
                    else if(char === "\n" || char === "\r"){ continue lexLoop; }
                    // if it's followed by EOI, ignore indent
                    else if(char === null){ continue lexLoop; }
                    // if it's followed by a comment character, ignore indent
                    else if(char === "#"){ continue lexLoop; }

                    // now we know we've got an indentation, let's see if it's the firstIndent
                    if(usesSpaceIndent === null) {
                        usesSpaceIndent = false;
                        firstIndentCount = indentSize;
                        prevIndentCount = firstIndentCount;
                        tokens.push(new Token("", TokenType.indent, this.line, this.col - 1)); 
                    }
                    // not the first indent
                    else{ 
                        if(usesSpaceIndent){ throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Cannot mix tab and space indentations!`); }
                        if(indentSize%firstIndentCount === 0){
                            let indentFactor = indentSize/firstIndentCount;
                            let prevIndentFactor = prevIndentCount/firstIndentCount;
                            let indentDiff = indentFactor - prevIndentFactor;

                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;

                            // register a newline if there is no indent or dedent
                            if(indentDiff === 0){
                                tokens.push(new Token("", TokenType.newline, this.line, null)); 
                                continue lexLoop;
                            }
                            if(indentDiff > 1){ throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Indentation mismatch, indentation is too much!`) }
                            // indent
                            if(indentDiff === 1){
                                tokens.push(new Token("", TokenType.indent, this.line, this.col - 1)); 
                            }
                            // dedent
                            else{
                                for(let i = 0; i < (0-indentDiff); i++) {
                                    tokens.push(new Token("", TokenType.dedent, this.line, this.col - 1));
                                }
                            }
                        }
                        else{
                            throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Indentation mismatch!`)
                        }
                    }
                }
                // if the tab is the first character in the file
                else if(this.charPointer === 0){ 
                    throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Astro code can't start with an identation!`)
                }
                // not an indent, ignore tabs
                else{     
                    do { char = this.eatChar(); }
                    while(char === " " || char === "\t");
                }
            }
            // single-quote string 
            else if(char === "'"){ 
                let str: string = "";
                let col = this.col;

                // discard the opening quote
                char = this.eatChar();

                while(char !== "'"){
                    // check for EOI
                    if (char === null) 
                        throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Expecting a closing tag!`);
                    str += char;
                    char = this.eatChar();
                }

                // discard the closing quote
                this.eatChar();

                // cache the next character
                char = this.eatChar();

                tokens.push(new Token(str, TokenType.string, this.line, col));

            }
            // double-quote string
            else if(char === "\""){ 
                let str: string = "";
                let col = this.col;

                // discard the opening quote
                char = this.eatChar();

                while(char !== "\""){
                    // check for EOI
                    if (char === null) 
                        throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Expecting a closing tag!`);
                    str += char;
                    char = this.eatChar();
                }

                // discard the closing quote
                this.eatChar();

                // cache the next character
                char = this.eatChar();
                
                tokens.push(new Token(str, TokenType.string, this.line, col));
            }
            // single-line comment 
            else if(char === "#" && this.peekChar() !== "="){ 
                let str: string = "";
                let col = this.col;

                // discard the "#"
                char = this.eatChar();

                while(char !== "\n" && char !== "\r"){
                    // check for EOI
                    if (char === null) {
                        tokens.push(new Token(str, TokenType.comment, this.line, col));
                        continue lexLoop;
                    }
                    str += char;
                    char = this.eatChar();
                }
                
                tokens.push(new Token(str, TokenType.comment, this.line, col));
            }
            // multi-line nested comment
            else if(char === "#" && this.peekChar() === "="){ 
                let nestCount = 0;
                let str: string  = "";
                let col = this.col;

                // discard the '#'
                this.eatChar();
                // discard the '='
                char = this.eatChar();

                while(true){
                    // check for closing mark
                    if(char === "=" && this.peekChar() === "#"){
                        // if outside all nesting
                        if(nestCount === 0){
                            // save comment string 
                            tokens.push(new Token(str, TokenType.comment, this.line, col)); 
                            // discard the '='
                            this.eatChar();
                            // discard the '#'
                            char = this.eatChar();
                            break; 
                        }
                        // outside of a nest, not all.
                        else {
                            nestCount -= 1;
                        }
                    }
                    // check for opening mark
                    else if (char === "#" && this.peekChar() === "="){
                        nestCount += 1;
                    }
                    // check for EOI
                    else if(char === null){
                        throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Expecting a closing tag!`); 
                    }
                    str += char; 
                    char = this.eatChar();
                }
                
            }
            // others. character not recognized
            else { 
                throw new Error(`Lex Error:${this.getErrorToken(tokens).line}:${this.getErrorToken(tokens).col}: Character "${char}" not recognized!`);
            }
        }
        return tokens;
    }

    // UTILITIES //

    // DEV NOTE: offset should only be used when there is guarantee newlines won't be skipped
    private eatChar(offset = 1): string {
        this.charPointer += offset;
        if(this.charPointer < this.chars.length){
            let char = this.chars[this.charPointer];
            // taking note column and line numbers
            if(char === "\n"){ 
                this.col = 0;
                this.line += 1;
            }
            else this.col += offset;
            return char;
        }
        return null;
    }

    // DEV NOTE: offset should only be used when there is guarantee newlines won't be skipped
    private vomitChar(offset = 1): string {
        this.charPointer -= offset;
        if(this.charPointer < this.chars.length) {
            let char = this.chars[this.charPointer];
            // taking note column and line numbers
            if(char === "\n"){ 
                this.col = 0;
                this.line -= 1;
            }
            else this.col -= offset;
            return char;
        }
        return null;
    }

    // peeks at the char in the provided offset
    private peekChar(offset: number = 1):string{
        let peekPointer = this.charPointer + offset;
        if(peekPointer < this.chars.length) return this.chars[peekPointer];
        return null;
    }

    // returns the previous char without decrementing the char pointer
    private prevChar():string{
        let peekPointer = this.charPointer - 1;
        if(peekPointer < this.chars.length) return this.chars[peekPointer];
        return null;
    }

    private getErrorToken(tokens: Token[]): Token {
        if(tokens.length > 1){
            return tokens[tokens.length - 1];
        }
        return new Token("", TokenType.eoi, 1, 1);
    }

}






