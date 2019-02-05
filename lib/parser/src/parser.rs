use crate::{
    combinator::{Combinator, CombinatorArg, Output},
    errors::ParserError,
    kinds::ErrorKind,
    macros,
    utils::get_func_addr,
};
use astro_codegen::AST;
use astro_lexer::{Token, TokenKind};

// println!("===== cache ===== \n{}", combinator.get_cache_string());

/************************* PARSER *************************/

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

        let combinator_result = parse!(combinator, f!(integer_literal));

        println!("===== parser result ===== \n{:#?}", combinator_result);

        unimplemented!()
    }

    /// Parses a terminal, i.e. the different types of token that make up the parser's productions.
    pub fn parse_terminal<'a>(
        kind: TokenKind,
        combinator: &mut Combinator<AST>,
        func: fn(
            args: &Vec<CombinatorArg<'a, AST>>,
            combinator: &mut Combinator<AST>,
        ) -> Result<Output<AST>, ParserError>,
    ) -> Result<Output<AST>, ParserError> {
        // Get the cursor.
        let cursor = combinator.get_cursor();

        // Holds the returning result.
        let mut result: Result<Output<AST>, ParserError> = Err(ParserError::new(
            ErrorKind::UnexpectedToken,
            combinator.get_cursor(),
        ));

        // Get the next token.
        let token = combinator.eat_token()?;

        // Check if the token kind is the same as the one provided.
        if token.kind == kind {
            result = Ok(Output::AST(AST::Terminal {
                kind,
                value: token.token.unwrap_or(String::new()),
            }));
        }

        // Cache parser result if not already cached.
        combinator.memoize(cursor, get_func_addr(&func), result.clone());

        result
    }

    /// Parses newline.
    pub fn newline<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::Newline, combinator, Parser::newline as _)
    }

    /// Parses no_name.
    pub fn no_name<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::NoName, combinator, Parser::no_name)
    }

    /// Parses identifier.
    pub fn identifier<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::Identifier, combinator, Parser::identifier)
    }

    /// Parses boolean literal.
    pub fn boolean_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(
            TokenKind::BooleanLiteral,
            combinator,
            Parser::boolean_literal,
        )
    }

    /// Parses keyword.
    pub fn keyword<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::Keyword, combinator, Parser::keyword)
    }

    /// Parses operator.
    pub fn operator<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::Operator, combinator, Parser::operator)
    }

    /// Parses punctuator.
    pub fn punctuator<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::Punctuator, combinator, Parser::punctuator)
    }

    /// Parses integer binary literal.
    pub fn integer_binary_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(
            TokenKind::IntegerBinaryLiteral,
            combinator,
            Parser::integer_binary_literal,
        )
    }

    /// Parses integer octal literal.
    pub fn integer_octal_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(
            TokenKind::IntegerOctalLiteral,
            combinator,
            Parser::integer_octal_literal,
        )
    }

    /// Parses integer hexadecimal literal.
    pub fn integer_hexadecimal_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(
            TokenKind::IntegerHexadecimalLiteral,
            combinator,
            Parser::integer_hexadecimal_literal,
        )
    }

    /// Parses integer decimal literal.
    pub fn integer_decimal_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(
            TokenKind::IntegerDecimalLiteral,
            combinator,
            Parser::integer_decimal_literal,
        )
    }

    /// Parses float binary literal.
    pub fn float_binary_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(
            TokenKind::FloatBinaryLiteral,
            combinator,
            Parser::float_binary_literal,
        )
    }

    /// Parses float octal literal.
    pub fn float_octal_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(
            TokenKind::FloatOctalLiteral,
            combinator,
            Parser::float_octal_literal,
        )
    }

    /// Parses float hexadecimal literal.
    pub fn float_hexadecimal_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(
            TokenKind::FloatHexadecimalLiteral,
            combinator,
            Parser::float_hexadecimal_literal,
        )
    }

    /// Parses float decimal literal.
    pub fn float_decimal_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(
            TokenKind::FloatDecimalLiteral,
            combinator,
            Parser::float_decimal_literal,
        )
    }

    /// Parses char literal.
    pub fn char_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::CharLiteral, combinator, Parser::char_literal)
    }

    /// Parses regex literal.
    pub fn regex_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::RegexLiteral, combinator, Parser::regex_literal)
    }

    /// Parses string literal.
    pub fn string_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::StringLiteral, combinator, Parser::string_literal)
    }

    /// Parses integer literal.
    pub fn integer_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        // Get the cursor.
        let cursor = combinator.get_cursor();

        // Holds the returning result.
        let mut result: Result<Output<AST>, ParserError> = Err(ParserError::new(
            ErrorKind::UnexpectedToken,
            combinator.get_cursor(),
        ));

        // Get parser result.
        // => Ok( Output::Values( [ Output::AST( AST::Terminal { kind, value } ) ] ) )
        let parser_result = alt!(
            combinator,
            f!(integer_binary_literal),
            f!(integer_octal_literal),
            f!(integer_hexadecimal_literal),
            f!(integer_decimal_literal)
        );

        // Check if parser result is OK.
        if parser_result.is_ok() {
            // Pull out array from `Output::Values`.
            let mut parser_result_values = variant_value!(parser_result.unwrap(), Output::Values);

            // Pull out `AST` from the `Output::AST`.
            let mut terminal_ast = variant_value!(parser_result_values.remove(0), Output::AST);

            // Pull out fields from the `Terminal::AST`.
            let (kind, value) = variant_fields!(terminal_ast, AST::Terminal, kind, value);

            // Convert to `AST::Integer`.
            let integer_ast = AST::Integer { kind, value };

            result = Ok(Output::AST(integer_ast));
        }

        // Cache parser result if not already cached.
        combinator.memoize(
            cursor,
            get_func_addr(&(Parser::integer_literal as _)),
            result.clone(),
        );

        result
    }
}

/// TODO
mod tests {}
