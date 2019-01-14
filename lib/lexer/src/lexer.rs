#[macro_use]
use crate::macros;

use crate::{ErrorKind, LexerError, TokenKind};

/************************* TOKEN *************************/

#[derive(Debug, Clone, PartialEq)]
/// Token object.
pub struct Token {
    kind: TokenKind,
    token: Option<String>,
    cursor: usize,
}

impl Token {
    pub fn new(kind: TokenKind, token: Option<String>, cursor: usize) -> Self {
        Self {
            kind,
            token,
            cursor,
        }
    }
}

/************************* LEXER *************************/

#[derive(Debug, Clone)]
/// The lexer object holding the state of lexing and relevant data needed for
/// lexing.
pub struct Lexer {
    // Code as a vector of characters.
    code: Vec<char>,
    // Holds the position the lexer is at in the code.
    cursor: usize,
    // Supported space characters.
    space_char: String,
    // Supported binary digits.
    digit_binary: String,
    // Supported octal digits.
    digit_octal: String,
    // Supported decimal digits.
    digit_decimal: String,
    // Supported hexadecimal digits.
    digit_hexadecimal: String,
    // Characters that can start an identifier.
    identifier_begin_char: String,
    // Characters that can end or be in the middle of an identifier.
    identifier_end_char: String,
    // Characters that can be used as operators.
    operator_char: String,
    // Characters that can be used as punctuators.
    punctuator_char: String,
    // Astro keywords.
    keywords: Vec<String>,
}

impl Lexer {
    /// Creates a new lexer object from the code passed in.
    pub fn new(code: String) -> Self {
        Self {
            code: code.chars().collect(),
            // Cursor starts at the position of the next character to be consumed.
            cursor: 0,
            // TODO: Support certain Unicode characters.
            space_char: String::from(" \t"),
            digit_binary: String::from("01"),
            digit_octal: String::from("01234567"),
            digit_decimal: String::from("0123456789"),
            digit_hexadecimal: String::from("0123456789ABCDEFabcdef"),
            // TODO: Support certain Unicode characters.
            identifier_begin_char: String::from(
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_",
            ),
            // TODO: Support certain Unicode characters.
            identifier_end_char: String::from(
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789",
            ),
            // TODO: Support certain Unicode characters.
            operator_char: String::from(":+'-*/\\^%&|!><=÷×≠≈¹²³√?~"),
            punctuator_char: String::from("(){}[],.;@$"),
            // Valid Astro keywords
            keywords: vec![
                String::from("import"),
                String::from("export"),
                String::from("let"),
                String::from("var"),
                String::from("const"),
                String::from("fun"),
                String::from("type"),
                String::from("async"),
                String::from("ref"),
                String::from("iso"),
                String::from("if"),
                String::from("elif"),
                String::from("else"),
                String::from("except"),
                String::from("ensure"),
                String::from("defer"),
                String::from("for"),
                String::from("try"),
                String::from("while"),
                String::from("loop"),
                String::from("end"),
                String::from("fallthrough"),
                String::from("return"),
                String::from("raise"),
                String::from("break"),
                String::from("continue"),
                String::from("yield"),
                String::from("from"),
                String::from("await"),
                String::from("where"),
                String::from("is"),
                String::from("not"),
                String::from("in"),
                String::from("as"),
                String::from("mod"),
                String::from("typeof"),
                String::from("sizeof"),
                String::from("super"),
            ],
        }
    }

    /// Returns the next character in code but does not consume it.
    fn peek_char(&self, offset: Option<usize>) -> Option<char> {
        // Get offset value or set to zero if not specified.
        let offset = offset.unwrap_or(0);

        // Check if the offset is in bounds.
        if self.is_inbounds(Some(offset)) {
            return Some(self.code[self.cursor + offset]);
        }

        None
    }

