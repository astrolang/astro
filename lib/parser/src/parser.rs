
use astro_codegen::AST;
use astro_lexer::{
    Token,
    TokenKind
};
use crate::{
    errors::ParserError,
    combinator::{
        Combinator,
        CombinatorArg,
        Output,
    },
    kinds::ErrorKind,
    macros,
};

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

        let combinator_result = parse!(
            combinator,
            f!(newline),
            f!(no_name),
            f!(identifier),
            f!(boolean_literal),
            f!(keyword),
            f!(punctuator),
            f!(integer_binary_literal),
            f!(integer_octal_literal),
            f!(integer_hexadecimal_literal),
            f!(integer_decimal_literal),
            f!(float_binary_literal),
            f!(float_octal_literal),
            f!(float_hexadecimal_literal),
            f!(float_decimal_literal),
            f!(char_literal),
            f!(regex_literal),
            f!(string_literal)
        );

        println!("===== parser result ===== \n{:#?}", combinator_result);

        unimplemented!()
    }

    /// Parses a terminal, i.e. the different types of token that make up the parser's productions.
    pub fn parse_terminal(kind: TokenKind, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        // Get the cursor.
        let cursor = combinator.get_cursor();

        // Get the next token.
        let token = combinator.eat_token()?;

        // Check if the token kind is the same as the one provided.
        if token.kind == kind {
            return Ok(
                Output::AST(
                    AST::Terminal(kind, token.token.unwrap_or(String::new()))
                )
            );
        }

        Err(ParserError::new(ErrorKind::UnexpectedToken, combinator.get_cursor()))
    }

    /// Parses newline.
    pub fn newline<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::Newline, combinator)
    }

    /// Parses no_name.
    pub fn no_name<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::NoName, combinator)
    }

    /// Parses identifier.
    pub fn identifier<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::Identifier, combinator)
    }

    /// Parses boolean literal.
    pub fn boolean_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::BooleanLiteral, combinator)
    }

    /// Parses keyword.
    pub fn keyword<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::Keyword, combinator)
    }

    /// Parses operator.
    pub fn operator<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::Operator, combinator)
    }

    /// Parses punctuator.
    pub fn punctuator<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::Punctuator, combinator)
    }

    /// Parses integer binary literal.
    pub fn integer_binary_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::IntegerBinaryLiteral, combinator)
    }

    /// Parses integer octal literal.
    pub fn integer_octal_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::IntegerOctalLiteral, combinator)
    }

    /// Parses integer hexadecimal literal.
    pub fn integer_hexadecimal_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::IntegerHexadecimalLiteral, combinator)
    }

    /// Parses integer decimal literal.
    pub fn integer_decimal_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::IntegerDecimalLiteral, combinator)
    }

    /// Parses float binary literal.
    pub fn float_binary_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::FloatBinaryLiteral, combinator)
    }

    /// Parses float octal literal.
    pub fn float_octal_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::FloatOctalLiteral, combinator)
    }

    /// Parses float hexadecimal literal.
    pub fn float_hexadecimal_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::FloatHexadecimalLiteral, combinator)
    }

    /// Parses float decimal literal.
    pub fn float_decimal_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::FloatDecimalLiteral, combinator)
    }

    /// Parses char literal.
    pub fn char_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::CharLiteral, combinator)
    }

    /// Parses regex literal.
    pub fn regex_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::RegexLiteral, combinator)
    }

    /// Parses string literal.
    pub fn string_literal<'a>(_args: &Vec<CombinatorArg<'a, AST>>, combinator: &mut Combinator<AST>) -> Result<Output<AST>, ParserError> {
        Parser::parse_terminal(TokenKind::StringLiteral, combinator)
    }
}

// Spaces,
// Newline,
// NoName,
// Identifier,
// BooleanLiteral,
// Keyword,
// Operator,
// Punctuator,
// IntegerBinaryLiteral,
// IntegerOctalLiteral,
// IntegerHexadecimalLiteral,
// IntegerDecimalLiteral,
// FloatBinaryLiteral,
// FloatOctalLiteral,
// FloatHexadecimalLiteral,
// FloatDecimalLiteral,
// CharLiteral,
// RegexLiteral,
// StringLiteral,
// SingleLineComment,
// MultiLineComment,
// LineContinuation,

/// TODO
mod tests {

}
