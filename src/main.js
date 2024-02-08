import os from "os";
import { startREPL } from "./repl/repl.js";

function main() {
  const user = os.userInfo();
  console.log(
    `Hello ${user.username}! This is the Monkey programming language!`
  );
  console.log("Feel free to type in commands");
  startREPL();
}

main();
