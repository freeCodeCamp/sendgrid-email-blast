import { setApiKey } from "@sendgrid/mail";
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
dotenv.config();

// Anonymous function for IIFE to allow async
(async function () {
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

  const progress = new MultiBar(
    { clearOnComplete: false, hideCursor: true },
    Presets.shades_classic
  );

  const totalBar = progress.create(emailTotal, 0, { file: "Total processed" });
  const sentBar = progress.create(emailTotal, 0, { file: "Emails sent" });
  const failedBar = progress.create(emailTotal, 0, { file: "Emails failed" });
  const skippedBar = progress.create(emailTotal, 0, { file: "Emails skipped" });

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

  console.info("Email blast complete! Have a nice day! :)");
})();
