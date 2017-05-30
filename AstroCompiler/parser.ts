// PARSER.TS
// 02/05/17
class Lexer{
    chars: string[];
    charPointer: number = -1;
    decDigits = "0123456789";
    binDigits = "01";
    octDigits = "01234567";
    hexDigits = "0123456789ABCDEF";
    characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    operators = "=+-*\\^&|><!";
    punctuators = ".,;:()[]{}_`";
    keywords: string[] = [
        'var', 'let', 'type', 'fun', 'enum', 'obj',
        'ref', 'iso', 'val', 'acq', 
        'if', 'elif', 'else', 'redo', 'while', 'for', 'in', 'block', 'loop',
        'break', 'spill', 'continue', 'yield', 'return', 
        'catch', 'try', 'raise'
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
                    tokens.push(new Token(str, TokenType.identifier, col, this.line)); 
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
                    if(tokens[tokens.length - 1].type != TokenType.ns, this.col, this.line)
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
                                throw new Error("Lex Error: Can't mix tabs with spaces for indents!");
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
                        if(!usesSpaceIndent){ throw new Error("Lex Error: Cannot mix tab and space indentations!"); }
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
                                throw new Error("Lex Error: Indentation mismatch, indentation is too much!");
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
                            throw new Error("Lex Error: Indentation mismatch!")
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
                                throw new Error("Lex Error: Can't mix tabs with spaces for indents!");
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
                        if(usesSpaceIndent){ throw new Error("Lex Error: Cannot mix tab and space indentations!"); }
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
                            if(indentDiff > 1){ throw new Error("Lex Error: Indentation mismatch, indentation is too much!") }
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
                            throw new Error("Lex Error: Indentation mismatch!")
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
                throw new Error("Lex Error: Character not recognized!");
            }
        }
        return tokens;
    }

    // offset should only be used when there is guarantee newlines won't be skipped
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

     // offset should only be used when there is guarantee newlines won't be skipped
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

    private peekChar(offset: number = 1):string{
        let peekPointer = this.charPointer + offset;
        if(peekPointer < this.chars.length) return this.chars[peekPointer];
        return null;
    }

    private prevChar():string{
        let peekPointer = this.charPointer - 1;
        if(peekPointer < this.chars.length) return this.chars[peekPointer];
        return null;
    }

}

class Parser{
    tokens:Token[];
    tokenPointer:number = -1;
    asts:Ast[];

    public parse(tokens: Array<Token>): Ast[]{
        this.tokens = tokens;
        return this.parseModule();
    }

    private parseModule(): Ast[]{
        let token = this.eatToken();
        let asts: Ast[] = [];

        while(token != null){
            if(token.str == "type"){
                let typeAsts = this.parseTypeDef();
                asts.push(typeAsts.type);
                asts.push(typeAsts.initializer);
            }
            else{
                token = this.eatToken(); // skip the token
            }
        }

        return asts;
    }

    private parseImportDef(){
    }

    private parseExportDef(){
    }

    private parseSubjectDef(){
    }

    private parseParam():SubjectDefAst{
        let subject: SubjectDefAst = null;
        return subject;
    }

