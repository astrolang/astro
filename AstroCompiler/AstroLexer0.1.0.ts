// 02/05/17
import {Token, TokenType} from "./AstroUtility0.1.0"

export class Lexer{
    chars: string[];
    charPointer: number = -1;
    decDigits = "0123456789";
    binDigits = "01";
    octDigits = "01234567";
    hexDigits = "0123456789ABCDEF";
    characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    operators = "=+-/*\\^&|><";
    punctuators = ".,;:()[]{}_`~!@";
    keywords: string[] = [
        'var', 'let', 'type', 'fun', 'abst', 'obj', 'rxn',
        'ref', 'iso', 'val', 'acq', 'const', 'new',
        'import', 'export', 'as', 'src', 'at', 
        'if', 'elif', 'else', 'redo', 'while', 'for', 'in', 'do', 'loop', 'use',
        'break', 'spill', 'continue', 'yield', 'delegate', 'return', 'raise', 'pass', 'await',
        'catch', 'try', 'ensure', 'defer'
        //...
    ];
    // debug helpers 
    col: number = 0;
    line: number = 1;

    public lex(code:string):Array<Token>{
        if(code == null || code.length < 1){ console.log("Code not present!"); return; }

        this.chars = code.split('');
        let tokens = new Array<Token>();
        let char:string = this.eatChar();

        let firstIndentCount: number = 0;
        let indentCount: number = 0;
        let prevIndentCount: number = 0;
        let usesSpaceIndent: boolean = null;

        lexLoop:
        while(true){
            // eoi (end of input)
            if(char == null){ 
                // save token
                tokens.push(new Token(null, TokenType.eoi, null, this.line)); 
                break; 
            }
            // identifier // keyword // boolean // ns
            else if(this.characters.indexOf(char)>-1){ 
                let str: string = '';
                let col = this.col;

                do{
                    str += char;
                    char = this.eatChar();
                } // [a-zA-Z0-9_]+
                while(char != null && (this.characters.indexOf(char)>-1 || this.decDigits.indexOf(char)>-1 || char == '_'));
                
                // if underscore is the last letter in the identifier, vomit it back
                if(str.slice(-1) == '_'){
                    str = str.slice(0, -1);
                    char = this.vomitChar();
                }
                
                // save token
                // check if token is a keyword
                if(this.keywords.indexOf(str)>-1){ 
                    tokens.push(new Token(str, TokenType.keyword, col, this.line)); 
                }
                // check if token is a boolean value
                else if(str == "true" || str == "false"){
                    tokens.push(new Token(str, TokenType.boolean, col, this.line)); 
                }
                // if token is none of the above then its probably an identifier
                else { 
                    tokens.push(new Token(str, TokenType.name, col, this.line)); 
                }
            }
            // number // TODO: don't add trailing letters to number
            else if(this.decDigits.indexOf(char)>-1){ 

                let numberType: string = "dec";
                let str: string = char;
                let col = this.col;

                char = this.eatChar();

                // lexing the exponent
                let subExponent = () =>{ // [e]
                    if(numberType == "hex"){
                        if(char == "p"){
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else{
                        if(char == "e"){
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    if(char == '-' || char == '+'){
                        subSign();
                    }
                    else if(this.decDigits.indexOf(char)>-1 || char == '_'){
                        subNumberPostExponent();
                    }
                }
                // lexing the number after the first digit
                let subNumberPostInitial = () => { // (?<[0-9])[0-9_]+
                    if(numberType == "bin"){
                        while(this.binDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType == "oct"){
                        while(this.octDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType == "hex"){
                        while(this.hexDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else{
                        while(this.decDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    if(char == "."){ subDecimal(); }
                    else if(char == "e" || char == "p"){ subExponent(); }
                    else if(this.characters.indexOf(char)>-1 || char == '_'){ subLetter(); }
                }
                // lexing the number after the decimal point 
                let subNumberPostDecimal = () => { // (?<\.)[0-9_]+
                    if(numberType == "bin"){
                        while(this.binDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType == "oct"){
                        while(this.octDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType == "hex"){
                        while(this.hexDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else{
                        while(this.decDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    if(char == "e" || char == "p"){
                        subExponent();
                    }
                    else if(this.characters.indexOf(char)>-1 || char == '_'){
                        subLetter();
                    }
                }
                // lexing the number after the exponent mark 
                let subNumberPostExponent = () => { // (?<[e][+-]?)[0-9_]+
                    if(numberType == "bin"){
                        while(this.binDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType == "oct"){
                        while(this.octDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else if(numberType == "hex"){
                        while(this.hexDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    else{
                        while(this.decDigits.indexOf(char)>-1 || char == '_'){
                            if(char == "_") { char = this.eatChar(); continue; } // ignore the underscores
                            str += char; 
                            char = this.eatChar();
                        }
                    }
                    if(this.characters.indexOf(char)>-1 || char == '_'){
                        subLetter();
                    }
                }
                // lexing the letters at the end of the number
                let subLetter = () => { // [a-zA-Z_]+
                    // while(this.characters.indexOf(char)>-1 || char == '_'){
                    //     str += char; 
                    //     char = this.eatChar();
                    // }  
                    // if underscore is the last letter of previously lexed number, vomit it back
                    if(this.prevChar() == "_"){
                        char = this.vomitChar();
                    }
                }
                // lexing the decimal point
                let subDecimal = () => { // [.]
                    if(char == "."){
                        str += char; 
                        char = this.eatChar();
                    }
                    if(this.decDigits.indexOf(char)>-1 || char == '_'){
                        subNumberPostDecimal();
                    }
                }
                // lexing the sign mark after the exponent mark
                let subSign = () => { // [+-]
                    if(char == '-' || char == '+'){
                        str += char; 
                        char = this.eatChar();
                    }
                    if(this.decDigits.indexOf(char)>-1 || char == '_'){
                        subNumberPostExponent();
                    }
                }
                // start point
                if(this.prevChar()=='0'){ // check if previously eatenChar is '0'
                    // binary
                    if(char == 'b' || char == 'B') numberType = "bin";
                    // octal
                    else if(char == 'o' || char == 'O') numberType = "dec";
                    // hexadecimal
                    else if(char == 'x' || char == 'X') numberType = "hex";
                    str += char;
                    char = this.eatChar();
                }
                subNumberPostInitial();

                // if underscore is the last letter in the number literal, vomit it back
                if(str.slice(-1) == '_'){
                    str = str.slice(0, -1);
                    char = this.vomitChar();
                }
                
                tokens.push(new Token(str, TokenType.number, col, this.line)); 
            }
            // operator // ns
            else if(this.operators.indexOf(char)>-1){ 
                // check for no-space before punctuator
                let prevChar = this.prevChar();
                if( prevChar != " " && prevChar != "\t"){
                    // check if last registered token is not a no-space to prevent duplicates
                    if(tokens[tokens.length - 1].type != TokenType.ns)
                    tokens.push(new Token("", TokenType.ns, this.col, this.line)); 
                }

                tokens.push(new Token(char, TokenType.operator, this.col, this.line)); 
                char = this.eatChar(); // eat punctuator

                // check for no-space after operator
                if(char != " " && char !=  "\t"){
                    tokens.push(new Token("", TokenType.ns, this.col, this.line)); 
                }
            }
            // punctuator // ns
            else if(this.punctuators.indexOf(char)>-1){ 
                // check for no-space before punctuator
                let prevChar = this.prevChar();
                if( prevChar != " " && prevChar != "\t"){
                    // check if last registered token is not a no-space to prevent duplicates
                    if(tokens[tokens.length - 1].type != TokenType.ns)
                    tokens.push(new Token("", TokenType.ns, this.col, this.line)); 
                }

                tokens.push(new Token(char, TokenType.punctuator, this.col, this.line)); 
                char = this.eatChar(); // eat punctuator

                // check for no-space after punctuator
                if(char != " " && char != "\t"){
                    tokens.push(new Token("", TokenType.ns, this.col, this.line)); 
                }
            }
            // newline // dedent
            else if(char == "\n" || char == "\r"){

                do{ char = this.eatChar(); }
                while(char == "\n" || char == "\r");

                // there's a possibililty of dedent as long as newline is not immediately
                // followed by spaces, tab or a comment
                if(char != " " && char != "\t" && char != "#"){
                    let indentFactor: number = prevIndentCount / firstIndentCount;
                    // if previous indent has an indentation 
                    if(prevIndentCount >= 1){
                        for(let i = 0; i < indentFactor; i++) {
                            tokens.push(new Token("", TokenType.dedent, this.col - 1, this.line));
                        }
                        // now prevIndent has no indent at all
                        prevIndentCount = 0;
                    }
                    else{
                        tokens.push(new Token("", TokenType.newline, null, this.line));
                    }
                }
                // if preceded by spaces or tabs, there is a possible indentation information
                // the newline is ignored
            }
            // space // indent // dedent // newline // eoi
            else if(char == " "){ 
                // if there is a preceding newline, then this could be an indent
                if(this.prevChar() == "\n" || this.prevChar() == "\r"){
                    do{  
                        indentCount += 1;
                        char = this.eatChar(); 
                    }
                    while(char == " ");

                    // pass indentCount to another variable, so that u can st it back to zero
                    // there are some early returns, throws, continues etec everywhere. you dont 
                    // want to forget setting it back to zero.
                    let indentSize = indentCount;
                    indentCount = 0;

                    // if the space indent is followed by a tab
                    if(char == "\t"){ 
                        let offset: number = 0; 
                        let char2: string;
                        while(true){
                            char2 = this.peekChar(++offset);
                            // if all the spaces are followed by newline
                            if(char2 == "\n"){
                                // offset should only be used when there is guarantee newlines won't be skipped
                                char = this.eatChar(offset);
                                continue lexLoop;
                            }
                            else if(char2 == " " || char2 == "\t"){
                                continue;
                            }
                            // if all the spaces are followed by a null
                            else if(char2 == null){
                                tokens.push(new Token(null, TokenType.eoi, null, this.line)); 
                                break lexLoop; 
                            }
                            else{
                                throw new Error(`Lex Error:${tokens[tokens.length - 1].line}:${tokens[tokens.length - 1].line}: Can't mix tabs with spaces for indents!`);
                            }
                        }
                    }
                    // if it's followed by a newline, ignore indent
                    else if(char == "\n" || char == "\r"){ continue lexLoop; }
                    // if it's followed by a null, ignore indent
                    else if(char == null){ 
                        tokens.push(new Token(null, TokenType.eoi, null, this.line)); 
                        break lexLoop;  
                    }
                    // if it's followed by a comment character, ignore indent
                    else if(char == "#"){ continue lexLoop; }

                    // now we know we've got an indentation, let's see if it's the firstIndent
                    if(usesSpaceIndent == null) { 
                        usesSpaceIndent = true;
                        firstIndentCount = indentSize;
                        prevIndentCount = firstIndentCount;
                        tokens.push(new Token("", TokenType.indent, this.col - 1, this.line)); 
                    }
                    // not the first indent
                    else{ 
                        if(!usesSpaceIndent){ throw new Error(`Lex Error:${tokens[tokens.length - 1].line}:${tokens[tokens.length - 1].line}: Cannot mix tab and space indentations!`); }
                        if(indentSize%firstIndentCount == 0){

                            let indentFactor = indentSize/firstIndentCount;
                            let prevIndentFactor = prevIndentCount/firstIndentCount;
                            let indentDiff = indentFactor - prevIndentFactor;

                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;

                            // register a newline if there is no indent or dedent difference
                            if(indentDiff == 0){
                                tokens.push(new Token("", TokenType.newline, null, this.line)); 
                                continue lexLoop;
                            }
                            if(indentDiff > 1){ 
                                throw new Error(`Lex Error:${tokens[tokens.length - 1].line}:${tokens[tokens.length - 1].line}: Indentation mismatch, indentation is too much!`);
                            }
                            // indent
                            if(indentDiff == 1){
                                tokens.push(new Token("", TokenType.indent, this.col - 1, this.line)); 
                            }
                            // dedent
                            else{
                                for(let i = 0; i < (0-indentDiff); i++) {
                                    tokens.push(new Token("", TokenType.dedent, this.col - 1, this.line));
                                }
                            }
                        }
                        else{
                            throw new Error(`Lex Error:${tokens[tokens.length - 1].line}:${tokens[tokens.length - 1].line}: Indentation mismatch!`)
                        }
                    }
                }
                // not an indent, ignore spaces
                else{ 
                    do { char = this.eatChar(); }
                    while(char == " " || char == "\t");
                }
            }
            // tab // indent // dedent // newline // eoi
            else if(char == "\t"){ 
                // if there is a preceding newline, then this could be an indent
                if(this.prevChar() == "\n" || this.prevChar() == "\r"){
                    do{  
                        indentCount += 1;
                        char = this.eatChar(); 
                    }
                    while(char == "\t");

                    // pass indentCount to another variable, so that u can st it back to zero
                    // there are some early returns, throws, continues etec everywhere. you dont 
                    // want to forget setting it back to zero.
                    let indentSize = indentCount;
                    indentCount = 0;

                    // if the tab indent is followed by a space
                    if(char == " "){ 
                        let offset: number = 0; 
                        let char2: string;
                        while(true){
                            char2 = this.peekChar(++offset);
                            // if all the spaces are followed by newline
                            if(char2 == "\n"){
                                // offset should only be used when there is guarantee newlines won't be skipped
                                char = this.eatChar(offset);
                                continue lexLoop;
                            }
                            else if(char2 == " " || char2 == "\t"){
                                continue;
                            }
                            // if all the spaces are followed by a null
                            else if(char2 == null){
                                tokens.push(new Token(null, TokenType.eoi, null, this.line)); 
                                break lexLoop; 
                            }
                            else{
                                throw new Error(`Lex Error:${tokens[tokens.length - 1].line}:${tokens[tokens.length - 1].line}: Can't mix tabs with spaces for indents!`);
                            }
                        }
                    }
                    // if it's followed by a newline, ignore indent
                    else if(char == "\n" || char == "\r"){ continue lexLoop; }
                    // if it's followed by a null, ignore indent
                    else if(char == null){
                        tokens.push(new Token(null, TokenType.eoi, null, this.line)); 
                        break lexLoop;  
                    }
                    // if it's followed by a comment character, ignore indent
                    else if(char == "#"){ continue lexLoop; }

                    // now we know we've got an indentation, let's see if it's the firstIndent
                    if(usesSpaceIndent == null) {
                        usesSpaceIndent = false;
                        firstIndentCount = indentSize;
                        prevIndentCount = firstIndentCount;
                        tokens.push(new Token("", TokenType.indent, this.col - 1, this.line)); 
                    }
                    // not the first indent
                    else{ 
                        if(usesSpaceIndent){ throw new Error(`Lex Error:${tokens[tokens.length - 1].line}:${tokens[tokens.length - 1].line}: Cannot mix tab and space indentations!`); }
                        if(indentSize%firstIndentCount == 0){
                            let indentFactor = indentSize/firstIndentCount;
                            let prevIndentFactor = prevIndentCount/firstIndentCount;
                            let indentDiff = indentFactor - prevIndentFactor;

                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;

                            // register a newline if there is no indent or dedent
                            if(indentDiff == 0){
                                tokens.push(new Token("", TokenType.newline, null, this.line)); 
                                continue lexLoop;
                            }
                            if(indentDiff > 1){ throw new Error(`Lex Error:${tokens[tokens.length - 1].line}:${tokens[tokens.length - 1].line}: Indentation mismatch, indentation is too much!`) }
                            // indent
                            if(indentDiff == 1){
                                tokens.push(new Token("", TokenType.indent, this.col - 1, this.line)); 
                            }
                            // dedent
                            else{
                                for(let i = 0; i < (0-indentDiff); i++) {
                                    tokens.push(new Token("", TokenType.dedent, this.col - 1, this.line));
                                }
                            }
                        }
                        else{
                            throw new Error(`Lex Error:${tokens[tokens.length - 1].line}:${tokens[tokens.length - 1].line}: Indentation mismatch!`)
                        }
                    }
                }
                // not an indent, ignore tabs
                else{     
                    do { char = this.eatChar(); }
                    while(char == " " || char == "\t");
                    // console.log("[ ]" + ": {TAB}"); 
                }
            }
            // single-quote string 
            else if(char == "'"){ 
                let str: string = "";
                let col = this.col;

                // discard the opening quote
                char = this.eatChar();

                while(char != "'"){
                    str += char;
                    char = this.eatChar();
                }

                // discard the closing quote
                this.eatChar();

                // cache the next character
                char = this.eatChar();

                tokens.push(new Token(str, TokenType.string, col, this.line));

            }
            // double-quote string
            else if(char == "\""){ 
                let str: string = "";
                let col = this.col;

                // discard the opening quote
                char = this.eatChar();

                while(char != "\""){
                    str += char;
                    char = this.eatChar();
                }

                // discard the closing quote
                this.eatChar();

                // cache the next character
                char = this.eatChar();
                
                tokens.push(new Token(str, TokenType.string, col, this.line));
            }
            // single-line comment 
            else if(char == "#" && this.peekChar() != "="){ 
                let str: string = "";
                let col = this.col;

                // discard the "#"
                char = this.eatChar();

                while(char != "\n" && char != "\r"){
                    str += char;
                    char = this.eatChar();
                }
                
                tokens.push(new Token(str, TokenType.comment, col, this.line));
            }
            // multi-line nested comment
            else if(char == "#" && this.peekChar() == "="){ 
                let nestCount = 0;
                let str: string  = "";
                let col = this.col;

                // discard the '#'
                this.eatChar();
                // discard the '='
                char = this.eatChar();

                while(true){
                    // check for closing mark
                    if(char == "=" && this.peekChar() == "#"){
                        // if outside all nesting
                        if(nestCount == 0){
                            // save comment string 
                            tokens.push(new Token(str, TokenType.comment, col, this.line)); 
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
                    else if (char == "#" && this.peekChar() == "="){
                        nestCount += 1;
                    }
                    // check for EOI
                    else if(char == null){
                        // save comment string
                        tokens.push(new Token(str, TokenType.comment, col, this.line)); 
                        // save EOI token
                        tokens.push(new Token(null, TokenType.eoi, null, this.line)); 
                        break; 
                    }
                    str += char; 
                    char = this.eatChar();
                }
                
            }
            // others. character not recognized
            else { 
                throw new Error(`Lex Error:${tokens[tokens.length - 1].line}:${tokens[tokens.length - 1].line}: Character not recognized!`);
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
            if(char == "\n"){ 
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
            if(char == "\n"){ 
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

}






