use astro_lexer::kinds::TokenKind;

// TODO: Apply heap allocation where appropriate.

#[derive(Debug, Clone, PartialEq)]
pub enum AST {
    SimpleExpr(SimpleExpr),
    Empty,
}

#[derive(Debug, Clone, PartialEq)]
pub enum SimpleExpr {
    Terminal {
        kind: TokenKind,
        value: String,
    },
    List(Vec<SimpleExpr>),
    Tuple(Vec<SimpleExpr>),
    Empty,
}
