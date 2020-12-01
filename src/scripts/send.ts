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

sgMail.setApiKey(process.env.SENDGRID_KEY);

const filePath = path.join(__dirname + "/../validEmails.csv");

readFile(filePath, "utf8", async (err, data) => {
  console.info("Reading email list...");
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const emailList = data
    .split("\n")
    .slice(1)
    .map((el) => el.split(",")[0])
    .filter((el) => el);
  console.info("Email list obtained - beginning send process!");
  const msg: MailDataRequired = {
    to: emailList,
    from: fromAddress,
    subject: "Testing the emails!",
    text: "This is a test!",
  };
  await sgMail.sendMultiple(msg).catch((err) => {
    console.error(err);
    console.error("Message sending failed!");
  });
  console.info("Emails sent! Have a nice day!");
});
