
use astro_lexer::Token;
use astro_codegen::AST;

use crate::errors::ParserError;

use crate::{
    combinator::Combinator,
};

pub struct Parser {
    combinator: Combinator<AST>,
}

impl Parser {
    /// Creates a new parser object from the tokens passed in.
    pub fn new(tokens: Vec<Token>) -> Self {
        Self {
            combinator: Combinator::new(tokens),
        }
    }

    /// Takes and parses valid tokens from Astro code.
    pub fn parse(&mut self) -> Result<AST, ParserError> {
        let combinator = &mut self.combinator;

        // Combinator::parse([...])(combinator);

        // parse!(
        //     str!("String"),
        //     or!(
        //         func!(string_literal),
        //         str!("hello")
        //     )
        // );

        unimplemented!()
    }
}
