import test from "node:test";
import assert from "node:assert";
import { TokenTypes } from "../token/token.js";
import { Program, LetStatement, Identifier } from "./ast.js";

test("ast: testString", (t) => {
  const program = new Program();
  const letStatement = new LetStatement(
    new Token(TokenTypes.LET, "let"),
    new Identifier(new Token(TokenTypes.IDENT, "myVar"), "myVar"),
    new Identifier(new Token(TokenTypes.IDENT, "anotherVar"), "anotherVar"),
  );
  program.statements.push(letStatement);

  assert.strictEqual(
    program.String(),
    "let myVar = anotherVar;",
    `program.String() wrong. got=${program.String()}`,
  );
});
