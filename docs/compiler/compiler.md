# TABLE OF CONTENT
* Compilation Phases
* Compilation Methods
    * Static Compilation
    * REPL
    * Dynamic Compilation
* Semantic Analysis
    * Prelude Inclusion
    * Name Checking
    * Cascading Notation Expansion
    * The Cycle Problem
        * Construction Cycle
    * Type Inference
    * Reference Counting
* Dellocations Schemes
    * Deallocation at Original Scope
    * Specialized Functions
    * Deallocation Checks
    * Deallocation Bundle
    * Final Functions
* Polymorphism
    * Specialization
    * Structural Polymorphism
    * Subtype Polymorphism
* Generics
* Indexing
    * Base Pointer
    * Bounds Checking
* Construction
    * Type Constructor
    * Constructor Chain
* Reference and Value Types
* The Lightweight JIT

# COMPILATION PHASES
    Source Code
        ↓
    AST
        ↓
    Dependency and Control Graph
        ↓
    LLVM IR Modules

The compilation phases covers the generation of one intermediate representation from another starting from the source code down to LLVM IR.

An LLVM IR module corresponds to an Astro module.

The mapping of a preceding intermediate representation to an output intermediate representation is recorded for incremental compilation purposes.


# COMPILATION METHODS
## Static Compilation
Static compilation runs the entire compilation phases at once. It also allows incremental compilation which means the intermediate representation of each phase are maintained and are updated as changes are made to the source code.

## REPL
The REPL (Read-Eval-Print-Loop) is a compile-and-excute process in which input code is fed one at a time to the compiler to be executed.

An AST is maintained, refined and used to generate executable code.

## Dynamic Compilation
Dynamic compilation is a hybrid of the REPL and static compilation. Dynamic compilation is usually fed a complete source file, which it compiles to an AST. It then generates executable code up to the point where types become uncertain.

The AST is refined as previously unkown types become resolved.

Types are resolved from executing dynamic imports.

As more types get resolved, more executable codes get generated.


# SEMANTIC ANALYSIS
## Prelude Inclusion
Extending the AST with imports of essential modules.

## Name Checking
Checking if a name has been declared before its use.

Names can only be used if they are declared in current or parent scope.

Types and functions can be used before their declaration point.

## Cascading Notation Expansion
Cascading notation, e.g. `:name`, are associated with their object early on in the semantic analysis phase.


## The Cycle Problem
Astro does not have the need for forward declaration because it all referenced types are included before their use and this means
Astro has to deal with cyclic inclusion/dependency problem.

There are three main cyclic inclusions in Astro
* Reference Cycle
* Call Cycle
* Construction Cycle

Reference cycle is effectively handled by Astro's deallocation scheme.
Call cycle appears to be a reasonable property although a warning should probably be given when a recursive call has no an escape hatch (base condtion).
Construction cycles, on the other hand, need to be prevented whether there is a base condition or not.

### Construction Cycle [Unfinished]
```kotlin
fun A() = { b: B() }
fun B() = { a: A() }
```

For each type constructor, the sema phase check for construction cycle.
```kotlin
fun A(a) = { a }
fun A() = A(1)
```


## Type Inference
Unlike `Crystal`, type uncertainty cannot be caused by a branching control flow.

#### Crystal
```crystal
if x == 0
  a = 2
else
  a = 'Hi'
end
# a :: Int|Str
```
#### Astro
```python
var a
if x == 0:
    a = 2
else:
    a = 'Hi'
# code will not compile. `a` has different types in each branch.
```

## Reference Counting
    A       B       Subjects
    ↓       ↓          ↓
    □   ↔   □       Objects

In typical ARC implementation, only subject pointers are counted. In Astro, only the object pointers are counted and the counting is all done at compile time.

# DEALLOCATION SCHEMES
In the following code sample, it is evident that the object that `c` points to is last referenced at the call to `bar`, therefore it needs to be deallocated somewhere after the last point of reference.

```nim
fun foo():
    var c = 'Hello'
    bar(c)
    # Deallocate `c` here
    for i in 1..max:
       print(i)
```
There are several ways of going about this, each with its own set of problems.

1. *Deallocation at Original Scope*

    Here `c` is deallocated in the scope it is declared in. In this case, it is right after the call to `bar`.

    The issue with this scheme is that objects that are only used briefly will persist until execution returns to the scope where it is declared. `bar` could have deallocated `c` when it no longer needs it.

