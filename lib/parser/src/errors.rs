use crate::kinds::ErrorKind;

/// Error from lexing.
#[derive(Debug, Clone, PartialEq)]
pub struct ParserError {
    pub error: ErrorKind,
    pub column: usize,
}

impl ParserError {
    pub fn new(error: ErrorKind, column: usize) -> Self {
        Self { error, column }
    }
}
