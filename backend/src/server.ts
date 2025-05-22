// src/server.ts
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

const appId = process.env.APP_ID!;
const webhookSecret = process.env.WEBHOOK_SECRET!;
const privateKeyPath = process.env.PRIVATE_KEY_PATH!;

// Load the private key from file
const privateKey = fs.readFileSync(path.resolve(privateKeyPath), "utf8");

// Create the Octokit App instance
const app = new App({
  appId,
  privateKey,
  webhooks: {
    secret: webhookSecret,
  },
});

// Message to post on PR creation
const messageForNewPRs =
  "Thanks for opening a new PR! Please follow our contributing guidelines to make your PR easier to review.";

// Handle PR opened events
async function handlePullRequestOpened({ octokit, payload }: any) {
  console.log(
    `Received a pull request event for #${payload.pull_request.number}`
  );

  try {
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issue_number: payload.pull_request.number,
        body: messageForNewPRs,
        headers: {
          "x-github-api-version": "2022-11-28",
        },
      }
    );
  } catch (error: any) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
      );
    }
    console.error(error);
  }
}

// Register webhook listener
app.webhooks.on("pull_request.opened", handlePullRequestOpened);

// Error handling
app.webhooks.onError((error: any) => {
  if (error.name === "AggregateError") {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});
app.webhooks.onAny(({ id, name }) => {
  console.log(`[Webhook] Received event: ${name}, ID: ${id}`);
});

// Express server setup
const expressApp = express();
const port = 3000;
const webhookPath = "/api/webhook";

// Use Octokit's middleware with Express
expressApp.use(
  webhookPath,
  createNodeMiddleware(app.webhooks, { path: webhookPath })
);

// Basic health check route
expressApp.get("/", (_req: Request, res: Response) => {
  res.send("GitHub App is running.");
});

expressApp.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(
    `📬 Listening for GitHub events at http://localhost:${port}${webhookPath}`
  );
});
