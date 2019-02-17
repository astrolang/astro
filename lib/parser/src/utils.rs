use crate::{
    combinator::{Combinator, CombinatorArg, Output},
    errors::ParserError,
};

/************************* UTILITIES *************************/

/// Gets the memory address of a combinator or parser function.
pub fn get_func_addr<'a, T>(
    func: &fn(&[CombinatorArg<'a, T>], &mut Combinator<T>) -> Result<Output<T>, ParserError>,
) -> *const usize {
    unsafe { std::mem::transmute::<_, *const usize>(func) }
}
