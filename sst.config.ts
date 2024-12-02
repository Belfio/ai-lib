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
    // const email = new sst.aws.Email("MyEmailPrimoAI", {
    //   sender:
    //     $app?.stage === "prod"
    //       ? "a.belfiori+primoai2@gmail.com"
    //       : "a.belfiori@gmail.com",
    // });

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
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        OPENAI_ORG: process.env.OPENAI_ORG ?? "",
        OPENAI_PROJECT: process.env.OPENAI_PROJECT ?? "",
      },
    });

    const web = new sst.aws.Remix("PrimoAI", {
      link: [bucketDocStoring, dbEmail, dbJobs, dbCompanyProfile],
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        OPENAI_ORG: process.env.OPENAI_ORG ?? "",
        OPENAI_PROJECT: process.env.OPENAI_PROJECT ?? "",
      },
    });

    return {
      web: web.url,
    };
  },
});
