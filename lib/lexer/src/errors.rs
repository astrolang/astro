use crate::{ErrorKind, TokenKind};

/// Error from lexing.
#[derive(Debug, Clone, PartialEq)]
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
