// 05/07/17
import {RefType, AccessType} from "./AstroUtility"

// ...
export class Ast{}

export class ExprAst extends Ast{
    ref:RefType;
    type:string;
    constructor(ref:RefType, type:string){
        super();
        this.ref = ref;
        this.type = type;
    }
}
 // Definition
export class ImportAst extends Ast{
    moduleName:string;
    elements:Array<string>; 
    constructor(moduleName:string, elements:Array<string>){
        super();
        this.moduleName = moduleName; 
        this.elements = elements;
    }
}

export class ModuleDefAst extends Ast{
    name:string;
    body:Array<Ast>;
    constructor(name:string, body:Array<Ast>){
        super(); 
        this.name = name;
        this.body = body; 
    }
}

export class FunctionDefAst extends Ast{
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

export class BlockAst extends ExprAst{
    name:string;
    body:Array<ExprAst>; 
    constructor(name:string, ref:RefType, type:string, body:Array<ExprAst>){ 
        super(ref, type);
        this.name = name; 
        this.body = body;
    }
}

export class TypeDefAst extends Ast{
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

export class EnumDefAst extends Ast{
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
export class SubjectDefAst extends ExprAst{
    name:string;
    access:AccessType;
    constructor(name:string, ref:RefType, type:string, access:AccessType){
        super(ref, type);
        this.name = name; 
        this.access = access;
    }
}

export class VariableDefAst extends SubjectDefAst{
    constructor(name:string, ref:RefType, type:string, access:AccessType){
        super(name, ref, type, access);
    }
}

export class ConstantDefAst extends SubjectDefAst{
    constructor(name:string, ref:RefType, type:string, access:AccessType){
        super(name, ref, type, access);
    }
}

export class PropertyDefAst extends Ast{
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

export class TryAst extends ExprAst{
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

export class CatchAst extends ExprAst{ 
    body:Array<ExprAst>;
    constructor(body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.body = body;
    }
}

export class EnsureAst extends ExprAst{ 
    body:Array<ExprAst>;
    constructor(body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.body = body;
    }
}

// Control
export class WhileAst extends ExprAst{
    condition:ExprAst; 
    body:Array<ExprAst>;
    constructor(condition:ExprAst, body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.condition = condition;
        this.body = body;
    }
}

export class LoopAst extends ExprAst{
    body:Array<ExprAst>;
    constructor(body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.body = body;
    }
}

export class IfAst extends ExprAst{
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

export class ElifAst extends ExprAst{
    condition:ExprAst; 
    body:Array<ExprAst>;
    constructor(condition:ExprAst, body:Array<ExprAst>, ref:RefType, type:string){
        super(ref, type);
        this.condition = condition;
        this.body = body;
    }
}

export class ForLoopAst extends ExprAst{ // NOT NEEDED
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
export class NameAst extends ExprAst{
    name:ExprAst; // can be dotted
    module:string;
    constructor(name:ExprAst, ref:RefType, type:string, module?:string){ 
        super(ref, type);
        this.name = name;
        this.module = module;
    }
}

export class NewAst extends ExprAst{
    initializers: Array<FunctionCallAst>;
    fieldMappings: Array<string>;
    constructor(initializers: Array<FunctionCallAst>, fieldMappings: Array<string>, ref: RefType, type: string){
        super(ref, type);
        this.initializers = initializers;
        this.fieldMappings = fieldMappings;
    }
}

export class NothingAst extends ExprAst{
}

export class SpillAst extends NothingAst{
}

export class BreakAst extends ExprAst{
    param:ExprAst;
    constructor(param:ExprAst, ref:RefType, type:string){
        super(ref, type);
        this.param = param;
    }
}

export class ContinueAst extends ExprAst{
    param:ExprAst;
    constructor(param:ExprAst, ref:RefType, type:string){
        super(ref, type);
        this.param = param;
    }
}

export class ReturnAst extends ExprAst{
    param:ExprAst;
    constructor(param:ExprAst, ref:RefType, type:string){
        super(ref, type);
        this.param = param;
    }
}

export class YieldAst extends ExprAst{
    param:ExprAst;
    constructor(param:ExprAst, ref:RefType, type:string){
        super(ref, type);
        this.param = param;
    }
}

export class BooleanAst extends ExprAst{
    bool: boolean;
    constructor(bool:boolean, ref:RefType){
        super(ref, "Bool");
        this.bool = bool;
    }
}

export class FunctionCallAst extends ExprAst{ 
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

export class StringAst extends ExprAst{
    str: string; 
    custom: string;
    constructor(str:string, ref:RefType, custom:string){
        super(ref, "RawStr");
        this.str = str;
        this.custom = custom;
    }
}

export class IntegerAst extends ExprAst{
    num:string; 
    ref:RefType;
    custom:string;
    constructor(num:string, ref:RefType, custom:string){
        super(ref, "RawInt");
        this.num = num;
        this.custom = custom;
    }
}

export class FloatAst extends ExprAst{
    num:string;
    custom:string;
    constructor(num:string, ref:RefType, custom:string){
        super(ref, "RawFloat");
        this.num = num;
        this.custom = custom;
    }
}

export class AssignmentAst extends ExprAst{
    name:string;
    rhs:ExprAst;
    constructor(name:string, ref:RefType, type:string, rhs:ExprAst){
        super(ref, type)
        this.name = name;
        this.rhs = rhs;
    }
}

export class BinaryExprAst extends ExprAst{
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

export class ListAst extends ExprAst{
    elements:Array<ExprAst>; 
    custom:string;
    constructor(elements:Array<ExprAst>, ref:RefType, type:string, custom:string){
        super(ref, type);
        this.elements = elements;
        this.custom = custom;
    }
}

export class TupleAst extends ExprAst{
    elements:Array<ExprAst>; 
    custom:string;
    constructor(elements:Array<ExprAst>, ref:RefType, type:string, custom:string){
        super(ref, type);
        this.elements = elements;
        this.custom = custom;
    }
}

export class DictAst extends ExprAst{
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