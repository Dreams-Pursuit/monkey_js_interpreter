export class Node {
  /* @returns {string}*/
  tokenLiteral() {
    throw new Error("not implemented");
  }
  String() {
    throw new Error("not implemented");
  }
}

class Statement {
  statementNode() {
    throw new Error("not implemented");
  }
}

class Expression {
  expressionNode() {
    throw new Error("not implemented");
  }
}

export class Program {
  /* @param Statement[] */
  constructor(statements = []) {
    this.statements = statements;
  }

  /* @returns {string} */
  tokenLiteral() {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    }
    return "";
  }

  String() {
    let out = "";
    this.statements.forEach((s) => {
      out += s.String();
    });
    return out;
  }
}

export class ExpressionStatement extends Statement {
  constructor(t = null, e = null) {
    super();
    this.token = t;
    this.expression = e;
  }
  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  String() {
    if (this.expression !== null) {
      return this.expression.String();
    }
    return "";
  }
}

export class LetStatement extends Statement {
  constructor(t = null, n = null, v = null) {
    super();
    this.token = t;
    this.name = n;
    this.value = v;
  }
  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }

  String() {
    let out = `${this.tokenLiteral()} ${this.name.String()} = `;
    if (this.value !== null) {
      out += this.value.String();
    }
    out += ";";
    return out;
  }
}

export class ReturnStatement extends Statement {
  constructor(t = null, r = null) {
    super();
    this.token = t;
    this.returnValue = r;
  }
  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  String() {
    let out = `${this.tokenLiteral()} `;
    if (this.returnValue !== null) {
      out += this.returnValue.String();
    }
    out += ";";
    return out;
  }
}

export class Identifier extends Expression {
  constructor(token = null, value = null) {
    super();
    this.token = token;
    this.value = value;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  String() {
    return this.value;
  }
}

export class IntegerLiteral extends Expression {
  constructor(token = null, value = null) {
    super();
    this.token = token;
    this.value = value;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  String() {
    return this.token.literal;
  }
}

export class PrefixExpression extends Expression {
  constructor(t = null, o = null, r = null) {
    super();
    this.token = t;
    this.operator = o;
    this.right = r;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  String() {
    return `(${this.operator}${this.right.String()})`;
  }
}

export class InfixExpression extends Expression {
  constructor(t = null, l = null, o = null, r = null) {
    super();
    this.token = t;
    this.left = l;
    this.operator = o;
    this.right = r;
  }
  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  String() {
    return `(${this.left.String()} ${this.operator} ${this.right.String()})`;
  }
}