    /// Returns the specified token if it is next in code but does not consume it.
    fn peek_token(&self, token: String) -> bool {
        // Get beginning of slice. i.e., starting from the next character
        let start = self.cursor;

        // Get end of slice.
        let end = start + token.len();

        // Get the slice from code
        let slice = &self.code[start..end];

        // Convert token argument to slice
        let token_chars: Vec<char> = token.chars().collect();
        let token_chars = token_chars.as_slice();

        // Compare token argument with the next set of characters.
        if slice == token_chars {
            return true;
        }

        false
    }

    /// Consumes the specified token if it is next in code
    fn eat_token(&mut self, token: String) -> Option<String> {
        // Get beginning of slice. i.e., starting from the next character
        let start = self.cursor;

        // Get end of slice.
        let end = start + token.len();

        // Get the slice from code
        let slice = &self.code[start..end];

        // Convert token argument to slice
        let token_chars: Vec<char> = token.chars().collect();
        let token_chars = token_chars.as_slice();

        // Compare token argument with the next set of characters.
        if token_chars == slice {
            // Advance cursor.
            self.cursor = end;
            return Some(token);
        }

        None
    }

    /// Consumes the next character in code.
    fn eat_char(&mut self) -> char {
        // Get the next character.
        let character = self.code[self.cursor];

        // Advance cursor.
        self.cursor += 1;

        character
    }

    /// Checks if the cursor is still in bounds, i.e. if cursor
    /// hasn't reached the end of the code.
    fn is_inbounds(&self, offset: Option<usize>) -> bool {
        // Get offset value or set to zero if not specified.
        let offset = offset.unwrap_or(0);

        // Check if the offset is in bounds.
        if self.cursor + offset < self.code.len() {
            return true;
        }

        false
    }

