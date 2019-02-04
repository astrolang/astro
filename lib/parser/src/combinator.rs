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

/************************* CACHE DATA *************************/

/// TODO: Use hash-brown crate for hash maps.
/// This keeps the parser data for reuse.
#[derive(Debug, Clone)]
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

/************************* COMBINATOR ARGUMENT *************************/

/// The types of arguments a combinator function can take
pub enum CombinatorArg<'a, T> {
    Func((fn (&Vec<CombinatorArg<'a, T>>, &mut Combinator<T>) -> Result<Output<T>, ParserError>, &'a Vec<CombinatorArg<'a, T>>)),
    Str(&'a str),
}

/************************* OUTPUT *************************/

/// TODO: Think abt this impl thoroughly
#[derive(Debug, Clone)]
pub enum Output<T> {
    Values(Vec<Output<T>>), // A list of outputs returned by combinator function.
    Str(String), // A token returned by combinator function.
    AST(T), // Outputs returned by a custom parser function
    Empty,
}

/************************* COMBINATOR *************************/

/// A combinator for creating packrat parsers.
#[derive(Debug, Clone)]
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
        if self.cursor < self.tokens.len() {
            return true;
        }

        false
    }

    /// Updates parser positional information.
    pub fn update_state(&mut self, skip: Option<usize>) {
        // Get offset value or set to one if not specified.
        let skip = skip.unwrap_or(1);

        // Update cursor position.
        self.cursor += skip;
    }

    /// Gets the combinator cursor.
    pub fn get_cursor(&mut self) -> usize {
        self.cursor
    }

    /// Gets the next token if available.
    pub fn eat_token(&mut self) -> Result<Token, ParserError> {
        let cursor = self.cursor;

        if self.is_inbounds() {
            // Update parser position.
            self.update_state(None);
            return Ok(self.tokens[cursor].clone())
        }

        Err(ParserError::new(ErrorKind::InputExhausted, self.cursor))
    }

    /// Compares the next token with argument string.
    pub fn check_token(&mut self, token: &str) -> Result<(), ParserError> {
        let cursor = self.cursor;

        if self.is_inbounds() {
            if let Some(ref word) = self.tokens[cursor].token {
                if word == token {
                    // Update parser position.
                    self.update_state(None);
                    return Ok(());
                }

                return Err(ParserError::new(ErrorKind::TokensDontMatch, self.cursor));
            }
        }

        Err(ParserError::new(ErrorKind::InputExhausted, self.cursor))
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

    /// Parses its arguments.
    pub fn parse<'a>(args: &Vec<CombinatorArg<'a, T>>, combinator: &mut Combinator<T>) -> Result<Output<T>, ParserError>
        where T: Debug + Clone,
    {
        // Get cursor.
        let cursor = combinator.cursor;
        let mut asts: Vec<Output<T>> = Vec::new();
        let mut problem: Option<ParserError> = None;

        // Loop through arguments.
        for arg in args {
            // Check type of argument.
            match arg {
                CombinatorArg::Func((func, arguments)) => { // It is a function argument
                    // Get function address
                    let func_addr = unsafe {
                        std::mem::transmute::<_, *const usize>(&func)
                    };

                    // Check if there are rules for current cursor position
                    // and that resulting rules map contain the function address.
                    let rules = combinator.cache.get(&cursor);
                    if rules.is_some() && rules.unwrap().get(&func_addr).is_some() {
                        // Get previously stored result.
                        let CacheData { data, skip } = (*rules.unwrap().get(&func_addr).unwrap()).clone();

                        // Check if data in cached data is an error.
                        if data.is_err() {
                            // Retrieve problem.
                            problem = Some(data.unwrap_err());

                            // Break out of loop.
                            break
                        } else {
                            // Add data to list.
                            asts.push(data.unwrap());

                            // Needed to advance the combinator state.
                            combinator.update_state(Some(skip));
                        }
                    } else { // If rule is not already cached
                        // Call the function with combinator as argument.
                        let ast = func(arguments, combinator);

                        // Check if result of parse function is an error.
                        if ast.is_err() {
                            // Retrieve problem.
                            problem = Some(ast.unwrap_err());

                            // Break out of loop.
                            break
                        } else {
                            // Add data to list.
                            asts.push(ast.unwrap());
                        }
                    }
                },
                CombinatorArg::Str(token) => { // It is a string argument
                    // Compare and consume token.
                    let result = combinator.check_token(token);

                    // Check if result of parse function is an error.
                    if result.is_err() {
                        // Retrieve problem.
                        problem = Some(result.unwrap_err());

                        // Break out of loop.
                        break
                    } else {
                        // Add data to list.
                        asts.push(Output::Str(token.to_string()));
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

    /// Parses a set of alternatives.
    pub fn alt<'a>(args: &Vec<CombinatorArg<'a, T>>, combinator: &mut Combinator<T>) -> Result<Output<T>, ParserError>
        where T: Debug + Clone,
    {
        // Get cursor.
        let cursor = combinator.cursor;
        let mut asts: Vec<Output<T>> = Vec::new();
        let mut parsed_successfully = false;

        // Loop through arguments.
        for arg in args {
            // Check type of argument.
            match arg {
                CombinatorArg::Func((func, arguments)) => { // It is a function argument
                    // Get function address
                    let func_addr = unsafe {
                        std::mem::transmute::<_, *const usize>(&func)
                    };

                    // Check if there are rules for current cursor position
                    // and that resulting rules map contain the function address.
                    let rules = combinator.cache.get(&cursor);
                    if rules.is_some() && rules.unwrap().get(&func_addr).is_some() {
                        // Get previously stored result.
                        let CacheData { data, skip } = (*rules.unwrap().get(&func_addr).unwrap()).clone();

                        // Check if data in cached data is ok.
                        if data.is_ok() {
                            // Parsing successful.
                            parsed_successfully = true;

                            // Add data to list.
                            asts.push(data.unwrap());

                            // Needed to advance the combinator state.
                            combinator.update_state(Some(skip));

                            // Break out of loop.
                            break
                        }
                    } else { // If rule is not already cached
                        // Call the function with combinator as argument.
                        let ast = func(arguments, combinator);

                        // Check if result of parse function is ok.
                        if ast.is_ok() {
                            // Parsing successful.
                            parsed_successfully = true;

                            // Add data to list.
                            asts.push(ast.unwrap());

                            // Break out of loop.
                            break
                        }
                    }
                },
                CombinatorArg::Str(token) => { // It is a string argument
                    // Compare and consume token.
                    let result = combinator.check_token(token);

                    // Check if result of parse function is an error.
                    if result.is_ok() {
                                                // Parsing successful.
                        parsed_successfully = true;

                        // Add data to list.
                        asts.push(Output::Str(token.to_string()));

                        // Break out of loop.
                        break
                    }
                }
            }
        }

        // If there was a problem while parsing.
        if !parsed_successfully {
            // Revert state.
            combinator.cursor = cursor;
            return Err(ParserError::new(ErrorKind::AlternativesDontMatch, combinator.cursor))
        }

        Ok(Output::Values(asts))
    }

    /// Parses its arguments at least once.
    pub fn more<'a>(args: &Vec<CombinatorArg<'a,T>>, combinator: &mut Combinator<T>) -> Result<Output<T>, ParserError>
        where T: Debug + Clone,
    {
        // Get cursor.
        let cursor = combinator.cursor;
        let mut asts: Vec<Output<T>> = Vec::new();
        let mut parsed_successfully = true;

        // Loop and parse multiple times.
        loop {
            let result = Combinator::parse(args, combinator);

            // Check if result was successful.
            if result.is_err() {
                if asts.len() == 0 {
                    parsed_successfully = false;
                }
                break
            } else {
                asts.push(result.unwrap());
            }
        }

        // If there was a problem while parsing.
        if !parsed_successfully {
            // Revert state.
            combinator.cursor = cursor;
            return Err(ParserError::new(ErrorKind::CantMatchAtLeastARule, combinator.cursor))
        }

        Ok(Output::Values(asts))
    }

    /// Parses its arguments at least once.
    /// Returns success if unable to parse.
    pub fn opt_more<'a>(args: &Vec<CombinatorArg<'a,T>>, combinator: &mut Combinator<T>) -> Result<Output<T>, ParserError>
        where T: Debug + Clone,
    {
        let mut asts: Output<T> = Output::Empty;

        let result = Combinator::more(args, combinator);

        if result.is_ok() {
            asts = result.unwrap();
        }

        Ok(asts)
    }

    /// Parses its arguments once.
    /// Returns success if unable to parse.
    pub fn opt<'a>(args: &Vec<CombinatorArg<'a,T>>, combinator: &mut Combinator<T>) -> Result<Output<T>, ParserError>
        where T: Debug + Clone,
    {
        let mut asts: Output<T> = Output::Empty;

        let result = Combinator::parse(args, combinator);

        if result.is_ok() {
            asts = result.unwrap();
        }

        Ok(asts)
    }

    /// Tries to parse its arguments once.
    /// Does not advance the combinator.
    pub fn and<'a>(args: &Vec<CombinatorArg<'a,T>>, combinator: &mut Combinator<T>) -> Result<Output<T>, ParserError>
        where T: Debug + Clone,
    {
        // Get cursor.
        let cursor = combinator.cursor;

        let result = Combinator::parse(args, combinator).map(|x| Output::Empty);

        // Revert advancement.
        combinator.cursor = cursor;

        result
    }

    /// Tries to parse its arguments once.
    /// Expects parsing to fail.
    /// Does not advance the combinator.
    pub fn not<'a>(args: &Vec<CombinatorArg<'a,T>>, combinator: &mut Combinator<T>) -> Result<Output<T>, ParserError>
        where T: Debug + Clone,
    {
        // Get cursor.
        let cursor = combinator.cursor;

        let result = match Combinator::parse(args, combinator) {
            Ok(_) => Err(ParserError::new(ErrorKind::ExpectedRuleToFail, combinator.cursor)),
            Err(_) => Ok(Output::Empty),
        };

        // Revert advancement.
        combinator.cursor = cursor;

        result
    }
}

/// TODO
mod tests {

}
