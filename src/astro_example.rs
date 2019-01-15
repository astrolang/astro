use astro_lexer::Lexer;

// enum, not_func {, $not_valid_interp, $not_symbol, (<:, ::, >: as operators),
// # and #--# not comment, priv, : block indentation,
// // and /**/ as comment, func :symbol
fn main() {
    println!("Welcome to Astro!");

    let code = String::from(
        "  \r\n  \n _ name _name false for +/ ,0b100_1 0o107_17 0o017_17_17 0x12_345_67_89a_BFE 0023_4567_09
        0b011.01_1e-1_01 0o071.5321_2e+7_01 0x012_34.45_6789_Fp+aBCDEf 00_12_3.45_67e-8900 `a` ||hello||
        'world hello' \"world\nhello\" //\n //comment line\n/**/   /* hello /* there*/ */ ...\n5"
    );

    let lexer_result = Lexer::new(code).lex();

    println!("lexer_result = {:#?}", lexer_result);
}
