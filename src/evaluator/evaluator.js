import {
  IntegerLiteral,
  Program,
  ExpressionStatement,
  Boolean,
  PrefixExpression,
  InfixExpression,
  BlockStatement,
  IfExpression,
  ReturnStatement,
  LetStatement,
  Identifier,
  FunctionLiteral,
  CallExpression,
  StringLiteral,
} from "../ast/ast.js";
import { Integer, BooleanType, Null, ReturnValue, ErrorN, Function, String, Builtin } from "../object/object.js";
import { Enviroment } from "../object/enviroment.js";
import { ObjectTypeMap } from "../object/object.js";
import { builtins } from "./builtins.js";

const TRUE = new BooleanType(true);
const FALSE = new BooleanType(false);
const NULL = new Null();

export function evaluate(node, env = new Enviroment()) {

  let left, right, val;
  let func, args;
  switch (node.constructor) {
  case Program:
    return evalProgram(node, env);

  case ExpressionStatement:
    return evaluate(node.expression, env);

  case IntegerLiteral:
    return new Integer(node.value);

  case Boolean:
    return nativeBoolToBooleanObject(node.value);

  case PrefixExpression:
    right = evaluate(node.right, env);
    if (isError(right)) return right;
    return evaluatePrefixExpression(node.operator, right);

  case InfixExpression:
    left = evaluate(node.left, env);
    right = evaluate(node.right, env);
    if (isError(left)) return left;
    if (isError(right)) return right;
    return evaluateInfixExpression(node.operator, left, right);

  case BlockStatement:
    return evalBlockStatement(node, env);

  case IfExpression:
    return evaluateIfExpression(node, env);

  case ReturnStatement:
    val = evaluate(node.returnValue, env);
    if (isError(val)) return val;
    return new ReturnValue(val);

  case LetStatement:
    val = evaluate(node.value, env);
    if (isError(val)) return val;
    env.set(node.name.value, val);
    return NULL;

  case Identifier:
    return evalIdentifier(node, env);

  case FunctionLiteral:
    return new Function(node.parameters, node.body, env);

  case CallExpression:
    func = evaluate(node.function, env);
    if (isError(func)) return func;
    args = evalExpressions(node.arguments, env);
    if (args.length === 1 && isError(args[0])) return args[0];
    return applyFunction(func, args);
  case StringLiteral:
    return new String(node.value);
  }

  return NULL;
}

function applyFunction(fn, args) {
  let extendedEnv, evaluated;
  switch (fn.constructor) {
  case Function:
    extendedEnv = extendFunctionEnv(fn, args);
    evaluated = evaluate(fn.body, extendedEnv);
    return unwrapReturnValue(evaluated);
  case Builtin:
    return fn.fn(...args);
  case ReturnValue:
    return fn.value;
  default:
    return new ErrorN(`not a function: ${fn.Type()}`);
  }
}

function extendFunctionEnv(fn, args) {
  const env = new Enviroment(fn.env);
  for (let i = 0; i < fn.parameters.length; i++) {
    env.set(fn.parameters[i].value, args[i]);
  }
  return env;
}

function unwrapReturnValue(obj) {
  if (obj.constructor === ReturnValue) return obj.value;
  return obj;
}

function evalExpressions(exps, env) {
  const result = [];
  for (const e of exps) {
    const evaluated = evaluate(e, env);
    if (isError(evaluated)) return [evaluated];
    result.push(evaluated);
  }
  return result;
}

function evalIdentifier(node, env) {
  const val = env.get(node.value);
  if (val !== undefined) return val;
  if (builtins[node.value] !== undefined) return builtins[node.value];
  return new ErrorN(`identifier not found: ${node.value}`);
}

function evalBlockStatement(block, env) {
  let result;
  for (const statement of block.statements) {
    result = evaluate(statement, env);

    if (result !== null) {
      const type = result.Type();
      if (type === ObjectTypeMap.RETURN_VALUE || type === ObjectTypeMap.ERROR) return result;
    }
  }
  return result;
}

function evalProgram(program, env) {
  let result;
  for (const statement of program.statements) {
    result = evaluate(statement, env);
    switch (result.Type()) {
    case ObjectTypeMap.RETURN_VALUE:
      return result.value;
    case ObjectTypeMap.ERROR:
      return result;
    }
  }
  return result;
}
function evaluateStringInfixExpression(operator, left, right) {
  if (operator !== "+") return new ErrorN(`unknown operator: ${left.Type()} ${operator} ${right.Type()}`);
  return new String(left.value + right.value);
}
function evaluateIfExpression(ie, env) {
  const condition = evaluate(ie.condition, env);
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

  if (left.Type() !== right.Type()) return new ErrorN(`type mismatch: ${left.Type()} ${operator} ${right.Type()}`);
  if (left.Type() === ObjectTypeMap.STRING && right.Type() === ObjectTypeMap.STRING) {
    return evaluateStringInfixExpression(operator, left, right);
  }

  return new ErrorN(`unknown operator: ${left.Type()} ${operator} ${right.Type()}`);
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
    return new ErrorN(`unknown operator: ${left.Type()} ${operator} ${right.Type()}`);
  }
}

function evaluatePrefixExpression(operator, right) {
  switch (operator) {
  case "!":
    return evaluateBangOperatorExpression(right);
  case "-":
    return evaluateMinusPrefixOperatorExpression(right);
  default:
    return new ErrorN(`unknown operator: ${operator}${right.Type()}`);
  }
}

function evaluateBangOperatorExpression(right) {
  if (right === TRUE) return FALSE;
  if (right === FALSE) return TRUE;
  if (right === NULL) return TRUE;
  return FALSE;
}

function evaluateMinusPrefixOperatorExpression(right) {
  if (right.Type() !== ObjectTypeMap.INTEGER) return new ErrorN(`unknown operator: -${right.Type()}`);
  const value = right.value;
  return new Integer(-value);
}

function nativeBoolToBooleanObject(input) {
  return input ? TRUE : FALSE;
}
