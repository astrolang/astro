#[macro_export]
macro_rules! str {
    ($string:tt) => {
        CombinatorArg::Str($string)
    }
}

#[macro_export]
macro_rules! func {
    ($function:ident) => {
        CombinatorArg::Func(Parser::$function)
    }
}

#[macro_export]
macro_rules! parse {
    ($arg0:expr, $($args:expr),*) => {
        Combinator::parse($arg0, $args)
    }
}

// #[macro_export]
// macro_rules! or {
//     ($arg0:expr, $($args:expr),*) => {
//         CombinatorArg::or($arg0, $args)
//     }
// }
