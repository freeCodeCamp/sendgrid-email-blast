import { MailDataRequired, send } from "@sendgrid/mail";
import { createWriteStream } from "fs-extra";
import { join } from "path";
import { ConfigInt } from "../interfaces/configInt";
import { EmailInt } from "../interfaces/emailInt";

/**
 * Sends an email with the passed configuration and body to the passed email address.
 * Replaces the {{{unsubscribeId}}} body string with the email's actual unsubscribeId.
 * @param {ConfigInt} config The configuration object from getEnv
 * @param {EmailInt} email The email and unsubscribeId to send to
 * @param {string} body The email body text from emailBody.txt
 * @returns {Promise<boolean>} Returns true on success, false on error
 */
export const sendEmail = async (
  config: ConfigInt,
  email: EmailInt,
  body: string
): Promise<boolean> => {
  /**
   * Break out of process if missing email or unsubscribeId
   */
  if (!email.email || !email.unsubscribeId) {
    return false;
  }
  /**
   * Construct SendGrid message object.
   */
  const message: MailDataRequired = {
    to: email.email,
    from: config.fromAddress,
    subject: config.subject,
    text: body.replace("{{{unsubscribeId}}}", email.unsubscribeId),
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
   * Create error logging stream
   */
  const filepath = join(__dirname + "/../errorLog.txt");
  const errorStream = createWriteStream(filepath);

  try {
    const success = await send(message);
    const successCode = success[0].statusCode;
    if (successCode !== 200 && successCode !== 202) {
      return false;
    }
    return true;
  } catch (err) {
    errorStream.write(`${err.errno} - ${err.code}: ${email.email}`);
    return false;
  }
};
