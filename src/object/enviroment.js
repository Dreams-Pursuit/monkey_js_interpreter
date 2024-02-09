// import { ObjectType } from "./object";

export class Enviroment {
  constructor(s = new Map(), o = null) {
    this.store = s;
    this.outer = o;
  }
  get(name) {
    const val = this.store.get(name);
    if (val === undefined && this.outer !== null) {
      return this.outer.get(name);
    }
    return val;
  }
  set(name, value) {
    this.store.set(name, value);
    return value;
  }
}

export function NewEnclosedEnvironment(outer) {
  return new Enviroment(new Map(), outer);
}
