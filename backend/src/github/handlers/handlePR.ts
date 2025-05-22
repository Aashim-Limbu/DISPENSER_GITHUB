import { EmitterWebhookEvent } from "@octokit/webhooks";
import { Octokit } from "octokit";
import { WebhookHandlerArgs } from "../../types/WebHookHandlers";

export type PullRequestOpenedEvent = WebhookHandlerArgs<"pull_request.opened">;
//   EmitterWebhookEvent<"pull_request.opened"> & {
//     octokit: Octokit;
//   };

export async function handlePullRequestOpened({
  octokit,
  payload,
}: PullRequestOpenedEvent) {
  const messageForNewPRs =
    "Thanks for opening a new PR! Please follow our contributing guidelines to make your PR easier to review.";
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
