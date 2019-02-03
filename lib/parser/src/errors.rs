use crate::{
    kinds::ErrorKind,
};


/// Error from lexing.
#[derive(Debug, Clone)]
pub struct ParserError {
    pub error: ErrorKind,
    pub cursor: usize,
}

impl ParserError {
    pub fn new(error: ErrorKind, cursor: usize) -> Self {
        Self {
            error,
            cursor,
        }
    }
}
