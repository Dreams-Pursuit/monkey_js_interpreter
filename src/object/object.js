
export class ObjectType {
  Type() { throw new Error("not implemented"); }
  Inspect() { throw new Error("not implemented"); }
}

const INTEGER_OBJ = "INTEGER";
const BOOLEAN_OBJ = "BOOLEAN";
const NULL_OBJ = "NULL";
// const RETURN_VALUE_OBJ = "RETURN_VALUE";
// const ERROR_OBJ = "ERROR";
// const FUNCTION_OBJ = "FUNCTION";
// const STRING_OBJ = "STRING";
// const BUILTIN_OBJ = "BUILTIN";
// const ARRAY_OBJ = "ARRAY";
// const HASH_OBJ = "HASH";

export const ObjectTypeMap = {
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  NULL: "NULL",
  // RETURN_VALUE: "RETURN_VALUE",
  // ERROR: "ERROR",
  // FUNCTION: "FUNCTION",
  // STRING: "STRING",
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
