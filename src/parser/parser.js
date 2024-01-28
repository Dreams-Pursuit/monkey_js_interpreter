import {} from "../lexer/lexer.js";
import {} from "../ast/ast.js";
import {} from "../token/token.js";

export class Parser {
    l;

    curToken;
    peekToken;

    constructor(l) {
        this.l = l;
        this.nextToken();
        this.nextToken();
    }

    nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.l.nextToken();
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
    parseStatement() {
        switch (this.curToken.tokenType) {
            case TokenTypes.LET:
                return this.parseLetStatement();
            default:
                return null;
        }
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
    expectPeek(t) {
        if (this.peekTokenIs(t)) {
            this.nextToken();
            return true;
        }
        return false;
    }
    peekTokenIs(t) {
        return this.peekToken.tokenType === t;
    }
    curTokenIs(t) {
        return this.curToken.tokenType === t;
    }


}





