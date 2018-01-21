const { print } = require('../utils');
const Parser = require('./parser4');


print(new Parser('name  nom').parseIdentifier());
print(new Parser('name_ 5').parseIdentifier());
print(new Parser('_na99_me_ age').parseIdentifier());
print(new Parser('_na99_me_ age').parseIdentifier());
print(new Parser('99').parseInteger());
print(new Parser('9978').parseInteger());
print(new Parser('997890e747').parseInteger());
print(new Parser('\t\t997890e747').parseWhitespaces());
print(new Parser(' \t997890e747').parseWhitespaces());
print(new Parser('     997890e747').parseWhitespaces());
// print(new Parser(' 997890e747').parseInteger());
// print(new Parser(' name').parseIdentifier());
// print(new Parser('').parseIdentifier());