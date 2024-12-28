import { ActionFunctionArgs } from "@remix-run/node";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

import { JobFileType, JobStatus, JobType } from "@/lib/types";
import { FilesAnalyseData } from "@/lib/primoClient";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("upload file handler");

  const formData: FilesAnalyseData = await request.json();
  console.log("formData", formData);
  try {
    const newJob: JobType = {
      jobId: uuidv4(),
      emailId: formData.folderId,
      fileUrls: Array.isArray(formData.fileUrls)
        ? formData.fileUrls
        : [formData.fileUrls],
      status: JobStatus.PENDING,
      constIndex: "constIndex",
      type: JobFileType.FILE,
      firmId: formData.firmId,
      createdAt: new Date().toISOString(),
      creator: formData.creator,
    };
    await db.job.create(newJob);
    console.log("newJob", newJob);
    return Response.json(newJob.jobId);
  } catch (error) {
    console.error("error in upload file handler", error);
    return Response.json({ status: "failed" });
  }
};
