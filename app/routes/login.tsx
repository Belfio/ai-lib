import { UserContext } from "@/providers/userContext";
import { isAuthenticated, loginAction } from "@/server/auth/auth.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useContext, useEffect } from "react";

const messages = {
  nouser: "Invalid email or password",
  default: "An error occurred",
};

export default function Login() {
  const { setUser } = useContext(UserContext);
  useEffect(() => {
    setUser(null);
  }, [setUser]);
  const { error } = useLoaderData<typeof loader>();
  return (
    <>
      <Form method="post">
        <input type="email" name="email" />
        <input type="password" name="password" />
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
      </Form>
      <Link to="/signup">Signup</Link>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await loginAction(request);
  if (user) {
    return redirect("/dashboard");
  }
  return { error: messages.default };
}

export async function loader({ request }: LoaderFunctionArgs) {
  await isAuthenticated(request);
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  return { error: messages[error as keyof typeof messages] };
}
