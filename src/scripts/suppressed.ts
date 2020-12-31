import { createWriteStream } from "fs-extra";
import path from "path";
import client from "@sendgrid/client";
import { ClientRequest } from "@sendgrid/client/src/request";
import { config } from "dotenv";
import { blockInt, bounceInt, spamInt } from "../interfaces/suppressedInt";
import ora from "ora";

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
  }
};

(async () => {
  const blockedSpinner = ora("Fetching blocked emails...").start();
  await getBlocked();
  blockedSpinner.succeed("Blocked emails obtained!");
  const bouncedSpinner = ora("Fetching bounced emails...").start();
  await getBounced();
  bouncedSpinner.succeed("Bounced emails obtained!");
  const spamSpinner = ora("Fetching spam reports...").start();
  await getSpam();
  spamSpinner.succeed("Spam reports obtained!");
})();
