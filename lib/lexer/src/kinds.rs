/// The kinds of error a lexer can return
#[derive(Debug, Clone, PartialEq)]
pub enum ErrorKind {
    CantConsume,
    DoesNotMatchAnyRule,
    UnmatchedClosingCharacter,
}

/// The kinds of tokens we can ger from a lexer.
#[derive(Debug, Clone, PartialEq)]
pub enum TokenKind {
    Spaces,
    Newline,
    NoName,
    Identifier,
    BooleanLiteral,
    Keyword,
    Operator,
    Punctuator,
    IntegerBinaryLiteral,
    IntegerOctalLiteral,
    IntegerHexadecimalLiteral,
    IntegerDecimalLiteral,
    FloatBinaryLiteral,
    FloatOctalLiteral,
    FloatHexadecimalLiteral,
    FloatDecimalLiteral,
    CharLiteral,
    RegexLiteral,
    StringLiteral,
    SingleLineComment,
    MultiLineComment,
    Empty,
}
