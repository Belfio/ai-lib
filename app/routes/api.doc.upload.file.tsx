import {
  ActionFunctionArgs,
  unstable_parseMultipartFormData,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  NodeOnDiskFile,
} from "@remix-run/node";
import db from "@/lib/db";
import { randomId } from "@/lib/utils";
import { JobStatus, JobType, PitchEmailFormData } from "@/lib/types";
import s3 from "@/lib/s3";

// TODO:
// this https://andrekoenig.de/articles/progressively-enhanced-file-uploads-remix
// and  https://github.com/paalamugan/optimizing-large-file-upload-performance/blob/main/app/utils/uploadFile.ts

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("model add file");
  const folderId = randomId(); //this should be userId
  const folder = "attachments";

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 100000000,
      file: ({ filename }) => filename,
    }),
    // parse everything else into memory
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    // s3uploaderWithId
    uploadHandler
  );
  const file: NodeOnDiskFile | null = formData.get(
    "attachments"
  ) as NodeOnDiskFile;
  console.log("file", file);
  const filename = file?.name;
  const s3FileName = `attachments/${folderId}/${filename}`;

  const asyncIterable: AsyncIterable<Uint8Array> = {
    async *[Symbol.asyncIterator]() {
      const reader = file.stream().getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    },
  };

  await s3.docStoring.upload(asyncIterable, s3FileName, file.type);
  // return JSON.stringify({ fileUrl: s3FileName });

  const fileUrls = await s3.docStoring.list(folder + "/" + folderId);
  // const fileUrls = [`attachments/${folderId}/pitchDeck.pdf`];
  // const formData = await request.formData();
  const uploadData: PitchEmailFormData = {
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
    status: JobStatus.PENDING,
    constIndex: "constIndex",
  };
  await db.job.create(newJob);
  // const signedUrl = await s3.docStoring.getSignedUrl(
  //   fileUrls[0],
  //   "application/pdf"
  // );
  return redirect(`/success/${folderId}`);
  // return { signedUrl };
};
