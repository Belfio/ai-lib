import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { DatasetType, DiseaseType, ModelType, UserType } from "@/lib/types";
import { Resource } from "sst/resource";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

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
    console.log("queryItems command", command);
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
  model: {
    create: async (model: ModelType) => {
      const response = await createItem(Resource.Models.name, model);
      if (!response.isSuccess) {
        throw new Error(`Error creating model: ${response.msg}`);
      }
      return response;
    },
    get: async (modelId: string): Promise<ModelType> => {
      const model = (await getItem(Resource.Models.name, {
        modelId,
      })) as ModelType;

      return model;
    },
    getByRanking: async (): Promise<ModelType[]> => {
      const models = (await getNItems(
        Resource.Models.name,
        "RankingIndex",
        50
      )) as { items: ModelType[] | null; lastEvaluatedKey?: any };
      return models.items || [];
    },
    getByLatest: async (): Promise<ModelType[]> => {
      const models = (await getNItems(
        Resource.Models.name,
        "CreatedAtIndex",
        50
      )) as { items: ModelType[] | null; lastEvaluatedKey?: any };
      return models.items || [];
    },

    delete: async (modelId: string) => {
      const response = await deleteItem(Resource.Models.name, {
        modelId,
      });
      return response;
    },
  },
  dataset: {
    create: async (dataset: DatasetType) => {
      const response = await createItem(Resource.Datasets.name, dataset);
      if (!response.isSuccess) {
        throw new Error(`Error creating dataset: ${response.msg}`);
      }
      return response;
    },
    get: async (datasetId: string): Promise<DatasetType> => {
      const dataset = (await getItem(Resource.Datasets.name, {
        datasetId,
      })) as DatasetType;

      return dataset;
    },
    getByRanking: async (): Promise<DatasetType[]> => {
      const datasets = (await getNItems(
        Resource.Datasets.name,
        "RankingIndex",
        50
      )) as { items: DatasetType[] | null; lastEvaluatedKey?: any };
      return datasets.items || [];
    },
    getByLatest: async (): Promise<DatasetType[]> => {
      const datasets = (await getNItems(
        Resource.Datasets.name,
        "CreatedAtIndex",
        50
      )) as { items: DatasetType[] | null; lastEvaluatedKey?: any };
      return datasets.items || [];
    },
    delete: async (datasetId: string) => {
      await deleteItem(Resource.Datasets.name, {
        datasetId,
      });
    },
  },
  disease: {
    get: async (diseaseId: string): Promise<DiseaseType> => {
      const disease = (await getItem(Resource.Diseases.name, {
        diseaseId,
      })) as DiseaseType;
      return disease;
    },
    getByApproved: async (): Promise<DiseaseType[]> => {
      const diseases = (await queryItems(
        Resource.Diseases.name,
        "ApprovedIndex",
        "approved",
        "true"
      )) as { items: DiseaseType[] | null; lastEvaluatedKey?: any };
      return diseases.items || [];
    },
    getNItems: async (n = 50): Promise<DiseaseType[]> => {
      const diseases = (await getNItems(
        Resource.Diseases.name,
        "CreationIndex",
        n
      )) as { items: DiseaseType[] | null; lastEvaluatedKey?: any };
      return diseases.items || [];
    },
    getByLatest: async (n = 50): Promise<DiseaseType[]> => {
      const datasets = (await getNItems(
        Resource.Diseases.name,
        "CreationIndex",
        n
      )) as { items: DiseaseType[] | null; lastEvaluatedKey?: any };
      return datasets.items || [];
    },
    create: async (disease: DiseaseType) => {
      try {
        const response = await createItem(Resource.Diseases.name, disease);
        if (!response.isSuccess) {
          throw new Error(`Error creating disease: ${response.msg}`);
        }
        return response;
      } catch (error) {
        console.log("create disease error", error);
        throw new Error(`Error creating disease: ${error}`);
      }
    },
    delete: async (diseaseId: string) => {
      await deleteItem(Resource.Diseases.name, {
        diseaseId,
      });
    },
  },
};

export default db;

