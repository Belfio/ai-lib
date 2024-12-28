import db from "@/lib/db";
import { CompanyProfile } from "@/lib/typesCompany";
import { isAuthenticated } from "@/server/auth/auth.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export default function Companies() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Companies</h1>
      <ul>
        {data &&
          data.companies.map((company: CompanyProfile) => (
            <li key={company.profileId}>{company.basicInfo.companyName}</li>
          ))}
      </ul>
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  const companies = await db.companyProfile.getAll(user.companyId);
  return Response.json({ companies });
}
