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
  console.info(
    chalk.green.bgBlack(`Hello! Launching email blast application.`)
  );
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
      message: chalk.cyan.bgBlack(
        "Do you want to get the list of suppressed emails from SendGrid?"
      ),
      type: "confirm",
    },
  ]);

  if (getSuppressedEmails.confirmed) {
    await fetchSuppressedEmails();
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
    console.error(
      chalk.red.bgBlack("No email addresses found. Check your validEmails.csv")
    );
    return;
  }

  const filteredList = validList.filter(
    (entry) => !bouncedList.includes(entry.email)
  );
  const toSendTotal = filteredList.length;

  const skippedTotal = emailTotal - toSendTotal;

  const shouldProceed = await prompt([
    {
      name: "continue",
      message: chalk.cyan.bgBlack(
        `Proceed with sending to ${chalk.yellow.bgBlack(
          toSendTotal
        )} addresses? ${chalk.yellow.bgBlack(
          skippedTotal
        )} entries will be skipped as suppressed.`
      ),
      type: "confirm",
    },
  ]);

  if (!shouldProceed.continue) {
    console.error(chalk.red.bgBlack("Process cancelled. Have a nice day."));
    return;
  }

  console.info(chalk.green.bgBlack("Beginning send process..."));

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
  console.info(chalk.magenta.underline.bgBlack("Email Send Progress:"));

  const progress = new MultiBar(
    { clearOnComplete: false, hideCursor: true, format: barFormatter },
    Presets.shades_classic
  );

  const totalBar = progress.create(toSendTotal, 0, { task: "Processed" });
  const sentBar = progress.create(toSendTotal, 0, { task: "Sent" });
  const failedBar = progress.create(toSendTotal, 0, { task: "Failed" });

  for (let i = 0; i < toSendTotal; i++) {
    totalBar.increment();
    const targetEmail = filteredList[i];
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

  console.info(
    chalk.green.bgBlack("Email blast complete! Have a nice day! :)")
  );
})();
