import { UserContext } from "@/providers/userContext";
import { logoutAction } from "@/server/auth/auth.server";
import { useEffect } from "react";
import { redirect, LoaderFunctionArgs } from "@remix-run/node";
import { useContext } from "react";

export default function Logout() {
  const { setUser } = useContext(UserContext);
  useEffect(() => {
    setUser(null);
  }, [setUser]);
  return <div>Logout</div>;
}

export async function loader({ request }: LoaderFunctionArgs) {
  await logoutAction(request);
  return redirect("/login");
}
