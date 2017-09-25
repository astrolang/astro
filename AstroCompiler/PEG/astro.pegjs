// 25/09/17
{
}

start
	= expression ((";" / newline) expression?)*

expression
	= subject_declaration
	/ comment

subject_declaration 
	= ("let" / "var") name "=" (integer / string) { return "\nsubject-declaration"; } 

name
	= n:" "*[a-zA-Z_][a-zA-Z0-9_]*" "* { return n; }

// literals 
string 
	= s:" "*'"'[^\"]+'"' { return s; }
	/ s:" "*"'"[^\']+"'" { return s; }

integer
	= i:" "*[0-9]+" "* { return i; }

// comments
comment
	= "#"[^\n]* { return "\ncomment"; }

newline 
	= "\r"? "\n" { return; } // skip
