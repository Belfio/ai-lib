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

    const bucketDocStoring = new sst.aws.Bucket("DocStoring", {});
    const dbEmail = new sst.aws.Dynamo("EmailTable", {
      fields: {
        email: "string",
        id: "string",
        constIndex: "string",
      },
      primaryIndex: {
        hashKey: "id",
      },
      globalIndexes: {
        CreatedAtIndex: {
          hashKey: "email",
        },
        EmailIndex: {
          hashKey: "email",
        },
        ConstIndex: {
          hashKey: "constIndex",
        },
      },
    });

    const dbJobs = new sst.aws.Dynamo("JobsTable", {
      fields: {
        emailId: "string",
        id: "string",
        constIndex: "string",
      },
      primaryIndex: {
        hashKey: "id",
      },
      globalIndexes: {
        EmailIndex: {
          hashKey: "emailId",
        },
        ConstIndex: {
          hashKey: "constIndex",
        },
      },
      stream: "keys-only",
    });

    const dbCompanyProfile = new sst.aws.Dynamo("CompanyProfileTable", {
      fields: {
        profileId: "string",
        constIndex: "string",
      },
      primaryIndex: {
        hashKey: "profileId",
      },
      globalIndexes: {
        ConstIndex: {
          hashKey: "constIndex",
        },
      },
    });

    dbJobs.subscribe("EmailSubscriber", {
      link: [bucketDocStoring, dbEmail, dbCompanyProfile, dbJobs],
      handler: "app/server/emailSubscriber.handler",
      timeout: "10 minutes",
    });

    const web = new sst.aws.Remix("PrimoAI", {
      link: [api, bucketDocStoring, dbEmail, dbJobs, dbCompanyProfile],
    });

    return {
      api: api.url,
      web: web.url,
    };
  },
});
