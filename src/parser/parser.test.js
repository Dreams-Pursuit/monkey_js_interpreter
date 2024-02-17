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

test("parser: test parsing prefix expressions", (t) => {
  const prefixTests = [
    { input: "!5;", operator: "!", value: 5 },
    { input: "-15;", operator: "-", value: 15 },
    { input: "!true;", operator: "!", value: true },
    { input: "!false;", operator: "!", value: false },
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
    { input: "true == true", leftValue: true, operator: "==", rightValue: true },
    { input: "true != false", leftValue: true, operator: "!=", rightValue: false },
    { input: "false == false", leftValue: false, operator: "==", rightValue: false },
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
    { input: "-a * b", expected: "((-a) * b)" },
    { input: "!-a", expected: "(!(-a))" },
    { input: "a + b + c", expected: "((a + b) + c)" },
    { input: "a + b - c", expected: "((a + b) - c)" },
    { input: "a * b * c", expected: "((a * b) * c)" },
    { input: "a * b / c", expected: "((a * b) / c)" },
    { input: "a + b / c", expected: "(a + (b / c))" },
    { input: "a + b * c + d / e - f", expected: "(((a + (b * c)) + (d / e)) - f)" },
    { input: "3 + 4; -5 * 5", expected: "(3 + 4)((-5) * 5)" },
    { input: "5 > 4 == 3 < 4", expected: "((5 > 4) == (3 < 4))" },
    { input: "5 < 4 != 3 > 4", expected: "((5 < 4) != (3 > 4))" },
    { input: "3 + 4 * 5 == 3 * 1 + 4 * 5", expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))" },
    { input: "true", expected: "true" },
    { input: "false", expected: "false" },
    { input: "3 > 5 == false", expected: "((3 > 5) == false)" },
    { input: "3 < 5 == true", expected: "((3 < 5) == true)" },
    { input: "1 + (2 + 3) + 4", expected: "((1 + (2 + 3)) + 4)" },
    { input: "(5 + 5) * 2", expected: "((5 + 5) * 2)" },
    { input: "2 / (5 + 5)", expected: "(2 / (5 + 5))" },
    { input: "-(5 + 5)", expected: "(-(5 + 5))" },
    { input: "!(true == true)", expected: "(!(true == true))" },
    { input: "a + add(b * c) + d", expected: "((a + add((b * c))) + d)" },
    { input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))", expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))" },
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


function testIntegralLiteral(t, il, value) {
  assert.strictEqual(+il.value, +value, `il.Value not ${value}. got=${il.value}`);
  assert.strictEqual(
    il.tokenLiteral(),
    `${value}`,
    `il.TokenLiteral not ${value}. got=${il.tokenLiteral()}`,
  );
}

function testIdentifier(t, exp, value) {
  assert.strictEqual(exp.value, value, `exp.Value not ${value}. got=${exp.value}`);
  assert.strictEqual(
    exp.tokenLiteral(),
    value,
    `exp.TokenLiteral not ${value}. got=${exp.tokenLiteral()}`,
  );
}

function testLiteralExpression(t, exp, expected) {
  switch (expected.type) {
  case "integer":
    testIntegralLiteral(t, exp, expected.value);
    break;
  case "identifier":
    testIdentifier(t, exp, expected.value);
    break;
  case "boolean":
    testBooleanLiteral(t, exp, expected.value);
    break;
  default:
    assert.fail(`type of exp not handled. got=${exp}`);
  }
}
function testInfixExpression(t, exp, left, operator, right) {
  assert.strictEqual(
    exp.operator,
    operator,
    `exp.Operator not '${operator}'. got=${exp.operator}`,
  );
  testLiteralExpression(t, exp.left, left);
  testLiteralExpression(t, exp.right, right);
}

function testBooleanLiteral(t, bl, value) {
  assert.strictEqual(bl.value, value, `bl.Value not ${value}. got=${bl.value}`);
  assert.strictEqual(
    bl.tokenLiteral(),
    `${value}`,
    `bl.TokenLiteral not ${value}. got=${bl.tokenLiteral()}`,
  );
}
test("parser: test boolean expression", (t) => {
  const input = "true;";
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
  const expression = stmt.expression;
  testBooleanLiteral(t, expression, true);
});

test("parser: test if expression", (t) => {
  const input = "if (x < y) { x }";
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
  const expression = stmt.expression;
  assert.strictEqual(
    expression.String(),
    "if (x < y) x",
    `expression.String() wrong. got=${expression.String()}`,
  );
});

test("parser: test if else expression", (t) => {
  const input = "if (x < y) { x } else { y }";
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
  const expression = stmt.expression;
  assert.strictEqual(
    expression.String(),
    "if (x < y) x else y",
    `expression.String() wrong. got=${expression.String()}`,
  );
});

test("parser: test function literal parsing", (t) => {
  const input = "fn(x, y) { x + y; }";
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
  const expression = stmt.expression;

  if (expression.parameters.length !== 2) {
    assert.fail(`function literal parameters wrong. want 2. got=${expression.parameters.length}`);
  }
  testLiteralExpression(t, expression.parameters[0], { type: "identifier", value: "x" });
  testLiteralExpression(t, expression.parameters[1], { type: "identifier", value: "y" });

  if (expression.body.statements.length !== 1) {
    assert.fail(`function literal body statements wrong. want 1. got=${expression.body.statements.length}`);
  }
  testInfixExpression(t, expression.body.statements[0].expression, { type: "identifier", value: "x" }, "+", { type: "identifier", value: "y" });
});

test("parser: test function parameter parsing", (t) => {
  const tests = [
    { input: "fn() {};", expectedParams: [] },
    { input: "fn(x) {};", expectedParams: ["x"] },
    { input: "fn(x, y, z) {};", expectedParams: ["x", "y", "z"] },
  ];

  tests.forEach((tt) => {
    const lexer = new Lexer(tt.input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    checkParserErrors(t, parser);

    const stmt = program.statements[0];
    const expression = stmt.expression;

    if (expression.parameters.length !== tt.expectedParams.length) {
      assert.fail(`length parameters wrong. want ${tt.expectedParams.length}. got=${expression.parameters.length}`);
    }
    tt.expectedParams.forEach((ident, index) => {
      testLiteralExpression(t, expression.parameters[index], { type: "identifier", value: ident });
    });
  });
});

test("parser: test call expression parsing", (t) => {
  const input = "add(1, 2 * 3, 4 + 5);";
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
  const expression = stmt.expression;

  testIdentifier(t, expression.function, "add");
  if (expression.arguments.length !== 3) {
    assert.fail(`wrong length of arguments. got=${expression.arguments.length}`);
  }
  testLiteralExpression(t, expression.arguments[0], { type: "integer", value: 1 });
  testInfixExpression(t, expression.arguments[1], { type: "integer", value: 2 }, "*", { type: "integer", value: 3 });
  testInfixExpression(t, expression.arguments[2], { type: "integer", value: 4 }, "+", { type: "integer", value: 5 });
});

test("parser: test string literal expression", (t) => {
  const input = "\"hello world\"";
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  checkParserErrors(t, parser);

  const stmt = program.statements[0];
  const literal = stmt.expression;
  assert.strictEqual(literal.value, "hello world", `literal.Value not "hello world". got=${literal.value}`);
});
