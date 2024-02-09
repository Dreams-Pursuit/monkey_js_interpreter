import {
  IntegerLiteral,
  Program,
  ExpressionStatement,
  Boolean,
  PrefixExpression,
  InfixExpression,
  BlockStatement,
  IfExpression,
} from "../ast/ast.js";
import { Integer, BooleanType, Null } from "../object/object.js";
import { ObjectTypeMap } from "../object/object.js";

const TRUE = new BooleanType(true);
const FALSE = new BooleanType(false);
const NULL = new Null();

export function evaluate(node) {

  let left, right;
  switch (node.constructor) {
  case Program:
    return evaluateStatements(node.statements);

  case ExpressionStatement:
    return evaluate(node.expression);

  case IntegerLiteral:
    return new Integer(node.value);

  case Boolean:
    return nativeBoolToBooleanObject(node.value);

  case PrefixExpression:
    right = evaluate(node.right);
    return evaluatePrefixExpression(node.operator, right);

  case InfixExpression:
    left = evaluate(node.left);
    right = evaluate(node.right);
    return evaluateInfixExpression(node.operator, left, right);
  case BlockStatement:
    return evaluateStatements(node.statements);
  case IfExpression:
    return evaluateIfExpression(node);
  }

  return null;
}


function evaluateIfExpression(ie) {
  const condition = evaluate(ie.condition);
  if (isError(condition)) return condition;
  if (isTruthy(condition)) return evaluate(ie.consequence);
  if (ie.alternative !== null) return evaluate(ie.alternative);
  return NULL;
}

function isError(obj) {
  if (obj !== null) return obj.Type() === ObjectTypeMap.ERROR;
  return false;
}

function isTruthy(obj) {
  if (obj === NULL) return false;
  if (obj === TRUE) return true;
  if (obj === FALSE) return false;
  return true;
}

function evaluateInfixExpression(operator, left, right) {
  if (left.Type() === ObjectTypeMap.INTEGER && right.Type() === ObjectTypeMap.INTEGER) {
    return evaluateIntegerInfixExpression(operator, left, right);
  }

  if (operator === "==") return nativeBoolToBooleanObject(left === right);
  if (operator === "!=") return nativeBoolToBooleanObject(left !== right);

  if (left.Type() !== right.Type()) return NULL;

  return NULL;
}

function evaluateIntegerInfixExpression(operator, left, right) {
  const leftVal = left.value;
  const rightVal = right.value;
  switch (operator) {
  case "+":
    return new Integer(leftVal + rightVal);
  case "-":
    return new Integer(leftVal - rightVal);
  case "*":
    return new Integer(leftVal * rightVal);
  case "/":
    return new Integer(leftVal / rightVal);
  case "<":
    return nativeBoolToBooleanObject(leftVal < rightVal);
  case ">":
    return nativeBoolToBooleanObject(leftVal > rightVal);
  case "==":
    return nativeBoolToBooleanObject(leftVal === rightVal);
  case "!=":
    return nativeBoolToBooleanObject(leftVal !== rightVal);
  default:
    return NULL;
  }
}

function evaluatePrefixExpression(operator, right) {
  switch (operator) {
  case "!":
    return evaluateBangOperatorExpression(right);
  case "-":
    return evaluateMinusPrefixOperatorExpression(right);
  default:
    return NULL;
  }
}

function evaluateBangOperatorExpression(right) {
  if (right === TRUE) return FALSE;
  if (right === FALSE) return TRUE;
  if (right === NULL) return TRUE;
  return FALSE;
}

function evaluateMinusPrefixOperatorExpression(right) {
  if (right.Type() !== ObjectTypeMap.INTEGER) return NULL;
  const value = right.value;
  return new Integer(-value);
}
function evaluateStatements(statements) {
  let result;
  for (const statement of statements) {
    result = evaluate(statement);
  }
  return result;
}

function nativeBoolToBooleanObject(input) {
  return input ? TRUE : FALSE;
}
