

export class Node {
  /* @returns {string}*/
  tokenLiteral() { throw new Error("not implemented"); }
}

class Statement {
    node;
    statementNode() { throw new Error("not implemented"); }
}

class Expression {
    node;
    expressionNode() { throw new Error("not implemented"); }
}

export class Program {
    /* @param Statement[] */
    statements;

    /* @returns {string} */
    tokenLiteral() {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral();
        }
        return "";
    }
}

export class LetStatement extends Statement {
    token;
    name;
    value;

    statementNode() { }
    tokenLiteral() { }
}

export class Identifier extends Expression {
    token;
    value;

    expressionNode() { }
    tokenLiteral() { }
}