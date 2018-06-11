
# Astro Programming Language
![hound](https://camo.githubusercontent.com/23ee7a697b291798079e258bbc25434c4fac4f8b/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50726f7465637465645f62792d486f756e642d6138373364312e737667)
[![Build Status](https://travis-ci.org/astrolang/astro.svg?branch=dev)](https://travis-ci.org/astrolang/astro)
[![Coverage Status](https://coveralls.io/repos/github/astrolang/astro/badge.svg?branch=dev)](https://coveralls.io/github/astrolang/astro?branch=dev)
[![Maintainability](https://api.codeclimate.com/v1/badges/bf1547053d4e22d1e9f3/maintainability)](https://codeclimate.com/github/astrolang/astro/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/bf1547053d4e22d1e9f3/test_coverage)](https://codeclimate.com/github/astrolang/astro/test_coverage)
![Maintained](https://img.shields.io/maintenance/yes/2018.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
#### Work in Progress :construction:
Current Version: 0.1.14


![astro screenshot](https://github.com/astrolang/astro/blob/ch-implement-packrat-parser-156977411/media/images/astro-syntax.png?raw=true)

### Installation
If you don't have `node` installed already, download and install it [here](https://nodejs.org/en/download/).
##### _USERS_
* Install astro by typing ```npm i -g astrolang``` in the terminal.
* You can start using astro with ```astro -h```.

##### _DEVELOPERS_
* Clone repository ➡ ```git clone https://github.com/appcypher/astro.git```.
* Move to astro directory ➡ ```cd astro```.
* Install necessary dependencies ➡ ```npm i```.
* Run tests ➡ ```npm run test:compiler```.

### What is Astro?
Astro is a fun programming language designed for _high-performance numerical-computing_ and _web applications_.
- statically-typed language that
- compiles to native code and WebAssembly,
- has no GC,
- has a syntax similar to [Python](https://en.m.wikipedia.org/wiki/Python_(programming_language)),
- provides full type inference, and
- has first-class support for data-race-free concurrency.

### Why create yet another programming language?
The language creator had a set of requirements (listed above) not met by any single language. Although, the project started as an educational effort, it later shaped into a language designed to meet those requirements.

SIMD, threads and direct access to Web APIs are planned for WebAssembly. These and the proposed GPU Compute standards will make the web a desirable HPC target in the near future. Astro makes developing high-performance web and native apps seamless, easier and less frustrating.

Astro has no runtime [Garbage Collector](https://en.m.wikipedia.org/wiki/Garbage_collection_(computer_science)) (GC) as it is expected to be fast enough to develop games, scientific simulations and other real-time software. This can make it suitable for embedded software development even though it's not a goal.

In addition, Astro makes several design decisions that benefit numerical computing applications. For example, it has builtin support for matrices, vectorization, unicode identifiers, etc.

In order to match up with the expressiveness and productivity level of dynamic programming languages, Astro adds full type inference, and several other high-level language features that increase productivity. It feels like a scripting language for the most part. A typical Astro program looks very much like its Python translation.

#### Python
```python
def times(a, b):
    sum = a
    for i in range(b):
        sum += sum
    return sum
```
#### Astro
```kotlin
fun times(a, b):
    var sum = a
    for i in 1..b:
        sum += sum
    return sum
```

Finally, seeing as CPU manufacturers are favoring multi-core design over transistor shrinkage, we believe making concurrency (and parallelism) a major aspect of the language development is beneficial to the type of applications that the language targets.

Astro has builtin facilities for writing concurrent programs, in the form of fibers, a [CSP](https://en.m.wikipedia.org/wiki/Communicating_sequential_processes)-based lightweight threading model, with the guarantee that the programs you write won't have data races.


### Why not just use exactly Python syntax or try to be compatible with Python?
Python is a really dynamic programming language and there have been several attempts in the past to compile it AOT to native code. We don't want to reinvent the wheel since there are lessons to learn from old wheels. Python cannot be fully-inferred at compile-time without performance trade-offs.

More importantly Astro introduces some concepts that Python doesn't have and probably never will.

### What is Astro automatic memory management like? Rust's or Swift's?
Neither.
Astro uses a special [Automatic Reference Counting](https://en.m.wikipedia.org/wiki/Reference_counting) (ARC) system that automatically breaks reference cycles, so its unlike Swift's ARC which requires some special annotations in cases like that.
It's also unlike Rust current memory management model as it puts lesser restrictions on how references are moved around while still being memory safe.

Astro simply, stays out of your way, lets you write your code like you would in any other garbage-collected language.

### How close is Astro to being ready for production use?
Not close. Astro is at its infancy, there are several tasks —which you can find [below](#tasks)— to complete before it becomes usable.

For now, Astro can only compile its source code to ast format. It is not ready for even the simplest application.

### How will Astro tooling be like?
Astro is meant for interactive high-productivity usage therefore a visual REPL, for visualizing and introspecting different kinds of data, is planned.
It will also have a set of language tools for making editor support easier.

Incremental compilation is a goal as well since the language requires a lot of complex compile-time computations like control flow analysis and escape analysis.

### Where can I read about the language?
There is no proper documentation for the language yet since the main implementation is still under active development, but you can find an up-to-date summary of language features [here](docs/language/summary.ast).

### <a name="tasks"></a> What are the important tasks to complete?
- [x] ~Improve project structure~
- [x] ~Add automated unit testing and coverage reports~
- [x] ~Redesign and remove certain inconsistencies in language syntax~
- [x] ~Complete lexer implementation~
- [ ] Complete parser implementation
- [ ] Implement semantic analysis phase
- [ ] Create ambiguity finders for inheritance, multiple dispatch, etc.
- [ ] Implement type inference and garbage collection using program flow analysis
- [ ] Add wasm code generation
- [ ] Incorporate incremental compilation
- [ ] Build REPL
- [ ] Create specialized error handler

### What are the technologies used?
- [wast2wasm](https://www.npmjs.com/package/wast2wasm) - a tool for translating WebAssembly s-expression format to its binary-encoded format.

### Want to contribute to the project?
Please read the [code of conduct](CODE_OF_CONDUCT.md) and contribution [guidelines](CONTRIBUTING.md). We welcome your ideas and contributions.

### Do you have an unanswered question?
Please [open an issue](https://github.com/appcypher/astro/issues/new) and ask questions, offer to help, point out bugs or suggest features.

### Attributions
Astro logo made by [Freepik](https://www.freepik.com/)
