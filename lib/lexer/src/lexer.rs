use crate::{ErrorKind, LexerError, TokenKind};

#[derive(Debug, Clone, PartialEq)]
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
    // Holds the curent indentation level as the lexer passes through the code.
    indent_level: usize,
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
            // Cursor starts at the position of next character to be consumed.
            cursor: 0,
            indent_level: 0,
            space_char: String::from(" \t"), // TODO: Unicode
            digit_binary: String::from("01"),
            digit_octal: String::from("01234567"),
            digit_decimal: String::from("0123456789"),
            digit_hexadecimal: String::from("0123456789ABCDEFabcdef"),
            identifier_begin_char: String::from(
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_",
            ), // TODO: Unicode
            identifier_end_char: String::from(
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789",
            ), // TODO: Unicode
            operator_char: String::from(":+'-*/\\^%&|!><=÷×≠≈¹²³√?~"), // TODO: Unicode
            punctuator_char: String::from("(){}[],.;@$"),                         // TODO: Unicode
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
            self.cursor += 1;
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

    /// Consumes the spaces in code if they come next.
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

    /// Consume the newline in code if it comes next.
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
            // if token.kind != TokenKind::Spaces {
                tokens.push(token);
            // }
        }

        Ok(tokens)
    }

    /// Lexes the next set of characters based on defined rules.
    fn lex_next(&mut self) -> Result<Token, LexerError> {
        // Consume spaces.
        let token = self.spaces();

        // Return token if lexing was successful or if some terminable errors occured
        if token.is_ok() || token.clone().unwrap_err().error != ErrorKind::CantConsume {
            return token;
        }

        // Consume newline.
        let token = self.newline();

        // Return token if lexing was successful or if some terminable errors occured
        if token.is_ok() || token.clone().unwrap_err().error != ErrorKind::CantConsume {
            return token;
        }

        // Unsupported character.
        Err(LexerError::new(
            ErrorKind::DoesNotMatchAnyRule,
            TokenKind::None,
            self.cursor,
        ))
    }
}
