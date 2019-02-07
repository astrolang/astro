#[derive(Debug, Clone, PartialEq)]
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
    ExpectedTupleArguments,
    ExpectedTupleLiteral,
}
