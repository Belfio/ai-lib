import db from "@/lib/db";
import { Form, Link, Outlet, redirect, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { UploadFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import s3 from "@/lib/s3";

export default function UploadAll() {
  const emails = useLoaderData<typeof loader>();
  return (
    <div className="max-w-2xl mx-auto w-full">
      <p className="text-xl font-bold">List of all the stored emails</p>
      {emails.map((email: UploadFormData) => (
        <Form
          method="post"
          key={email.id}
          className="border-2 border-gray-300 p-2 flex gap-4 justify-between mt-4 w-full"
        >
          <Link to={`/upload/all/selected/${email.id}`}>
            <p className="font-bold text-xs text-gray-500">{email.email}</p>
            <p>{email.subject}</p>
          </Link>
          <Button
            variant="destructive"
            name="action"
            value="remove"
            type="submit"
          >
            X
          </Button>
          <input type="hidden" name="id" value={email.id} />
        </Form>
      ))}
      <Outlet />
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  if (action === "remove") {
    console.log("remove");
    const id = formData.get("id");
    const email = await db.email.get(id as string);
    await db.email.delete(id as string);
    email.attachments.forEach(async (attachment) => {
      console.log("deleting", attachment);
      await s3.docStoring.delete(attachment);
    });
  }
  return redirect("/upload/all");
}

export type ActionData = {
  success: boolean;
};

export async function loader() {
  const emails = await db.email.getAll();
  return emails;
}