2. *Specialized Functions*

    In this scheme, the call to `bar` is specialized to deallocate `c`. A specialized version of `bar` is created where `c` is deallocated at the point it is no longer needed.

    The problem with the scheme is that it can result in a very large number of specialized functions which will increase binary size by a significant amount.

3. *Deallocation Checks*

    This is similar to the one above but instead of specializing the function, a check is introduced instead. At the point where any parameter is no longer needed, a flag from the enclosing scope is checked to know if the function is permitted to deallocate the argument. If the flag is set to true the parameter will be deallocated.

    In the implementation, each function would have extra bitflag arguments, where each bit represents an object passed as an argument to the function. If a bit for an object is set to one, the function is allowed to deallocate the object, otherwise it cannot delete an object.

    ```nim
    fun foo(a, b, bitflag):
        do_something()
        # Free resources
        free_locals()
        if (bitflag bitand 0b1000_0000) == 0b1000_0000:
            free(a)
        if (bitflag bitand 0b0100_0000) == 0b0100_0000:
            free(b)

    fun main():
        let x, y = "Hi", Car("Camaro", 2009)
        foo(x, y, heapvars)
        ...
    ```

    This scheme has runtime execution overhead.

4. *Deallocation Bundle*

    With _Deallocation Checks_ scheme, knowing which object to delete requires checks, which can become expensive when a function has many arguments and is called often. So I discarded this scheme in favor of the first scheme, but after spending more time on it lately, I think I may have found the right solution. There is still runtime overhead, but it should be significantly lesser than the previous scheme.

    This scheme allocates an array on the stack, just before a call to a function. The array holds pointers to arguments the function is allowed to destroy and the array is passed as an argument to the function. At the end of the function, the array is passed to `free_externals` function, which releases the pointers in the array.

    ```python
    # Synchronous
    fun foo(a, b, heapvars):
        do_something(a, b)
        free_locals()
        free_externals(heapvars) # Can be inlined.

    fun main():
        let x, y = "Hi", Car("Camaro", 2009)
        let heapvars = stackalloc{AnyPtr}(2)
        heapvars[1] = anyptr x
        heapvars[2] = anyptr y
        foo(x, y, heapvars) # Release x and y after function call.
        print("Hello")
        print("World")

    @unsafe
    fun free_externals(heapvars):
        if heapvars: for p in heapvars:
            free(p)

    # Asynchronous
    fun foo(a, b, concurrent_heapvars):
        let x, y = "Hi", Car('Camaro', 2009)
        free_locals()
        free_externals_concurrent(concurrent_heapvars)

    fun free_externals_concurrent(concurrent_heapvars):
        if concurrent_heapvars: for i, c in concurrent_heapvars:
            @atomic:
                if c > 0:
                    heapvars[i, 3] -= 1
                else:
                    destruct(t, i)

    fun main():
        let a, b = "Hi", Car('Camaro', 2009)
        let concurrent_heapvars = stackalloc{(AnyPtr, Int)}(2)
        concurrent_heapvars[1] = (anyptr x, 0)
        concurrent_heapvars[2] = (anyptr y, 0)
        async foo(a, b, inc_ref_count(concurrent_heapvars))
        async foo(a, b, inc_ref_count(concurrent_heapvars))
        do_something()
    ```

    This is nice because, unlike the _Deallocation Checks_ scheme, it knows what arguments to destroy, so it's not making checks on each argument. It also doesn't exhibit cache spill problem of traditional ref counting because there is no counting done at runtime (for a non-concurrent program). But it still has the same cascading deallocation problem and it still has some runtime overhead.

