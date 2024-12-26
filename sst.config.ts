/// <reference path="./.sst/platform/config.d.ts" />

import PlatformStack from "stacks/PlatformStack";

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
    const email = new sst.aws.Email("EmailService", {
      sender: "a.belfiori@gmail.com",
      // dmarc: "v=DMARC1; p=quarantine; adkim=s; aspf=s;",
    });
    const secretDynameHashUUID = new sst.Secret(
      "DynameHashUUID",
      "5c9f261e-4884-4fcb-ab55-5c72f1033e85"
    );

    const { dbCompany, dbUser } = PlatformStack();
    const web = new sst.aws.Remix("PrimoAI", {
      link: [
        bucketDocStoring,
        dbEmail,
        dbJobs,
        dbCompanyProfile,
        email,
        dbCompany,
        dbUser,
      ],
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        OPENAI_ORG: process.env.OPENAI_ORG ?? "",
        OPENAI_PROJECT: process.env.OPENAI_PROJECT ?? "",
        EMAIL_SEED: secretDynameHashUUID.value,
      },
    });

    return {
      web: web.url,
    };
  },
});
