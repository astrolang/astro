
use astro_lexer::Token;
use astro_codegen::AST;

use crate::errors::ParserError;

use crate::{
    combinator::Combinator,
};

pub struct Parser {
    combinator: Combinator<AST, ParserError>,
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
