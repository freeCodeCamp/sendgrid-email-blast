import dotenv from "dotenv";
dotenv.config();
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import path from "path";
import { readFile } from "fs";

if (!process.env.SENDGRID_KEY) {
  console.error("Missing SendGrid Key");
  process.exit(1);
}

const fromAddress = process.env.SENDGRID_FROM;

if (!fromAddress) {
  console.error("Missing sender email address!");
  process.exit(1);
}

const sgTemplate = process.env.SENDGRID_TEMPLATE;

if (!sgTemplate) {
  console.error("Missing SendGrid Template ID");
  process.exit(1);
}

const subjectValue = process.env.MAIL_SUBJECT || "Weekly Update";

sgMail.setApiKey(process.env.SENDGRID_KEY);

const filePath = path.join(__dirname + "/../validEmails.csv");

readFile(filePath, "utf8", async (err, data) => {
  console.info("Reading email list...");
  if (err) {
    console.error(err);
    process.exit(1);
  }
  /**
   * Parse CSV - remove first line, create email/unsubscribeId objects,
   * remove any objects with null email address as error handling method.
   * TODO: Better method for parsing CSV?
   */
  const dataList = data
    .split("\n")
    .slice(1)
    .map((el) => ({
      email: el.split(",")[0],
      unsubscribeId: el.split(",")[1],
    }))
    .filter((el) => el.email);
  console.info("Email list obtained - beginning send process!");

  /**
   * Iterate through each to grab data needed for template
   * and send email with that data. Rate limit is 10,000 mails
   * per second, so should not need to throttle this...
   */
  dataList.forEach(async (user) => {
    console.info(user.email, user.unsubscribeId);
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
    await sgMail.send(msg).catch((err) => {
      console.error(err);
      console.error(`Message sending failed! Could not send to ${user.email}!`);
    });
  });
  console.info("Emails sent! Have a nice day!");
});
