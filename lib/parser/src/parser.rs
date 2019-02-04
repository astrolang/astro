
use astro_lexer::Token;
use astro_codegen::AST;

use crate::{
    errors::ParserError,
    combinator::{
        Combinator,
        CombinatorArg,
        Output,
    },
    macros,
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
        // The combinator to use.
        let combinator = &mut self.combinator;

        println!("===== parser starts =====");

        let combinator_result = parse!(
            combinator,
            opt!(s!("HELLO"), s!("hi"), more!(s!("New")))
        );

        println!("===== parser result ===== \n{:?}", combinator_result);

        unimplemented!()
    }
}
