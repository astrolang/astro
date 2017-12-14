import peg from 'pegjs';
import { print } from '../utils';

class Parser {
  constructor(grammar) {
    this.parser = null;
    try {
      this.parser = peg.generate(grammar);
      print("== Parser Generated Successfully! ==");
    } catch(err) {
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
    try {
      this.parser = peg.generate(grammar);
      print("== Parser Generated Successfully! ==");
      return this.parser;
    } catch(err) {
      print(`Error!: ${err.message}`);
      print(err.location);
    }
  }

  /**
   * Parses astro code
   * @param {string} code - Astro source code
   * @return {object} The generated abstract syntax tree
   */
  parse(code) {
    try {
      const result = parser.parse(code);
      print("== Code Parsed Successfully! ==");
      return result;
    }
    catch (err) {
      print(`Error!: ${err.message}`);
      print(err.location);
    }
  }
}

export default Parser;