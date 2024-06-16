# cdk-safe-settings

A Cloud Development Kit depoyable construct describing [GitHub's safe-settings](https://github.com/github/safe-settings).

## Installation

`npm install @oatelaus/cdk-safe-settings`

## Usage

```typescript
export class MyInfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const safeSettings = new SafeSettings(this, "safe-settings", {
      appId: "012345",
    });
  }
}
```

## Secrets
This construct will create two secrets by default, private key and webhook secret. You must fill these in by hand before the lambda can successful execute.

If you want to provide your own secrets you can pass in secrets to this construct.

## Making the webhook publicly accessible
This construct concerns itself with the bare basic requirements to successfully setup safe-settings however to be unopinionated as possible it has been left up to the consumer of this package to add a publicly facing endpoint to the webhook handler. This can be done via API Gateways or you can add a function URL to the lambda itself.
