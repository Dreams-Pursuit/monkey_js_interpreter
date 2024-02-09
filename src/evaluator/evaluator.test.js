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
