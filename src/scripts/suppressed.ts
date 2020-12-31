import { createWriteStream } from "fs-extra";
import path from "path";
import client from "@sendgrid/client";
import { ClientRequest } from "@sendgrid/client/src/request";
import { config } from "dotenv";
import { blockInt, bounceInt, spamInt } from "../interfaces/suppressedInt";
import ora from "ora";
import chalk from "chalk";

config();

const filePath = path.join(__dirname + "/../bouncedEmails.csv");
const writeStream = createWriteStream(filePath);

writeStream.write("email\n");

client.setApiKey(process.env.SENDGRID_KEY || "");

const getBlocked = async () => {
  try {
    const queryParams = {
      start_time: 1,
    };
    const request: ClientRequest = {
      qs: queryParams,
      method: "GET",
      url: "/v3/suppression/blocks",
    };

    const [_, body] = await client.request(request);

    body.forEach((object: blockInt) => {
      writeStream.write(object.email + "\n");
    });
  } catch (err) {
    console.error(err);
    console.error(
      chalk.red.bgBlack("Failed to get blocked emails. Terminating process.")
    );
    process.exit(1);
  }
};

const getBounced = async () => {
  try {
    const queryParams = {
      start_time: 1,
    };
    const request: ClientRequest = {
      qs: queryParams,
      method: "GET",
      url: "/v3/suppression/bounces",
    };

    const [_, body] = await client.request(request);

    body.forEach((object: bounceInt) => {
      writeStream.write(object.email + "\n");
    });
  } catch (err) {
    console.error(err);
    console.error(
      chalk.red.bgBlack("Failed to get bounced emails. Terminating process.")
    );
    process.exit(1);
  }
};

const getSpam = async () => {
  try {
    const queryParams = {
      start_time: 1,
    };
    const request: ClientRequest = {
      qs: queryParams,
      method: "GET",
      url: "/v3/suppression/spam_reports",
    };

    const [_, body] = await client.request(request);

    body.forEach((object: spamInt) => {
      writeStream.write(object.email + "\n");
    });
  } catch (err) {
    console.error(err);
    console.error(
      chalk.red.bgBlack(
        "Failed to get spam report emails. Terminating process."
      )
    );
    process.exit(1);
  }
};

export const fetchSuppressedEmails = async (): Promise<void> => {
  const blockedSpinner = ora(
    chalk.cyan.bgBlack("Fetching blocked emails...")
  ).start();
  await getBlocked();
  blockedSpinner.succeed(chalk.green.bgBlack("Blocked emails obtained!"));
  const bouncedSpinner = ora(
    chalk.cyan.bgBlack("Fetching bounced emails...")
  ).start();
  await getBounced();
  bouncedSpinner.succeed(chalk.green.bgBlack("Bounced emails obtained!"));
  const spamSpinner = ora(
    chalk.cyan.bgBlack("Fetching spam reports...")
  ).start();
  await getSpam();
  spamSpinner.succeed(chalk.green.bgBlack("Spam reports obtained!"));
};
