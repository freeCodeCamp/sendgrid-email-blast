/**
 * Ported to TypeScript from the freeCodeCamp scripts repository.
 */

import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { createWriteStream } from "fs";
import { Stream } from "stream";
import validator from "validator";
import { validate } from "email-validator";
import { MongoClient } from "mongodb";
import ora from "ora";
import chalk from "chalk";

export const fetchDatabaseEmails = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname + "/../validEmails.csv");
    const invalidFilePath = path.join(__dirname + "/../invalidEmails.csv");

    const validOutput = createWriteStream(filePath, { encoding: "utf8" });
    const invalidOutput = createWriteStream(invalidFilePath, {
      encoding: "utf8",
    });

    validOutput.write("email,unsubscribeId\n");
    invalidOutput.write("email,unsubscribeId\n");

    const rs = new Stream.Readable({ objectMode: true });
    rs._read = function () {
      return;
    };

    rs.on("data", ({ email, unsubscribeId }) => {
      if (validator.isEmail(email)) {
        validOutput.write(`${email},${unsubscribeId}\n`);
      } else if (validate(email)) {
        validOutput.write(`${email},${unsubscribeId}\n`);
      } else {
        invalidOutput.write(`${email},${unsubscribeId}\n`);
      }
    });

    const { MONGO_DB, MONGO_URI, MONGO_USER, MONGO_PASSWORD } = process.env;

    if (!MONGO_DB || !MONGO_URI || !MONGO_USER || !MONGO_PASSWORD) {
      console.error(
        chalk.red.bgBlack(
          "Missing required environment variables. Terminating process..."
        )
      );
      reject();
      process.exit(1);
    }

    const spinner = ora(chalk.cyan.bgBlack("Compiling email list..."));
    spinner.start();

    MongoClient.connect(
      MONGO_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        auth: { user: MONGO_USER, password: MONGO_PASSWORD },
        poolSize: 20,
      },
      (err, client) => {
        if (err) {
          console.error(err);
          spinner.fail(
            chalk.red.bgBlack(
              "Failed to connect to database. Terminating process..."
            )
          );
          process.exit(1);
        }
        const db = client.db(MONGO_DB);

        const stream = db
          .collection("user")
          .find(
            {
              $and: [
                { email: { $exists: true } },
                { email: { $ne: "" } },
                { email: { $ne: null } },
                { email: { $not: /(test|fake)/i } },
                {
                  $or: [
                    { sendQuincyEmail: true },
                    { sendQuincyEmail: { $exists: false } },
                    { sendQuincyEmail: null },
                  ],
                },
              ],
            },
            {
              projection: {
                email: 1,
                unsubscribeId: 1,
              },
            }
          )
          .batchSize(100)
          .stream();

        stream.on("data", ({ email, unsubscribeId }) => {
          const data = { email, unsubscribeId };
          spinner.text = `Getting info for: ${email}\n`;
          rs.push(data);
        });

        stream.on("end", () => {
          rs.push(null);
          client.close();
          spinner.succeed(
            chalk.green.bgBlack("Completed compiling mailing list.")
          );
          resolve();
          return;
        });
      }
    );
  });
};