    // TODO: INCOMPLETE, initializer train
    private parseTypeDef(): {type: TypeDefAst; initializer: FunctionDefAst} {
        let type = new TypeDefAst(null, AccessType.public, null, null); 
        let initializer = new FunctionDefAst(null, AccessType.public, null, null);
        let token = this.eatToken(); // eat "type"

        // parses type's body
        let subBody = () => {
            let fields: SubjectDefAst[] = [];
            if(fields != null) (type.fields = fields);
        }

        
        let subParents = () => {
            token = this.eatToken(); // eat "<"
            token = this.eatToken(); // eat ":"

            let parents: string[] = [];

            do{
                if(token.type == TokenType.identifier){
                    parents.push(token.str);
                    token = this.eatToken(); // eat identifier
                }
                else break;
            }
            while(token.str == ",");

            if(parents != null) (type.parents = parents);
        }

        // parses type's parameters
        let subParams = () => {
            
            // parses variable parameters 
            let subVariableParam = (): {typeVarField: VariableDefAst, initializerVarParam: VariableDefAst} => {
                let typeVarField = new VariableDefAst(null, null, null, AccessType.public);
                let initializerVarParam = new VariableDefAst(null, null, null, AccessType.private);
                token = this.eatToken(); // eat "!"

                if(token.type != TokenType.identifier) // check for identifier
                throw new Error("Parse Error: Expecting an identifier!");

                if(!this.lastTokenIsNoSpace()) // no space between "!" and parameter name
                throw new Error("Parse Error: Spaces between \"!\" and parameter name not expected!");

                typeVarField.name = token.str; 
                initializerVarParam.name = token.str; 
                token = this.eatToken(); // eat identifier 

                if(token.str == "."){ // check for named parameter sigil "."
                    if(!this.lastTokenIsNoSpace()) // no space between parameter name and "."
                    throw new Error("Parse Error: Spaces between parameter name and \".\" not expected!");
                    
                    initializerVarParam.name += ".";
                    token = this.eatToken(); // eat the "." 

                    if(token.type == TokenType.identifier){ // check for optional local name 
                        if(!this.lastTokenIsNoSpace()) // no space between optional local name and "."
                        throw new Error("Parse Error: Spaces between \".\" and optional local name not expected!");

                        typeVarField.name = token.str;
                        initializerVarParam.name += token.str;
                        token = this.eatToken(); // eat the identifier 
                    }
                }
                return {
                    typeVarField:typeVarField,
                    initializerVarParam:initializerVarParam
                };
            }

            // parses constant parameters
            let subConstantParam = (): {typeConstField: ConstantDefAst, initializerConstParam: ConstantDefAst} => {
                let typeConstField = new VariableDefAst(null, null, null, AccessType.public);
                let initializerConstParam = new VariableDefAst(null, null, null, AccessType.private);
                token = this.eatToken(); // eat "!"

                if(token.type != TokenType.identifier) // check for identifier
                throw new Error("Parse Error: Expecting an identifier!");

                if(!this.lastTokenIsNoSpace()) // no space between "!" and parameter name
                throw new Error("Parse Error: Spaces between \"!\" and parameter name not expected!");

                typeConstField.name = token.str; 
                initializerConstParam.name = token.str; 
                token = this.eatToken(); // eat identifier 

                if(token.str == "."){ // check for named parameter sigil "."
                    if(!this.lastTokenIsNoSpace()) // no space between parameter name and "."
                    throw new Error("Parse Error: Spaces between parameter name and \".\" not expected!");
                    
                    initializerConstParam.name += ".";
                    token = this.eatToken(); // eat the "." 

                    if(token.type == TokenType.identifier){ // check for optional local name 
                        if(!this.lastTokenIsNoSpace()) // no space between optional local name and "."
                        throw new Error("Parse Error: Spaces between \".\" and optional local name not expected!");

                        typeConstField.name = token.str;
                        initializerConstParam.name += token.str;
                        token = this.eatToken(); // eat the identifier 
                    }
                }
                return {
                    typeConstField:typeConstField,
                    initializerConstParam:initializerConstParam
                };
            }
            
            let newExpression = new NewAst(null, [], null, null); // for initializer's body

            if(token.str == "!"){ // variable param
                let varTuple = subVariableParam();
                type.fields = [varTuple.typeVarField];
                initializer.params = [varTuple.initializerVarParam];
                newExpression.fieldMappings.push(varTuple.typeVarField.name);
            }
            else{ // constant param
                let constTuple = subVariableParam();
                type.fields = [constTuple.typeVarField];
                initializer.params = [constTuple.initializerVarParam];
                newExpression.fieldMappings.push(constTuple.typeVarField.name);
            }

            while(token.str == ","){ // possibly more parameters
                token = this.eatToken(); // eat ","

                if(token.str == "!"){ // variable param
                    let varTuple = subVariableParam();
                    type.fields.push(varTuple.typeVarField);
                    initializer.params.push(varTuple.initializerVarParam);
                    newExpression.fieldMappings.push(varTuple.typeVarField.name);
                }
                else{ // constant param
                    let constTuple = subVariableParam();
                    type.fields.push(constTuple.typeVarField);
                    initializer.params.push(constTuple.initializerVarParam);
                    newExpression.fieldMappings.push(constTuple.typeVarField.name);
                }
            }

            // since the type has parameters, add initializer's body here
            if(newExpression.fieldMappings != null) initializer.body = [newExpression];
        }

        if(token.type != TokenType.identifier) // check for identifier (type name)
        throw new Error("Parse Error: Expected a type name!");

        type.name = token.str;
        initializer.name = token.str;
        token = this.eatToken(); // eat identifier (type name)

        // check if identifier has a private access sigil "*" after it
        if(token.str == "*"){
            if(!this.lastTokenIsNoSpace()) // no space between type name and "*" 
            throw new Error("Parse Error: Spaces between type name and \"*\" not expected!");
            type.access = AccessType.private;
            initializer.access = AccessType.private;
            token = this.eatToken(); // eat sigil "*"
        }

        let hasNoParams = true;

        // now to parse the rest of type's syntax
        if(token.str == "!"){ // could be params
            subParams();

            if(token.str == "<"){ // could be parent type declaration
                subParents();
            }

            hasNoParams = false;
        }
        else if(token.type == TokenType.identifier){ // could be params
            subParams();

            if(token.str == "<"){ // could be parent type declaration
                subParents();
            }

            hasNoParams = false;
        }
        else if(token.str == "<"){ // could be parent type declaration
            subParents();

            if(hasNoParams && token.str == ":"){ // could be body definition
                subBody();
            }

            if(!hasNoParams)
            throw new Error("Parse Error: Types with parameters can't have body!");
        }
        else if(hasNoParams && token.str == ":"){ // could be body definition
            subBody();
        }
        else if(token.type == TokenType.newline){ // could be end of type definition
        }
        else throw new Error("Parse Error: Invalid Syntax!");
            
        return {type, initializer};
    }

