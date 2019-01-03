use astro_lexer::Lexer;

fn main() {
    println!("Welcome to Astro!");

    let code = String::from(
        "  \r\n"
    );

    let lexer_result = Lexer::new(code).lex();

    println!("lexer_result = {:?}", lexer_result);
}

// `  _  name for 0o3246\\\n ++ 0b100_1 # hello comment! \\\n'this is a string' 0b0
// // -056670 >: 0x5654dead6 || regex he442ead ||0b0.1e-1<: <:name; ()0b0.1e-1 0o537e-7
// # hello \\\n0x12_3p-25f 5657.0e-23\`a\`\"hello there\"'''\nThis is \nnew\n'''#-hello \n -# #-\n this is a #- nested\n-# comment -#
// this is \\\n continued 'this is \\ consumed'\\
// __samedent\n    \n__not_indent
// __samedent\n    #comment\n    __indent
// __dedent
//     __indent
//   __not_indent
// __dedent
// __samedent
//     __indent
//         __indent_again
// __dedent_dedent`
