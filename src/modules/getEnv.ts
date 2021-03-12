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

/**
 * Verifies the four environment variables needed for the send script.
 * Confirms correct email and subject line with user.
 * @returns {ConfigInt} Returns the configuration object. The valid property is true
 * on success, false on missing/invalid values.
 */
export const getEnv = async (): Promise<ConfigInt> => {
  const results: ConfigInt = {
    apiKey: "",
    fromAddress: "",
    subject: "",
    valid: false,
  };
  /**
   * Start a spinner for this process.
   */
  spinnies.add("env-check", {
    color: "cyan",
    text: "Validating .env",
  });

  /**
   * Checks that all required environment variables are present!
   */
  if (!process.env.SENDGRID_KEY) {
    spinnies.fail("env-check", {
      color: "red",
      text: "Missing SendGrid API key!",
    });
    return results;
  }
  results.apiKey = process.env.SENDGRID_KEY;

  const fromAddress = process.env.SENDGRID_FROM;
  if (!fromAddress) {
    spinnies.fail("env-check", {
      color: "red",
      text: "Missing sender email address!",
    });
    return results;
  }
  results.fromAddress = fromAddress;

  results.subject = process.env.MAIL_SUBJECT || "Weekly Update";

  spinnies.succeed("env-check", {
    color: "green",
    text: "Environment variables validated!",
  });
  /**
   * Prompts the user for manual confirmation of email and subject fields.
   */
  const validateEnv = await prompt([
    {
      type: "confirm",
      message: chalk.cyan(
        `Is ${chalk.yellow(fromAddress)} the correct email address?`
      ),
      name: "email_valid",
    },
    {
      type: "confirm",
      message: chalk.cyan(
        `Is ${chalk.yellow(results.subject)} the correct subject line?`
      ),
      name: "subject_valid",
    },
  ]);

  if (!validateEnv.email_valid) {
    console.info(chalk.red("Email is incorrect. Exiting process..."));
    return results;
  }

  if (!validateEnv.subject_valid) {
    console.info(chalk.red("Subject is incorrect. Exiting process..."));
    return results;
  }

  results.valid = true;
  return results;
};
