import { ActionFunctionArgs, redirect } from "@remix-run/node";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

import {
  JobFileType,
  JobStatus,
  JobType,
  PitchEmailFormData,
} from "@/lib/types";
// Upload Form receives a formData object containing
// email, subject, body, attachments in the form of S3 URLs and folderId
// and creates a new email and job

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("form data handler");

  const formData = await request.formData();
  try {
    const uploadData: PitchEmailFormData = {
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      body: formData.get("body") as string,
      attachments: JSON.parse(formData.get("attachments") as string),
      id: formData.get("folderId") as string,
      constIndex: "constIndex",
    };

    console.log("new email", uploadData);
    await db.email.create(uploadData);
    const newJob: JobType = {
      jobId: uuidv4(),
      emailId: formData.get("folderId") as string,
      fileUrls: formData.get("attachments")?.toString()
        ? [formData.get("attachments")!.toString()]
        : [],
      status: JobStatus.PENDING,
      constIndex: "constIndex",
      type: JobFileType.EMAIL,
      firmId: formData.get("firmId") as string,
      createdAt: new Date().toISOString(),
      creator: {
        email: formData.get("email") as string,
        name: formData.get("name") as string,
        surname: formData.get("surname") as string,
      },
    };

    await db.job.create(newJob);
    return redirect(
      `/upload/all/selected/${formData.get("folderId") as string}`
    );
  } catch (error) {
    console.error("error in form data handler", error);
    return { status: "failed" };
  }
};
