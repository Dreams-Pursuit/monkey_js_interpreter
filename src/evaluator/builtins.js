import { Builtin, Integer, ErrorN, String } from "../object/object.js";


// const NULL = new Null();
export const builtins = {
  "len": new Builtin((...args) => {
    if (args.length !== 1) {
      return new ErrorN(`wrong number of arguments. got=${args.length}, want=1`);
    }

    const arg = args[0];
    switch (arg.constructor) {
    case String:
      return new Integer(arg.value.length);
    case Array:
      return new Integer(arg.elements.length);
    default:
      return new ErrorN(`argument to \`len\` not supported, got ${arg.Type()}`);
    }
  }),
  "first": new Builtin((...args) => {
    if (args.length !== 1) {
      return new ErrorN(`wrong number of arguments. got=${args.length}, want=1`);
    }
    if (args[0].constructor !== Array) {
      return new ErrorN(`argument to \`first\` must be ARRAY, got ${args[0].Type()}`);
    }
    if (args[0].elements.length > 0) {
      return args[0].elements[0];
    }
    return null;
  }),
  "last": new Builtin((...args) => {
    if (args.length !== 1) {
      return new ErrorN(`wrong number of arguments. got=${args.length}, want=1`);
    }
    if (args[0].constructor !== Array) {
      return new ErrorN(`argument to \`last\` must be ARRAY, got ${args[0].Type()}`);
    }
    const length = args[0].elements.length;
    if (length > 0) {
      return args[0].elements[length - 1];
    }
    return null;
  }),
  "rest": new Builtin((...args) => {
    if (args.length !== 1) {
      return new ErrorN(`wrong number of arguments. got=${args.length}, want=1`);
    }
    if (args[0].constructor !== Array) {
      return new ErrorN(`argument to \`rest\` must be ARRAY, got ${args[0].Type()}`);
    }
    const length = args[0].elements.length;
    if (length > 0) {
      return new Array(args[0].elements.slice(1));
    }
    return null;
  }),
  "push": new Builtin((...args) => {
    if (args.length !== 2) {
      return new ErrorN(`wrong number of arguments. got=${args.length}, want=2`);
    }
    if (args[0].constructor !== Array) {
      return new ErrorN(`argument to \`push\` must be ARRAY, got ${args[0].Type()}`);
    }
    const newElements = args[0].elements.slice();
    newElements.push(args[1]);
    return new Array(newElements);
  }),
  "puts": new Builtin((...args) => {
    args.forEach((arg) => {
      console.log(arg.Inspect());
    });
    return null;
  }),

};
