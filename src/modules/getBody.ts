import chalk from "chalk";
import { readFile } from "fs-extra";
import ora from "ora";
import { join } from "path";

/**
 * Reads the emailBody.txt file and returns it, or an empty string on error.
 * @returns {Promise<string>} The email body text from emailBody.txt
 */
export const getBody = async (): Promise<string> => {
  const spinner = ora(chalk.cyan.bgBlack("Reading email body...")).start();

  const filePath = join(__dirname + "/../emailBody.txt");

  const emailBody = await readFile(filePath, "utf8").catch(() => {
    spinner.fail(chalk.red.bgBlack("emailBody.txt not found."));
  });

  if (!emailBody || !emailBody.length) {
    spinner.fail(
      chalk.red.bgBlack("Could not read email body. Terminating process...")
    );
    return "";
  }

  spinner.succeed(chalk.green.bgBlack("Email body obtained!"));

  return emailBody;
};
