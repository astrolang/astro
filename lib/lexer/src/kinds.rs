#[derive(Debug, Clone, PartialEq)]
/// The kinds of error a lexer can return
pub enum ErrorKind {
    CantConsume,
    DoesNotMatchAnyRule,
    UnmatchedClosingCharacter,
}

#[derive(Debug, Clone, PartialEq)]
/// The kinds of tokens we can ger from a lexer.
pub enum TokenKind {
    None,
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
    SingleLineComment,
    InnerMultiLineComment,
    MultiLineComment,
    Dedent,
    Indent,
    LineContinuation,
}
