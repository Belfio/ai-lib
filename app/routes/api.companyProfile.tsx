import db from "@/lib/db";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  console.log("id", id);
  const companyProfile = await db.companyProfile.get(id as string);
  console.log("companyProfile", companyProfile);
  return json(companyProfile);
};
