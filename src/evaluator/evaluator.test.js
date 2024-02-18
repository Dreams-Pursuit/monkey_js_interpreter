import test from "node:test";
import assert from "node:assert";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "../parser/parser.js";
import { evaluate } from "./evaluator.js";
import { ObjectTypeMap } from "../object/object.js";
import { Enviroment } from "../object/enviroment.js";
import { String, BooleanType, Integer, Null } from "../object/object.js";

const TRUE = new BooleanType(true);
const FALSE = new BooleanType(false);
const NULL = new Null();

test("evaluator: integer expression", () => {
  const tests = [
    ["5", 5],
    ["10", 10],
    ["-5", -5],
    ["-10", -10],
    ["5 + 5 + 5 + 5 - 10", 10],
    ["2 * 2 * 2 * 2 * 2", 32],
    ["-50 + 100 + -50", 0],
    ["5 * 2 + 10", 20],
    ["5 + 2 * 10", 25],
    ["20 + 2 * -10", 0],
    ["50 / 2 * 2 + 10", 60],
    ["2 * (5 + 10)", 30],
    ["3 * 3 * 3 + 10", 37],
    ["3 * (3 * 3) + 10", 37],
    ["(5 + 10 * 2 + 15 / 3) * 2 + -10", 50],
  ];

  for (const [input, expected] of tests) {
    const evaluated = testEval(input);
    // console.log(evaluated);
    testIntegerObject(evaluated, expected);
  }
});

function testEval(input) {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  const env = new Enviroment();

  return evaluate(program, env);
}

function testIntegerObject(obj, expected) {
  assert.strictEqual(obj.Type(), ObjectTypeMap.INTEGER);
  assert.strictEqual(obj.value, expected);
}
test("evaluator: boolean expression", () => {
  const tests = [
    ["true", true],
    ["false", false],
    ["1 < 2", true],
    ["1 > 2", false],
    ["1 < 1", false],
    ["1 > 1", false],
    ["1 == 1", true],
    ["1 != 1", false],
    ["1 == 2", false],
    ["1 != 2", true],
    ["true == true", true],
    ["false == false", true],
    ["true == false", false],
    ["true != false", true],
    ["false != true", true],
    ["(1 < 2) == true", true],
    ["(1 < 2) == false", false],
    ["(1 > 2) == true", false],
    ["(1 > 2) == false", true],
  ];

  for (const [input, expected] of tests) {
    const evaluated = testEval(input);
    testBooleanObject(evaluated, expected);
  }
});

function testBooleanObject(obj, expected) {
  assert.strictEqual(obj.Type(), ObjectTypeMap.BOOLEAN);
  assert.strictEqual(obj.value, expected);
}

test("evaluator: bang operator", () => {
  const tests = [
    ["!true", false],
    ["!false", true],
    ["!5", false],
    ["!!true", true],
    ["!!false", false],
    ["!!5", true],
  ];

  for (const [input, expected] of tests) {
    const evaluated = testEval(input);
    testBooleanObject(evaluated, expected);
  }
});

test("evaluator: if else expressions", () => {
  const tests = [
    ["if (true) { 10 }", 10],
    ["if (false) { 10 }", null],
    ["if (1) { 10 }", 10],
    ["if (1 < 2) { 10 }", 10],
    ["if (1 > 2) { 10 }", null],
    ["if (1 > 2) { 10 } else { 20 }", 20],
    ["if (1 < 2) { 10 } else { 20 }", 10],
  ];

  for (const [input, expected] of tests) {
    const evaluated = testEval(input);
    if (expected === null) {
      testNullObject(evaluated);
    } else {
      testIntegerObject(evaluated, expected);
    }
  }
});

function testNullObject(obj) {
  if (obj !== null) assert.strictEqual(obj.Type(), ObjectTypeMap.NULL);
}

test("evaluator: return statements", () => {
  const tests = [
    ["return 10;", 10],
    ["return 10; 9;", 10],
    ["return 2 * 5; 9;", 10],
    ["9; return 2 * 5; 9;", 10],
    ["if (10 > 1) { if (10 > 1) { return 10; } return 1; }", 10],
  ];

  for (const [input, expected] of tests) {
    const evaluated = testEval(input);
    testIntegerObject(evaluated, expected);
  }
});

test("evaluator: error handling", () => {
  const tests = [
    ["5 + true;", "type mismatch: INTEGER + BOOLEAN"],
    ["5 + true; 5;", "type mismatch: INTEGER + BOOLEAN"],
    ["-true", "unknown operator: -BOOLEAN"],
    ["true + false;", "unknown operator: BOOLEAN + BOOLEAN"],
    ["5; true + false; 5", "unknown operator: BOOLEAN + BOOLEAN"],
    ["if (10 > 1) { true + false; }", "unknown operator: BOOLEAN + BOOLEAN"],
    ["if (10 > 1) { if (10 > 1) { return true + false; } return 1; }", "unknown operator: BOOLEAN + BOOLEAN"],
    ["foobar", "identifier not found: foobar"],
    ["\"hello\" - \"world\"", "unknown operator: STRING - STRING"],
    // ["{\"name\": \"Monkey\"}[fn(x) { x }];", "unusable as hash key: FUNCTION"],
  ];

  for (const [input, expected] of tests) {
    const evaluated = testEval(input);
    if (evaluated !== null) {
      assert.strictEqual(evaluated.Type(), ObjectTypeMap.ERROR);
      assert.strictEqual(evaluated.message, expected);
    }
  }
});

