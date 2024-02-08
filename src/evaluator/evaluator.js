import { IntegerLiteral, Program, ExpressionStatement } from "../ast/ast.js";

export function evaluate(node) {
  switch (node.type) {
  case Program:
    return evaluateStatements(node.statements);

  case ExpressionStatement:
    return evaluate(node.expression);

  case IntegerLiteral:
    return node.value;
  }

  return null;
}

function evaluateStatements(statements) {
  let result;
  for (const statement of statements) {
    result = evaluate(statement);
  }
  return result;
}
