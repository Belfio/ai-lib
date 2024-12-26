/// <reference path="./.sst/platform/config.d.ts" />

export default function PlatformStack() {
  const dbUser = new sst.aws.Dynamo("UserTable", {
    fields: {
      PK: "string",
      email: "string",
      constIndex: "string",
      company: "string",
    },
    primaryIndex: {
      hashKey: "PK",
    },
    globalIndexes: {
      EmailIndex: {
        hashKey: "email",
        projection: "keys-only",
      },
      CompanyIndex: {
        hashKey: "company",
        projection: "all",
      },
      ConstIndex: {
        hashKey: "constIndex",
        projection: "keys-only",
      },
    },
  });

  const dbCompany = new sst.aws.Dynamo("CompanyTable", {
    fields: {
      PK: "string",
      constIndex: "string",
    },
    primaryIndex: {
      hashKey: "PK",
    },
    globalIndexes: {
      ConstIndex: {
        hashKey: "constIndex",
        projection: ["PK", "name"],
      },
    },
  });

  return {
    dbUser,
    dbCompany,
  };
}
