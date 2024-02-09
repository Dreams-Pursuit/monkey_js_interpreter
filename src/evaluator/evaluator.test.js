import test from "node:test";
import assert from "node:assert";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "../parser/parser.js";
import { evaluate } from "./evaluator.js";
import { ObjectTypeMap } from "../object/object.js";

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
  return evaluate(program);
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
    console.log(evaluated);
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
  ];

  for (const [input, expected] of tests) {
    const evaluated = testEval(input);
    if (evaluated !== null) {
      console.log(evaluated);
      assert.strictEqual(evaluated.Type(), ObjectTypeMap.ERROR);
      assert.strictEqual(evaluated.message, expected);
    }
  }
});
