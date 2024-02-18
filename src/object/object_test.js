import test from "node:test";
import assert from "node:assert";
import { String } from "./object.js";


test("String#Key", () => {
  const hello1 = new String("Hello World");
  const hello2 = new String("Hello World");
  const diff1 = new String("My name is johnny");
  const diff2 = new String("My name is johnny");

  assert.strictEqual(hello1.HashKey().value, hello2.HashKey().value, "strings with same content have different hash keys");
  assert.strictEqual(diff1.HashKey().value, diff2.HashKey().value, "strings with same content have different hash keys");
  assert.notStrictEqual(hello1.HashKey().value, diff1.HashKey().value, "strings with different content have same hash keys");
});
