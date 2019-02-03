#[derive(Debug, Clone)]
pub enum ErrorKind {
    TokensDontMatch,
    InputExhausted,
    IncompleteParse,
    UnexpectedToken,
    AlternativesDontMatch,
}
