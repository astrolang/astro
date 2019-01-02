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

#[derive(Debug, Clone, PartialEq)]
pub enum TokenKind {
    Spaces,
    Newline,
    LineContinuation,
}

#[derive(Debug, Clone, PartialEq)]
pub struct LexerError {
    error: Error,
    kind: TokenKind,
    cursor: usize,
}

impl LexerError {
    pub fn new(error: Error, kind: TokenKind, cursor: usize) -> Self {
        Self {
            error,
            cursor,
            kind,
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum Error {
    CantConsume,
}

#[derive(Debug, Clone)]
pub struct Lexer {
    code: Vec<char>,
    cursor: usize,
    indent_level: usize,
    space_char: String,
    digit_binary: String,
    digit_octal: String,
    digit_decimal: String,
    digit_hexadecimal: String,
    identifier_begin_char: String,
    identifier_end_char: String,
    operator_char: String,
    punctuator_char: String,
    keywords: Vec<String>,
}

impl Lexer {
    /// Creates a new lexer object from the code passed in.
    pub fn new(code: String) -> Self {
        Self {
            code: code.chars().collect(),
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
        let offset = offset.unwrap_or(0);
        if self.is_inbounds(Some(offset)) {
            return Some(self.code[self.cursor + offset]);
        }
        None
    }

    /// Returns the specified token if it is next in code but does not consume it.
    fn peek_token(&self, token: String) -> bool {
        let start = self.cursor;
        let end = start + token.len();
        let slice = &self.code[start..end];
        let token_chars: Vec<char> = token.chars().collect();
        let token_chars = token_chars.as_slice();
        if slice == token_chars {
            return true;
        }
        false
    }

    /// Consumes the specified token if it is next in code
    fn eat_token(&mut self, token: String) -> Option<String> {
        let start = self.cursor;
        let end = start + token.len();
        let slice = &self.code[start..end];
        let token_chars: Vec<char> = token.chars().collect();
        let token_chars = token_chars.as_slice();
        if slice == token_chars {
            // Advance cursor.
            self.cursor += 1;
            return Some(token);
        }
        None
    }

    /// Consumes the next character in code.
    fn eat_char(&mut self) -> char {
        let character = self.code[self.cursor];
        // Advance cursor.
        self.cursor += 1;
        character
    }

    /// Checks if the cursor is still in bounds, i.e. if cursor
    /// hasn't reached the end of the code.
    fn is_inbounds(&self, offset: Option<usize>) -> bool {
        let offset = offset.unwrap_or(0);
        if self.cursor + offset < self.code.len() {
            return true;
        }
        false
    }

    /// Consumes the next spaces in code.
    fn spaces(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::Spaces;
        let token: Option<String> = None;
        let cursor = self.cursor;
        let mut count = 0;

        // Consume available spaces.
        loop {
            let character = self.peek_char(None);
            if character.is_some() && self.space_char.find(character.unwrap()).is_some() {
                self.eat_char();
                count += 1;
            } else {
                break;
            }
        }

        // Revert if lexing failed.
        if count == 0 {
            self.cursor = cursor;
            return Err(LexerError::new(Error::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, token, cursor))
    }

    /// Consume the next newline in code.
    fn newline(&mut self) -> Result<Token, LexerError> {
        let kind = TokenKind::Newline;
        let token: Option<String> = None;
        let cursor = self.cursor;

        // Get the next two chararcters.
        let character = self.peek_char(None);
        let character2 = self.peek_char(Some(1));

        // Consume any following newlines.
        if character.is_some() && character.unwrap() == '\n' { // Unix newline
            self.eat_char();
        } else if character.is_some() && character.unwrap() == '\r' && character2.unwrap() == '\n' { // Windows newline
            self.eat_char();
            self.eat_char();
        } else { // Otherwise
            return Err(LexerError::new(Error::CantConsume, kind, cursor));
        }

        Ok(Token::new(kind, token, cursor))
    }

    ///
    pub fn lex(&mut self) -> Result<Vec<Token>, LexerError> {
        //
        let mut tokens = vec![];

        //
        while self.is_inbounds(None) {
            let token = self.spaces();

            if token.is_err() {
                return Err(token.unwrap_err());
            }

            let token = token.unwrap();
            if token.kind == TokenKind::Spaces {
                tokens.push(token);
            }
        }

        //
        Ok(tokens)
    }

    // fn peek_char(&mut self) -> Option<String>
}
