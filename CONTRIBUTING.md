# Contributing

This tool is built for freeCodeCamp, so please ensure that all interactions comply with the [freeCodeCamp Code of Conduct](https://freecodecamp.org/news/code-of-conduct)

## Setting Up Your Code

First, fork this repository to your own account. Then use `git clone <url>` to bring your forked repository down to your local machine (remember to get the URL for *your* repository, not the original). Optionally, use `git remote add upstream <url>` to add the original repository as the upstream (this is helpful for keeping your fork up-to-date).

## Creating a SendGrid Account

This tool relies on the use of SendGrid's email platform. If you have not set up an account yet, you will need to do so. I've [written a tutorial](https://www.freecodecamp.org/news/send-email-newsletter-with-the-sendgrid-api/) that walks you through this process.

## Configuring the Environment

You will need to set the following environment variables:

```py
# These values are REQUIRED for the send tool to work.
SENDGRID_KEY="API Key for Sendgrid"
SENDGRID_FROM="Email address to send emails FROM"

# This line should be changed weekly to set that week's email subject line
MAIL_SUBJECT="Weekly Update!"
```
