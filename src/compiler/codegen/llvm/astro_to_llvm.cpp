#include "rapidjson/document.h"
#include "rapidjson/pointer.h"
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"
#include <iostream>

using std::cout;
using std::endl;
using std::shared_ptr;
using std::make_shared;
using std::string;
using std::move;


// ******* Forward declarartions *******
void print_document(shared_ptr<rapidjson::Document>);
shared_ptr<rapidjson::Document> parse(std::string&);
shared_ptr<rapidjson::Document> parse(std::string&&);
string get_string(shared_ptr<rapidjson::Document>, string);
shared_ptr<rapidjson::Document> parse_file(string);
void test();
void generate_program(shared_ptr<rapidjson::Document>);

// ******* Main *******
int main() {
    test();

    return 0;
}

// ******* Rapidjson Helpers *******
#include <fstream>

using std::ifstream;
using std::cerr;

using rapidjson::Document;
using rapidjson::Value;
using rapidjson::StringBuffer;
using rapidjson::Writer;
using rapidjson::Pointer;

shared_ptr<Document> parse(string&& json_string) {
    auto&& document = make_shared<Document>();
    document->Parse(json_string.c_str());
    return document;
}

shared_ptr<Document> parse(string& json_string) {
    auto&& document = make_shared<Document>();
    document->Parse(json_string.c_str());
    return document;
}

shared_ptr<Document> parse_file(string filename) {
    auto&& document = make_shared<Document>();

    // Open specoified file.
    ifstream file;
    file.open(filename);
    string line;
    string file_string = "";

    // Read string from file.
    if (file.is_open()) {
        while (std::getline(file, line)) {
            file_string = file_string + line;
        }
    } else {
        cerr << "Can't open file! (" << filename << ")" << endl;
    }

    // Parse file string
    document->Parse(file_string.c_str());

    return document;
}

string get_string(shared_ptr<Document> document, string pointer) {
    return Pointer(pointer.c_str()).Get(*document)->GetString();
}

// string get_string(Value *value, string pointer) {
//     return Pointer(pointer.c_str()).Get(*value)->GetString();
// }

Value* get_json_value(shared_ptr<Document> document, string pointer) {
    return Pointer(pointer.c_str()).Get(*document);
}

void print_document(shared_ptr<Document> document) {
    StringBuffer buffer;
    Writer<StringBuffer> writer(buffer);
    document->Accept(writer);
    cout << buffer.GetString() << endl;
}

void test() {
    auto document = parse("{\"project\":\"rapidjson\",\"stars\":10}");

    cout << "project = "<< get_string(document, "/project") << endl;

    cout << "========================================" << endl;

    document = parse_file("./ast_samples/function_call.json");

    cout << "program = " << get_string(document, "/program/0/kind") << endl;

    cout << "========================================" << endl;

    document = parse_file("./ast_samples/function_call.json");

    generate_program(document);

    cout << "program = " << get_json_value(document, "/program/0")->HasMember("kind") << endl;
}

// ******* Helper Functions *******
bool ends_with(const string& str, const string& suffix) {
    return str.size() >= suffix.size() && str.compare(str.size()-suffix.size(), suffix.size(), suffix) == 0;
}

bool starts_with(const std::string& str, const std::string& prefix) {
    return str.size() >= prefix.size() && str.compare(0, prefix.size(), prefix) == 0;
}

void print(string str) {
    cout << "<< " << str << " >>" << endl;
}

// ******* LLVMIR codegen *******
#include "llvm/ADT/APFloat.h"
#include "llvm/ADT/APInt.h"
// #include "llvm/ADT/STLExtras.h"
// #include "llvm/IR/BasicBlock.h"
#include "llvm/IR/Constants.h"
#include "llvm/IR/DerivedTypes.h"
// #include "llvm/IR/Function.h"
#include "llvm/IR/IRBuilder.h"
#include "llvm/IR/LLVMContext.h"
#include "llvm/IR/Module.h"
#include "llvm/IR/Type.h"
#include "llvm/Support/raw_ostream.h"
#include "llvm/IR/Verifier.h"
#include <iterator>
#include <climits>
#include <cstddef>
#include <memory>
#include <vector>
#include <map>
#include <utility>

using std::unique_ptr;
using std::vector;
using std::size_t;
using std::map;
using std::pair;

using llvm::LLVMContext;
using llvm::IRBuilder;
using llvm::Module;
using llvm::Function;
using llvm::FunctionType;
using llvm::Argument;
using llvm::Type;
using llvm::errs;
using llvm::ConstantInt;
using llvm::ConstantFP;
using llvm::Constant;
using llvm::APFloat;
using llvm::APInt;

// GLOBALS
static const unsigned machine_size_bytes = sizeof(size_t);
static const unsigned machine_size_bits = machine_size_bytes * CHAR_BIT;

