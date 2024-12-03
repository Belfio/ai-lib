import db from "@/lib/db";
import { JobStatus } from "@/lib/types";
import { LoaderFunctionArgs, json } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  console.log("id", id);
  const job = await db.job.queryFromEmailId(id as string);
  console.log("job", job);
  if (!job?.[0]?.status === JobStatus.FAILED) {
    return { status: "failed" };
  }
  if (!job?.[0]?.rawData) {
    return json({ status: "failed" });
  }
  return json(job?.[0]?.rawData);
};
