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
import { useEffect, useState } from "react";
import { CompanyProfile, CompanyRawData } from "@/lib/typesCompany";

export default function Selected() {
  const { email } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [rawData, setRawData] = useState<CompanyRawData | null>(null);

  useEffect(() => {
    // if (rawData) is failed, stop anythign you got here
    const interval = setInterval(async () => {
      try {
        const [profileRes] = await Promise.all([
          fetch(`/api/companyProfile?id=${email.id}`),
        ]);

        const profileData = await profileRes.json();

        setCompanyProfile(profileData);

        if (profileData) {
          clearInterval(interval);
          console.log("Polling stopped");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [email.id]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [rawDataRes] = await Promise.all([
          fetch(`/api/rawData?id=${email.id}`),
        ]);

        const rawDataResult = await rawDataRes.json();

        setRawData(rawDataResult);

        if (rawDataResult === "failed") {
          // Start of Selection
          clearInterval(interval);
          console.log("Polling stopped");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [email.id]);

  useEffect(() => {
    setCompanyProfile(null);
    setRawData(null);
  }, [email.id]);

  return (
    <div className="max-w-2xl mx-auto overflow-hidden">
      <p className="text-md text-gray-900 my-4">{email.body}</p>
      <p className="text-md text-gray-900 my-4">
        Company profile:
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {companyProfile
            ? JSON.stringify(companyProfile, null, 2)
            : " processing..."}
        </pre>
      </p>

      <Form method="post" className="flex gap-2 items-center">
        <Input type="text" name="prompt" className="w-full " />
        <Button name="action" value="process" type="submit">
          Query
        </Button>
        <input type="hidden" name="id" value={email.id} />
        {/* <Button name="action" value="parse" type="submit">
          Parse
        </Button> */}
        <input type="hidden" name="id" value={email.id} />
      </Form>
      {actionData?.response && (
        <pre>{JSON.stringify(actionData.response, null, 2)}</pre>
      )}
      <p className="text-md text-gray-900 my-4">
        Extracted Raw data:
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {rawData
            ? Object.keys(rawData).map((key) => (
                <div key={key}>
                  {key}: {rawData[key]}
                </div>
              ))
            : " processing..."}
        </pre>
      </p>
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
