import chalk from "chalk";
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
import { ConfigInt } from "../interfaces/configInt";
import { EmailInt } from "../interfaces/emailInt";
import { sendEmail } from "./sendEmail";

/**
 * Prompt the user to send a test email. If agreed, sends a test
 * email through the SendGrid API to the provided address. Prompts
 * for confirmation that the email is received and is correct.
 * @param {ConfigInt} config The configuration object from getEnv
 * @param {string} body The email body text from getBody
 * @returns {boolean} True if test is skipped, true if test succeeds, false if failed.
 */
export const emailTest = async (
  config: ConfigInt,
  body: string
): Promise<boolean> => {
  const shouldTest = await prompt([
    {
      name: "should_test",
      type: "confirm",
      message: chalk.cyan("Do you want to send a test email?"),
    },
  ]);

  /**
   * Return true if should NOT send. This tells the main script
   * to continue running.
   */
  if (!shouldTest.should_test) {
    return true;
  }

  const testAddress = await prompt([
    {
      name: "test_address",
      type: "input",
      message: chalk.cyan("Please enter your test address"),
    },
  ]);

  spinnies.add("test-email", {
    color: "cyan",
    text: "Sending test email...",
  });

  const testEmailObject: EmailInt = {
    email: testAddress.test_address,
    unsubscribeId: "testEmailFunction",
  };

  const success = await sendEmail(config, testEmailObject, body);

  if (!success) {
    spinnies.fail("test-email", {
      color: "red",
      text: "Failed to send test email.",
    });
    return false;
  }

  spinnies.succeed("test-email", {
    color: "green",
    text: `Email sent! Please check your ${testEmailObject.email} inbox.`,
  });

  const didRecieve = await prompt([
    {
      name: "got_email",
      type: "confirm",
      message: chalk.cyan("Did you receive the email? Is it correct?"),
    },
  ]);

  if (!didRecieve.got_email) {
    console.error(chalk.red("Test email unsuccessful. Exiting process..."));
    return false;
  }
  console.info(chalk.green("Test email succeeded!"));
  return true;
};
