import { assert } from "chai";
import { getValid } from "../modules/getValid";
import path from "path";
import { remove, writeFile } from "fs-extra";
import { EmailInt } from "../interfaces/emailInt";

suite("getValid", () => {
  test("should return a list of emails", async () => {
    const filePath = path.join(__dirname, "/../validEmails.csv");
    await writeFile(
      filePath,
      `email,unsubscribeId\nnhcarrigan@gmail.com,1\nnick@freecodecamp.org,2`
    );
    const result = await getValid();
    const expected: EmailInt[] = [
      { email: "nhcarrigan@gmail.com", unsubscribeId: "1" },
      { email: "nick@freecodecamp.org", unsubscribeId: "2" },
    ];
    assert.isArray(result, "did not return an array");
    assert.deepEqual(result, expected, "did not return correct data");
    assert.deepEqual(
      result[0],
      expected[0],
      "did not return correct data for first entry"
    );
    assert.deepEqual(
      result[1],
      expected[1],
      "did not return correct data for second entry"
    );
    await remove(filePath);
  });

  test("should return empty array on missing file", async () => {
    const result = await getValid();
    assert.isArray(result, "did not return an array");
    assert.equal(result.length, 0, "did not return an empty array");
  });
});
