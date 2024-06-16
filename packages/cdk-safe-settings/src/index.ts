import { Duration } from "aws-cdk-lib";
import {
  FunctionUrl,
  FunctionUrlAuthType,
  ParamsAndSecretsLayerVersion,
  ParamsAndSecretsVersions,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import type { RequiredEnvironmentProperties } from "../lambda/secrets";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { join, resolve } from "path";

export interface SafeSettingsProps {
  appId: string;
  privateKeySecret?: Secret;
  webhookSecret?: Secret;
}

export class SafeSettings extends Construct {
  privateKeySecret: Secret;
  webhookSecret: Secret;

  webhooksFunction: NodejsFunction;
  cronFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: SafeSettingsProps) {
    super(scope, id);

    this.privateKeySecret =
      props.privateKeySecret ?? new Secret(this, "private-key-secret");

    this.webhookSecret =
      props.webhookSecret ?? new Secret(this, "webhook-secret");

    const environment: RequiredEnvironmentProperties = {
      APP_ID: props.appId,
      SECRET_KEY_PRIVATE_KEY: this.privateKeySecret.secretName,
      SECRET_KEY_WEBHOOK_SECRET: this.webhookSecret.secretName,
    };

    const commonFunctionProperties: Partial<NodejsFunctionProps> = {
      runtime: Runtime.NODEJS_20_X,
      environment,
      memorySize: 256,
      timeout: Duration.minutes(15),
      paramsAndSecrets: ParamsAndSecretsLayerVersion.fromVersion(
        ParamsAndSecretsVersions.V1_0_103
      ),
      entry: resolve(__dirname, "..", "lambda", "index.js"),
      bundling: {
        commandHooks: {
          afterBundling: (inputDir: string, outputDir: string): string[] => {
            const templatePath = join(
              inputDir,
              "node_modules",
              "safe-settings",
              "lib",
              "commentmessage.eta"
            );
            // We need to take the eta template and place it at the root level next to the bundled output.
            return [`cp ${templatePath} ${outputDir}`];
          },
          // These are not needed but we need to define them otherwise we get errors.
          beforeBundling: (
            _inputDir: string,
            _outputDir: string
          ): string[] => [],
          beforeInstall: (
            _inputDir: string,
            _outputDir: string
          ): string[] => [],
        },
      },
    };

    this.webhooksFunction = new NodejsFunction(this, "webhook", {
      ...commonFunctionProperties,
      handler: "webhook",
    });

    this.cronFunction = new NodejsFunction(this, "scheduler", {
      ...commonFunctionProperties,
      handler: "scheduler",
    });

    [this.privateKeySecret, this.webhookSecret].forEach((secret) => {
      secret.grantRead(this.webhooksFunction);
      secret.grantRead(this.cronFunction);
    });

    new Rule(this, "schedule", {
      schedule: Schedule.rate(Duration.days(1)),
      targets: [new LambdaFunction(this.cronFunction)],
      enabled: true,
    });
  }
}
