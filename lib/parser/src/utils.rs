use crate::{
    combinator::{CombinatorArg, Combinator, Output},
    errors::ParserError
};

/************************* UTILITIES *************************/

/// Gets the memory address of a combinator or parser frunction.
pub fn get_func_addr<'a, T>(func: &fn (&Vec<CombinatorArg<'a, T>>, &mut Combinator<T>) -> Result<Output<T>, ParserError>) -> *const usize {
    unsafe {
        std::mem::transmute::<_, *const usize>(func)
    }
}
