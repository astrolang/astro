#include "json_helper.h"

#include "rapidjson/document.h"
#include "rapidjson/pointer.h"
#include "rapidjson/stringbuffer.h"
#include "rapidjson/writer.h"

#include <fstream>
#include <iostream>
#include <memory>
#include <string>

using std::cerr;
using std::cout;
using std::endl;
using std::ifstream;
using std::make_shared;
using std::shared_ptr;
using std::string;

using rapidjson::Document;
using rapidjson::Value;
using rapidjson::Pointer;
using rapidjson::StringBuffer;
using rapidjson::Writer;

shared_ptr<Document> astro::parse(string &json_string) {
    auto &&document = make_shared<Document>();
    document->Parse(json_string.c_str());
    return document;
}

shared_ptr<Document> astro::parse_file(string filename) {
    auto &&document = make_shared<Document>();

    // Open specified file.
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

Value* astro::get_value(shared_ptr<Document> document, string pointer) {
    return Pointer(pointer.c_str()).Get(*document);
}

void astro::print_document(shared_ptr<Document> document) {
    StringBuffer buffer;
    Writer<StringBuffer> writer(buffer);
    document->Accept(writer);
    cout << buffer.GetString() << endl;
}
