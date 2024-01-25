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

    // keywords
    FUNCTION: "fn",
    LET: "let",
    TRUE: "true",
    FALSE: "false",
    IF: "if",
    ELSE: "else",
    RETURN: "return"

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
    "let": TokenTypes.LET,
    "true": TokenTypes.TRUE,
    "false": TokenTypes.FALSE,
    "if": TokenTypes.IF,
    "else": TokenTypes.ELSE,
    "return": TokenTypes.RETURN
}

export function LookupIdent(ident) {
    if (keywords[ident]) {
        return keywords[ident];
    }
    return TokenTypes.IDENT;
}