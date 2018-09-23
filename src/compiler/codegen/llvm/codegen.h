#include "rapidjson/document.h"

#include "llvm/IR/IRBuilder.h"
#include "llvm/IR/LLVMContext.h"
#include "llvm/IR/Module.h"
#include "llvm/IR/Type.h"

#include <climits>
#include <cstddef>

namespace astro {
class LLVMCodegen;
}

using std::map;
using std::shared_ptr;
using std::string;

using rapidjson::Document;
using rapidjson::Value;

using llvm::Argument;
using llvm::Function;
using llvm::FunctionType;
using llvm::IRBuilder;
using llvm::LLVMContext;
using llvm::Module;
using llvm::Type;

/**
 * ### Astro's LLVM Codegen.
 *
 * #### NOTE:
 * * It takes a lowered astro AST and compiles it to LLVM IR
 *
 * #### TODO:
 */
class astro::LLVMCodegen {
  private:
    shared_ptr<Document> ast;
    LLVMContext llvm_context;
    Module llvm_module;
    IRBuilder<> ir_builder;
    map<string, llvm::Value *> variables;

    static const unsigned machine_size_bytes = sizeof(size_t);
    static const unsigned machine_size_bits = machine_size_bytes * CHAR_BIT;

  public:
    LLVMCodegen(shared_ptr<Document> ast);

    Type *generate_type(string &type);

    llvm::Value *generate_immediate(Value &value);

    llvm::Value *generate_function_argument(Value &value,
                                            Function *llvm_function);

    llvm::Value *generate_variable(Value &value);

    llvm::Value *generate_operand(Value &value, Function *llvm_function);

    llvm::Value *generate_intrinsic_operation(Value &value,
                                              Function *llvm_function);

    llvm::Value *generate_function_call(Value &value, Function *llvm_function);

    llvm::Value *generate_return_statement(Value &value,
                                           Function *llvm_function);

    FunctionType *generate_function_type(Value &value);

    llvm::Value *generate_function(Value &value);

    void generate_program();
};
