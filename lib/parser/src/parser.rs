use std::collections::HashMap;
use astro_lexer::Token;
use astro_codegen::AST;

use kinds::Rule;
use errors::ParseError;

#[derive(Debug, Clone)]
struct CacheData {
    cursor: usize,
    data: Result<AST, ParseError>,
    skip: usize,
}

impl CacheData {
    fn new(cursor: usize, data: Result<AST, ParseError>, skip: usize) -> Self {
        Self {
            cursor,
            data,
            skip,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Parser {
    tokens: Vec<Token>,
    cursor: usize,
    cache: HashMap<usize, Result<CacheData, ParseError>>,
}

impl Parser {
    /// Creates a new lexer object from the code passed in.
    fn new(tokens: Vec<Token>) -> Self {
        Self {
            tokens,
            cursor: 0,
            cache: HashMap::new(),
        }
    }

    /// Checks if the cursor is still in bounds, i.e. if cursor
    /// hasn't reached the end of the tokens.
    fn is_inbounds(&self) -> bool {
        if self.cursor > self.tokens.len() {
            return false;
        }
        true
    }

    /// Updates parser positional information.
    fn update_state(&mut self, skip: Option<usize>) {
        // Get offset value or set to zero if not specified.
        let skip = skip.unwrap_or(0);

        // Update cursor position.
        self.cursor += skip;
    }

    /// Compares the next token with argument string.
    fn eat_token(&mut self, token: &str) -> Option<String> {
        let cursor = self.parser;
        let mut result: Option<String> = None;

        if self.is_inbounds() && self.tokens[cursor].token == token {
            result = Some(token);
            // Update parser position
            self.update_state();
        }

        result
    }

    /// Stores result of parse in cache if it does not already exist.
    fn cache_rule(&mut self, kind: Rule, rule: AST) {
    }
}