    private parseEnumDef(){}

    private parseFunctionDef(){}

    private parseObjDef(){}

    private parseFunctionCall(){}

    private eatToken():Token{
        this.tokenPointer += 1;
        if(this.tokens[this.tokenPointer].type == TokenType.ns) { // skip a no-space
            this.tokenPointer += 1;
        }
        if(this.tokenPointer < this.tokens.length) return this.tokens[this.tokenPointer];
        return null;
    }

    private prevToken():Token{
        let peekPointer = this.tokenPointer - 1;
        if(this.tokens[peekPointer].type == TokenType.ns) { // skip a no-space
            peekPointer -= 1;
        }
        if(this.tokenPointer < this.tokens.length) return this.tokens[peekPointer];
        return null;
    }

    private lastTokenIsNoSpace():boolean{
        let peekPointer = this.tokenPointer - 1;
        if(this.tokenPointer < this.tokens.length && this.tokens[peekPointer].type == TokenType.ns) 
            return true;
        return false;
    }


}


// TODO: INCOMPLETE 
// Asts
class Ast{}

class ExprAst extends Ast{
    ref:RefType;
    type:string;
    constructor(ref:RefType, type:string){
        super();
        this.ref = ref;
        this.type = type;
    }
}
 // Definition
class ImportAst extends Ast{
    moduleName:string;
    elements:Array<string>; 
    constructor(moduleName:string, elements:Array<string>){
        super();
        this.moduleName = moduleName; 
        this.elements = elements;
    }
}

class ModuleDefAst extends Ast{
    name:string;
    body:Array<Ast>;
    constructor(name:string, body:Array<Ast>){
        super(); 
        this.name = name;
        this.body = body; 
    }
}

class FunctionDefAst extends Ast{
    name:string;
    access:AccessType;
    params:Array<SubjectDefAst>;
    body:Array<ExprAst>; 
    constructor(name:string, access:AccessType, params:Array<SubjectDefAst>, body:Array<ExprAst>){ 
        super();
        this.name = name; 
        this.params = params; 
        this.body = body;
        this.access = access;
    }
}

