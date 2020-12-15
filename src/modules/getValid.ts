import chalk from "chalk";
import { readFile } from "fs-extra";
import ora from "ora";
import { join } from "path";
import { EmailInt } from "../interfaces/emailInt";

/**
 * Gets the valid list of email addresses from the validEmails.csv file,
 * and maps them to an array of EmailInt objects.
 * @returns {Promise<EmailInt[]>} The list of valid emails, formatted as
 * proper objects.
 */
export const getValid = async (): Promise<EmailInt[]> => {
  const spinner = ora(chalk.cyan.bgBlack("Reading valid email list..."));

  const filePath = join(__dirname + "/../validEmails.csv");

  const validListString = await readFile(filePath, "utf8");

  if (!validListString || !validListString.length) {
    spinner.fail(
      chalk.red.bgBlack("Failed to read valid email list. Exiting process...")
    );
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

  spinner.succeed(chalk.green.bgBlack("Email list obtained!"));
  return validList;
};
