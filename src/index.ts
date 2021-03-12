import { setApiKey } from "@sendgrid/mail";
import chalk from "chalk";
import { MultiBar, Presets } from "cli-progress";
import dotenv from "dotenv";
import { createWriteStream } from "fs-extra";
import { prompt } from "inquirer";
import { join } from "path";
import { emailTest } from "./modules/emailTest";
import { getBody } from "./modules/getBody";
import { getBounced } from "./modules/getBounced";
import { getEnv } from "./modules/getEnv";
import { getValid } from "./modules/getValid";
import { sendEmail } from "./modules/sendEmail";
import { fetchSuppressedEmails } from "./modules/suppressed";
import { barFormatter } from "./tools/barFormatter";
dotenv.config();

// Anonymous function for IIFE to allow async
(async function () {
  console.info(chalk.green(`Hello! Launching email blast application.`));
  /**
   * Begin by confirming the environment variables.
   */
  const configuration = await getEnv();
  if (!configuration.valid) {
    return;
  }

  /**
   * Set the SendGrid API key
   */
  setApiKey(configuration.apiKey);

  /**
   * Prompt to fetch suppressed emails
   */
  const getSuppressedEmails = await prompt([
    {
      name: "confirmed",
      message: chalk.cyan(
        "Do you want to get the list of suppressed emails from SendGrid?"
      ),
      type: "confirm",
    },
  ]);

  if (getSuppressedEmails.confirmed) {
    await fetchSuppressedEmails(configuration);
  }

  /**
   * Get the body of the email
   */
  const body = await getBody();

  if (!body || !body.length) {
    return;
  }

  /**
   * Prompt for test email?
   */
  const testStatus = await emailTest(configuration, body);

  if (!testStatus) {
    return;
  }

  /**
   * Get the list of bounced emails.
   */
  const bouncedList = await getBounced();

  if (!bouncedList.length) {
    return;
  }

  /**
   * Get the list of valid emails.
   */
  const validList = await getValid();
  const emailTotal = validList.length;

  if (!validList.length) {
    return;
  }

  const shouldProceed = await prompt([
    {
      name: "continue",
      message: chalk.cyan(
        `Proceed with sending to ${chalk.yellow(emailTotal)} addresses?`
      ),
      type: "confirm",
    },
  ]);

  if (!shouldProceed.continue) {
    console.error(chalk.red("Process cancelled. Have a nice day."));
    return;
  }

  console.info(chalk.green("Beginning send process..."));

  /**
   * Begin a write stream to create a CSV for failed emails.
   */
  const failedPath = join(__dirname + "/failedEmails.csv");
  const failureStream = createWriteStream(failedPath);
  failureStream.write("email,unsubscribeId\n");

  /**
   * Begin a write stream to log all API calls
   */
  const logPath = join(__dirname + "/emailLog.txt");
  const logStream = createWriteStream(logPath);
  logStream.write("Status - Email - Message\n");

  /**
   * Run the send function on each email.
   */
  console.info(chalk.magenta.underline("Email Send Progress:"));

  const progress = new MultiBar(
    { clearOnComplete: false, hideCursor: true, format: barFormatter },
    Presets.shades_classic
  );

  const totalBar = progress.create(emailTotal, 0, { task: "Processed" });
  const sentBar = progress.create(emailTotal, 0, { task: "Sent" });
  const failedBar = progress.create(emailTotal, 0, { task: "Failed" });
  const skippedBar = progress.create(emailTotal, 0, { task: "Skipped" });

  for (let i = 0; i < emailTotal; i++) {
    totalBar.increment();
    const targetEmail = validList[i];
    if (bouncedList.includes(targetEmail.email)) {
      skippedBar.increment();
      logStream.write(`Skipped - ${targetEmail}`);
      continue;
    }
    const status = await sendEmail(configuration, targetEmail, body);
    if (!status.success) {
      failedBar.increment();
      failureStream.write(
        `${targetEmail.email},${targetEmail.unsubscribeId}\n`
      );
      logStream.write(
        `${status.status} - ${status.email} - ${status.logText}\n`
      );
    } else {
      logStream.write(
        `${status.status} - ${status.email} - ${status.logText}\n`
      );
      sentBar.increment();
    }
  }

  progress.stop();

  console.info(chalk.green("Email blast complete! Have a nice day! :)"));
})();
