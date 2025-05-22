import { Octokit } from "octokit";
import {
  EmitterWebhookEventName,
  EmitterWebhookEvent,
} from "@octokit/webhooks";

export type WebhookHandlerArgs<E extends EmitterWebhookEventName> = {
  octokit: Octokit;
} & EmitterWebhookEvent<E>;