5. *Final Functions*

    Came up with a new deallocation strategy on August 4, 2018. This deallocation scheme relies on final functions _(will be explained below)_. With final functions, all that is needed is a metadata on each heap object specifying whether it can be freed or not. A function containing the entire lifetime of an object can then specify whether such object can be freed by an inner final/non-final function call.

    A final function is a function that doesn't pass at least one of its argument to another function call.

    ```python
    # Synchronous / Asynchronous
    fun baz(x):
        let y = "Hi"
        foo(x, y) # Final (x: declined)
        # should_free tells the next final function it should free x
        # This only applies if there is a can_free on the object
        should_free(x)
        foo(x, y) # Final (x: allowed)

    fun bar(x):
        let y = "Hello"
        should_free(x)
        foo(x, y) # Final (x: allowed)

    fun foo(x, y): # Final (x)
        let z = x + y
        #>>>>>>>>>>
        free x
        #<<<<<<<<<<
        print(z, y)

    fun main():
        let t0 = "000"
        can_free(t0) # Tells the next non-final function it can free t0
        bar(t0) # t0 last used here
        let t1 = "111"
        can_free(t1)
        baz(t1) # t1 last used here

    # Free Function
    fun free(x): jmp get_flag(x):
        @(0): # No Free Flag
            return
        @(1): # Can Free Flag
            return
        @(2): # Should Free Synchronously Flag
            free_sync x
        @(3): # Should Free Asynchronously Flag
            free_async x
    ```

    This deallocation scheme is nice because it does not add an additional argument to a function signature and call to free function only happens in final functions. And given that it doesn't loop through heapvars, it is likely to be more efficient than deallocation bundle scheme.

#### Possible Optimizations
I will have to benchmark each scheme to be sure how they perform under different conditions. A mix of some of the schemes may be the ideal approach.

The first scheme can be classified under `late deallocation schemes`, while the last two can be classified under `early deallocation schemes`.


#### Notes
* There can only be one subject pointer to an object.

* References can only be passed by assignment or by argument.

* Subject pointers are discarded when associated objects are no longer needed.

* When there is no concurrency, deallocation points of objects can be entirely determined at compile-time.

* When concurrency is involved, a count is maintained for concurrent coroutines that share an object and once one of the coroutine no longer needs an object, it decrements the count and checks if it can deallocate the object.

# POLYMORPHISM
Astro polymorphic multiple dispatch system is designed around nominal and structural typing this allows some algorithms to be expressed in intuitive and flexible ways. There are different ways of implementing the polymorphism and some are listed below.
1. *Specialization*
    , however rather than having very generic functions, we choose to specialize a function for each set of types it is called with.

    Here is an example of how specializations are generated depending on the specificty or genericity of a function's type.
    ```julia
    type B <: A

    fun foo(a, b):
        do_something(a, b)

    fun foo(a, b): :: A, A -> A
        do_something(a, b)

    fun foo(a, b): :: B, B -> B
        do_something(a, b)

    # Generated
    foo :: Any, Any -> Any # For untyped functions or functions called with subtypes that have diverged structurally from parent
    foo :: A, A -> A # Specific functions are always generated
    foo :: B, B -> B # Specific functions are always generated
    ```


2. *Structural Polymorphism*
    Astro's polymorphism is designed around structural typing. This means the shape of a type or object determines if such type can be passed to a function. If a type has the fields used by a function, then it is structurally compliant to the function's interface.

    ```python
    fun foo(a, b):
        print(a.name, b.age)
    ```

    In the example above, `foo`'s structural interface would look like this `foo({ name }, { age })`. It accepts two objects, where the first object has a `name` field and the second object has an `age` field.

    ## Implementation
    Where the function is not explicitly constrained to take **specific leaf types** as arguments, the function should have a generic implementation so that it can allow different types that conform structurally to its interface.

    ```nim
    type Person:
        var name :: Str
        var age :: Int

    fun show(p): :: Person -> None
        print(p.name, :age)
    ```

    In the example above, the function interface is constrained to a specific leaf type, so the implementation would look something like this

    ```nim
    show :: (Ptr{Person}) -> None
    ```

    However if the function interface is generic or polymorphic, the implementation will only expect structural (and nominal) compliance.
    ```nim
    fun show(a): :: Any -> None
        print(a.name, :age)

    let object1 = { name: 'John', age: 20 }
    let object2 = { name: 'John', gender: 'male' age: 20 }

    show(object1)
    show(object2)
    ```

    The implementation of the function above should be similar to this:

    ```nim
    show :: (Tuple{Ptr{Str}, Ptr{Int}}) -> Person

    let object1 = (ptr(object1.name), ptr(object1.age))
    show(object1)

    let object2 = (ptr(object2.name), ptr(object2.age))
    show(object2)
    ```

    There are other alternative implementations given below, but the implementation described above should be better.

    NOTE: In addition to interface compliance, the field types must match, otherwise functions will be monomorphised.

