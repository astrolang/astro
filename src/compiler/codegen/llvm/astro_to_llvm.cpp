#include "codegen.h"
#include "json_helper.h"

void test();

// ******* Main *******
int main() {
    test();
    return 0;
}

void test() {
    auto document = astro::parse_file("../codegen/ast_samples/function_definition.json");
    astro::LLVMCodegen(document).generate_program();
}
