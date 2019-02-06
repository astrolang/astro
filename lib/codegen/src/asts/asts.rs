use astro_lexer::kinds::TokenKind;

// TODO: Apply heap allocation where appropriate.

#[derive(Debug, Clone)]
pub enum AST {
    SimpleExpr(SimpleExpr),
    Empty,
}

#[derive(Debug, Clone)]
pub enum SimpleExpr {
    // Identifier, Float, String
    Terminal {
        kind: TokenKind,
        value: String,
    },
    List(Vec<SimpleExpr>),
    Empty,
}
