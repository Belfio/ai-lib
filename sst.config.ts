/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ai",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const email = new sst.aws.Email("MyEmail", {
      sender: "a.belfiori@gmail.com",
    });

    const api = new sst.aws.Function("MyApi", {
      handler: "sender.handler",
      link: [email],
      url: true,
    });

    return {
      api,
    };
  },
});
