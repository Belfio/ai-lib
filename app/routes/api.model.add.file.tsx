import {
  ActionFunctionArgs,
  UploadHandler,
  UploadHandlerPart,
  unstable_parseMultipartFormData,
  json,
  redirect,
} from "@remix-run/node";
import db from "@/lib/db";
import { DatasetType, ModelType } from "@/lib/types";
import { randomId } from "@/lib/utils";
import { s3UploaderHandler } from "@/server/upload.server";

// TODO:
// this https://andrekoenig.de/articles/progressively-enhanced-file-uploads-remix
// and  https://github.com/paalamugan/optimizing-large-file-upload-performance/blob/main/app/utils/uploadFile.ts

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("model add file");
  const modelId = randomId();
  const folder = "models";
  const s3uploaderWithId: UploadHandler = (props: UploadHandlerPart) =>
    s3UploaderHandler(props, modelId, folder);

  const formData = await unstable_parseMultipartFormData(
    request,
    s3uploaderWithId
  );

  const name = formData.get("name");
  const description = formData.get("description");
  const author = formData.get("author");
  const website = formData.get("website");

  const datasetIds: string[] = JSON.parse(formData.get("datasetIds") as string);
  if (!name || !description || !author || !datasetIds) {
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (!author) missingFields.push("author");
    if (!datasetIds) missingFields.push("datasetIds");
    return json(
      { error: `Missing fields: ${missingFields.join(", ")}` },
      { status: 400 }
    );
  }

  let datasets: DatasetType[] = [];

  await Promise.all(
    datasetIds.map(async (datasetId) => {
      const dataset = await db.dataset.get(datasetId);
      if (!dataset) return;
      datasets = [...datasets, dataset];
    })
  );
  if (!datasets) {
    return json({ error: `Datasets not found` }, { status: 400 });
  }

  const size = getFilesSize(modelId);
  console.log("datasets", datasets);
  const diseaseCategories = Array.from(
    new Set(
      datasets.map((dataset) => JSON.parse(dataset.diseaseCategory)).flat()
    )
  );
  const bodyParts = Array.from(
    new Set(datasets.map((dataset) => JSON.parse(dataset.bodyParts)).flat())
  );
  const dataType = Array.from(
    new Set(datasets.map((dataset) => JSON.parse(dataset.dataType)).flat())
  );
  const diseaseIds = Array.from(
    new Set(datasets.map((dataset) => JSON.parse(dataset.diseaseIds)).flat())
  );
  // create the object dataset to save in the table dataset
  const model: ModelType = {
    modelId: modelId,
    name: name as string,
    description: description as string,
    createdAt: new Date().toISOString(),
    ranking: 0,
    website: website as string,
    tConst: "metadata",
    diseaseIds: JSON.stringify(diseaseIds) as string,
    bodyParts: JSON.stringify(bodyParts) as string,
    userId: "1",
    author: author as string,
    size: size as string,
    datasetIds: JSON.stringify(datasetIds),
    diseaseCategory: JSON.stringify(diseaseCategories) as string,
    dataType: JSON.stringify(dataType) as string,
    statusTesting: "PENDING",
  };

  console.log("new model", model);
  await db.model.create(model);

  return redirect("/models");
};

const getFilesSize = (modelId: string) => {
  // const files = db.file.findMany({
  //   where: {
  //     modelId: modelId,
  //   },
  // });
  // return files.reduce((acc, file) => acc + file.size, 0);
  console.log("getFilesSize TBD", modelId[0]);
  return "n/a";
};
