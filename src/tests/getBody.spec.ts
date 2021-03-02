import { assert } from "chai";
import { getBody } from "../modules/getBody";
import path from "path";
import { remove, writeFile } from "fs-extra";

suite("Get Body", async () => {
  test("should read the email body from file", async () => {
    const filepath = path.join(__dirname + "/../emailBody.txt");
    await writeFile(filepath, "This is a test");
    assert.equal(
      await getBody(),
      "This is a test",
      "Did not correctly read email body."
    );
    await remove(filepath);
  });

  test("should return empty string on missing emailBody.txt", async () => {
    assert.equal(await getBody(), "", "Did not return an empty string.");
  });
});
