let indent = "";

export function trace(msg) {
  console.log(`${indent}${msg}`);
  indent += "\t";
}

export function untrace(msg) {
  indent = indent.slice(0, -1);
  console.log(`${indent}${msg}`);
}
