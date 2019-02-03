/// Returns a closure that parses string and calls parser functions.
pub fn parse<'a>(args: Vec<CombinatorArg<'a, T>>) -> impl Fn (&'a mut Combinator<T>) -> Result<Output<T>, ParserError>
    where T: Debug + Clone,
{
    return move |combinator| {
        // Get cursor.
        let cursor = combinator.cursor;
        let mut asts: Vec<Output<T>> = Vec::new();
        let mut problem: Option<ParserError> = None;

        // Loop through arguments.
        for arg in &args {
            // Check type of argument.
            match arg {
                CombinatorArg::Func(func) => { // It is a function argument
                    // Get function address
                    // Sprinkling in some ungodly closure casting.
                    // let func_addr = unsafe { std::mem::transmute::<&fn (&mut Combinator<T>) -> Result<Output<T>, ParserError>, *const usize>(func) };
                    // TODO: Implement getting of function name.
                    let func_addr = 0 as *const usize;

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
                        let ast = func(combinator);

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
                    let result = combinator.eat_token(token);
                    println!("Kaboom! 4");

                    // Check if result of parse function is an error.
                    if result.is_err() {
                        println!("Kaboom! 5");

                        // Retrieve problem.
                        problem = Some(result.unwrap_err());

                        // Break out of loop.
                        break
                    } else {
                        println!("Kaboom! 6");
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

/// Returns a closure that parses alternatives
pub fn alt<'a>(args: Vec<CombinatorArg<'a, T>>) -> impl Fn (&'a mut Combinator<T>) -> Result<Output<T>, ParserError>
    where T: Debug + Clone,
{
    return move |combinator| {
        // Get cursor.
        let cursor = combinator.cursor;
        let mut asts: Vec<Output<T>> = Vec::new();
        let mut parsed_successfully = false;

        // Loop through arguments.
        for arg in &args {
            println!("Kaboom! 1");
            // Check type of argument.
            match arg {
                CombinatorArg::Func(func) => { // It is a function argument
                    println!("Kaboom! 2");
                    // Get function address
                    // Sprinkling in some ungodly closure casting.
                    // let func_addr = unsafe { std::mem::transmute::<&fn (&mut Combinator<T>) -> Result<Output<T>, ParserError>, *const usize>(func) };
                    // TODO: Implement getting of function name.
                    let func_addr = 0 as *const usize;

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
                        let ast = func(combinator);

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
                    let result = combinator.eat_token(token);
                    println!("Kaboom! 4");

                    // Check if result of parse function is an error.
                    if result.is_ok() {
                        // Parsing successful.
                        parsed_successfully = true;

                        println!("Kaboom! 6");
                        // Add data to list.
                        asts.push(Output::Str((*token as &str).into()));

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
}
