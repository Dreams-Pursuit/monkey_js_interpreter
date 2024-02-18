import { createHash } from "crypto";


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
const STRING_OBJ = "STRING";
const BUILTIN_OBJ = "BUILTIN";
const ARRAY_OBJ = "ARRAY";
const HASH_OBJ = "HASH";

export const ObjectTypeMap = {
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  NULL: "NULL",
  RETURN_VALUE: "RETURN_VALUE",
  ERROR: "ERROR",
  FUNCTION: "FUNCTION",
  STRING: "STRING",
  BUILTIN: "BUILTIN",
  ARRAY: "ARRAY",
  HASH: "HASH",
};

export class Hash extends ObjectType {
  constructor(pairs = new Map()) {
    super();
    this.pairs = pairs;
  }
  Type() {
    return HASH_OBJ;
  }
  Inspect() {
    const pairs = [];
    for (const [key, value] of this.pairs) {
      pairs.push(`${key.Inspect()}: ${value.Inspect()}`);
    }
    return `{${pairs.join(", ")}}`;
  }
}

export class HashKey {
  constructor(type = "", value = "") {
    this.type = type;
    this.value = value;
  }
  Inspect() {
    if (this.type === STRING_OBJ) {
      return `"${this.value}"`;
    }
    return this.value;
  }
}
export class HashPair {
  constructor(key = null, value = null) {
    this.key = key;
    this.value = value;
  }
  Inspect() {
    return `${this.key.Inspect()}: ${this.value.Inspect()}`;
  }
}

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
  HashKey() {
    return new HashKey(INTEGER_OBJ, this.value);
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
  HashKey() {
    let value = 0;
    if (this.value) {
      value = 1;
    }
    return new HashKey(BOOLEAN_OBJ, value);
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
    return STRING_OBJ;
  }
  Inspect() {
    return this.value;
  }
  HashKey() {
    const hash = createHash("sha256");
    hash.update(this.value);
    return new HashKey(STRING_OBJ, hash.digest("hex"));
  }
}

export class Builtin extends ObjectType {
  constructor(fn = (() => {})) {
    super();
    this.fn = fn;
    // console.log(typeof this.fn, this.fn);
  }
  Type() {
    return BUILTIN_OBJ;
  }
  Inspect() {
    return "builtin function";
  }
}

export class ArrayObject extends ObjectType {
  constructor(elements = []) {
    super();
    this.elements = elements;
  }
  Type() {
    return ARRAY_OBJ;
  }
  Inspect() {
    return `[${this.elements.map((e) => e.Inspect()).join(", ")}]`;
  }
}
