use crate::{
    combinator::{Combinator, CombinatorArg, Output},
    errors::ParserError,
    kinds::ErrorKind,
    macros,
    utils::get_func_addr,
};
use astro_codegen::asts::{
    AST,
    SimpleExpr,
};
use astro_lexer::{Token, TokenKind};

/************************* PARSER *************************/

/// Astro parser.
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

        // let combinator_result = alt!(combinator, s!("Hi"));
        // let combinator_result = parse!(combinator, f!(integer_literal));
        // let combinator_result = parse!(combinator, f!(float_literal));
        // let combinator_result = parse!(combinator, f!(numeric_literal));
        // let combinator_result = parse!(combinator, f!(comma));
        // let combinator_result = parse!(combinator, f!(newlines));
        // let combinator_result = parse!(combinator, f!(list_arguments));
        let combinator_result = parse!(combinator, f!(list_literal));

        println!("===== cache ===== \n{}", combinator.get_cache_string());

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
        // Get the cursor and columns.
        let cursor = combinator.get_cursor();
        let column = combinator.get_column();

        // Holds the returning result.
        let mut result: Result<Output<AST>, ParserError> = Err(ParserError::new(
            ErrorKind::UnexpectedToken,
            column,
        ));

        // Get the next token.
        let token = combinator.eat_token()?;

        // Check if the token kind is the same as the one provided.
        if token.kind == kind {
            result = Ok(Output::AST(AST::SimpleExpr(
                SimpleExpr::Terminal {
                    kind,
                    value: token.token.unwrap_or(String::new()),
                }
            )));
        } else {
            // Revert advancement.
            combinator.set_cursor(cursor);
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
        // Get the cursor and column.
        let cursor = combinator.get_cursor();
        let column = combinator.get_column();

        // Holds the returning result.
        let mut result: Result<Output<AST>, ParserError> = Err(ParserError::new(
            ErrorKind::ExpectedIntegerLiteral,
            column,
        ));

        // Get parser result.
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
            result = Ok(parser_result_values.remove(0));
        }

        // Cache parser result if not already cached.
        combinator.memoize(
            cursor,
            get_func_addr(&(Parser::integer_literal as _)),
            result.clone(),
        );

        result
    }

    /// Parses float literal.
    pub fn float_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        // Get the cursor and column.
        let cursor = combinator.get_cursor();
        let column = combinator.get_column();

        // Holds the returning result.
        let mut result: Result<Output<AST>, ParserError> = Err(ParserError::new(
            ErrorKind::ExpectedFloatLiteral,
            column,
        ));

        // Get parser result.
        let parser_result = alt!(
            combinator,
            f!(float_binary_literal),
            f!(float_octal_literal),
            f!(float_hexadecimal_literal),
            f!(float_decimal_literal)
        );

        // Check if parser result is OK.
        if parser_result.is_ok() {
            // Pull out array from `Output::Values`.
            let mut parser_result_values = variant_value!(parser_result.unwrap(), Output::Values);
            result = Ok(parser_result_values.remove(0));
        } else {
            // Revert advancement.
            combinator.set_cursor(cursor);
        }

        // Cache parser result if not already cached.
        combinator.memoize(
            cursor,
            get_func_addr(&(Parser::float_literal as _)),
            result.clone(),
        );

        result
    }

    /// Parses numeric literal.
    pub fn numeric_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        // Get the cursor and column.
        let cursor = combinator.get_cursor();
        let column = combinator.get_column();

        // Holds the returning result.
        let mut result: Result<Output<AST>, ParserError> = Err(ParserError::new(
            ErrorKind::ExpectedFloatLiteral,
            column,
        ));

        // Get parser result.
        let parser_result = alt!(
            combinator,
            f!(float_literal),
            f!(integer_literal)
        );

        // Check if parser result is OK.
        if parser_result.is_ok() {
            // Pull out array from `Output::Values`.
            let mut parser_result_values = variant_value!(parser_result.unwrap(), Output::Values);
            result = Ok(parser_result_values.remove(0));
        } else {
            // Revert advancement.
            combinator.set_cursor(cursor);
        }

        // Cache parser result if not already cached.
        combinator.memoize(
            cursor,
            get_func_addr(&(Parser::numeric_literal as _)),
            result.clone(),
        );

        result
    }

    /// Parses newlines =
    ///     | newline*.
    pub fn newlines<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        // Get the cursor and column.
        let cursor = combinator.get_cursor();
        let column = combinator.get_column();

        // Holds the returning result.
        let mut result: Result<Output<AST>, ParserError> = Err(ParserError::new(
            ErrorKind::ExpectedNewlines,
            column,
        ));

        // Get parser result.
        let parser_result = parse!(
            combinator,
            more!(f!(newline))
        );

        // Check if parser result is OK.
        if parser_result.is_ok() {
            result = Ok(Output::AST(AST::Empty));
        } else {
            // Revert advancement.
            combinator.set_cursor(cursor);
        }

        // Cache parser result if not already cached.
        combinator.memoize(
            cursor,
            get_func_addr(&(Parser::comma as _)),
            result.clone(),
        );

        result
    }

    /// Parses comma =
    ///     | ',' newlines?.
    pub fn comma<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        // Get the cursor and column.
        let cursor = combinator.get_cursor();
        let column = combinator.get_column();

        // Holds the returning result.
        let mut result: Result<Output<AST>, ParserError> = Err(ParserError::new(
            ErrorKind::ExpectedComma,
            column,
        ));

        // Get parser result.
        let parser_result = parse!(
            combinator,
            s!(","),
            opt!(f!(newlines))
        );

        // Check if parser result is OK.
        if parser_result.is_ok() {
            result = Ok(Output::AST(AST::Empty));
        } else {
            // Revert advancement.
            combinator.set_cursor(cursor);
        }

        // Cache parser result if not already cached.
        combinator.memoize(
            cursor,
            get_func_addr(&(Parser::comma as _)),
            result.clone(),
        );

        result
    }

    /// TODO: Change numericliteral to simpleexpression.
    /// Parses listarguments =
    ///     | simpleexpression (comma simpleexpression)* comma?
    ///     { expressions }
    pub fn list_arguments<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        // Get the cursor and column.
        let cursor = combinator.get_cursor();
        let column = combinator.get_column();

        // Holds the returning result.
        let mut result: Result<Output<AST>, ParserError> = Err(ParserError::new(
            ErrorKind::ExpectedListArguments,
            column,
        ));

        // Get parser result.
        let parser_result = parse!(
            combinator,
            f!(numeric_literal),
            optmore!(
                f!(comma), f!(numeric_literal)
            ),
            opt!(f!(comma))
        );

        // Holds expressions.
        let mut expressions = vec![];

        // Check if parser result is OK.
        if parser_result.is_ok() {
            // Pull out array from `Output::Values`.
            let mut parser_result_values = variant_value!(parser_result.unwrap(), Output::Values);
            let parser_result_values_length = parser_result_values.len();

            // Get the expression first if it exists.
            if parser_result_values_length > 0 {
                let output = parser_result_values.remove(0);
                if output != Output::Empty {
                    // Pull AST::SimpleExpr from Output::AST.
                    let ast_expr = variant_value!(output, Output::AST);

                    // Pull SimpleExpr::_ from AST::SimpleExpr.
                    let simple_expr = variant_value!(ast_expr, AST::SimpleExpr);

                    expressions.push(simple_expr);
                }
            }

            // Get subsequent expressions.
            if parser_result_values_length > 1 {
                // Get the next item.
                let output = parser_result_values.remove(0);
                if output != Output::Empty {
                    // Pull array from Output::Values.
                    let values = variant_value!(output, Output::Values);

                    for values_enum in values {
                        // Pull array from Output::Values.
                        let mut values = variant_value!(values_enum, Output::Values);

                        // Pull AST::SimpleExpr from the second Output::AST.
                        let ast_expr = variant_value!(values.remove(1), Output::AST);

                        // Pull SimpleExpr::_ from AST::SimpleExpr.
                        let simple_expr = variant_value!(ast_expr, AST::SimpleExpr);

                        expressions.push(simple_expr);
                    }
                }
            }
            result = Ok(Output::AST(AST::SimpleExpr(SimpleExpr::List(expressions))));
        } else {
            // Revert advancement.
            combinator.set_cursor(cursor);
        }

        // Cache parser result if not already cached.
        combinator.memoize(
            cursor,
            get_func_addr(&(Parser::comma as _)),
            result.clone(),
        );

        result
    }

    /// Parses listliteral =
    ///     | '[' newlines? listarguments? newlines? ']'
    pub fn list_literal<'a>(
        _args: &Vec<CombinatorArg<'a, AST>>,
        combinator: &mut Combinator<AST>,
    ) -> Result<Output<AST>, ParserError> {
        // Get the cursor and column.
        let cursor = combinator.get_cursor();
        let column = combinator.get_column();

        // Holds the returning result.
        let mut result: Result<Output<AST>, ParserError> = Err(ParserError::new(
            ErrorKind::ExpectedListLiteral,
            column,
        ));

        // Get parser result.
        let parser_result = parse!(
            combinator,
            s!("["),
            opt!(f!(newlines)),
            opt!(f!(list_arguments)),
            opt!(f!(newlines)),
            s!("]")
        );

        // Check if parser result is OK.
        if parser_result.is_ok() {
            // Pull out array from `Output::Values`.
            let mut parser_result_values = variant_value!(parser_result.unwrap(), Output::Values);

            // Get the third element.
            let value = parser_result_values.remove(2);

            let mut list_expr = match value {
                // Create an empty list if there is nothing in the third element.
                Output::Empty => Output::AST(AST::SimpleExpr(SimpleExpr::List(vec![]))),
                // Otherwise pull out an array from Output::Values and get first element.
                _ => variant_value!(value, Output::Values).remove(0),
            };

            result = Ok(list_expr);
        } else {
            // Revert advancement.
            combinator.set_cursor(cursor);
        }

        // Cache parser result if not already cached.
        combinator.memoize(
            cursor,
            get_func_addr(&(Parser::comma as _)),
            result.clone(),
        );

        result
    }
}

#[cfg(test)]
mod tests {
    use super::{
        macros,
        Parser,
        Combinator,
        CombinatorArg,
        AST,
        TokenKind,
        SimpleExpr,
        Output,
    };
    use astro_lexer::{Lexer};

    fn get_combinator_for_code(code: String) -> Combinator<AST> {
        let tokens = Lexer::new(code).lex().unwrap();
        Combinator::new(tokens)
    }

    #[test]
    fn newlines() {
        let combinator = &mut get_combinator_for_code("\r\n".into());
        let combinator_result = parse!(combinator, f!(newlines));
        println!("parser = {:?}", combinator_result);
        assert_eq!(true, true);
    }

    #[test]
    fn comma() {
        assert!(true);
    }

    #[test]
    fn list_arguments() {
        assert!(true);
    }

    #[test]
    fn list_literal() {
        assert!(true);
    }
}

