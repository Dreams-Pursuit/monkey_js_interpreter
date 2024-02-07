import test from "node:test";
import assert from "node:assert";

import { Lexer } from "../lexer/lexer.js";
import { Parser } from "./parser.js";

test("parser: test let statements", (t) => {
  const input = `let x = 5;
        let y = 10;
        let foobar = 838383;`;
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  checkParserErrors(t, parser);

  assert.strictEqual(program.statements.length, 3, `program.statements does not contain 3 statements. got=${program.statements.length}`);

  const tests = [
    "x",
    "y",
    "foobar"
  ];

  tests.forEach((test, index) => {
    const stmt = program.statements[index];
    testLetStatement(stmt, test);
  });
});

function testLetStatement(stmt, name) {
  assert.strictEqual(stmt.tokenLiteral(), "let", `s.TokenLiteral not 'let'. got=${stmt.tokenLiteral()}`);
  assert.strictEqual(stmt.name.value, name, `s.Name.Value not '${name}'. got=${stmt.name.value}`);
  assert.strictEqual(stmt.name.tokenLiteral(), name, `s.Name not '${name}'. got=${stmt.name}`);
}

function checkParserErrors(t, p) {
  if (p.errors.length === 0) {
    return;
  }
  console.error(`parser has ${p.errors.length} errors`);
  p.errors.forEach((error) => {
    assert.fail(`parser error: ${error}`);
  });
}

test("parser: test return statements", (t) => {
  const input = `return 5;
        return 10;
        return 993322;`;
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  checkParserErrors(t, parser);

  assert.strictEqual(program.statements.length, 3, `program.statements does not contain 3 statements. got=${program.statements.length}`);

  program.statements.forEach((stmt) => {

    assert.strictEqual(stmt.tokenLiteral(), "return", `s.TokenLiteral not 'return'. got=${stmt.tokenLiteral()}`);
  });
});


test("parser: test identifier expression", (t) => {
  const input = "foobar;";
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  checkParserErrors(t, parser);

  assert.strictEqual(program.statements.length, 1, `program has not enough statements. got=${program.statements.length}`);

  const stmt = program.statements[0];

  assert.strictEqual(stmt.String(), "foobar;", `s.String() wrong. got=${stmt.String()}`);
});