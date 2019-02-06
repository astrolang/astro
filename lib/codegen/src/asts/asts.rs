use astro_lexer::kinds::TokenKind;

#[derive(Debug, Clone)]
pub enum AST {
    Terminal {
        kind: TokenKind,
        value: String,
    },
    Integer {
        kind: TokenKind,
        value: String,
    },
    Float {
        kind: TokenKind,
        value: String,
    },
    Identifier(String),
    Empty,
}
