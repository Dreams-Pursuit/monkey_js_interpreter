const TokenTypes = {
    ILLEGAL: "ILLEGAL",
    EOF: "EOF",

    // identifiers + literals
    IDENT: "IDENT",
    INT: "INT",

    // Operators 
    ASSIGN: "=",
    PLUS: "+",

    // Delimiters
    COMMA: ",",
    SEMICOLON: ";",

    LPAREN: "(",
    RPAREN: ")",
    LBRACE: "{",
    RBRACE: "}",

    // keywords
    FUNCTION: "FUNCTION",
    LET: "LET"
}


class Token {
    tokenType;
    literal;

    constructor(tokenType, literal) {
        this.tokenType = tokenType;
        this.literal = literal;
    }
}