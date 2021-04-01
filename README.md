# SendGrid Email Blast

This is a Node.js tool to send email blasts through the SendGrid API. Use of this tool is done entirely through the CLI.

## Using the Tool

Using this tool will require an initial setup.

## Initial Setup

First, ensure you have the latest version of Node (14 LTS) installed. Then run the command to install the requisite packages:

```bash
npm install
```

This project is built with TypeScript, so the files need to be built. You can compile the files with:

```bash
npm run build
```

The compiled files will be saved in a `prod` directory, which `git` will not track.

You will also need to configure your environment variables. You can copy the `sample.env` to a `.env` file, or create the `.env` file from scratch. Then, set the following values:

- `SENDGRID_KEY`: This is your SendGrid API key.
- `SENDGRID_FROM`: This is the email address to send the emails _from_. This needs to be added to your SendGrid account as an authorised sender or verified domain before emails can be sent.
- `MAIL_SUBJECT`: This is the content to appear in the subject line of the email.

## Create other files

Within your `prod` directory, you will need to ensure the presence of the following files:

- `bouncedEmails.csv`: This is a file to track your bounced email addresses (to avoid sending to them again). The CLI will create this.
- `validEmails.csv`: This is the file containing the list of email + unsubscribeId values to send the emails to. This must be created manually.
- `failedEmails.csv`: This is the file containing the list of errored emails from a send request. The `send` script will create this.
- `emailBody.txt`: This is the file containing the plain-text body of your email to send. This must be created manually.

## Sending your email

To send your email to the `validEmails.csv` list, run:

```bash
npm run start
```

The tool will walk you through the steps to confirm everything is set correctly, generate a test email, and send the full blast. Please review [the CLI steps outline](./docs/cli-steps.md) for more information.

Congratulations! Assuming all of your settings are correct, you have successfully sent your first email!
