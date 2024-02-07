import {} from "../lexer/lexer.js";
import { Program, LetStatement, ReturnStatement, Identifier, ExpressionStatement } from "../ast/ast.js";
import { TokenTypes } from "../token/token.js";

const LOWEST = 1;
const EQUALS = 2;
const LESSGREATER = 3;
const SUM = 4;
const PRODUCT = 5;
const PREFIX = 6;
const CALL = 7;

export class Parser {
    curToken;
    peekToken;



    constructor(l) {
        this.l = l;
        this.errors = [];
        this.prefixParseFns = {};
        this.infixParseFns = {};

        this.registerPrefix(TokenTypes.IDENT, this.parseIdentifier);

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
        this.errors.push(`expected next token to be ${t}, got ${this.peekToken.tokenType} instead`, t, this.peekToken.tokenType);
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
        const stmt = new ExpressionStatement(this.curToken);
        stmt.expression = this.parseExpression(LOWEST);
        if (this.peekTokenIs(TokenTypes.SEMICOLON)) {
            this.nextToken();
        }
        return stmt;
    }
    parseExpression(precedence) {
        const prefix = this.prefixParseFns[this.curToken.tokenType];
        if (prefix === null) {
            return null;
        }
        let leftExp = prefix();
        while (!this.peekTokenIs(TokenTypes.SEMICOLON) && precedence < this.peekPrecedence()) {
            const infix = this.infixParseFns[this.peekToken.tokenType];
            if (infix === null) {
                return leftExp;
            }
            this.nextToken();
            leftExp = infix(leftExp);
        }
        return leftExp;
    }
    peekPrecedence() {
        const p = precedences[this.peekToken.tokenType];
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
}





