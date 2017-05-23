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
                tokens.push(new Token(null, TokenType.eoi)); 
                break; 
            }
            // identifier // keyword // boolean // ns
            else if(this.characters.indexOf(char)>-1){ 
                let str: string = '';
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
                    tokens.push(new Token(str, TokenType.keyword)); 
                }
                // check if token is a boolean value
                else if(str == "true" || str == "false"){
                    tokens.push(new Token(str, TokenType.boolean)); 
                }
                // if token is none of the above then its probably an identifier
                else { 
                    tokens.push(new Token(str, TokenType.identifier)); 
                }
            }
            // number // TODO: don't add trailing letters to number
            else if(this.decDigits.indexOf(char)>-1){ 

                let numberType: string = "dec";
                let str: string = char;
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
                
                tokens.push(new Token(str, TokenType.number)); 
            }
            // operator // ns
            else if(this.operators.indexOf(char)>-1){ 
                tokens.push(new Token(char, TokenType.operator)); 
                char = this.eatChar();
                // check for no-space after operator
                if(char != " " && char !=  "\t"){
                    tokens.push(new Token("", TokenType.ns)); 
                }
            }
            // punctuator // ns
            else if(this.punctuators.indexOf(char)>-1){ 
                tokens.push(new Token(char, TokenType.punctuator)); 
                char = this.eatChar();
                // check for no-space after punctuator
                if(char != " " && char !=  "\t"){
                    tokens.push(new Token("", TokenType.ns)); 
                }
            }
            // newline // dedent
            else if(char == "\n" || char == "\r"){

                do{ char = this.eatChar(); }
                while(char == "\n" || char == "\r");

                // checking for a possible dedent
                if(char != " " && char != "\t"){
                    let indentFactor: number = prevIndentCount / firstIndentCount;
                    // if previous indent has an indentation 
                    if(prevIndentCount >= 1){
                        for(let i = 0; i < indentFactor; i++) {
                            tokens.push(new Token("", TokenType.dedent));
                        }
                        // now prevIndent has no indent at all
                        prevIndentCount = 0;
                    }
                    else{
                        tokens.push(new Token("", TokenType.newline));
                    }
                }
                // if preceded by spaces or tabs, there is a possible indentation information
                // the newline is ignored
            }
            // space // indent // dedent
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
                                char = this.eatChar(offset);
                                continue lexLoop;
                            }
                            else if(char2 == " " || char2 == "\t"){
                                continue;
                            }
                            // if all the spaces are followed by a null
                            else if(char2 == null){
                                tokens.push(new Token(null, TokenType.eoi)); 
                                break lexLoop; 
                            }
                            else{
                                throw new Error("Error 1: Can't mix tabs with spaces for indents!");
                            }
                        }
                    }
                    // if it's followed by a newline, ignore indent
                    else if(char == "\n" || char == "\r"){ continue lexLoop; }
                    // if it's followed by a null, ignore indent
                    else if(char == null){ 
                        tokens.push(new Token(null, TokenType.eoi)); 
                        break lexLoop;  
                    }

                    // now we know we've got an indentation, let's see if it's the firstIndent, an indent or a dedent
                    // is the first indent
                    if(usesSpaceIndent == null) { 
                        usesSpaceIndent = true;
                        firstIndentCount = indentSize;
                        prevIndentCount = firstIndentCount;
                        tokens.push(new Token("", TokenType.indent)); 
                    }
                    // not the first indent
                    else{ 
                        if(!usesSpaceIndent){ throw new Error("Error 4: Cannot mix tab and space indentations!"); }
                        if(indentSize%firstIndentCount == 0){

                            let indentFactor = indentSize/firstIndentCount;
                            let prevIndentFactor = prevIndentCount/firstIndentCount;
                            let indentDiff = indentFactor - prevIndentFactor;

                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;

                            // register a newline if there is no indent or dedent
                            if(indentDiff == 0){
                                tokens.push(new Token("", TokenType.newline)); 
                                continue lexLoop;
                            }
                            if(indentDiff > 1){ 
                                throw new Error("Error 3: Indentation mismatch, indentation is too much!");
                            }
                            // indent
                            if(indentDiff == 1){
                                tokens.push(new Token("", TokenType.indent)); 
                            }
                            // dedent
                            else{
                                for(let i = 0; i < (0-indentDiff); i++) {
                                    tokens.push(new Token("", TokenType.dedent));
                                }
                            }
                        }
                        else{
                            throw new Error("Error 2: Indentation mismatch!")
                        }
                    }
                }
                // not an indent, ignore spaces
                else{ 
                    do { char = this.eatChar(); }
                    while(char == " " || char == "\t");
                    // console.log("[ ]" + ": {SPACE}"); 
                }
            }
            // tab // indent // dedent
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
                                char = this.eatChar(offset);
                                continue lexLoop;
                            }
                            else if(char2 == " " || char2 == "\t"){
                                continue;
                            }
                            // if all the spaces are followed by a null
                            else if(char2 == null){
                                tokens.push(new Token(null, TokenType.eoi)); 
                                break lexLoop; 
                            }
                            else{
                                throw new Error("Error 1: Can't mix tabs with spaces for indents!");
                            }
                        }
                    }
                    // if it's followed by a newline, ignore indent
                    else if(char == "\n" || char == "\r"){ continue lexLoop; }
                    // if it's followed by a null, ignore indent
                    else if(char == null){
                        tokens.push(new Token(null, TokenType.eoi)); 
                        break lexLoop;  
                    }

                    // now we know we've got an indentation, let's see if it's the firstIndent, an indent or a dedent
                    // is the first indent
                    if(usesSpaceIndent == null) {
                        usesSpaceIndent = false;
                        firstIndentCount = indentSize;
                        prevIndentCount = firstIndentCount;
                        tokens.push(new Token("", TokenType.indent)); 
                    }
                    // not the first indent
                    else{ 
                        if(usesSpaceIndent){ throw new Error("Error 4: Cannot mix tab and space indentations!"); }
                        if(indentSize%firstIndentCount == 0){
                            let indentFactor = indentSize/firstIndentCount;
                            let prevIndentFactor = prevIndentCount/firstIndentCount;
                            let indentDiff = indentFactor - prevIndentFactor;

                            // remember to set prevIndent to the current indent
                            prevIndentCount = indentSize;

                            // register a newline if there is no indent or dedent
                            if(indentDiff == 0){
                                tokens.push(new Token("", TokenType.newline)); 
                                continue lexLoop;
                            }
                            if(indentDiff > 1){ throw new Error("Error 3: Indentation mismatch, indentation is too much!") }
                            // indent
                            if(indentDiff == 1){
                                tokens.push(new Token("", TokenType.indent)); 
                            }
                            // dedent
                            else{
                                for(let i = 0; i < (0-indentDiff); i++) {
                                    tokens.push(new Token("", TokenType.dedent));
                                }
                            }
                        }
                        else{
                            throw new Error("Error 2: Indentation mismatch!")
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

                tokens.push(new Token(str, TokenType.string));

            }
            // double-quote string
            else if(char == "\""){ 
                let str: string = "";

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
                
                tokens.push(new Token(str, TokenType.string));
            }
            // single-line comment 
            else if(char == "#" && this.peekChar() != "="){ 
                let str: string = "";

                // discard the "#"
                char = this.eatChar();

                while(char != "\n" && char != "\r"){
                    str += char;
                    char = this.eatChar();
                }
                
                tokens.push(new Token(str, TokenType.comment));
            }
            // multi-line nested comment
            else if(char == "#" && this.peekChar() == "="){ 
                let nestCount = 0;
                let str: string  = "";

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
                            tokens.push(new Token(str, TokenType.comment)); 
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
                        tokens.push(new Token(str, TokenType.comment)); 
                        // save EOI token
                        tokens.push(new Token(null, TokenType.eoi)); 
                        break; 
                    }
                    str += char; 
                    char = this.eatChar();
                }
                
            }
            // others. character not recognized
            else { 
                throw new Error("Error 5: character not recognized!");
            }
        }
        return tokens;
    }

    private eatChar(offset: number = 1):string{
        this.charPointer += offset;
        if(this.charPointer < this.chars.length) return this.chars[this.charPointer];
        return null;
    }

    private vomitChar(offset: number = 1):string{
        this.charPointer -= offset;
        if(this.charPointer < this.chars.length) return this.chars[this.charPointer];
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
    public parse(tokens: Array<Token>): Ast{
        this.parseTopLevel();
        return new Ast();
    }

    parseTopLevel(){

    }
}

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
    params:Array<string>;
    body:Array<ExprAst>; 
    constructor(name:string, access:AccessType, params:Array<string>, body:Array<ExprAst>){ 
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
    parents:Array<TypeDefAst>;
    fields:Array<SubjectDefAst>; 
    constructor(name:string, access:AccessType, fields:Array<SubjectDefAst>, parents:Array<TypeDefAst>){ 
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
    initializers:Array<FunctionCallAst>;
    constructor(initializers:Array<FunctionCallAst>, ref:RefType, type:string){
        super(ref, type);
        this.initializers = initializers;
    }
}

class NothingAst extends ExprAst{}

class Spill extends NothingAst{}

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
    constructor(lhs:ExprAst, ope:string, rhs:ExprAst, ref:RefType, type:string){
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
        console.log("ENTRY\n-----\n");
        for(let token of tokens){ 
            console.log(`${token.str} => ${Utility.printTokenType(token.type)}`); \
        }
        console.log("\n----\nEXIT");
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
        }
    }
}

class Token{
    type: TokenType; str: string;
    constructor(str:string, type:TokenType){ this.str = str;  this.type = type; }
}

// Enums 
enum TokenType{ identifier, number, boolean, string, comment, keyword, operator, punctuator, newline, indent, dedent, eoi, ns }
enum RefType{ ref, val, iso, acq }
enum AccessType{ public, private, readOnly }

import fs = require('fs');

let fileName1 = './test.ast';
let fileName2 = './test2.ast';

fs.readFile(fileName1, function (err, data) {
    if (err) { return console.error(err); }
    let astro = new Astro();
    let tokens = astro.lex(data.toString()); // lex the file 
    Utility.printTokens(tokens);
});
