use std::collections::HashMap;
use astro_lexer::Token;
use astro_codegen::AST;

use crate::{
    kinds::Rule,
    errors::ParserError,
};

#[derive(Debug, Clone)]
///
struct CacheData<T, Error> {
    data: Result<T, Error>,
    skip: usize,
}

///
impl<T, Error> CacheData<T, Error> {
    fn new(data: Result<T, Error>, skip: usize) -> Self {
        Self {
            data,
            skip,
        }
    }
}

#[derive(Debug, Clone)]
///
pub struct Combinator<T, Error> {
    tokens: Vec<Token>,
    cursor: usize,
    cache: HashMap<usize, HashMap<Rule, CacheData<T, Error>>>,
}

///
impl<T, Error> Combinator<T, Error> {
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
    fn cache_rule(&mut self, cursor: usize, rule: Rule, result: Result<T, Error>) {
        // Check if the cursor already exists in map.
        match self.cache.get_mut(&cursor) {
            Some(rules) => { // Cursor position exists in map.
                match rules.get(&rule) { // Check if rule already exists for cursor.
                    Some(_) => {}, // Do nothing if the rule contains some data.
                    None => { // Otherwise
                        // Create cache data.
                        let cache_data = CacheData::new(
                            result,
                            self.cursor - cursor,
                        );

                        // Associate provided result with rule.
                        rules.insert(rule, cache_data);
                    }
                }
            },
            None => { // Cursor position does not exist in map.
                // Create new rules for cursor.
                let mut rules = HashMap::new();

                // Create cache data
                let cache_data = CacheData::new(
                    result,
                    self.cursor - cursor,
                );

                // Associate provided result with rule.
                rules.insert(rule, cache_data);

                // Add rules for cursor.
                self.cache.insert(cursor, rules);
            }
        }
    }
}


