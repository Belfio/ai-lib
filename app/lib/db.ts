import { DynamoDBClient, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  JobType,
  PitchEmailFormData,
  UploadFormData,
  UserType,
} from "@/lib/types";
import { Resource } from "sst/resource";
import { CompanyProfile } from "./typesCompany";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const db = {
  user: {
    create: async (userProfile: UserType) => {
      const response = await createItem(Resource.Users.name, userProfile);
      if (!response.isSuccess) {
        throw new Error(`Error creating user: ${response.msg}`);
      }
      return response;
    },
    get: async (userId: string): Promise<UserType> => {
      const user = (await getItem(Resource.Users.name, {
        userId,
      })) as UserType;

      return user;
    },
    delete: async (userId: string) => {
      await deleteItem(Resource.Users.name, {
        userId,
      });
    },
  },
  email: {
    get: async (id: string): Promise<PitchEmailFormData> => {
      const email = (await getItem(Resource.EmailTable.name, {
        id,
      })) as PitchEmailFormData;
      return email;
    },
    getByApproved: async (): Promise<PitchEmailFormData[]> => {
      const emails = (await queryItems(
        Resource.EmailTable.name,
        "ApprovedIndex",
        "approved",
        "true"
      )) as { items: UploadFormData[] | null; lastEvaluatedKey?: any };
      return emails.items || [];
    },
    getNItems: async (n = 50): Promise<PitchEmailFormData[]> => {
      const emails = (await getNItems(
        Resource.EmailTable.name,
        "CreationIndex",
        n
      )) as { items: PitchEmailFormData[] | null; lastEvaluatedKey?: any };
      return emails.items || [];
    },
    getAll: async (): Promise<PitchEmailFormData[]> => {
      const emails = (await queryItems(
        Resource.EmailTable.name,
        "ConstIndex",
        "constIndex",
        "constIndex"
      )) as { items: PitchEmailFormData[] | null; lastEvaluatedKey?: any };
      return emails.items || [];
    },

    getByLatest: async (n = 50): Promise<PitchEmailFormData[]> => {
      const emails = (await getNItems(
        Resource.EmailTable.name,
        "CreationIndex",
        n
      )) as { items: UploadFormData[] | null; lastEvaluatedKey?: any };
      return emails.items || [];
    },
    create: async (email: PitchEmailFormData) => {
      try {
        const response = await createItem(Resource.EmailTable.name, email);
        if (!response.isSuccess) {
          throw new Error(`Error creating email: ${response.msg}`);
        }
        return response;
      } catch (error) {
        console.log("create email error", error);
        throw new Error(`Error creating email: ${error}`);
      }
    },
    delete: async (emailId: string) => {
      await deleteItem(Resource.EmailTable.name, {
        id: emailId,
      });
    },
  },
  companyProfile: {
    create: async (profile: CompanyProfile) => {
      const response = await createItem(
        Resource.CompanyProfileTable.name,
        profile
      );
      if (!response.isSuccess) {
        throw new Error(`Error creating CompanyProfile: ${response.msg}`);
      }
      return response;
    },
    get: async (profileId: string): Promise<CompanyProfile | null> => {
      const profile = await getItem(Resource.CompanyProfileTable.name, {
        profileId,
      });
      return profile as CompanyProfile | null;
    },
  },
  job: {
    create: async (job: JobType) => {
      await createItem(Resource.JobsTable.name, job);
    },
    get: async (jobId: string): Promise<JobType | null> => {
      const job = await getItem(Resource.JobsTable.name, {
        id: jobId,
      });
      return job as JobType | null;
    },
    queryFromEmailId: async (emailId: string): Promise<JobType[] | null> => {
      const jobs = await queryItems(
        Resource.JobsTable.name,
        "EmailIndex",
        "emailId",
        emailId
      );
      return jobs.items || [];
    },
  },
};

const getItem = async <T extends Record<string, any>>(
  tableName: string,
  idObj: T
) => {
  // console.log("getItem", tableName, idObj);

  const command = new GetCommand({
    TableName: tableName,
    Key: {
      ...idObj,
    },
  });

  // // console.log("getItem", command);

  const data = await client.send(command);
  // // console.log("getItem data", data);

  if (!data.Item) return null;
  return data.Item;
};

const getNItems = async (
  tableName: string,
  indexName: string,
  limit: number,
  lastEvaluatedKey?: any
): Promise<{ items: any[] | null; lastEvaluatedKey?: any }> => {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: "tConst = :tConst",
      ExpressionAttributeValues: {
        ":tConst": "metadata", // Adjust this value as needed
      },
      ScanIndexForward: false, // To get items in descending order
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const data = await client.send(command);

    if (!data.Items) return { items: null };
    return { items: data.Items, lastEvaluatedKey: data.LastEvaluatedKey };
  } catch (error) {
    console.log("getNItems error", error);
    return { items: null };
  }
};

const queryItems = async (
  tableName: string,
  indexName: string,
  valueKey: string,
  value: string | number | boolean,
  limit?: number,
  lastEvaluatedKey?: any
): Promise<{ items: any[] | null; lastEvaluatedKey?: any }> => {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: `${valueKey} = :valueKey`,
      ExpressionAttributeValues: {
        ":valueKey": value,
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const data = await client.send(command);

    if (!data.Items) return { items: null };
    return { items: data.Items, lastEvaluatedKey: data.LastEvaluatedKey };
  } catch (error) {
    console.log("getNItems error", error);
    return { items: null };
  }
};

type responseType = {
  isSuccess: boolean;
  msg: string;
};
const createItem = async (
  tableName: string,
  item: any
): Promise<responseType> => {
  // console.log("createItem...");
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  try {
    await client.send(command);
  } catch (error) {
    console.log("createItem error", error);
    return { isSuccess: false, msg: "error" };
  }

  return { isSuccess: true, msg: "ok" };
};

const deleteItem = async (
  tableName: string,
  idObj: any
): Promise<responseType> => {
  // console.log("deleteItem", tableName, idObj);

  const command = new DeleteCommand({
    TableName: tableName,
    Key: {
      ...idObj,
    },
  });

  // // console.log("deleteItem", command);
  try {
    await client.send(command);
  } catch (error) {
    return { isSuccess: false, msg: "error" };
  }
  // console.log("geleteItem data", data);

  return { isSuccess: true, msg: "deleted" };
};

export default db;
