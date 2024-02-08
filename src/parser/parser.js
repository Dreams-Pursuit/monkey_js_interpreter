import {} from "../lexer/lexer.js";
import {
  Program,
  LetStatement,
  ReturnStatement,
  Identifier,
  ExpressionStatement,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
  Boolean,
  IfExpression,
  BlockStatement,
  FunctionLiteral,
} from "../ast/ast.js";
import { TokenTypes } from "../token/token.js";
// import { trace, untrace } from "./parser_tracing.js";

const LOWEST = 1;
const EQUALS = 2;
const LESSGREATER = 3;
const SUM = 4;
const PRODUCT = 5;
const PREFIX = 6;
const CALL = 7;

const precedences = {
  [TokenTypes.EQ]: EQUALS,
  [TokenTypes.NOT_EQ]: EQUALS,
  [TokenTypes.LT]: LESSGREATER,
  [TokenTypes.GT]: LESSGREATER,
  [TokenTypes.PLUS]: SUM,
  [TokenTypes.MINUS]: SUM,
  [TokenTypes.SLASH]: PRODUCT,
  [TokenTypes.ASTERISK]: PRODUCT,
  [TokenTypes.LPAREN]: CALL,
};

export class Parser {
  constructor(l) {
    this.curToken = null;
    this.peekToken = null;

    this.l = l;
    this.errors = [];
    this.prefixParseFns = {};
    this.infixParseFns = {};

    this.registerPrefix(TokenTypes.IDENT, this.parseIdentifier);
    this.registerPrefix(TokenTypes.INT, this.parseIntegerLiteral);
    this.registerPrefix(TokenTypes.BANG, this.parsePrefixExpression);
    this.registerPrefix(TokenTypes.MINUS, this.parsePrefixExpression);
    this.registerPrefix(TokenTypes.TRUE, this.parseBoolean);
    this.registerPrefix(TokenTypes.FALSE, this.parseBoolean);
    this.registerPrefix(TokenTypes.LPAREN, this.parseGroupedExpression);
    this.registerPrefix(TokenTypes.IF, this.parseIfExpression);
    this.registerPrefix(TokenTypes.FUNCTION, this.parseFunctionLiteral);

    this.registerInfix(TokenTypes.PLUS, this.parseInfixExpression);
    this.registerInfix(TokenTypes.MINUS, this.parseInfixExpression);
    this.registerInfix(TokenTypes.SLASH, this.parseInfixExpression);
    this.registerInfix(TokenTypes.ASTERISK, this.parseInfixExpression);
    this.registerInfix(TokenTypes.EQ, this.parseInfixExpression);
    this.registerInfix(TokenTypes.NOT_EQ, this.parseInfixExpression);
    this.registerInfix(TokenTypes.LT, this.parseInfixExpression);
    this.registerInfix(TokenTypes.GT, this.parseInfixExpression);

    this.nextToken();
    this.nextToken();
  }

