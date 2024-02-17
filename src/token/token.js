export const TokenTypes = {
  ILLEGAL: "ILLEGAL",
  EOF: "EOF",

  // identifiers + literals
  IDENT: "IDENT",
  INT: "INT",

  // Operators
  ASSIGN: "=",
  PLUS: "+",
  BANG: "!",
  MINUS: "-",
  ASTERISK: "*",
  SLASH: "/",
  EQ: "==",
  NOT_EQ: "!=",

  LT: "<",
  GT: ">",

  // Delimiters
  COMMA: ",",
  SEMICOLON: ";",

  LPAREN: "(",
  RPAREN: ")",
  LBRACE: "{",
  RBRACE: "}",
  LBRACKET: "[",
  RBRACKET: "]",

  // keywords
  FUNCTION: "fn",
  LET: "let",
  TRUE: "true",
  FALSE: "false",
  IF: "if",
  ELSE: "else",
  RETURN: "return",

  STRING: "STRING",
};

export class Token {
  constructor(tokenType, literal) {
    this.tokenType = tokenType;
    this.literal = literal;
  }
}

const keywords = {
  fn: TokenTypes.FUNCTION,
  let: TokenTypes.LET,
  true: TokenTypes.TRUE,
  false: TokenTypes.FALSE,
  if: TokenTypes.IF,
  else: TokenTypes.ELSE,
  return: TokenTypes.RETURN,
};

export function LookupIdent(ident) {
  if (keywords[ident]) {
    return keywords[ident];
  }
  return TokenTypes.IDENT;
}