test("evaluator: let statements", () => {
  const tests = [
    ["let a = 5; a;", 5],
    ["let a = 5 * 5; a;", 25],
    ["let a = 5; let b = a; b;", 5],
    ["let a = 5; let b = a; let c = a + b + 5; c;", 15],
  ];

  for (const [input, expected] of tests) {
    testIntegerObject(testEval(input), expected);
  }
});

test("evaluator: function object", () => {
  const input = "fn(x) { x + 2; };";
  const evaluated = testEval(input);
  assert.strictEqual(evaluated.parameters.length, 1);
  assert.strictEqual(evaluated.parameters[0].value, "x");
  assert.strictEqual(evaluated.body.statements.length, 1);
  assert.strictEqual(evaluated.body.String(), "(x + 2)");
});

test("evaluator: function application", () => {
  const tests = [
    ["let identity = fn(x) { x; }; identity(5);", 5],
    ["let identity = fn(x) { return x; }; identity(5);", 5],
    ["let double = fn(x) { x * 2; }; double(5);", 10],
    ["let add = fn(x, y) { x + y; }; add(5, 5);", 10],
    ["let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));", 20],
    ["fn(x) { x; }(5)", 5],
  ];

  for (const [input, expected] of tests) {
    testIntegerObject(testEval(input), expected);
  }
});

test("evaluator: closures", () => {
  const input = `
  let newAdder = fn(x) {
    fn(y) { x + y };
  };
  let addTwo = newAdder(2);
  addTwo(2);
  `;
  testIntegerObject(testEval(input), 4);
});

test("evaluator: string literal", () => {
  const input = "\"hello world!\"";
  const evaluated = testEval(input);
  assert.strictEqual(evaluated.Type(), ObjectTypeMap.STRING);
});

test("evaluator: string concatenation", () => {
  const input = "\"hello\" + \" \" + \"world!\"";
  const evaluated = testEval(input);
  assert.strictEqual(evaluated.Type(), ObjectTypeMap.STRING);
  assert.strictEqual(evaluated.value, "hello world!");
});

test("evaluator: builtin functions", () => {
  const tests = [
    ["len(\"\")", 0],
    ["len(\"four\")", 4],
    ["len(\"hello world\")", 11],
    ["len(1)", "argument to `len` not supported, got INTEGER"],
    ["len(\"one\", \"two\")", "wrong number of arguments. got=2, want=1"],
  ];

  for (const [input, expected] of tests) {
    const evaluated = testEval(input);
    if (typeof expected === "number") {
      testIntegerObject(evaluated, expected);
    } else {
      assert.strictEqual(evaluated.Type(), ObjectTypeMap.ERROR);
      assert.strictEqual(evaluated.message, expected);
    }
  }
});

test("evaluator: array literals", () => {
  const input = "[1, 2 * 2, 3 + 3]";
  console.log("array literal");
  const evaluated = testEval(input);

  assert.strictEqual(evaluated.elements.length, 3);
  testIntegerObject(evaluated.elements[0], 1);
  testIntegerObject(evaluated.elements[1], 4);
  testIntegerObject(evaluated.elements[2], 6);
});

test("evaluator: array index expressions", () => {
  const tests = [
    ["[1, 2, 3][0]", 1],
    ["[1, 2, 3][1]", 2],
    ["[1, 2, 3][2]", 3],
    ["let i = 0; [1][i];", 1],
    ["[1, 2, 3][1 + 1];", 3],
    ["let myArray = [1, 2, 3]; myArray[2];", 3],
    ["let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];", 6],
    ["let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]", 2],
    ["[1, 2, 3][3]", null],
    ["[1, 2, 3][-1]", null],
  ];

  for (const [input, expected] of tests) {
    const evaluated = testEval(input);
    if (expected === null) {
      testNullObject(evaluated);
    } else {
      testIntegerObject(evaluated, expected);
    }
  }
});

test("evaluator: hash literals", () => {
  const input = "{\"one\": 10, \"two\": 10 * 2, \"three\": 10 + 2}";
  const evaluated = testEval(input);
  const expected = new Map();
  expected.set(new String("one").HashKey().value, [new String("one"), new Integer(10)]);
  expected.set(new String("two").HashKey().value, [new String("two"), new Integer(20)]);
  expected.set(new String("three").HashKey().value, [new String("three"), new Integer(12)]);
  assert.strictEqual(evaluated.pairs.size, 3);
  for (const [expectedKey, expectedValue] of expected) {
    const pair = evaluated.pairs.get(expectedKey);
    assert.strictEqual(pair[0].value, expectedValue[0].value);
    testIntegerObject(pair[1], expectedValue[1].value);
  }
});
test("evaluator: hash index expressions", () => {
  const tests = [
    ["{\"foo\": 5}[\"foo\"]", 5],
    ["{\"foo\": 5}[\"bar\"]", null],
    ["let key = \"foo\"; {\"foo\": 5}[key]", 5],
    ["{}[\"foo\"]", null],
    ["{5: 5}[5]", 5],
    ["{true: 5}[true]", 5],
    ["{false: 5}[false]", 5],
  ];
  for (const [input, expected] of tests) {
    const evaluated = testEval(input);
    if (expected === null) {
      testNullObject(evaluated);
    } else {
      testIntegerObject(evaluated, expected);
    }
  }
});
