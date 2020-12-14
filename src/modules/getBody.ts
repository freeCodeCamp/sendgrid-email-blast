import { readFile } from "fs-extra";
import ora from "ora";
import { join } from "path";

/**
 * Reads the emailBody.txt file and returns it, or an empty string on error.
 * @returns {Promise<string>} The email body text from emailBody.txt
 */
export const getBody = async (): Promise<string> => {
  const spinner = ora("Reading email body...").start();

  const filePath = join(__dirname + "/../emailBody.txt");

  const emailBody = await readFile(filePath, "utf8");

  if (!emailBody || !emailBody.length) {
    spinner.fail("Could not read email body.");
    return "";
  }

  spinner.succeed("Email body obtained!");

  return emailBody;
};
