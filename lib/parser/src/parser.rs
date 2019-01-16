
use astro_lexer::Token;
use astro_codegen::AST;

use crate::{
    combinator::Combinator,
    errors::ParserError,
};

pub struct Parser {
    combinator: Combinator,
}

impl Parser {
    /// Creates a new parser object from the tokens passed in.
    pub fn new(tokens: Vec<Token>) -> Self {
        Self {
            combinator: Combinator::new(tokens),
        }
    }

    ///
    pub fn parse(&mut self) -> Result<AST, ParserError> {
        unimplemented!()
    }
}
