import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import db from "@/lib/db";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { queryDocument } from "@/server/queryDocument.server";
import { parseCompany } from "@/server/parseCompany.server";

export default function Selected() {
  const { email } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return (
    <div className="max-w-xl mx-auto overflow-hidden">
      <pre>{JSON.stringify(email, null, 2)}</pre>
      <Form method="post">
        <Input type="text" name="prompt" />
        <Button name="action" value="process" type="submit">
          Query
        </Button>
        <input type="hidden" name="id" value={email.id} />
        <Button name="action" value="parse" type="submit">
          Parse
        </Button>
        <input type="hidden" name="id" value={email.id} />
      </Form>
      {actionData?.response && <pre>{actionData.response}</pre>}
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
    if (!id) {
      return redirect("/error");
    }
    const prompt = formData.get("prompt") as string;
    const response = await queryDocument(id as string, prompt);
    return { response };
  }
  if (action === "parse") {
    if (!id) {
      return redirect("/error");
    }
    const response = await parseCompany(id as string);
    return { response };
  }
  return {
    success: false,
    error: "Error extracting data from PDF",
    response: null,
  };
};
