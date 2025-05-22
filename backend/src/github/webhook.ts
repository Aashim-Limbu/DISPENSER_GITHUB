import { app } from "./app";
import { handlePullRequestOpened } from "./handlers/handlePR";

app.webhooks.on("issue_comment.created", ({ octokit, payload }) => {
  const comment = payload.comment.body.trim();
  const commenter = payload.comment.user?.login;
  const repoOwner = payload.repository.owner.login;
  const repoName = payload.repository.name;
  const regex = /^\/eth\s+(\d+(\.\d+)?)\s+@(\w+)/i;

  const match = comment.match(regex);
  if (!match) {
    return;
  }
  if (commenter != repoOwner) {
    return console.error(`Access denied`);
  }
  const amount = parseFloat(match[1]);
  const reciever = match[2];

  console.log(
    `Boundty Command Detected! Amount: ${amount} ETH to @${reciever}`
  );
});

app.webhooks.on("pull_request.opened", handlePullRequestOpened);

app.webhooks.onError((error: any) => {
  if (error.name === "AggregateError") {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});
