import { setApiKey } from "@sendgrid/mail";
import chalk from "chalk";
import { MultiBar, Presets } from "cli-progress";
import dotenv from "dotenv";
import { createWriteStream } from "fs-extra";
import { join } from "path";
import { emailTest } from "./modules/emailTest";
import { getBody } from "./modules/getBody";
import { getBounced } from "./modules/getBounced";
import { getEnv } from "./modules/getEnv";
import { getValid } from "./modules/getValid";
import { sendEmail } from "./modules/sendEmail";
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

  if (!validList.length) {
    return;
  }

  /**
   * Begin a write stream to log the failed email attempts.
   */
  const failedPath = join(__dirname + "/failedEmails.csv");
  const failureStream = createWriteStream(failedPath);
  failureStream.write("email,unsubscribeId\n");

  /**
   * Run the send function on each email.
   */

  const emailTotal = validList.length;

  console.info(chalk.magenta.underline.bgBlack("Email Send Progress:"));

  const progress = new MultiBar(
    { clearOnComplete: false, hideCursor: true, format: barFormatter },
    Presets.shades_classic
  );

  const totalBar = progress.create(emailTotal, 0, { file: "Processed" });
  const sentBar = progress.create(emailTotal, 0, { file: "Sent" });
  const failedBar = progress.create(emailTotal, 0, { file: "Failed" });
  const skippedBar = progress.create(emailTotal, 0, { file: "Skipped" });

  for (let i = 0; i < emailTotal; i++) {
    totalBar.increment();
    const targetEmail = validList[i];
    if (bouncedList.includes(targetEmail.email)) {
      skippedBar.increment();
      continue;
    }
    const status = await sendEmail(configuration, targetEmail, body);
    if (!status) {
      failedBar.increment();
      failureStream.write(`${targetEmail.email},${targetEmail.unsubscribeId}`);
    } else {
      sentBar.increment();
    }
  }

  progress.stop();

  /**
   * TODO: Loop while failed emails exist and send again
   */

  console.info(
    chalk.green.bgBlack("Email blast complete! Have a nice day! :)")
  );
})();
