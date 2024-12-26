import Search from "@/components/Search";
import EmailPreview, { EmailPreviewProps } from "@/components/EmailPreview";
import { useEffect, useContext } from "react";
import { UserContext } from "@/providers/userContext";
import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { isAuthenticated } from "@/server/auth/auth.server";

import { DialogLoadDocs } from "@/components/DialogLoadDocs";

export default function Dashboard() {
  const { user, lastEmails, lastDocs, lastNotes } =
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
        <p className="text-sm text-gray-500 font-light">Recent emails</p>
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
                No recent emails
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
  const lastEmails = [];
  const lastDocs = [];
  const lastNotes = [];
  return { user, lastEmails, lastDocs, lastNotes };
}
