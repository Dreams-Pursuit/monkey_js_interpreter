
export class ObjectType {
  Type() { throw new Error("not implemented"); }
  Inspect() { throw new Error("not implemented"); }
}

const INTEGER_OBJ = "INTEGER";
const BOOLEAN_OBJ = "BOOLEAN";
const NULL_OBJ = "NULL";
const RETURN_VALUE_OBJ = "RETURN_VALUE";
const ERROR_OBJ = "ERROR";
const FUNCTION_OBJ = "FUNCTION";
// const STRING_OBJ = "STRING";
// const BUILTIN_OBJ = "BUILTIN";
// const ARRAY_OBJ = "ARRAY";
// const HASH_OBJ = "HASH";

export const ObjectTypeMap = {
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  NULL: "NULL",
  RETURN_VALUE: "RETURN_VALUE",
  ERROR: "ERROR",
  FUNCTION: "FUNCTION",
  STRING: "STRING",
  // BUILTIN: "BUILTIN",
  // ARRAY: "ARRAY",
  // HASH: "HASH",
};
export class Integer extends ObjectType {
  constructor(value = 0) {
    super();
    this.value = +value;
  }
  Type() {
    return INTEGER_OBJ;
  }
  Inspect() {
    return this.value.toString();
  }
}

export class BooleanType extends ObjectType {
  constructor(value = false) {
    super();
    this.value = value;
  }
  Type() {
    return BOOLEAN_OBJ;
  }
  Inspect() {
    return this.value.toString();
  }
}

export class Null extends ObjectType {
  Type() {
    return NULL_OBJ;
  }
  Inspect() {
    return null;
  }
}

export class ReturnValue extends ObjectType {
  constructor(value = null) {
    super();
    this.value = value;
  }
  Type() {
    return RETURN_VALUE_OBJ;
  }
  Inspect() {
    return this.value.Inspect();
  }
}

export class ErrorN extends ObjectType {
  constructor(message = "") {
    super();
    this.message = message;
  }
  Type() {
    return ERROR_OBJ;
  }
  Inspect() {
    return `ERROR: ${this.message}`;
  }
}

export class Function extends ObjectType {
  constructor(parameters = [], body = [], env = null) {
    super();
    this.parameters = parameters;
    this.body = body;
    this.env = env;
  }
  Type() {
    return FUNCTION_OBJ;
  }
  Inspect() {
    return `fn(${this.parameters.map((p) => p.Inspect()).join(", ")}) {\n${this.body.map((b) => b.Inspect()).join("\n")}\n}`;
  }
}

export class String extends ObjectType {
  constructor(value = "") {
    super();
    this.value = value;
  }
  Type() {
    return ObjectTypeMap.STRING;
  }
  Inspect() {
    return this.value;
  }
}
