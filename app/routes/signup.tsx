import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticator } from "@/server/auth/auth.server";
import { commitSession, getSession } from "@/server/auth/session.server";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

export default function Signup() {
  return (
    <Form method="post">
      <h1>Signup</h1>
      <Input type="email" name="email" placeholder="Email" />
      <Input type="password" name="password" placeholder="Password" />
      <Input type="text" name="company" placeholder="Company Name" />
      <Input type="text" name="name" placeholder="Name" />
      <Input type="text" name="surname" placeholder="Surname" />
      <Input type="hidden" name="register" value="true" />
      <Button type="submit">Register</Button>
    </Form>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  // we call the method with the name of the strategy we want to use and the
  // request object
  console.log("signing up");
  const user = await authenticator.authenticate("register", request);

  const session = await getSession(request.headers.get("cookie"));
  session.set("user", user);

  throw redirect("/dashboard", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}
