use std::{
    collections::HashMap,
    fmt::Debug,
};
use astro_lexer::Token;
use astro_codegen::AST;

use crate::{
    kinds::ErrorKind,
    errors::ParserError,
};

#[derive(Debug, Clone)]
/// TODO: Use hash-brown crate for hash maps.
/// This keeps the parser data for reuse.
struct CacheData<T> {
    data: Result<Output<T>, ParserError>,
    skip: usize,
}

impl<T> CacheData<T> {
    fn new(data: Result<Output<T>, ParserError>, skip: usize) -> Self {
        Self {
            data,
            skip,
        }
    }
}

#[derive(Debug, Clone)]
/// A combinator for creating packrat parsers.
pub struct Combinator<T> {
    tokens: Vec<Token>,
    cursor: usize,
    cache: HashMap<usize, HashMap<*const usize, CacheData<T>>>,
    // rule_map: HashMap<*const usize, String>,
}

impl<T> Combinator<T> {
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

    /// Stores result of a parse function call in cache if it does not already exist.
    /// A parse function call corresponds to visiting a rule.
    fn cache_rule(&mut self, cursor: usize, rule_func_addr: *const usize, result: Result<Output<T>, ParserError>) {
        // Check if the cursor already exists in map.
        match self.cache.get_mut(&cursor) {
            Some(rules) => { // Cursor position exists in map.
                // Check if rule doesn't already exists for cursor.
                if rules.get(&rule_func_addr).is_none() {
                    // Create cache data.
                    let cache_data = CacheData::new(
                        result,
                        self.cursor - cursor,
                    );

                    // Associate provided result with rule.
                    rules.insert(rule_func_addr, cache_data);
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
                rules.insert(rule_func_addr, cache_data);

                // Add rules for cursor.
                self.cache.insert(cursor, rules);
            }
        }
    }

    /// Returns a closure that parses string and calls parxer function arguments
    pub fn parse<'a>(args: Vec<CombinatorArg<'a, T>>) -> impl Fn (&'a mut Combinator<T>) -> Result<Output<T>, ParserError>
        where
            T: Debug,
            Output<T>: Debug,
            Result<Output<T>, ParserError>: Clone,
    {
        return move |combinator| {
            // Get cursor.
            let cursor = combinator.cursor;
            let mut asts: Vec<Output<T>> = Vec::new();
            let mut parsed_successfully = true;
            let mut problem: Option<ParserError> = None;

            // Loop through arguments.
            for arg in &args {
                // Check type of argument.
                match arg {
                    CombinatorArg::Func(func) => { // It is a function argument
                        // Get function address // TODO: Maybe if I can store arg as is
                        // Sprinkling in ome ungodly closure casting. Don't try this at home kids!
                        let func_addr = unsafe { std::mem::transmute::<&for<'c> fn(&'c mut Combinator<T>) -> Result<Output<T>, ParserError>, *const usize>(func) };
                        // let func_addr = func as *const usize;

                        // Check if there are rules for current cursor position
                        // and that resulting rules map contain the function address.
                        let rules = combinator.cache.get(&cursor);
                        if rules.is_some() && rules.unwrap().get(&func_addr).is_some() {
                            let CacheData { data, skip } = rules.unwrap().get(&func_addr).unwrap();

                            println!("data = {:?}, skip = {:?}", data, skip);
                            // let data: &mut Result<Output<T>, ParserError> = data.clone();
                            let data = (*data).clone();
                            let skip = *skip;

                            // Check if data in cached data is an error.
                            if data.is_err() {
                                parsed_successfully = false;

                                // Retrieve problem.
                                problem = Some(data.unwrap_err());
                                break;
                            } else {
                                // Add data to list.
                                asts.push(data.unwrap());

                                // Needed to advance the combinator state.
                                combinator.update_state(Some(skip));
                            }
                        } else { // If rule is not already cached
                            // Call the function with combinator as argument.
                            let ast = func(combinator);

                            // Check if result of parse function is an error.
                            if ast.is_err() {
                                parsed_successfully = false;

                                // Retrieve problem.
                                problem = Some(ast.unwrap_err());
                                break;
                            } else {
                                // Add data to list.
                                asts.push(ast.unwrap());
                            }
                        }
                    },
                    CombinatorArg::Str(token) => { // It is a string argument
                        // Compare and consume token.
                        let ast = combinator.eat_token(token);

                        // Check if result of parse function is an error.
                        if ast {
                            parsed_successfully = false;

                            // Retrieve problem.
                            problem = Some(ParserError::new(ErrorKind::UnexpectedToken, combinator.cursor));
                            break;
                        } else {
                            // Add data to list.
                            asts.push(Output::Str((*token as &str).into()));
                        }
                    }
                }
            }

            // If there was a problem while parsing.
            if problem.is_some() {
                // Revert state.
                combinator.cursor = cursor;
                return Err(problem.unwrap());
            }

            Ok(Output::Values(asts))
        }
    }
}

/// The types of arguments a combinator function can take
pub enum CombinatorArg <'a, T> {
    Func(fn (&mut Combinator<T>) -> Result<Output<T>, ParserError>),
    Str(&'a str),
}

#[derive(Debug, Clone)]
/// TODO: Think abt this impl thoroughly
pub enum Output<T> {
    Values(Vec<Output<T>>), // Outputs returned by combinator function.
    Str(String), //
    AST(T), // Outputs returned by a custom parser.
}

// macro_rules!  {
//     () => {

//     };
// }


// let name = func_name!(arg);

