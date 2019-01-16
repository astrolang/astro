use std::collections::HashMap;
use astro_lexer::Token;
use astro_codegen::AST;

use crate::{
    kinds::Rule,
    errors::ParserError,
};

#[derive(Debug, Clone)]
///
struct CacheData {
    cursor: usize,
    data: Result<AST, ParserError>,
    skip: usize,
}

///
impl CacheData {
    fn new(cursor: usize, data: Result<AST, ParserError>, skip: usize) -> Self {
        Self {
            cursor,
            data,
            skip,
        }
    }
}

#[derive(Debug, Clone)]
///
pub struct Combinator {
    tokens: Vec<Token>,
    cursor: usize,
    cache: HashMap<usize, Result<CacheData, ParserError>>,
}

///
impl Combinator {
    /// Creates a new combinator object from the tokens passed in.
    pub fn new(tokens: Vec<Token>) -> Self {
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
    fn eat_token(&mut self, token: &str) -> bool {
        let cursor = self.cursor;
        let mut result = false;

        if self.is_inbounds() {
            if let Some(ref word) = self.tokens[cursor].token {
                if word == token {
                    // Save true in result.
                    result = true;
                    // Update parser position.
                    self.update_state(None);
                }
            }
        }

        result
    }

    /// Stores result of parse in cache if it does not already exist.
    fn cache_rule(&mut self, kind: Rule, ast: AST) {
        unimplemented!()
    }
}


