# SendGrid Email Blast

This is a Node.js tool to send email blasts through the SendGrid API. Use of this tool is done entirely through the CLI.

# Using the Tool

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

- `MONGO_URI`: This is the full connection string for your MongoDB instance.
- `MONGO_DB`: This is the name of the database to use.
- `MONGO_USER`: This is the username to use for MongoDB authentication.
- `MONGO_PASSWORD`: This is the password to use for MongoDB authentication.
- `SENDGRID_KEY`: This is your SendGrid API key.
- `SENDGRID_FROM`: This is the email address to send the emails _from_. This needs to be added to your SendGrid account as an authorised sender before emails can be sent.
- `MAIL_SUBJECT`: This is the content to appear in the subject line of the email.

## Seeding the Database

**NOTE:** This step should _only_ be performed if you are working with a development database for testing purposes. If you are working with a live production database, skip to the next section.

To seed some mock data into your database for testing this tool, run the following command:

```bash
npm run db:seed
```

This will generate a couple of documents to test this tool against.

## Generating an Email List

If you have not run this tool before, you will need to generate your email list (saved as a `.csv`) from the database. Run the following command to do so:

```bash
npm run email:fetch
```

This will grab the user data from the database and write the `email` and `unsubscribeId` fields to the `validEmails.csv` file.

## Create other files

Within your `prod` directory, you will need to ensure the presence of the following files:

- `bouncedEmails.csv`: This is a file to track your bounced email addresses (to avoid sending to them again). Create this with a line that contains `email`. _You will need to create this manually_.
- `validEmails.csv`: This is the file containing the list of email + unsubscribeId values to send the emails to. The `fetch` script will create this.
- `failedEmails.csv`: This is the file containing the list of errored emails from a send request. The `send` script will create this.
- `emailBody.txt`: This is the file containing the plain-text body of your email to send.

## Sending your email!

To send your email to the `validEmails.csv` list, run:

```bash
npm run start
```

The tool will walk you through the steps to confirm everything is set correctly, generate a test email, and send the full blast.

Congratulations! Assuming all of your settings are correct, you have successfully sent your first email!

## Error Handling

As you scale up your email list, you may run in to connection issues and other errors. Emails that fail are written to the `failedEmails.csv` file. When the script is complete, you can manually copy those emails to the `validEmails.csv` file (overwriting the current contents) and run the `email:send` script again.

## Credits

The `seed` and `fetch` scripts were ported to TypeScript from freeCodeCamp's JavaScript versions.
