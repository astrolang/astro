// 05/07/17 
import {
    Ast, ExprAst, ImportAst, ModuleDefAst, FunctionDefAst, BlockAst,
    TypeDefAst, EnumDefAst, SubjectDefAst, VariableDefAst, ConstantDefAst, 
    PropertyDefAst, TryAst, CatchAst, EnsureAst, WhileAst, LoopAst, IfAst,
    ElifAst, ForLoopAst, NameAst, NewAst, NothingAst, SpillAst, BreakAst, 
    ContinueAst, ReturnAst, YieldAst, BooleanAst, FunctionCallAst, StringAst, 
    IntegerAst, FloatAst, AssignmentAst, BinaryExprAst, ListAst, TupleAst, 
    DictAst
} from "./AstroAST0.1.0"

export class Token{
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
export enum TokenType{ name, number, boolean, string, comment, keyword, operator, punctuator, newline, indent, dedent, eoi, ns }
export enum RefType{ ref, val, iso, acq }
export enum AccessType{ public, private, readOnly }

// ...
export class Utility{
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
            case TokenType.name: return 'name';
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
