import {
  ActionFunctionArgs,
  UploadHandler,
  UploadHandlerPart,
  unstable_parseMultipartFormData,
  redirect,
} from "@remix-run/node";
import db from "@/lib/db";
import { randomId } from "@/lib/utils";
import { s3UploaderHandler } from "@/server/upload.server";
import { JobType, UploadFormData } from "@/lib/types";
import s3 from "@/lib/s3";

// TODO:
// this https://andrekoenig.de/articles/progressively-enhanced-file-uploads-remix
// and  https://github.com/paalamugan/optimizing-large-file-upload-performance/blob/main/app/utils/uploadFile.ts

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("model add file");
  const folderId = randomId(); //this should be userId
  const folder = "attachments";
  const s3uploaderWithId: UploadHandler = (props: UploadHandlerPart) =>
    s3UploaderHandler(props, folderId, folder);

  const formData = await unstable_parseMultipartFormData(
    request,
    s3uploaderWithId
  );

  const fileUrls = await s3.docStoring.list(folder + "/" + folderId);
  const uploadData: UploadFormData = {
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    body: formData.get("body") as string,
    attachments: fileUrls,
    id: folderId,
    constIndex: "constIndex",
  };

  console.log("new email", uploadData);
  await db.email.create(uploadData);
  const newJob: JobType = {
    id: randomId(),
    emailId: folderId,
    status: "pending",
    constIndex: "constIndex",
  };
  await db.job.create(newJob);
  return redirect(`/success/${folderId}`);
};
