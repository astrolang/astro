const readline = require('readline');
const { print } = require('../src/compiler/utils');
const Lexer = require('../src/compiler/syntax/lexer');

const astroASCIIDesign = `
_______________________________________
  ____ __  _____  _     __ ___  ______
 /  \x1b[35m__\x1b[0m'  |/ \x1b[35m____\x1b[0m|/ |___|  / \x1b[35m__\x1b[0m|/  \x1b[35m_\x1b[0m   |
|  /  |  |\x1b[35m__\x1b[0m \\__'   \x1b[35m__\x1b[0m/|   /  |  | |  |
|  \\__|  |__\\_  |  |___|  |   |  |_|  |
 \\\x1b[35m____\x1b[0m'\x1b[35m__\x1b[0m|\x1b[35m______\x1b[0m/\\\x1b[35m_____\x1b[0m|\x1b[35m__\x1b[0m|   |\x1b[35m_______\x1b[0m/
___________ \x1b[2m\x1b[39mtype ? for help\x1b[0m ___________
`;
const astroCodePrompt = '\x1b[1m\x1b[35m•••• \x1b[0m';
const astroHelpPrompt = '\x1b[1m\x1b[32m?••• \x1b[0m';

// Console Interface.
print(astroASCIIDesign);
const prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Recurring prompt
let shouldExit = false;

prompt.setPrompt(astroCodePrompt);
prompt.prompt();

prompt.on('line', (response) => {
    switch(response.trim()) {
        case 'exit':
            prompt.close();
            break;
        case '?':
            prompt.setPrompt(astroHelpPrompt);
            break;
        case ':':
            prompt.setPrompt(astroCodePrompt);
            break;
        default:
            const lexer = new Lexer(response);
            print(lexer.lex());
            print();
        break;
    }
    prompt.prompt();
}).on('close', () => {
    process.exit(0);
});
