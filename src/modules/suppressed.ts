import { createWriteStream } from "fs-extra";
import path from "path";
import client from "@sendgrid/client";
import { ClientRequest } from "@sendgrid/client/src/request";
import { blockInt, bounceInt, spamInt } from "../interfaces/suppressedInt";
import Spinnies from "spinnies";
const spinnies = new Spinnies({
  spinner: {
    interval: 80,
    frames: [
      "▰▱▱▱▱▱▱",
      "▰▰▱▱▱▱▱",
      "▰▰▰▱▱▱▱",
      "▰▰▰▰▱▱▱",
      "▰▰▰▰▰▱▱",
      "▰▰▰▰▰▰▱",
      "▰▰▰▰▰▰▰",
      "▰▱▱▱▱▱▱",
    ],
  },
});
import { ConfigInt } from "../interfaces/configInt";

export const fetchSuppressedEmails = async (
  config: ConfigInt
): Promise<void> => {
  client.setApiKey(config.apiKey);
  const filePath = path.join(__dirname + "/../bouncedEmails.csv");
  const writeStream = createWriteStream(filePath);

  writeStream.write("email\n");

  const getBlocked = async () => {
    spinnies.add("get-blocked", {
      color: "cyan",
      text: "Getting blocked emails...",
    });
    try {
      const queryParams = {
        start_time: 1,
        limit: 500,
        offset: 0,
      };
      const request: ClientRequest = {
        qs: queryParams,
        method: "GET",
        url: "/v3/suppression/blocks",
      };

      let [response, body] = await client.request(request);

      if (response.statusCode !== 200) {
        spinnies.fail("get-blocked", {
          color: "red",
          text:
            "API call for blocked emails was rejected. Terminating process.",
        });
        process.exit(1);
      }

      spinnies.update("get-blocked", {
        text: `Getting blocked emails ${queryParams.offset} through ${
          queryParams.offset + 500
        }. Rate limit at ${response.headers["x-ratelimit-remaining"]}`,
      });

      body.forEach((object: blockInt) => {
        writeStream.write(object.email + "\n");
      });

      while (body.length) {
        queryParams.offset += body.length;
        [response, body] = await client.request(request);
        spinnies.update("get-blocked", {
          text: `Getting blocked emails ${queryParams.offset} through ${
            queryParams.offset + 500
          }. Rate limit at ${response.headers["x-ratelimit-remaining"]}`,
        });
        if (body.length) {
          body.forEach((object: blockInt) => {
            writeStream.write(object.email + "\n");
          });
        }
      }
    } catch (err) {
      console.error(err);
      spinnies.fail("get-blocked", {
        color: "red",
        text: "Failed to get blocked emails. Terminating process.",
      });
      process.exit(1);
    }
    spinnies.succeed("get-blocked", {
      color: "green",
      text: "Blocked emails obtained!",
    });
  };

  const getBounced = async () => {
    spinnies.add("get-bounced", {
      color: "cyan",
      text: "Getting bounced emails...",
    });
    try {
      const queryParams = {
        start_time: 1,
      };
      const request: ClientRequest = {
        qs: queryParams,
        method: "GET",
        url: "/v3/suppression/bounces",
      };

      const [response, body] = await client.request(request);

      spinnies.update("get-bounced", {
        text: `Getting bounced emails. Rate limit at ${response.headers["x-ratelimit-remaining"]}`,
      });

      if (response.statusCode !== 200) {
        spinnies.fail("get-bounced", {
          color: "red",
          text:
            "API call for bounced emails was rejected. Terminating process.",
        });
        process.exit(1);
      }

      body.forEach((object: bounceInt) => {
        writeStream.write(object.email + "\n");
      });
    } catch (err) {
      console.error(err);
      spinnies.fail("get-bounced", {
        color: "red",
        text: "Failed to get bounced emails. Terminating process.",
      });
      process.exit(1);
    }
    spinnies.succeed("get-bounced", {
      color: "green",
      text: "Got bounced emails!",
    });
  };

  const getSpam = async () => {
    spinnies.add("get-spam", {
      color: "cyan",
      text: "Getting spam emails...",
    });
    try {
      const queryParams = {
        start_time: 1,
        limit: 500,
        offset: 0,
      };
      const request: ClientRequest = {
        qs: queryParams,
        method: "GET",
        url: "/v3/suppression/spam_reports",
      };

      let [response, body] = await client.request(request);

      spinnies.update("get-spam", {
        text: `Getting spam emails ${queryParams.offset} through ${
          queryParams.offset + 500
        }. Rate limit at ${response.headers["x-ratelimit-remaining"]}`,
      });

      if (response.statusCode !== 200) {
        spinnies.fail("get-spam", {
          color: "red",
          text: "API call for spam emails was rejected. Terminating process.",
        });
        process.exit(1);
      }

      body.forEach((object: spamInt) => {
        writeStream.write(object.email + "\n");
      });

      while (body.length) {
        queryParams.offset += body.length;
        [response, body] = await client.request(request);
        spinnies.update("get-spam", {
          text: `Getting spam emails ${queryParams.offset} through ${
            queryParams.offset + 500
          }. Rate limit at ${response.headers["x-ratelimit-remaining"]}`,
        });
        if (body.length) {
          body.forEach((object: blockInt) => {
            writeStream.write(object.email + "\n");
          });
        }
      }
    } catch (err) {
      console.error(err);
      spinnies.fail("get-spam", {
        color: "red",
        text: "Failed to get spam report emails. Terminating process.",
      });
      process.exit(1);
    }
    spinnies.succeed("get-spam", {
      color: "green",
      text: "Got spam emails!",
    });
  };

  await getBlocked();

  await getBounced();

  await getSpam();
};
