import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import db from "@/lib/db";
import { randomId } from "@/lib/utils";

import { JobStatus, JobType, PitchEmailFormData } from "@/lib/types";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    console.log("form data handler");

    const formData = await request.formData();
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
      id: randomId(),
      emailId: formData.get("folderId") as string,
      status: JobStatus.PENDING,
      constIndex: "constIndex",
    };
    await db.job.create(newJob);
    return redirect(
      `/upload/all/selected/${formData.get("folderId") as string}`
    );
  } catch (error) {
    console.error("error in form data handler", error);
    return json({ status: "failed" });
  }
};
