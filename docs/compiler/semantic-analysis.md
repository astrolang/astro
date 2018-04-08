# PHASES
### Preprocessing
* Include prelude.

### Declaration
* Check if names are declared at all.
* Check if subject names are declared before usage.
    * Handle cases where calls use subject names that are not yet declared.
* Check if type, module and function names are not rebound.

### Types
* Check for field ambiguity caused by multiple inheritance.
* Check for inheritance cycle.

### Functions
* Check for type signature ambiguity across functions with the same name.
    * Can be caused by order of types.
    ```nim
    type Int <: Integer
    fun foo(a, b) = 1 #: Int, Integer
    fun foo(a, b) = 2 #: Integer, Int
    foo(1, 2)
    ```
    * Can also be caused by multiple inheritance.
    ```nim
    type C <: A, B
    fun foo(a) = 1 #: A
    fun foo(b) = 2 #: B
    foo(C())
    ```

### Subjects and Parameters
* Check subject initialized before use.
* Check subject is assigned to type(s) inferred at initialization and their subtypes.
* Ensure immutables are not reassigned.

### Function Calls
* Check if function with such type signature is defined.

### Constructors
* Check for construction cycle.
* Ensure every field on the type gets initialized.

### Cascading and Dot Notation
* Check if member exist on module or field exist on type.
* Ensure dot notation on dict subject use nillable or exceptionable unwrap.

# INTERMEDIATE REPRESENTATION
### Name and Scope Tree
### Types and Function Specialization
### Object Lifetime Graph
### Type Inference Graph
### Type Inheritance Tree
### Witness Tables