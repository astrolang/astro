/// Returns from enclosing function if specified token was lexed successfully
/// or if some terminable error occured.
#[macro_export]
macro_rules! return_on_ok_or_terminable_error {
    ($token:ident) => {
        if $token.is_ok() || $token.clone().unwrap_err().error != ErrorKind::CantConsume {
            return $token;
        }
    };
}
