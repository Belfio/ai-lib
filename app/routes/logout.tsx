import { logoutAction } from "@/server/auth/auth.server";
import { LoaderFunctionArgs } from "@remix-run/node";
export default function Logout() {
  return <div>Logout</div>;
}

// export async function loader({ request }: LoaderFunctionArgs) {
//   await logoutAction(request);
//   return "";
// }

export async function loader({ request }: LoaderFunctionArgs) {
  return await logoutAction(request, {
    redirectTo: "/login",
    headers: request.headers,
  });
}
