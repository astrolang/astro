#[derive(Debug, Clone, PartialEq)]
/// The kinds of error a lexer can return
pub enum ErrorKind {
    CantConsume,
    DoesNotMatchAnyRule,
}

#[derive(Debug, Clone, PartialEq)]
/// The kinds of tokens we can ger from a lexer.
pub enum TokenKind {
    Spaces,
    Newline,
    LineContinuation,
    None,
}
