const { print } = require('../utils');
const Parser = require('./parser4');


print(new Parser('name  nom').parseIdentifier());
print(new Parser('name_ 5').parseIdentifier());
print(new Parser(' name').parseIdentifier()); // fail
print(new Parser('').parseIdentifier()); // fail
print(new Parser('_na99_me_ age').parseIdentifier());
print(new Parser('_na99_me_ age').parseIdentifier());
print(new Parser('99').parseInteger());
print(new Parser('9978').parseInteger());
print(new Parser('997890e747').parseInteger());
print(new Parser(' 997890e747').parseInteger()); // fail
print(new Parser('\t\t997890e747').parseWhitespaces());
print(new Parser(' \t997890e747').parseWhitespaces());
print(new Parser('     997890e747').parseWhitespaces());
print(new Parser('let').parseToken('let'));
print(new Parser('var').parseToken('var'));
print(new Parser('name').parseToken('name'));
print(new Parser('name').parseExpression());
print(new Parser('4455').parseExpression());
print(new Parser('let name = 678').parseSubjectDeclaration());
print(new Parser('var _n77m_m = age').parseSubjectDeclaration());
print(new Parser('var 4 = age').parseSubjectDeclaration()); // fail
print(new Parser('mut x = age').parseSubjectDeclaration()); // fail
print(new Parser('let x = $$$').parseSubjectDeclaration()); // fail
