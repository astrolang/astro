#include "utils.h"
#include <iostream>

using std::cout;
using std::endl;
using std::string;

namespace astro {

bool ends_with(const string &str, const string &suffix) {
  return str.size() >= suffix.size() &&
         str.compare(str.size() - suffix.size(), suffix.size(), suffix) == 0;
}

bool starts_with(const std::string &str, const std::string &prefix) {
  return str.size() >= prefix.size() &&
         str.compare(0, prefix.size(), prefix) == 0;
}

void print(string str) { cout << "<< " << str << " >>" << endl; }
} // namespace astro
