import { readFile } from "fs-extra";
import Spinnies from "spinnies";
const spinnies = new Spinnies({
  spinner: {
    interval: 80,
    frames: [
      "▰▱▱▱▱▱▱",
      "▰▰▱▱▱▱▱",
      "▰▰▰▱▱▱▱",
      "▰▰▰▰▱▱▱",
      "▰▰▰▰▰▱▱",
      "▰▰▰▰▰▰▱",
      "▰▰▰▰▰▰▰",
      "▰▱▱▱▱▱▱",
    ],
  },
});
import { join } from "path";

/**
 * Reads the emailBody.txt file and returns it, or an empty string on error.
 * @returns {Promise<string>} The email body text from emailBody.txt
 */
export const getBody = async (): Promise<string> => {
  spinnies.add("read-body", {
    color: "cyan",
    text: "Reading email body...",
  });

  const filePath = join(__dirname + "/../emailBody.txt");

  const emailBody = await readFile(filePath, "utf8").catch(() => {
    spinnies.fail("read-body", {
      color: "red",
      text: "emailBody.txt not found.",
    });
  });

  if (!emailBody || !emailBody.length) {
    spinnies.fail("read-body", {
      color: "red",
      text: "Could not read email body. Terminating process...",
    });

    return "";
  }

  spinnies.succeed("read-body", {
    color: "green",
    text: "Email body obtained!",
  });

  return emailBody;
};
