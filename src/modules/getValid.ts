import { readFile } from "fs-extra";
import ora from "ora";
import { join } from "path";
import { EmailInt } from "../interfaces/emailInt";

export const getValid = async (): Promise<EmailInt[]> => {
  const spinner = ora("Reading valid email list...");

  const filePath = join(__dirname + "/../validEmails.csv");

  const validListString = await readFile(filePath, "utf8");

  if (!validListString || !validListString.length) {
    spinner.fail("Failed to read valid email list. Exiting process...");
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

  return validList;
};
