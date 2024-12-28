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

    const bucketDocStoring = new sst.aws.Bucket("DocStoring");
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

    const dbJobs = new sst.aws.Dynamo("Jobs", {
      fields: {
        emailId: "string",
        jobId: "string",
        firmId: "string",
        createdAt: "string",
      },
      primaryIndex: {
        hashKey: "firmId",
        rangeKey: "createdAt",
      },
      globalIndexes: {
        EmailIndex: {
          hashKey: "emailId",
        },
        jobIdIndex: {
          hashKey: "jobId",
        },
      },
      stream: "keys-only",
    });
    const dbCompanyProfile = new sst.aws.Dynamo("CompanyProfileTable", {
      fields: {
        profileId: "string",
        constIndex: "string",
        firmId: "string",
      },
      primaryIndex: {
        hashKey: "profileId",
      },
      globalIndexes: {
        ConstIndex: {
          hashKey: "constIndex",
        },
        FirmIndex: {
          hashKey: "firmId",
        },
      },
    });

    const deadLetterQueue = new sst.aws.Queue("DeadLetterQueue");
    const dataPorcessingQueue = new sst.aws.Queue("DataProcessingQueue", {
      dlq: {
        retry: 1,
        queue: deadLetterQueue.arn,
      },
      visibilityTimeout: "10 minutes",
    });
    dataPorcessingQueue.subscribe({
      handler: "app/server/subscribers/jobQueue.handler",
      timeout: "10 minutes",
      link: [bucketDocStoring, dbEmail, dbCompanyProfile, dbJobs],
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        OPENAI_ORG: process.env.OPENAI_ORG ?? "",
        OPENAI_PROJECT: process.env.OPENAI_PROJECT ?? "",
      },
    });

    dbJobs.subscribe("jobSubscriber", {
      link: [
        bucketDocStoring,
        dbEmail,
        dbCompanyProfile,
        dbJobs,
        dataPorcessingQueue,
      ],
      handler: "app/server/subscribers/jobSubscriber.handler",
      timeout: "1 minutes",
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        OPENAI_ORG: process.env.OPENAI_ORG ?? "",
        OPENAI_PROJECT: process.env.OPENAI_PROJECT ?? "",
      },
    });

    // dataPorcessingQueue.subscribe("jobSubscriber", {
    //   link: [bucketDocStoring, dbEmail, dbCompanyProfile, dbJobs],
    //   handler: "app/server/subscribers/jobSubscriber.handler",
    //   timeout: "10 minutes",
    //   environment: {
    //     OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    //     OPENAI_ORG: process.env.OPENAI_ORG ?? "",
    //     OPENAI_PROJECT: process.env.OPENAI_PROJECT ?? "",
    //   },
    // });

    //dbJobsDepr.subscribe("EmailSubscriber", {
    // dbJobs.subscribe("EmailSubscriber", {
    //   link: [bucketDocStoring, dbEmail, dbCompanyProfile, dbJobs],
    //   handler: "app/server/emailSubscriber.handler",
    //   timeout: "10 minutes",
    //   environment: {
    //     OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    //     OPENAI_ORG: process.env.OPENAI_ORG ?? "",
    //     OPENAI_PROJECT: process.env.OPENAI_PROJECT ?? "",
    //   },
    // });

    const email = new sst.aws.Email("EmailService", {
      sender: "a.belfiori@gmail.com",
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
