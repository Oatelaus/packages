import { getSecret } from "@aws-lambda-powertools/parameters/secrets";

export type RequiredEnvironmentProperties = {
  APP_ID: string;
  SECRET_KEY_PRIVATE_KEY: string;
  SECRET_KEY_WEBHOOK_SECRET: string;
} & Record<string, string>;

export async function getEnvironmentVariables() {
  const environmentVariables = process.env as RequiredEnvironmentProperties;

  const appId: string | undefined = environmentVariables.APP_ID;

  const privateKey: string | undefined = await getSecret(
    environmentVariables.SECRET_KEY_PRIVATE_KEY
  );

  const secret: string | undefined = await getSecret(
    environmentVariables.SECRET_KEY_WEBHOOK_SECRET
  );

  return {
    appId,
    privateKey,
    secret,
  };
}
