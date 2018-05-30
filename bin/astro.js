#!/usr/bin/env node

const { print, keyToUnicode } = require('../src/compiler/utils');
const Lexer = require('../src/compiler/syntax/lexer');
const { Parser } = require('../src/compiler/syntax/parser');

// PROBLEM
// Bug when left is pressed two or more times and backspace is pressed

// DESIGNS
const astroVersion = '0.1.14';

const astroCodePrompt = '\x1b[1m\x1b[35m•••• \x1b[0m';
const astroHelpPrompt = '\x1b[1m\x1b[32m?••• \x1b[0m';

const commandlineInfo = {
  banner: (mode) => {
    const lexerModeBanner = '_ LEXER ';
    const parserModeBanner = ' PARSER ';
    const codeModeBanner = '________';

    let modeBanner = parserModeBanner;

    if (mode === 'lexer') modeBanner = lexerModeBanner;
    else if (mode === 'parser') modeBanner = parserModeBanner;

    return `
\x1b[2m\x1b[39m_ ${astroVersion} _____________________${modeBanner}_\x1b[0m
  ____ __  _____  _     __ ___  ______
 /  \x1b[35m__\x1b[0m'  |/ \x1b[35m____\x1b[0m|/ |___|  / \x1b[35m__\x1b[0m|/  \x1b[35m_\x1b[0m   |
|  /  |  |\x1b[35m__\x1b[0m \\__'   \x1b[35m__\x1b[0m/|   /  |  | |  |
|  \\__|  |__\\_  |  |___|  |   |  |_|  |
 \\\x1b[35m____\x1b[0m'\x1b[35m__\x1b[0m|\x1b[35m______\x1b[0m/\\\x1b[35m_____\x1b[0m|\x1b[35m__\x1b[0m|   |\x1b[35m_______\x1b[0m/
\x1b[2m\x1b[39m___________________ type \`?\` for help _\x1b[0m\n\n`;
  },
  help: `
  \x1b[47m\x1b[30m USAGE \x1b[0m
    astro \x1b[36m[options]\x1b[0m \x1b[36m[file]\x1b[0m

  \x1b[47m\x1b[30m OPTIONS \x1b[0m
    -h, --help                Print this message
    -v, --version             Display version information
    -q, --quiet               Start the REPL without the astro banner
    -e, --evaluate            Evaluate string and show the output
    -c, --compile             Compile an astro file to native code
    -j, --jit                 Interpret an astro file using the JIT compiler
    -o, --optimize:{0|1|2|3}  Set the optimization level
    -p, --phase:{lexer|parser}
                              Show the output of a chosen compilation phase
    -t, --target:{wasm|x86|arm|llvmir}
                              Compile an astro file to the specified target representation

  \x1b[47m\x1b[30m EXAMPLES \x1b[0m
    astro                     Starts the REPL
    astro -h                  Shows this help message
    astro --version           Shows the astro version you are running
    astro \x1b[36msample.ast\x1b[0m          Compiles the file \`sample.ast\` to native code and runs it
    astro -e \x1b[36m'print "hello"'\x1b[0m  Evaluates the string as astro code and prints the result out
    astro \x1b[36msample.ast\x1b[0m --target:wasm
                              Compiles the file \`sample.ast\` to webassembly code
    astro \x1b[36msample.ast\x1b[0m --optimize:3
                              Compiles the file \`sample.ast\` using the highest level of optimization\n\n`,
  version: `Astro ${astroVersion}\n`,
  notSupported: `
  Those commandline arguments are currently not supported.
  Astro is still under development. You can check on it later.\n\n`,
};

// LOGIC
const { stdin, stdout } = process;
const args = process.argv.slice(2);
// Raw mode gets rid of standard keypress events and other
stdin.setRawMode(true);
// We don't want binary, UTF-8 it is.
stdin.setEncoding('utf8');

class AstroPrompt {
  constructor() {
    // Current prompt mode.
    this.currentPrompt = astroCodePrompt;

    // This keeps the data on each line in a buffer.
    this.lineBuffer = '';
    this.cursorInMiddle = false;
    this.cursorPosition = -1;
  }

  startCommandline() {
    if (args.length === 0) {
      this.run('lexer');
    } else {
      if (args[0] === '-h' || args[0] === '--help') {
        stdout.write(commandlineInfo.help);
      } else if (args[0] === '-v' || args[0] === '--version') {
        stdout.write(commandlineInfo.version);
      } else if (args[0] === '--phase:lexer' || args[0] === '-p:lexer' || args[0] === '-q' || args[0] === '--quiet') {
        this.run('lexer');
      } else if (args[0] === '--phase:parser' || args[0] === '-p:parser') {
        this.run('parser');
      } else {
        stdout.write(commandlineInfo.notSupported);
      }
    }
  };

