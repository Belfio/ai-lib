import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import db from "@/lib/db";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "@/components/ui/button";
export default function Success() {
  const { email } = useLoaderData<typeof loader>();
  return (
    <div>
      <pre>{JSON.stringify(email, null, 2)}</pre>
      <Link to="/upload/all">
        <Button>Go back</Button>
      </Link>
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
