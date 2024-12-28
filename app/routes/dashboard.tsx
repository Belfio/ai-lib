import Search from "@/components/Search";
import EmailPreview, { EmailPreviewProps } from "@/components/EmailPreview";
import DocPreview from "@/components/DocPreview";
import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { isAuthenticated } from "@/server/auth/auth.server";

import { DialogLoadDocs } from "@/components/DialogLoadDocs";
import db from "@/lib/db";
import { JobType } from "@/lib/types";
import s3 from "@/lib/s3";
import DrawerDoc from "@/components/DrawerDoc";

export default function Dashboard() {
  const { lastDocs, jobs, lastEmails } = useLoaderData<typeof loader>();

  const [open, setOpen] = useState(false);
  const [job, setJob] = useState<JobType | null>(null);

  return (
    <div className="justify-start items-center w-full h-full p-6 flex flex-col gap-6 md:min-w-[800px] md:max-w-[1024px]">
      <div className="flex justify-end items-center w-full">
        <DialogLoadDocs />
      </div>
      <h1 className="text-4xl font-bold items-end pt-12">
        Welcome to the dashboard
      </h1>
      <Search className="w-[400px]" />
      <div className="flex flex-col gap-2 justify-start items-start w-full ">
        <p className="text-sm text-gray-500 font-light">Documents</p>
        <div className="flex flex-col gap-2 p-4 border rounded-lg w-full">
          {jobs.length > 0 ? (
            jobs.map((job: JobType) => (
              <DocPreview
                key={job.jobId}
                job={job}
                onClick={() => {
                  setOpen(true);
                  setJob(job);
                }}
              />
            ))
          ) : (
            <div className="flex justify-center items-center w-full">
              <p className="text-sm text-gray-500 font-light w-full">
                No recent emails
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 justify-start items-start w-full ">
        <p className="text-sm text-gray-500 font-light">Recent companies</p>
        <div className="flex flex-col gap-2 p-4 border rounded-lg w-full">
          {lastDocs.length > 0 ? (
            lastDocs.map((email: EmailPreviewProps) => (
              <EmailPreview
                key={email.id}
                id={email.id}
                date={email.date}
                sender={email.sender}
                email={email.email}
                status={email.status}
                subject={email.subject}
                companyId={email.companyId}
                content="Dear valued partner, I hope this email finds you well. I wanted to personally reach out regarding our latest AI model developments. We've made significant breakthroughs in multimodal learning that I believe could revolutionize how we approach machine learning.We're seeing promising results in..."
              />
            ))
          ) : (
            <div className="flex justify-center items-center w-full">
              <p className="text-sm text-gray-500 font-light w-full">
                No recent companies
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 justify-start items-start w-full ">
        <p className="text-sm text-gray-500 font-light">Emails</p>
        <div className="flex flex-col gap-2 p-4 border rounded-lg w-full">
          {lastEmails.length > 0 ? (
            lastEmails.map((email: EmailPreviewProps) => (
              <EmailPreview
                key={email.id}
                id={email.id}
                date={email.date}
                sender={email.sender}
                email={email.email}
                status={email.status}
                subject={email.subject}
                companyId={email.companyId}
                content="Dear valued partner, I hope this email finds you well. I wanted to personally reach out regarding our latest AI model developments. We've made significant breakthroughs in multimodal learning that I believe could revolutionize how we approach machine learning.We're seeing promising results in..."
              />
            ))
          ) : (
            <div className="flex justify-center items-center w-full">
              <p className="text-sm text-gray-500 font-light w-full">
                No recent notes
              </p>
            </div>
          )}
        </div>
      </div>
      <DrawerDoc job={job} open={open} setOpen={setOpen} />
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await isAuthenticated(request);
  if (!user) {
    console.log("redirecting to login");
    return redirect("/login");
  }

  const jobs = await db.job.getLatest(user.companyId, 5);
  const lastDocs: EmailPreviewProps[] = [];
  const lastEmails: EmailPreviewProps[] = [];

  return {
    user,
    jobs: jobs || [],
    lastDocs,
    lastEmails,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const action = formData.get("action");
    console.log("Action", action);

    if (action === "remove") {
      console.log("Removing job");
      const companyId = formData.get("firmId");
      const createdAt = formData.get("createdAt");
      const fileUrlsStr = formData.get("fileUrls");

      if (!companyId || !createdAt) {
        throw new Error("Missing required fields");
      }

      let fileUrls: string[] = [];
      if (typeof fileUrlsStr === "string") {
        try {
          fileUrls = JSON.parse(fileUrlsStr);
        } catch {
          fileUrls = [fileUrlsStr];
        }
      }

      console.log("Processed fileUrls:", fileUrls);
      console.log("Company ID", companyId);

      // Process deletions sequentially and handle errors
      for (const fileUrl of fileUrls) {
        try {
          await s3.docStoring.delete(fileUrl);
        } catch (error) {
          console.error(`Failed to delete file ${fileUrl}:`, error);
        }
      }

      await db.job.delete(companyId.toString(), createdAt.toString());
      return { success: true };
    }
    return { success: false, error: "Invalid action" };
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
