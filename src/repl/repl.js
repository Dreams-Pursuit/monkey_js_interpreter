import readline from "readline";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "../parser/parser.js";
import { evaluate } from "../evaluator/evaluator.js";
import { Enviroment } from "../object/enviroment.js";
// import { TokenTypes } from "../token/token.js";

const PROMPT = ">> ";

export function startREPL() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
    terminal: false,
  });

  const env = new Enviroment();

  rl.on("line", (line) => {
    const lexer = new Lexer(line);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    if (parser.errors.length > 0) {
      printParserErrors(parser.errors);
      return;
    }

    const evaluated = evaluate(program, env);
    if (evaluated !== null) {
      console.log(evaluated.Inspect());
    }

    rl.prompt();
  });

  rl.on("close", () => {
    console.log("Have a great day!");
    process.exit(0);
  });

  rl.prompt();
}

function printParserErrors(errors) {
  console.log("\x1b[33m If you cannot write a program in Monkey, you are a monkey.\x1b[0m");
  for (const error of errors) {
    console.log(`\t${error}`);
  }
}