// const queryStatus = async (
//   tableName: string,
//   id: string,
//   idName: string,
//   indexName: string,
//   LastEvaluatedKey?: string,
//   lastItems?: any
// ): Promise<any[] | null> => {
//   // console.log("queryItems", tableName, id, idName);
//   let items = lastItems || [];
//   let command = {
//     KeyConditionExpression: `#status = :primaryIndex`,
//     ExpressionAttributeNames: { "#status": idName },
//     ExpressionAttributeValues: {
//       ":primaryIndex": { S: id },
//     },
//     IndexName: indexName,
//     TableName: tableName,
//   };
//   if (LastEvaluatedKey) {
//     command = { ...command, ExclusiveStartKey: LastEvaluatedKey };
//   }

//   const data = await client.send(new QueryCommand(command));
//   // // console.log("data queryItems", data.Items);

//   let result;
//   if (!data.Items) return null;
//   if (data.Items.length > 0) {
//     result = data.Items.map((item) => unmarshall(item));
//     items = items.concat(result);
//   }
//   if (data.LastEvaluatedKey) {
//     return await queryStatus(
//       tableName,
//       id,
//       idName,
//       indexName,
//       data.LastEvaluatedKey,
//       items
//     );
//   }
//   return items;
// };

// const queryItemsDate = async (
//   tableName: string,
//   id: string,
//   idName: string,
//   startingDate: string | null = null,
//   endingDate: string = new Date().toISOString(),
//   LastEvaluatedKey?: string,
//   lastItems?: any
// ): Promise<any[] | null> => {
//   // console.log("queryItemsDate", tableName, id, idName);
//   let items = lastItems || [];
//   let startingDateDefault;
//   if (!startingDate) {
//     startingDateDefault = new Date();
//     startingDateDefault.setDate(startingDateDefault.getDate() - 7);
//     startingDateDefault = startingDateDefault.toISOString();
//   } else {
//     startingDateDefault = startingDate;
//   }
//   let commandContent = {
//     KeyConditionExpression: `${idName} = :primaryKey AND creationDate BETWEEN :oldest AND :latest`,
//     ExpressionAttributeValues: {
//       ":primaryKey": { S: id },
//       ":oldest": { S: startingDateDefault },
//       ":latest": { S: endingDate },
//     },
//     TableName: tableName,
//   };
//   if (LastEvaluatedKey) {
//     commandContent = { ...commandContent, ExclusiveStartKey: LastEvaluatedKey };
//   }
//   const command = new QueryCommand(commandContent);

//   const data = await client.send(command);
//   console.log("data queryItemsDate", Object.keys(data));

//   let result;
//   if (!data.Items) return null;
//   if (data.Items.length > 0) {
//     result = data.Items.map((item) => unmarshall(item));
//     items = items.concat(result);
//     if (data.LastEvaluatedKey) {
//       return await queryItemsDate(
//         tableName,
//         id,
//         idName,
//         startingDate,
//         endingDate,
//         data.LastEvaluatedKey,
//         items
//       );
//     }
//   }
//   return items;
// };

// const queryItemsGlobalIndexDate = async (
//   tableName: string,
//   id: string,
//   idName: string,
//   globalIndexName: string,
//   startingDate: string | null = null,
//   endingDate: string = new Date().toISOString(),
//   LastEvaluatedKey?: string,
//   lastItems?: any
// ): Promise<any[] | null> => {
//   // console.log("queryItemsDate", tableName, id, idName);
//   let items = lastItems || [];
//   let startingDateDefault;
//   if (!startingDate) {
//     startingDateDefault = new Date();
//     startingDateDefault.setDate(startingDateDefault.getDate() - 7);
//     startingDateDefault = startingDateDefault.toISOString();
//   } else {
//     startingDateDefault = startingDate;
//   }
//   let commandContent = {
//     KeyConditionExpression: `${idName} = :primaryKey AND creationDate BETWEEN :oldest AND :latest`,
//     ExpressionAttributeValues: {
//       ":primaryKey": { S: id },
//       ":oldest": { S: startingDateDefault },
//       ":latest": { S: endingDate },
//     },
//     IndexName: globalIndexName,
//     TableName: tableName,
//   };
//   if (LastEvaluatedKey) {
//     commandContent = { ...commandContent, ExclusiveStartKey: LastEvaluatedKey };
//   }
//   const command = new QueryCommand(commandContent);

