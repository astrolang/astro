use crate::{ErrorKind, TokenKind};

#[derive(Debug, Clone, PartialEq)]
/// The error object a lexer function can return
pub struct LexerError {
    pub error: ErrorKind,
    pub kind: TokenKind,
    pub cursor: usize,
}

impl LexerError {
    pub fn new(error: ErrorKind, kind: TokenKind, cursor: usize) -> Self {
        Self {
            error,
            cursor,
            kind,
        }
    }
}
