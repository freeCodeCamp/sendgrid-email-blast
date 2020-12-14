import { prompt } from "inquirer";
import ora from "ora";
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
      message: "Do you want to send a test email?",
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
      message: "Please enter your test address",
    },
  ]);

  const spinner = ora("Sending test email...").start();

  const testEmailObject: EmailInt = {
    email: testAddress.test_address,
    unsubscribeId: "testEmailFunction",
  };

  const success = await sendEmail(config, testEmailObject, body);

  if (!success) {
    spinner.fail("Failed to send test email.");
    return false;
  }

  spinner.succeed(
    `Email sent! Please check your ${testEmailObject.email} inbox.`
  );

  const didRecieve = await prompt([
    {
      name: "got_email",
      type: "confirm",
      message: "Did you receive the email? Is it correct?",
    },
  ]);

  if (!didRecieve.got_email) {
    console.error("Test email unsuccessful. Exiting process...");
    return false;
  }
  console.info("Test email succeeded!");
  return true;
};