3. *Subtype Polymorphism*
    Subtype polymorphism relies on Astro structural typing properties. Astro supports multiple inheritance, but unlike C++, it doesn't duplicate same-name fields inherited from different parent types. This is enforced through `constructor chaining`.

                        [O] { name }
                        / \
                        /   \
        { name, score } [A]   [B] { name, age }
                        \   /
                        \ /
                        [C] { name, score, age }

    In the above diagram, if a `C` object is constructed with ```{}.A(name, score).B(_, age)```, it will only get one `name` field, even though its supertypes both have a name field each.

    Having duplicates helps the C++ compiler implement subtype polymorphism easily on functions but at the cost of unintuitive multiple inheritance behavior. So if type `C` had duplicated the fields, a `C` object would look like this. ```{ name, age, name, score }```.

    ```python
    let c = C("John", 45, 24)

    # (A) -> None
    fun foo(obj) = obj.name

    foo(c) # References first `name` in `c`.

    # (B) -> None
    fun bar(obj) = obj.name

    bar(c) # References second `name` in `c`.
    ```

    This way, each parent type is laid out inside `C` and a function for a parent type can also be a function for `C`, since `C` shares similar field offsets with its parent types.

    In Astro, where field duplication is not allowed, each parent type may not be necessarily laid out in `C`.

        A -> { name, age }

        B -> { name, score }

        C -> { name, age, score }

    In the above example, `A` is laid out in `C`, but `B` is not laid out in `C` (`score` is not second to `name`). Therefore, to implement subtype polymorphism in Astro, the offset of each field of a parent type as used in the function body, is passed to the function.

    ```python
    let b = B("Daniel", 33)
    let c = C("John", 45, 24)

    # (B) -> None
    fun foo(obj, objscoreoffset) = obj[objscoreoffset]

    foo(b, 2) # References b.score
    foo(c, 3) # References c.score
    ```

    The problem with this technique is that it increases the number of parameters a function takes.

    ### Array of Any and Multiple Dispatch
    Like I always say, arrays are blackboxes and their blackbox nature complicates multiple dispatch implementations.
    As a result of this, the compiler keeps a union of an array's element types even if the array has an explicit element type of `Any`.
    This is used among other things to reduce multiple dispatch overhead.

    ```python
    let a = [Car(name: 'chevrolet'), Person(name: 'John', age: 56), Product(kind: 'drink', name: 'Coke')]
    a :: Array{Any}
    a :: Array{Car|Person|Product}
    ```

    While the Array type instantiation above has a type of `Array{Car|Person|Product}`, note that the element type is actually `Car&Person&Product`.

    An `Array{Any}` is a contiguous list of _typed pointers_ that point to the actual elements of the array.

        [typeid, ptr] -> Car(name: 'chevrolet')
        [typeid, ptr] -> Person(name: 'John', age: 56)
        [typeid, ptr] -> Product(kind: 'drink', name: 'Coke')

    For every `Array{Any}`, each element type of the array is given an id and the id serves as the index
    into a `type witness table` which will be discussed later.

    `Astro` is a __statically-typed language__ and even though it allows polymorphic structures like `Array{Any}`,
    it will throw a __compile-time error__ if you try to access a field that is not common to all the array's element types.

    ```python
    print a[i].name # Ok. `name` field is common to all of a's element types
    print a[i].age # Error. `age` field is not common to all of a's element types
    ```

    A `type witness table` is constructed based on the fields common to all the element types. This can be written as `Car&Person&Product` for the example above. A witness table simply
    allows one to choose the right _field offset_ at runtime when the type of an element has been determined.

                typeid    name_offset
        Car     [1]  ->   [1]
        Person  [2]  ->   [1]
        Product [3]  ->   [5]

    ```python
    fun foo(a, b) = a.name, b.name :: (Any, Any) -> (T, T)
    foo(a[1]::Car, a[3]::Product, 1, 5)
    foo(a[1][2], a[3][2], a[1][1][1], a[3][1][1])
    ```

    #### Possible Optimizations
    A witness table may not include common fields that are not accessed.
    If the types of arguments passed to a functions are known at compile-time, the function may be specialized for that type signature.

# GENERICS
## Generic Type Arguments
It is true that types can be inferred from assignments and arguments passed to a function, and this means generic type arguments are redundant in many cases.

```julia
fun add(a, b): :: {T}
    let c = a + b :: T
    return c

let a = add{Int}(5, 6)
let b = add{Float}(5.25, 3.6)
```

In the above example, a generic type parameter is not necessary as the type of `c` can be inferred from the `a + b` operation.

However, buffer functions, like `malloc`, can have uninitialized elements, so there is no way of inferring what the element type is without explicitly specifying the element type.

