#include "codegen.h"
#include "json_helper.h"
#include "utils.h"

#include "llvm/ADT/APFloat.h"
#include "llvm/ADT/APInt.h"
#include "llvm/IR/Constants.h"
#include "llvm/IR/DerivedTypes.h"
#include "llvm/IR/Verifier.h"
#include "llvm/Support/raw_ostream.h"

#include <iostream>
#include <iterator>
#include <map>
#include <memory>
#include <utility>
#include <vector>

using astro::LLVMCodegen;

using std::cout;
using std::endl;
using std::map;
using std::pair;
using std::shared_ptr;
using std::size_t;
using std::unique_ptr;
using std::vector;

using rapidjson::Value;

using llvm::APFloat;
using llvm::APInt;
using llvm::Argument;
using llvm::Constant;
using llvm::ConstantFP;
using llvm::ConstantInt;
using llvm::errs;
using llvm::Function;
using llvm::FunctionType;
using llvm::IRBuilder;
using llvm::LLVMContext;
using llvm::Module;
using llvm::Type;

LLVMCodegen::LLVMCodegen(shared_ptr<Document> ast)
    : ast{ast}, llvm_module{"astro-llvm", this->llvm_context},
      ir_builder{this->llvm_context} {}

Type *LLVMCodegen::generate_type(string &type) {
    if (type == "isize*") {
        return Type::getIntNPtrTy(llvm_context, machine_size_bits);
    } else if (type == "isize") {
        return Type::getIntNTy(llvm_context, machine_size_bits);
    } else if (type == "int64") {
        return Type::getInt64Ty(llvm_context);
    } else if (type == "f16") {
        return Type::getHalfTy(llvm_context);
    } else if (type == "f32") {
        return Type::getFloatTy(llvm_context);
    } else if (type == "f64") {
        return Type::getDoubleTy(llvm_context);
    } else if (type == "void") {
        return Type::getVoidTy(llvm_context);
    } else {
        return nullptr;
    }
}

llvm::Value *LLVMCodegen::generate_immediate(Value &value) {
    auto &&kind = string(value["kind"].GetString());
    auto &&val = string(value["value"].GetString());

    if (kind == "isize*_value") {
        return ConstantInt::get(llvm_context,
                                APInt(machine_size_bits, val, 10));
    } else if (kind == "isize_value") {
        return ConstantInt::get(llvm_context,
                                APInt(machine_size_bits, val, 10));
    } else if (kind == "int64_value") {
        return ConstantInt::get(llvm_context, APInt(64, val, 10));
    } else if (kind == "f16_value") {
        return ConstantFP::get(llvm_context, APFloat(std::stof(val)));
    } else if (kind == "f32_value") {
        return ConstantFP::get(llvm_context, APFloat(std::stof(val)));
    } else if (kind == "f64_value") {
        return ConstantFP::get(llvm_context, APFloat(std::stod(val)));
    } else {
        return nullptr;
    }
}

llvm::Value *LLVMCodegen::generate_function_argument(Value &value,
                                                     Function *llvm_function) {
    auto &&index_str = string(value["index"].GetString());
    size_t argument_index = std::stoi(index_str);
    int count = 0;

    auto it = llvm_function->arg_begin();
    if (argument_index >=
        static_cast<size_t>(std::distance(it, llvm_function->arg_end()))) {
        return nullptr;
    }
    std::advance(it, argument_index);
    return it;
}

llvm::Value *LLVMCodegen::generate_variable(Value &value) {
    auto &&name = string(value["name"].GetString());
    return variables[name];
}

llvm::Value *LLVMCodegen::generate_operand(Value &value,
                                           Function *llvm_function) {
    auto &&kind = string(value["kind"].GetString());

    if (kind == "argument") {
        return generate_function_argument(value, llvm_function);
    } else if (kind == "variable") {
        return generate_variable(value);
    } else if (ends_with(kind, "_value")) {
        return generate_immediate(value);
    } else {
        return nullptr;
    }
}

