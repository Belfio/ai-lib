import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import db from "@/lib/db";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { emailProcessing } from "@/server/emailProcessing.server";
export default function Success() {
  const { email } = useLoaderData<typeof loader>();
  return (
    <div>
      <pre>{JSON.stringify(email, null, 2)}</pre>
      <Link to="/upload/all">
        <Button>Go back</Button>
      </Link>
      <Form method="post">
        <Button name="action" value="process" type="submit">
          Process email
        </Button>
        <input type="hidden" name="id" value={email.id} />
      </Form>
    </div>
  );
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  console.log("params", params);
  const id = params.id;
  if (!id) {
    return redirect("/error");
  }
  const email = await db.email.get(id);
  return { email };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get("action");
  const id = formData.get("id");
  if (action === "process") {
    const email = await db.email.get(id as string);
    await emailProcessing(email);
  }
  return { success: false, error: "Error extracting data from PDF" };
};
