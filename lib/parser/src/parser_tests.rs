
/************************* TESTS *************************/

// TODO: Add failing cases.
#[cfg(test)]
mod tests {
    use crate::{
        combinator::{Combinator, CombinatorArg, Output},
        errors::ParserError,
        parser::Parser,
        kinds::ErrorKind,
        macros,
    };
    use astro_codegen::asts::{SimpleExpr, AST};
    use astro_lexer::{Lexer, Token, TokenKind};

    // Output::AST(AST::SimpleExpr(SimpleExpr::List(vec![])))
    // println!("parser = {:?}", combinator_result_2);

    fn get_combinator_for_code(code: String) -> Combinator<AST> {
        let tokens = Lexer::new(code).lex().unwrap();
        Combinator::new(tokens)
    }

    #[test]
    fn newlines() {
        // Sinle newline.
        let combinator = &mut get_combinator_for_code("\r\n".into());
        let combinator_result_1 = parse!(combinator, f!(newlines));

        // Multiple newlines.
        let combinator = &mut get_combinator_for_code("\n \r\n".into());
        let combinator_result_2 = parse!(combinator, f!(newlines));

        assert_eq!(
            combinator_result_1,
            Ok(Output::Values(vec![Output::AST(AST::Empty)]))
        );
        assert_eq!(
            combinator_result_2,
            Ok(Output::Values(vec![Output::AST(AST::Empty)]))
        );
    }

    #[test]
    fn comma() {
        // Just comma.
        let combinator = &mut get_combinator_for_code(",".into());
        let combinator_result_1 = parse!(combinator, f!(comma));

        // Comma with newlines.
        let combinator = &mut get_combinator_for_code(",  \r\n\n".into());
        let combinator_result_2 = parse!(combinator, f!(comma));

        // Comma with newlines on either end.
        let combinator = &mut get_combinator_for_code("\r\n,  \r\n\n".into());
        let combinator_result_3 = parse!(combinator, f!(comma));

        assert_eq!(
            combinator_result_1,
            Ok(Output::Values(vec![Output::AST(AST::Empty)]))
        );
        assert_eq!(
            combinator_result_2,
            Ok(Output::Values(vec![Output::AST(AST::Empty)]))
        );
        assert_eq!(
            combinator_result_3,
            Ok(Output::Values(vec![Output::AST(AST::Empty)]))
        );
    }