class BlockAst extends ExprAst{
    name:string;
    body:Array<ExprAst>; 
    constructor(name:string, ref:RefType, type:string, body:Array<ExprAst>){ 
        super(ref, type);
        this.name = name; 
        this.body = body;
    }
}

class TypeDefAst extends Ast{
    name:string;
    access:AccessType;
    parents:Array<string>;
    fields:Array<SubjectDefAst>; 
    constructor(name:string, access:AccessType, fields:Array<SubjectDefAst>, parents:Array<string>){ 
        super();
        this.name = name; 
        this.fields = fields;
        this.access = access;
        this.parents = parents;
    }
}

class EnumDefAst extends Ast{
    name:string;
    access:AccessType;
    types:Array<TypeDefAst>; // represented as bits
    fields:Array<SubjectDefAst>; 
    constructor(name:string, access:AccessType, types:Array<TypeDefAst>, fields:Array<SubjectDefAst>){ 
        super();
        this.name = name; 
        this.fields = fields;
        this.types = types;
        this.access = access;
    }
}

// Control // Expressions
class SubjectDefAst extends ExprAst{
    name:string;
    access:AccessType;
    constructor(name:string, ref:RefType, type:string, access:AccessType){
        super(ref, type);
        this.name = name; 
        this.access = access;
    }
}

class VariableDefAst extends SubjectDefAst{
    constructor(name:string, ref:RefType, type:string, access:AccessType){
        super(name, ref, type, access);
    }
}

class ConstantDefAst extends SubjectDefAst{
    constructor(name:string, ref:RefType, type:string, access:AccessType){
        super(name, ref, type, access);
    }
}

class PropertyDefAst extends Ast{
    name:string;
    access:AccessType;
    setter:FunctionDefAst;
    getter:FunctionDefAst;
    constructor(name:string, access:AccessType, setter:FunctionDefAst, getter:FunctionDefAst){
        super();
        this.name = name; 
        this.access = access;
        this.setter = setter;
        this.getter = getter;
    }
}

class TryAst extends ExprAst{
    body:Array<ExprAst>; 
    catchBlock:CatchAst;
    ensure:EnsureAst;
    constructor(body:Array<ExprAst>, catchBlock:CatchAst, ensure:EnsureAst, ref:RefType, type:string){
        super(ref, type);
        this.body = body;
        this.catchBlock = catchBlock;
        this.ensure = ensure;
    }
}

class CatchAst extends ExprAst{ 
    body:Array<ExprAst>;
    constructor(body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.body = body;
    }
}

class EnsureAst extends ExprAst{ 
    body:Array<ExprAst>;
    constructor(body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.body = body;
    }
}

// Control
class WhileAst extends ExprAst{
    condition:ExprAst; 
    body:Array<ExprAst>;
    constructor(condition:ExprAst, body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.condition = condition;
        this.body = body;
    }
}

class LoopAst extends ExprAst{
    body:Array<ExprAst>;
    constructor(body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.body = body;
    }
}

class IfAst extends ExprAst{
    condition:ExprAst; 
    body:Array<ExprAst>;
    elifs:Array<ElifAst>;
    elseExpr:Array<ExprAst>;
    constructor(condition:ExprAst, body:Array<ExprAst>, ref:RefType, type:string, elifs:Array<ElifAst>, elseExpr:Array<ExprAst>){
        super(ref, type);
        this.condition = condition;
        this.body = body;
        this.elifs = elifs;
        this.elseExpr = elseExpr;
    }
}

class ElifAst extends ExprAst{
    condition:ExprAst; 
    body:Array<ExprAst>;
    constructor(condition:ExprAst, body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.condition = condition;
        this.body = body;
    }
}

class ForLoopAst extends ExprAst{
    iteration:ExprAst;
    body:Array<ExprAst>;
    constructor(iteration:ExprAst, body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.iteration = iteration;
        this.body = body;
    }
}

// Expressions
// type signature is a string of comma seperated typeNames, 
// for function calls, the last typeName is the return type.
class NameAst extends ExprAst{
    name:ExprAst; // can be dotted
    module:string;
    constructor(name:ExprAst, ref:RefType, type:string, module?:string){ 
        super(ref, type);
        this.name = name;
        this.module = module;
    }
}

