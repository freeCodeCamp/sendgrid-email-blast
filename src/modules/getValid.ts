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
import { EmailInt } from "../interfaces/emailInt";

/**
 * Gets the valid list of email addresses from the validEmails.csv file,
 * and maps them to an array of EmailInt objects.
 * @returns {Promise<EmailInt[]>} The list of valid emails, formatted as
 * proper objects.
 */
export const getValid = async (): Promise<EmailInt[]> => {
  spinnies.add("read-valid", {
    color: "cyan",
    text: "Reading valid email list...",
  });

  const filePath = join(__dirname + "/../validEmails.csv");

  const validListString = await readFile(filePath, "utf8").catch(() => {
    spinnies.fail("read-valid", {
      color: "red",
      text: "validEmails.csv not found!",
    });
  });

  if (!validListString || !validListString.length) {
    spinnies.fail("read-valid", {
      color: "red",
      text: "Failed to read valid email list. Exiting process...",
    });
    return [];
  }

  const validList: EmailInt[] = validListString
    // Split by new lines
    .split("\n")
    // Remove header row
    .slice(1)
    // Strip accidental empty lines
    .filter((line) => line)
    // Map into proper objects
    .map((line) => {
      const [email, unsubscribeId] = line.split(",");
      return { email, unsubscribeId };
    });

  spinnies.succeed("read-valid", {
    color: "green",
    text: "Email list obtained!",
  });
  return validList;
};
