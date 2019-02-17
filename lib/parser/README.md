#### PULL! MACRO IMPLEMENTATION
I've written several parsers for Astro in the past and in different languages. It was a result of Astro's being heavily whitespace-sensitive. This made the grammar super complex and hard to implement. I usaully got tired at the parser stage and simply quit trying. I've written a [11k sloc parser](https://github.com/astrolang/astro/blob/f3a19c128f1327815d469dcf5a409c0854d2b483/src/compiler/syntax/parser-old.js) before just to support Astro's incredibly complex grammar; most of it repetitive boilerplate code trying to pull relevant values from a parser result to create an AST.

I tried to make it better by using a combinator and making it a packrat parser which improved the abysmal performance, but the grammar was still too complex and it drained the fun out of it. Last month, I decided to simplify the syntax. I removed fancy features and changed it to a braces-based language. It took me just two days to complete the language's grammar. What an improvement!

The value-pulling code is still there though and it's still leadin to unecessary boilerplate but now that I'm using Rust I can use the macro facilities to improve this. Who knew Rust would be the language I'd be much more productive in?

The `pull!` macro is inspired in a way by [css selectors](https://www.w3schools.com/cssref/css_selectors.asp). The macro is supposed to generate the necessary boilerplate for pulling values out of a parser's result.

```rust
pull!(Ok > Output::Values > [0] > Output::Values > [0] > Output::AST > AST::SimpleExpr > SimpleExpr::Tuple > [0, 1])
pull!(Ok > Output::Values > [0] > Output::Values > [0] > Output::AST > AST::SimpleExpr > SimpleExpr::Tuple > [])
pull!(Ok > Output::Values > [0] > Output::Values > [0] > Output::AST > AST::SimpleExpr > SimpleExpr::Tuple (0) > [0] > SimpleExpr::Terminal { kind, value })
pull!(Ok > Output::Values > [0] > !Output::Empty; Output::Values > [0])
```

`pull!` macro takes a list of `lhs > rhs` binary operations, with `>` as the operator. The semantic of this operation is that  `rhs` is pulled out of `lhs`

The rhs can have any of the following pattern:
- rhs = A::B
- rhs = A::B (index)
- rhs = A::B { field }
- rhs = []
- rhs = [index0, index1]
- rhs = !A::B; A::C