class NewAst extends ExprAst{
    initializers: Array<FunctionCallAst>;
    fieldMappings: Array<string>;
    constructor(initializers: Array<FunctionCallAst>, fieldMappings: Array<string>, ref: RefType, type: string){
        super(ref, type);
        this.initializers = initializers;
        this.fieldMappings = fieldMappings;
    }
}

class NothingAst extends ExprAst{
}

class Spill extends NothingAst{
}

class Break extends ExprAst{
    param:ExprAst;
    constructor(param:ExprAst, ref:RefType, type:string){
        super(ref, type);
        this.param = param;
    }
}

class Continue extends ExprAst{
    param:ExprAst;
    constructor(param:ExprAst, ref:RefType, type:string){
        super(ref, type);
        this.param = param;
    }
}

class Return extends ExprAst{
    param:ExprAst;
    constructor(param:ExprAst, ref:RefType, type:string){
        super(ref, type);
        this.param = param;
    }
}

class Yield extends ExprAst{
    param:ExprAst;
    constructor(param:ExprAst, ref:RefType, type:string){
        super(ref, type);
        this.param = param;
    }
}

class BooleanAst extends ExprAst{
    bool: boolean;
    constructor(bool:boolean, ref:RefType){
        super(ref, "Bool");
        this.bool = bool;
    }
}

class FunctionCallAst extends ExprAst{ 
    name:string; // can be dotted
    module:string;
    args:Array<ExprAst>;
    constructor(name:string, args:Array<ExprAst>, ref:RefType, type:string, module:string){
        super(ref, type);
        this.name = name;
        this.args = args; 
        this.module = module; 
    }
}

class StringAst extends ExprAst{
    str: string; 
    custom: string;
    constructor(str:string, ref:RefType, custom:string){
        super(ref, "RawStr");
        this.str = str;
        this.custom = custom;
    }
}

class IntegerAst extends ExprAst{
    num:string; 
    ref:RefType;
    custom:string;
    constructor(num:string, ref:RefType, custom:string){
        super(ref, "RawInt");
        this.num = num;
        this.custom = custom;
    }
}

class FloatAst extends ExprAst{
    num:string;
    custom:string;
    constructor(num:string, ref:RefType, custom:string){
        super(ref, "RawFloat");
        this.num = num;
        this.custom = custom;
    }
}

class AssignmentAst extends ExprAst{
    name:string;
    rhs:ExprAst;
    constructor(name:string, ref:RefType, type:string, rhs:ExprAst){
        super(ref, type)
        this.name = name;
        this.rhs = rhs;
    }
}

class BinaryExprAst extends ExprAst{
    lhs:ExprAst;
    op:string;
    rhs:ExprAst;
    constructor(lhs:ExprAst, op:string, rhs:ExprAst, ref:RefType, type:string){
        super(ref, type)
        this.lhs = lhs;
        this.op = op;
        this.rhs = rhs;
    }
}

class ListAst extends ExprAst{
    elements:Array<ExprAst>; 
    custom:string;
    constructor(elements:Array<ExprAst>, ref:RefType, type:string, custom:string){
        super(ref, type);
        this.elements = elements;
        this.custom = custom;
    }
}

class TupleAst extends ExprAst{
    elements:Array<ExprAst>; 
    custom:string;
    constructor(elements:Array<ExprAst>, ref:RefType, type:string, custom:string){
        super(ref, type);
        this.elements = elements;
        this.custom = custom;
    }
}

class DictAst extends ExprAst{
    keys:Array<ExprAst>; 
    values:Array<ExprAst>; 
    custom:string;
    constructor(keys:Array<ExprAst>, values:Array<ExprAst>, ref:RefType, type:string, custom?:string){
        super(ref, type);
        this.keys = keys;
        this.values = values;
        this.custom = custom;
    }
}

// ...
class Utility{
    public static printTokens(tokens:Array<Token>){
        console.log("ENTRY TOKEN\n------------\n");
        for(let token of tokens){ 
            console.log(`${token.str} => type: ${Utility.printTokenType(token.type)}, col: ${token.col}, line: ${token.line}`);
        }
        console.log("\n-----------\nEXIT TOKEN");
    }

