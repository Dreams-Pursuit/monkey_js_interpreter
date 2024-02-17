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
    // case Array:
    //   return new Integer(arg.elements.length);
    default:
      return new ErrorN(`argument to \`len\` not supported, got ${arg.Type()}`);
    }
  }),
};