llvm::Value *
LLVMCodegen::generate_intrinsic_operation(Value &value,
                                          Function *llvm_function) {
    auto &&kind = string(value["kind"].GetString());
    auto &&arguments = value["arguments"].GetArray();
    auto reference = string(value["reference"].GetString());

    if (kind == "intrinsic_add") {
        auto lhs_value = generate_operand(arguments[0], llvm_function);
        auto rhs_value = generate_operand(arguments[1], llvm_function);
        if (reference == "") {
            return ir_builder.CreateAdd(lhs_value, rhs_value);
        }
        auto val = ir_builder.CreateAdd(lhs_value, rhs_value, reference);
        variables.insert(pair<string, llvm::Value *>(reference, val));
        return val;
    } else if (kind == "intrinsic_sub") {
        return nullptr;
    } else if (kind == "intrinsic_mul") {
        return nullptr;
    } else if (kind == "intrinsic_div") {
        return nullptr;
    } else {
        return nullptr;
    }
}

llvm::Value *LLVMCodegen::generate_function_call(Value &value,
                                                 Function *llvm_function) {
    auto name = string(value["name"].GetString());
    auto &&arguments = value["arguments"].GetArray();
    auto reference = string(value["reference"].GetString());
    vector<llvm::Value *> llvm_arguments;

    for (auto &argument : arguments) {
        auto arg = generate_operand(argument, llvm_function);
        llvm_arguments.push_back(arg);
    }

    auto function = llvm_module.getFunction(name);

    if (reference == "") {
        return ir_builder.CreateCall(function, llvm_arguments);
    }

    auto val = ir_builder.CreateCall(function, llvm_arguments, reference);
    variables.insert(pair<string, llvm::Value *>(reference, val));
    return val;
}

llvm::Value *LLVMCodegen::generate_return_statement(Value &value,
                                                    Function *llvm_function) {
    auto exp = generate_operand(value["expression"], llvm_function);
    auto val = ir_builder.CreateRet(exp);
    return val;
}

FunctionType *LLVMCodegen::generate_function_type(Value &value) {
    auto &&argument_types = value["argumenttypes"].GetArray();
    unsigned last_index = argument_types.Size() - 1;
    unsigned count = 0;

    // Stores the parameter types
    vector<Type *> llvm_argument_types_list;

    // Stores the return type
    auto &&return_type_str = string(argument_types[last_index].GetString());
    auto return_type = generate_type(return_type_str);

    for (auto &argument_type : argument_types) {
        // Don't add the last type to the list, that is the return type.
        if (last_index == count) {
            break;
        }

        auto &&type = string(argument_type.GetString());
        llvm_argument_types_list.push_back(generate_type(type));

        ++count;
    }

    return FunctionType::get(return_type, llvm_argument_types_list, false);
}

llvm::Value *LLVMCodegen::generate_function(Value &value) {
    // Gets the function name
    auto name = value["name"].GetString();

    // Creates function type signature
    auto llvm_function_type = generate_function_type(value);
    
    // Creates function prototype
    auto llvm_function = Function::Create(
        llvm_function_type, Function::ExternalLinkage, name, &llvm_module);

    // Gets body of the function
    auto &&body = value["body"].GetArray();

    // Creates the entry basic block
    auto function_entry_block =
        llvm::BasicBlock::Create(llvm_context, "entry", llvm_function);
    ir_builder.SetInsertPoint(function_entry_block);

    for (auto &expression : body) {
        auto &&kind = string(expression["kind"].GetString());
        // If expression is a value
        if (ends_with(kind, "_value")) {
            auto val = generate_immediate(expression);
            // If expression is an intrinsic operation
        } else if (starts_with(kind, "intrinsic")) {
            auto val = generate_intrinsic_operation(expression, llvm_function);
            val->print(errs());
            // If expression is a return statement
        } else if (kind == "return") {
            auto val = generate_return_statement(expression, llvm_function);
            val->print(errs());
            // If expression is a function call
        } else if (kind == "call") {
            auto val = generate_function_call(expression, llvm_function);
            val->print(errs());
        }
    }

    // Checking if function IR is semantically correct.
    llvm::verifyFunction(*llvm_function);
}

void LLVMCodegen::generate_program() {
    if (ast->HasMember("program")) {
        // Get the `/program` object
        auto &&program = get_value(ast, "/program");

        // Iterate through the content in `/program`
        for (auto &sub_program : program->GetArray()) {
            // Get the `/program/[i]/kind` value.
            auto &&kind = string(sub_program["kind"].GetString());
            if (kind == "function") {
                auto func = generate_function(sub_program);
            }
        }
    }

    // Print module
    cout << "\n============== :: Module :: ==============" << endl;
    llvm_module.print(errs(), nullptr);
    cout << "============== :: ====== :: ==============\n" << endl;
}
