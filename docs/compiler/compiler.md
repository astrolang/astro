# COMPILATION PHASES
    Source Code
        ↓
    AST
        ↓
    Dependency and Control Graph
        ↓
    LLVM IR Modules

The compilation phases covers the generation of one intermediate representation from another starting from the source code.

An LLVM IR module corresponds to an Astro module.

The mapping a preceding intermediate representation to an output intermediate representation is recorded for incremental compilation purposes.


# COMPILATION METHODS
## Static Compilation
Static compilation runs the entire compilation phases at once. It also allows incremental compilation which means the intermediate representation of each phase are maintained and are updated as changes are made to the source code.

## REPL
The REPL (Read-Eval-Print-Loop) is a compile-and-excute process in which input code is fed one at a time to the compiler. An ast is maintained, refined and used to generate executable code.

## Dynamic Compilation
Dynamic compilation is a hybrid of implementation of the REPL and static compilation. Dynamic compilation is usually fed a complete source file, which it compiles to an AST. It then generates executable code up to the point where types become uncertain.

The AST is refined as previously unkown types become resolved.

Types are resolved from executing dynamic imports.

As more types get resolved, more executable codes get generated.


# SEMANTIC ANALYSIS
## Prelude Inclusion
Extending the ast with imports of essential modules.

## Name Checking
Checking if a name has been declared before it's use.

Names can only be used if they declared in current or parent scope.

Types and functions can be used before their declaration point.

## Cascading Notation Object Association
Stray cascading notation, like `~name`, are associated with their object to make subsequent semantic analysis easier.

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

#### Deallocation Schemes
In the following code sample, it is evident that the object that `c` points to is last referenced at the call to `bar`, therefore it needs to be deallocated after the after the last point of reference.

```python
fun foo():
    var c = 'Hello'
    bar(c)
    for i in ..max:
       print(i)
```
There several ways of going about this, each with its own problem. The first scheme can be classified under `late deallocation schemes`, while the final two can be classified under `early deallocation schemes`.

1. *Deallocation at Orginal Scope*

    Here `c` is deallocated in the scope it is declared in. In this case, it is right after the call to `bar`.

    The issue with this scheme is that objects that are only used briefly will persist until execution returns to the scope where it is declared. `bar` could have deallocated `c` when it no longer needs it.

2. *Specialized Functions*

    In this scheme, the call to `bar` is specialized to deallocate `c`. A specialized version of `bar` is created where `c` is deallocated at the point it is no longer needed.

    The problem with the scheme is that it can result in a very large number of specialized functions which will increase binary size by a signifcant amount.

3. *Deallocation Checks*

    This is similar to the above but instead of specializing the function, a check is introduced instead. At the point where any parameter is no longer needed, a flag from the enclosing scope is checked to know if the function is permitted to deallocate the argument. If the flag is set to true the parameter will be deallocated.

    This scheme has runtime erxecution overhead.
    
There can only be one subject pointer to an object.

References can only be passed by assignment or by argument.

Subject pointers are discarded when associated objects are no longer needed.

When there is no concurrency, deallocation points of objects can be entirely determined at compile-time.

When concurrency is involved, a count is maintained for concurrent coroutines that share an object and once one of the coroutine no longer needs an object, it decrements the count and checks if it can deallocate the object.