```julia
type List:
    var buffer*
    var len = @delegated { len }

fun List(len): :: {T}
    { buffer: malloc{T}(len) }
```

# GENERATOR
In Astro, generators are passed around by reference.
```nim
let gen = (i | i in 1..500)
next(gen) # 1
next(gen) # 2

let another_gen = gen
next(another_gen) # 3
next(gen) # 4
```

This may be unintuitive, so a copy can made instead with the following:
```nim
let gen = (i | i in 1..500)
next(gen) # 1
next(gen) # 2

let another_gen = copy gen
next(another_gen) # 3
next(gen) # 4
```

## Implementation
```nim
fun foo():
    let a, b, c = 1, 'Hello', 5.0
    do_something()
    yield
    do_another_thing()
    yield
```

If Astro had a jmp control primitive, the above generator function can be desugared into the following.
```nim
foo_global = { label: 0, vars: { a: 1, b: 'Hello', c: 5.0 } }

fun foo():
    let { label, vars: { a, b, c } } = foo_global
    jmp label:
        @(0) do:
            do_something()
            foo_global.label += 1
            return
        @(1) do:
            do_another_thing()
            foo_global.label = 0
            return
```

If the generator is instantiated multiple times, an array of teh different instances are kept.
foo_global_array = [  { ... }, ... ]


# INDEXING [0-Based Indexing vs 1-Based Indexing]
## Base Pointer
0-based
```
base pointer      [•][a][b][c][d]
                      ↓
                     ptr

offset            [•][a][b][c][d]
                      ↓
                     ptr[0]
```

1-based
```
base pointer      [•][a][b][c][d]
                   ↓
                  ptr

offset            [•][a][b][c][d]
                      ↓
                     ptr[1]
```

## Bounds Checking
0-based
```julia
    -1 < index < len
    0 > index ≥ len
```

1-based
```julia
    0 < index ≤ len
    1 > index > len
```

# CONSTRUCTION
## Type Constructor
A `type constructor` must return a new object. The returned object will be considered an instance of the type.

```nim
type Person: var name, age

# constructor
fun Person(name, age) = { name, age }
```

A `type constructor` must return an object with all introduced and inherited fields inititialized.

```nim
type Person:
    var name, age
    var sex = "female"

# constructor
fun Person(name, age) = { name } # error! `age` field not initialized.
```

## Constructor Chain
A `constructor chain` is an hierarchical chain of construction in which a type is responsible for initializing the fields it introduced.

```nim
type Person: var name, age
type Student <: Person: var score

# constructors
fun Person(name, age) = { name, age }
fun Student(name, age, score) = { score }.Person(name, age)
```

A `type constructor` must not initialize or assign to fields not introduced by it's type.

```nim
type Person(name, age)
type Student <: Person: var score

# constructor
fun Student(name, age, score) = { name, age, score } # error! initialized `age` and `name` fields.
```

A `type constructor` can only be defined in the same file as the type.


# REFERENCE AND VALUE TYPES
```python
print(ref 5) # (*ptr(5))
print(5) # (5)
print("Hello") # (ptr("Hello"))
```

# THE LIGHTWEIGHT JIT
My opinion on an alternative Astro JIT compiler has not been clear. Earlier this year I decided I wanted one even though I was aware of the community dichotomy it may cause, however recently my stand against such dichotomy became stronger and I decided I won't create the JIT.

I know the benefits of having a JIT and I still really want one, I'm just afraid of the fault it may cause in the community. Here are some of the benefits of having a JIT:
    1. It can optimize specifically for the target machine
    2. It can lazy-compile functions. This means a function won't be generated until it is called which help reduce the number of generated functions in type uncertainty scenarios.
    3. It makes interop with dynamic languages easy.

Recently though, I've been experimenting with the idea of `JIT as an import` (I assume that's how cling works). Instead of having the entire program run straight in a jit vm, the jit can be imported into a statically-compiled code and the jit can be used to jit-compile any astro code at runtime. To make this integration as easy as possible, the AOT compiler needs to have some ideas about the imported jit object and the static code it interacts with.

```python
import jit { compile }
let math = compile readfile("math.astro")

print math.cos(45)
```

I intend for the jit to be lightweight; it doesn't really need to have the fastest runtime but I expect it to compile code very fast.

Neither the standard library nor the AOT compiler will rely on the presence of the jit, but later down the line, an `astrojit` command may be made available to allow code to run straight through the jit.
