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

string get_string(Value *value, string pointer) {
    return Pointer(pointer.c_str()).Get(*value)->GetString();
}

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

// ******* LLVMIR codegen *******
// #include "llvm/ADT/APFloat.h"
// #include "llvm/ADT/STLExtras.h"
// #include "llvm/IR/BasicBlock.h"
// #include "llvm/IR/Constants.h"
#include "llvm/IR/DerivedTypes.h"
// #include "llvm/IR/Function.h"
#include "llvm/IR/IRBuilder.h"
#include "llvm/IR/LLVMContext.h"
#include "llvm/IR/Module.h"
#include "llvm/IR/Type.h"
// #include "llvm/IR/Verifier.h"
#include <utility>
#include <climits>
#include <cstddef>
#include <map>
#include <memory>
#include <vector>

using std::unique_ptr;
using std::map;
using std::vector;
using std::pair;

using llvm::LLVMContext;
using llvm::IRBuilder;
using llvm::Module;
using llvm::Function;
using llvm::FunctionType;
using llvm::Type;

const int machine_size_bytes = sizeof(std::size_t);
const int machine_size_bits = machine_size_bytes * CHAR_BIT;

Type *get_type(string& type, LLVMContext& llvm_context) {
    if (type == "int*") {
        return Type::getIntNPtrTy(llvm_context, machine_size_bits);
    } else if (type == "int") {
        return Type::getIntNTy(llvm_context, machine_size_bits);
    } else if (type == "int64") {
        return Type::getInt64Ty(llvm_context);
    } else if (type == "f16") {
        return Type::getHalfTy(llvm_context);
    } else if (type == "f32") {
        return Type::getFloatTy(llvm_context);
    } else if (type == "f64") {
        return Type::getDoubleTy(llvm_context);
    } else {
        return nullptr;
    }
}

void get_meta_data() {
}

llvm::Value *generate_function(Value& function, LLVMContext& llvm_context) {
    // SECTION: Creates the prototype of the function
    auto&& argument_types = function["argumenttypes"].GetArray();
    int last_index = argument_types.Size() - 1;
    int count = 0;

    // Stores the parametere types
    vector<Type *> llvm_argument_types_list;

    // Stores the return type
    auto&& return_type_string = string(argument_types[last_index].GetString());
    auto return_type = get_type(return_type_string, llvm_context);

    for (auto& argument_type : argument_types) {
        // Don't add the last type to the list, that is the return type.
        if (last_index == count) {
            break;
        }

        auto&& type = string(argument_type.GetString());
        llvm_argument_types_list.push_back(get_type(type, llvm_context));

        ++count;
    }

    // Create LLVM prototype
    // auto llvm_function_type = FunctionType::get(return_type, llvm_argument_types_list, false);

    // SECTION: Creates the prototype of the function
}

llvm::Value *generate_value(Value& value) {

}

llvm::Value *generate_variable(Value& value) {
}

void generate_program(shared_ptr<Document> document) {
    // LLVM setup
    LLVMContext llvm_context;
    IRBuilder<> ir_builder(llvm_context);
    unique_ptr<Module> module;
    map<string, pair<string, Value *>> variables; // Map{ name, (type, llVm_value) }


    if (document->HasMember("program")) {
        // Get the `/program` object
        auto&& program = get_json_value(document, "/program");

        // Iterate through the content in `/program`
        for (auto& sub_program : program->GetArray()) {

            // Get the `/program/[i]/kind` value.
            auto&& kind = string(sub_program["kind"].GetString());
            if (kind == "function") {
                auto func = generate_function(sub_program, llvm_context);
                // cout << "Boom" << endl;
                // generate_function(sub_program)
            }
        }
    }
}



