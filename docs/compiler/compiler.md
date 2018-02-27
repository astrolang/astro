### Compilation Phases
  Entry code
      ↓
  AST
      ↓
  Lowered AST
      ↓
  LLVM IR
      ↓
  Object Files (per module basis)

### Dynamic Compilation
The interesting property of Dynamic compilation is caching.

#### Dynamic Execution
After a dynamic import execution, the AST is type-corrected and subsequent structures up to the next dynamic import are compiled to executable and run. New declarations are cached.

#### REPL
- After each input, AST is extended and the input is compiled to executable and run. New declarations are cached.

### Incremental Compilation
- Trackable dependency units
  - Functions
  - Types
  - Global subjects
  - Global functions
  - Exports
  - Imports
