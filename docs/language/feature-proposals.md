## Non-MVP
- Macros
- custom operator overloading
- Unicode support
- Package manager
- Concurrency - async and actors
- Exceptions
- Complete Standard Library
- Complete Generics

## FEATURE SUMMARY
- Near-native speed.
- Expressive Python-like syntax.
- Automatic memory management with no runtime cost.
- Human-readable compilation errors.
- Fault-tolerant concurrency and reactive programming.
- Completely optional type annotations.
- Simpler but flexible object-oriented model.
- Extensive mathematical function library.
- Built-in package manager.
- Incremental Compilation.
- Concurrency - coroutines.
- Unicode support including but not limited to UTF-8.
- Compiles to webassembly with easy inter-op with Javascript.
- Free and open source.
- Powerful type sytem with multiple dispatch, variance and generics.
- Metaprogramming with hygenic macros and operator overloading.

## WHAT IF ASTRO USED BRACES?
```pony
var sum = 5 + 6

for i in 1..100 where i > 25 {
    print i
}

fun fib(n) {
    | 2 => 1
    | _ => {
        fib(n - 1) + fib(n - 2)
    }
}

var age = { age += 5 } -> { age -= 5 }

list.foldl(0) |a, b| { a + b }

20.each { print "Hello" }

type Employee <: Person {
    var job
}

dsl(src: 'hello', link: 'bar.io') {
    list { [1, 2, 3] }
}
```

## INTEROP WITH JS/PYTHON PROPOSAL
```julia
@pyimport(math)
math.sin(45)
math.cos(70)

@jsimport(express)
let app = express()
let router = app.Router()
```

## MACROS PROPOSAL
Astro macros are resolved at parse time.
Macros take asts as argument.
```julia
fun @sorted(string): #: RawString
    $(SortedStr('\(string.literal)'))
```

> Note: Macro functions cannot use subjects from outer scope
```julia
fun @typify(abstract): #: AbstractType
    let els = abstract.elements
    let types = els.map |a| => $(type \a)
    $(\abstract; \types)
```

Inline macro calls
```julia
@typify abst Person(var name, var age)
```

Block macro calls
```julia
@loop(times: 3): print 'Happy birthday to you'
@time(minutes)
```

Macros can be called like regular functions.
```julia
fun @where(cond, none): #: BinaryExpression, None
    return $(filter|cond.lhs| => cond)

array.where(x > 5)
```

### TYPE EXTENSION PROPOSAL
```julia
type Programmer(newField) @extend
```

## STRUCT PROPOSAL
```julia
type Programmer(name, skills) @struct
```

## UNSAFE BLOCK PROPOSAL
```rust
unsafe:
    let pointer = ptr(object)
    pointer.offset(-5)
```

## DYNAMIC IMPORT
```nim
let { pi } = import(someModule) #: Inferred as dynamic
```

## STATIC LOCAL SUBJECTS
Local subjects that persist between function calls are marked with an `!`.
```nim
fun countCalls():
    var count! = 0
    print count += 1

countCalls() # 1
countCalls() # 2
countCalls() # 3
```

## FIBERS (Incomplete)
Fibers are lightweight CSP-style threading model.
Modelling fibers around coroutine.
```nim
fun main():
    var p = await producer() #: Channel[Int]
    print p.next()

fub producer():
    yield 56
```
