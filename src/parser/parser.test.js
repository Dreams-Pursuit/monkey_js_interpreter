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

  assert.strictEqual(
    program.statements.length,
    3,
    `program.statements does not contain 3 statements. got=${program.statements.length}`,
  );

  const tests = ["x", "y", "foobar"];

  tests.forEach((test, index) => {
    const stmt = program.statements[index];
    testLetStatement(stmt, test);
  });
});

function testLetStatement(stmt, name) {
  assert.strictEqual(
    stmt.tokenLiteral(),
    "let",
    `s.TokenLiteral not 'let'. got=${stmt.tokenLiteral()}`,
  );
  assert.strictEqual(
    stmt.name.value,
    name,
    `s.Name.Value not '${name}'. got=${stmt.name.value}`,
  );
  assert.strictEqual(
    stmt.name.tokenLiteral(),
    name,
    `s.Name not '${name}'. got=${stmt.name}`,
  );
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

  assert.strictEqual(
    program.statements.length,
    3,
    `program.statements does not contain 3 statements. got=${program.statements.length}`,
  );

  program.statements.forEach((stmt) => {
    assert.strictEqual(
      stmt.tokenLiteral(),
      "return",
      `s.TokenLiteral not 'return'. got=${stmt.tokenLiteral()}`,
    );
  });
});

test("parser: test identifier expression", (t) => {
  const input = "foobar;";
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  checkParserErrors(t, parser);

  assert.strictEqual(
    program.statements.length,
    1,
    `program has not enough statements. got=${program.statements.length}`,
  );

  const stmt = program.statements[0];

  assert.strictEqual(
    stmt.String(),
    "foobar",
    `s.String() wrong. got=${stmt.String()}`,
  );
});

test("parser: test integer expression", (t) => {
  const input = "5;";
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  checkParserErrors(t, parser);

  assert.strictEqual(
    program.statements.length,
    1,
    `program has not enough statements. got=${program.statements.length}`,
  );

  const stmt = program.statements[0];
  assert.strictEqual(
    stmt.String(),
    "5",
    `s.String() wrong. got=${stmt.String()}`,
  );
});

function testIntegralLiteral(t, il, value) {
  assert.strictEqual(il.value, value, `il.Value not ${value}. got=${il.value}`);
  assert.strictEqual(
    il.tokenLiteral(),
    `${value}`,
    `il.TokenLiteral not ${value}. got=${il.tokenLiteral()}`,
  );
}

test("parser: test parsing prefix expressions", (t) => {
  const prefixTests = [
    { input: "!5;", operator: "!", value: 5 },
    { input: "-15;", operator: "-", value: 15 },
  ];

  prefixTests.forEach((tt) => {
    const lexer = new Lexer(tt.input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(t, parser);

    assert.strictEqual(
      program.statements.length,
      1,
      `program has not enough statements. got=${program.statements.length}`,
    );

    const stmt = program.statements[0];
    assert.strictEqual(
      stmt.String(),
      `(${tt.operator}${tt.value})`,
      `s.String() wrong. got=${stmt.String()}`,
    );
  });
});

test("parser: test parsing infix expressions", (t) => {
  const infixTests = [
    { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
    { input: "5 - 5;", leftValue: 5, operator: "-", rightValue: 5 },
    { input: "5 * 5;", leftValue: 5, operator: "*", rightValue: 5 },
    { input: "5 / 5;", leftValue: 5, operator: "/", rightValue: 5 },
    { input: "5 > 5;", leftValue: 5, operator: ">", rightValue: 5 },
    { input: "5 < 5;", leftValue: 5, operator: "<", rightValue: 5 },
    { input: "5 == 5;", leftValue: 5, operator: "==", rightValue: 5 },
    { input: "5 != 5;", leftValue: 5, operator: "!=", rightValue: 5 },
  ];

  infixTests.forEach((tt) => {
    const lexer = new Lexer(tt.input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(t, parser);

    assert.strictEqual(
      program.statements.length,
      1,
      `program has not enough statements. got=${program.statements.length}`,
    );

    const stmt = program.statements[0];
    assert.strictEqual(
      stmt.String(),
      `(${tt.leftValue} ${tt.operator} ${tt.rightValue})`,
      `s.String() wrong. got=${stmt.String()}`,
    );
  });
});

test("parser: test operator precedence parsing", (t) => {
  const tests = [
    {
      input: "-a * b;",
      expected: "((-a) * b)",
    },
    {
      input: "!-a;",
      expected: "(!(-a))",
    },
    {
      input: "a + b + c;",
      expected: "((a + b) + c)",
    },
    {
      input: "a + b - c;",
      expected: "((a + b) - c)",
    },
    {
      input: "a * b * c;",
      expected: "((a * b) * c)",
    },
    {
      input: "a * b / c;",
      expected: "((a * b) / c)",
    },
    {
      input: "a + b / c;",
      expected: "(a + (b / c))",
    },
    {
      input: "a + b * c + d / e - f;",
      expected: "(((a + (b * c)) + (d / e)) - f)",
    },
    {
      input: "3 + 4; -5 * 5;",
      expected: "(3 + 4)((-5) * 5)",
    },
    {
      input: "5 > 4 == 3 < 4;",
      expected: "((5 > 4) == (3 < 4))",
    },
    {
      input: "5 < 4 != 3 > 4;",
      expected: "((5 < 4) != (3 > 4))",
    },
    {
      input: "3 + 4 * 5 == 3 * 1 + 4 * 5;",
      expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
    },
  ];

  tests.forEach((tt) => {
    const lexer = new Lexer(tt.input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(t, parser);

    assert.strictEqual(
      program.String(),
      tt.expected,
      `program.String() wrong. got=${program.String()}`,
    );
  });
});