    #[test]
    fn list_arguments() {
        // One argument.
        let combinator = &mut get_combinator_for_code("5".into());
        let combinator_result_1 = parse!(combinator, f!(list_arguments));

        // Multiple arguments.
        let combinator = &mut get_combinator_for_code("5, 0x7f.45".into());
        let combinator_result_2 = parse!(combinator, f!(list_arguments));

        // Multiple arguments with trailing comma.
        let combinator = &mut get_combinator_for_code(".1, 2.3, 5_00,".into());
        let combinator_result_3 = parse!(combinator, f!(list_arguments));

        assert_eq!(
            combinator_result_1,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::List(vec![SimpleExpr::Terminal {
                    kind: TokenKind::IntegerDecimalLiteral,
                    value: "5".into()
                }])
            ))]))
        );
        assert_eq!(
            combinator_result_2,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::List(vec![
                    SimpleExpr::Terminal {
                        kind: TokenKind::IntegerDecimalLiteral,
                        value: "5".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatHexadecimalLiteral,
                        value: "7f.45".into()
                    }
                ])
            ))]))
        );
        assert_eq!(
            combinator_result_3,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::List(vec![
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatDecimalLiteral,
                        value: "0.1".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatDecimalLiteral,
                        value: "2.3".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::IntegerDecimalLiteral,
                        value: "500".into()
                    }
                ])
            ))]))
        );
    }

    #[test]
    fn list_literal() {
        // One argument.
        let combinator = &mut get_combinator_for_code("[5,]".into());
        let combinator_result_1 = parse!(combinator, f!(list_literal));

        // Multiple arguments.
        let combinator = &mut get_combinator_for_code("[\n5,\r\n 0x7f.45,]".into());
        let combinator_result_2 = parse!(combinator, f!(list_literal));

        // Multiple arguments with trailing comma.
        let combinator = &mut get_combinator_for_code("[.1, 2.3, 5_00,]".into());
        let combinator_result_3 = parse!(combinator, f!(list_literal));

        // No argument.
        let combinator = &mut get_combinator_for_code("[]".into());
        let combinator_result_4 = parse!(combinator, f!(list_literal));

        assert_eq!(
            combinator_result_1,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::List(vec![SimpleExpr::Terminal {
                    kind: TokenKind::IntegerDecimalLiteral,
                    value: "5".into()
                }])
            ))]))
        );
        assert_eq!(
            combinator_result_2,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::List(vec![
                    SimpleExpr::Terminal {
                        kind: TokenKind::IntegerDecimalLiteral,
                        value: "5".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatHexadecimalLiteral,
                        value: "7f.45".into()
                    }
                ])
            ))]))
        );
        assert_eq!(
            combinator_result_3,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::List(vec![
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatDecimalLiteral,
                        value: "0.1".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatDecimalLiteral,
                        value: "2.3".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::IntegerDecimalLiteral,
                        value: "500".into()
                    }
                ])
            ))]))
        );
        assert_eq!(
            combinator_result_4,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::List(vec![])
            ))]))
        );
    }

    #[test]
    fn tuple_arguments() {
        // One argument.
        let combinator = &mut get_combinator_for_code("5,".into());
        let combinator_result_1 = parse!(combinator, f!(tuple_arguments));

        // Multiple arguments.
        let combinator = &mut get_combinator_for_code("5, 0x7f.45".into());
        let combinator_result_2 = parse!(combinator, f!(tuple_arguments));

        // Multiple arguments with trailing comma.
        let combinator = &mut get_combinator_for_code(".1, 2.3, 5_00,".into());
        let combinator_result_3 = parse!(combinator, f!(tuple_arguments));

        // One argument without comma.
        let combinator = &mut get_combinator_for_code("5".into());
        let combinator_result_4 = parse!(combinator, f!(tuple_arguments));

        assert_eq!(
            combinator_result_1,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::Tuple(vec![SimpleExpr::Terminal {
                    kind: TokenKind::IntegerDecimalLiteral,
                    value: "5".into()
                }])
            ))]))
        );
        assert_eq!(
            combinator_result_2,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::Tuple(vec![
                    SimpleExpr::Terminal {
                        kind: TokenKind::IntegerDecimalLiteral,
                        value: "5".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatHexadecimalLiteral,
                        value: "7f.45".into()
                    }
                ])
            ))]))
        );
        assert_eq!(
            combinator_result_3,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::Tuple(vec![
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatDecimalLiteral,
                        value: "0.1".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatDecimalLiteral,
                        value: "2.3".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::IntegerDecimalLiteral,
                        value: "500".into()
                    }
                ])
            ))]))
        );
        assert_eq!(
            combinator_result_4,
            Err(ParserError { error: ErrorKind::ExpectedTupleArguments, column: 0 })
        );
    }

    #[test]
    fn tuple_literal() {
        // One argument.
        let combinator = &mut get_combinator_for_code("(5,)".into());
        let combinator_result_1 = parse!(combinator, f!(tuple_literal));

        // Multiple arguments.
        let combinator = &mut get_combinator_for_code("(\n5,\r\n 0x7f.45,)".into());
        let combinator_result_2 = parse!(combinator, f!(tuple_literal));

        // Multiple arguments with trailing comma.
        let combinator = &mut get_combinator_for_code("(.1, 2.3, 5_00,)".into());
        let combinator_result_3 = parse!(combinator, f!(tuple_literal));

        // No argument.
        let combinator = &mut get_combinator_for_code("()".into());
        let combinator_result_4 = parse!(combinator, f!(tuple_literal));

        assert_eq!(
            combinator_result_1,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::Tuple(vec![SimpleExpr::Terminal {
                    kind: TokenKind::IntegerDecimalLiteral,
                    value: "5".into()
                }])
            ))]))
        );
        assert_eq!(
            combinator_result_2,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::Tuple(vec![
                    SimpleExpr::Terminal {
                        kind: TokenKind::IntegerDecimalLiteral,
                        value: "5".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatHexadecimalLiteral,
                        value: "7f.45".into()
                    }
                ])
            ))]))
        );
        assert_eq!(
            combinator_result_3,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::Tuple(vec![
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatDecimalLiteral,
                        value: "0.1".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::FloatDecimalLiteral,
                        value: "2.3".into()
                    },
                    SimpleExpr::Terminal {
                        kind: TokenKind::IntegerDecimalLiteral,
                        value: "500".into()
                    }
                ])
            ))]))
        );
        assert_eq!(
            combinator_result_4,
            Ok(Output::Values(vec![Output::AST(AST::SimpleExpr(
                SimpleExpr::Tuple(vec![])
            ))]))
        );
    }
}
