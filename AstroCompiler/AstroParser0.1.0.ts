// 05/07/17
import {Token, TokenType, RefType, AccessType} from "./AstroUtility0.1.0"
import {
    Ast, ExprAst, ImportAst, ModuleDefAst, FunctionDefAst, BlockAst,
    TypeDefAst, EnumDefAst, SubjectDefAst, VariableDefAst, ConstantDefAst, 
    PropertyDefAst, TryAst, CatchAst, EnsureAst, WhileAst, LoopAst, IfAst,
    ElifAst, ForLoopAst, NameAst, NewAst, NothingAst, SpillAst, BreakAst, 
    ContinueAst, ReturnAst, YieldAst, BooleanAst, FunctionCallAst, StringAst, 
    IntegerAst, FloatAst, AssignmentAst, BinaryExprAst, ListAst, TupleAst, 
    DictAst
} from "./AstroAST0.1.0"

export class Parser{
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
        this.parserCheck(this.parseNsFloatLiteral());
        this.parserCheck(this.parseNL());
        this.parserCheck(this.parseNsIntLiteral());
        /// TEST ///

        return this.asts;
    }

    ///////////////////////////
    //////// LITERALS /////////
    ///////////////////////////
    private parseNsIntLiteral() { // UNTESTED [INT NS '_'? name ]
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.integer) {
            this.token = this.eatToken(); // consume INT

            // parse and consume NS 
            if(this.parseNS().success) {

                // parse and consume optional '_'
                if(this.parsePH().success){}

                // parse and consume name
                if(this.parseName().success) {
                    return { success: true, lastPointerPos: null, parserName: null, problem: null }; 
                }
            }
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "ns_float_literal", problem: ""
        }
    }

    private parseNsFloatLiteral() { // UNTESTED [FLOAT NS '_'? name ]
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.float) {
            this.token = this.eatToken(); // consume FLOAT

            // parse and consume NS 
            if(this.parseNS().success) {

                // parse and consume optional '_'
                if(this.parsePH().success){}

                // parse and consume name
                if(this.parseName().success) {
                    return { success: true, lastPointerPos: null, parserName: null, problem: null }; 
                }
            }
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "ns_float_literal", problem: ""
        }
    }

    // parses a single compilation unit, the module 
    private parseModule() { // UNTESTED // TODO: Implement 
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === "module") {
            return { success: true, lastPointerPos: null, parserName: null, problem: null } 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "module", problem: ""
        }
    }

    ///////////////////////////
    ///////// NAMES ///////////
    ///////////////////////////
    private parseName() {
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.name) {
            this.token = this.eatToken(); // consume name
            return { success: true, lastPointerPos: null, parserName: null, problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "name", problem: ""
        }
    }

    ///////////////////////////
    /// SPECIAL PUNCTUATORS ///
    ///////////////////////////
    private parseCNL() { // TESTED  [',' NL? | NL]
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === ",") {
            this.token = this.eatToken(); // consume ','

            // parse and consume optional NL 
            if(this.parseNL().success){} 

            return { success: true, lastPointerPos: null, parserName: null, problem: null }; 
        }
        // parse and consume NL
        else if(this.parseNL().success) {
            return { success: true, lastPointerPos: null, parserName: null, problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "CNL", problem: ""
        }
    }

    private parseNL() { // TESTED [NEWLINE | ';']
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.newline || this.token.str === ";") {
            this.token = this.eatToken(); // consume NEWLINE or ";"
            return { success: true, lastPointerPos: null, parserName: null, problem: null } 
        } 

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "NL", problem: ""
        }
    }

    private parseIND() { // UNTESTED [INDENT]
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.type === TokenType.indent) {
            this.token = this.eatToken(); // consume INDENT
            return { success: true, lastPointerPos: null, parserName: null, problem: null } 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "IND", problem: ""
        }
    }

    private parseDED() { // UNTESTED [DEDENT | '\\' NS '\\' | EOI]
        let initialPointerPos = this.tokenPointer;

        if(this.token.type === TokenType.dedent || this.token.type === TokenType.eoi) {
            this.token = this.eatToken(); // consume DEDENT | EOI
            return { success: true, lastPointerPos: null, parserName: null, problem: null } 
        }
        else if(this.token.str === "\\") {
            this.token = this.eatToken();
            if(this.token.str === "\\" && this.parseNS().success) {
                this.token = this.eatToken(); // consume "\\" NS "\\"
                return { success: true, lastPointerPos: null, parserName: null, problem: null } 
            }
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "DED", problem: ""
        }
    }

    private parsePH() { // TESTED ['_']
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === "_") {
            this.token = this.eatToken(); // consume "_"
            return { success: true, lastPointerPos: null, parserName: null, problem: null }
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "PH", problem: ""
        }
    }

    private parsePASS() { // TESTED ['pass']
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === "pass") {
            this.token = this.eatToken(); // consume "pass"
            return { success: true, lastPointerPos: null, parserName: null, problem: null } 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "PASS", problem: ""
        }
    }

    // no-space tokens are generally ignored because they are superfluous and are hardly checked for
    // when incrementing or decrementing the token pointer
    // so this fuction checks if the previous token is a no-space token
    private parseNS() {  // TESTED [NS]
        let peekPointer = this.tokenPointer - 1;
        if(this.tokenPointer < this.tokens.length && this.tokens[peekPointer].type === TokenType.ns) 
            return { success: true, lastPointerPos: null, parserName: null, problem: null }; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "NS", problem: ""
        }
    }

    // TESTERS //
    private parserCheck(parser) {
        if(parser.success) {
            console.log("Parser successful!")
        } else {
            console.log(`Parser failed! > initalPos: ${this.tokenPointer+1} lastPos: ${parser.lastPointerPos+1}`)
        }
    }

    // UTILITIES //
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

    // BOILERPLATE 
    private parseX() { // UNTESTED
        let initialPointerPos = this.tokenPointer;
        
        if(this.token.str === "...") {
            this.token = this.eatToken(); // consume 
            return { success: true, lastPointerPos: null, parserName: null, problem: null }; 
        }

        // set tokenPointer back to original state before parsing started
        this.tokenPointer = initialPointerPos; 
        return { 
            success: false, lastPointerPos: this.tokenPointer, 
            parserName: "", problem: ""
        }
    }
}