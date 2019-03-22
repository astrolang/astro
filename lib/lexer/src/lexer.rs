#[macro_use]
use crate::macros;

use crate::{ErrorKind, LexerError, TokenKind};

/************************* TOKEN *************************/

/// Token object.
#[derive(Debug, Clone, PartialEq)]
pub struct Token {
    pub kind: TokenKind,
    pub token: Option<String>,
    pub cursor: usize,
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

/// TODO:
/// - symbols => `:identifier` and `:(`
/// - linecontinuation => `...` (\s | newline)*
/// - string interpolation handling
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
            punctuator_char: String::from("(){}[],;@$"),
            // Valid Astro keywords
            keywords: vec![
                String::from("import"),
                String::from("export"),
                String::from("pub"),
                String::from("let"),
                String::from("var"),
                String::from("ref"),
                String::from("iso"),
                String::from("const"),
                String::from("macro"),
                String::from("fun"),
                String::from("type"),
                String::from("enum"),
                String::from("async"),
                String::from("if"),
                String::from("elif"),
                String::from("else"),
                String::from("try"),
                String::from("raise"),
                String::from("except"),
                String::from("ensure"),
                String::from("defer"),
                String::from("unsafe"),
                String::from("for"),
                String::from("match"),
                String::from("while"),
                String::from("loop"),
                String::from("end"),
                String::from("fallthrough"),
                String::from("return"),
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

        // Check if token length does not go beyond code length
        if end > self.code.len() {
            return false;
        }

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

        // Check if token length does not go beyond code length
        if end > self.code.len() {
            return None;
        }

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
        if token == "_" {
            Ok(Token::new(TokenKind::Placeholder, Some(token), cursor))
        } else if token == "true" || token == "false" {
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

    /// Consumes a sequence of dots in code if they come next.
    fn dots(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::Dots;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Check if next character is an operator character.
        loop {
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() == '.' {
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

        // Check if next character is a punctuator character.
        let character = self.peek_char(None);
        if character.is_some() && self.punctuator_char.find(character.unwrap()).is_some() {
            token.push(self.eat_char());
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    // Consume ('-'* digit)*.
    fn consume_digits(&mut self, digit_characters: String, token: &mut String) {
        loop {
            // Try consume '_' digit.
            let mut character = self.peek_char(None);
            let mut underscore_count = 0;
            while character.is_some() && character.unwrap() == '_' {
                // Consume '_'.
                self.eat_char();
                character = self.peek_char(None);
                underscore_count += 1;

            }

            // If '_' is consumed, a digit must follow.
            let character = self.peek_char(None);
            if character.is_some() && digit_characters.find(character.unwrap()).is_some() {
                token.push(self.eat_char());
            } else { // Otherwise spit out '_' and break.
                self.cursor -= underscore_count;
                break;
            }
    
        }
    }

    /// Consumes integer binary literal in code if it comes next.
    fn integer_binary_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::IntegerBinaryLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume '0b'.
        let string = self.eat_token(String::from("0b"));
        if string.is_some() && string.unwrap() == "0b" {
            // Consume '-'*.
            let mut character = self.peek_char(None);
            while character.is_some() && character.unwrap() == '_' {
                self.eat_char();
                character = self.peek_char(None);
            }

            // Consume digitbinary.
            let character = self.peek_char(None);
            if character.is_some() && self.digit_binary.find(character.unwrap()).is_some() {
                token.push(self.eat_char());

                // Consume ('-'* digitbinary)*.
                self.consume_digits(self.digit_binary.clone(), &mut token);
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
            // Consume '-'*.
            let mut character = self.peek_char(None);
            while character.is_some() && character.unwrap() == '_' {
                self.eat_char();
                character = self.peek_char(None);
            }
            // Consume digitoctal.
            let character = self.peek_char(None);
            if character.is_some() && self.digit_octal.find(character.unwrap()).is_some() {
                token.push(self.eat_char());

                // Consume ('-'* digitoctal)*.
                self.consume_digits(self.digit_octal.clone(), &mut token);
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
            // Consume '-'*.
            let mut character = self.peek_char(None);
            while character.is_some() && character.unwrap() == '_' {
                self.eat_char();
                character = self.peek_char(None);
            }
            // Consume digithexadecimal.
            let character = self.peek_char(None);
            if character.is_some() && self.digit_hexadecimal.find(character.unwrap()).is_some() {
                token.push(self.eat_char());

                // Consume ('-'* digithexadecimal)*.
                self.consume_digits(self.digit_hexadecimal.clone(), &mut token);
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

        // Consume '_'
        let mut character = self.peek_char(None);
        while character.is_some() && character.unwrap() == '_' {
            self.eat_char();
            character = self.peek_char(None);

        }

        // Consume digitdecimal.
        let character = self.peek_char(None);
        if character.is_some() && self.digit_decimal.find(character.unwrap()).is_some() {
            token.push(self.eat_char());

            // Consume ('-'* digitdecimal)*.
            self.consume_digits(self.digit_decimal.clone(), &mut token);
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes floating-point binary literal in code if it comes next.
    fn float_binary_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::FloatBinaryLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume integerpart: ('0b' '-'* digitbinary) ('-'* digitbinary)*.
        let integer_part = self.integer_binary_literal();
        if integer_part.is_ok() {
            token.push_str(integer_part.unwrap().token.unwrap().as_str());

            // Consume '.'.
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() == '.' {
                token.push(self.eat_char());
                // Consume digitbinary.
                let character = self.peek_char(None);
                if character.is_some() && self.digit_binary.find(character.unwrap()).is_some() {
                    token.push(self.eat_char());

                    // Consume ('-'* digitbinary)*.
                    self.consume_digits(self.digit_binary.clone(), &mut token);

                    // Consume ('e' [-+]? digitbinary ('-'* digitbinary)*)?
                    let character = self.peek_char(None);
                    if character.is_some() && character.unwrap() == 'e' {
                        token.push(self.eat_char());

                        // Consume [-+]?
                        let sign = self.peek_char(None);
                        if sign.is_some() && (sign.unwrap() == '-' || sign.unwrap() == '+') {
                            token.push(self.eat_char());
                        }

                        // Consume digitbinary.
                        let character = self.peek_char(None);
                        if character.is_some() && self.digit_binary.find(character.unwrap()).is_some() {
                            token.push(self.eat_char());

                            // Consume ('-'* digitbinary)*.
                            self.consume_digits(self.digit_binary.clone(), &mut token);
                        } else { // Failed if can't consume digitbinary.
                            token = String::new();
                        }
                    }
                } else { // Failed if can't consume digitbinary.
                    token = String::new();
                }

            } else if character.is_some() && character.unwrap() == 'e' {
                // Consume [-+]?
                let sign = self.peek_char(None);
                if character.is_some() && (character.unwrap() == '-' || character.unwrap() == '+') {
                    token.push(self.eat_char());
                }

                // Consume digitbinary.
                let character = self.peek_char(None);
                if character.is_some() && self.digit_binary.find(character.unwrap()).is_some() {
                    token.push(self.eat_char());

                    // Consume ('-'* digitbinary)*.
                    self.consume_digits(self.digit_binary.clone(), &mut token);
                } else { // Failed if can't consume digitbinary.
                    token = String::new();
                }
            } else { // Failed if can't consume digitbinary.
                token = String::new();
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes floating-point octal literal in code if it comes next.
    fn float_octal_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::FloatOctalLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume integerpart: ('0o' '-'* digitoctal) ('-'* digitoctal)*.
        let integer_part = self.integer_octal_literal();
        if integer_part.is_ok() {
            token.push_str(integer_part.unwrap().token.unwrap().as_str());

            // Consume '.'.
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() == '.' {
                token.push(self.eat_char());
                // Consume digitoctal.
                let character = self.peek_char(None);
                if character.is_some() && self.digit_octal.find(character.unwrap()).is_some() {
                    token.push(self.eat_char());

                    // Consume ('-'* digitoctal)*.
                    self.consume_digits(self.digit_octal.clone(), &mut token);

                    // Consume ('e' [-+]? digitoctal ('-'* digitoctal)*)?
                    let character = self.peek_char(None);
                    if character.is_some() && character.unwrap() == 'e' {
                        token.push(self.eat_char());

                        // Consume [-+]?
                        let sign = self.peek_char(None);
                        if sign.is_some() && (sign.unwrap() == '-' || sign.unwrap() == '+') {
                            token.push(self.eat_char());
                        }

                        // Consume digitoctal.
                        let character = self.peek_char(None);
                        if character.is_some() && self.digit_octal.find(character.unwrap()).is_some() {
                            token.push(self.eat_char());

                            // Consume ('-'* digitoctal)*.
                            self.consume_digits(self.digit_octal.clone(), &mut token);
                        } else { // Failed if can't consume digitoctal.
                            token = String::new();
                        }
                    }
                } else { // Failed if can't consume digitoctal.
                    token = String::new();
                }

            } else if character.is_some() && character.unwrap() == 'e' {
                // Consume [-+]?
                let sign = self.peek_char(None);
                if character.is_some() && (character.unwrap() == '-' || character.unwrap() == '+') {
                    token.push(self.eat_char());
                }

                // Consume digitoctal.
                let character = self.peek_char(None);
                if character.is_some() && self.digit_octal.find(character.unwrap()).is_some() {
                    token.push(self.eat_char());

                    // Consume ('-'* digitoctal)*.
                    self.consume_digits(self.digit_octal.clone(), &mut token);
                } else { // Failed if can't consume digitoctal.
                    token = String::new();
                }
            } else { // Failed if can't consume digitoctal.
                token = String::new();
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes floating-point hexadecimal literal in code if it comes next.
    fn float_hexadecimal_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::FloatHexadecimalLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume integerpart: ('0o' '-'* digithexadecimal) ('-'* digithexadecimal)*.
        let integer_part = self.integer_hexadecimal_literal();
        if integer_part.is_ok() {
            token.push_str(integer_part.unwrap().token.unwrap().as_str());

            // Consume '.'.
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() == '.' {
                token.push(self.eat_char());
                // Consume digithexadecimal.
                let character = self.peek_char(None);
                if character.is_some() && self.digit_hexadecimal.find(character.unwrap()).is_some() {
                    token.push(self.eat_char());

                    // Consume ('-'* digithexadecimal)*.
                    self.consume_digits(self.digit_hexadecimal.clone(), &mut token);

                    // Consume ('p' [-+]? digithexadecimal ('-'* digithexadecimal)*)?
                    let character = self.peek_char(None);
                    if character.is_some() && character.unwrap() == 'p' {
                        token.push(self.eat_char());

                        // Consume [-+]?
                        let sign = self.peek_char(None);
                        if sign.is_some() && (sign.unwrap() == '-' || sign.unwrap() == '+') {
                            token.push(self.eat_char());
                        }

                        // Consume digithexadecimal.
                        let character = self.peek_char(None);
                        if character.is_some() && self.digit_hexadecimal.find(character.unwrap()).is_some() {
                            token.push(self.eat_char());

                            // Consume ('-'* digithexadecimal)*.
                            self.consume_digits(self.digit_hexadecimal.clone(), &mut token);
                        } else { // Failed if can't consume digithexadecimal.
                            token = String::new();
                        }
                    }
                } else { // Failed if can't consume digithexadecimal.
                    token = String::new();
                }

            } else if character.is_some() && character.unwrap() == 'e' {
                // Consume [-+]?
                let sign = self.peek_char(None);
                if character.is_some() && (character.unwrap() == '-' || character.unwrap() == '+') {
                    token.push(self.eat_char());
                }

                // Consume digithexadecimal.
                let character = self.peek_char(None);
                if character.is_some() && self.digit_hexadecimal.find(character.unwrap()).is_some() {
                    token.push(self.eat_char());

                    // Consume ('-'* digithexadecimal)*.
                    self.consume_digits(self.digit_hexadecimal.clone(), &mut token);
                } else { // Failed if can't consume digithexadecimal.
                    token = String::new();
                }
            } else { // Failed if can't consume digithexadecimal.
                token = String::new();
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes floating-point decimal literal in code if it comes next.
    fn float_decimal_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::FloatDecimalLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume integerpart: digitdecimal ('-'* digitdecimal)*.
        let integer_part = self.integer_decimal_literal();
        if integer_part.is_ok() {
            token.push_str(integer_part.clone().unwrap().token.unwrap().as_str());
        }

        // Consume [^.]  '.'.
        let character = self.peek_char(None);
        if character.is_some() && character.unwrap() == '.' {
            if integer_part.is_err() {
                token.push('0');
            }

            token.push(self.eat_char());

            // Check for [^.] '.'.
            // A preceding '.' means that this is not a float literal but an integer in a range literal.
            // Ex. a..120.
            let mut followingDot = false;
            if self.cursor > 1 && self.code[self.cursor - 2] == '.' {
                followingDot = true;
            }

            // Consume digitdecimal.
            let character = self.peek_char(None);
            if character.is_some() && self.digit_decimal.find(character.unwrap()).is_some() && !followingDot {
                token.push(self.eat_char());

                // Consume ('-'* digitdecimal)*.
                self.consume_digits(self.digit_decimal.clone(), &mut token);

                // Consume ('e' [-+]? digitdecimal ('-'* digitdecimal)*)?
                let character = self.peek_char(None);
                if character.is_some() && character.unwrap() == 'e' {
                    token.push(self.eat_char());

                    // Consume [-+]?
                    let sign = self.peek_char(None);
                    if sign.is_some() && (sign.unwrap() == '-' || sign.unwrap() == '+') {
                        token.push(self.eat_char());
                    }

                    // Consume digitdecimal.
                    let character = self.peek_char(None);
                    if character.is_some() && self.digit_decimal.find(character.unwrap()).is_some() {
                        token.push(self.eat_char());

                        // Consume ('-'* digitdecimal)*.
                        self.consume_digits(self.digit_decimal.clone(), &mut token);
                    } else { // Failed if can't consume digitdecimal.
                        token = String::new();
                    }
                }
            } else { // Failed if can't consume digitdecimal.
                token = String::new();
            }

        } else if character.is_some() && character.unwrap() == 'e' {
            // Consume [-+]?
            let sign = self.peek_char(None);
            if character.is_some() && (character.unwrap() == '-' || character.unwrap() == '+') {
                token.push(self.eat_char());
            }

            // Consume digitdecimal.
            let character = self.peek_char(None);
            if character.is_some() && self.digit_decimal.find(character.unwrap()).is_some() {
                token.push(self.eat_char());

                // Consume ('-'* digitdecimal)*.
                self.consume_digits(self.digit_decimal.clone(), &mut token);
            } else { // Failed if can't consume digitdecimal.
                token = String::new();
            }
        } else { // Failed if can't consume digitdecimal.
            token = String::new();
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes char literal in code if it comes next.
    fn char_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::CharLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume '`'.
        let character = self.peek_char(None);
        if character.is_some() && character.unwrap() == '`' {
            self.eat_char();

            // Consume (singlequotestringchars: (!(newline | '`') .))?.
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() != '\n' && character.unwrap() != '\r' && character.unwrap() != '`' {
                token.push(self.eat_char());
            }

            // Consume '`'.
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() == '`' {
                self.eat_char();
            } else {
                token = String::new();
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes regex literal in code if it comes next.
    fn regex_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::RegexLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume '||'.
        let word = self.eat_token("||".into());
        if word.is_some() {

            // Consume (singlequotestringchars: (!(newline | '||') .)+)?.
            loop {
                let character = self.peek_char(None);
                let word = self.peek_token("||".into());
                if character.is_some() && character.unwrap() != '\n' && character.unwrap() != '\r' && !word {
                    token.push(self.eat_char());
                } else {
                    break;
                }
            }

            // Consume '||'.
            let word = self.eat_token("||".into());
            if word.is_none() {
                token = String::new();
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes string literal in code if it comes next.
    fn string_literal(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::StringLiteral;
        let mut token = String::from("");
        let cursor = self.cursor;

        // Consume "'".
        let character = self.peek_char(None);
        if character.is_some() && character.unwrap() == '\'' {
            self.eat_char();

            // Consume (singlequotestringchars: (!("'") .)+)?.
            loop {
                let character = self.peek_char(None);
                if character.is_some() && character.unwrap() != '\'' {
                    token.push(self.eat_char());
                } else {
                    break;
                }
            }

            // Consume "'".
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() == '\'' {
                self.eat_char();
            } else {
                token = String::new();
            }
        } else if character.is_some() && character.unwrap() == '"' {
            self.eat_char();

            // Consume (singlequotestringchars: (!('"') .)+)?.
            loop {
                let character = self.peek_char(None);
                if character.is_some() && character.unwrap() != '"' {
                    token.push(self.eat_char());
                } else {
                    break;
                }
            }

            // Consume '"'.
            let character = self.peek_char(None);
            if character.is_some() && character.unwrap() == '"' {
                self.eat_char();
            } else {
                token = String::new();
            }
        }

        // Revert cursor value if no character consumed.
        if token.is_empty() {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes single-line comment  in code if it comes next.
    fn single_line_comment(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::SingleLineComment;
        let mut token = String::from("");
        let cursor = self.cursor;

        let mut is_comment = false;

        // Consume '//'.
        let word = self.eat_token("//".into());
        if word.is_some() {
            is_comment = true;

            // Consume (singlequotestringchars: (!(newline | eoi) .)+)?..
            loop {
                let character = self.peek_char(None);
                if character.is_some() && character.unwrap() != '\n' && character.unwrap() != '\r' {
                    self.eat_char();
                } else {
                    break;
                }
            }
        }

        // Revert cursor value if no character consumed.
        if !is_comment {
            self.cursor = cursor;
            return Err(LexerError::new(ErrorKind::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, Some(token), cursor))
    }

    /// Consumes multi-line comment  in code if it comes next.
    /// FIXME: This has recursion and can crash with highly nested comments.
    fn multi_line_comment(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::MultiLineComment;
        let mut token = String::from("");
        let cursor = self.cursor;

        let mut is_comment = false;

        // Consume '/*'.
        let word = self.eat_token("/*".into());
        if word.is_some() {
            // Consume (multilinecommentchars: (!('/*' | '*/') .)+)?.
            loop {
                let character = self.peek_char(None);
                let close_tag = self.peek_token("*/".into());
                if character.is_some() && character.unwrap() != '\n' && character.unwrap() != '\r' && !close_tag {
                    // Check for nested multiline comment
                    let open_tag = self.peek_token("/*".into());
                    if open_tag {
                        self.multi_line_comment();
                    } else {
                        self.eat_char();
                    }
                } else {
                    break;
                }
            }

            // Consume '*/'.
            let word = self.eat_token("*/".into());
            if word.is_some() {
                is_comment = true;
            }
        }

        // Revert cursor value if no character consumed.
        if !is_comment {
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

        // Consume identifier.
        let token = self.identifier();
        return_on_ok_or_terminable_error!(token);

        // Consume regex_literal.
        let token = self.regex_literal();
        return_on_ok_or_terminable_error!(token);

        // Consume char_literal.
        let token = self.char_literal();
        return_on_ok_or_terminable_error!(token);

        // Consume string_literal.
        let token = self.string_literal();
        return_on_ok_or_terminable_error!(token);

        // Consume single_line_comment.
        let token = self.single_line_comment();
        return_on_ok_or_terminable_error!(token);

        // Consume multi_line_comment.
        let token = self.multi_line_comment();
        return_on_ok_or_terminable_error!(token);

        // Consume operator.
        let token = self.operator();
        return_on_ok_or_terminable_error!(token);

        // Consume dots.
        let token = self.dots();
        return_on_ok_or_terminable_error!(token);

        // Consume float_binary_literal.
        let token = self.float_binary_literal();
        return_on_ok_or_terminable_error!(token);

        // Consume float_octal_literal.
        let token = self.float_octal_literal();
        return_on_ok_or_terminable_error!(token);

        // Consume float_hexadecimal_literal.
        let token = self.float_hexadecimal_literal();
        return_on_ok_or_terminable_error!(token);

        // Consume float_decimal_literal. // Greedy (float literals that start with `0`)
        let token = self.float_decimal_literal();
        return_on_ok_or_terminable_error!(token);

        // Consume punctuator. // Greedy (float literals that start with `.`)
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

        // Consume integer_decimal_literal. // Greedy (integer literals that start with `0`)
        let token = self.integer_decimal_literal();
        return_on_ok_or_terminable_error!(token);

        // Unsupported character.
        Err(LexerError::new(
            ErrorKind::DoesNotMatchAnyRule,
            TokenKind::Empty,
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

            // TODO: support multiple token returns.

            // If there isno error, get the token value.
            let token = token.unwrap();

            // Push tokens that are not spaces, ...
            if token.kind != TokenKind::Spaces && token.kind != TokenKind::SingleLineComment && token.kind != TokenKind::MultiLineComment {
                tokens.push(token);
            }
        }

        Ok(tokens)
    }
}
