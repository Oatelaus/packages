import { ApplicationFunction, Probot } from "probot";
import { getEnvironmentVariables } from "./secrets";

let probot: Probot;

export async function useProbot(
  safeSettings?: ApplicationFunction
): Promise<Probot> {
  if (!probot) {
    const config = await getEnvironmentVariables();

    probot = new Probot(config);

    if (safeSettings) {
      await probot.load(safeSettings);
    }
  }

  return probot;
}