    public static printAsts(asts:Array<Ast>){ // TODO: to be implemented 
        console.log("ENTRY AST\n---------\n");
        for(let ast of asts){
            console.log(Utility.printAst(ast));
        }
        console.log("\n--------\nEXIT AST");
    }
    
    // TODO: INCOMPLETE
    public static printAst(ast:Ast, indent?:number): string { // TODO: to be implemented 
        let astTreeStr:string = "";
        let indentStr:string = "\n";
        if(indent != null){ for(let i = 0; i < indent + 1; i++) indentStr += "    "; }
        else indent = 0;

        if(ast instanceof TypeDefAst){
            astTreeStr += indentStr + `Type  ${ast.name}`; // name
            astTreeStr += indentStr + `* Access: ${this.printAccessType(ast.access)}`; // access 
            astTreeStr += indentStr + `* Fields: `; // fields
            if(ast.fields != null) for(let field of ast.fields) { astTreeStr += this.printAst(field, indent); } 
            else { astTreeStr += `\n    null` }
            astTreeStr += indentStr + `* Parents: `; // parents
            if(ast.parents != null) for(let parent of ast.parents) { astTreeStr += `\n    ${parent}` }
            else { astTreeStr += `\n    null` }
        }
        else if(ast instanceof VariableDefAst){
            astTreeStr += indentStr + `Var ${ast.name}`;
            astTreeStr += indentStr + `* Ref: ${this.printRefType(ast.ref)}`;
            astTreeStr += indentStr + `* Type: ${ast.type}`;
            astTreeStr += indentStr + `* Access: ${ast.access}`;
        }
        else if(ast instanceof ConstantDefAst){
            astTreeStr += indentStr + `Let ${ast.name}`;
            astTreeStr += indentStr + `* Ref: ${this.printRefType(ast.ref)}`;
            astTreeStr += indentStr + `* Type: ${ast.type}`;
            astTreeStr += indentStr + `* Access: ${ast.access}`;
        }
        else if(ast instanceof FunctionDefAst){
            astTreeStr += indentStr + `Fun ${ast.name}`;
            astTreeStr += indentStr + `* Access: ${ast.access}`;
            astTreeStr += indentStr + `* Params: `;
            for(let param of ast.params) { astTreeStr += this.printAst(param, indent); }
            astTreeStr += indentStr + `* Body: `;
            for(let bodyElelement of ast.body) { astTreeStr += this.printAst(bodyElelement, indent); }
        }
        else{
            astTreeStr += indentStr + `Other`;
        }
        return astTreeStr;
    }

    public static printTokenType(tokenType:TokenType):string{
        switch(tokenType){
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
    }

    public static printAccessType(accessType:AccessType):string{
        switch(accessType){
            case AccessType.private: return 'private';
            case AccessType.public: return 'public';
            case AccessType.readOnly: return 'readOnly';
            case null: return 'null';
        }
    }

    public static printRefType(refType:RefType):string{
        switch(refType){
            case RefType.val: return 'val';
            case RefType.ref: return 'ref';
            case RefType.iso: return 'iso';
            case RefType.acq: return 'acq';
            case null: return 'null';
        }
    }
}

class Token{
    type: TokenType; 
    str: string;
    col: number; 
    line: number; 
    constructor(str: string, type: TokenType, col: number, line: number){ 
        this.str = str;
        this.type = type;
        this.col = col;
        this.line = line;
    }
}

// Enums 
enum TokenType{ identifier, number, boolean, string, comment, keyword, operator, punctuator, newline, indent, dedent, eoi, ns }
enum RefType{ ref, val, iso, acq }
enum AccessType{ public, private, readOnly }

import fs = require('fs');

let fileName1 = './test.ast';
let fileName2 = './test2.ast';
let fileName3 = './test3.ast';

fs.readFile(fileName3, function (err, data) {
    if (err) { return console.error(err); }
    let tokens = new Lexer().lex(data.toString());
    // let asts = new Parser().parse(tokens);
    Utility.printTokens(tokens);
    // Utility.printAsts(asts);
});
