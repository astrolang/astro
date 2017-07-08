"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 05/07/17 
var AstroAST0_1_0_1 = require("./AstroAST0.1.0");
var Token = (function () {
    function Token(str, type, line, col) {
        this.str = str;
        this.type = type;
        this.line = line;
        this.col = col;
    }
    return Token;
}());
exports.Token = Token;
// Enums 
var TokenType;
(function (TokenType) {
    TokenType[TokenType["name"] = 0] = "name";
    TokenType[TokenType["float"] = 1] = "float";
    TokenType[TokenType["integer"] = 2] = "integer";
    TokenType[TokenType["boolean"] = 3] = "boolean";
    TokenType[TokenType["string"] = 4] = "string";
    TokenType[TokenType["comment"] = 5] = "comment";
    TokenType[TokenType["keyword"] = 6] = "keyword";
    TokenType[TokenType["operator"] = 7] = "operator";
    TokenType[TokenType["punctuator"] = 8] = "punctuator";
    TokenType[TokenType["newline"] = 9] = "newline";
    TokenType[TokenType["indent"] = 10] = "indent";
    TokenType[TokenType["dedent"] = 11] = "dedent";
    TokenType[TokenType["eoi"] = 12] = "eoi";
    TokenType[TokenType["ns"] = 13] = "ns";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var RefType;
(function (RefType) {
    RefType[RefType["ref"] = 0] = "ref";
    RefType[RefType["val"] = 1] = "val";
    RefType[RefType["iso"] = 2] = "iso";
    RefType[RefType["acq"] = 3] = "acq";
})(RefType = exports.RefType || (exports.RefType = {}));
var AccessType;
(function (AccessType) {
    AccessType[AccessType["public"] = 0] = "public";
    AccessType[AccessType["private"] = 1] = "private";
    AccessType[AccessType["readOnly"] = 2] = "readOnly";
})(AccessType = exports.AccessType || (exports.AccessType = {}));
// ...
var Utility = (function () {
    function Utility() {
    }
    Utility.printTokens = function (tokens) {
        console.log("ENTRY TOKEN\n------------\n");
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            console.log(token.str + " => type: " + Utility.printTokenType(token.type) + ", line: " + token.line + ", col: " + token.col);
        }
        console.log("\n-----------\nEXIT TOKEN");
    };
    Utility.printAsts = function (asts) {
        console.log("ENTRY AST\n---------\n");
        for (var _i = 0, asts_1 = asts; _i < asts_1.length; _i++) {
            var ast = asts_1[_i];
            console.log(Utility.printAst(ast));
        }
        console.log("\n--------\nEXIT AST");
    };
    // TODO: INCOMPLETE
    Utility.printAst = function (ast, indent) {
        var astTreeStr = "";
        var indentStr = "\n";
        if (indent != null) {
            for (var i = 0; i < indent + 1; i++)
                indentStr += "    ";
        }
        else
            indent = 0;
        if (ast instanceof AstroAST0_1_0_1.TypeDefAst) {
            astTreeStr += indentStr + ("Type  " + ast.name); // name
            astTreeStr += indentStr + ("* Access: " + this.printAccessType(ast.access)); // access 
            astTreeStr += indentStr + "* Fields: "; // fields
            if (ast.fields != null)
                for (var _i = 0, _a = ast.fields; _i < _a.length; _i++) {
                    var field = _a[_i];
                    astTreeStr += this.printAst(field, indent);
                }
            else {
                astTreeStr += "\n    null";
            }
            astTreeStr += indentStr + "* Parents: "; // parents
            if (ast.parents != null)
                for (var _b = 0, _c = ast.parents; _b < _c.length; _b++) {
                    var parent_1 = _c[_b];
                    astTreeStr += "\n    " + parent_1;
                }
            else {
                astTreeStr += "\n    null";
            }
        }
        else if (ast instanceof AstroAST0_1_0_1.VariableDefAst) {
            astTreeStr += indentStr + ("Var " + ast.name);
            astTreeStr += indentStr + ("* Ref: " + this.printRefType(ast.ref));
            astTreeStr += indentStr + ("* Type: " + ast.type);
            astTreeStr += indentStr + ("* Access: " + ast.access);
        }
        else if (ast instanceof AstroAST0_1_0_1.ConstantDefAst) {
            astTreeStr += indentStr + ("Let " + ast.name);
            astTreeStr += indentStr + ("* Ref: " + this.printRefType(ast.ref));
            astTreeStr += indentStr + ("* Type: " + ast.type);
            astTreeStr += indentStr + ("* Access: " + ast.access);
        }
        else if (ast instanceof AstroAST0_1_0_1.FunctionDefAst) {
            astTreeStr += indentStr + ("Fun " + ast.name);
            astTreeStr += indentStr + ("* Access: " + ast.access);
            astTreeStr += indentStr + "* Params: ";
            for (var _d = 0, _e = ast.params; _d < _e.length; _d++) {
                var param = _e[_d];
                astTreeStr += this.printAst(param, indent);
            }
            astTreeStr += indentStr + "* Body: ";
            for (var _f = 0, _g = ast.body; _f < _g.length; _f++) {
                var bodyElelement = _g[_f];
                astTreeStr += this.printAst(bodyElelement, indent);
            }
        }
        else {
            astTreeStr += indentStr + "Other";
        }
        return astTreeStr;
    };
    Utility.printTokenType = function (tokenType) {
        switch (tokenType) {
            case TokenType.name: return 'name';
            case TokenType.float: return 'float';
            case TokenType.integer: return 'integer';
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
    };
    Utility.printAccessType = function (accessType) {
        switch (accessType) {
            case AccessType.private: return 'private';
            case AccessType.public: return 'public';
            case AccessType.readOnly: return 'readOnly';
            case null: return 'null';
        }
    };
    Utility.printRefType = function (refType) {
        switch (refType) {
            case RefType.val: return 'val';
            case RefType.ref: return 'ref';
            case RefType.iso: return 'iso';
            case RefType.acq: return 'acq';
            case null: return 'null';
        }
    };
    return Utility;
}());
exports.Utility = Utility;
//# sourceMappingURL=AstroUtility0.1.0.js.map