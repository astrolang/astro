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

list.foldl(0, (a, b) => { a + b })

20.each x => print "Hello"

type Employee <: Person {
    var job
    var company
}

abst Fruits {
    | Orange
    | Mango
    | Pineapple
}

dsl(src: 'hello', link: 'bar.io') {
    list { [1, 2, 3] }
}
```

## MACROS PROPOSAL
Astro macros are resolved at parse time.
Macros take asts as argument.
```julia
fun @sorted(string): #: RawString
    return `SortedStr('${string.literal}')`
```

> Note: Macro functions cannot use subjects from outer scope
```julia
fun @typify(abstract): #: AbstractType
    let types = abstract.elements.map t => `type $t`
    return `$abstract; $types`
```

Inline macro calls
```julia
@typify abst Person(var name, var age)
```

Block macro calls
```julia
fun @loop(count, block): #: IntegerLiteral, Block
    return `
    var countup, max = 0, $count
    while countup < max:
        $block
        countup += 1
    `

@loop(times: 3):
    print 'Hello'
    print ' World!'
```

Macros can be called like regular functions.
```julia
fun @where(arr, cond, none): #: Sequence, BinaryExpression, None
    return `${arr}.filter(${cond.lhs} => ${cond})`

let result = [1, 2, 3].@where(x > 5)
```

### TYPE EXTENSION PROPOSAL
```julia
@extend
type Programmer(new_field)
```

## STRUCT PROPOSAL
```julia
@struct
type Programmer(name, skills)
```

## UNSAFE BLOCK PROPOSAL
```python
@unsafe:
    let pointer = ptr(object)
    pointer.offset(-5)
```

## DYNAMIC IMPORT
```swift
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
    var p = await producer() #: Channel{Int}
    print p.next()

fub producer():
    yield 56
```

## INTEROP WITH OTHER LANGUAGES
### Static Languages
##### C
```swift
let result = @ccall(reshape_array, a, ...dims) (Array{T}, ...Int) -> Array{T}
```

### Dynamic Languages
##### Python
```javascript
let { cos, sin } = import(math, 'python')
sin(45)
cos(70)
```

##### JavaScript
```javascript
let app = import(express, 'javascript')()
let router = app.Router()
```

## DYNAMIC LINKING
#### This requires explicit type annotations to work.
```julia
dynamic export {
    foo :: Int, Int -> Str
    List :: {Int64}
}
```
