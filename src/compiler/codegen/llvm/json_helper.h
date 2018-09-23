#include "rapidjson/document.h"
#include <memory>
#include <string>

using std::shared_ptr;
using std::string;

using rapidjson::Document;
using rapidjson::Value;

namespace astro {

shared_ptr<Document> parse(string &json_string);

shared_ptr<Document> parse_file(string filename);

Value* get_value(shared_ptr<Document> document, string pointer);

void print_document(shared_ptr<Document> document);

} // namespace astro
