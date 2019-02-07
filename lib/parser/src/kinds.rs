#[derive(Debug, Clone)]
pub enum ErrorKind {
    TokensDontMatch,
    InputExhausted,
    IncompleteParse,
    UnexpectedToken,
    AlternativesDontMatch,
    CantMatchAtLeastARule,
    OneOfRulesFailed,
    ExpectedRuleToFail,
    ExpectedIntegerLiteral,
    ExpectedFloatLiteral,
    ExpectedComma,
    ExpectedNewlines,
    ExpectedListArguments,
    ExpectedListLiteral,
}
