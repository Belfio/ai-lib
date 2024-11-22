import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import db from "@/lib/db";
import { useLoaderData } from "@remix-run/react";

export default function Selected() {
  const { email } = useLoaderData<typeof loader>();
  return (
    <div className="max-w-xl mx-auto overflow-hidden">
      <pre>{JSON.stringify(email, null, 2)}</pre>
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