  run(phase) {
    // Check if there is no quiet flag passed
    if (args.indexOf('-q') < 0 && args.indexOf('--quiet') < 0) {
      // Print Astro banner design.
      stdout.write(commandlineInfo.banner(phase));
    }

    stdout.clearLine();  // Clear current text.
    stdout.cursorTo(0);  // Move cursor to beginning of line.
    // Print Astro code prompt.
    stdout.write(`${this.currentPrompt}`);

    // On any data into stdin
    stdin.on('data', (data) => {
      //== Ctrl + Z pressed.
      if (data === '\u001A') {
        // Exit program.
        stdout.write('\n');
        process.exit();
      //== Ctrl + C key pressed.
      } else if (data === '\u0003') {
        stdout.write('^C\n');
        this.resetPrompt(); // Reset prompt.
      //== Enter key pressed.
      } else if (data === '\u000D') {
        // Check for exit input.
        this.exited(this.lineBuffer);
        stdout.write('\n');

        // Show relevant output based on chosen phase.
        if (phase === 'lexer') {
          this.showLexedInput();
        } else if (phase === 'parser') {
          this.showParsedInput();
        }

        this.resetPrompt(); // Reset prompt.
        this.lineBuffer = '';
      //== Backspace key pressed.
      } else if (data === '\u007F') {
        // If cursor hasn't reached the beginning of text.
        if (this.cursorPosition !== 0) {
          if (this.cursorInMiddle) {
            // Steps back
            const stepsBack = this.lineBuffer.length - this.cursorPosition;

            // Update lineBuffer by removing data at the position where cursor is.
            this.lineBuffer = this.lineBuffer.slice(0, this.cursorPosition - 1) + this.lineBuffer.slice(this.cursorPosition, this.lineBuffer.length);

            stdout.clearLine();  // Clear current text.
            stdout.cursorTo(0);  // Move cursor to beginning of line.

            // Print prompt.
            stdout.write(this.currentPrompt);
            // Print line content.
            stdout.write(this.lineBuffer)
            // Move the cursor back to where the new data was inserted.
            stdout.write(`\u001b[${stepsBack}D`);

            // Update cursor position so that it will be on previous column.
            this.cursorPosition -= 1;
          } else {
            this.lineBuffer = this.lineBuffer.slice(0, -1);
            stdout.clearLine();  // Clear current text.
            stdout.cursorTo(0);  // Move cursor to beginning of line.
            stdout.write(this.currentPrompt);
            stdout.write(this.lineBuffer);
          }
        }
      //== Right key pressed.
      } else if (data === '\u001b[C') {
        if (this.cursorInMiddle) {
          this.cursorPosition += 1;
          // If cursor has reached the end of text.
          if (this.cursorPosition === this.lineBuffer.length) {
            this.cursorInMiddle = false;
            this.cursorPosition = -1;
          }
          stdout.write(`${data}`); // Write current data out.
        }
      //== Left key pressed.
      } else if (data === '\u001b[D') {
        if (!this.cursorInMiddle) {
          // Do something only if there is text on line.
          if (this.lineBuffer.length > 0) {
            this.cursorPosition = this.lineBuffer.length - 1;
            this.cursorInMiddle = true;
            stdout.write(`${data}`); // Write current data out.
          }
        } else if (this.cursorPosition === 0) {
          // Do nothing.
        } else {
          this.cursorPosition -= 1;
          stdout.write(`${data}`); // Write current data out.
        }
      //== Tab key pressed.
      // TODO: Use for autocomplete.
      } else if (data === '\u0009') {
        // Do nothing.
      //== Up, down, Ctrl + K, Shift + {Up|Down|Right|Left}  key pressed.
      } else if (
        data === '\u001b[A' ||
        data === '\u001b[B' ||
        data === '\u000B' ||
        data === '\u001B\u005B\u0031\u003B\u0032\u0041' ||
        data === '\u001B\u005B\u0031\u003B\u0032\u0042' ||
        data === '\u001B\u005B\u0031\u003B\u0032\u0043' ||
        data === '\u001B\u005B\u0031\u003B\u0032\u0044'
      ) {
        // Do nothing.
      //== Other keys pressed.
      } else {
        // DEV NOTE: If cursor is in the middle, we need to update the cursor position ourself
        // and insert new data into the right place in lineBuffer.
        if (this.cursorInMiddle) {
          // Update lineBuffer by inserting new data at the position where cursor is.
          this.lineBuffer = this.lineBuffer.slice(0, this.cursorPosition) + data + this.lineBuffer.slice(this.cursorPosition, this.lineBuffer.length);

          stdout.clearLine();  // Clear current text.
          stdout.cursorTo(0);  // Move cursor to beginning of line.

          // Print prompt.
          stdout.write(this.currentPrompt);
          // Print line content.
          stdout.write(this.lineBuffer)
          // Move the cursor back to where the new data was inserted.
          stdout.write(`\u001b[${this.lineBuffer.length - this.cursorPosition - 1}D`);

          // Update cursor position so that it will point on next column.
          this.cursorPosition += 1;
        } else {
          this.lineBuffer += data; // Keep data in lineBuffer.
          // Check for mode switch.
          if (!this.modeSwitch(this.lineBuffer)) {
            stdout.write(`${data}`); // Write current data out.
          } else {
            this.lineBuffer = '';
          }
        }
      }
    });
  }

  resetPrompt() {
    // Reset state.
    this.lineBuffer = '';
    this.cursorInMiddle = false;
    this.cursorPosition = -1;

    if (this.lineBuffer !== '') stdout.write('\n');
    // Show the prompt.
    stdout.write(`${astroCodePrompt}`);

  };

  showLexedInput() {
    if (this.lineBuffer !== '') {
      print(new Lexer(this.lineBuffer).lex());
      stdout.write('\n');
    }
  };


  showParsedInput() {
    if (this.lineBuffer !== '') {
      const tokens = new Lexer(this.lineBuffer).lex();
      print(new Parser(tokens).parse());
      stdout.write('\n');
    }
  };

  exited() {
    if (this.lineBuffer.trim() === 'exit') {
      stdout.write('\n');
      process.exit();
    }
  };

  modeSwitch() {
    if (this.lineBuffer === '?') {
      stdout.clearLine();  // Clear current text.
      stdout.cursorTo(0);  // Move cursor to beginning of line.
      stdout.write(astroHelpPrompt);
      return true;
    }
    return false;
  };
}

new AstroPrompt().startCommandline();
