
use astro_lexer::Token;
use astro_codegen::AST;

use crate::{
    errors::ParserError,
    combinator::{
        Combinator,
        CombinatorArg,
        Output,
    }
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

        println!("Parser starts");

        let hello_func = (
            Combinator::alt as _,
            vec![
                CombinatorArg::Str("hello".into()),
                CombinatorArg::Str("Hello".into()),
                CombinatorArg::Str("HELLO".into()),
            ]
        );

        let combinator_result = Combinator::parse(
            vec![
                CombinatorArg::Func(hello_func),
            ],
            combinator,
        );

        println!(
            "combinator parser function result = {:?}",
            combinator_result
        );

        // parse!(
        //     str!("String"),
        //     or!(
        //         func!(string_literal),
        //         str!("hello")
        //     )
        // );

        unimplemented!()
    }

    //
    // pub fn nextline(&mut self) -> Result<AST, ParserError> {

    // }
}
