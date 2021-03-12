import chalk from "chalk";
import { readFile } from "fs-extra";
import { prompt } from "inquirer";
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
 * Reads the bouncedEmails.csv file to construct an array of the emails from
 * the file.
 * @returns {Promise<string[]>} Returns an array of email strings, or an empty
 * array on failure.
 */
export const getBounced = async (): Promise<string[]> => {
  spinnies.add("read-bounced", {
    color: "cyan",
    text: "Reading bounced email list...",
  });

  const filePath = join(__dirname + "/../bouncedEmails.csv");

  const bounceListString = await readFile(filePath, "utf8").catch(() => {
    spinnies.fail("read-bounced", {
      color: "red",
      text: "bouncedEmails.csv not found.",
    });
  });

  if (!bounceListString || !bounceListString.length) {
    spinnies.fail("read-bounced", {
      color: "red",
      text: "Failed to read bounce list. Exiting process...",
    });
    return [];
  }

  const bounceList: string[] = bounceListString
    // Split by new lines
    .split("\n")
    // Remove header row
    .slice(1)
    // Strip accidental empty lines
    .filter((line) => line);

  spinnies.succeed("read-bounced", {
    color: "green",
    text: "Bounce list obtained!",
  });

  /**
   * In case the bounce list is empty, confirm that is correct and proceed.
   */
  if (!bounceList.length) {
    const shouldProceed = await prompt([
      {
        name: "proceed",
        type: "confirm",
        message: chalk.yellow(
          "The bounced email list is empty. Proceed with sending anyway?"
        ),
      },
    ]);

    if (!shouldProceed.proceed) {
      console.error(
        chalk.red("Bounce list should not be empty. Exiting process...")
      );
      return [];
    }
    console.info(chalk.green("Bounce list confirmed. Proceeding!"));
    return ["thisisverymuchafakeemail@nope.txt"];
  }

  return bounceList;
};