    /// Consumes spaces in code if they come next.
    fn spaces(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::Spaces;
        let token: Option<String> = None;
        let cursor = self.cursor;
        let mut count = 0;

        // Consume available spaces.
        loop {
            // Get next character without consuming it.
            let character = self.peek_char(None);

            // Check if the character is a space character.
            if character.is_some() && self.space_char.find(character.unwrap()).is_some() {
                self.eat_char();
                count += 1;
            } else {
                break;
            }
        }

        // Revert cursor value if no space consumed.
        if count == 0 {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, token, cursor))
    }

    /// Consume newline in code if it comes next.
    fn newline(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::Newline;
        let token: Option<String> = None;
        let cursor = self.cursor;

        // Get the next two characters.
        let character = self.peek_char(None);
        let character2 = self.peek_char(Some(1));

        // Consume any following newlines.
        if character.is_some() && character.unwrap() == '\n' {
            // Unix newline
            // Consume a character.
            self.eat_char();
        } else if character.is_some() && character.unwrap() == '\r' && character2.unwrap() == '\n' {
            // Windows newline
            // Consume two characters. '\r' and '\n'
            self.eat_char();
            self.eat_char();
        } else {
            // Otherwise
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, token, cursor))
    }

    /// Consumes '_' in code if it comes next.
    fn no_name(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::NoName;
        let mut token: Option<String> = None;
        let cursor = self.cursor;

        // Get next character without consuming it.
        let character = self.peek_char(None);

        // Check if the character is a space character.
        if character.is_some() && character.unwrap() == '_' {
            // Save character.
            token = Some(self.eat_char().to_string());
        } else {
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, token, cursor))
    }

    /// Consumes identifier in code if it comes next.
    fn identifier(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::Identifier;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Get next character without consuming it.
        let character = self.peek_char(None);

        // Check if next character is an identifier character.
        if character.is_some() && self.identifier_begin_char.find(character.unwrap()).is_some() {
            // Save first character.
            token = self.eat_char().to_string();
            loop {
                let character = self.peek_char(None);
                if character.is_some() && self.identifier_end_char.find(character.unwrap()).is_some() {
                    // Append subsequent identifier character.
                    token.push(self.eat_char());
                } else {
                    break
                }
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        // Check if identifier is a boolean literal
        if token == "true" || token == "false" {
            Ok(Token::new(TokenKind::BooleanLiteral, Some(token), cursor))
        } else if self.keywords.contains(&token) {
            // Or if it is a keyword.
            Ok(Token::new(TokenKind::Keyword, Some(token), cursor))
        } else {
            // Otherwise it's just an identifier.
            Ok(Token::new(kind, Some(token), cursor))
        }
    }

    /// Consumes operator in code if it comes next.
    fn operator(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::Operator;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Check if next character is an operator character.
        loop {
            let character = self.peek_char(None);
            if character.is_some() && self.operator_char.find(character.unwrap()).is_some() {
                token.push(self.eat_char());
            } else {
                break
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes punctuator in code if it comes next.
    fn punctuator(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::Punctuator;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Check if next character is an punctuator character.
        loop {
            let character = self.peek_char(None);
            if character.is_some() && self.punctuator_char.find(character.unwrap()).is_some() {
                token.push(self.eat_char());
            } else {
                break
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes integer binary literal in code if it comes next.
    fn integer_binary_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::IntegerBinaryLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume '0b'.
        let string = self.eat_token(String::from("0b"));
        if string.is_some() && string.unwrap() == "0b" {
            // Consume '_'?.
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() == '_' {
                self.eat_char();
            }
            // Consume digitbinary.
            let character = self.peek_char(None);
            if character.is_some() && self.digit_binary.find(character.unwrap()).is_some() {
                token.push(self.eat_char());

                // Consume ('_'? digitbinary)*.
                loop {
                    let character = self.peek_char(None);

                    // Try consume '_' digitbinary.
                    if character.is_some() && character.unwrap() == '_' {
                        // Consume '_'.
                        self.eat_char();

                        let character = self.peek_char(None);
                        // If '_' is consumed, a digitbinary must follow.
                        if character.is_some() {
                            let character = character.unwrap();
                            if self.digit_binary.find(character).is_some() {
                                token.push(character);
                            }
                        } else { // Otherwise spit out '_' and break.
                            self.cursor -= 1;
                            break;
                        }
                    } else if character.is_some() && self.digit_binary.find(character.unwrap()).is_some() {
                        token.push(self.eat_char());
                    } else {
                        break;
                    }
                }
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes integer octal literal in code if it comes next.
    fn integer_octal_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::IntegerOctalLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume '0o'.
        let string = self.eat_token(String::from("0o"));
        if string.is_some() && string.unwrap() == "0o" {
            // Consume '_'?.
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() == '_' {
                self.eat_char();
            }
            // Consume digitoctal.
            let character = self.peek_char(None);
            if character.is_some() && self.digit_octal.find(character.unwrap()).is_some() {
                token.push(self.eat_char());

                // Consume ('_'? digitoctal)*.
                loop {
                    let character = self.peek_char(None);

                    // Try consume '_' digitoctal.
                    if character.is_some() && character.unwrap() == '_' {
                        // Consume '_'.
                        self.eat_char();

                        let character = self.peek_char(None);
                        // If '_' is consumed, a digitoctal must follow.
                        if character.is_some() {
                            let character = character.unwrap();
                            if self.digit_octal.find(character).is_some() {
                                token.push(character);
                            }
                        } else { // Otherwise spit out '_' and break.
                            self.cursor -= 1;
                            break;
                        }
                    } else if character.is_some() && self.digit_octal.find(character.unwrap()).is_some() {
                        token.push(self.eat_char());
                    } else {
                        break;
                    }
                }
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes integer hexadecimal literal in code if it comes next.
    fn integer_hexadecimal_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::IntegerHexadecimalLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume '0x'.
        let string = self.eat_token(String::from("0x"));
        if string.is_some() && string.unwrap() == "0x" {
            // Consume '_'?.
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() == '_' {
                self.eat_char();
            }
            // Consume digithexadecimal.
            let character = self.peek_char(None);
            if character.is_some() && self.digit_hexadecimal.find(character.unwrap()).is_some() {
                token.push(self.eat_char());

                // Consume ('_'? digithexadecimal)*.
                loop {
                    let character = self.peek_char(None);

                    // Try consume '_' digithexadecimal.
                    if character.is_some() && character.unwrap() == '_' {
                        // Consume '_'.
                        self.eat_char();

                        let character = self.peek_char(None);
                        // If '_' is consumed, a digithexadecimal must follow.
                        if character.is_some() {
                            let character = character.unwrap();
                            if self.digit_hexadecimal.find(character).is_some() {
                                token.push(character);
                            }
                        } else { // Otherwise spit out '_' and break.
                            self.cursor -= 1;
                            break;
                        }
                    } else if character.is_some() && self.digit_hexadecimal.find(character.unwrap()).is_some() {
                        token.push(self.eat_char());
                    } else {
                        break;
                    }
                }
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes integer decimal literal in code if it comes next.
    fn integer_decimal_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::IntegerDecimalLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume digitdecimal.
        let character = self.peek_char(None);
        if character.is_some() && self.digit_decimal.find(character.unwrap()).is_some() {
            token.push(self.eat_char());

            // Consume ('_'? digitdecimal)*.
            loop {
                let character = self.peek_char(None);

                // Try consume '_' digitdecimal.
                if character.is_some() && character.unwrap() == '_' {
                    // Consume '_'.
                    self.eat_char();

                    let character = self.peek_char(None);
                    // If '_' is consumed, a digitdecimal must follow.
                    if character.is_some() {
                        let character = character.unwrap();
                        if self.digit_decimal.find(character).is_some() {
                            token.push(character);
                        }
                    } else { // Otherwise spit out '_' and break.
                        self.cursor -= 1;
                        break;
                    }
                } else if character.is_some() && self.digit_decimal.find(character.unwrap()).is_some() {
                    token.push(self.eat_char());
                } else {
                    break;
                }
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Lexes the next set of characters based on defined rules.
    fn lex_next(&mut self) -> Result<Token, LexerError> {
        // Consume spaces.
        let token = self.spaces();
        return_on_ok_or_terminable_error!(token);

        // Consume newline.
        let token = self.newline();
        return_on_ok_or_terminable_error!(token);

        // Consume no_name.
        let token = self.no_name();
        return_on_ok_or_terminable_error!(token);

        // Consume identifier.
        let token = self.identifier();
        return_on_ok_or_terminable_error!(token);

        // Consume identifier.
        let token = self.operator();
        return_on_ok_or_terminable_error!(token);

        // Consume punctuator.
        let token = self.punctuator();
        return_on_ok_or_terminable_error!(token);

        // Consume integer_binary_literal.
        let token = self.integer_binary_literal();
        return_on_ok_or_terminable_error!(token);

        // Consume integer_octal_literal.
        let token = self.integer_octal_literal();
        return_on_ok_or_terminable_error!(token);

        // Consume integer_hexadecimal_literal.
        let token = self.integer_hexadecimal_literal();
        return_on_ok_or_terminable_error!(token);

        // Consume integer_decimal_literal.
        let token = self.integer_decimal_literal();
        return_on_ok_or_terminable_error!(token);

        // // Consume identifier.
        // let token = self.identifier();
        // return_on_ok_or_terminable_error!(token);

        // // Consume identifier.
        // let token = self.identifier();
        // return_on_ok_or_terminable_error!(token);

        // // Consume identifier.
        // let token = self.identifier();
        // return_on_ok_or_terminable_error!(token);

        // Unsupported character.
        Err(LexerError::new(
            ErrorKind::DoesNotMatchAnyRule,
            TokenKind::None,
            self.cursor,
        ))
    }

    /// Advance through code and generate tokens based on Astro syntax.
    pub fn lex(&mut self) -> Result<Vec<Token>, LexerError> {
        // A list of generated token.
        let mut tokens = vec![];

        // Iteratively advance through code and lex it.
        while self.is_inbounds(None) {
            // Lex the next set of characters.
            let token = self.lex_next();

            // Check for lexing error.
            if token.is_err() {
                return Err(token.unwrap_err());
            }

            // If there isno error, get the token value.
            let token = token.unwrap();

            // Push tokens that are not spaces, ...
            if token.kind != TokenKind::Spaces {
                tokens.push(token);
            }
        }

        Ok(tokens)
    }
}