//   const data = await client.send(command);
//   console.log("data queryItemsDate", Object.keys(data));

//   let result;
//   if (!data.Items) return null;
//   if (data.Items.length > 0) {
//     result = data.Items.map((item) => unmarshall(item));
//     items = items.concat(result);
//     if (data.LastEvaluatedKey) {
//       return await queryItemsDate(
//         tableName,
//         id,
//         idName,
//         startingDate,
//         endingDate,
//         data.LastEvaluatedKey,
//         items
//       );
//     }
//   }
//   return items;
// };

// const queryItemsType = async (
//   tableName: string,
//   id: string,
//   idName: string,
//   type: string,
//   typeName: string,
//   old?: number,
//   LastEvaluatedKey?: string,
//   lastItems?: any
// ): Promise<any[] | null> => {
//   // console.log("queryItemsType", tableName, id, idName);
//   let items = lastItems || [];

//   const oldest = new Date();
//   const daysBefore = old || 365;
//   oldest.setDate(oldest.getDate() - daysBefore);
//   const oldestString = oldest.toISOString();
//   let command = {
//     KeyConditionExpression: `${idName} = :primaryKey AND creationDate > :oldest`,
//     FilterExpression: `${typeName} = :type `,
//     ExpressionAttributeValues: {
//       ":primaryKey": { S: id },
//       ":type": { S: type },
//       ":oldest": { S: oldestString },
//     },
//     // IndexName: idName,
//     TableName: tableName,
//   };
//   if (LastEvaluatedKey) {
//     command = { ...command, ExclusiveStartKey: LastEvaluatedKey };
//   }
//   // // console.log("command queryItems", command);

//   const data = await client.send(new QueryCommand(command));

//   let result;
//   if (!data.Items) return null;
//   if (data.Items.length > 0) {
//     result = data.Items.map((item) => unmarshall(item));
//     items = items.concat(result);
//   }
//   if (data.LastEvaluatedKey) {
//     return await queryItemsType(
//       tableName,
//       id,
//       idName,
//       type,
//       typeName,
//       old,
//       data.LastEvaluatedKey,
//       items
//     );
//   }

//   return items;
// };

// const queryItemsTypeAndStatus = async (
//   tableName: string,
//   indexName: string,
//   type: string,
//   typeName: string,
//   status: string,
//   statusName: string,
//   LastEvaluatedKey?: string,
//   lastItems?: any
// ): Promise<any[] | null> => {
//   // console.log(
//   //   "queryItemsType",
//   //   tableName,
//   //   indexName,
//   //   type,
//   //   typeName,
//   //   status,
//   //   statusName
//   // );

//   let items = lastItems || [];

//   let command = {
//     ExpressionAttributeNames: {
//       "#status": statusName,
//       "#type": typeName,
//     },
//     ExpressionAttributeValues: {
//       ":type": { S: type },
//       ":status": { S: status },
//     },
//     KeyConditionExpression: `#type = :type AND #status = :status`,
//     IndexName: indexName,
//     TableName: tableName,
//   };
//   if (LastEvaluatedKey) {
//     command = { ...command, ExclusiveStartKey: LastEvaluatedKey };
//   }
//   // // console.log("command queryItems", command);

//   const data = await client.send(new QueryCommand(command));
//   // // console.log("data queryItems", data);

//   let result;
//   if (!data.Items) return null;
//   if (data.Items.length > 0) {
//     result = data.Items.map((item) => unmarshall(item));
//     items = items.concat(result);
//   }
//   if (data.LastEvaluatedKey) {
//     return await queryItemsTypeAndStatus(
//       tableName,
//       indexName,
//       type,
//       typeName,
//       status,
//       statusName,
//       data.LastEvaluatedKey,
//       items
//     );
//   }

//   return items;
// };
