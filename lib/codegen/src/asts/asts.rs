use astro_lexer::kinds::TokenKind;

#[derive(Debug, Clone)]
pub enum AST {
    Terminal(TokenKind, String),
}
