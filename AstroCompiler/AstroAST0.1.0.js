"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// ...
var Ast = (function () {
    function Ast() {
    }
    return Ast;
}());
exports.Ast = Ast;
var ExprAst = (function (_super) {
    __extends(ExprAst, _super);
    function ExprAst(ref, type) {
        var _this = _super.call(this) || this;
        _this.ref = ref;
        _this.type = type;
        return _this;
    }
    return ExprAst;
}(Ast));
exports.ExprAst = ExprAst;
// Definition
var ImportAst = (function (_super) {
    __extends(ImportAst, _super);
    function ImportAst(moduleName, elements) {
        var _this = _super.call(this) || this;
        _this.moduleName = moduleName;
        _this.elements = elements;
        return _this;
    }
    return ImportAst;
}(Ast));
exports.ImportAst = ImportAst;
var ModuleDefAst = (function (_super) {
    __extends(ModuleDefAst, _super);
    function ModuleDefAst(name, body) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.body = body;
        return _this;
    }
    return ModuleDefAst;
}(Ast));
exports.ModuleDefAst = ModuleDefAst;
var FunctionDefAst = (function (_super) {
    __extends(FunctionDefAst, _super);
    function FunctionDefAst(name, access, params, body) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.params = params;
        _this.body = body;
        _this.access = access;
        return _this;
    }
    return FunctionDefAst;
}(Ast));
exports.FunctionDefAst = FunctionDefAst;
var BlockAst = (function (_super) {
    __extends(BlockAst, _super);
    function BlockAst(name, ref, type, body) {
        var _this = _super.call(this, ref, type) || this;
        _this.name = name;
        _this.body = body;
        return _this;
    }
    return BlockAst;
}(ExprAst));
exports.BlockAst = BlockAst;
var TypeDefAst = (function (_super) {
    __extends(TypeDefAst, _super);
    function TypeDefAst(name, access, fields, parents) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.fields = fields;
        _this.access = access;
        _this.parents = parents;
        return _this;
    }
    return TypeDefAst;
}(Ast));
exports.TypeDefAst = TypeDefAst;
var EnumDefAst = (function (_super) {
    __extends(EnumDefAst, _super);
    function EnumDefAst(name, access, types, fields) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.fields = fields;
        _this.types = types;
        _this.access = access;
        return _this;
    }
    return EnumDefAst;
}(Ast));
exports.EnumDefAst = EnumDefAst;
// Control // Expressions
var SubjectDefAst = (function (_super) {
    __extends(SubjectDefAst, _super);
    function SubjectDefAst(name, ref, type, access) {
        var _this = _super.call(this, ref, type) || this;
        _this.name = name;
        _this.access = access;
        return _this;
    }
    return SubjectDefAst;
}(ExprAst));
exports.SubjectDefAst = SubjectDefAst;
var VariableDefAst = (function (_super) {
    __extends(VariableDefAst, _super);
    function VariableDefAst(name, ref, type, access) {
        return _super.call(this, name, ref, type, access) || this;
    }
    return VariableDefAst;
}(SubjectDefAst));
exports.VariableDefAst = VariableDefAst;
var ConstantDefAst = (function (_super) {
    __extends(ConstantDefAst, _super);
    function ConstantDefAst(name, ref, type, access) {
        return _super.call(this, name, ref, type, access) || this;
    }
    return ConstantDefAst;
}(SubjectDefAst));
exports.ConstantDefAst = ConstantDefAst;
var PropertyDefAst = (function (_super) {
    __extends(PropertyDefAst, _super);
    function PropertyDefAst(name, access, setter, getter) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.access = access;
        _this.setter = setter;
        _this.getter = getter;
        return _this;
    }
    return PropertyDefAst;
}(Ast));
exports.PropertyDefAst = PropertyDefAst;
var TryAst = (function (_super) {
    __extends(TryAst, _super);
    function TryAst(body, catchBlock, ensure, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.body = body;
        _this.catchBlock = catchBlock;
        _this.ensure = ensure;
        return _this;
    }
    return TryAst;
}(ExprAst));
exports.TryAst = TryAst;
var CatchAst = (function (_super) {
    __extends(CatchAst, _super);
    function CatchAst(body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.body = body;
        return _this;
    }
    return CatchAst;
}(ExprAst));
exports.CatchAst = CatchAst;
var EnsureAst = (function (_super) {
    __extends(EnsureAst, _super);
    function EnsureAst(body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.body = body;
        return _this;
    }
    return EnsureAst;
}(ExprAst));
exports.EnsureAst = EnsureAst;
// Control
var WhileAst = (function (_super) {
    __extends(WhileAst, _super);
    function WhileAst(condition, body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.condition = condition;
        _this.body = body;
        return _this;
    }
    return WhileAst;
}(ExprAst));
exports.WhileAst = WhileAst;
var LoopAst = (function (_super) {
    __extends(LoopAst, _super);
    function LoopAst(body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.body = body;
        return _this;
    }
    return LoopAst;
}(ExprAst));
exports.LoopAst = LoopAst;
var IfAst = (function (_super) {
    __extends(IfAst, _super);
    function IfAst(condition, body, ref, type, elifs, elseExpr) {
        var _this = _super.call(this, ref, type) || this;
        _this.condition = condition;
        _this.body = body;
        _this.elifs = elifs;
        _this.elseExpr = elseExpr;
        return _this;
    }
    return IfAst;
}(ExprAst));
exports.IfAst = IfAst;
var ElifAst = (function (_super) {
    __extends(ElifAst, _super);
    function ElifAst(condition, body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.condition = condition;
        _this.body = body;
        return _this;
    }
    return ElifAst;
}(ExprAst));
exports.ElifAst = ElifAst;
var ForLoopAst = (function (_super) {
    __extends(ForLoopAst, _super);
    function ForLoopAst(iteration, body, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.iteration = iteration;
        _this.body = body;
        return _this;
    }
    return ForLoopAst;
}(ExprAst));
exports.ForLoopAst = ForLoopAst;
// Expressions
// type signature is a string of comma seperated typeNames, 
// for function calls, the last typeName is the return type.
var NameAst = (function (_super) {
    __extends(NameAst, _super);
    function NameAst(name, ref, type, module) {
        var _this = _super.call(this, ref, type) || this;
        _this.name = name;
        _this.module = module;
        return _this;
    }
    return NameAst;
}(ExprAst));
exports.NameAst = NameAst;
var NewAst = (function (_super) {
    __extends(NewAst, _super);
    function NewAst(initializers, fieldMappings, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.initializers = initializers;
        _this.fieldMappings = fieldMappings;
        return _this;
    }
    return NewAst;
}(ExprAst));
exports.NewAst = NewAst;
var NothingAst = (function (_super) {
    __extends(NothingAst, _super);
    function NothingAst() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NothingAst;
}(ExprAst));
exports.NothingAst = NothingAst;
var SpillAst = (function (_super) {
    __extends(SpillAst, _super);
    function SpillAst() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SpillAst;
}(NothingAst));
exports.SpillAst = SpillAst;
var BreakAst = (function (_super) {
    __extends(BreakAst, _super);
    function BreakAst(param, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.param = param;
        return _this;
    }
    return BreakAst;
}(ExprAst));
exports.BreakAst = BreakAst;
var ContinueAst = (function (_super) {
    __extends(ContinueAst, _super);
    function ContinueAst(param, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.param = param;
        return _this;
    }
    return ContinueAst;
}(ExprAst));
exports.ContinueAst = ContinueAst;
var ReturnAst = (function (_super) {
    __extends(ReturnAst, _super);
    function ReturnAst(param, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.param = param;
        return _this;
    }
    return ReturnAst;
}(ExprAst));
exports.ReturnAst = ReturnAst;
var YieldAst = (function (_super) {
    __extends(YieldAst, _super);
    function YieldAst(param, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.param = param;
        return _this;
    }
    return YieldAst;
}(ExprAst));
exports.YieldAst = YieldAst;
var BooleanAst = (function (_super) {
    __extends(BooleanAst, _super);
    function BooleanAst(bool, ref) {
        var _this = _super.call(this, ref, "Bool") || this;
        _this.bool = bool;
        return _this;
    }
    return BooleanAst;
}(ExprAst));
exports.BooleanAst = BooleanAst;
var FunctionCallAst = (function (_super) {
    __extends(FunctionCallAst, _super);
    function FunctionCallAst(name, args, ref, type, module) {
        var _this = _super.call(this, ref, type) || this;
        _this.name = name;
        _this.args = args;
        _this.module = module;
        return _this;
    }
    return FunctionCallAst;
}(ExprAst));
exports.FunctionCallAst = FunctionCallAst;
var StringAst = (function (_super) {
    __extends(StringAst, _super);
    function StringAst(str, ref, custom) {
        var _this = _super.call(this, ref, "RawStr") || this;
        _this.str = str;
        _this.custom = custom;
        return _this;
    }
    return StringAst;
}(ExprAst));
exports.StringAst = StringAst;
var IntegerAst = (function (_super) {
    __extends(IntegerAst, _super);
    function IntegerAst(num, ref, custom) {
        var _this = _super.call(this, ref, "RawInt") || this;
        _this.num = num;
        _this.custom = custom;
        return _this;
    }
    return IntegerAst;
}(ExprAst));
exports.IntegerAst = IntegerAst;
var FloatAst = (function (_super) {
    __extends(FloatAst, _super);
    function FloatAst(num, ref, custom) {
        var _this = _super.call(this, ref, "RawFloat") || this;
        _this.num = num;
        _this.custom = custom;
        return _this;
    }
    return FloatAst;
}(ExprAst));
exports.FloatAst = FloatAst;
var AssignmentAst = (function (_super) {
    __extends(AssignmentAst, _super);
    function AssignmentAst(name, ref, type, rhs) {
        var _this = _super.call(this, ref, type) || this;
        _this.name = name;
        _this.rhs = rhs;
        return _this;
    }
    return AssignmentAst;
}(ExprAst));
exports.AssignmentAst = AssignmentAst;
var BinaryExprAst = (function (_super) {
    __extends(BinaryExprAst, _super);
    function BinaryExprAst(lhs, op, rhs, ref, type) {
        var _this = _super.call(this, ref, type) || this;
        _this.lhs = lhs;
        _this.op = op;
        _this.rhs = rhs;
        return _this;
    }
    return BinaryExprAst;
}(ExprAst));
exports.BinaryExprAst = BinaryExprAst;
var ListAst = (function (_super) {
    __extends(ListAst, _super);
    function ListAst(elements, ref, type, custom) {
        var _this = _super.call(this, ref, type) || this;
        _this.elements = elements;
        _this.custom = custom;
        return _this;
    }
    return ListAst;
}(ExprAst));
exports.ListAst = ListAst;
var TupleAst = (function (_super) {
    __extends(TupleAst, _super);
    function TupleAst(elements, ref, type, custom) {
        var _this = _super.call(this, ref, type) || this;
        _this.elements = elements;
        _this.custom = custom;
        return _this;
    }
    return TupleAst;
}(ExprAst));
exports.TupleAst = TupleAst;
var DictAst = (function (_super) {
    __extends(DictAst, _super);
    function DictAst(keys, values, ref, type, custom) {
        var _this = _super.call(this, ref, type) || this;
        _this.keys = keys;
        _this.values = values;
        _this.custom = custom;
        return _this;
    }
    return DictAst;
}(ExprAst));
exports.DictAst = DictAst;
//# sourceMappingURL=AstroAST0.1.0.js.map