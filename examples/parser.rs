use astro_lexer::{Lexer, LexerError};
use astro_parser::Parser;

fn main() {
    println!("Welcome to Astro!");

    // let valid_parser_code = String::from("Hello Hi");
    // let valid_parser_code = String::from("Hi Hello");
    // let valid_parser_code = String::from("5,");
    // let valid_parser_code = String::from("5,6");
    // let valid_parser_code = String::from("(5,)");
    //let valid_parser_code = String::from("(5,6), _ ..");
    let valid_parser_code = String::from("0o____01010___111.01____name");

    let tokens = match Lexer::new(valid_parser_code).lex() {
        Ok(tokens) => tokens,
        Err(error) => panic!("Lexer Error = {:?}", error),
    };

    println!("==== tokens ==== \n{:#?}", tokens);

    let ast = Parser::new(tokens).parse();
}
