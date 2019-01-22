use crate::{
    kinds::ErrorKind,
};


#[derive(Debug, Clone)]
/// Error from lexing.
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
