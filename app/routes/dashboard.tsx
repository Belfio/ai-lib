import Search from "@/components/Search";
import EmailPreview, { EmailPreviewProps } from "@/components/EmailPreview";
import DocPreview, { DocPreviewProps } from "@/components/DocPreview";
import { useEffect, useContext } from "react";
import { UserContext } from "@/providers/userContext";
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

export default function Dashboard() {
  const { user, lastEmails, lastDocs, lastNotes, jobs } =
    useLoaderData<typeof loader>();
  const { setUser } = useContext(UserContext);
  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return (
    <div className="justify-start items-center w-full h-full p-6 flex flex-col gap-6 md:min-w-[800px]">
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
                id={job.jobId}
                date={job.createdAt}
                uploader={`${job?.creator?.name || ""} ${
                  job?.creator?.surname || ""
                }`}
                numberOfDocs={job.fileUrls?.length || 0}
                status={job.status}
                title=""
                summary=""
                companyName=""
                companyId=""
                userCompanyId={user.companyId}
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
        <p className="text-sm text-gray-500 font-light">Notes</p>
        <div className="flex flex-col gap-2 p-4 border rounded-lg w-full">
          {lastNotes.length > 0 ? (
            lastNotes.map((email: EmailPreviewProps) => (
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
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  const jobs = await db.job.getLatest(user.companyId, 5);
  const lastEmails: EmailPreviewProps[] = [];
  const lastDocs: EmailPreviewProps[] = [];
  const lastNotes: EmailPreviewProps[] = [];
  return { user, lastEmails, lastDocs, lastNotes, jobs };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  console.log("Action", action);
  if (action === "remove") {
    console.log("Removing job");
    const companyId = formData.get("userCompanyId");
    const createdAt = formData.get("createdAt");
    console.log("Company ID", companyId);
    await db.job.delete(companyId as string, createdAt as string);
  }
  return null;
}
