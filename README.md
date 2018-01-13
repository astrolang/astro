
# Astro Programming Language
![hound](https://camo.githubusercontent.com/23ee7a697b291798079e258bbc25434c4fac4f8b/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f50726f7465637465645f62792d486f756e642d6138373364312e737667)
[![Build Status](https://travis-ci.org/appcypher/astro.svg?branch=dev)](https://travis-ci.org/appcypher/astro)
[![Coverage Status](https://coveralls.io/repos/github/AppCypher/Astro/badge.svg?branch=dev)](https://coveralls.io/github/AppCypher/Astro?branch=dev)
[![Maintainability](https://api.codeclimate.com/v1/badges/9739900850aeebc6b2d5/maintainability)](https://codeclimate.com/github/AppCypher/Astro/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/9739900850aeebc6b2d5/test_coverage)](https://codeclimate.com/github/AppCypher/Astro/test_coverage)
![Maintained](https://img.shields.io/maintenance/yes/2018.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
#### Work in Progress :construction:
Current Version: 0.1.13
![astro screenshot](https://github.com/AppCypher/Astro/blob/dev/media/images/astro-syntax.png)

### What is Astro?
Astro is a fullstack multi-paradigm programming language designed for high-performance numerical-computing applications.

Astro is a
- statically-typed language that
- compiles to native code and WebAssembly,
- has no GC,
- has a syntax similar to [Python](https://en.m.wikipedia.org/wiki/Python_(programming_language)),
- provides full type inference, and
- has first-class support for data-race and deadlock-free concurrency.

### Why create yet another programming language?
The language creator had a set of requirements (listed above) not met by any single language. Although, the project started as an educational effort, it later shaped into a language designed to meet those requirements.

SIMD, threads and direct access to Web APIs are planned for WebAssembly. These and the proposed GPU Compute standards will make the web a desirable HPC target in the near future. Astro fullstack nature makes developing high-performance apps for web and/or desktop seamless, easier and less frustrating.

Astro has no runtime [Garbage Collector](https://en.m.wikipedia.org/wiki/Garbage_collection_(computer_science)) (GC) as it is expected to be fast enough to develop games, physical simulations and other real-time software. This also makes it suitable for embedded software development even though it's not a goal.

In addition, Astro makes some design decisions that are intuitive for numerical computing applications. For example, it has builtin support for vectors, matrices, vectorization, unicode identifiers, etc.

In order to match up with the expressiveness and productivity of dynamic programming languages, Astro adds full type inference, structural typing and several other high-level language features that increase productivity. A typical Astro program looks very much like its Python translation.

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

Astro has builtin facilities for writing concurrent programs, in form of fibers, [CSP](https://en.m.wikipedia.org/wiki/Communicating_sequential_processes)-based light-weight threads, and channels, with the guarantee that the programs you write won't have data races or deadlocks.


### Why not just use exactly Python syntax or try to be compatible with Python?
Python is a really dynamic programming language and there have been several attempts in the past to compile it AOT to native code. We don't want to reinvent the wheel since there are lessons to learn from old wheels. Python cannot be fully-inferred at compile-time without performance trade-offs.

More importantly Astro introduces some concepts that Python doesn't have and probably never will.

### What is Astro automatic memory management like? Rust's or Swift's?
Neither.
Astro uses a special [Automatic Reference Counting](https://en.m.wikipedia.org/wiki/Reference_counting)(ARC) system that automatically breaks reference cycles, so its unlike Swift's ARC which requires some special annotations in cases like that.
It's also unlike Rust memory management model as it puts lesser restrictions on how references are moved around while still being memory safe.

Astro simply, stays out of your way, lets you write your code like you would in any other garbage-collected language.

### How close is Astro to being ready for production use?
Not close. Astro is at its infancy, there are several tasks —which you can find [below](#tasks)— to complete before it becomes usable.

For now, Astro can only compile its source code to ast format. It is not ready for even the simplest application.

### How will Astro tooling be like?
Astro is meant for interactive high-productivity usage therefore a visual REPL, for visualizing and introspecting different kinds of data, is planned.
It will also have a set of language tools for making editor support easier.

Incremental compilation is a goal as well since the language requires a lot of compile-time computations like type inference and program flow analysis.

### Where can I read about the language?
There is no proper documentation for the language yet since the main implementation is still under active development, but you can find an up-to-date summary of language features [here](docs/language/summary.ast).

Gitbooks covering different aspects of the project are in works. They will be published as soon the language becomes usable.

### <a name="tasks"></a> What are the important tasks to complete?
- [x] ~Improve project structure~
- [x] ~Add automated unit testing and coverage reports~
- [x] ~Redesign and remove certain inconsistencies in language syntax~
- [ ] Complete parser implementation
- [ ] Implement basic semantic analysis
- [ ] Create ambiguity finders for inheritance, multiple dispatch, etc.
- [ ] Implement type inference and garbage collection using program flow analysis
- [ ] Add wasm code generation
- [ ] Incorporate incremental compilation
- [ ] Build REPL
- [ ] Create specialized error handler

### What are the technologies used?
- [wast2wasm](https://www.npmjs.com/package/wast2wasm) - translates from s-expressions to the WebAssembly binary-encoding.

### Want to contribute to the project?
Please read the [code of conduct](CODE_OF_CONDUCT.md) and contribution [guidelines](CONTRIBUTING.md). We welcome your ideas and contributions.

### Do you have an unanswered question?
Please [open an issue](https://github.com/appcypher/astro/issues/new) and ask questions, offer to help, point out bugs or suggest features.

### Other interesting new languages that compile to WebAssembly
- [Forest](https://github.com/forest-lang/core) - multi-syntax functional programming language
- [AssemblyScript](https://github.com/AssemblyScript/assemblyscript) - a new compiler targeting WebAssembly while utilizing TypeScript's syntax and node's vibrant ecosystem.
- [Walt](https://github.com/ballercat/walt) - an alternative syntax for WebAssembly text format. It's an experiment for using JavaScript syntax to write to as 'close to the metal' as possible.

### Project folder structure
```
.
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── MVP.md
├── README.md
├── docs
│   ├── README.md
│   ├── compiler
│   │   ├── README.md
│   │   ├── asts.md
│   │   └── compiler-notes.ast
│   └── language
│       ├── README.md
│       ├── development.ast
│       ├── feature-proposals.md
│       └── summary.ast
├── media
│   └── images
│       └── astro-syntax.png
├── package-lock.json
├── package.json
├── samples
│   ├── README.md
│   ├── fibonacci
│   │   └── fibonacci.ast
│   ├── fizzbuzz
│   │   └── fizzbuzz.ast
│   ├── hello-world
│   │   └── hello-world.ast
│   ├── miscellaneous
│   │   └── preview.ast
│   ├── normalize
│   │   └── normalize.ast
│   ├── product
│   │   └── product.ast
│   ├── sum
│   │   └── sum.ast
│   ├── vectorized
│   │   └── vectorized.ast
│   └── wordcount
│       └── wordcount.ast
├── src
│   ├── compiler
│   │   ├── README.md
│   │   ├── codegen
│   │   │   ├── ast2llvm.js
│   │   │   └── ast2wast.js
│   │   ├── semantics
│   │   │   └── scope.js
│   │   ├── syntax
│   │   │   ├── asts.js
│   │   │   ├── grammar.pegjs
│   │   │   ├── parser-builder.ast
│   │   │   ├── parser-builder.js
│   │   │   ├── parser.js
│   │   │   ├── parser2.js
│   │   │   ├── parser3.js
│   │   │   └── text
│   │   └── utils
│   │       └── index.js
│   ├── stdlib
│   │   └── README.md
│   └── support
│       ├── README.md
│       └── editors
│           ├── atom
│           │   ├── README.md
│           │   ├── grammars
│           │   │   └── astro.cson
│           │   ├── package.json
│           │   └── snippets
│           │       └── snippets.cson
│           ├── sublime-text
│           │   └── astro.sublime-syntax
│           └── vscode
│               ├── CHANGELOG.md
│               ├── README.md
│               ├── language-configuration.json
│               ├── package.json
│               ├── syntaxes
│               │   └── astro.tmLanguage.json
│               ├── tsconfig.json
│               └── vsc-extension-quickstart.md
└── tests
    ├── README.md
    ├── compiler
    │   ├── codegen
    │   ├── semantics
    │   ├── syntax
    │   │   ├── declarations.spec.js
    │   │   └── misc.spec.js
    │   └── utils
    │       └── utils.spec.js
    └── samples
        └── fibonacci.spec.js
```
