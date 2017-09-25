// 25/09/17
{
}

start
	= expression ((";" / "\n") expression)*

expression
	= subject_declaration
	/ comment

subject_declaration 
	= ("let" / "var") name "=" (integer / string) "\n"? { return "subject-declaration"; } 

name
	= [a-zA-Z_][a-zA-Z0-9_]*" "*

// literals 
string 
	= '"'.+'"'
	/ "'".+"' {"

integer
	= [0-9]+" "*

// comments
comment
	= "#".+"\n" { return "comment"; }