Type *generate_type(string& type, LLVMContext& llvm_context) {
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

llvm::Value *generate_immediate(Value& value, LLVMContext& llvm_context) {
    auto&& kind = string(value["kind"].GetString());
    auto&& val = string(value["value"].GetString());

    if (kind == "isize*_value") {
        return ConstantInt::get(llvm_context, APInt(machine_size_bits, val, 10));
    } else if (kind == "isize_value") {
        return ConstantInt::get(llvm_context, APInt(machine_size_bits, val, 10));
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

llvm::Value *generate_function_argument(Value& value, Function *llvm_function) {
    auto&& index_str = string(value["index"].GetString());
    size_t argument_index = std::stoi(index_str);
    int count = 0;

    auto it = llvm_function->arg_begin();
    if (argument_index >= static_cast<size_t>(std::distance(it, llvm_function->arg_end()))) {
        return nullptr;
    }
    std::advance(it, argument_index);
    return it;
}

llvm::Value *generate_variable(Value& value, map<string, llvm::Value *>& variables) {
    auto&& name = string(value["name"].GetString());
    return variables[name];
}

llvm::Value *generate_operand(
    Value& value, Function *llvm_function, LLVMContext& llvm_context, map<string, llvm::Value *>& variables) {
    auto&& kind = string(value["kind"].GetString());

    if (kind == "argument") {
        return generate_function_argument(value, llvm_function);
    } else if (kind == "variable") {
        return generate_variable(value, variables);
    } else if (ends_with(kind, "_value")) {
        return generate_immediate(value, llvm_context);
    } else {
        return nullptr;
    }
}

llvm::Value *generate_intrinsic_operation(
    Value& value, IRBuilder<>& ir_builder, Function *llvm_function, LLVMContext& llvm_context, map<string, llvm::Value *>& variables) {
    auto&& kind = string(value["kind"].GetString());
    auto&& arguments = value["arguments"].GetArray();
    auto reference = string(value["reference"].GetString());

    if (kind == "intrinsic_add") {
        auto lhs_value = generate_operand(arguments[0], llvm_function, llvm_context, variables);
        auto rhs_value = generate_operand(arguments[1], llvm_function, llvm_context, variables);
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

llvm::Value *generate_function_call(Value& value, Function *llvm_function, LLVMContext& llvm_context, IRBuilder<>& ir_builder, Module& llvm_module, map<string, llvm::Value *>& variables) {
    auto name = string(value["name"].GetString());
    auto&& arguments = value["arguments"].GetArray();
    auto reference = string(value["reference"].GetString());
    vector<llvm::Value *> llvm_arguments;

    for (auto& argument : arguments) {
        auto arg = generate_operand(argument, llvm_function, llvm_context, variables);
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

llvm::Value *generate_return_statement(Value& value, Function *llvm_function, LLVMContext& llvm_context, IRBuilder<>& ir_builder, map<string, llvm::Value *>& variables) {
    auto exp = generate_operand(value["expression"], llvm_function, llvm_context, variables);
    auto val = ir_builder.CreateRet(exp);
    return val;
}

FunctionType *generate_function_type(Value& value, LLVMContext& llvm_context) {
    auto&& argument_types = value["argumenttypes"].GetArray();
    unsigned last_index = argument_types.Size() - 1;
    unsigned count = 0;

    // Stores the parameter types
    vector<Type *> llvm_argument_types_list;

    // Stores the return type
    auto&& return_type_str = string(argument_types[last_index].GetString());
    auto return_type = generate_type(return_type_str, llvm_context);

    for (auto& argument_type : argument_types) {
        // Don't add the last type to the list, that is the return type.
        if (last_index == count) {
            break;
        }

        auto&& type = string(argument_type.GetString());
        llvm_argument_types_list.push_back(generate_type(type, llvm_context));

        ++count;
    }

    return FunctionType::get(return_type, llvm_argument_types_list, false);
}

llvm::Value *generate_function(Value& value, LLVMContext& llvm_context, IRBuilder<>& ir_builder, Module& llvm_module, map<string, llvm::Value *>& variables) {
    // Gets the function name
    auto name = value["name"].GetString();

    // Creates function type signature
    auto llvm_function_type = generate_function_type(value, llvm_context);

    // Creates function prototype
    auto llvm_function = Function::Create(llvm_function_type, Function::ExternalLinkage, name, &llvm_module);

    // Gets body of the function
    auto&& body = value["body"].GetArray();

    // Creates the entry basic block
    auto function_entry_block = llvm::BasicBlock::Create(llvm_context, "entry", llvm_function);
    ir_builder.SetInsertPoint(function_entry_block);

    for (auto& expression : body) {
        auto&& kind = string(expression["kind"].GetString());
        // If expression is a value
        if (ends_with(kind, "_value")) {
            auto val = generate_immediate(expression, llvm_context);
        // If expression is an intrinsic operation
        } else if (starts_with(kind, "intrinsic")) {
            auto val = generate_intrinsic_operation(expression, ir_builder, llvm_function, llvm_context, variables);
            val->print(errs());
        // If expression is a return statement
        } else if (kind == "return") {
            auto val = generate_return_statement(expression, llvm_function, llvm_context, ir_builder, variables);
            val->print(errs());
        // If expression is a function call
        } else if (kind == "call") {
            auto val = generate_function_call(expression, llvm_function, llvm_context, ir_builder, llvm_module, variables);
            val->print(errs());
        }
    }

    // Checking if function IR is semantically correct.
    llvm::verifyFunction(*llvm_function);
}


void generate_program(shared_ptr<Document> document) {
    // LLVM setup
    LLVMContext llvm_context;
    IRBuilder<> ir_builder(llvm_context);
    Module llvm_module("astro-llvm", llvm_context);
    map<string, llvm::Value *> variables;

    if (document->HasMember("program")) {
        // Get the `/program` object
        auto&& program = get_json_value(document, "/program");

        // Iterate through the content in `/program`
        for (auto& sub_program : program->GetArray()) {

            // Get the `/program/[i]/kind` value.
            auto&& kind = string(sub_program["kind"].GetString());
            if (kind == "function") {
                auto func = generate_function(sub_program, llvm_context, ir_builder, llvm_module, variables);
            }
        }
    }

    // Print module
    cout << "\n============== :: Module :: ==============" << endl;
    llvm_module.print(errs(), nullptr);
    cout << "============== :: ====== :: ==============\n" << endl;
}