  registerPrefix(tokenType, fn) {
    this.prefixParseFns[tokenType] = fn;
  }
  registerInfix(tokenType, fn) {
    this.infixParseFns[tokenType] = fn;
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  peekError(t) {
    this.errors.push(
      `expected next token to be ${t}, got ${this.peekToken.tokenType} instead`,
      t,
      this.peekToken.tokenType,
    );
  }

  parseProgram() {
    const program = new Program();
    while (this.curToken.tokenType !== TokenTypes.EOF) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        program.statements.push(stmt);
      }
      this.nextToken();
    }
    return program;
  }

  parseFunctionLiteral() {
    const lit = new FunctionLiteral(this.curToken);
    if (!this.expectPeek(TokenTypes.LPAREN)) {
      return null;
    }
    lit.parameters = this.parseFunctionParameters();
    if (!this.expectPeek(TokenTypes.LBRACE)) {
      return null;
    }
    lit.body = this.parseBlockStatement();
    return lit;
  }

  parseFunctionParameters() {
    const identifiers = [];
    if (this.peekTokenIs(TokenTypes.RPAREN)) {
      this.nextToken();
      return identifiers;
    }
    this.nextToken();
    const ident = new Identifier(this.curToken, this.curToken.literal);
    identifiers.push(ident);
    while (this.peekTokenIs(TokenTypes.COMMA)) {
      this.nextToken();
      this.nextToken();
      const ident = new Identifier(this.curToken, this.curToken.literal);
      identifiers.push(ident);
    }
    if (!this.expectPeek(TokenTypes.RPAREN)) {
      return null;
    }
    return identifiers;
  }
  parseIfExpression() {
    const expression = new IfExpression(this.curToken);
    if (!this.expectPeek(TokenTypes.LPAREN)) {
      return null;
    }
    this.nextToken();
    expression.condition = this.parseExpression(LOWEST);
    if (!this.expectPeek(TokenTypes.RPAREN)) {
      return null;
    }
    if (!this.expectPeek(TokenTypes.LBRACE)) {
      return null;
    }
    expression.consequence = this.parseBlockStatement();
    if (this.peekTokenIs(TokenTypes.ELSE)) {
      this.nextToken();
      if (!this.expectPeek(TokenTypes.LBRACE)) {
        return null;
      }
      expression.alternative = this.parseBlockStatement();
    }
    return expression;
  }

  parseBlockStatement() {
    const block = new BlockStatement(this.curToken);
    this.nextToken();
    while (!this.curTokenIs(TokenTypes.RBRACE)) {
      const stmt = this.parseStatement();
      if (stmt !== null) {
        block.statements.push(stmt);
      }
      this.nextToken();
    }
    return block;
  }
  parseGroupedExpression() {
    this.nextToken();
    const exp = this.parseExpression(LOWEST);
    if (!this.expectPeek(TokenTypes.RPAREN)) {
      return null;
    }
    return exp;
  }
  parseBoolean() {
    return new Boolean(this.curToken, this.curTokenIs(TokenTypes.TRUE));
  }
  //   parseInfixExpression(left) {
  //     const expression = new InfixExpression(
  //       this.curToken,
  //       left,
  //       this.curToken.literal,
  //     );
  //     const precedence = this.curPrecedence();
  //     this.nextToken();
  //     expression.right = this.parseExpression(precedence);
  //     return expression;
  //   }
  parseInfixExpression(left) {
    const operator = this.curToken.literal;
    const precedence = this.curPrecedence();
    this.nextToken();
    const right = this.parseExpression(precedence);
    return new InfixExpression(this.curToken, left, operator, right);
  }

  parsePrefixExpression() {
    const expression = new PrefixExpression(
      this.curToken,
      this.curToken.literal,
    );
    this.nextToken();
    expression.right = this.parseExpression(PREFIX);
    return expression;
  }

  parseIntegerLiteral() {
    // trace("parseIntegerLiteral");
    // untrace("parseIntegerLiteral");
    return new IntegerLiteral(this.curToken, this.curToken.literal);
  }

  parseIdentifier() {
    return new Identifier(this.curToken, this.curToken.literal);
  }
  parseStatement() {
    switch (this.curToken.tokenType) {
    case TokenTypes.LET:
      return this.parseLetStatement();
    case TokenTypes.RETURN:
      return this.parseReturnStatement();
    default:
      return this.parseExpressionStatement();
    }
  }
  parseExpressionStatement() {
    // trace("parseExpressionStatement");
    const stmt = new ExpressionStatement(this.curToken);
    stmt.expression = this.parseExpression(LOWEST);
    if (this.peekTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken();
    }
    // untrace("parseExpressionStatement");
    return stmt;
  }
  parseExpression(precedence) {
    // trace("parseExpression");
    const prefix = this.prefixParseFns[this.curToken.tokenType];

    if (prefix === undefined) {
      this.noPrefixParseFnError(this.curToken.tokenType);
      return null;
    }
    let leftExp = prefix.bind(this)();
    while (
      !this.peekTokenIs(TokenTypes.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infix = this.infixParseFns[this.peekToken.tokenType];
      if (infix === null) {
        return leftExp;
      }
      this.nextToken();
      leftExp = infix.bind(this)(leftExp);
    }
    // untrace("parseExpression");
    return leftExp;
  }
  peekPrecedence() {
    const p = precedences[this.peekToken.tokenType];
    if (p !== null) {
      return p;
    }
    return LOWEST;
  }

  curPrecedence() {
    const p = precedences[this.curToken.tokenType];
    if (p !== null) {
      return p;
    }
    return LOWEST;
  }

  parseLetStatement() {
    const stmt = new LetStatement(this.curToken);
    if (!this.expectPeek(TokenTypes.IDENT)) {
      return null;
    }
    stmt.name = new Identifier(this.curToken, this.curToken.literal);
    if (!this.expectPeek(TokenTypes.ASSIGN)) {
      return null;
    }
    while (!this.curTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }
  parseReturnStatement() {
    const stmt = new ReturnStatement(this.curToken);
    this.nextToken();
    while (!this.curTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken();
    }
    return stmt;
  }
  expectPeek(t) {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(t);
      return false;
    }
  }
  peekTokenIs(t) {
    return this.peekToken.tokenType === t;
  }
  curTokenIs(t) {
    return this.curToken.tokenType === t;
  }
  noPrefixParseFnError(t) {
    this.errors.push(`no prefix parse function for ${t} found`);
  }
}
