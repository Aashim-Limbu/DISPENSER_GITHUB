// src/server.ts
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { createNodeMiddleware } from "@octokit/webhooks";
import { app } from "./github/app";

dotenv.config();
const expressApp = express();
const port = process.env.PORT || 3000;
const webhookPath = "/api/webhook";

expressApp.use(createNodeMiddleware(app.webhooks, { path: webhookPath }));
expressApp.get("/", (_req: Request, res: Response) => {
  res.send("GitHub App is running.");
});

expressApp.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(
    `📬 Listening for GitHub events at http://localhost:${port}${webhookPath}`
  );
});
