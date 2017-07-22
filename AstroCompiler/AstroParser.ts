// 05/07/17
import {Token, TokenType, RefType, AccessType} from "./AstroUtility"
import {
    Ast, ExprAst, ImportAst, ModuleDefAst, FunctionDefAst, BlockAst,
    TypeDefAst, EnumDefAst, SubjectDefAst, VariableDefAst, ConstantDefAst, 
    PropertyDefAst, TryAst, CatchAst, EnsureAst, WhileAst, LoopAst, IfAst,
    ElifAst, ForLoopAst, NameAst, NewAst, NothingAst, SpillAst, BreakAst, 
    ContinueAst, ReturnAst, YieldAst, BooleanAst, FunctionCallAst, StringAst, 
    IntegerAst, FloatAst, AssignmentAst, BinaryExprAst, ListAst, TupleAst, 
    DictAst
} from "./AstroAST"

export class Parser {
    tokens:Token[];
    token:Token; // holds the current token
    tokenPointer:number = -1;
    asts:Ast[];

    // operators 
    registeredInfixOps = { // op : {precedenceLevel, leftAsscociativity}
        "|": [10, true], "&": [10, true],
        "in": [20, true],
        "+": [50, true], "-": [50, true],
        "*": [60, true], "/": [60, true],
        "^": [70, false], 
    };
    registeredPrefixOps = ["+", "-", "++"];
    registeredPostfixOps = [];
    dot_op = ["!", "@", "."]


    // start point of parser
    public parse(tokens: Token[]): Ast[] {
        this.tokens = tokens;
        this.token = this.eatToken(); // start by eating the first token
        /* this.parseModule(); */

        /// TEST ///
        this.parserTest(this.parseNsSetLiteral());
        this.parserTest(this.parseNL());
        this.parserTest(this.parseSetLiteral());
        this.parserTest(this.parseNL());
        this.parserTest(this.parseDictLiteral());
        this.parserTest(this.parseNL());
        this.parserTest(this.parseDictLiteral());
        this.parserTest(this.parseNL());
        this.parserTest(this.parseNsDictLiteral());
        this.parserTest(this.parseNL());
        this.parserTest(this.parseNsFloatLiteral());
        this.parserTest(this.parseIND());
        this.parserTest(this.parseNsIntLiteral());
        this.parserTest(this.parseDED());
        this.parserTest(this.parsePASS());
        this.parserTest(this.parseDED());
        /// TEST ///

        return this.asts;
    }
    
