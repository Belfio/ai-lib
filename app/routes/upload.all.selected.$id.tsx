import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import db from "@/lib/db";
import {
  Form,
  json,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { parseCompany } from "@/server/parseCompany.server";
import { useEffect, useRef, useState } from "react";
import { CompanyProfile, CompanyRawData } from "@/lib/typesCompany";
import { queryCompany } from "@/server/queryCompany.server";

export default function Selected() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const loaderData = useLoaderData<typeof loader>();
  const email = loaderData.email;
  const actionData = useActionData();
  const [response, setResponse] = useState(() => {
    if (actionData?.response) {
      return actionData.response;
    }
    return "";
  });
  const res = actionData?.response;
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    loaderData.companyProfile
  );
  const [rawData, setRawData] = useState<CompanyRawData | null>(
    loaderData.rawData || null
  );

  useEffect(() => {
    if (loaderData.job?.[0]?.status === "completed") {
      return;
    }
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
  }, [email.id, companyProfile, loaderData.job]);

  useEffect(() => {
    if (loaderData.job?.[0]?.status === "completed") {
      const rawDataResult = loaderData.rawData;
      if (rawDataResult) {
        setRawData(rawDataResult);
      }

      return;
    }
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
  }, [email.id, loaderData.job, loaderData.rawData]);

  console.log("response", actionData);
  console.log("response", response);
  console.log("response", res);

  return (
    <div className="max-w-2xl mx-auto overflow-hidden">
      <div className="text-md text-gray-900 my-4">{email.body}</div>

      <div className="text-md text-gray-900 my-4">
        <div className="font-medium mb-2">Company profile:</div>
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {companyProfile
            ? JSON.stringify(companyProfile, null, 2)
            : "processing..."}
        </pre>
      </div>

      <Form method="post" className="flex gap-2 items-center">
        <Input type="text" name="prompt" className="w-full" />
        <Button
          name="action"
          value="process"
          type="submit"
          disabled={isSubmitting}
        >
          Query
        </Button>
        <input type="hidden" name="id" value={email.id} />
      </Form>

      {isSubmitting && (
        <div className="mt-4">
          <pre>Asking PrimoAI...</pre>
        </div>
      )}

      {response && (
        <div className="mt-4">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      {res && (
        <div className="mt-4">
          <pre>{JSON.stringify(res, null, 2)}</pre>
        </div>
      )}

      <div className="text-md text-gray-900 my-4">
        <div className="font-medium mb-2">Extracted Raw data:</div>
        {rawData ? (
          <div className="whitespace-pre-wrap text-sm text-gray-700">
            {Object.entries(rawData).map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">processing...</div>
        )}
      </div>
    </div>
  );
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  console.log("params", params);
  const id = params.id;
  if (!id) {
    return redirect("/error");
  }
  console.log("id", id);
  const job = await db.job.get(id);
  console.log("job", job);
  const email = await db.email.get(job?.emailId as string);
  console.log("email", email);
  const companyProfile = await db.companyProfile.get(email.id);
  console.log("companyProfile", companyProfile);
  const rawData = job?.[0]?.rawData;
  return { email, companyProfile, job, rawData };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = formData.get("action");
  const id = formData.get("id");
  if (action === "process") {
    if (!id) {
      return redirect("/error");
    }
    console.log("action", action);
    const prompt = formData.get("prompt") as string;
    const response = await queryCompany(id as string, prompt);
    console.log("response ? response : 'error'", response ? response : "error");
    return { response: response ? response : "error" };
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
