import { MailDataRequired, send } from "@sendgrid/mail";
import { ConfigInt } from "../interfaces/configInt";
import { EmailInt } from "../interfaces/emailInt";
import { sendReportInt } from "../interfaces/sendReportInt";

/**
 * Sends an email with the passed configuration and body to the passed email address.
 * Replaces the {{unsubscribeId}} body string with the email's actual unsubscribeId.
 * @param {ConfigInt} config The configuration object from getEnv
 * @param {EmailInt} email The email and unsubscribeId to send to
 * @param {string} body The email body text from emailBody.txt
 * @returns {Promise<sendReportInt>} Returns sendReportInt
 */
export const sendEmail = async (
  config: ConfigInt,
  email: EmailInt,
  body: string
): Promise<sendReportInt> => {
  /**
   * Break out of process if missing email or unsubscribeId
   */
  if (!email.email || !email.unsubscribeId) {
    return {
      status: "ERROR",
      success: false,
      email: email.email || "",
      logText: `Email or Unsubscribe ID missing...`,
    };
  }
  /**
   * Construct SendGrid message object.
   */
  const message: MailDataRequired = {
    to: email.email,
    from: config.fromAddress,
    subject: config.subject,
    text: body.replace("{{unsubscribeId}}", email.unsubscribeId),
    ipPoolName: "Email Blast",
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

  try {
    const success = await send(message);
    const successCode = success[0].statusCode;
    if (successCode !== 200 && successCode !== 202) {
      return {
        status: "FAILED",
        success: false,
        email: email.email,
        logText: `API reported status ${successCode}.`,
      };
    }
    return {
      status: "PASSED",
      success: true,
      email: email.email,
      logText: `Email successfully sent!`,
    };
  } catch (err) {
    return {
      status: "ERROR",
      success: false,
      email: email.email || "",
      logText: `API reported error ${err.errno}: ${err.code}`,
    };
  }
};
