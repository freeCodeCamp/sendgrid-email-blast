import dotenv from "dotenv";
dotenv.config();
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import path from "path";
import { createWriteStream, readFile } from "fs";
import ora from "ora";

/**
 * If we are missing any required .env values,
 * terminate the process immediately.
 */
const envCheck = ora("Validating ENV").start();
if (!process.env.SENDGRID_KEY) {
  envCheck.fail("Missing SendGrid API key!");
  process.exit(1);
}
const fromAddress = process.env.SENDGRID_FROM;
if (!fromAddress) {
  envCheck.fail("Missing sender email address!");
  process.exit(1);
}
const sgTemplate = process.env.SENDGRID_TEMPLATE;
if (!sgTemplate) {
  envCheck.fail("Missing SendGrid template ID!");
  process.exit(1);
}
const subjectValue = process.env.MAIL_SUBJECT || "Weekly Update";
sgMail.setApiKey(process.env.SENDGRID_KEY);
envCheck.succeed("Environment Variables Validated!");

/**
 * Create variables for file paths:
 * filePath - links to email send list
 * bouncePath - links to bounced email filter
 * failedPath - links to failed email list
 */
const filePath = path.join(__dirname + "/../validEmails.csv");
const bouncePath = path.join(__dirname + "/../bouncedEmails.csv");
const failedPath = path.join(__dirname + "/../failedEmails.csv");

readFile(bouncePath, "utf8", (err, data) => {
  const readBounce = ora("Reading bounced email list...").start();
  if (err) {
    readBounce.fail("Could not read email bounce list!");
    console.error(err);
    process.exit(1);
  }
  const bounceList = data.split("\n");
  readBounce.succeed("Bounce list obtained!");

  /**
   * We need to create a write stream to allow
   * continuous and asynchronous writing of
   * the failed emails list.
   */
  const failedStream = createWriteStream(failedPath);

  /**
   * Add the header to the file.
   */
  failedStream.write("email,unsubscribeId\n");

  /**
   * The callback here needs to handle ALL of the email
   * logic as readFile does not return anything.
   */
  readFile(filePath, "utf8", async (err, data) => {
    const readEmails = ora("Reading email list...").start();

    /**
     * For error handling, terminate the process if the email
     * list cannot be read.
     */
    if (err) {
      readEmails.fail("Could not read email list!");
      console.error(err);
      process.exit(1);
    }
    /**
     * Parse CSV - remove first line, create email/unsubscribeId objects,
     * remove any objects with null email address as error handling method.
     */
    const dataList = data
      .split("\n")
      .slice(1)
      .map((el) => ({
        email: el.split(",")[0],
        unsubscribeId: el.split(",")[1],
      }))
      .filter((el) => el.email);
    readEmails.succeed("Email list obtained!");

    /**
     * Create variables for total number of emails to send
     * and current number of emails sent. We use this to log the
     * process complete message.
     */
    const emailTotal = dataList.length;
    let emailCount = 0;
    const sendEmails = ora(`Sending ${emailTotal} emails...`).start();
    /**
     * Iterate through each to grab data needed for template
     * and send email with that data. Rate limit is 10,000 mails
     * per second, so should not need to throttle this...
     */
    dataList.forEach(async (user) => {
      /**
       * Check if the target email is flagged as a bounced
       * address to protect our send rate and reputation.
       */
      if (bounceList.includes(user.email)) {
        return;
      }

      /**
       * Construct the JSON message object that the sendgrid
       * package uses. The templateID and dynamicTemplateData
       * link to the online dynamic template. The text field needs
       * to be set, even though it is replaced by the template,
       * to ensure plain-text emails are sent instead of HTML mails.
       */
      const msg: MailDataRequired = {
        to: user.email,
        from: fromAddress,
        subject: subjectValue,
        text: "Testing email text",
        templateId: sgTemplate,
        dynamicTemplateData: {
          subject: subjectValue,
          unsubscribeString: `https://www.freecodecamp.org/ue/${user.unsubscribeId}`,
        },
        trackingSettings: {
          clickTracking: {
            enable: false,
            enableText: false,
          },
          openTracking: {
            enable: false,
          },
          subscriptionTracking: {
            enable: false,
          },
        },
      };

      /**
       * Asynchronously send the emails.
       */
      await sgMail
        .send(msg)
        .then(() => {
          /**
           * Log a successful send request.
           */
        })
        .catch(() => {
          /**
           * If a send fails, log the basic error information to
           * avoid flooding the console, then pass the email and
           * unsubscribeId through the fs stream to create csv.
           * This process allows those emails to be copied to
           * the validEmails.csv to make another send attempt.
           */
          failedStream.write(`${user.email},${user.unsubscribeId}\n`);
        });
      emailCount++;
      if (emailCount === emailTotal) {
        sendEmails.succeed(`${emailTotal} emails sent! Have a nice day!`);
      }
    });
  });
});
