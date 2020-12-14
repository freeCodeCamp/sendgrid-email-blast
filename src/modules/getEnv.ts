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
  const envCheck = ora("Validating ENV").start();

  /**
   * Checks that all required environment variables are present!
   */
  if (!process.env.SENDGRID_KEY) {
    envCheck.fail("Missing SendGrid API key!");
    return results;
  }
  results.apiKey = process.env.SENDGRID_KEY;

  const fromAddress = process.env.SENDGRID_FROM;
  if (!fromAddress) {
    envCheck.fail("Missing sender email address!");
    return results;
  }
  results.fromAddress = fromAddress;

  const sgTemplate = process.env.SENDGRID_TEMPLATE;
  if (!sgTemplate) {
    envCheck.fail("Missing SendGrid template ID!");
    return results;
  }
  results.templateId = sgTemplate;

  results.subject = process.env.MAIL_SUBJECT || "Weekly Update";

  envCheck.succeed("Environment Variables Validated!");
  /**
   * Prompts the user for manual confirmation of email and subject fields.
   */
  const validateEnv = await prompt([
    {
      type: "confirm",
      message: `Is ${fromAddress} the correct email address?`,
      name: "email_valid",
    },
    {
      type: "confirm",
      message: `Is ${results.subject} the correct subject line?`,
      name: "subject_valid",
    },
  ]);

  if (!validateEnv.email_valid) {
    console.info("Email is incorrect. Exiting process...");
    return results;
  }

  if (!validateEnv.subject_valid) {
    console.info("Subject is incorrect. Exiting process...");
    return results;
  }

  results.valid = true;
  return results;
};
