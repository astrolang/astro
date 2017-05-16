// 07/04/17
grammar astro;

IDENTIFIER
    : [a-zA-Z] [_a-zA-Z0-9]* [a-zA-Z0-9]?
    ;

VAR_IDENTIFIER
    : '_' [a-zA-Z] [_a-zA-Z0-9]* [a-zA-Z0-9]?
    ;

NUMBER
    : [+-]? [0-9] [_0-9]* (('.'[0-9] [_0-9]*)? 'e' [+-]? [0-9] [_0-9]* [0-9]?)? ('_'[a-zA-Z]+)?
    | [+-]? '0b' [0-1] [_0-1]* (('.'[0-1] [_0-1]*)? 'e' [+-]? [0-1] [_0-1]* [0-1]?)? ('_'[a-zA-Z]+)?
    | [+-]? '0o' [0-7] [_0-7]* (('.'[0-7] [_0-7]*)? 'e' [+-]? [0-7] [_0-7]* [0-7]?)? ('_'[a-zA-Z]+)?
    | [+-]? '0x' [0-9A-E] [_0-9A-E]* (('.' [0-9A-E] [_0-9A-E]*)? 'e' [+-]? [0-9A-E] [_0-9A-E]* [0-9A-E]?)? ('_'[a-zA-Z]+)?
    ;

STRING 
    : '\'' .* '\''
    | '"' .* '"'
    ;

BOOLEAN 
    : 'true'
    | 'false'
    ;

DEMARCATION:;

BIN_OPERATOR:;

reference
    : 'ref'
    | 'iso'
    | 'val'
    | 'acq'
    ;

parameters
    : (parameter (',' parameter)*)?
    ;

parameter
    : VAR_IDENTIFIER ('.' IDENTIFIER)?
    ;

variable_declaration
    : ('var'|'let') IDENTIFIER ('=' reference? expression)
    ;

function_declaration
    : 'fun' IDENTIFIER parameters ':' block
    ;

type_declaration
    : 'type' IDENTIFIER parameters ':' block
    ;

enum_declaration
    : 'enum' IDENTIFIER parameters ':' block
    ;

block
    : expression (DEMARCATION expression)*
    ;

expression 
    : IDENTIFIER
    | NUMBER
    | STRING
    | BOOLEAN
    | '(' block ')'
    | ('-'|'+') expression
    | '!' expression
    | expression BIN_OPERATOR expression
    ;

while_statement
    : 'while' ((VAR_IDENTIFIER '=' reference? expression)|expression) ':' block
    ;

if_statement 
    : 'if' ((VAR_IDENTIFIER '=' reference? expression)|expression) ':' block ((elif_block)* else_block)?
    ;

fragment elif_block
    : 'elif' ((VAR_IDENTIFIER '=' reference? expression)|expression) ':' block
    ;

fragment else_block
    : 'else' ':' block
    ;

for_statement
    : 'for' (VAR_IDENTIFIER '=' reference? expression) ':' block
    ;

loop_statement
    : 'loop' ':' block
    ;

redo_while_statement
    : 'redo' ':' block 'while' ((VAR_IDENTIFIER '=' reference? expression)|expression) ':' block
    ;
