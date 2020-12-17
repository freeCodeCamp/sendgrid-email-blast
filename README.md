# SendGrid Email Blast
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

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
- `SENDGRID_FROM`: This is the email address to send the emails _from_. This needs to be added to your SendGrid account as an authorised sender or verified domain before emails can be sent.
- `MAIL_SUBJECT`: This is the content to appear in the subject line of the email.

## Seeding the Database

```diff
- NOTE: This script should only be run if you are working
- with a development database instance. This WILL inject documents
- into your database.
```

To seed some mock data into your database for testing this tool, run the following command:

```bash
npm run db:seed
```

This will generate a couple of documents to test this tool against.

## Generating an Email List

Provided you have connected a database through the environment variables, you can have the tool fetch the documents from that database and parse the documents into `email,unsubscribeId` pairs. The script will validate the email addresses and only save valid email accounts. 

```diff
! NOTE: This tool was built for freeCodeCamp, and thus relies
! on some specific values to be present in the database schema.
```

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

The tool will walk you through the steps to confirm everything is set correctly, generate a test email, and send the full blast. Please review [the CLI steps outline](./docs/cli-steps.md) for more information.

Congratulations! Assuming all of your settings are correct, you have successfully sent your first email!

## Credits

The `seed` and `fetch` scripts were ported to TypeScript from freeCodeCamp's JavaScript versions.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.nhcarrigan.com"><img src="https://avatars1.githubusercontent.com/u/63889819?v=4" width="100px;" alt=""/><br /><sub><b>Nicholas Carrigan (he/him)</b></sub></a><br /><a href="#projectManagement-nhcarrigan" title="Project Management">📆</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!