export const TokenTypes = {
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
    FUNCTION: "fn",
    LET: "let"
}


export class Token {
    tokenType;
    literal;

    constructor(tokenType, literal) {
        this.tokenType = tokenType;
        this.literal = literal;
    }
}


let keywords = {
    "fn": TokenTypes.FUNCTION,
    "let": TokenTypes.LET
}

export function LookupIdent(ident) {
    if (keywords[ident]) {
        return keywords[ident];
    }
    return TokenTypes.IDENT;
}