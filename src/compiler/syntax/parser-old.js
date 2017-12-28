import peg from 'pegjs';
import { print } from '../utils';

class Parser {
  /**
   * Creates a new parser object
   * @param {string} grammar - The language's pegjs grammar
   */
  constructor(grammar) {
    if (!grammar && typeof (grammar) !== 'string') {
      throw new Error('Expected argument to be string!');
    }
    this.parser = null;
    try {
      this.parser = peg.generate(grammar);
      print('== Parser Generated Successfully! ==');
    } catch (err) {
      print(`Error!: ${err.message}`);
      print(err.location);
    }
  }

  /**
   * Generates a parser object from input pegjs grammar
   * @param {string} grammar - The language's pegjs grammar
   * @return {object} The generated parser object
   */
  generate(grammar) {
    if (!grammar && typeof (grammar) !== 'string') {
      throw new Error('Expected argument to be string!');
    }
    this.parser = null;
    try {
      this.parser = peg.generate(grammar);
      print('== Parser Generated Successfully! ==');
    } catch (err) {
      print(`Error!: ${err.message}`);
      print(err.location);
    }
    return this.parser;
  }

  /**
   * Parses astro code
   * @param {string} code - Astro source code
   * @return {object} The generated abstract syntax tree
   */
  parse(code) {
    if (!code && typeof (code) !== 'string') {
      throw new Error('Expected argument to be string!');
    }
    let result = null;
    try {
      result = this.parser.parse(code);
      print('== Code Parsed Successfully! ==');
    } catch (err) {
      print(`Error!: ${err.message}`);
      print(err.location);
    }
    return result;
  }

  /**
   * Returns the string representation of the parser object
   * @return {object} The generated parser object
   */
  toString() {
    return JSON.stringify(this.parser, null, 2);
  }
}

export default Parser;
