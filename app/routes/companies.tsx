import db from "@/lib/db";
import { CompanyProfile } from "@/lib/typesCompany";
import { isAuthenticated } from "@/server/auth/auth.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Companies() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="justify-start items-center w-full h-full p-6 flex flex-col gap-6 md:min-w-[800px] md:max-w-[1024px]">
      <h1 className="text-4xl font-bold items-end pt-12">Companies</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-right">Country</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data &&
            data.companies.map((company: CompanyProfile) => (
              <TableRow key={company.profileId}>
                <TableCell className="font-medium">
                  {company.basicInfo.companyName}
                </TableCell>
                <TableCell>
                  {company.basicInfo.industry.primarySector}
                </TableCell>
                <TableCell>{company.basicInfo?.stage}</TableCell>
                <TableCell className="text-right">
                  {company.basicInfo?.headquarters.country}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await isAuthenticated(request);
  if (!user) {
    console.log("redirecting to login");
    return redirect("/login");
  }
  console.log("user", user);
  const companies = await db.companyProfile.getAll(user.companyId);
  console.log("companies", companies);
  return Response.json({ companies });
}
