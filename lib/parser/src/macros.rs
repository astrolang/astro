#[macro_export]
macro_rules! s {
    ($string:tt) => {
        CombinatorArg::Str($string.into())
    };
}

#[macro_export]
macro_rules! f {
    ($func:ident, $arg0:expr $(, $args:expr)* ) => {
        CombinatorArg::Func(
            (
                Parser::$func as _,
                &vec![$arg0 $(, $args)*],
            )
        )
    };
    ($func:ident) => {
        CombinatorArg::Func(
            (
                Parser::$func as _,
                &vec![],
            )
        )
    };
}

#[macro_export]
macro_rules! parse {
    ($combinator:ident, $arg0:expr $(, $args:expr)*) => {
        Combinator::parse(
            &vec![$arg0 $(, $args)*],
            $combinator,
        )
    };
    ($arg0:expr $(, $args:expr)* ) => {
        CombinatorArg::Func(
            (
                Combinator::parse as _,
                &vec![$arg0 $(, $args)*],
            )
        )
    };
}

#[macro_export]
macro_rules! alt {
    ($combinator:ident, $arg0:expr $(, $args:expr)* ) => {
        Combinator::alt(
            &vec![$arg0 $(, $args)*],
            $combinator,
        )
    };
    ($arg0:expr $(, $args:expr)* ) => {
        CombinatorArg::Func(
            (
                Combinator::alt as _,
                &vec![$arg0 $(, $args)*],
            )
        )
    };
}

#[macro_export]
macro_rules! more {
    ($combinator:ident, $arg0:expr $(, $args:expr)* ) => {
        Combinator::more(
            &vec![$arg0 $(, $args)*],
            $combinator,
        )
    };
    ($arg0:expr $(, $args:expr)* ) => {
        CombinatorArg::Func(
            (
                Combinator::more as _,
                &vec![$arg0 $(, $args)*],
            )
        )
    };
}

#[macro_export]
macro_rules! optmore {
    ($combinator:ident, $arg0:expr $(, $args:expr)* ) => {
        Combinator::opt_more(
            &vec![$arg0 $(, $args)*],
            $combinator,
        )
    };
    ($arg0:expr $(, $args:expr)* ) => {
        CombinatorArg::Func(
            (
                Combinator::opt_more as _,
                &vec![$arg0 $(, $args)*],
            )
        )
    };
}

#[macro_export]
macro_rules! opt {
    ($combinator:ident, $arg0:expr $(, $args:expr)* ) => {
        Combinator::opt(
            &vec![$arg0 $(, $args)*],
            $combinator,
        )
    };
    ($arg0:expr $(, $args:expr)* ) => {
        CombinatorArg::Func(
            (
                Combinator::opt as _,
                &vec![$arg0 $(, $args)*],
            )
        )
    };
}

#[macro_export]
macro_rules! and {
    ($combinator:ident, $arg0:expr $(, $args:expr)* ) => {
        Combinator::and(
            &vec![$arg0 $(, $args)*],
            $combinator,
        )
    };
    ($arg0:expr $(, $args:expr)* ) => {
        CombinatorArg::Func(
            (
                Combinator::and as _,
                &vec![$arg0 $(, $args)*],
            )
        )
    };
}

#[macro_export]
macro_rules! not {
    ($combinator:ident, $arg0:expr $(, $args:expr)* ) => {
        Combinator::not(
            &vec![$arg0 $(, $args)*],
            $combinator,
        )
    };
    ($arg0:expr $(, $args:expr)* ) => {
        CombinatorArg::Func(
            (
                Combinator::not as _,
                &vec![$arg0 $(, $args)*],
            )
        )
    };
}
