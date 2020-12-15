import chalk from "chalk";
import { prompt } from "inquirer";
import ora from "ora";
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
    templateId: "",
    subject: "",
    valid: false,
  };
  /**
   * Start a spinner for this process.
   */
  const envCheck = ora(chalk.cyan.bgBlack("Validating ENV")).start();

  /**
   * Checks that all required environment variables are present!
   */
  if (!process.env.SENDGRID_KEY) {
    envCheck.fail(chalk.red.bgBlack("Missing SendGrid API key!"));
    return results;
  }
  results.apiKey = process.env.SENDGRID_KEY;

  const fromAddress = process.env.SENDGRID_FROM;
  if (!fromAddress) {
    envCheck.fail(chalk.red.bgBlack("Missing sender email address!"));
    return results;
  }
  results.fromAddress = fromAddress;

  const sgTemplate = process.env.SENDGRID_TEMPLATE;
  if (!sgTemplate) {
    envCheck.fail(chalk.red.bgBlack("Missing SendGrid template ID!"));
    return results;
  }
  results.templateId = sgTemplate;

  results.subject = process.env.MAIL_SUBJECT || "Weekly Update";

  envCheck.succeed(chalk.green.bgBlack("Environment Variables Validated!"));
  /**
   * Prompts the user for manual confirmation of email and subject fields.
   */
  const validateEnv = await prompt([
    {
      type: "confirm",
      message: chalk.cyan.bgBlack(
        `Is ${chalk.yellow.bgBlack(fromAddress)} the correct email address?`
      ),
      name: "email_valid",
    },
    {
      type: "confirm",
      message: chalk.cyan.bgBlack(
        `Is ${chalk.yellow.bgBlack(results.subject)} the correct subject line?`
      ),
      name: "subject_valid",
    },
  ]);

  if (!validateEnv.email_valid) {
    console.info(chalk.red.bgBlack("Email is incorrect. Exiting process..."));
    return results;
  }

  if (!validateEnv.subject_valid) {
    console.info(chalk.red.bgBlack("Subject is incorrect. Exiting process..."));
    return results;
  }

  results.valid = true;
  return results;
};
