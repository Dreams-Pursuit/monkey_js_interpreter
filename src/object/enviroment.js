// import { ObjectType } from "./object";

export class Enviroment {
  constructor() {
    this.store = new Map();
  }
  get(name) {
    return this.store.get(name);
  }
  set(name, value) {
    this.store.set(name, value);
  }
}
