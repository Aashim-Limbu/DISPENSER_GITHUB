import dotenv from "dotenv";
import fs from "fs";
import { App } from "octokit";
import path from "path";
dotenv.config();

const appId = process.env.APP_ID!;
const webhookSecret = process.env.WEBHOOK_SECRET!;
const privateKeyPath = process.env.PRIVATE_KEY_PATH!;
const privateKey = fs.readFileSync(path.resolve(privateKeyPath), "utf8");
export const app = new App({
  appId,
  privateKey,
  webhooks: {
    secret: webhookSecret,
  },
});
import "./webhook";
