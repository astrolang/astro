use astro_lexer::{Lexer, LexerError};
use astro_parser::Parser;

// enum, not_func {, $not_valid_interp, $not_symbol, (<:, ::, >: as operators),
// # and #--# not comment, priv, : block indentation,
// // and /**/ as comment, func :symbol,
// [correct snippets], no_mutative_call!(), ident(. ident?)?: type
fn main() {
    println!("Welcome to Astro!");

    let valid_lexer_code = String::from(
        "  \r\n  \n _ name _name false for +/ ,0b100_1 0o107_17 0o017_17_17 0x12_345_67_89a_BFE 0023_4567_09
        0b011.01_1e-1_01 0o071.5321_2e+7_01 0x012_34.45_6789_Fp+aBCDEf 00_12_3.45_67e-8900 `a` ||hello||
        'world hello' \"world\nhello\" //\n //comment line\n/**/   /* hello /* there*/ */ ...\n5"
    );

    let tokens = Lexer::new(valid_lexer_code).lex();

    let valid_parser_code = String::from("HELLO hi New HELLO hi New");

    let tokens = match Lexer::new(valid_parser_code).lex() {
        Ok(tokens) => tokens,
        Err(error) => panic!("Lexer Error = {:?}", error),
    };

    println!("tokens = {:#?}", tokens);

    let ast = Parser::new(tokens).parse();

    println!("ast = {:#?}", ast);
}
