## PROGRAM
```nim
program = { expressions }
```

## SUBJECT DECLARATION
```nim
subjectDeclaration = {
  name,
  privateAccess,
  mutability, value:expression } # AST-L2
```

## FUNCTION DECLARATION
```nim
functionDeclaration = {
  name,
  privateAccess,
  superParams: { mutability, rest, key, scopeKey, keyNeeded, value }
  params: { mutability, rest, key, scopeKey, keyNeeded, value }
  expressions
}
```

## MACRO
```nim
macroDeclaration = {
  name,
  privateAccess,
  params: { mutability, rest, key, scopeKey, keyNeeded, value }
  expressions
}
```

## TYPE DECLARATION
```nim
typeDeclaration = { name, privateAccess, superTypes, fields }
```

## ABST DECLARATION
```nim
abstDeclaration = {
  name,
  privateAccess,
  superTypes,
  body: subjectDeclaration1 | subTypes:{ name, privateAccess, params:[{mutability, key, scopeKey, keyNeeded, value}] },
  constructorFunction
}
typeParam = { mutability, key, scopeKey, keyNeeded, privateAccess, value }
```

## IMPORT
```nim
importDeclaration = { dynamic, key, path, names:[{ actualName, scopeName }] }
```

## CONTROL FLOW ##
```nim
if = { head, body:expressions, elifs:[{ head, body:expressions }], elseBody:expressions }
while = { head, body:expressions, endBody:expressions } # AST-L1
for = { head, body:expressions, endBody:expressions } # AST-L1
loop = { body:expressions, endBody:expressions }
try = { head, body:expressions, catchs:[{ param, body:expressions }] } # AST-L1
redo = { head, body:expressions, endBody:expressions }
match = {  }
whenMatch = {  }
return = { value:atom, target }
break = { value, target } # AST-L1
continue = { target } # AST-L1
spill = { target } # AST-L1
delegate = { name } # AST-L1
await = { value:atom } # AST-L1
yield = { value:atom }
raise = { value:atom }
```

## ASSIGNMENT
```nim
assign1 = { # AST-L1
  pattern: { patternType, names:[nameChain1, nameChain2, ..., rest] },
  operator,
  value:expression
}
assign2 = { name:dotChain, value:expression } #  AST-L2
```

## EXPRESSIONS
```nim
binaryExpression = { ops, atoms }
unaryExpression = { op, atom, position }
expression = { referenceType, atom }
parens = { expression }
new = { fieldNames, values }
call = { keys, values }
index = { keys, ranges } # AST-L1
dot = { name } # AST-2
dotChain = { atoms } # AST-3
range = { start, end, step }
object = { type, keys, values } # AST-L2
pass = { }
$ = { }
pointer = { value }
pointed = { pointer }
```

## TYPE VALUE
```nim
functionType = { paramTypes, returnTypes }
typeRelation = { relation, type1, type2 }
type = { name, unknown }
```

## LITERALS
```nim
list = { values }
set = { values }
dict = { keys, values }
tuple = { values }
namedTuple = { keys, values }
regex = { value }
string = { value }
symbol = { value }
boolean = { value }
int = { value, radix, precision }
float = { value, radix, precision }
```
