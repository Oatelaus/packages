import { APIGatewayProxyEvent } from "aws-lambda";
import { useProbot } from "./probot";
import { WebhookEventName } from "@octokit/webhooks-types";

const SafeSettings = require("safe-settings");

module.exports.webhook = async function (event: APIGatewayProxyEvent) {
  const { body: payload } = event;

  const {
    "x-github-delivery": id,
    "x-hub-signature-256": signature,
    "x-github-event": name,
  } = event.headers;

  if (!payload || !signature || !id || !name) {
    return new Response("Bad request", { status: 400 });
  }

  const { webhooks } = await useProbot(SafeSettings);

  await webhooks.verifyAndReceive({
    id,
    name: name as WebhookEventName,
    payload,
    signature,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
};

module.exports.scheduler = async function () {
  const probot = await useProbot();
  const app = SafeSettings(probot, {});
  return app.syncInstallation();
};
