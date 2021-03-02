import { assert } from "chai";
import { getBounced } from "../modules/getBounced";
import path from "path";
import { remove, writeFile } from "fs-extra";

suite("getBounced", () => {
  test("should return an array of emails", async () => {
    const filepath = path.join(__dirname + "/../bouncedEmails.csv");
    await writeFile(
      filepath,
      `email\nnhcarrigan@gmail.com\nnick@freecodecamp.org`
    );
    const result = await getBounced();
    assert.isArray(result, "did not return an array");
    assert.equal(result.length, 2, "did not read both emails");
    assert.deepEqual(
      result,
      ["nhcarrigan@gmail.com", "nick@freecodecamp.org"],
      "did not parse emails correctly"
    );
    await remove(filepath);
  });

  test("should return empty array on missing file", async () => {
    const result = await getBounced();
    assert.isArray(result, "did not return an array");
    assert.deepEqual(result, [], "did not return empty array");
    assert.equal(result.length, 0, "did not return empty array");
  });
});