    // parses a single compilation unit, the module 
    private parseModule() { // UNIMPLEMENTED UNTESTED 
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === "module") {
            return { success: true, lastPointerPos: null, name: "module", problem: null } 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            name: "module", problem: ""
        }
    }

    ///////////////////////////
    /////// EXPRESSION ////////
    ///////////////////////////
    private parseParensExpr() { // UNIMPLEMENTED UNTESTED
        let initialPointerPos = this.tokenPointer;
        let success = false;
        let self = this;
        
        
        (function() {
            // [1] integer 
            if(self.parseIntLiteral().success) {
                success = true;
                return; 
            }

            // [2] name 
            if(self.parseName().success) {
                success = true;
                return;  
            }
        })();

        if(success)
            return { success: true, ast: null, lastPointerPos: null, name: "parens_expr", problem: null }; 

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "parens_expr", problem: ""
        }
    }

    ///////////////////////////
    //////// LITERALS /////////
    ///////////////////////////
    private parseSetLiteral() { // UNTESTED
        let initialPointerPos = this.tokenPointer;
        let success = false; // to check if any of alternatives parsed successfully
        let self = this;

        // parse and consume →  '{' ':' '}' | '{' parens_expr (',' parens_expr)* '}' | '{' nested_set '}'
        (function() { 
            if(self.parseString("{").success) { // parse and consume → '{'
                // [1] '{' '}'
                if(self.parseString("}").success){ // parse and consume → '}'
                    success = true;
                    return; 
                }

                // [2] '{' parens_expr ( ',' parens_expr )* '}'
                let keyValue;
                while(true) {
                    keyValue = self.parseParensExpr(); // parse and consume → parens_expr
                    let comma = self.parseString(",");  // parse and consume → ','
                    if(!keyValue.success || !comma.success) break;
                }
                if(keyValue.success && self.parseString("}")){ // parse and consume → '}'
                    success = true;
                    return;  
                }

                // [3] '{' nested_set '}'
                const nestedDict = self.parseNestedDict(); // parse and consume → nested_dict
                if(nestedDict.success && self.parseString("}")){ // parse and consume → '}'
                    success = true;
                    return; 
                }
            }
        })();

        // if any of the alternatives above parsed successfully
        if(success) { return { success: true, ast: null, lastPointerPos: null, name: "set_literal", problem: null }; }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "set_literal", problem: ""
        }
    }

    private parseNestedSet() { // parse and consume → set_literal (CNL? set_literal)+
        let initialPointerPos = this.tokenPointer;
        let self = this;

        let keyValue;
        let count = 0;
        while(true) {
            keyValue = self.parseSetLiteral(); // parse and consume → set_literal
            let cnl  = self.parseCNL(); // parse and consume → CNL? 
            if(!keyValue.success) break; 
            count += 1;
        }
        if(keyValue.success && count > 1) {
            return { success: true, ast: null, lastPointerPos: null, name: "nested_set", problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "nested_set", problem: ""
        }
    }

    private parseNsSetLiteral() { // UNTESTED
        let initialPointerPos = this.tokenPointer;

        // parse and consume → name NS '_' NS set_literal
        if(
            this.parseName().success && 
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
        }
    }

    private parseDictLiteral() { // UNTESTED
        let initialPointerPos = this.tokenPointer;
        let success = false; // to check if any of alternatives parsed successfully
        let self = this;

        let parseKeyValue = () => { // parse and consume → dict_key ':' parens_expr
            const key = self.parseDictKey(); // parse and consume → dict_key
            if(key.success && self.parseString(":").success) { // parse and consume → ':'
                const value = self.parseParensExpr(); // parse and consume → parens_expr
                if(value.success) { 
                    return { success: true, ast: null, lastPointerPos: null, name: "dict_literal_key_value", problem: null };  
                }
            }
            return { success: false, ast: null, lastPointerPos: null, name: "dict_literal_key_value", problem: null }; 
        }

        // parse and consume →  '{' ':' '}' | '{' dict_key ':' parens_expr (',' dict_key ':' parens_expr )* '}' | '{' nested_dict '}'
        (function() { 
            if(self.parseString("{").success) { // parse and consume → '{'
                // [1] '{' ':' '}'
                if(self.parseString(":").success && self.parseString("}").success){ // parse and consume → ':' '}'
                    success = true;
                    return; 
                }

                // [2] '{' dict_key ':' parens_expr (',' dict_key ':' parens_expr )* '}'
                let keyValue;
                while(true) {
                    keyValue = parseKeyValue(); // parse and consume → dict_key ':' parens_expr
                    let comma = self.parseString(",");  // parse and consume → ','
                    if(!keyValue.success || !comma.success) break;
                }
                if(keyValue.success && self.parseString("}")) { // parse and consume → '}'
                    success = true;
                    return;  
                }

                // [3] '{' nested_dict '}'
                const nestedDict = self.parseNestedDict(); // parse and consume → nested_dict
                if(nestedDict.success && self.parseString("}")){ // parse and consume → '}'
                    success = true;
                    return; 
                }
            }
        })();

        // if any of the alternatives above parsed successfully
        if(success) { return { success: true, ast: null, lastPointerPos: null, name: "dict_literal", problem: null }; }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "dict_literal", problem: ""
        }
    }

    private parseNestedDict() { // parse and consume → dict_key ':' dict_literal (CNL? dict_key ':' dict_literal)+
        let initialPointerPos = this.tokenPointer;
        let self = this;

        let parseKeyValue = () => { // parse and consume → dict_key ':' dict_literal
            const key = self.parseDictKey(); // parse and consume → dict_key
            if(key.success && self.parseString(":").success) { // parse and consume → ':'
                const value = self.parseDictLiteral(); // parse and consume → dict_literal
                if(value.success) { 
                    return { success: true, ast: null, lastPointerPos: null, name: "nested_dict_key_value", problem: null };  
                }
            }
            return { success: false, ast: null, lastPointerPos: null, name: "nested_dict_key_value", problem: null };
        }

        let keyValue;
        let count = 0;
        while(true) {
            keyValue = parseKeyValue(); // parse and consume → dict_key ':' parens_expr
            let cnl = self.parseCNL(); // parse and consume → CNL?
            if(!keyValue.success) break;
            count += 1;
        }
        if(keyValue.success && count > 1) {
            return { success: true, ast: null, lastPointerPos: null, name: "dict_literal", problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return {
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "dict_literal", problem: ""
        }
    }

    private parseDictKey() { // UNTESTED
        let initialPointerPos = this.tokenPointer;

        if( // parse and consume → '$' NS name
            this.parseString("$").success && 
            this.parseNS().success && 
            this.parseString("_").success) {
            return { success: true, ast: null, lastPointerPos: null, name: "dict_key", problem: null };    
        }   
        else { // parses and consume → parens_expr
            let parensExpr = this.parseParensExpr();
            if (parensExpr.success){
                return { success: true, ast: null, lastPointerPos: null, name: "dict_key", problem: null };
            }
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            name: "dict_key", problem: ""
        }
    }

    private parseNsDictLiteral() { // UNTESTED
        let initialPointerPos = this.tokenPointer;

        // parse and consume → name NS '_' NS dict_literal
        if(
            this.parseName().success && 
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
        }
    }

    private parseRegexLiteral() { // UNIMPLEMENTED UNTESTED
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.integer) {
            this.token = this.eatToken(); 
            return { success: true, ast: null, lastPointerPos: null, name: "regex_literal", problem: null };       
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "regex_literal", problem: ""
        }
    }

    private parseNsRegexLiteral() { // UNIMPLEMENTED UNTESTED 
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.integer) {
            this.token = this.eatToken(); 
            return { success: true, ast: null, lastPointerPos: null, name: "ns_regex_literal", problem: null };       
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "ns_regex_literal", problem: ""
        }
    }

    private parseNsIntLiteral() { // TESTED 
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.integer) {
            this.token = this.eatToken(); // consume INT

            // parse and consume → NS 
            if(this.parseNS().success) {

                // parse and consume  → '_'?
                if(this.parsePH().success){}

                // parse and consume → name
                if(this.parseName().success) {
                    return { success: true, ast: null, lastPointerPos: null, name: "ns_int_literal", problem: null }; 
                }
            }
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "ns_int_literal", problem: ""
        }
    }

    private parseIntLiteral() { // TESTED 
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.integer) {
            this.token = this.eatToken(); // parse and consume → INT
            return { success: true, ast: null, lastPointerPos: null, name: "ns_int_literal", problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "ns_int_literal", problem: ""
        }
    }

    private parseNsFloatLiteral() { // TESTED
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.float) {
            this.token = this.eatToken(); // consume → FLOAT

            // parse and consume → NS 
            if(this.parseNS().success) {

                // parse and consume optional → '_'
                if(this.parsePH().success){}

                // parse and consume → name
                if(this.parseName().success) {
                    return { success: true, ast: null, lastPointerPos: null, name: "ns_float_literal", problem: null }; 
                }
            }
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "ns_float_literal", problem: ""
        }
    }

    private parseFloatLiteral() { // TESTED
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.float) {
            this.token = this.eatToken(); // parse and consume → FLOAT
            return { success: true, ast: null, lastPointerPos: null, name: "ns_float_literal", problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "ns_float_literal", problem: ""
        }
    }

    ///////////////////////////
    ///////// NAMES ///////////
    ///////////////////////////
    private parseName() {
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.name) {
            this.token = this.eatToken(); // parse and consume → name
            return { success: true, ast: null, lastPointerPos: null, name: "name", problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "name", problem: ""
        }
    }

    ///////////////////////////
    /// SPECIAL PUNCTUATORS ///
    ///////////////////////////
    private parseCNL() { // TESTED
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === ",") {
            this.token = this.eatToken(); // consume → ','

            // parse and consume optional → NL 
            if(this.parseNL().success){} 

            return { success: true, ast: null, lastPointerPos: null, name: "CNL", problem: null }; 
        }
        // parse and consume → NL
        else if(this.parseNL().success) {
            return { success: true, ast: null, lastPointerPos: null, name: "CNL", problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "CNL", problem: ""
        }
    }

    private parseNL() { // TESTED 
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.newline || this.token.str === ";") {
            this.token = this.eatToken(); // → consume NEWLINE or ";"
            return { success: true, ast: null, lastPointerPos: null, name: "NL", problem: null } 
        } 

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "NL", problem: ""
        }
    }

    private parseIND() { // UNTESTED 
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.indent) {
            this.token = this.eatToken(); // consume → INDENT
            return { success: true, ast: null, lastPointerPos: null, name: "IND", problem: null } 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "IND", problem: ""
        }
    }

    private parseDED() { // TESTED 
        let initialPointerPos = this.tokenPointer;

        if(this.token.type === TokenType.dedent || this.token.type === TokenType.eoi) {
            this.token = this.eatToken(); // consume → DEDENT | EOI
            return { success: true, ast: null, lastPointerPos: null, name: "DED", problem: null } 
        }
        else if(this.token.str === "\\") {
            this.token = this.eatToken();
            if(this.token.str === "\\" && this.parseNS().success) {
                this.token = this.eatToken(); // consume → "\" NS "\"
                return { success: true, ast: null, lastPointerPos: null, name: "DED", problem: null } 
            }
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "DED", problem: ""
        }
    }

    private parsePH() { // TESTED 
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === "_") {
            this.token = this.eatToken(); // consume → "_"
            return { success: true, ast: null, lastPointerPos: null, name: "PH", problem: null }
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "PH", problem: ""
        }
    }

    private parsePASS() { // TESTED 
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === "pass") {
            this.token = this.eatToken(); // consume → 'pass'
            return { success: true, ast: null, lastPointerPos: null, name: "PASS", problem: null } 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "PASS", problem: ""
        }
    }


    ///////////////////////////
    ///// SPECIAL VALUES //////
    ///////////////////////////
    // no-space tokens are generally ignored because they are superfluous and are hardly checked for
    // when incrementing or decrementing the token pointer
    // so this fuction checks if the previous token is a no-space token
    private parseNS() {  // TESTED 
        let peekPointer = this.tokenPointer - 1;
        if(this.tokenPointer < this.tokens.length && this.tokens[peekPointer].type === TokenType.ns) 
            return { success: true, ast: null, lastPointerPos: null, name: "NS", problem: null }; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "NS", problem: ""
        }
    }

    ///////////////////////////
    //////// ARBITRARY ////////
    ///////////////////////////
    private parseString(str: string) { // UNTESTED
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === str) {
            this.token = this.eatToken(); // parse and consume → str 
            return { success: true, ast: null, lastPointerPos: null, name: str, problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: str, problem: ""
        }
    }

    ///////////////////////////
    ///////// TESTERS /////////
    ///////////////////////////
    private parserTest(parser) {
        if(parser.success) {
            console.log(`Parser successful! [${parser.name}]`)
        } else {
            console.log(`Parser failed! > initalPos: ${this.tokenPointer+1} lastPos: ${parser.lastPointerPos+1} [${parser.name}]`)
        }
    }

    ///////////////////////////
    //////// UTILITIES ////////
    ///////////////////////////
    // consumes the current token by incrementing the token pointer and returning the next token
    private eatToken():Token {
        this.tokenPointer += 1;
        if(this.tokens[this.tokenPointer].type === TokenType.ns) { // skip a no-space
            this.tokenPointer += 1;
        }
        if(this.tokenPointer < this.tokens.length) return this.tokens[this.tokenPointer];
        return null;
    }

    // returns the previous token without decrementing the token pointer
    private prevToken():Token {
        let peekPointer = this.tokenPointer - 1;
        if(this.tokens[peekPointer].type === TokenType.ns) { // skip a no-space
            peekPointer -= 1;
        }
        if(this.tokenPointer < this.tokens.length) return this.tokens[peekPointer];
        return null;
    }

    ///////////////////////////
    /////// BOILERPLATE ///////
    /////////////////////////// 
    private parseX() { // UNTESTED
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === "...") {
            this.token = this.eatToken(); // parse and consume → 
            return { success: true, ast: null, lastPointerPos: null, name: "", problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, ast: null, lastPointerPos: this.tokenPointer, 
            name: "", problem: ""
        }
    }
}