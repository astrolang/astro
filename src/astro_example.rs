use astro_lexer::Lexer;

fn main() {
    println!("Welcome to Astro!");

    let code = String::from(
        "  \r\n  \n _ name false for +/ ,0b100_1 0o107_17 0o017_17_17 0x12_345_67__89a_BFE 0023_4567_09"
    );

    let lexer_result = Lexer::new(code).lex();

    println!("lexer_result = {:#?}", lexer_result);
}

// `  \r\n  \n _ name false for +/ ,0b100_1 0o3246\\\n ++ # hello comment! \\\n'this is a string' 0b0
// // -056670 >: 0x5654dead6 || regex he442ead ||0b0.1e-1<: <:name; ()0b0.1e-1 0o537e-7
// # hello \\\n0x12_3p-25f 5657.0e-23\`a\`\"hello there\"'''\nThis is \nnew\n'''#-hello \n -# #-\n this is a #- nested\n-# comment -#
// this is \\\n continued 'this is \\ consumed'\\`
