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
    tokenPointer:number = -1;
    asts:Ast[];

    // start point of parser
    public parse(tokens: Token[]): Ast[]{
        this.tokens = tokens;
        this.parseModule();
        return this.asts;
    }

    // parses a single compilation unit, the module 
    private parseModule(){ 
    }

    // SPECIAL PUNCTUATORS 
    private parsePASS(){}
    private parsePH(){}
    private parseIND(){}
    private parseDED(){}





    // UTILITIES //
    // consumes the current token by incrementing the token pointer and returning the next token
    private eatToken():Token{
        this.tokenPointer += 1;
        if(this.tokens[this.tokenPointer].type == TokenType.ns) { // skip a no-space
            this.tokenPointer += 1;
        }
        if(this.tokenPointer < this.tokens.length) return this.tokens[this.tokenPointer];
        return null;
    }

    // returns the previous token without decrementing the token pointer
    private prevToken():Token{
        let peekPointer = this.tokenPointer - 1;
        if(this.tokens[peekPointer].type == TokenType.ns) { // skip a no-space
            peekPointer -= 1;
        }
        if(this.tokenPointer < this.tokens.length) return this.tokens[peekPointer];
        return null;
    }

    // no-space tokens are generally ignored because they are superfluous and are hardly checked for
    // when incrementing or decrementing the token pointer
    // so this fuction checks if the previous token is a no-space token
    private parseNoSpace():boolean{
        let peekPointer = this.tokenPointer - 1;
        if(this.tokenPointer < this.tokens.length && this.tokens[peekPointer].type == TokenType.ns) 
            return true;
        return false;
    }

}