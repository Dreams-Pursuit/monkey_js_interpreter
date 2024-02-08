import { Token, TokenTypes, LookupIdent } from "../token/token.js";

export class Lexer {
  constructor(input, position = 0, readPosition = 0, ch = 0) {
    this.input = input;
    this.position = position;
    this.readPosition = readPosition;
    this.ch = ch;

    this.readChar();
  }

  readChar() {
    if (this.readPosition >= this.input.length) {
      // JavaScript doesn't have a char type,use string with null character
      this.ch = "\0";
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition += 1;
  }

  readNumber() {
    const position = this.position;
    while (isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.substring(position, this.position);
  }

  peekChar() {
    if (this.readPosition >= this.input.length) {
      return "\0";
    }
    return this.input[this.readPosition];
  }

  readIdentifier() {
    const position = this.position;
    while (isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.substring(position, this.position);
  }

  skipWhitespace() {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\n" ||
      this.ch === "\r"
    ) {
      this.readChar();
    }
  }

  nextToken() {
    let tok = new Token(TokenTypes.ILLEGAL, this.ch);
    this.skipWhitespace();
    switch (this.ch) {
    case "=":
      if (this.peekChar() === "=") {
        const ch = this.ch;
        this.readChar();
        const literal = ch + this.ch;
        tok = new Token(TokenTypes.EQ, literal);
      } else {
        tok = new Token(TokenTypes.ASSIGN, this.ch);
      }
      break;
    case ";":
      tok = new Token(TokenTypes.SEMICOLON, this.ch);
      break;
    case "(":
      tok = new Token(TokenTypes.LPAREN, this.ch);
      break;
    case ")":
      tok = new Token(TokenTypes.RPAREN, this.ch);
      break;
    case ",":
      tok = new Token(TokenTypes.COMMA, this.ch);
      break;
    case "+":
      tok = new Token(TokenTypes.PLUS, this.ch);
      break;
    case "-":
      tok = new Token(TokenTypes.MINUS, this.ch);
      break;
    case "!":
      if (this.peekChar() === "=") {
        const ch = this.ch;
        this.readChar();
        const literal = ch + this.ch;
        tok = new Token(TokenTypes.NOT_EQ, literal);
      } else {
        tok = new Token(TokenTypes.BANG, this.ch);
      }
      break;
    case "/":
      tok = new Token(TokenTypes.SLASH, this.ch);
      break;
    case "*":
      tok = new Token(TokenTypes.ASTERISK, this.ch);
      break;
    case "<":
      tok = new Token(TokenTypes.LT, this.ch);
      break;
    case ">":
      tok = new Token(TokenTypes.GT, this.ch);
      break;
    case "{":
      tok = new Token(TokenTypes.LBRACE, this.ch);
      break;
    case "}":
      tok = new Token(TokenTypes.RBRACE, this.ch);
      break;
    case "\0":
      tok = new Token(TokenTypes.EOF, "");
      break;
    default:
      if (isLetter(this.ch)) {
        tok.literal = this.readIdentifier();
        tok.tokenType = LookupIdent(tok.literal);
        return tok;
      } else if (isDigit(this.ch)) {
        tok.tokenType = TokenTypes.INT;
        tok.literal = this.readNumber();
        return tok;
      }
    }
    this.readChar();
    return tok;
  }
}

function isLetter(ch) {
  return ("a" <= ch && ch <= "z") || ("A" <= ch && ch <= "Z") || ch === "_";
}

function isDigit(ch) {
  return "0" <= ch && ch <= "9";
}
