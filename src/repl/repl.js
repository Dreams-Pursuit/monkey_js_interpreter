import readline from "readline";
import { New } from "../lexer/lexer.js";
import { TokenTypes } from "../token/token.js";

const PROMPT = ">> ";

export function startREPL() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT
  });

  rl.on("line", (line) => {
    const lexer = New(line);
    console.log("LINE: ", line);
    let tok;
    do {
      tok = lexer.nextToken();
      console.log(JSON.stringify(tok));
    } while (tok.tokenType !== TokenTypes.EOF && tok.tokenType !== TokenTypes.ILLEGAL);

    rl.prompt();
  });

  rl.on("close", () => {
    console.log("Have a great day!");
    process.exit(0);
  });

  rl.prompt();
}

