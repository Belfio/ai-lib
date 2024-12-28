import { LoginForm } from "@/components/LoginForm";
import { UserContext } from "@/providers/userContext";
import { isAuthenticated, loginAction } from "@/server/auth/auth.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm error={error} />
        </div>
      </div>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("logging in please");
  return await loginAction(request, "/dashboard");
}

export async function loader({ request }: LoaderFunctionArgs) {
  await isAuthenticated(request);
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  return { error: messages[error as keyof typeof messages] };
}
