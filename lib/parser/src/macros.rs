#[macro_export]
macro_rules! str {
    ($string:tt) => {
        CombinatorArg::Str($string)
    }
}

#[macro_export]
macro_rules! func {
    ($func:ident) => {
        CombinatorArg::Func(Parser::$func)
    }
}

#[macro_export]
macro_rules! comb_func {
    ($func:ident) => {
        CombinatorArg::Func(Combinator::$func)
    }
}

#[macro_export]
macro_rules! parse {
    ($arg0:expr (, $args:expr)* ) => {
        Combinator::parse(vec![arg0 $(, $args)*])
    };
}

#[macro_export]
macro_rules! alt {
    ($arg0:expr (, $args:expr)* ) => {
        Combinator::alt(vec![arg0 $(, $args)*])
    };
}

#[macro_export]
macro_rules! or {
    ($arg0:expr (, $args:expr)* ) => {
        Combinator::or(vec![arg0 $(, $args)*])
    };
}

#[macro_export]
macro_rules! and {
    ($arg0:expr (, $args:expr)* ) => {
        Combinator::and(vec![arg0 $(, $args)*])
    };
}

#[macro_export]
macro_rules! not {
    ($arg0:expr (, $args:expr)* ) => {
        Combinator::not(vec![arg0 $(, $args)*])
    };
}

#[macro_export]
macro_rules! more {
    ($arg0:expr (, $args:expr)* ) => {
        Combinator::more(vec![arg0 $(, $args)*])
    };
}

#[macro_export]
macro_rules! optmore {
    ($arg0:expr (, $args:expr)* ) => {
        Combinator::opt_more(vec![arg0 $(, $args)*])
    };
}

#[macro_export]
macro_rules! opt {
    ($arg0:expr (, $args:expr)* ) => {
        Combinator::opt(vec![arg0 $(, $args)*])
    };
}

// #![feature(core_intrinsics)]
macro_rules! func_name {
    () => {{
        fn f() {}
        fn type_name_of<T>(_: T) -> &'static str {
            extern crate core;
            unsafe { core::intrinsics::type_name::<T>() }
        }
        let name = type_name_of(f);
        &name[6..name.len() - 4]
    }}
}
