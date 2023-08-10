#[macro_use]
pub mod macros;
pub mod errors;
pub mod kinds;
pub mod lexer;

pub use self::{
    errors::LexerError,
    kinds::{ErrorKind, TokenKind},
    lexer::{Lexer, Token},
};
